import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SignaturePad } from "@/components/b2b/SignaturePad";
import { ClipboardCheck, RefreshCw, Send, Package, Clock, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Offer, OfferItem } from "@/components/b2b/admin/AdminOffersTab";

interface B2BProfile {
  id: string;
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
}

interface Reservation {
  id: string;
  location: string;
  start_date: string;
  end_date: string | null;
}

interface Props {
  offer: Offer | null;
  offerItems: OfferItem[];
  profile: B2BProfile | null;
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function DeliveryNoteDialog({
  offer,
  offerItems,
  profile,
  reservation,
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update timestamp every second while dialog is open
  useState(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  });

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });

  const handleGenerate = async () => {
    if (!offer || !signatureData) {
      toast({
        title: "Unterschrift fehlt",
        description: "Bitte lassen Sie den Kunden zuerst unterschreiben.",
        variant: "destructive",
      });
      return;
    }
    if (!agbAccepted) {
      toast({
        title: "AGB nicht akzeptiert",
        description: "Der Kunde muss die AGB akzeptieren.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-delivery-note", {
        body: {
          offer_id: offer.id,
          signature_data: signatureData,
          notes: notes || undefined,
          send_email: true,
          agb_accepted: true,
        },
      });

      if (error) throw error;

      toast({
        title: "Lieferschein erstellt!",
        description: data.email_sent
          ? `Lieferschein ${data.delivery_note?.delivery_note_number} wurde erstellt und per E-Mail versendet.`
          : `Lieferschein ${data.delivery_note?.delivery_note_number} wurde erstellt. (E-Mail nicht konfiguriert)`,
      });

      setSignatureData(null);
      setNotes("");
      setAgbAccepted(false);
      onCreated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Lieferschein konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!offer || !profile) return null;

  const items = offerItems.filter((i) => i.offer_id === offer.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Lieferschein erstellen
          </DialogTitle>
          <DialogDescription>
            Lassen Sie den Kunden die Übergabe der Mietartikel per Unterschrift bestätigen.
          </DialogDescription>
        </DialogHeader>

        {/* Customer & Offer Info */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{profile.company_name}</p>
                <p className="text-sm text-muted-foreground">
                  {profile.contact_first_name} {profile.contact_last_name}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-primary border-primary">
                  {offer.offer_number}
                </Badge>
                {reservation && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Standort: <span className="capitalize">{reservation.location}</span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Items */}
        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4" />
            Mietartikel zur Übergabe
          </Label>
          {items.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{item.product_name}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                  {item.rental_start && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.rental_start)}
                      {item.rental_end ? ` – ${formatDate(item.rental_end)}` : ""}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {item.quantity}x
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* Timestamp */}
        <Card className="bg-muted/50">
          <CardContent className="p-3 flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Übergabe-Zeitstempel</p>
              <p className="text-sm font-medium">
                {format(currentTime, "dd.MM.yyyy, HH:mm:ss", { locale: de })} Uhr
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <div>
          <Label className="text-xs">Anmerkungen (optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="z.B. Zustand der Geräte, besondere Hinweise..."
            rows={2}
            className="text-sm"
          />
        </div>

        <Separator />

        {/* Signature Pad */}
        <SignaturePad onSignatureChange={setSignatureData} />

        <Separator />

        {/* AGB Acceptance */}
        <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/30">
          <Checkbox
            id="agb-accept"
            checked={agbAccepted}
            onCheckedChange={(checked) => setAgbAccepted(checked === true)}
          />
          <label htmlFor="agb-accept" className="text-sm leading-relaxed cursor-pointer">
            Der Kunde bestätigt hiermit, die{" "}
            <a href="/agb" target="_blank" className="text-primary underline hover:text-primary/80">
              Allgemeinen Geschäftsbedingungen (AGB)
            </a>{" "}
            der SLT Technology Group GmbH & Co. KG gelesen und akzeptiert zu haben.
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={saving || !signatureData || !agbAccepted}
            className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-1.5" />
                Lieferschein erstellen & senden
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
