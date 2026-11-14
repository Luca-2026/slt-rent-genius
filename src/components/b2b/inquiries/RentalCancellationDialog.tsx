import { useEffect, useState } from "react";
import { Ban, Eye, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { useToast } from "@/hooks/use-toast";
import { RentalCreditRefund } from "./RentalCreditRefund";
import { formatEuro } from "./offerMath";
import { supabase } from "@/integrations/supabase/client";

type Snapshot = { reason: string; fee_cents: number; price_basis: string; retained_option_net_cents: number; totals: { grossAmount: number }; invoice_items: unknown[]; paid_cents: number; deposit: number };
type Result = { success?: boolean; error?: string; confirmed?: boolean; expected_updated_at?: string; snapshot?: Snapshot; pdf_base64?: string; invoice_number?: string };

export function RentalCancellationDialog({ inquiryId, business, onChanged }: { inquiryId: string; business: boolean; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("agb");
  const [fee, setFee] = useState("");
  const [received, setReceived] = useState("");
  const [reason, setReason] = useState("");
  const [vat, setVat] = useState("");
  const [terms, setTerms] = useState(false);
  const [noShow, setNoShow] = useState(false);
  const [tax, setTax] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [previewed, setPreviewed] = useState(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();
  useEffect(() => {
    if (!open) return;
    let alive = true;
    supabase.from("rental_inquiries").select("cancelled_at,cancellation_payload").eq("id", inquiryId).single().then(({ data, error: readError }) => {
      if (!alive) return;
      if (readError) { setError("Stornostand konnte nicht geladen werden."); return; }
      if (data.cancelled_at) { setConfirmed(true); setResult({ success: true, confirmed: true, snapshot: data.cancellation_payload as unknown as Snapshot }); }
    });
    supabase.from("inquiry_invoices").select("id").eq("rental_inquiry_id", inquiryId).eq("invoice_kind", "invoice").neq("status", "draft").neq("status", "cancelled").order("created_at", { ascending: false }).limit(1).then(({ data }) => { if (alive) setInvoiceId(data?.[0]?.id ?? null); });
    return () => { alive = false; };
  }, [open, inquiryId]);
  const invalidate = () => { if (!confirmed) setResult(null); setPreviewed(false); setError(""); };
  const showPdf = (base64: string) => {
    const url = URL.createObjectURL(new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: "application/pdf" }));
    window.open(url, "_blank", "noopener,noreferrer"); setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  const call = async (action: "preview" | "confirm") => {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const { data, error: failure } = await invokeWithAuth<Result>("rental-cancellation", { action, inquiry_id: inquiryId, expected_updated_at: result?.expected_updated_at, received_at: received ? new Date(received).toISOString() : "", reason, mode, fee_cents: mode === "individual" ? Math.round(Number(fee.replace(",", ".")) * 100) : undefined, vat_rate: Number(vat), tax_confirmed: tax, terms_confirmed: terms, no_show: noShow });
      if (failure || !data?.success) { setError(data?.error ?? "Storno nicht abgeschlossen. Bitte neu prüfen."); return; }
      setResult(data); setConfirmed(Boolean(data.confirmed));
      if (data.confirmed) { onChanged(); toast({ title: "Auftrag storniert", description: "Rechnung und Erstattung sind noch getrennt abzuschließen." }); }
    } catch { setError("Storno konnte nicht geprüft werden."); }
    finally { setBusy(false); }
  };
  const invoice = async (preview: boolean) => {
    if (!result?.snapshot || busy) return;
    setBusy(true); setError("");
    try {
      const { data, error: failure } = await invokeWithAuth<Result & { id?: string; invoice_id?: string }>("send-inquiry-invoice", { inquiry_type: "rental", inquiry_id: inquiryId, cancellation_invoice: true, preview, payment_terms: "vorkasse", notes: result.snapshot.reason });
      if (failure || data?.error) { setError(data?.error ?? "Rechnung nicht abgeschlossen."); return; }
      if (preview && data?.pdf_base64) { showPdf(data.pdf_base64); setPreviewed(true); }
      if (!preview) {
        toast({ title: `Stornorechnung ${data?.invoice_number ?? ""} erstellt` });
        const { data: rows } = await supabase.from("inquiry_invoices").select("id").eq("rental_inquiry_id", inquiryId).eq("invoice_kind", "invoice").neq("status", "draft").neq("status", "cancelled").order("created_at", { ascending: false }).limit(1);
        setInvoiceId(rows?.[0]?.id ?? null); onChanged();
      }
    } catch { setError("Rechnung konnte nicht abgeschlossen werden. Vor Wiederholung Belege prüfen."); }
    finally { setBusy(false); }
  };
  const valid = received && reason.trim().length >= 3 && vat !== "" && tax && (mode === "agb" ? terms : fee.trim() !== "" && Number.isFinite(Number(fee.replace(",", "."))) && Number(fee.replace(",", ".")) >= 0);
  return <>
    <Button variant="outline" size="sm" onClick={() => setOpen(true)}><Ban className="mr-2 h-4 w-4" />Auftrag stornieren / abrechnen</Button>
    <Dialog open={open} onOpenChange={v => !busy && setOpen(v)}><DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
      <DialogHeader><DialogTitle>{confirmed ? "Stornoabrechnung" : "Auftrag stornieren"}</DialogTitle><DialogDescription>{business ? "Geschäftskunde · Gebührenbasis netto" : "Privatkunde · Gebührenbasis brutto"}</DialogDescription></DialogHeader>
      {!confirmed && <div className="space-y-4">
        <Label>Gebührenermittlung</Label><Select value={mode} onValueChange={v => { invalidate(); setMode(v); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="agb">Gemäß AGB</SelectItem><SelectItem value="individual">Individuelle Gebühr</SelectItem></SelectContent></Select>
        {mode === "individual" && <div><Label htmlFor="cancel-fee">Stornogebühr {business ? "netto" : "brutto"} (€)</Label><Input id="cancel-fee" inputMode="decimal" value={fee} onChange={e => { invalidate(); setFee(e.target.value); }} /></div>}
        <div><Label htmlFor="cancel-received">Storno eingegangen am (lokale Uhrzeit)</Label><Input id="cancel-received" type="datetime-local" value={received} onChange={e => { invalidate(); setReceived(e.target.value); }} /></div>
        <div><Label htmlFor="cancel-reason">Grund / Nachweis der Erklärung</Label><Textarea id="cancel-reason" value={reason} onChange={e => { invalidate(); setReason(e.target.value); }} maxLength={1000} /></div>
        <Select value={vat} onValueChange={v => { invalidate(); setVat(v); }}><SelectTrigger aria-label="Steuerbehandlung"><SelectValue placeholder="Steuerbehandlung wählen" /></SelectTrigger><SelectContent><SelectItem value="0">Nicht steuerbare Entschädigung</SelectItem><SelectItem value="19">Steuerpflichtige Leistung · 19 %</SelectItem></SelectContent></Select>
        <label className="flex items-start gap-2 text-sm"><Checkbox checked={tax} onCheckedChange={v => { invalidate(); setTax(v === true); }} />Steuerbehandlung für diesen Storno geprüft</label>
        {mode === "agb" && <label className="flex items-start gap-2 text-sm"><Checkbox checked={terms} onCheckedChange={v => { invalidate(); setTerms(v === true); }} />Getrennte AGB Mai 2026 für diesen Vertrag nachgewiesen</label>}
        <label className="flex items-start gap-2 text-sm"><Checkbox checked={noShow} onCheckedChange={v => { invalidate(); setNoShow(v === true); }} />Nichtabholung nach Mietbeginn bestätigt</label>
      </div>}
      {result?.snapshot && <dl className="grid grid-cols-2 gap-2 border-y border-border py-3 text-sm"><dt>Stornogebühr ({result.snapshot.price_basis === "net" ? "netto" : "brutto"})</dt><dd className="text-right">{formatEuro(result.snapshot.fee_cents / 100)}</dd><dt>Einbehaltener Optionsaufpreis netto</dt><dd className="text-right">{formatEuro(result.snapshot.retained_option_net_cents / 100)}</dd><dt>Rechnungsbetrag brutto</dt><dd className="text-right font-semibold">{formatEuro(result.snapshot.totals.grossAmount)}</dd><dt>Zahlungen insgesamt inkl. Kaution</dt><dd className="text-right">{formatEuro(result.snapshot.paid_cents / 100)}</dd><dt>Kaution separat</dt><dd className="text-right">{formatEuro(result.snapshot.deposit)}</dd></dl>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {invoiceId && <RentalCreditRefund invoiceId={invoiceId} onDone={onChanged} />}
      <DialogFooter className="flex-wrap gap-2">
        {!confirmed ? <><Button variant="outline" disabled={busy || !valid} onClick={() => void call("preview")}><Eye className="mr-2 h-4 w-4" />Storno prüfen</Button><Button disabled={busy || !result?.snapshot || !valid} onClick={() => void call("confirm")}>Verbindlich stornieren</Button></> : <><Button variant="outline" disabled={busy} onClick={() => void invoice(true)}><Eye className="mr-2 h-4 w-4" />Rechnungsvorschau</Button><Button disabled={busy || !previewed || !!invoiceId} onClick={() => void invoice(false)}><Receipt className="mr-2 h-4 w-4" />Rechnung erstellen und senden</Button></>}
      </DialogFooter>
    </DialogContent></Dialog>
  </>;
}