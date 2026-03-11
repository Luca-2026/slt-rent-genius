import { useState, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SignaturePad } from "@/components/b2b/SignaturePad";
import {
  ClipboardCheck, RefreshCw, Package, Clock, ShieldCheck,
  UserCheck, PenTool, AlertTriangle, CheckCircle2, XCircle, Camera, X, Upload, Gauge,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Reservation {
  id: string;
  product_name: string | null;
  product_id: string;
  location: string;
  start_date: string;
  end_date: string | null;
  quantity: number;
  status: string;
  b2b_profile_id: string;
}

interface B2BProfile {
  id: string;
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
}

interface ItemCondition {
  product_name: string;
  description?: string;
  quantity: number;
  condition: "good" | "minor_damage" | "major_damage" | "missing";
  condition_notes: string;
}

interface Props {
  reservation: Reservation | null;
  profile: B2BProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const conditionOptions = [
  { value: "good", label: "Gut – Keine Beanstandungen", icon: CheckCircle2, color: "text-green-600" },
  { value: "minor_damage", label: "Leichte Mängel / Gebrauchsspuren", icon: AlertTriangle, color: "text-amber-600" },
  { value: "major_damage", label: "Erhebliche Schäden", icon: XCircle, color: "text-destructive" },
] as const;

export function ReturnProtocolDialog({
  reservation,
  profile,
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [customerNotPresent, setCustomerNotPresent] = useState(false);
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);
  const [staffSignature, setStaffSignature] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [notes, setNotes] = useState("");
  const [knownDefectsFromDelivery, setKnownDefectsFromDelivery] = useState("");
  const [additionalDefectsAtReturn, setAdditionalDefectsAtReturn] = useState("");
  const [defectPhotos, setDefectPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [overallCondition, setOverallCondition] = useState<"good" | "minor_damage" | "major_damage">("good");
  const [conditionNotes, setConditionNotes] = useState("");
  const [damageDescription, setDamageDescription] = useState("");
  const [cleaningRequired, setCleaningRequired] = useState(false);
  const [allItemsReturned, setAllItemsReturned] = useState(true);
  const [missingItemsNotes, setMissingItemsNotes] = useState("");
  const [meterReadingStart, setMeterReadingStart] = useState("");
  const [meterReadingEnd, setMeterReadingEnd] = useState("");
  const [fuelLevelStart, setFuelLevelStart] = useState("");
  const [fuelLevelEnd, setFuelLevelEnd] = useState("");
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(0);
  const [currentTime] = useState(new Date());

  // Build items list from reservation
  const items: ItemCondition[] = reservation
    ? [
        {
          product_name: reservation.product_name || reservation.product_id,
          quantity: reservation.quantity,
          condition: "good" as const,
          condition_notes: "",
        },
      ]
    : [];

  const [itemConditions, setItemConditions] = useState<ItemCondition[]>(items);

  // Reset when reservation changes
  const resetForm = () => {
    setCustomerNotPresent(false);
    setCustomerSignature(null);
    setStaffSignature(null);
    setStaffName("");
    setNotes("");
    setKnownDefectsFromDelivery("");
    setAdditionalDefectsAtReturn("");
    setDefectPhotos([]);
    setOverallCondition("good");
    setConditionNotes("");
    setDamageDescription("");
    setCleaningRequired(false);
    setAllItemsReturned(true);
    setMissingItemsNotes("");
    setMeterReadingStart("");
    setMeterReadingEnd("");
    setFuelLevelStart("");
    setFuelLevelEnd("");
    setCleanlinessRating(0);
    if (reservation) {
      setItemConditions([
        {
          product_name: reservation.product_name || reservation.product_id,
          quantity: reservation.quantity,
          condition: "good",
          condition_notes: "",
        },
      ]);
    }
  };

  const updateItemCondition = (index: number, field: keyof ItemCondition, value: string) => {
    setItemConditions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos = Array.from(files).map((file) => ({
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

  const uploadPhotos = async (): Promise<string[]> => {
    if (defectPhotos.length === 0) return [];
    setUploadingPhotos(true);
    const urls: string[] = [];
    try {
      for (const photo of defectPhotos) {
        const ext = photo.file.name.split(".").pop() || "jpg";
        const path = `defect-photos/${reservation!.b2b_profile_id}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
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
    if (!reservation) return;
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

    setSaving(true);
    try {
      // Upload photos first
      const photoUrls = await uploadPhotos();

      const { data, error } = await supabase.functions.invoke("generate-return-protocol", {
        body: {
          reservation_id: reservation.id,
          customer_signature_data: customerNotPresent ? null : customerSignature,
          customer_not_present: customerNotPresent,
          staff_signature_data: staffSignature,
          staff_name: staffName.trim(),
          overall_condition: overallCondition,
          condition_notes: conditionNotes || undefined,
          damage_description: damageDescription || undefined,
          cleaning_required: cleaningRequired,
          all_items_returned: allItemsReturned,
          missing_items_notes: missingItemsNotes || undefined,
          meter_reading_start: meterReadingStart || undefined,
          meter_reading_end: meterReadingEnd || undefined,
          fuel_level_start: fuelLevelStart || undefined,
          fuel_level_end: fuelLevelEnd || undefined,
          cleanliness_rating: cleanlinessRating > 0 ? cleanlinessRating : undefined,
          known_defects_from_delivery: knownDefectsFromDelivery || undefined,
          additional_defects_at_return: additionalDefectsAtReturn || undefined,
          photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
          items: itemConditions.map((item) => ({
            product_name: item.product_name,
            description: item.description,
            quantity: item.quantity,
            condition: item.condition,
            condition_notes: item.condition_notes || undefined,
          })),
          notes: notes || undefined,
          send_email: true,
        },
      });

      if (error) throw error;

      toast({
        title: "Rückgabeprotokoll erstellt!",
        description: data.email_sent
          ? `Protokoll ${data.return_protocol?.return_protocol_number} wurde erstellt und per E-Mail versendet.`
          : `Protokoll ${data.return_protocol?.return_protocol_number} wurde erstellt. (E-Mail nicht konfiguriert)`,
      });

      resetForm();
      onCreated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Rückgabeprotokoll konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!reservation || !profile) return null;

  const EQUIPMENT_KEYWORDS = ['bagger', 'dumper', 'aggregat', 'radlader', 'minibagger'];
  const needsEquipmentFields = EQUIPMENT_KEYWORDS.some(kw =>
    (reservation.product_name || '').toLowerCase().includes(kw)
  );
  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const allValid = !!customerSignature && !!staffSignature && !!staffName.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Rückgabeprotokoll erstellen
          </DialogTitle>
          <DialogDescription>
            Rechtssichere Rückgabedokumentation mit Zustandsbewertung und beidseitiger Unterschrift.
          </DialogDescription>
        </DialogHeader>

        {/* Customer & Reservation Info */}
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
                <Badge variant="outline" className="text-primary border-primary capitalize">
                  {reservation.location}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(reservation.start_date)}
                  {reservation.end_date ? ` – ${formatDate(reservation.end_date)}` : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Items condition assessment */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4" />
            Zustandsbewertung je Artikel
          </Label>
          {itemConditions.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{item.product_name}</p>
                  <Badge variant="secondary" className="text-xs">{item.quantity}x</Badge>
                </div>
                <Select
                  value={item.condition}
                  onValueChange={(v) => updateItemCondition(index, "condition", v)}
                >
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">✓ Gut – Keine Beanstandungen</SelectItem>
                    <SelectItem value="minor_damage">⚠ Leichte Mängel / Gebrauchsspuren</SelectItem>
                    <SelectItem value="major_damage">✗ Erhebliche Schäden</SelectItem>
                    <SelectItem value="missing">✗ Fehlend / Nicht zurückgegeben</SelectItem>
                  </SelectContent>
                </Select>
                {item.condition !== "good" && (
                  <Input
                    value={item.condition_notes}
                    onChange={(e) => updateItemCondition(index, "condition_notes", e.target.value)}
                    placeholder="Beschreibung des Zustands / der Mängel..."
                    className="text-sm"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* Defect Documentation */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Mängeldokumentation
          </Label>

          <div>
            <Label className="text-xs">Bekannte Mängel (aus Übergabeprotokoll)</Label>
            <Textarea
              value={knownDefectsFromDelivery}
              onChange={(e) => setKnownDefectsFromDelivery(e.target.value)}
              placeholder="z.B. Kratzer am Gehäuse (bei Übergabe dokumentiert)..."
              rows={2}
              className="text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">Neue / zusätzliche Mängel bei Rückgabe</Label>
            <Textarea
              value={additionalDefectsAtReturn}
              onChange={(e) => setAdditionalDefectsAtReturn(e.target.value)}
              placeholder="z.B. Neue Kratzer, fehlende Teile, Funktionsstörungen..."
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <Label className="text-xs flex items-center gap-1">
              <Camera className="h-3 w-3" />
              Fotos (Mängeldokumentation)
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

        <Separator />

        {/* Overall Condition */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Gesamtbewertung
          </Label>

          <div className="grid grid-cols-1 gap-2">
            {conditionOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOverallCondition(opt.value)}
                  className={`flex items-center gap-3 p-3 border rounded-lg text-left transition-colors ${
                    overallCondition === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${opt.color}`} />
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {overallCondition !== "good" && (
            <div>
              <Label className="text-xs">Zustandsbemerkungen</Label>
              <Textarea
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                placeholder="Allgemeine Bemerkungen zum Zustand..."
                rows={2}
                className="text-sm"
              />
            </div>
          )}

          {(overallCondition === "major_damage" || overallCondition === "minor_damage") && (
            <div>
              <Label className="text-xs text-destructive">Schadensbeschreibung</Label>
              <Textarea
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                placeholder="Detaillierte Beschreibung der Schäden..."
                rows={2}
                className="text-sm"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Additional checks */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/30">
            <Checkbox
              id="cleaning"
              checked={cleaningRequired}
              onCheckedChange={(checked) => setCleaningRequired(checked === true)}
            />
            <label htmlFor="cleaning" className="text-sm leading-relaxed cursor-pointer">
              <strong>Reinigung erforderlich</strong> – Die Mietgegenstände müssen über die normale Nutzung hinaus gereinigt werden.
            </label>
          </div>

          <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/30">
            <Checkbox
              id="all-returned"
              checked={allItemsReturned}
              onCheckedChange={(checked) => setAllItemsReturned(checked === true)}
            />
            <label htmlFor="all-returned" className="text-sm leading-relaxed cursor-pointer">
              <strong>Alle Artikel vollständig zurückgegeben</strong> – Sämtliche Mietgegenstände und Zubehör wurden retourniert.
            </label>
          </div>

          {!allItemsReturned && (
            <div>
              <Label className="text-xs text-destructive">Fehlende Artikel</Label>
              <Textarea
                value={missingItemsNotes}
                onChange={(e) => setMissingItemsNotes(e.target.value)}
                placeholder="Welche Artikel / Teile fehlen?"
                rows={2}
                className="text-sm"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Equipment Details (Bagger/Dumper/Aggregate) */}
        {needsEquipmentFields && (
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Gerätedaten
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Betriebsstunden (Übergabe)</Label>
                <Input
                  value={meterReadingStart}
                  onChange={(e) => setMeterReadingStart(e.target.value)}
                  placeholder="z.B. 1.250 Bh"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Betriebsstunden (Rückgabe)</Label>
                <Input
                  value={meterReadingEnd}
                  onChange={(e) => setMeterReadingEnd(e.target.value)}
                  placeholder="z.B. 1.312 Bh"
                  className="text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tankfüllstand (Übergabe)</Label>
                <Select value={fuelLevelStart} onValueChange={setFuelLevelStart}>
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
              <div>
                <Label className="text-xs">Tankfüllstand (Rückgabe)</Label>
                <Select value={fuelLevelEnd} onValueChange={setFuelLevelEnd}>
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
        )}

        {/* Timestamp */}
        <Card className="bg-muted/50">
          <CardContent className="p-3 flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Rückgabe-Zeitstempel</p>
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
            placeholder="z.B. Absprachen zur Schlussrechnung, besondere Vereinbarungen..."
            rows={2}
            className="text-sm"
          />
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
                <ClipboardCheck className="h-4 w-4 mr-1.5" />
                Rückgabeprotokoll erstellen & senden
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
