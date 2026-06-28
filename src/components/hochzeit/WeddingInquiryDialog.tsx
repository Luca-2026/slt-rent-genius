import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, ArrowLeft, Mail, Loader2, CheckCircle2, ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LocationKey = "krefeld" | "bonn" | "muelheim";

const LOCATIONS: Record<
  LocationKey,
  { label: string; address: string; email: string; phone: string }
> = {
  krefeld: {
    label: "Krefeld (Hauptsitz)",
    address: "Fichtenhain B 5, 47807 Krefeld",
    email: "krefeld@slt-rental.de",
    phone: "02151 417 99 04",
  },
  bonn: {
    label: "Bonn (Bad Godesberg / Mehlem)",
    address: "Drachenburgstraße 8, 53179 Bonn",
    email: "bonn@slt-rental.de",
    phone: "0228 504 660 61",
  },
  muelheim: {
    label: "Mülheim an der Ruhr",
    address: "Ruhrorter Str. 122, 45478 Mülheim an der Ruhr",
    email: "muelheim@slt-rental.de",
    phone: "02151 417 99 04",
  },
};

const TECH_OPTIONS = [
  "DJ-Beschallung (PA + Funkmikrofon)",
  "Funkmikrofon-Set für die Trauung",
  "Effektlicht / LED-Uplights",
  "LED Moving Heads",
  "Nebelmaschine (ADJ Fog Fury Jett PRO)",
  "Sparkular Kalt-Funkenfontänen (2er-Set)",
  "Sparkular Kalt-Funkenfontänen (4er-Set)",
  "TCM FX Turbo CO₂-Jet",
  "Soundboks Gen.3 (Outdoor-Sound auf Akku)",
  "Pioneer CDJ 2000 NXS / DJM 900 NXS2",
  "Stehtische + Stretchhussen",
  "Bierzeltgarnituren",
  "Pagodenzelt / Festzelt",
  "Darwin-Geschirr & Besteck",
  "Wein- / Sekt- / Wassergläser",
  "Mobile Profi-Spülmaschine",
  "Stromverteiler / CEE-Kabelage",
  "Fotobox mit Sofortdruck",
  "Beleuchtete XXL-Love-Buchstaben",
];

export function WeddingInquiryDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loc, setLoc] = useState<LocationKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    venueName: "",
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    guests: "",
    deliveryNeeded: false,
    selfPickup: false,
    notes: "",
  });
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);

  const MAX_PHOTOS = 3;
  const MAX_BYTES = 5 * 1024 * 1024;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    const next = [...photos];
    for (const f of files) {
      if (next.length >= MAX_PHOTOS) {
        toast.error(`Maximal ${MAX_PHOTOS} Bilder.`);
        break;
      }
      if (!f.type.startsWith("image/")) {
        toast.error(`„${f.name}" ist kein Bild.`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`„${f.name}" ist größer als 5 MB.`);
        continue;
      }
      next.push(f);
    }
    setPhotos(next);
  };

  const removePhoto = (idx: number) => {
    setPhotos((p) => p.filter((_, i) => i !== idx));
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // strip "data:<mime>;base64,"
        resolve(result.split(",")[1] || "");
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const reset = () => {
    setStep(1);
    setLoc(null);
    setSelectedTech([]);
    setPhotos([]);
    setSubmitting(false);
    setForm({
      name: "",
      email: "",
      phone: "",
      eventDate: "",
      venueName: "",
      street: "",
      houseNumber: "",
      postalCode: "",
      city: "",
      guests: "",
      deliveryNeeded: false,
      selfPickup: false,
      notes: "",
    });
  };

  const close = (val: boolean) => {
    if (!val) setTimeout(reset, 200);
    onOpenChange(val);
  };

  const toggleTech = (item: string) => {
    setSelectedTech((s) => (s.includes(item) ? s.filter((x) => x !== item) : [...s, item]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loc) return;
    const target = LOCATIONS[loc];

    setSubmitting(true);

    const logistik =
      form.deliveryNeeded && form.selfPickup
        ? "Lieferung ODER Selbstabholung – bitte beraten"
        : form.deliveryNeeded
          ? "Lieferung & Aufbau gewünscht"
          : form.selfPickup
            ? "Selbstabholung"
            : "noch offen";

    const venueLine = [
      form.venueName ? `${form.venueName}, ` : "",
      `${form.street} ${form.houseNumber}, ${form.postalCode} ${form.city}`,
    ].join("");

    const messageBlock = [
      "— Hochzeit / Event —",
      `Mietstandort: ${target.label}`,
      `Eventlocation: ${venueLine}`,
      `Gästezahl (ca.): ${form.guests || "—"}`,
      `Wunschlogistik: ${logistik}`,
      "",
      "— Gewünschte Technik / Ausstattung —",
      ...(selectedTech.length ? selectedTech.map((t) => `• ${t}`) : ["(keine Auswahl getroffen)"]),
      "",
      "— Anmerkungen —",
      form.notes || "—",
    ].join("\n");

    try {
      const attachments = await Promise.all(
        photos.map(async (f) => ({
          filename: f.name,
          content: await fileToBase64(f),
        }))
      );

      const { error } = await supabase.functions.invoke("send-inquiry-email", {
        body: {
          productName: "Hochzeit – Technik & Ausstattung",
          locationName: target.label,
          locationEmail: target.email,
          locationPhone: target.phone,
          locationAddress: target.address,
          name: form.name,
          email: form.email,
          phone: form.phone,
          street: `${form.street} ${form.houseNumber}`.trim(),
          postalCode: form.postalCode,
          city: form.city,
          startDate: form.eventDate,
          endDate: form.eventDate,
          message: messageBlock,
          deliveryRequested: form.deliveryNeeded,
          deliveryStreet: form.deliveryNeeded ? `${form.street} ${form.houseNumber}`.trim() : "",
          deliveryPostalCode: form.deliveryNeeded ? form.postalCode : "",
          deliveryCity: form.deliveryNeeded ? form.city : "",
          setupServiceRequested: form.deliveryNeeded,
          attachments,
        },
      });

      if (error) throw error;
      setStep(3);
      toast.success("Anfrage erfolgreich gesendet");
    } catch (err) {
      console.error("Wedding inquiry error:", err);
      toast.error("Anfrage konnte nicht gesendet werden. Bitte versucht es kurz später erneut oder ruft uns an.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Mietstandort für eure Hochzeit wählen
              </DialogTitle>
              <DialogDescription>
                Wähle den SLT-Standort, der für eure Eventlocation am nächsten liegt.
                Danach öffnen wir das Anfrageformular.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 mt-2">
              {(Object.keys(LOCATIONS) as LocationKey[]).map((key) => {
                const l = LOCATIONS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setLoc(key);
                      setStep(2);
                    }}
                    className="text-left rounded-lg border border-border p-4 hover:border-primary hover:bg-primary/5 transition"
                  >
                    <div className="font-semibold text-headline">{l.label}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{l.address}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {l.email} · {l.phone}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && loc && (
          <>
            <DialogHeader>
              <DialogTitle>Anfrage Hochzeitstechnik – {LOCATIONS[loc].label}</DialogTitle>
              <DialogDescription>
                Fülle die Felder aus – euer SLT-Team aus {LOCATIONS[loc].label} sendet euch
                innerhalb von 24 h ein individuelles, schriftliches Angebot per E-Mail an
                die von euch angegebene Adresse.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="w-name">Name *</Label>
                  <Input
                    id="w-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Vor- und Nachname"
                  />
                </div>
                <div>
                  <Label htmlFor="w-email">E-Mail *</Label>
                  <Input
                    id="w-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="w-phone">Telefon *</Label>
                  <Input
                    id="w-phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="für kurze Rückfragen"
                  />
                </div>
                <div>
                  <Label htmlFor="w-date">Hochzeitsdatum *</Label>
                  <Input
                    id="w-date"
                    type="date"
                    required
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="rounded-md border border-border p-3 space-y-3">
                <Label className="font-semibold">Eventlocation / Veranstaltungsort *</Label>
                <div className="grid sm:grid-cols-[1fr_120px] gap-3">
                  <div>
                    <Label htmlFor="w-street" className="text-xs text-muted-foreground">Straße *</Label>
                    <Input
                      id="w-street"
                      required
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      placeholder="z. B. Drachenburgstraße"
                    />
                  </div>
                  <div>
                    <Label htmlFor="w-hnr" className="text-xs text-muted-foreground">Hausnummer *</Label>
                    <Input
                      id="w-hnr"
                      required
                      value={form.houseNumber}
                      onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
                      placeholder="8"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-[140px_1fr] gap-3">
                  <div>
                    <Label htmlFor="w-plz" className="text-xs text-muted-foreground">PLZ *</Label>
                    <Input
                      id="w-plz"
                      required
                      inputMode="numeric"
                      pattern="[0-9]{4,5}"
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      placeholder="53179"
                    />
                  </div>
                  <div>
                    <Label htmlFor="w-city" className="text-xs text-muted-foreground">Stadt *</Label>
                    <Input
                      id="w-city"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Bonn"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="w-venue" className="text-xs text-muted-foreground">
                    Name der Location (optional)
                  </Label>
                  <Input
                    id="w-venue"
                    value={form.venueName}
                    onChange={(e) => setForm({ ...form, venueName: e.target.value })}
                    placeholder="z. B. Schloss Drachenburg"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="w-guests">Gästezahl (ca.)</Label>
                  <Input
                    id="w-guests"
                    type="number"
                    min={1}
                    value={form.guests}
                    onChange={(e) => setForm({ ...form, guests: e.target.value })}
                    placeholder="z. B. 80"
                  />
                </div>
                <div className="flex flex-col gap-2 justify-end pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.deliveryNeeded}
                      onCheckedChange={(v) => setForm({ ...form, deliveryNeeded: !!v })}
                    />
                    Lieferung &amp; Aufbau gewünscht
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.selfPickup}
                      onCheckedChange={(v) => setForm({ ...form, selfPickup: !!v })}
                    />
                    Selbstabholung möglich
                  </label>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Welche Technik / Ausstattung benötigt ihr?</Label>
                <div className="grid sm:grid-cols-2 gap-1.5 rounded-md border border-border p-3 max-h-60 overflow-y-auto">
                  {TECH_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-start gap-2 text-sm py-1">
                      <Checkbox
                        checked={selectedTech.includes(opt)}
                        onCheckedChange={() => toggleTech(opt)}
                      />
                      <span className="leading-snug">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="w-notes">Anmerkungen / weitere Wünsche</Label>
                <Textarea
                  id="w-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="z. B. Outdoor-Trauung mit Strom über Generator, Indoor-Brandmelder vorhanden, …"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)} disabled={submitting}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Standort ändern
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Wird gesendet…
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" /> Anfrage absenden
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Eure Anfrage geht direkt an unser Team am Standort {LOCATIONS[loc].label}.
                Ihr erhaltet zusätzlich eine Eingangsbestätigung per E-Mail.
              </p>
            </form>
          </>
        )}

        {step === 3 && loc && (
          <div className="py-6 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Anfrage gesendet!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Vielen Dank – unser Team aus <strong>{LOCATIONS[loc].label}</strong> meldet
              sich innerhalb von 24 h mit einem schriftlichen Angebot. Eine
              Eingangsbestätigung haben wir bereits an eure E-Mail-Adresse geschickt.
            </p>
            <Button
              className="mt-6"
              onClick={() => close(false)}
            >
              Schließen
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
