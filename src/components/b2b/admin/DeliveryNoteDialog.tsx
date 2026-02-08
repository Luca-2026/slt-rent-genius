import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SignaturePad } from "@/components/b2b/SignaturePad";
import { ClipboardCheck, RefreshCw, Package, Clock, ShieldCheck, UserCheck, PenTool } from "lucide-react";
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
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);
  const [staffSignature, setStaffSignature] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [notes, setNotes] = useState("");
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update timestamp every second while dialog is open
  useState(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  });

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });

  const handleGenerate = async () => {
    if (!offer || !customerSignature) {
      toast({ title: "Kundenunterschrift fehlt", description: "Bitte lassen Sie den Kunden zuerst unterschreiben.", variant: "destructive" });
      return;
    }
    if (!staffSignature) {
      toast({ title: "Mitarbeiter-Unterschrift fehlt", description: "Bitte unterschreiben Sie als SLT-Mitarbeiter.", variant: "destructive" });
      return;
    }
    if (!staffName.trim()) {
      toast({ title: "Mitarbeitername fehlt", description: "Bitte geben Sie Ihren Namen ein.", variant: "destructive" });
      return;
    }
    if (!agbAccepted) {
      toast({ title: "AGB nicht akzeptiert", description: "Der Kunde muss die AGB akzeptieren.", variant: "destructive" });
      return;
    }
    if (!offerAccepted) {
      toast({ title: "Angebotsannahme fehlt", description: "Der Kunde muss das Angebot bestätigen.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-delivery-note", {
        body: {
          offer_id: offer.id,
          signature_data: customerSignature,
          staff_signature_data: staffSignature,
          staff_name: staffName.trim(),
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

      setCustomerSignature(null);
      setStaffSignature(null);
      setStaffName("");
      setNotes("");
      setAgbAccepted(false);
      setOfferAccepted(false);
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
  const allValid = !!customerSignature && !!staffSignature && !!staffName.trim() && agbAccepted && offerAccepted;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Lieferschein erstellen
          </DialogTitle>
          <DialogDescription>
            Rechtssichere Übergabebestätigung mit AGB-Akzeptanz, Angebotsannahme und beidseitiger Unterschrift.
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
          {items.map((item) => (
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

        {/* Legal Confirmations */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Rechtliche Bestätigungen
          </Label>

          {/* Offer acceptance */}
          <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/30">
            <Checkbox
              id="offer-accept"
              checked={offerAccepted}
              onCheckedChange={(checked) => setOfferAccepted(checked === true)}
            />
            <label htmlFor="offer-accept" className="text-sm leading-relaxed cursor-pointer">
              Der Kunde bestätigt hiermit die Annahme des Angebots{" "}
              <strong>{offer.offer_number}</strong> der SLT Technology Group GmbH & Co. KG 
              und erkennt die darin enthaltenen Konditionen, Preise und Mietbedingungen als verbindlich an 
              (§§ 145 ff. BGB).
            </label>
          </div>

          {/* AGB acceptance */}
          <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/30">
            <Checkbox
              id="agb-accept"
              checked={agbAccepted}
              onCheckedChange={(checked) => setAgbAccepted(checked === true)}
            />
            <label htmlFor="agb-accept" className="text-sm leading-relaxed cursor-pointer">
              Der Kunde erklärt hiermit, die{" "}
              <a href="/agb" target="_blank" className="text-primary underline hover:text-primary/80">
                Allgemeinen Geschäftsbedingungen (AGB)
              </a>{" "}
              der SLT Technology Group GmbH & Co. KG vor Vertragsschluss zur Kenntnis genommen 
              und deren Geltung ausdrücklich anerkannt zu haben.
            </label>
          </div>
        </div>

        <Separator />

        {/* Customer Signature */}
        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Unterschrift Mieter (Kunde)
          </Label>
          <p className="text-xs text-muted-foreground">
            {profile.contact_first_name} {profile.contact_last_name} – {profile.company_name}
          </p>
          <SignaturePad onSignatureChange={setCustomerSignature} />
        </div>

        <Separator />

        {/* Staff Signature */}
        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            Unterschrift SLT-Mitarbeiter
          </Label>
          <div>
            <Label className="text-xs">Name des Mitarbeiters *</Label>
            <Input
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Vor- und Nachname des SLT-Mitarbeiters"
              className="text-sm"
            />
          </div>
          <SignaturePad onSignatureChange={setStaffSignature} />
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={saving || !allValid}
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
