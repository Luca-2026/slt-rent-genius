import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SignaturePad } from "@/components/b2b/SignaturePad";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PenLine } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiryId: string;
  inquiryTable: "rental_inquiries" | "sales_inquiries";
  offerNumber: string;
  customerName: string;
  onAccepted: () => void;
}

/**
 * Vor-Ort-Annahme: Der Kunde unterschreibt das Angebot direkt auf dem Gerät
 * des Mitarbeiters (Name + Unterschrift + AGB-Bestätigung), wie bei den Protokollen.
 * Danach erhält er die Kopie automatisch per E-Mail.
 */
export function OnSiteOfferSignDialog({ open, onOpenChange, inquiryId, inquiryTable, offerNumber, customerName, onAccepted }: Props) {
  const [signerName, setSignerName] = useState(customerName);
  const [signature, setSignature] = useState<string | null>(null);
  const [agb, setAgb] = useState(false);
  const [binding, setBinding] = useState(false);
  const [busy, setBusy] = useState(false);

  // Name nachziehen, sobald die Anfrage geladen ist / der Dialog öffnet.
  useEffect(() => {
    if (open && customerName) setSignerName((prev) => (prev.trim() ? prev : customerName));
  }, [open, customerName]);

  const ready = signerName.trim().length >= 2 && !!signature && agb && binding && !busy;

  const submit = async () => {
    if (!ready) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("offer-accept", {
        body: {
          action: "accept_onsite",
          inquiry_table: inquiryTable,
          inquiry_id: inquiryId,
          offer_number: offerNumber,
          signer_name: signerName.trim(),
          signature_data: signature,
          agb_accepted: true,
          binding_accepted: true,
        },
      });
      if (error || !data?.success) {
        toast.error(data?.error || "Annahme fehlgeschlagen. Bitte erneut versuchen.");
        return;
      }
      toast.success(`Angebot ${offerNumber} vor Ort angenommen. Der Kunde erhält die Kopie per E-Mail.`);
      onOpenChange(false);
      onAccepted();
    } catch {
      toast.error("Annahme fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><PenLine className="h-5 w-5" /> Angebot vor Ort unterschreiben</DialogTitle>
          <DialogDescription>
            Der Kunde unterschreibt Angebot <strong>{offerNumber}</strong> direkt auf diesem Gerät. Danach erhält er die Kopie automatisch per E-Mail.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="onsite-signer" className="text-sm font-medium">Name des Kunden</label>
            <Input id="onsite-signer" value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder="Vor- und Nachname" />
          </div>
          <SignaturePad onSignatureChange={setSignature} />
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={agb} onCheckedChange={(v) => setAgb(v === true)} className="mt-0.5" />
            <span>Der Kunde hat die AGB erhalten und akzeptiert sie.</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={binding} onCheckedChange={(v) => setBinding(v === true)} className="mt-0.5" />
            <span>Der Kunde nimmt das Angebot verbindlich an.</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Abbrechen</Button>
          <Button onClick={submit} disabled={!ready}>{busy ? "Wird gespeichert …" : "Angebot verbindlich annehmen"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
