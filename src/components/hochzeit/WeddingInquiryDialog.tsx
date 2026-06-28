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
import { MapPin, ArrowLeft, Mail } from "lucide-react";

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
    address: "Service-Standort Ruhrgebiet",
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
  const [step, setStep] = useState<1 | 2>(1);
  const [loc, setLoc] = useState<LocationKey | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    eventLocation: "",
    guests: "",
    deliveryNeeded: false,
    selfPickup: false,
    notes: "",
  });
  const [selectedTech, setSelectedTech] = useState<string[]>([]);

  const reset = () => {
    setStep(1);
    setLoc(null);
    setSelectedTech([]);
    setForm({
      name: "",
      email: "",
      phone: "",
      eventDate: "",
      eventLocation: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loc) return;
    const target = LOCATIONS[loc];

    const lines = [
      "Hallo SLT-Team,",
      "",
      "wir möchten gerne ein unverbindliches Angebot für unsere Hochzeit erhalten.",
      "",
      "— Kontaktdaten —",
      `Name: ${form.name}`,
      `E-Mail: ${form.email}`,
      `Telefon: ${form.phone || "—"}`,
      "",
      "— Hochzeit —",
      `Mietstandort: ${target.label}`,
      `Hochzeitsdatum: ${form.eventDate || "—"}`,
      `Eventlocation (Adresse): ${form.eventLocation || "—"}`,
      `Gästezahl (ca.): ${form.guests || "—"}`,
      `Wunschlogistik: ${
        form.deliveryNeeded && form.selfPickup
          ? "Lieferung ODER Selbstabholung – bitte beraten"
          : form.deliveryNeeded
            ? "Lieferung & Aufbau gewünscht"
            : form.selfPickup
              ? "Selbstabholung"
              : "noch offen"
      }`,
      "",
      "— Gewünschte Technik / Ausstattung —",
      ...(selectedTech.length ? selectedTech.map((t) => `• ${t}`) : ["(keine Auswahl getroffen)"]),
      "",
      "— Anmerkungen —",
      form.notes || "—",
      "",
      "Bitte sendet uns ein passendes Angebot.",
      "Vielen Dank!",
    ];

    const subject = `Hochzeit ${form.eventDate || ""} – Anfrage Technik & Ausstattung (${target.label})`;
    const body = lines.join("\n");
    const mailto = `mailto:${target.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
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
                Fülle die Felder aus – wir senden euch innerhalb von 24 h ein
                schriftliches Angebot per E-Mail an die Adresse {LOCATIONS[loc].email}.
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
                  <Label htmlFor="w-phone">Telefon</Label>
                  <Input
                    id="w-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                <div className="sm:col-span-2">
                  <Label htmlFor="w-loc">Eventlocation (Adresse)</Label>
                  <Input
                    id="w-loc"
                    value={form.eventLocation}
                    onChange={(e) => setForm({ ...form, eventLocation: e.target.value })}
                    placeholder="z. B. Schloss XYZ, Königswinter"
                  />
                </div>
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
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Standort ändern
                </Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                  <Mail className="h-4 w-4 mr-2" /> Angebot anfordern
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Mit Klick auf „Angebot anfordern" öffnet sich euer E-Mail-Programm mit
                allen Angaben vorausgefüllt – Versand an {LOCATIONS[loc].email}.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
