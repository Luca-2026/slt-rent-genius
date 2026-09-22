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
import { ExtraChargesStep } from "@/components/b2b/protocols/ExtraChargesStep";
import { IdCheckStep } from "@/components/b2b/protocols/IdCheckStep";
import {
  CLEANLINESS_HINT, FUEL_LEVELS, formatEuro, isMachineLike, serializeDamages,
  serializeExtraCharges, sumDamages, sumExtraCharges,
  type ExtraCharge, type ProtocolDamage,
} from "@/components/b2b/protocols/protocolShared";
import {
  ClipboardCheck, RefreshCw, Clock, ShieldCheck, CheckCircle2, Download, Mail,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ItemCondition {
  product_name: string;
  description?: string;
  quantity: number;
  condition: "good" | "minor_damage" | "major_damage" | "missing";
  condition_notes: string;
}

interface ReturnProtocolDraft {
  customerSignature: string | null;
  staffSignature: string | null;
  staffName: string;
  notes: string;
  knownDefectsFromDelivery: string;
  customerNotPresent: boolean;
  overallCondition: "good" | "minor_damage" | "major_damage";
  conditionNotes: string;
  cleaningRequired: boolean;
  allItemsReturned: boolean;
  missingItemsNotes: string;
  meterReadingStart: string;
  meterReadingEnd: string;
  fuelLevelStart: string;
  fuelLevelEnd: string;
  cleanlinessRating: number;
  idChecked: boolean;
  idDocType: string;
  itemConditions: ItemCondition[];
}

const returnProtocolDraftStore: { key: string | null; data: ReturnProtocolDraft | null } = {
  key: null,
  data: null,
};

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

interface Props {
  reservation: Reservation | null;
  profile: B2BProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

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
  const [damages, setDamages] = useState<ProtocolDamage[]>([]);
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>([]);
  const [overallCondition, setOverallCondition] = useState<"good" | "minor_damage" | "major_damage">("good");
  const [conditionNotes, setConditionNotes] = useState("");
  const [cleaningRequired, setCleaningRequired] = useState(false);
  const [allItemsReturned, setAllItemsReturned] = useState(true);
  const [missingItemsNotes, setMissingItemsNotes] = useState("");
  const [meterReadingStart, setMeterReadingStart] = useState("");
  const [meterReadingEnd, setMeterReadingEnd] = useState("");
  const [fuelLevelStart, setFuelLevelStart] = useState("");
  const [fuelLevelEnd, setFuelLevelEnd] = useState("");
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(0);
  const [idChecked, setIdChecked] = useState(false);
  const [idDocType, setIdDocType] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [itemConditions, setItemConditions] = useState<ItemCondition[]>([]);
  const [result, setResult] = useState<{ number: string; fileUrl: string | null; emailSent: boolean } | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const lastInitKey = useRef<string | null>(null);

  const baseItems = useCallback((): ItemCondition[] => {
    if (!reservation) return [];
    return [{
      product_name: reservation.product_name || reservation.product_id,
      quantity: reservation.quantity || 1,
      condition: "good",
      condition_notes: "",
    }];
  }, [reservation]);

  const resetForm = useCallback(() => {
    setCustomerNotPresent(false);
    setCustomerSignature(null);
    setStaffSignature(null);
    setStaffName("");
    setNotes("");
    setKnownDefectsFromDelivery("");
    setDamages([]);
    setExtraCharges([]);
    setOverallCondition("good");
    setConditionNotes("");
    setCleaningRequired(false);
    setAllItemsReturned(true);
    setMissingItemsNotes("");
    setMeterReadingStart("");
    setMeterReadingEnd("");
    setFuelLevelStart("");
    setFuelLevelEnd("");
    setCleanlinessRating(0);
    setIdChecked(false);
    setIdDocType("");
    setItemConditions(baseItems());
  }, [baseItems]);

  const saveDraft = useCallback(() => {
    if (!open || !reservation) return;
    returnProtocolDraftStore.key = reservation.id;
    returnProtocolDraftStore.data = {
      customerSignature, staffSignature, staffName, notes, knownDefectsFromDelivery,
      customerNotPresent, overallCondition, conditionNotes, cleaningRequired,
      allItemsReturned, missingItemsNotes, meterReadingStart, meterReadingEnd,
      fuelLevelStart, fuelLevelEnd, cleanlinessRating, idChecked, idDocType, itemConditions,
    };
  }, [open, reservation, customerSignature, staffSignature, staffName, notes, knownDefectsFromDelivery, customerNotPresent, overallCondition, conditionNotes, cleaningRequired, allItemsReturned, missingItemsNotes, meterReadingStart, meterReadingEnd, fuelLevelStart, fuelLevelEnd, cleanlinessRating, idChecked, idDocType, itemConditions]);

  useEffect(() => { saveDraft(); }, [saveDraft]);

  useEffect(() => {
    if (!open) {
      lastInitKey.current = null;
      setResult(null);
      setCreatedId(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !reservation) return;
    const contextKey = reservation.id;
    if (lastInitKey.current === contextKey) return;
    lastInitKey.current = contextKey;

    if (returnProtocolDraftStore.key === contextKey && returnProtocolDraftStore.data) {
      const d = returnProtocolDraftStore.data;
      setCustomerSignature(d.customerSignature);
      setStaffSignature(d.staffSignature);
      setStaffName(d.staffName);
      setNotes(d.notes);
      setKnownDefectsFromDelivery(d.knownDefectsFromDelivery);
      setCustomerNotPresent(d.customerNotPresent);
      setOverallCondition(d.overallCondition);
      setConditionNotes(d.conditionNotes);
      setCleaningRequired(d.cleaningRequired);
      setAllItemsReturned(d.allItemsReturned);
      setMissingItemsNotes(d.missingItemsNotes);
      setMeterReadingStart(d.meterReadingStart);
      setMeterReadingEnd(d.meterReadingEnd);
      setFuelLevelStart(d.fuelLevelStart);
      setFuelLevelEnd(d.fuelLevelEnd);
      setCleanlinessRating(d.cleanlinessRating);
      setIdChecked(d.idChecked);
      setIdDocType(d.idDocType);
      setItemConditions(d.itemConditions?.length ? d.itemConditions : baseItems());
      return;
    }

    resetForm();
  }, [open, reservation, resetForm, baseItems]);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [open]);

  const updateItemCondition = (index: number, field: keyof ItemCondition, value: string) => {
    setItemConditions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value } as ItemCondition;
      return updated;
    });
  };

  const handleGenerate = async () => {
    if (!reservation || !profile) return;
    setSaving(true);
    try {
      const damagePayload = await serializeDamages(profile.id, damages);
      const chargePayload = serializeExtraCharges(extraCharges);

      const { data, error } = await supabase.functions.invoke("generate-return-protocol", {
        body: {
          reservation_id: reservation.id,
          customer_signature_data: customerNotPresent ? null : customerSignature,
          customer_not_present: customerNotPresent,
          staff_signature_data: staffSignature,
          staff_name: staffName.trim(),
          overall_condition: overallCondition,
          condition_notes: conditionNotes || undefined,
          cleaning_required: cleaningRequired,
          all_items_returned: allItemsReturned,
          missing_items_notes: missingItemsNotes || undefined,
          meter_reading_start: meterReadingStart || undefined,
          meter_reading_end: meterReadingEnd || undefined,
          fuel_level_start: fuelLevelStart || undefined,
          fuel_level_end: fuelLevelEnd || undefined,
          cleanliness_rating: cleanlinessRating > 0 ? cleanlinessRating : undefined,
          known_defects_from_delivery: knownDefectsFromDelivery || undefined,
          id_checked: idChecked,
          id_check_type: idDocType || undefined,
          damages: damagePayload,
          extra_charges: chargePayload,
          items: itemConditions.map((item) => ({
            product_name: item.product_name,
            description: item.description,
            quantity: item.quantity,
            condition: item.condition,
            condition_notes: item.condition_notes || undefined,
          })),
          notes: notes || undefined,
          send_email: !customerNotPresent,
        },
      });

      if (error) throw error;

      setResult({
        number: data.return_protocol?.return_protocol_number,
        fileUrl: data.return_protocol?.file_url || null,
        emailSent: !!data.email_sent,
      });
      setCreatedId(data.return_protocol?.id || null);

      returnProtocolDraftStore.key = null;
      returnProtocolDraftStore.data = null;
      onCreated();
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

  const sendToCustomer = async () => {
    if (!createdId) return;
    setResending(true);
    try {
      const { data, error } = await supabase.functions.invoke("resend-protocol-email", {
        body: { type: "return_protocol", id: createdId },
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

  if (!reservation || !profile) return null;

  const productName = reservation.product_name || reservation.product_id;
  const needsEquipmentFields = isMachineLike([productName]);
  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const customerName = `${profile.contact_first_name} ${profile.contact_last_name}`.trim();

  const signaturesDone = !!staffSignature && !!staffName.trim() && (customerNotPresent || !!customerSignature);
  const equipmentDone = needsEquipmentFields
    ? !!meterReadingEnd && !!fuelLevelEnd && cleanlinessRating > 0
    : cleanlinessRating > 0;
  const allValid = signaturesDone && idChecked;

  const missing: string[] = [];
  if (!idChecked) missing.push("Personalausweis abgleichen");
  if (!signaturesDone) missing.push("Unterschriften und Mitarbeitername");

  const chargesSum = sumExtraCharges(extraCharges);
  const damagesSum = sumDamages(damages);

  const steps: WizardStep[] = [
    {
      id: "items",
      title: "Artikel prüfen",
      summary: `${itemConditions.length} Position${itemConditions.length === 1 ? "" : "en"}`,
      done: true,
      content: (
        <div className="space-y-3">
          <Card className="bg-muted/50">
            <CardContent className="p-3 flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Mietzeitraum: {formatDate(reservation.start_date)}
                  {reservation.end_date ? ` – ${formatDate(reservation.end_date)}` : ""}
                </p>
                <p className="text-sm font-medium">
                  Rückgabe: {format(currentTime, "dd.MM.yyyy, HH:mm", { locale: de })} Uhr
                </p>
              </div>
            </CardContent>
          </Card>

          {itemConditions.map((item, idx) => (
            <Card key={idx}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-sm">{item.product_name}</p>
                  <Badge variant="secondary" className="text-xs shrink-0">{item.quantity}x</Badge>
                </div>
                <div>
                  <Label className="text-xs">Zustand</Label>
                  <Select value={item.condition} onValueChange={(v) => updateItemCondition(idx, "condition", v)}>
                    <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Gut – keine Beanstandungen</SelectItem>
                      <SelectItem value="minor_damage">Leichte Mängel / Gebrauchsspuren</SelectItem>
                      <SelectItem value="major_damage">Erhebliche Schäden</SelectItem>
                      <SelectItem value="missing">Fehlt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Anmerkung (optional)</Label>
                  <Input
                    value={item.condition_notes}
                    onChange={(e) => updateItemCondition(idx, "condition_notes", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <div>
            <Label className="text-xs">Gesamtzustand</Label>
            <Select value={overallCondition} onValueChange={(v: any) => setOverallCondition(v)}>
              <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Gut – keine Beanstandungen</SelectItem>
                <SelectItem value="minor_damage">Leichte Mängel / Gebrauchsspuren</SelectItem>
                <SelectItem value="major_damage">Erhebliche Schäden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/30">
            <Checkbox
              id="all-returned"
              checked={allItemsReturned}
              onCheckedChange={(c) => setAllItemsReturned(c === true)}
            />
            <label htmlFor="all-returned" className="text-sm cursor-pointer">
              Alle Mietgegenstände inklusive Zubehör wurden vollständig zurückgegeben.
            </label>
          </div>

          {!allItemsReturned && (
            <div>
              <Label className="text-xs">Fehlende Gegenstände</Label>
              <Textarea
                value={missingItemsNotes}
                onChange={(e) => setMissingItemsNotes(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
          )}

          <div>
            <Label className="text-xs">Bekannte Mängel aus der Übergabe (optional)</Label>
            <Textarea
              value={knownDefectsFromDelivery}
              onChange={(e) => setKnownDefectsFromDelivery(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">Anmerkungen (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-sm" />
          </div>
        </div>
      ),
    },
    {
      id: "equipment",
      title: "Gerätedaten",
      summary: needsEquipmentFields
        ? `Betriebsstunden und Tank bei Rückgabe${cleanlinessRating ? ` · Sauberkeit ${cleanlinessRating}/5` : ""}`
        : `Sauberkeit${cleanlinessRating ? ` ${cleanlinessRating}/5` : " 1–5"}`,
      done: equipmentDone,
      content: (
        <div className="space-y-3">
          {needsEquipmentFields && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Betriebsstunden bei Übergabe</Label>
                  <Input value={meterReadingStart} onChange={(e) => setMeterReadingStart(e.target.value)} inputMode="decimal" className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Betriebsstunden bei Rückgabe</Label>
                  <Input value={meterReadingEnd} onChange={(e) => setMeterReadingEnd(e.target.value)} inputMode="decimal" className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Tank bei Übergabe</Label>
                  <Select value={fuelLevelStart} onValueChange={setFuelLevelStart}>
                    <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Auswählen" /></SelectTrigger>
                    <SelectContent>
                      {FUEL_LEVELS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Tank bei Rückgabe</Label>
                  <Select value={fuelLevelEnd} onValueChange={setFuelLevelEnd}>
                    <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Auswählen" /></SelectTrigger>
                    <SelectContent>
                      {FUEL_LEVELS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
          <div>
            <Label className="text-xs">Sauberkeit bei Rückgabe</Label>
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
          <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/30">
            <Checkbox id="cleaning" checked={cleaningRequired} onCheckedChange={(c) => setCleaningRequired(c === true)} />
            <label htmlFor="cleaning" className="text-sm cursor-pointer">
              Reinigung erforderlich – wird als Zusatzkosten berechnet.
            </label>
          </div>
          <div>
            <Label className="text-xs">Zustandsanmerkungen (optional)</Label>
            <Textarea value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} rows={2} className="text-sm" />
          </div>
        </div>
      ),
    },
    {
      id: "damages",
      title: "Schäden",
      optional: true,
      summary: damages.length ? `${damages.length} erfasst · ${formatEuro(damagesSum)}` : "Neuen Schaden hinzufügen",
      done: damages.length > 0,
      content: (
        <DamagesStep
          damages={damages}
          onChange={setDamages}
          itemNames={itemConditions.map((i) => i.product_name)}
          context="die bei der Rückgabe neu festgestellt wurden"
          showAmounts
        />
      ),
    },
    {
      id: "charges",
      title: "Zusatzkosten",
      optional: true,
      summary: extraCharges.length ? formatEuro(chargesSum) : "Reinigung, Kraftstoff, Verspätung …",
      done: extraCharges.length > 0,
      content: <ExtraChargesStep charges={extraCharges} onChange={setExtraCharges} />,
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
      id: "signature",
      title: "Unterschrift",
      summary: signaturesDone ? "Erfasst" : "Kunde und Mitarbeiter",
      done: signaturesDone,
      content: (
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 border-2 border-amber-300 rounded-lg bg-amber-50">
            <Checkbox
              id="return-customer-not-present"
              checked={customerNotPresent}
              onCheckedChange={(c) => {
                setCustomerNotPresent(c === true);
                if (c) setCustomerSignature(null);
              }}
            />
            <label htmlFor="return-customer-not-present" className="text-sm leading-relaxed cursor-pointer">
              <strong>Kunde ist nicht vor Ort</strong> – das Protokoll wird zur digitalen Unterschrift im Portal
              bereitgestellt.
            </label>
          </div>
          {!customerNotPresent && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Unterschrift Mieter</Label>
              <p className="text-xs text-muted-foreground">{customerName} – {profile.company_name}</p>
              <SignaturePad onSignatureChange={setCustomerSignature} height={180} />
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-xs">Name des Mitarbeiters *</Label>
            <Input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Vor- und Nachname" className="text-sm" />
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
            Rückgabe handhaben
          </DialogTitle>
          <DialogDescription>
            {profile.company_name} · {productName} · Standort {reservation.location}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
            <div>
              <p className="font-semibold">Rückgabeprotokoll {result.number} erstellt</p>
              <p className="text-sm text-muted-foreground">
                {result.emailSent ? "Das Protokoll wurde an den Kunden gesendet." : "Das Protokoll wurde noch nicht versendet."}
              </p>
              {(chargesSum > 0 || damagesSum > 0) && (
                <p className="text-sm mt-2">
                  Für die Rechnung vorgemerkt: {formatEuro(chargesSum + damagesSum)}
                </p>
              )}
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
                    <><ShieldCheck className="h-4 w-4 mr-1.5" />Rückgabe abschließen</>
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
