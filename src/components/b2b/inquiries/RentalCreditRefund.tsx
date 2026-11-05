import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { useToast } from "@/hooks/use-toast";
import { formatEuro } from "./offerMath";
import { FileText, Undo2 } from "lucide-react";

type Result = { success: boolean; error?: string; amount_cents: number; status: string; payout_method: string; pdf_url?: string; pdf_base64?: string };
export function RentalCreditRefund({ invoiceId }: { invoiceId: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");
  const { toast } = useToast();
  const call = async (action: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const { data, error } = await invokeWithAuth<Result>("offer-payment-admin", { action, invoice_id: invoiceId, ...(action === "confirm_rental_credit_transfer" ? { bank_reference: reference } : {}) });
      if (error || !data?.success) { toast({ title: "Mietguthaben nicht abgeschlossen", description: data?.error || "Status erneut prüfen; nicht zusätzlich erstatten.", variant: "destructive" }); return; }
      setResult(data); setOpen(true);
    } finally { setBusy(false); }
  };
  const pdf = () => {
    if (result?.pdf_url) { window.open(result.pdf_url, "_blank", "noopener,noreferrer"); return; }
    if (!result?.pdf_base64) return;
    const bytes = Uint8Array.from(atob(result.pdf_base64), c => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    window.open(url, "_blank", "noopener,noreferrer"); setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  return <>
    <Button variant="outline" size="sm" disabled={busy} onClick={() => call("rental_credit_info")}><Undo2 className="h-4 w-4 mr-1" />Mietguthaben / Erstattung</Button>
    <Dialog open={open} onOpenChange={v => !busy && setOpen(v)}><DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>Mietguthaben {formatEuro((result?.amount_cents ?? 0) / 100)}</DialogTitle><DialogDescription>Kaution und Mietguthaben bleiben getrennt. Der Rabatt ist in der Rechnung bereits berücksichtigt.</DialogDescription></DialogHeader>
      <p className="text-sm">{result?.status === "succeeded" ? "Erstattung bestätigt" : result?.status === "pending" ? "Erstattung wird verarbeitet" : result?.status === "creating" ? "Erstattungsauftrag vorbereitet; Auszahlung noch nicht bestätigt" : "Noch nicht beauftragt"}</p>
      {result?.payout_method === "transfer" && result.status === "creating" && <><p className="text-sm">Überweise ausschließlich den ausgewiesenen Mietguthabenbetrag. Bestätige erst danach mit dem Banknachweis.</p><Input aria-label="Banknachweis" placeholder="Bank-Buchungsreferenz" value={reference} onChange={e => setReference(e.target.value)} maxLength={200} /></>}
      <DialogFooter className="flex-wrap gap-2"><Button variant="outline" onClick={pdf}><FileText className="h-4 w-4 mr-1" />PDF öffnen</Button>
        {result?.status === "available" && <Button disabled={busy} onClick={() => call("refund_rental_credit")}>{result.payout_method === "transfer" ? "Überweisungsauftrag vorbereiten" : "Verbindlich auf ursprüngliche Zahlung erstatten"}</Button>}
        {result?.payout_method === "transfer" && result.status === "creating" && <Button disabled={busy || reference.trim().length < 3} onClick={() => call("confirm_rental_credit_transfer")}>Ausgeführte Überweisung bestätigen</Button>}
        {result?.payout_method === "stripe" && result.status === "creating" && <Button disabled={busy} onClick={() => call("refund_rental_credit")}>Gespeicherten Auftrag abgleichen</Button>}
      </DialogFooter>
    </DialogContent></Dialog>
  </>;
}