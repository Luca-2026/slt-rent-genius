import { useEffect, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatEuro } from "./offerMath";
import { parseInquiryPayments } from "./InquiryPaymentsCard";
import { evaluateOrderPayment } from "@/lib/orderConfirmation";
import { AvailabilityDecisionDialog } from "./AvailabilityDecisionDialog";
import type { AvailabilityResult } from "@/lib/availabilityDecisions";
import { Eye, Pencil } from "lucide-react";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { matchesDocumentPreview } from "../../../../supabase/functions/_shared/invoice-preview";
import { PdfPagesPreview } from "@/components/b2b/PdfPagesPreview";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Props {
  inquiryType: "rental" | "sales";
  inquiry: Record<string, any>;
  senderName: string;
  onDone: () => void;
  onEdit?: () => void;
}

const eur = (cents: number) => formatEuro(cents / 100);

/**
 * Auftragsbestätigung nach Zahlungseingang für angenommene Angebote.
 * Grundlage sind ausschließlich die gespeicherten Zahlungseingänge.
 */
import { parseOrderType } from "./offerMath";
import { OrderRevisionHistory } from "./OrderRevisionHistory";

export function OrderConfirmationCard({ inquiryType, inquiry, senderName, onDone, onEdit }: Props) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [ack, setAck] = useState(false);
  const [attachPdf, setAttachPdf] = useState(Number(inquiry.order_revision ?? 0) > 0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewedKey, setPreviewedKey] = useState<string | null>(null);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  if (inquiry.status !== "accepted" || !inquiry.offer_number) return null;

  const payload = (inquiry.offer_payload ?? {}) as Record<string, any>;
  const ev = evaluateOrderPayment({
    gross: inquiry.offer_total_gross ?? payload?.totals?.grossAmount,
    deposit: payload?.deposit,
    payments: parseInquiryPayments(inquiry.payments),
    paymentTerms: payload?.payment_terms,
  });
  const sentAt = inquiry.order_confirmed_at as string | null;
  const requestBody = {
    inquiry_type: inquiryType, inquiry_id: inquiry.id, note, sender_name: senderName,
    attach_pdf: attachPdf, expected_revision: inquiry.order_revision ?? 0,
    expected_paid_cents: ev.paidCents, expected_required_cents: ev.requiredCents,
  };
  const previewState = { ...requestBody, offer_payload: payload };
  const previewOk = matchesDocumentPreview(previewedKey, previewState);
  const preview = async () => {
    setPreviewing(true);
    const key = JSON.stringify(previewState);
    try {
      const { data, error } = await invokeWithAuth("send-order-confirmation", { ...requestBody, preview: true });
      if (error || !data?.pdf_base64) throw new Error(data?.error ?? error?.message ?? "Keine PDF-Vorschau erhalten.");
      const binary = atob(data.pdf_base64);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      setPreviewUrl(URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })));
      setPreviewedKey(key);
    } catch (error) {
      toast.error(`Vorschau nicht möglich: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`);
    } finally { setPreviewing(false); }
  };

  // Verfügbarkeit nur bei Mietaufträgen: prüfen → ggf. entscheiden → Geräte belegen → E-Mail.
  const confirmAndSend = async (decisions: Record<string, unknown> = { mode: "confirm", items: {} }) => {
    if (!previewOk) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("confirm_order" as any, { inquiry_id: inquiry.id, decisions } as any);
    if (error) { setBusy(false); toast.error(`Auftrag nicht bestätigt: ${error.message}`); return; }
    const mode = (data as any)?.mode;
    if (mode === "pending" || mode === "reject") {
      setBusy(false); setAvailability(null); setDialogOpen(false);
      toast.success(mode === "pending" ? "Vermerkt: Verfügbarkeit mit Kunde klären." : "Anfrage abgesagt.");
      onDone();
      return;
    }
    setAvailability(null);
    await sendMail();
  };

  const send = async () => {
    if (!previewOk) return;
    if (inquiryType !== "rental") return sendMail();
    setBusy(true);
    const { data, error } = await supabase.rpc("check_availability" as any, { inquiry_id: inquiry.id } as any);
    setBusy(false);
    if (error) { toast.error(`Verfügbarkeit nicht prüfbar: ${error.message}`); return; }
    const res = data as unknown as AvailabilityResult;
    if (!res?.all_available && !sentAt) { setDialogOpen(false); setAvailability(res); return; }
    await confirmAndSend();
  };

  const sendMail = async () => {
    if (!previewOk) return;
    setBusy(true);
    const { error } = await supabase.functions.invoke("send-order-confirmation", {
      body: {
        ...requestBody,
        acknowledge_open: ev.needsAcknowledgement ? ack : false,
        attach_pdf: attachPdf,
        expected_revision: inquiry.order_revision ?? 0,
        expected_paid_cents: ev.paidCents,
        expected_required_cents: ev.requiredCents,
      },
    });
    setBusy(false);
    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try { msg = (await error.context.json()).error ?? msg; } catch { /* ignore */ }
      }
      toast.error(`Auftragsbestätigung nicht gesendet: ${msg}`);
      return;
    }
    toast.success(`Auftragsbestätigung an ${inquiry.customer_email} gesendet.`);
    setNote("");
    setAck(false);
    setDialogOpen(false);
    setPreviewedKey(null);
    onDone();
  };

  const statusText =
    ev.state === "full"
      ? `vollständig bezahlt${ev.overpaidCents > 0 ? ` (Überzahlung ${eur(ev.overpaidCents)})` : ""}`
      : ev.state === "partial"
        ? `Teilzahlung – offen ${eur(ev.openCents)}`
        : ev.state === "none"
          ? "noch kein Zahlungseingang"
          : "keine Angebotssumme";
  const statusClass = ev.state === "full" ? "text-primary" : "text-destructive";

  return (
    <div className="rounded-lg border border-border p-3 text-sm space-y-2">
      <div className="font-semibold">Auftragsbestätigung</div>
      {onEdit && <Button variant="outline" size="sm" onClick={onEdit} disabled={busy || previewing}><Pencil className="mr-2 h-4 w-4" />AB bearbeiten</Button>}
      {inquiryType === "rental" && <OrderRevisionHistory inquiry={inquiry} />}
      <div className="space-y-0.5 text-muted-foreground">
        <div>{inquiry.order_revision ? `Aktueller Auftrag · Änderung ${inquiry.order_revision}` : `Angebot ${inquiry.offer_number}`}: {eur(ev.grossCents)} brutto</div>
        {/* Paket 3b: Auftragsart aus dem Angebot (alte Angebote ohne Angabe = Abholung) */}
        <div>Auftragsart: {parseOrderType(payload?.order_type) === "delivery" ? "Lieferung" : "Abholung"}</div>
        {ev.depositCents > 0 && <div>Kaution: {eur(ev.depositCents)} · Gesamt zu zahlen: {eur(ev.requiredCents)}</div>}
        <div>Gespeicherte Zahlungseingänge: {eur(ev.paidCents)}</div>
        <div className={`font-semibold ${statusClass}`}>{statusText}</div>
      </div>

      {sentAt && (
        <p className="text-primary">
          Bereits gesendet am {new Date(sentAt).toLocaleString("de-DE")}
          {inquiry.order_confirmed_by_name ? ` von ${inquiry.order_confirmed_by_name}` : ""}.
          {inquiry.order_confirmation_file_url && (
            <>
              {" "}
              <a href={inquiry.order_confirmation_file_url} target="_blank" rel="noreferrer" className="underline">
                PDF {inquiry.order_confirmation_number} öffnen
              </a>
            </>
          )}
        </p>
      )}

      {!ev.canSend ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-destructive">
          {ev.blockReason} Zahlung oben unter „Zahlungseingänge“ erfassen und speichern.
        </p>
      ) : (
        <>
          <Textarea
            aria-label="Nachricht zur Auftragsbestätigung"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optionale Nachricht an den Kunden (z. B. Abholhinweise)"
            rows={2}
            maxLength={800}
          />
          <label className="flex items-center gap-2">
            <Checkbox checked={attachPdf} onCheckedChange={(v) => setAttachPdf(Boolean(v))} />
            <span>Auftragsbestätigung zusätzlich als PDF beifügen</span>
          </label>
          <AvailabilityDecisionDialog
            key={availability ? "open" : "closed"}
            result={availability}
            busy={busy}
            onCancel={() => setAvailability(null)}
            onSubmit={(d) => void confirmAndSend(d)}
          />
          <Button size="sm" variant="outline" onClick={() => void preview()} disabled={busy || previewing}>
            <Eye className="mr-2 h-4 w-4" />{previewing ? "Vorschau wird erstellt …" : "AB-Vorschau anzeigen"}
          </Button>
          <AlertDialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setAck(false); }}>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={busy || previewing || !previewOk}>
                {sentAt ? "Auftragsbestätigung erneut senden" : "Auftragsbestätigung senden"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Auftragsbestätigung senden?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2">
                    <p>Geht an {inquiry.customer_email}{attachPdf ? " – mit PDF im Anhang" : " – ohne PDF"}. Mit Zugang dieser E-Mail kommt der Auftrag verbindlich zustande.</p>
                    {ev.state === "full" && <p>Zahlung vollständig eingegangen ({eur(ev.paidCents)}).</p>}
                    {ev.state === "partial" && (
                      <p className="font-semibold text-destructive">
                        Achtung: Erst {eur(ev.paidCents)} von {eur(ev.requiredCents)} eingegangen – offen {eur(ev.openCents)}.
                        Die E-Mail nennt die Teilzahlung und den offenen Restbetrag.
                      </p>
                    )}
                    {ev.state === "none" && (
                      <p className="font-semibold text-destructive">
                        Achtung: Noch kein Zahlungseingang erfasst. Laut Angebot ist Zahlung auf Rechnung vereinbart –
                        die E-Mail weist darauf hin, dass noch keine Zahlung eingegangen ist.
                      </p>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              {ev.needsAcknowledgement && (
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox checked={ack} onCheckedChange={(v) => setAck(Boolean(v))} className="mt-0.5" />
                  <span>Ich habe den offenen Betrag geprüft und möchte den Auftrag trotzdem bestätigen.</span>
                </label>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={busy}>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  disabled={busy || !previewOk || (ev.needsAcknowledgement && !ack)}
                  onClick={(e) => { e.preventDefault(); void send(); }}
                >
                  {busy ? "Wird gesendet …" : "Jetzt senden"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
      <Dialog open={!!previewUrl} onOpenChange={(open) => { if (!open) setPreviewUrl(null); }}>
        <DialogContent className="flex h-[90dvh] max-w-5xl flex-col overflow-hidden">
          <DialogHeader><DialogTitle>Auftragsbestätigung – Vorschau</DialogTitle></DialogHeader>
          {previewUrl && <PdfPagesPreview url={previewUrl} className="min-h-0 flex-1 overflow-y-auto border border-border bg-muted p-3" />}
          <DialogFooter>
            {previewUrl && <Button variant="outline" asChild><a href={previewUrl} target="_blank" rel="noreferrer">In neuem Tab öffnen</a></Button>}
            <Button variant="outline" onClick={() => setPreviewUrl(null)}>Zurück</Button>
            <Button disabled={!previewOk || busy} onClick={() => { setPreviewUrl(null); setDialogOpen(true); }}>Versand prüfen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
