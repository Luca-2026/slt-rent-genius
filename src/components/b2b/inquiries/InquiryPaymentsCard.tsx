import { NumberInput } from "@/components/ui/number-input";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, BellRing, Loader2, Plus, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatEuro } from "./offerMath";
import { isStripePayment, shortPaymentReference } from "@/lib/paymentPresentation";

/** Erfasste (Teil-)Zahlung zu einer Anfrage. */
export interface InquiryPayment {
  date?: string;
  amount: number;
  label?: string;
  reference?: string;
  provider?: string;
  /** Vom Server gestempelt – wer/wann erfasst (nicht vom Browser setzbar). */
  recorded_at?: string;
  recorded_by?: string;
  recorded_by_id?: string | null;
  /** Nur lokal: neu erfasst, noch nicht gespeichert – nur diese Zeilen sind editierbar. */
  _draft?: boolean;
}

/** Feste Zahlungswege, damit klar ist, wie das Geld kam. */
export const PAYMENT_METHODS = ["Banküberweisung", "Barzahlung", "EC-/Kartenzahlung", "PayPal", "Verrechnung"] as const;

interface PaymentEvent {
  id: string;
  action: "added" | "removed";
  amount: number;
  payment_date: string | null;
  method: string | null;
  reference: string | null;
  actor_email: string | null;
  created_at: string;
}

const fmtDateTime = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" }) : "");

/** Zahlungen aus einem unbekannten JSON-Wert robust lesen. */
export function parseInquiryPayments(raw: unknown): InquiryPayment[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => {
      const o = (p ?? {}) as Record<string, unknown>;
      return {
        date: typeof o.date === "string" ? o.date : undefined,
        amount: Math.round((Number(o.amount) || 0) * 100) / 100,
        label: typeof o.label === "string" ? o.label : undefined,
        reference: typeof o.reference === "string" ? o.reference : undefined,
        provider: typeof o.provider === "string" ? o.provider : undefined,
        recorded_at: typeof o.recorded_at === "string" ? o.recorded_at : undefined,
        recorded_by: typeof o.recorded_by === "string" ? o.recorded_by : undefined,
        recorded_by_id: typeof o.recorded_by_id === "string" ? o.recorded_by_id : null,
      };
    })
    .filter((p) => p.amount > 0);
}

interface Props {
  table: "rental_inquiries" | "sales_inquiries";
  inquiryId: string;
  payments: unknown;
  /** Angebotssumme brutto – zur Anzeige des offenen Betrags. */
  offerTotalGross?: number | null;
  /** Kaution laut Angebot – wird mit überwiesen und zählt zum offenen Betrag. */
  deposit?: number | null;
  disabled?: boolean;
  /** Versendetes Angebot – Voraussetzung für die manuelle Zahlungserinnerung. */
  offerNumber?: string | null;
  customerEmail?: string | null;
  lastReminderAt?: string | null;
  onChanged: () => void;
}

/**
 * Zahlungseingänge zu einer Anfrage erfassen – schon bevor die Rechnung erstellt wird
 * (z. B. Vorkasse auf das Angebot). Die Rechnung übernimmt diese Zahlungen später.
 */
export function InquiryPaymentsCard({ table, inquiryId, payments, offerTotalGross, deposit, disabled, offerNumber, customerEmail, lastReminderAt, onChanged }: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<InquiryPayment[]>(() => parseInquiryPayments(payments));
  const [saving, setSaving] = useState(false);
  const [confirmReminder, setConfirmReminder] = useState(false);
  const [reminding, setReminding] = useState(false);

  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    setRows(parseInquiryPayments(payments));
  }, [inquiryId, payments]);

  useEffect(() => {
    let alive = true;
    supabase
      .from("inquiry_payment_events")
      .select("id, action, amount, payment_date, method, reference, actor_email, created_at")
      .eq("inquiry_id", inquiryId)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (alive) setEvents((data ?? []) as PaymentEvent[]); });
    return () => { alive = false; };
  }, [inquiryId, payments]);

  const total = useMemo(
    () => Math.round(rows.reduce((s, p) => s + (Number(p.amount) || 0), 0) * 100) / 100,
    [rows],
  );
  const required = offerTotalGross != null ? Math.round((Number(offerTotalGross) + (Number(deposit) || 0)) * 100) / 100 : null;
  const open = required != null ? Math.round((required - total) * 100) / 100 : null;
  const saved = useMemo(() => JSON.stringify(parseInquiryPayments(payments)), [payments]);
  const dirty = JSON.stringify(parseInquiryPayments(rows)) !== saved;

  const patch = (index: number, values: Partial<InquiryPayment>) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...values } : row)));

  const add = () =>
    setRows((prev) => [
      ...prev,
      {
        date: new Date().toISOString().slice(0, 10),
        amount: open && open > 0 ? open : 0,
        label: "Banküberweisung",
        reference: "",
        _draft: true,
      },
    ]);

  const save = async () => {
    const clean = rows
      .map((p) => ({
        date: p.date || new Date().toISOString().slice(0, 10),
        amount: Math.round((Number(p.amount) || 0) * 100) / 100,
        label: (p.label || "").trim() || "Zahlungseingang",
        reference: (p.reference || "").trim(),
        ...(p.provider ? { provider: p.provider } : {}),
        ...(p.recorded_at ? { recorded_at: p.recorded_at, recorded_by: p.recorded_by, recorded_by_id: p.recorded_by_id ?? null } : {}),
      }))
      .filter((p) => p.amount > 0);
    const paidAmount = Math.round(clean.reduce((s, p) => s + p.amount, 0) * 100) / 100;
    setSaving(true);
    const { error } = await supabase
      .from(table)
      .update({ payments: clean, paid_amount: paidAmount } as never)
      .eq("id", inquiryId);
    setSaving(false);
    if (error) {
      toast({ title: "Zahlungen konnten nicht gespeichert werden", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Zahlungen gespeichert", description: `Erhalten: ${formatEuro(paidAmount)}` });
    onChanged();
  };

  const sendReminder = async () => {
    setReminding(true);
    const { data, error } = await supabase.functions.invoke("payment-reminder", { body: { manual: { table, inquiry_id: inquiryId } } });
    setReminding(false);
    setConfirmReminder(false);
    const msg = (data as { error?: string } | null)?.error;
    if (error || msg) {
      let detail = msg;
      try { detail = detail ?? (await (error as { context?: Response })?.context?.json())?.error; } catch { /* ignore */ }
      toast({ title: "Zahlungserinnerung nicht gesendet", description: detail ?? "Bitte später erneut versuchen.", variant: "destructive" });
      return;
    }
    toast({ title: "Zahlungserinnerung gesendet", description: `An ${customerEmail}` });
    onChanged();
  };
  const canRemind = !!offerNumber && !!customerEmail && open != null && open > 0 && !dirty;

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border p-3 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Banknote className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">Zahlungseingänge</span>
        <span className="text-xs text-muted-foreground">
          Vorkasse und Teilzahlungen hier erfassen – die Rechnung übernimmt sie automatisch.
        </span>
      </div>

      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground">Noch keine Zahlung erfasst.</p>
      )}

      {rows.map((row, index) => (
        isStripePayment(row) ? (
          <div key={index} className="min-w-0 border-b border-border pb-3 space-y-1 text-sm">
            <div className="flex flex-wrap justify-between gap-2"><span className="font-medium">Online-Zahlung (Stripe)</span><strong>{formatEuro(row.amount)}</strong></div>
            <p className="text-xs text-muted-foreground">{row.date} · Bestätigt · automatisch über Stripe gebucht</p>
            <p className="break-all text-xs text-muted-foreground" title={row.reference}>{shortPaymentReference(row.reference)}</p>
          </div>
        ) : !row._draft ? (
          <div key={index} className="flex min-w-0 items-start justify-between gap-2 border-b border-border pb-3 text-sm">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-x-2"><span className="font-medium">{row.label || "Zahlungseingang"}</span><span className="text-muted-foreground">{row.date ? new Date(row.date).toLocaleDateString("de-DE") : ""}</span></div>
              {row.reference && <p className="break-all text-xs text-muted-foreground">{row.reference}</p>}
              <p className="text-[11px] text-muted-foreground">{row.recorded_at ? `Erfasst von ${row.recorded_by || "unbekannt"} am ${fmtDateTime(row.recorded_at)}` : "Gebucht"}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <strong>{formatEuro(row.amount)}</strong>
              <Button size="icon" variant="ghost" onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))} aria-label="Zahlung entfernen" disabled={disabled || saving}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : <div key={index} className="grid min-w-0 grid-cols-1 gap-2 border-b border-border pb-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
          <div className="min-w-0">
            <Label className="text-[11px]">Datum</Label>
            <Input className="block h-10 min-w-0 w-full max-w-full appearance-none text-left [&::-webkit-date-and-time-value]:min-w-0 [&::-webkit-date-and-time-value]:text-left" type="date" disabled={disabled || saving} value={row.date ?? ""} onChange={(e) => patch(index, { date: e.target.value })} />
          </div>
          <div className="min-w-0">
            <Label className="text-[11px]">Betrag (€)</Label>
            <NumberInput
              type="number"
              step="0.01"
              min="0"
              value={row.amount}
              disabled={disabled || saving}
              onChange={(e) => patch(index, { amount: Number(e.target.value) })}
            />
          </div>
          <div className="col-span-full min-w-0">
            <Label className="text-[11px]">Zahlungsweg</Label>
            <select
              className="flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
              disabled={disabled || saving}
              value={row.label ?? ""}
              onChange={(e) => patch(index, { label: e.target.value })}
            >
              {!row.label && <option value="">Bitte wählen</option>}
              {row.label && !(PAYMENT_METHODS as readonly string[]).includes(row.label) && <option value={row.label}>{row.label}</option>}
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="col-span-full flex min-w-0 items-end gap-1">
            <div className="min-w-0 flex-1">
            <Label className="text-[11px]">Verwendungszweck</Label>
            <Input
              value={row.reference ?? ""}
              disabled={disabled || saving}
              onChange={(e) => patch(index, { reference: e.target.value })}
              placeholder="z. B. Angebotsnummer"
            />
            </div>
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0"
            onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
            aria-label="Zahlung entfernen"
            disabled={disabled || saving}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          </div>
          <p className="col-span-full text-[11px] text-muted-foreground">
            {row.recorded_at
              ? `Erfasst von ${row.recorded_by || "unbekannt"} am ${fmtDateTime(row.recorded_at)}`
              : "Neue Zahlung – wird beim Speichern gebucht"}
          </p>
        </div>
      ))}

      {dirty && (
        <p className="text-xs font-semibold text-destructive">
          Nicht gespeichert – erst nach „Zahlungen speichern“ zählen die Beträge für Auftragsbestätigung und Rechnung.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={add} disabled={disabled || saving}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Zahlung hinzufügen
        </Button>
        <Button size="sm" onClick={save} disabled={disabled || saving || !dirty}>
          Zahlungen speichern
        </Button>
        <span className="min-w-0 basis-full text-sm">
          Erhalten <strong>{formatEuro(total)}</strong>
          {required != null && Number(deposit) > 0 && (
            <span className="ml-2 text-muted-foreground">von {formatEuro(required)} inkl. Kaution</span>
          )}
          {open != null && (
            <span className={open > 0 ? "ml-2 text-destructive font-semibold" : "ml-2 text-primary font-semibold"}>
              {open > 0 ? `offen ${formatEuro(open)}` : "vollständig bezahlt"}
            </span>
          )}
        </span>
      </div>

      <div className="border-t border-border pt-2">
        <button type="button" className="text-xs font-medium text-primary underline underline-offset-2" onClick={() => setShowLog((v) => !v)}>
          {showLog ? "Zahlungsprotokoll ausblenden" : `Zahlungsprotokoll anzeigen (${events.length})`}
        </button>
        {showLog && (
          <ul className="mt-2 space-y-1.5 text-xs">
            {events.length === 0 && <li className="text-muted-foreground">Noch keine protokollierten Änderungen. Protokolliert wird seit 16.10.2026.</li>}
            {events.map((ev) => (
              <li key={ev.id} className="min-w-0 break-words">
                <span className="text-muted-foreground">{fmtDateTime(ev.created_at)}</span>{" · "}
                <strong className={ev.action === "removed" ? "text-destructive" : ""}>{ev.action === "added" ? "erfasst" : "entfernt"}</strong>{" "}
                {formatEuro(Number(ev.amount))} · {ev.method || "ohne Zahlungsweg"}
                {ev.payment_date ? ` · Zahlung vom ${new Date(ev.payment_date).toLocaleDateString("de-DE")}` : ""}
                {" · von "}{ev.actor_email || "System"}
              </li>
            ))}
          </ul>
        )}
      </div>

      {offerNumber && open != null && open > 0 && (
        <div className="space-y-1 border-t border-border pt-3">
          <Button size="sm" variant="outline" className="w-full" disabled={disabled || reminding || !canRemind} onClick={() => setConfirmReminder(true)}>
            <BellRing className="h-3.5 w-3.5 mr-1" /> Zahlungserinnerung senden
          </Button>
          <p className="text-xs text-muted-foreground">
            {lastReminderAt
              ? `Zuletzt manuell erinnert: ${new Date(lastReminderAt).toLocaleString("de-DE")}`
              : "Zusätzlich zur automatischen Erinnerung – ohne Fristsetzung oder Stornohinweis."}
          </p>
        </div>
      )}

      <AlertDialog open={confirmReminder} onOpenChange={setConfirmReminder}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zahlungserinnerung senden?</AlertDialogTitle>
            <AlertDialogDescription>
              {customerEmail} erhält eine freundliche Erinnerung zu Angebot {offerNumber} über offen {open != null ? formatEuro(open) : ""} – mit Bankverbindung und, falls möglich, Zahlungslink.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reminding}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction disabled={reminding} onClick={(e) => { e.preventDefault(); void sendReminder(); }}>
              {reminding && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Senden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
