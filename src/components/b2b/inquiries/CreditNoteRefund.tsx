import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Undo2, Loader2 } from "lucide-react";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatEuro } from "./offerMath";

type Result = { success?: boolean; amount_cents?: number; status?: string; error?: string };
const labels: Record<string, string> = { succeeded: "Über Stripe erstattet", pending: "Stripe-Erstattung in Bearbeitung", creating: "Stripe-Erstattung vorbereitet", failed: "Stripe-Erstattung fehlgeschlagen" };

export function CreditNoteRefund({ creditId, onChanged }: { creditId: string; onChanged: () => void }) {
  const { toast } = useToast();
  const [result, setResult] = useState<Result | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    supabase.from("credit_note_refunds").select("amount_cents, status").eq("credit_note_id", creditId).maybeSingle().then(({ data }) => { if (active && data) setResult(data); });
    return () => { active = false; };
  }, [creditId]);
  const check = async () => {
    setBusy(true);
    const { data, error } = await invokeWithAuth<Result>("offer-payment-admin", { action: "credit_refund_info", credit_note_id: creditId });
    setBusy(false);
    if (error || !data?.success) {
      toast({ title: "Stripe-Erstattung nicht verfügbar", description: data?.error || "Kein erstattbarer Stripe-Zahlungseingang gefunden.", variant: "destructive" });
      return;
    }
    setResult(data);
    if (!["succeeded", "pending"].includes(data.status ?? "")) setOpen(true);
  };
  const refund = async () => {
    if (busy) return;
    setBusy(true);
    const { data, error } = await invokeWithAuth<Result>("offer-payment-admin", { action: "refund_credit_note", credit_note_id: creditId });
    setBusy(false);
    if (error || !data?.success) {
      toast({ title: "Erstattung nicht abgeschlossen", description: data?.error || "Bitte Status erneut prüfen; nicht zusätzlich manuell erstatten.", variant: "destructive" });
      return;
    }
    setResult(data);
    setOpen(false);
    toast({ title: labels[data.status ?? "pending"] ?? "Erstattungsstatus aktualisiert" });
    onChanged();
  };
  return <>
    <Button size="sm" variant="outline" onClick={check} disabled={busy}>
      {busy ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Undo2 className="h-3.5 w-3.5 mr-1" />}
      {result?.status ? "Erstattung prüfen" : "Über Stripe erstatten"}
    </Button>
    {result?.status && <span className="text-xs text-muted-foreground self-center break-words">{labels[result.status] ?? result.status} · {formatEuro((result.amount_cents ?? 0) / 100)}</span>}
    <Dialog open={open} onOpenChange={(value) => !busy && setOpen(value)}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Gutschrift über Stripe erstatten</DialogTitle><DialogDescription>Es werden {formatEuro((result?.amount_cents ?? 0) / 100)} auf das ursprüngliche Zahlungsmittel zurückgezahlt. Bei einer Live-Zahlung wird echtes Geld erstattet. Die Gutschrift und der ursprüngliche Zahlungseingang bleiben unverändert.</DialogDescription></DialogHeader>
        <DialogFooter><Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>Abbrechen</Button><Button disabled={busy} onClick={refund}>{busy && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Erstattung verbindlich auslösen</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}