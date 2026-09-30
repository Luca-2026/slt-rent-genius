import { useState } from "react";
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

interface Props {
  inquiryType: "rental" | "sales";
  inquiry: Record<string, any>;
  senderName: string;
  onDone: () => void;
}

const eur = (cents: number) => formatEuro(cents / 100);

/**
 * Auftragsbestätigung nach Zahlungseingang für angenommene Angebote.
 * Grundlage sind ausschließlich die gespeicherten Zahlungseingänge.
 */
export function OrderConfirmationCard({ inquiryType, inquiry, senderName, onDone }: Props) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [ack, setAck] = useState(false);
  const [attachPdf, setAttachPdf] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  if (inquiry.status !== "accepted" || !inquiry.offer_number) return null;

  const payload = (inquiry.offer_payload ?? {}) as Record<string, any>;
  const ev = evaluateOrderPayment({
    gross: inquiry.offer_total_gross ?? payload?.totals?.grossAmount,
    deposit: payload?.deposit,
    payments: parseInquiryPayments(inquiry.payments),
    paymentTerms: payload?.payment_terms,
  });
  const sentAt = inquiry.order_confirmed_at as string | null;

  const send = async () => {
    setBusy(true);
    const { error } = await supabase.functions.invoke("send-order-confirmation", {
      body: {
        inquiry_type: inquiryType,
        inquiry_id: inquiry.id,
        note,
        sender_name: senderName,
        acknowledge_open: ev.needsAcknowledgement ? ack : false,
        attach_pdf: attachPdf,
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
      <div className="space-y-0.5 text-muted-foreground">
        <div>Angebot {inquiry.offer_number}: {eur(ev.grossCents)} brutto</div>
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
          <AlertDialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setAck(false); }}>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={busy}>
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
                  disabled={busy || (ev.needsAcknowledgement && !ack)}
                  onClick={(e) => { e.preventDefault(); void send(); }}
                >
                  {busy ? "Wird gesendet …" : "Jetzt senden"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
