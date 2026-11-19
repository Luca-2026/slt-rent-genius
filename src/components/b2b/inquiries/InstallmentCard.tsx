import { useEffect, useMemo, useState } from "react";
import { PdfPagesPreview } from "@/components/b2b/PdfPagesPreview";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { matchesDocumentPreview } from "../../../../supabase/functions/_shared/invoice-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, Eye, FileCheck2, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatEuro, VAT_RATE } from "./offerMath";
import {
  billedInstallmentNet, installmentDeductions, installmentPeriod, isInstallmentDue,
  monthlyNetFromOffer, sumDeductions, validateInstallment, type InstallmentInvoiceRow,
} from "@/lib/installments";
import { isoDay } from "@/lib/dashboardMetrics";
import { buildInstallmentPositions, offeredInstallmentPositions } from "../../../../supabase/functions/_shared/installment-positions";

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
  const [interval, setInterval] = useState<string>(inquiry.installment_interval_days === 28 || (!inquiry.installment_enabled && offerPayload?.items?.some(item => item.price_basis === "week")) ? "28d" : String(inquiry.installment_interval_months ?? 1));
  const [nextDue, setNextDue] = useState<string>(inquiry.installment_next_due ?? today);
  const [savingPlan, setSavingPlan] = useState(false);

  // Dialog
  const [open, setOpen] = useState(false);
  const [quantities, setQuantities] = useState<string[]>([]);
  const offeredPositions = useMemo(() => {
    try { return offeredInstallmentPositions(offerPayload); } catch { return []; }
  }, [offerPayload]);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [terms, setTerms] = useState(inquiry.customer_kind === "business" ? "net_14" : "vorkasse");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewedKey, setPreviewedKey] = useState<string | null>(null);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

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
      ...(inquiryType === "rental" ? { installment_interval_days: interval === "28d" ? 28 : null } : {}),
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
    const p = installmentPeriod(start, Number(inquiry.installment_interval_months) || 1, inquiry.installment_interval_days === 28 ? 28 : interval === "28d" ? 28 : null);
    setPeriodStart(p.start);
    setPeriodEnd(p.end);
    setQuantities(offeredPositions.map(position => String(position.quantity)));
    const agreedTerms = (inquiry.offer_payload as { payment_terms?: string } | null)?.payment_terms;
    setTerms(inquiry.customer_kind === "business" && PAYMENT_OPTIONS.some(option => option.value === agreedTerms) ? agreedTerms as string : "vorkasse");
    setNotes("");
    setPreviewedKey(null);
    setPreviewUrl(null);
    setOpen(true);
  };

  const decisions = quantities.map((quantity, index) => ({ index, quantity: quantity.trim() ? Number(quantity.replace(",", ".")) : NaN }));
  let calculation: ReturnType<typeof buildInstallmentPositions> | undefined;
  let positionProblem: string | null = null;
  try { calculation = buildInstallmentPositions(offerPayload, decisions); }
  catch (error) { positionProblem = error instanceof Error ? error.message : "Bitte Positionsmengen prüfen."; }
  const net = calculation?.totals.netAmount ?? 0;
  const vat = calculation?.totals.vatAmount ?? 0;
  const problem = positionProblem || validateInstallment(net, { openEnded, orderNet, alreadyBilledNet: billedNet });

  const buildBody = () => ({
        invoice_kind: "installment",
        inquiry_type: inquiryType,
        inquiry_id: inquiry.id,
        location: inquiry.location,
        installment_net: net,
        installment_positions: decisions,
        installment_offer_updated_at: inquiry.updated_at,
        service_period_start: periodStart || null,
        service_period_end: periodEnd || null,
        payment_terms: terms,
        notes,
        staff_name: staffName,
  });
  const previewOk = matchesDocumentPreview(previewedKey, buildBody());
  const preview = async () => {
    if (problem || previewing || sending) return;
    const body = buildBody();
    setPreviewing(true);
    const { data, error } = await invokeWithAuth("send-inquiry-invoice", { ...body, preview: true });
    setPreviewing(false);
    if (error || !data?.pdf_base64) {
      toast({ title: "Vorschau nicht möglich", description: data?.error || error?.message, variant: "destructive" });
      return;
    }
    const bytes = Uint8Array.from(atob(data.pdf_base64), (c) => c.charCodeAt(0));
    setPreviewUrl(URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })));
    setPreviewedKey(JSON.stringify(body));
  };
  const send = async () => {
    if (problem || sending || !previewOk) return;
    setSending(true);
    const { data, error } = await invokeWithAuth("send-inquiry-invoice", buildBody());
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
          {openEnded && <span className="rounded bg-muted px-2 py-0.5 text-xs font-normal">Unbefristete Miete</span>}
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
                      {inquiryType === "rental" && <SelectItem value="28d">Alle 4 Wochen</SelectItem>}
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
        <DialogContent className="max-w-3xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Abschlagsrechnung erstellen</DialogTitle>
            <DialogDescription>
              Zu Angebot {inquiry.offer_number}. Die Rechnungsnummer wird beim Versand vergeben, das PDF geht per E-Mail an den Kunden.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="divide-y divide-border">
              {offeredPositions.map((position, index) => (
                <div key={index} className="py-3 space-y-2">
                  <div className="font-medium break-words">{index + 1}. {position.product_name}</div>
                  {position.description && <p className="text-xs text-muted-foreground break-words">{position.description}</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                    <div><Label htmlFor={`installment-quantity-${index}`} className="text-xs">Menge ({position.unit || "Stück"})</Label>
                      <Input id={`installment-quantity-${index}`} aria-label={`Menge ${position.product_name}`} inputMode="decimal" value={quantities[index] ?? ""} onChange={(e) => setQuantities(current => current.map((value, i) => i === index ? e.target.value : value))} />
                    </div>
                    <div className="text-xs"><span className="text-muted-foreground">Einzelpreis netto</span><div>{formatEuro(position.unit_price)}{position.discount_percent > 0 && <span className="block text-muted-foreground">− {position.discount_percent} % Rabatt</span>}</div></div>
                    <div className="text-sm sm:text-right"><span className="text-xs text-muted-foreground">Gesamt netto</span><div>{formatEuro(r2((decisions[index]?.quantity || 0) * position.unit_price * (1 - position.discount_percent / 100)))}</div></div>
                  </div>
                </div>
              ))}
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
                  {PAYMENT_OPTIONS.filter((o) => inquiry.customer_kind === "business" || o.value === "vorkasse").map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
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
            {problem && <p className="text-xs text-destructive" role="alert">{problem}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
            <Button variant="outline" onClick={preview} disabled={!!problem || previewing || sending}><Eye className="mr-2 h-4 w-4" />{previewing ? "Vorschau wird erstellt …" : "PDF-Vorschau anzeigen"}</Button>
            <Button onClick={send} disabled={!!problem || sending || !previewOk}>{sending ? "Wird gesendet …" : "Final erstellen und senden"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!previewUrl} onOpenChange={(v) => { if (!v) setPreviewUrl(null); }}>
        <DialogContent className="flex h-[90vh] w-[calc(100vw-1rem)] max-w-4xl flex-col">
          <DialogHeader><DialogTitle>Abschlagsrechnung – Vorschau</DialogTitle><DialogDescription>Entwurf ohne Rechnungsnummer. Nichts wurde ausgestellt oder versendet.</DialogDescription></DialogHeader>
          {previewUrl && <PdfPagesPreview url={previewUrl} className="min-h-0 flex-1 overflow-y-auto" />}
          <DialogFooter><Button variant="outline" onClick={() => setPreviewUrl(null)}>Zurück zum Bearbeiten</Button><Button disabled={!previewOk || sending} onClick={() => { setPreviewUrl(null); void send(); }}>Final erstellen und senden</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
