/**
 * Übergabe- bzw. Rückgabeprotokoll zu einer Mietanfrage (Privat- und Firmenkunden).
 * Geführter Ablauf, am Handy ein Schritt pro Bildschirm, Unterschrift per Finger.
 * Bis zu 15 Fotos (Zustand + Schäden) mit Zeitstempel. PDF erzeugt der Server.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SignaturePad } from "@/components/b2b/SignaturePad";
import { ProtocolWizard, type WizardStep } from "@/components/b2b/protocols/ProtocolWizard";
import { DamagesStep } from "@/components/b2b/protocols/DamagesStep";
import { IdCheckStep } from "@/components/b2b/protocols/IdCheckStep";
import { CLEANLINESS_HINT, FUEL_LEVELS, isMachineLike, toNumber, type ProtocolDamage } from "@/components/b2b/protocols/protocolShared";
import {
  MAX_PROTOCOL_PHOTOS, formatPhotoTimestamp, photoTakenAt, protocolItemsFromInquiry, remainingPhotoSlots, type ProtocolKind,
} from "@/lib/rentalProtocol";
import { MeasurementFields, emptyMeasurement, validMeasurement, selectedMeasurement, type Measurement } from "@/components/b2b/protocols/MeasurementFields";
import { prepareProtocolPhoto, protocolPhotoBase64 } from "@/lib/imageCompress";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useAuth } from "@/hooks/useAuth";
import { deleteProtocolDraft, readProtocolDraft, writeProtocolDraft } from "@/lib/protocolDraft";
import type { RentalInquiry } from "@/components/b2b/inquiries/types";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";
import { Camera, CheckCircle2, Clock, Download, Loader2, Upload, X } from "lucide-react";

interface GeneralPhoto { id: string; file: File; preview: string; caption: string }
type SavedPhoto = Omit<GeneralPhoto, "preview">;
interface SavedProtocol {
  idChecked: boolean; idDocType: string; cleanliness: number;
  readings: Record<number, Measurement>;
  machineIdx: number[]; instructed: boolean; knownDefects: string; notes: string;
  allReturned: boolean; missingNotes: string; photos: SavedPhoto[];
  damages: (Omit<ProtocolDamage, "photos"> & { photos: { file: File }[] })[];
  agbAccepted: boolean; itemsConfirmed: boolean; customerNotPresent: boolean;
  signerName: string; customerSignature: string | null; staffName: string;
  staffSignature: string | null; sendEmail: boolean;
}

interface Props {
  kind: ProtocolKind;
  inquiry: RentalInquiry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const fmtDate = (v: string | null | undefined) => (v ? new Date(v.slice(0, 10)).toLocaleDateString("de-DE") : "—");

function SignatureBlock({ title, value, onChange }: { title: string; value: string | null; onChange: (v: string | null) => void }) {
  return value ? (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      <div className="rounded-lg border bg-card p-2 flex items-center justify-between gap-3">
        <img src={value} alt={title} className="h-16 max-w-[70%] object-contain bg-white rounded" />
        <Button type="button" variant="outline" size="sm" onClick={() => onChange(null)}>Neu unterschreiben</Button>
      </div>
    </div>
  ) : (
    <SignaturePad label={title} height={170} onSignatureChange={onChange} />
  );
}

export function RentalProtocolDialog({ kind, inquiry, open, onOpenChange, onCreated }: Props) {
  const { displayName } = useStaffAccess();
  const { user } = useAuth();
  const isReturn = kind === "return";
  const label = isReturn ? "Rückgabeprotokoll" : "Übergabeprotokoll";

  const [idChecked, setIdChecked] = useState(false);
  const [idDocType, setIdDocType] = useState("");
  const [cleanliness, setCleanliness] = useState(0);
  const [readings, setReadings] = useState<Record<number, Measurement>>({});
  const [machineIdx, setMachineIdx] = useState<number[]>([]);
  const [cms, setCms] = useState<Record<string, { id: string; hours: boolean; tank: boolean }>>({});
  const [prevReadings, setPrevReadings] = useState<Record<string, { hours: number | null; fuel: string | null; mileage: number | null }>>({});
  const [instructed, setInstructed] = useState(false);
  const [knownDefects, setKnownDefects] = useState("");
  const [notes, setNotes] = useState("");
  const [allReturned, setAllReturned] = useState(true);
  const [missingNotes, setMissingNotes] = useState("");
  const [photos, setPhotos] = useState<GeneralPhoto[]>([]);
  const [damages, setDamages] = useState<ProtocolDamage[]>([]);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [itemsConfirmed, setItemsConfirmed] = useState(false);
  const [customerNotPresent, setCustomerNotPresent] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffSignature, setStaffSignature] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<{ number: string; fileUrl: string | null; emailSent: boolean; recipient: string | null } | null>(null);
  const [now, setNow] = useState(new Date());
  const fileRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);
  const initFor = useRef<string | null>(null);
  const [readyFor, setReadyFor] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const completed = useRef(false);
  const draftKey = user && inquiry ? `protocol:v1:${user.id}:${kind}:${inquiry.id}` : null;

  // Formular je Auftrag wiederherstellen. Fotos bleiben als echte Dateien im lokalen IndexedDB.
  useEffect(() => {
    if (!open || !inquiry || !draftKey) return;
    const key = draftKey;
    if (initFor.current === key) return;
    initFor.current = key;
    completed.current = false;
    setReadyFor(null);
    let cancelled = false;
    setIdChecked(false); setIdDocType(""); setCleanliness(0); setReadings({}); setInstructed(false);
    const its = protocolItemsFromInquiry(inquiry as never);
    setMachineIdx(its.map((it, i) => (isMachineLike([it.name]) ? i : -1)).filter((i) => i >= 0));
    setCms({}); setPrevReadings({});
    // Maschinen-Einstellung aus dem CMS laden (Betriebsstunden / Tank je Artikel)
    const names = Array.from(new Set(its.map((it) => it.name)));
    if (names.length) {
      supabase.from("b2b_managed_products").select("id,name,tracks_operating_hours,has_fuel_tank").in("name", names).then(({ data }) => {
        const map: Record<string, { id: string; hours: boolean; tank: boolean }> = {};
        for (const r of data ?? []) map[r.name.trim().toLowerCase()] = { id: r.id, hours: !!r.tracks_operating_hours, tank: !!r.has_fuel_tank };
        setCms(map);
        setMachineIdx((current) => current.length ? current : its.map((it, i) => {
          const c = map[it.name.trim().toLowerCase()];
          return (c ? c.hours : isMachineLike([it.name])) ? i : -1;
        }).filter((i) => i >= 0));
      });
    }
    if (kind === "return") {
      supabase.from("b2b_operating_hours_readings").select("product_name,operating_hours,fuel_level,mileage_km").eq("rental_inquiry_id", inquiry.id).eq("kind", "delivery").then(({ data }) => {
        const m: Record<string, { hours: number | null; fuel: string | null }> = {};
        for (const r of data ?? []) m[r.product_name.trim().toLowerCase()] = { hours: r.operating_hours, fuel: r.fuel_level, mileage: r.mileage_km };
        setPrevReadings(m);
      });
    }
    setKnownDefects(""); setNotes(""); setAllReturned(true); setMissingNotes(""); setPhotos([]); setDamages([]);
    setAgbAccepted(false); setItemsConfirmed(false); setCustomerNotPresent(false);
    setSignerName(inquiry.company_name ? inquiry.customer_name ?? "" : inquiry.customer_name ?? "");
    setCustomerSignature(null); setStaffSignature(null); setStaffName(displayName && !displayName.includes("@") ? displayName : "");
    setSendEmail(true); setResult(null); setProgress("");
    void readProtocolDraft<SavedProtocol>(key).then((draft) => {
      if (cancelled || !draft || !draft.value) return;
      const d = draft.value;
      setIdChecked(d.idChecked); setIdDocType(d.idDocType); setCleanliness(d.cleanliness);
      setReadings(d.readings ?? {}); setMachineIdx(d.machineIdx ?? []); setInstructed(d.instructed);
      setKnownDefects(d.knownDefects); setNotes(d.notes); setAllReturned(d.allReturned);
      setMissingNotes(d.missingNotes);
      setPhotos(d.photos.map((p) => ({ ...p, preview: URL.createObjectURL(p.file) })));
      setDamages(d.damages.map((damage) => ({ ...damage, photos: damage.photos.map((p) => ({ file: p.file, preview: URL.createObjectURL(p.file) })) })));
      setAgbAccepted(d.agbAccepted); setItemsConfirmed(d.itemsConfirmed);
      setCustomerNotPresent(d.customerNotPresent); setSignerName(d.signerName);
      setCustomerSignature(d.customerSignature); setStaffName(d.staffName);
      setStaffSignature(d.staffSignature); setSendEmail(d.sendEmail);
      toast.info("Protokollentwurf wiederhergestellt.");
    }).catch(() => toast.error("Gespeicherter Entwurf konnte nicht geladen werden.")).finally(() => {
      if (!cancelled) setReadyFor(key);
    });
    return () => { cancelled = true; initFor.current = null; setReadyFor(null); };
  }, [open, inquiry?.id, kind, draftKey, displayName]);

  useEffect(() => {
    if (!draftKey || readyFor !== draftKey || completed.current || result) return;
    const value: SavedProtocol = {
      idChecked, idDocType, cleanliness, readings, machineIdx, instructed, knownDefects, notes,
      allReturned, missingNotes, photos: photos.map(({ id, file, caption }) => ({ id, file, caption })),
      damages: damages.map(({ photos: damagePhotos, ...damage }) => ({ ...damage, photos: damagePhotos.map(({ file }) => ({ file })) })),
      agbAccepted, itemsConfirmed, customerNotPresent, signerName, customerSignature,
      staffName, staffSignature, sendEmail,
    };
    void writeProtocolDraft(draftKey, value).catch(() => toast.error("Entwurf konnte auf diesem Gerät nicht gespeichert werden. Bitte Speicherplatz prüfen."));
  }, [draftKey, readyFor, result, idChecked, idDocType, cleanliness, readings, machineIdx, instructed, knownDefects, notes, allReturned, missingNotes, photos, damages, agbAccepted, itemsConfirmed, customerNotPresent, signerName, customerSignature, staffName, staffSignature, sendEmail]);

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, [open]);

  const items = useMemo(() => (inquiry ? protocolItemsFromInquiry(inquiry as never) : []), [inquiry]);
  const itemNames = items.map((i) => i.name);
  void itemNames;
  const machine = items.some((it) => isMachineLike([it.name]) || cms[it.name.trim().toLowerCase()]?.hours);
  const setReading = (i: number, reading: Measurement) =>
    setReadings((r) => ({ ...r, [i]: reading }));
  const cmsFor = (i: number) => (items[i] ? cms[items[i].name.trim().toLowerCase()] : undefined);
  const usedPhotos = photos.length + damages.reduce((n, d) => n + d.photos.length, 0);
  const slotsLeft = remainingPhotoSlots(usedPhotos);

  if (!inquiry) return null;
  const customerLabel = [inquiry.company_name, inquiry.customer_name].filter(Boolean).join(" · ") || inquiry.customer_email;

  const addPhotos = async (files: FileList | null) => {
    let list = Array.from(files ?? []).filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|heic|webp)$/i.test(f.name));
    if (!list.length) return;
    if (list.length > slotsLeft) {
      toast.warning(slotsLeft === 0
        ? `Maximal ${MAX_PROTOCOL_PHOTOS} Fotos je Protokoll – es ist kein Platz mehr frei.`
        : `Maximal ${MAX_PROTOCOL_PHOTOS} Fotos je Protokoll – nur ${slotsLeft} weitere übernommen.`);
      list = list.slice(0, slotsLeft);
    }
    setPhotoBusy(true);
    try {
      for (const original of list) {
        const file = await prepareProtocolPhoto(original);
        setPhotos((p) => [...p, { id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), caption: "" }]);
      }
    } catch (error) {
      toast.error((error as Error).message || "Foto konnte nicht verarbeitet werden. Bitte JPEG auswählen.");
    } finally { setPhotoBusy(false); }
  };

  const readingsDone = items.every((_, i) => validMeasurement({ ...emptyMeasurement(), ...readings[i] }));
  const equipmentDone = cleanliness > 0 && readingsDone;
  const itemsDone = isReturn ? (allReturned || !!missingNotes.trim()) : true;
  const legalDone = customerNotPresent || (isReturn ? itemsConfirmed : agbAccepted && itemsConfirmed && (!machine || instructed));
  const signaturesDone = !!staffSignature && !!staffName.trim() && (customerNotPresent || (!!customerSignature && !!signerName.trim()));
  const damagesDone = damages.every((d) => d.description.trim());
  const idDone = customerNotPresent || idChecked;

  const missing: string[] = [];
  if (!itemsDone) missing.push("fehlende Artikel beschreiben");
  if (!idDone) missing.push("Ausweis abgleichen");
  if (!equipmentDone) missing.push("ausgewählte Messwerte und Sauberkeit");
  if (!damagesDone) missing.push("Beschreibung bei jedem Schaden");
  if (!legalDone) missing.push("Bestätigungen des Kunden");
  if (!signaturesDone) missing.push("Unterschriften und Namen");
  const allValid = missing.length === 0;

  const submit = async () => {
    if (photoBusy || readyFor !== draftKey) return;
    setSaving(true);
    try {
      setProgress("Fotos werden vorbereitet …");
      const photoPayload = [];
      for (const p of photos) {
        photoPayload.push({ data: await protocolPhotoBase64(p.file), taken_at: photoTakenAt(p.file.lastModified), caption: p.caption.trim() || null });
      }
      const damagePayload = [];
      for (const d of damages) {
        const dp = [];
        for (const ph of d.photos) dp.push({ data: await protocolPhotoBase64(ph.file), taken_at: photoTakenAt(ph.file.lastModified) });
        damagePayload.push({
          item_name: d.itemName || null, category: d.category, description: d.description.trim() || null,
          amount: d.amount ? toNumber(d.amount) : null, needs_repair: !!d.needsRepair, reduces_stock: !!d.reducesStock,
          quantity: Math.max(1, Math.round(toNumber(d.quantity) || 1)), photos: dp,
        });
      }
      const machineReadings = items.flatMap((it, i) => {
        const reading = { ...emptyMeasurement(), ...readings[i] };
        return reading.useHours || reading.useFuel || reading.useMileage
          ? [{ item_name: it.name, ...selectedMeasurement(reading), managed_product_id: cmsFor(i)?.id ?? null }]
          : [];
      });
      setProgress("Protokoll und PDF werden erstellt …");
      const { data, error } = await supabase.functions.invoke("generate-rental-protocol", {
        body: {
          kind, rental_inquiry_id: inquiry.id,
          staff_name: staffName.trim(), staff_signature: staffSignature,
          customer_not_present: customerNotPresent,
          customer_signature: customerNotPresent ? null : customerSignature,
          customer_signer_name: customerNotPresent ? null : signerName.trim(),
          id_checked: !customerNotPresent && idChecked, id_check_type: idDocType || null,
          agb_accepted: !customerNotPresent && !isReturn && agbAccepted,
          items_confirmed: !customerNotPresent && itemsConfirmed,
          operating_hours: machineReadings.filter((m) => m.operating_hours).map((m) => `${m.item_name}: ${m.operating_hours}`).join("; ").slice(0, 40) || null,
          fuel_level: machineReadings.find((m) => m.fuel_level)?.fuel_level ?? null,
          machine_readings: machineReadings, instructed: !customerNotPresent && !isReturn && instructed,
          cleanliness_rating: cleanliness || null,
          known_defects: knownDefects.trim() || null, notes: notes.trim() || null,
          all_items_returned: isReturn ? allReturned : null, missing_items_notes: isReturn && !allReturned ? missingNotes.trim() : null,
          items, photos: photoPayload, damages: damagePayload, send_email: sendEmail,
        },
      });
      if (error) {
        let msg = error.message;
        try { const ctx = (error as { context?: Response }).context; if (ctx) msg = (await ctx.json()).error ?? msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      setResult({ number: data.number, fileUrl: data.file_url ?? null, emailSent: !!data.email_sent, recipient: data.recipient ?? null });
      completed.current = true;
      if (draftKey) await deleteProtocolDraft(draftKey).catch(() => toast.warning("Lokaler Entwurf konnte nicht entfernt werden."));
      onCreated();
    } catch (e) {
      toast.error((e as Error).message || `${label} konnte nicht erstellt werden.`);
    } finally {
      setSaving(false);
      setProgress("");
    }
  };

  const steps: WizardStep[] = [
    {
      id: "items",
      title: isReturn ? "Artikel zurücknehmen" : "Artikel übergeben",
      summary: `${items.length} Position${items.length === 1 ? "" : "en"}`,
      done: itemsDone,
      content: (
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-0.5">
            <p className="font-semibold">{customerLabel}</p>
            <p className="text-muted-foreground">
              {inquiry.location ? getLocationDisplayName(inquiry.location) : "—"} · Miete {fmtDate(inquiry.start_date)} – {fmtDate(inquiry.end_date)}
            </p>
            {inquiry.order_confirmation_number && <p className="text-muted-foreground">Auftragsbestätigung {inquiry.order_confirmation_number}</p>}
          </div>
          {items.map((it, i) => (
            <Card key={i}>
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm break-words">{it.name}</p>
                  {it.detail && <p className="text-xs text-muted-foreground">{it.detail}</p>}
                </div>
                <Badge variant="secondary" className="shrink-0">{it.quantity} ×</Badge>
              </CardContent>
            </Card>
          ))}
          {isReturn && (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox id="all-returned" checked={allReturned} onCheckedChange={(v) => setAllReturned(v === true)} />
                <label htmlFor="all-returned" className="text-sm cursor-pointer">Alle Artikel vollständig zurückgegeben</label>
              </div>
              {!allReturned && (
                <Textarea value={missingNotes} onChange={(e) => setMissingNotes(e.target.value)} rows={2} placeholder="Was fehlt? z. B. 3 Gläser, 1 Ladekabel" />
              )}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Zeitpunkt: {now.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })} Uhr (wird beim Abschluss gesetzt)
          </div>
        </div>
      ),
    },
    {
      id: "id",
      title: "Ausweis abgleichen",
      summary: customerNotPresent ? "Kunde nicht anwesend" : idChecked ? "Abgeglichen" : "Pflicht",
      done: idDone,
      content: customerNotPresent
        ? <p className="text-sm text-muted-foreground">Kunde ist nicht anwesend – kein Ausweisabgleich möglich.</p>
        : <IdCheckStep checked={idChecked} onCheckedChange={setIdChecked} docType={idDocType} onDocTypeChange={setIdDocType} customerName={inquiry.customer_name ?? undefined} />,
    },
    {
      id: "equipment",
      title: "Zustand",
      summary: `Sauberkeit${cleanliness ? ` ${cleanliness}/5` : ""}`,
      done: equipmentDone,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            {items.map((it, i) => {
              const prev = prevReadings[it.name.trim().toLowerCase()];
              return <div key={i} className="space-y-1">
                <MeasurementFields name={it.name} value={{ ...emptyMeasurement(), ...readings[i] }} onChange={(m) => setReading(i, m)} />
                {isReturn && prev && (prev.mileage != null || prev.hours != null || !!prev.fuel) && <p className="text-xs text-muted-foreground pl-2">Bei Übergabe: {[prev.mileage != null ? `${prev.mileage} km` : "", prev.hours != null ? `${prev.hours} h` : "", prev.fuel ? `Tank ${FUEL_LEVELS.find((f) => f.value === prev.fuel)?.label ?? prev.fuel}` : ""].filter(Boolean).join(" · ")}</p>}
              </div>;
            })}
          </div>
          <div>
            <Label className="text-xs">Sauberkeit / Verschmutzung *</Label>
            <div className="grid grid-cols-5 gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Button key={n} type="button" variant={cleanliness === n ? "default" : "outline"} className="h-12 text-base" onClick={() => setCleanliness(n)}>{n}</Button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{CLEANLINESS_HINT}</p>
          </div>
          <div>
            <Label className="text-xs">{isReturn ? "Zustand bei Rückgabe (optional)" : "Bekannte Mängel vor Übergabe (optional)"}</Label>
            <Textarea value={knownDefects} onChange={(e) => setKnownDefects(e.target.value)} rows={2} placeholder="z. B. Gebrauchsspuren am Gehäuse" />
          </div>
          <div>
            <Label className="text-xs">Anmerkungen (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Absprachen, Hinweise" />
          </div>
        </div>
      ),
    },
    {
      id: "photos",
      title: "Fotos",
      optional: true,
      summary: `${usedPhotos} / ${MAX_PROTOCOL_PHOTOS} Fotos`,
      done: photos.length > 0,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Zustandsfotos der Artikel. Insgesamt sind bis zu {MAX_PROTOCOL_PHOTOS} Fotos je Protokoll möglich (inkl. Schadensfotos). Jedes Foto bekommt einen Zeitstempel.
          </p>
          <div className="flex items-center justify-between">
            <Badge variant={slotsLeft === 0 ? "destructive" : "secondary"}>{usedPhotos} / {MAX_PROTOCOL_PHOTOS} Fotos</Badge>
          </div>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { void addPhotos(e.target.files); e.target.value = ""; }} />
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" data-testid="protocol-photo-input" onChange={(e) => { void addPhotos(e.target.files); e.target.value = ""; }} />
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" className="h-12" disabled={slotsLeft === 0 || photoBusy} onClick={() => cameraRef.current?.click()}>
              <Camera className="h-4 w-4 mr-2" /> Foto aufnehmen
            </Button>
            <Button type="button" variant="outline" className="h-12" disabled={slotsLeft === 0 || photoBusy} onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" /> Aus Galerie
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <div key={p.id} className="rounded-lg border overflow-hidden bg-card">
                <div className="relative">
                  <img src={p.preview} alt={`Foto ${i + 1}`} className="w-full aspect-[4/3] object-cover" />
                  <Button type="button" size="icon" variant="destructive" aria-label="Foto entfernen" className="absolute top-1 right-1 h-7 w-7"
                    onClick={() => { URL.revokeObjectURL(p.preview); setPhotos((l) => l.filter((x) => x.id !== p.id)); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="p-1.5 space-y-1">
                  <p className="text-[10px] text-muted-foreground">{formatPhotoTimestamp(photoTakenAt(p.file.lastModified))}</p>
                  <Input value={p.caption} onChange={(e) => setPhotos((l) => l.map((x) => (x.id === p.id ? { ...x, caption: e.target.value } : x)))} placeholder="Beschriftung (optional)" className="h-8 text-xs" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "damages",
      title: "Schäden",
      optional: true,
      summary: damages.length ? `${damages.length} erfasst` : "Keine",
      done: damages.length > 0 && damagesDone,
      content: (
        <DamagesStep damages={damages} onChange={setDamages} itemNames={itemNames} context={isReturn ? "bei Rückgabe" : "bei Übergabe"} showAmounts={isReturn} photoSlotsLeft={slotsLeft} />
      ),
    },
    {
      id: "signature",
      title: "Unterschriften",
      summary: signaturesDone ? "Erfasst" : "Kunde und Mitarbeiter",
      done: signaturesDone && legalDone,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Checkbox id="not-present" checked={customerNotPresent} onCheckedChange={(v) => setCustomerNotPresent(v === true)} />
            <label htmlFor="not-present" className="text-sm cursor-pointer">Kunde ist nicht anwesend (z. B. Lieferung an Baustelle) – das Protokoll wird ohne Kundenunterschrift erstellt und so vermerkt.</label>
          </div>
          {!customerNotPresent && (
            <>
              <div className="space-y-2 rounded-lg border p-3">
                {!isReturn && (
                  <div className="flex items-start gap-3">
                    <Checkbox id="agb" checked={agbAccepted} onCheckedChange={(v) => setAgbAccepted(v === true)} />
                    <label htmlFor="agb" className="text-sm cursor-pointer">Der Mieter hat die Allgemeinen Geschäftsbedingungen und die Auftragsbestätigung erhalten und zur Kenntnis genommen.</label>
                  </div>
                )}
                {!isReturn && machine && (
                  <div className="flex items-start gap-3">
                    <Checkbox id="instructed" checked={instructed} onCheckedChange={(v) => setInstructed(v === true)} />
                    <label htmlFor="instructed" className="text-sm cursor-pointer">Der Mieter wurde in Bedienung, Betankung und sichere Handhabung der Maschinen eingewiesen und hat keine Fragen mehr.</label>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Checkbox id="items-ok" checked={itemsConfirmed} onCheckedChange={(v) => setItemsConfirmed(v === true)} />
                  <label htmlFor="items-ok" className="text-sm cursor-pointer">
                    {isReturn
                      ? "Der Mieter bestätigt die Rückgabe der Mietgegenstände sowie die Richtigkeit der erfassten Betriebsstunden, Tankfüllstände, der Sauberkeit und der dokumentierten Schäden."
                      : "Der Mieter bestätigt, die oben aufgeführten Mietgegenstände vollständig, funktionsfähig und in einwandfreiem, betriebssicherem Zustand übernommen zu haben – mit Ausnahme der in diesem Protokoll dokumentierten Schäden und Mängel. Die erfassten Betriebsstunden, Tankfüllstände und die Sauberkeit sind zutreffend."}
                  </label>
                </div>
              </div>
              <div>
                <Label className="text-xs">Name des Unterzeichners (Kunde)</Label>
                <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} className="h-11" autoComplete="off" />
              </div>
              <SignatureBlock title="Unterschrift Kunde" value={customerSignature} onChange={setCustomerSignature} />
            </>
          )}
          <div>
            <Label className="text-xs">Name Mitarbeiter</Label>
            <Input value={staffName} onChange={(e) => setStaffName(e.target.value)} className="h-11" autoComplete="off" />
          </div>
          <SignatureBlock title="Unterschrift Mitarbeiter" value={staffSignature} onChange={setStaffSignature} />
          <div className="flex items-start gap-3">
            <Checkbox id="send-mail" checked={sendEmail} onCheckedChange={(v) => setSendEmail(v === true)} />
            <label htmlFor="send-mail" className="text-sm cursor-pointer">PDF per E-Mail an {inquiry.customer_email || "den Kunden"} senden</label>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!saving) onOpenChange(o); }}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-3xl max-h-[94vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription className="break-words">{customerLabel}</DialogDescription>
        </DialogHeader>
        {result ? (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
              <div className="text-sm space-y-1">
                <p className="font-semibold">{label} {result.number} erstellt</p>
                <p className="text-muted-foreground">
                  {result.emailSent ? `PDF wurde an ${result.recipient} gesendet.` : "Es wurde keine E-Mail versendet."}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {result.fileUrl && (
                <Button asChild>
                  <a href={result.fileUrl} target="_blank" rel="noreferrer"><Download className="h-4 w-4 mr-2" /> PDF öffnen</a>
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>Schließen</Button>
            </div>
          </div>
        ) : (
          <ProtocolWizard
            steps={steps}
            missingHint={missing.length ? missing.join(", ") : null}
            footer={
              <Button className="w-full h-12" disabled={!allValid || saving || photoBusy || readyFor !== draftKey} onClick={submit}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {progress || "Wird erstellt …"}</> : `${label} abschließen & PDF erstellen`}
              </Button>
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
