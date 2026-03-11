import { useState, useRef } from "react";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SignaturePad } from "@/components/b2b/SignaturePad";
import { ClipboardCheck, RefreshCw, Package, Clock, ShieldCheck, UserCheck, PenTool, AlertTriangle, Camera, Upload, X, Gauge } from "lucide-react";
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
  const [customerNotPresent, setCustomerNotPresent] = useState(false);
  const [staffSignature, setStaffSignature] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [notes, setNotes] = useState("");
  const [knownDefects, setKnownDefects] = useState("");
  const [additionalDefects, setAdditionalDefects] = useState("");
  const [defectPhotos, setDefectPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [itemsReceived, setItemsReceived] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [operatingHours, setOperatingHours] = useState("");
  const [fuelLevel, setFuelLevel] = useState("");
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(0);

  // Update timestamp every second while dialog is open
  useState(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  });

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setDefectPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setDefectPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadPhotos = async (profileId: string): Promise<string[]> => {
    if (defectPhotos.length === 0) return [];
    setUploadingPhotos(true);
    const urls: string[] = [];
    try {
      for (const photo of defectPhotos) {
        const ext = photo.file.name.split(".").pop() || "jpg";
        const path = `defect-photos/${profileId}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("b2b-documents")
          .upload(path, photo.file, { upsert: true });
        if (uploadError) {
          console.error("Photo upload error:", uploadError);
          continue;
        }
        const { data: signedData } = await supabase.storage
          .from("b2b-documents")
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        if (signedData?.signedUrl) urls.push(signedData.signedUrl);
      }
    } finally {
      setUploadingPhotos(false);
    }
    return urls;
  };

  const handleGenerate = async () => {
    if (!offer) return;
    if (!customerNotPresent && !customerSignature) {
      toast({ title: "Kundenunterschrift fehlt", description: "Bitte lassen Sie den Kunden unterschreiben oder aktivieren Sie 'Kunde nicht vor Ort'.", variant: "destructive" });
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
    if (!customerNotPresent && !agbAccepted) {
      toast({ title: "AGB nicht akzeptiert", description: "Der Kunde muss die AGB akzeptieren.", variant: "destructive" });
      return;
    }
    if (!customerNotPresent && !offerAccepted) {
      toast({ title: "Angebotsannahme fehlt", description: "Der Kunde muss das Angebot bestätigen.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // Upload photos first
      const photoUrls = await uploadPhotos(profile!.id);

      const { data, error } = await supabase.functions.invoke("generate-delivery-note", {
        body: {
          offer_id: offer.id,
          signature_data: customerNotPresent ? null : customerSignature,
          staff_signature_data: staffSignature,
          staff_name: staffName.trim(),
          notes: notes || undefined,
          known_defects: knownDefects || undefined,
          additional_defects: additionalDefects || undefined,
          photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
          send_email: !customerNotPresent, // Only send email if customer signed on-site
          agb_accepted: customerNotPresent ? false : true,
          operating_hours: operatingHours || undefined,
          fuel_level: fuelLevel || undefined,
          cleanliness_rating: cleanlinessRating > 0 ? cleanlinessRating : undefined,
          customer_not_present: customerNotPresent,
        },
      });

      if (error) throw error;

      const dnNumber = data.delivery_note?.delivery_note_number;
      if (customerNotPresent) {
        toast({
          title: "Übergabeprotokoll erstellt!",
          description: `${dnNumber} wurde erstellt und wartet auf die Kundenunterschrift im Portal. Sie können es jetzt herunterladen.`,
        });
      } else {
        toast({
          title: "Übergabeprotokoll erstellt!",
          description: data.email_sent
            ? `${dnNumber} wurde erstellt und per E-Mail versendet.`
            : `${dnNumber} wurde erstellt. (E-Mail nicht konfiguriert)`,
        });
      }

      setCustomerSignature(null);
      setCustomerNotPresent(false);
      setStaffSignature(null);
      setStaffName("");
      setNotes("");
      setKnownDefects("");
      setAdditionalDefects("");
      setDefectPhotos([]);
      setAgbAccepted(false);
      setOfferAccepted(false);
      setItemsReceived(false);
      setOperatingHours("");
      setFuelLevel("");
      setCleanlinessRating(0);
      onCreated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Übergabeprotokoll konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!offer || !profile) return null;

  const items = offerItems.filter((i) => i.offer_id === offer.id);
  const EQUIPMENT_KEYWORDS = ['bagger', 'dumper', 'aggregat', 'radlader', 'minibagger'];
  const needsEquipmentFields = items.some(item =>
    EQUIPMENT_KEYWORDS.some(kw => item.product_name.toLowerCase().includes(kw))
  );
  const allValid = !!staffSignature && !!staffName.trim() && (customerNotPresent || (!!customerSignature && agbAccepted && offerAccepted && itemsReceived));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Übergabeprotokoll erstellen
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

        {/* Known Defects */}
        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Mängeldokumentation
          </Label>
          <div>
            <Label className="text-xs">Bekannte Mängel (vor Übergabe)</Label>
            <Textarea
              value={knownDefects}
              onChange={(e) => setKnownDefects(e.target.value)}
              placeholder="z.B. Kratzer am Gehäuse, leichte Gebrauchsspuren am Hydraulikarm..."
              rows={2}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Weitere Mängel bei Übergabe</Label>
            <Textarea
              value={additionalDefects}
              onChange={(e) => setAdditionalDefects(e.target.value)}
              placeholder="z.B. Bei Übergabe festgestellte zusätzliche Mängel..."
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <Label className="text-xs flex items-center gap-1">
              <Camera className="h-3 w-3" />
              Fotos (Schadensdokumentation)
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoAdd}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {defectPhotos.map((photo, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={photo.preview}
                    alt={`Mangel ${idx + 1}`}
                    className="h-20 w-20 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-20 w-20 border-2 border-dashed border-muted-foreground/30 rounded-md flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span className="text-[10px]">Foto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Equipment Details (Bagger/Dumper/Aggregate) */}
        {needsEquipmentFields && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Gerätedaten bei Übergabe
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Betriebsstunden</Label>
                  <Input
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    placeholder="z.B. 1.250 Bh"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Tankfüllstand</Label>
                  <Select value={fuelLevel} onValueChange={setFuelLevel}>
                    <SelectTrigger className="text-sm h-9">
                      <SelectValue placeholder="Auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voll">Voll (100%)</SelectItem>
                      <SelectItem value="dreiviertel">¾ (75%)</SelectItem>
                      <SelectItem value="halb">½ (50%)</SelectItem>
                      <SelectItem value="viertel">¼ (25%)</SelectItem>
                      <SelectItem value="leer">Leer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Sauberkeit des Mietgerätes</Label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCleanlinessRating(n)}
                      className={`w-10 h-10 rounded-lg border-2 font-semibold text-sm transition-colors ${
                        cleanlinessRating === n
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  1 = Sehr verschmutzt · 5 = Sauber
                </p>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Notes */}
        <div>
          <Label className="text-xs">Anmerkungen (optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="z.B. besondere Hinweise, Absprachen..."
            rows={2}
            className="text-sm"
          />
        </div>

        <Separator />

        {/* Customer presence toggle */}
        <div className="flex items-start space-x-3 p-4 border-2 border-amber-300 rounded-lg bg-amber-50">
          <Checkbox
            id="customer-not-present"
            checked={customerNotPresent}
            onCheckedChange={(checked) => {
              setCustomerNotPresent(checked === true);
              if (checked) {
                setCustomerSignature(null);
                setAgbAccepted(false);
                setOfferAccepted(false);
                setItemsReceived(false);
              }
            }}
          />
          <label htmlFor="customer-not-present" className="text-sm leading-relaxed cursor-pointer">
            <strong>Kunde ist nicht vor Ort</strong> – Das Protokoll wird ohne Kundenunterschrift erstellt und dem Kunden im Portal zur digitalen Unterschrift bereitgestellt. Sie können das Protokoll trotzdem sofort herunterladen.
          </label>
        </div>

        {/* Legal Confirmations - only when customer is present */}
        {!customerNotPresent && (
          <>
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Rechtliche Bestätigungen
              </Label>

              {/* Items received confirmation */}
              <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/30">
                <Checkbox
                  id="items-received"
                  checked={itemsReceived}
                  onCheckedChange={(checked) => setItemsReceived(checked === true)}
                />
                <label htmlFor="items-received" className="text-sm leading-relaxed cursor-pointer">
                  Der Kunde bestätigt hiermit den <strong>vollständigen und ordnungsgemäßen Empfang</strong> aller 
                  oben aufgeführten Mietgegenstände. Etwaige Mängel sind in der Mängeldokumentation vermerkt.
                </label>
              </div>

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
          </>
        )}

        {customerNotPresent && (
          <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground text-center">
              📋 Das Protokoll wird dem Kunden <strong>{profile.contact_first_name} {profile.contact_last_name}</strong> im B2B-Portal zur digitalen Unterschrift bereitgestellt.
              Die AGB-Akzeptanz und Bestätigungen erfolgen dann durch den Kunden im Portal.
            </p>
          </div>
        )}

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
          <SignaturePad onSignatureChange={setStaffSignature} label="Unterschrift SLT-Mitarbeiter" />
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
                {customerNotPresent ? "Protokoll erstellen (ohne Kundenunterschrift)" : "Übergabeprotokoll erstellen & senden"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
