import { useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatEuro } from "./offerMath";
import { parseInquiryPayments } from "./InquiryPaymentsCard";

interface Props {
  inquiryType: "rental" | "sales";
  inquiry: Record<string, any>;
  senderName: string;
  onDone: () => void;
}

/** Auftragsbestätigung nach Zahlungseingang für angenommene Angebote. */
export function OrderConfirmationCard({ inquiryType, inquiry, senderName, onDone }: Props) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  if (inquiry.status !== "accepted" || !inquiry.offer_number) return null;

  const gross = Number(inquiry.offer_total_gross) || 0;
  const paid = parseInquiryPayments(inquiry.payments).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const open = Math.max(0, Math.round((gross - paid) * 100) / 100);
  const sentAt = inquiry.order_confirmed_at as string | null;

  const send = async () => {
    setBusy(true);
    const { error } = await supabase.functions.invoke("send-order-confirmation", {
      body: { inquiry_type: inquiryType, inquiry_id: inquiry.id, note, sender_name: senderName },
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
    onDone();
  };

  return (
    <div className="rounded-lg border border-border p-3 text-sm space-y-2">
      <div className="font-semibold">Auftragsbestätigung</div>
      <p className="text-muted-foreground">
        Angebot {inquiry.offer_number}: {formatEuro(gross)} · Zahlungseingang {formatEuro(paid)}
        {open > 0 ? ` · offen ${formatEuro(open)}` : " · vollständig bezahlt"}
      </p>
      {sentAt && (
        <p className="text-primary">
          Bereits gesendet am {new Date(sentAt).toLocaleString("de-DE")}
          {inquiry.order_confirmed_by_name ? ` von ${inquiry.order_confirmed_by_name}` : ""}.
        </p>
      )}
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optionale Nachricht an den Kunden (z. B. Abholhinweise)"
        rows={2}
        maxLength={800}
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" disabled={busy}>
            {busy ? "Wird gesendet …" : sentAt ? "Auftragsbestätigung erneut senden" : "Auftragsbestätigung senden"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Auftragsbestätigung senden?</AlertDialogTitle>
            <AlertDialogDescription>
              Geht an {inquiry.customer_email}. Mit Zugang dieser E-Mail kommt der Auftrag verbindlich zustande.
              {paid <= 0 && " Achtung: Es ist noch kein Zahlungseingang erfasst."}
              {paid > 0 && open > 0 && ` Achtung: Es sind noch ${formatEuro(open)} offen.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={send}>Jetzt senden</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
