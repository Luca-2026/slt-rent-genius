import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SignaturePad } from "@/components/b2b/SignaturePad";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, FileSignature, AlertTriangle, Loader2 } from "lucide-react";

interface ProtocolItem {
  product_name: string;
  quantity: number;
  description?: string | null;
  condition_notes?: string | null;
  condition?: string;
}

interface ProtocolSigningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "delivery_note" | "return_protocol";
  protocolId: string;
  protocolNumber: string;
  items: ProtocolItem[];
  notes?: string | null;
  knownDefects?: string | null;
  overallCondition?: string;
  damageDescription?: string | null;
  onSigned: () => void;
}

export function ProtocolSigningDialog({
  open, onOpenChange, type, protocolId, protocolNumber, items,
  notes, knownDefects, overallCondition, damageDescription, onSigned,
}: ProtocolSigningDialogProps) {
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const isDeliveryNote = type === "delivery_note";
  const canSign = signatureData && confirmed && (isDeliveryNote ? agbAccepted : true);

  const handleSign = async () => {
    if (!canSign) return;
    setSaving(true);
    try {
      const fnName = isDeliveryNote ? "sign_delivery_note" : "sign_return_protocol";
      const params = isDeliveryNote
        ? { _note_id: protocolId, _signature_data: signatureData, _agb_accepted: agbAccepted }
        : { _protocol_id: protocolId, _signature_data: signatureData };

      const { error } = await supabase.rpc(fnName, params);
      if (error) throw error;

      toast({ title: "Erfolgreich unterschrieben", description: `${protocolNumber} wurde digital signiert.` });

      // Notify admins in background (don't block UI)
      supabase.functions.invoke("notify-admin-protocol-signed", {
        body: {
          type: isDeliveryNote ? "delivery_note" : "return_protocol",
          id: protocolId,
        },
      }).catch((e) => console.error("Admin notification failed:", e));

      onSigned();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setSignatureData(null);
      setAgbAccepted(false);
      setConfirmed(false);
    }
    onOpenChange(v);
  };

  const conditionLabel = (c?: string) => {
    switch (c) {
      case "good": return "Gut";
      case "minor_damage": return "Leichte Mängel";
      case "major_damage": return "Erhebliche Schäden";
      default: return c || "–";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            {isDeliveryNote ? "Übergabeprotokoll" : "Rückgabeprotokoll"} unterschreiben
          </DialogTitle>
          <DialogDescription>
            {protocolNumber} – Bitte prüfen Sie die Angaben und unterschreiben Sie digital.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Items List */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">
              {isDeliveryNote ? "Übergebene Artikel:" : "Zurückgegebene Artikel:"}
            </p>
            <ul className="space-y-1">
              {items.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">{item.quantity}x</span>
                  <span className="flex-1">
                    {item.product_name}
                    {item.description && <span className="text-muted-foreground"> – {item.description}</span>}
                    {item.condition && !isDeliveryNote && (
                      <Badge variant="outline" className="ml-2 text-xs">{conditionLabel(item.condition)}</Badge>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Known defects / notes */}
          {knownDefects && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Bekannte Mängel
              </p>
              <p className="text-sm text-yellow-700 mt-1">{knownDefects}</p>
            </div>
          )}

          {overallCondition && !isDeliveryNote && (
            <div className="text-sm">
              <span className="font-medium">Gesamtzustand: </span>
              <Badge variant="outline">{conditionLabel(overallCondition)}</Badge>
            </div>
          )}

          {damageDescription && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800">Schäden</p>
              <p className="text-sm text-red-700 mt-1">{damageDescription}</p>
            </div>
          )}

          {notes && (
            <p className="text-sm text-muted-foreground italic">{notes}</p>
          )}

          {/* Signature Pad */}
          <SignaturePad onSignatureChange={setSignatureData} />

          {/* Confirmations */}
          <div className="space-y-3 border-t pt-4">
            {isDeliveryNote && (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agb"
                  checked={agbAccepted}
                  onCheckedChange={(v) => setAgbAccepted(v === true)}
                />
                <label htmlFor="agb" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  Ich akzeptiere die allgemeinen Geschäftsbedingungen der SLT-Rental GmbH und bestätige den Empfang der aufgelisteten Mietartikel.
                </label>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(v === true)}
              />
              <label htmlFor="confirm" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                {isDeliveryNote
                  ? "Ich bestätige, dass die aufgeführten Artikel vollständig und im beschriebenen Zustand übergeben wurden."
                  : "Ich bestätige, dass die aufgeführten Artikel zurückgegeben wurden und der Zustand korrekt dokumentiert ist."
                }
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSign} disabled={!canSign || saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
            )}
            {saving ? "Wird gespeichert..." : "Digital unterschreiben"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
