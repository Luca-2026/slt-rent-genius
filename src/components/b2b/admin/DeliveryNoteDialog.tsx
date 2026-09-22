import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SignaturePad } from "@/components/b2b/SignaturePad";
import { ProtocolWizard, type WizardStep } from "@/components/b2b/protocols/ProtocolWizard";
import { DamagesStep } from "@/components/b2b/protocols/DamagesStep";
import { IdCheckStep } from "@/components/b2b/protocols/IdCheckStep";
import {
  CLEANLINESS_HINT, FUEL_LEVELS, isMachineLike, serializeDamages, type ProtocolDamage,
} from "@/components/b2b/protocols/protocolShared";
import { ClipboardCheck, RefreshCw, Clock, ShieldCheck, CheckCircle2, Download, Mail } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Offer, OfferItem } from "@/components/b2b/admin/AdminOffersTab";

interface DeliveryNoteDraft {
  customerSignature: string | null;
  staffSignature: string | null;
  staffName: string;
  notes: string;
  knownDefects: string;
  customerNotPresent: boolean;
  agbAccepted: boolean;
  offerAccepted: boolean;
  itemsReceived: boolean;
  idChecked: boolean;
  idDocType: string;
  operatingHours: string;
  fuelLevel: string;
  cleanlinessRating: number;
}

const deliveryNoteDraftStore: { key: string | null; data: DeliveryNoteDraft | null } = {
  key: null,
  data: null,
};

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
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);
  const [customerNotPresent, setCustomerNotPresent] = useState(false);
  const [staffSignature, setStaffSignature] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [notes, setNotes] = useState("");
  const [knownDefects, setKnownDefects] = useState("");
  const [damages, setDamages] = useState<ProtocolDamage[]>([]);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [itemsReceived, setItemsReceived] = useState(false);
  const [idChecked, setIdChecked] = useState(false);
  const [idDocType, setIdDocType] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [operatingHours, setOperatingHours] = useState("");
  const [fuelLevel, setFuelLevel] = useState("");
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(0);
  const [result, setResult] = useState<{ number: string; fileUrl: string | null; emailSent: boolean } | null>(null);
  const [resending, setResending] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const lastInitKey = useRef<string | null>(null);

  const resetForm = useCallback(() => {
    setCustomerSignature(null);
    setCustomerNotPresent(false);
    setStaffSignature(null);
    setStaffName("");
    setNotes("");
    setKnownDefects("");
    setDamages([]);
    setAgbAccepted(false);
    setOfferAccepted(false);
    setItemsReceived(false);
    setIdChecked(false);
    setIdDocType("");
    setOperatingHours("");
    setFuelLevel("");
    setCleanlinessRating(0);
  }, []);

  const saveDraft = useCallback(() => {
    if (!open || !offer) return;
    deliveryNoteDraftStore.key = offer.id;
    deliveryNoteDraftStore.data = {
      customerSignature, staffSignature, staffName, notes, knownDefects,
      customerNotPresent, agbAccepted, offerAccepted, itemsReceived,
      idChecked, idDocType, operatingHours, fuelLevel, cleanlinessRating,
    };
  }, [open, offer, customerSignature, staffSignature, staffName, notes, knownDefects, customerNotPresent, agbAccepted, offerAccepted, itemsReceived, idChecked, idDocType, operatingHours, fuelLevel, cleanlinessRating]);

  useEffect(() => { saveDraft(); }, [saveDraft]);

  useEffect(() => {
    if (!open) {
      lastInitKey.current = null;
      setResult(null);
      setCreatedId(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !offer) return;
    const contextKey = offer.id;
    if (lastInitKey.current === contextKey) return;
    lastInitKey.current = contextKey;

    if (deliveryNoteDraftStore.key === contextKey && deliveryNoteDraftStore.data) {
      const d = deliveryNoteDraftStore.data;
      setCustomerSignature(d.customerSignature);
      setStaffSignature(d.staffSignature);
      setStaffName(d.staffName);
      setNotes(d.notes);
      setKnownDefects(d.knownDefects);
      setCustomerNotPresent(d.customerNotPresent);
      setAgbAccepted(d.agbAccepted);
      setOfferAccepted(d.offerAccepted);
      setItemsReceived(d.itemsReceived);
      setIdChecked(d.idChecked);
      setIdDocType(d.idDocType);
      setOperatingHours(d.operatingHours);
      setFuelLevel(d.fuelLevel);
      setCleanlinessRating(d.cleanlinessRating);
      return;
    }

    resetForm();
  }, [open, offer, resetForm]);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [open]);

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });

  const handleGenerate = async () => {
    if (!offer || !profile) return;
    setSaving(true);
    try {
      const damagePayload = await serializeDamages(profile.id, damages);

      const { data, error } = await supabase.functions.invoke("generate-delivery-note", {
        body: {
          offer_id: offer.id,
          signature_data: customerNotPresent ? null : customerSignature,
          staff_signature_data: staffSignature,
          staff_name: staffName.trim(),
          notes: notes || undefined,
          known_defects: knownDefects || undefined,
          damages: damagePayload,
          send_email: !customerNotPresent,
          agb_accepted: customerNotPresent ? false : true,
          id_checked: idChecked,
          id_check_type: idDocType || undefined,
          operating_hours: operatingHours || undefined,
          fuel_level: fuelLevel || undefined,
          cleanliness_rating: cleanlinessRating > 0 ? cleanlinessRating : undefined,
          customer_not_present: customerNotPresent,
        },
      });

      if (error) throw error;

      setResult({
        number: data.delivery_note?.delivery_note_number,
        fileUrl: data.delivery_note?.file_url || null,
        emailSent: !!data.email_sent,
      });
      setCreatedId(data.delivery_note?.id || null);

      deliveryNoteDraftStore.key = null;
      deliveryNoteDraftStore.data = null;
      onCreated();
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

  const sendToCustomer = async () => {
    if (!createdId) return;
    setResending(true);
    try {
      const { data, error } = await supabase.functions.invoke("resend-protocol-email", {
        body: { type: "delivery_note", id: createdId },
      });
      if (error) throw error;
      toast({ title: "Protokoll versendet", description: `E-Mail an ${data?.recipient || "den Kunden"} gesendet.` });
      setResult((r) => (r ? { ...r, emailSent: true } : r));
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message || "E-Mail konnte nicht gesendet werden.", variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  if (!offer || !profile) return null;

  const items = offerItems.filter((i) => i.offer_id === offer.id);
  const itemNames = items.map((i) => i.product_name);
  const needsEquipmentFields = isMachineLike(itemNames);
  const customerName = `${profile.contact_first_name} ${profile.contact_last_name}`.trim();

  const legalDone = customerNotPresent || (agbAccepted && offerAccepted && itemsReceived);
  const signaturesDone = !!staffSignature && !!staffName.trim() && (customerNotPresent || !!customerSignature);
  const equipmentDone = !needsEquipmentFields ? cleanlinessRating > 0 : (!!operatingHours && !!fuelLevel && cleanlinessRating > 0);
  const allValid = legalDone && signaturesDone && idChecked;

  const missing: string[] = [];
  if (!idChecked) missing.push("Personalausweis abgleichen");
  if (!legalDone) missing.push("rechtliche Bestätigungen");
  if (!signaturesDone) missing.push("Unterschriften und Mitarbeitername");

  const steps: WizardStep[] = [
    {
      id: "items",
      title: "Artikel prüfen",
      summary: `${items.length} Position${items.length === 1 ? "" : "en"}`,
      done: true,
      content: (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{item.product_name}</p>
                  {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                  {item.rental_start && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.rental_start)}{item.rental_end ? ` – ${formatDate(item.rental_end)}` : ""}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">{item.quantity}x</Badge>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-muted/50">
            <CardContent className="p-3 flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Übergabe-Zeitstempel</p>
                <p className="text-sm font-medium">{format(currentTime, "dd.MM.yyyy, HH:mm:ss", { locale: de })} Uhr</p>
              </div>
            </CardContent>
          </Card>
          <div>
            <Label className="text-xs">Bekannte Mängel vor Übergabe (optional)</Label>
            <Textarea
              value={knownDefects}
              onChange={(e) => setKnownDefects(e.target.value)}
              placeholder="z. B. Kratzer am Gehäuse, Gebrauchsspuren am Hydraulikarm"
              rows={2}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Anmerkungen (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z. B. besondere Hinweise, Absprachen"
              rows={2}
              className="text-sm"
            />
          </div>
        </div>
      ),
    },
    {
      id: "equipment",
      title: "Gerätedaten",
      summary: needsEquipmentFields
        ? `Betriebsstunden, Tank, Sauberkeit${cleanlinessRating ? ` ${cleanlinessRating}/5` : ""}`
        : `Sauberkeit${cleanlinessRating ? ` ${cleanlinessRating}/5` : " 1–5"}`,
      done: equipmentDone,
      content: (
        <div className="space-y-3">
          {needsEquipmentFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Betriebsstunden</Label>
                <Input
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="z. B. 1.250 Bh"
                  inputMode="decimal"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Tankfüllstand</Label>
                <Select value={fuelLevel} onValueChange={setFuelLevel}>
                  <SelectTrigger className="text-sm h-10"><SelectValue placeholder="Auswählen" /></SelectTrigger>
                  <SelectContent>
                    {FUEL_LEVELS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div>
            <Label className="text-xs">Sauberkeit des Mietgerätes</Label>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCleanlinessRating(n)}
                  className={`h-11 w-11 rounded-lg border-2 font-semibold text-sm transition-colors ${
                    cleanlinessRating === n ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{CLEANLINESS_HINT}</p>
          </div>
          {!needsEquipmentFields && (
            <p className="text-xs text-muted-foreground">
              Betriebsstunden und Tankfüllstand erscheinen nur bei Maschinen mit Motor.
            </p>
          )}
        </div>
      ),
    },
    {
      id: "damages",
      title: "Schäden",
      optional: true,
      summary: damages.length ? `${damages.length} erfasst` : "Neuen Schaden hinzufügen",
      done: damages.length > 0,
      content: (
        <DamagesStep
          damages={damages}
          onChange={setDamages}
          itemNames={itemNames}
          context="die bei der Übergabe bereits vorhanden sind"
        />
      ),
    },
    {
      id: "id",
      title: "Personalausweis abgleichen",
      summary: idChecked ? "Abgeglichen" : "Pflichtschritt",
      done: idChecked,
      content: (
        <IdCheckStep
          checked={idChecked}
          onCheckedChange={setIdChecked}
          docType={idDocType}
          onDocTypeChange={setIdDocType}
          customerName={customerName}
        />
      ),
    },
    {
      id: "legal",
      title: "Bestätigungen",
      summary: customerNotPresent ? "Kunde nicht vor Ort" : legalDone ? "Vollständig" : "AGB, Angebot, Empfang",
      done: legalDone,
      content: (
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 border-2 border-amber-300 rounded-lg bg-amber-50">
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
              <strong>Kunde ist nicht vor Ort</strong> – Das Protokoll wird ohne Kundenunterschrift erstellt und dem
              Kunden im Portal zur digitalen Unterschrift bereitgestellt.
            </label>
          </div>

          {!customerNotPresent && (
            <>
              <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/30">
                <Checkbox id="items-received" checked={itemsReceived} onCheckedChange={(c) => setItemsReceived(c === true)} />
                <label htmlFor="items-received" className="text-sm leading-relaxed cursor-pointer">
                  Der Kunde bestätigt den <strong>vollständigen und ordnungsgemäßen Empfang</strong> aller aufgeführten
                  Mietgegenstände. Etwaige Mängel sind dokumentiert.
                </label>
              </div>
              <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/30">
                <Checkbox id="offer-accept" checked={offerAccepted} onCheckedChange={(c) => setOfferAccepted(c === true)} />
                <label htmlFor="offer-accept" className="text-sm leading-relaxed cursor-pointer">
                  Der Kunde bestätigt die Annahme des Angebots <strong>{offer.offer_number}</strong> der
                  SLT Technology Group GmbH & Co. KG und erkennt die enthaltenen Konditionen als verbindlich an
                  (§§ 145 ff. BGB).
                </label>
              </div>
              <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/30">
                <Checkbox id="agb-accept" checked={agbAccepted} onCheckedChange={(c) => setAgbAccepted(c === true)} />
                <label htmlFor="agb-accept" className="text-sm leading-relaxed cursor-pointer">
                  Der Kunde erklärt, die{" "}
                  <a href="/agb" target="_blank" className="text-primary underline">Allgemeinen Geschäftsbedingungen</a>{" "}
                  zur Kenntnis genommen und anerkannt zu haben. Der Mietgegenstand ist pfleglich zu behandeln und im
                  übernommenen Zustand zurückzugeben.
                </label>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      id: "signature",
      title: "Unterschrift",
      summary: signaturesDone ? "Erfasst" : "Kunde und Mitarbeiter",
      done: signaturesDone,
      content: (
        <div className="space-y-4">
          {!customerNotPresent && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Unterschrift Mieter</Label>
              <p className="text-xs text-muted-foreground">{customerName} – {profile.company_name}</p>
              <SignaturePad onSignatureChange={setCustomerSignature} height={180} />
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-xs">Name des Mitarbeiters *</Label>
            <Input
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Vor- und Nachname"
              className="text-sm"
            />
            <SignaturePad onSignatureChange={setStaffSignature} height={180} label="Unterschrift SLT-Mitarbeiter" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Übergabe handhaben
          </DialogTitle>
          <DialogDescription>
            {profile.company_name} · {offer.offer_number}
            {reservation ? ` · Standort ${reservation.location}` : ""}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
            <div>
              <p className="font-semibold">Übergabeprotokoll {result.number} erstellt</p>
              <p className="text-sm text-muted-foreground">
                {result.emailSent ? "Das Protokoll wurde an den Kunden gesendet." : "Das Protokoll wurde noch nicht versendet."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-center">
              {result.fileUrl && (
                <Button variant="outline" asChild>
                  <a href={result.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-1.5" />
                    Protokoll herunterladen
                  </a>
                </Button>
              )}
              <Button onClick={sendToCustomer} disabled={resending || !createdId}>
                {resending ? <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" /> : <Mail className="h-4 w-4 mr-1.5" />}
                {result.emailSent ? "Erneut an Kunden senden" : "An Kunden senden"}
              </Button>
              <Button variant="ghost" onClick={() => { resetForm(); onOpenChange(false); }}>Schließen</Button>
            </div>
          </div>
        ) : (
          <ProtocolWizard
            steps={steps}
            missingHint={missing.length ? missing.join(", ") : null}
            footer={
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                  Abbrechen
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={saving || !allValid}
                  className="bg-accent text-accent-foreground hover:bg-cta-orange-hover w-full sm:w-auto"
                >
                  {saving ? (
                    <><RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />Wird erstellt...</>
                  ) : (
                    <><ShieldCheck className="h-4 w-4 mr-1.5" />Übergabe abschließen</>
                  )}
                </Button>
              </div>
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
