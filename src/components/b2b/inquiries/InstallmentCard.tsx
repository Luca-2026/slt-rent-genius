import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, FileCheck2, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatEuro, VAT_RATE } from "./offerMath";
import {
  billedInstallmentNet, installmentDeductions, installmentPeriod, isInstallmentDue,
  monthlyNetFromOffer, percentOf, sumDeductions, validateInstallment, type InstallmentInvoiceRow,
} from "@/lib/installments";
import { isoDay } from "@/lib/dashboardMetrics";

const PAYMENT_OPTIONS = [
  { value: "net_14", label: "Zahlbar innerhalb von 14 Tagen" },
  { value: "net_7", label: "Zahlbar innerhalb von 7 Tagen" },
  { value: "net_30", label: "Zahlbar innerhalb von 30 Tagen" },
  { value: "vorkasse", label: "Sofort fällig ohne Abzug" },
];

interface Props {
  table: "rental_inquiries" | "sales_inquiries";
  inquiryType: "rental" | "sales";
  inquiry: Record<string, any>;
  invoices: (InstallmentInvoiceRow & { id: string; file_url: string | null })[];
  staffName: string;
  onChanged: () => void;
  onFinalInvoice: () => void;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Abschlagsplan, Abschlagsrechnungen und Weg zur Schlussrechnung eines Auftrags. */
export function InstallmentCard({ table, inquiryType, inquiry, invoices, staffName, onChanged, onFinalInvoice }: Props) {
  const { toast } = useToast();
  const today = isoDay(new Date());
  const isOrder = inquiry.status === "accepted" || inquiry.status === "done" || !!inquiry.order_confirmed_at;
  const offerPayload = inquiry.offer_payload as { items?: Array<Record<string, unknown>>; totals?: { netAmount?: number } } | null;
  const orderNet = Number(offerPayload?.totals?.netAmount) || null;
  const openEnded = !!inquiry.installment_open_ended;
  const suggestion = Number(inquiry.installment_amount_net) || monthlyNetFromOffer(offerPayload?.items) || 0;

  const installments = invoices.filter((i) => i.invoice_kind === "installment");
  const hasFinal = invoices.some((i) => i.invoice_kind === "final" && i.status !== "cancelled");
  const deductions = useMemo(() => sumDeductions(installmentDeductions(invoices)), [invoices]);
  const billedNet = billedInstallmentNet(invoices);

  // Plan
  const [enabled, setEnabled] = useState<boolean>(!!inquiry.installment_enabled);
  const [amount, setAmount] = useState<string>(suggestion ? String(suggestion) : "");
  const [interval, setInterval] = useState<string>(String(inquiry.installment_interval_months ?? 1));
  const [nextDue, setNextDue] = useState<string>(inquiry.installment_next_due ?? today);
  const [savingPlan, setSavingPlan] = useState(false);

  // Dialog
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"amount" | "percent">("amount");
  const [value, setValue] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [terms, setTerms] = useState(inquiry.customer_kind === "business" ? "net_14" : "vorkasse");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);

  if (!inquiry.offer_number) return null;

  const due = isInstallmentDue({ id: inquiry.id, installment_enabled: inquiry.installment_enabled, installment_next_due: inquiry.installment_next_due, status: inquiry.status }, today);

  const savePlan = async () => {
    const net = Number(amount.replace(",", "."));
    if (enabled && !(net > 0)) {
      toast({ title: "Betrag fehlt", description: "Bitte einen Abschlagsbetrag (netto) eintragen.", variant: "destructive" });
      return;
    }
    if (enabled && !nextDue) {
      toast({ title: "Fälligkeit fehlt", description: "Bitte das Datum der nächsten Abschlagsrechnung wählen.", variant: "destructive" });
      return;
    }
    setSavingPlan(true);
    const { error } = await supabase.from(table).update({
      installment_enabled: enabled,
      installment_amount_net: net > 0 ? r2(net) : null,
      installment_interval_months: Number(interval) || 1,
      installment_next_due: enabled ? nextDue : null,
      installment_reminded_on: null,
    } as never).eq("id", inquiry.id);
    setSavingPlan(false);
    if (error) {
      toast({ title: "Abschlagsplan nicht gespeichert", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: enabled ? "Abschlagsplan gespeichert" : "Abschlagsplan beendet" });
    onChanged();
  };

  const openDialog = () => {
    const start = inquiry.installment_next_due && inquiry.installment_enabled ? inquiry.installment_next_due : today;
    const p = installmentPeriod(start, Number(inquiry.installment_interval_months) || 1);
    setPeriodStart(p.start);
    setPeriodEnd(p.end);
    setMode("amount");
    setValue(suggestion ? String(suggestion) : "");
    setNotes("");
    setOpen(true);
  };

  const parsed = Number(value.replace(",", ".")) || 0;
  const net = mode === "percent" ? percentOf(orderNet ?? 0, parsed) : r2(parsed);
  const vat = r2(net * VAT_RATE / 100);
  const problem = validateInstallment(net, { openEnded, orderNet, alreadyBilledNet: billedNet });

  const send = async () => {
    if (problem || sending) return;
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-inquiry-invoice", {
      body: {
        invoice_kind: "installment",
        inquiry_type: inquiryType,
        inquiry_id: inquiry.id,
        location: inquiry.location,
        installment_net: net,
        service_period_start: periodStart || null,
        service_period_end: periodEnd || null,
        payment_terms: terms,
        notes,
        staff_name: staffName,
      },
    });
    setSending(false);
    const err = (data as { error?: string } | null)?.error || error?.message;
    if (err) {
      toast({ title: "Abschlagsrechnung nicht erstellt", description: err, variant: "destructive" });
      return;
    }
    const d = data as { invoice_number?: string; email_sent?: boolean };
    toast({
      title: `Abschlagsrechnung ${d.invoice_number ?? ""} erstellt`,
      description: d.email_sent ? "Per E-Mail an den Kunden gesendet." : "Erstellt, aber die E-Mail ging nicht raus – bitte erneut senden.",
    });
    setOpen(false);
    onChanged();
  };

  return (
    <div className="rounded-lg border border-border p-3 text-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold flex items-center gap-2">
          <CalendarClock className="h-4 w-4" /> Abschlagsrechnungen
          {openEnded && <span className="rounded bg-muted px-2 py-0.5 text-xs font-normal">Unbefristete Monatsmiete</span>}
        </div>
        {due && <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">Abschlag fällig</span>}
      </div>

      {!isOrder ? (
        <p className="text-xs text-muted-foreground">Abschlagsrechnungen sind möglich, sobald das Angebot angenommen ist.</p>
      ) : hasFinal ? (
        <p className="text-xs text-muted-foreground">Die Schlussrechnung ist gestellt – weitere Abschläge sind nicht mehr möglich.</p>
      ) : (
        <>
          <div className="space-y-2 rounded-md bg-muted/40 p-3">
            <label className="flex items-center gap-2">
              <Switch checked={enabled} onCheckedChange={setEnabled} />
              <span>Regelmäßige Abschläge mit Erinnerung</span>
            </label>
            {enabled && (
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <Label className="text-xs">Betrag netto je Abschlag</Label>
                  <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Rhythmus</Label>
                  <Select value={interval} onValueChange={setInterval}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Monatlich</SelectItem>
                      <SelectItem value="2">Alle 2 Monate</SelectItem>
                      <SelectItem value="3">Vierteljährlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Nächste Abschlagsrechnung am</Label>
                  <Input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
                </div>
              </div>
            )}
            <Button size="sm" variant="outline" onClick={savePlan} disabled={savingPlan}>
              {savingPlan ? "Speichert …" : "Plan speichern"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Fällige Abschläge erscheinen auf der Startseite; der Standort bekommt morgens eine Erinnerungs-E-Mail.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={openDialog}>
              <Receipt className="h-3.5 w-3.5 mr-1" /> Abschlagsrechnung erstellen
            </Button>
            <Button size="sm" variant="outline" onClick={onFinalInvoice}>
              <FileCheck2 className="h-3.5 w-3.5 mr-1" /> Schlussrechnung erstellen
            </Button>
          </div>
        </>
      )}

      {installments.length > 0 && (
        <div className="space-y-1">
          {installments.map((inv) => (
            <div key={inv.id} className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium">{inv.installment_number ? `${inv.installment_number}. Abschlag` : "Abschlag"} {inv.invoice_number}</span>
              <span className="text-muted-foreground">
                {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString("de-DE") : "—"} · {formatEuro(Number(inv.gross_amount) || 0)} brutto
              </span>
              <span className="text-muted-foreground">
                {inv.status === "paid" ? "bezahlt" : inv.status === "cancelled" ? "storniert" : inv.status === "overdue" ? "überfällig" : "offen"}
              </span>
              {inv.file_url && <a href={inv.file_url} target="_blank" rel="noreferrer" className="text-primary underline">PDF</a>}
            </div>
          ))}
          <div className="text-xs text-muted-foreground pt-1">
            In der Schlussrechnung abzuziehen: {formatEuro(deductions.net)} netto ({formatEuro(deductions.gross)} brutto)
            {!openEnded && orderNet ? ` · Auftragswert ${formatEuro(orderNet)} netto` : ""}
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Abschlagsrechnung erstellen</DialogTitle>
            <DialogDescription>
              Zu Angebot {inquiry.offer_number}. Die Rechnungsnummer wird beim Versand vergeben, das PDF geht per E-Mail an den Kunden.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button size="sm" type="button" variant={mode === "amount" ? "default" : "outline"} onClick={() => setMode("amount")}>Betrag</Button>
              <Button size="sm" type="button" variant={mode === "percent" ? "default" : "outline"} disabled={!orderNet} onClick={() => setMode("percent")}>
                Prozent vom Auftrag
              </Button>
            </div>
            <div>
              <Label className="text-xs">{mode === "percent" ? "Prozent des Auftragswerts (netto)" : "Betrag netto"}</Label>
              <Input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Leistungszeitraum von</Label>
                <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">bis</Label>
                <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Zahlungsbedingung</Label>
              <Select value={terms} onValueChange={setTerms}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Anmerkung (optional, erscheint auf der Rechnung)</Label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <div className="flex justify-between"><span>Netto</span><span>{formatEuro(net)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>USt. {VAT_RATE} %</span><span>{formatEuro(vat)}</span></div>
              <div className="flex justify-between font-semibold"><span>Brutto</span><span>{formatEuro(r2(net + vat))}</span></div>
            </div>
            {problem && value && <p className="text-xs text-destructive">{problem}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
            <Button onClick={send} disabled={!!problem || sending}>{sending ? "Wird gesendet …" : "Erstellen und senden"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
