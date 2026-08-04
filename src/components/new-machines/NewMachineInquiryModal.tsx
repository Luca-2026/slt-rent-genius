import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertTriangle, Package, Shield, Phone, Clock, Handshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  machine: {
    brand: string;
    model: string;
    name: string;
    slug: string;
    category?: string | null;
    priceLabel: string;
    image?: string | null;
    configOptions?: { name: string; price: string; note?: string }[];
    initialConfig?: string;
  };
}

type View = "form" | "success" | "error";

const COUNTRIES = ["Deutschland", "Österreich", "Schweiz", "Niederlande", "Belgien", "Luxemburg"];

export function NewMachineInquiryModal({ open, onClose, machine }: Props) {
  const [view, setView] = useState<View>("form");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Ist die Produktseite selbst die Anhängerkupplung? Dann Dropdown "für welchen Dumper" statt Zubehör-Checkbox
  const isAnhaengerkupplungProduct = /anhaengerkupplung/i.test(machine.slug);

  // Addon visibility: nur KDE550 / KDE550P Raddumper – Anhängerkupplung ist NICHT für RMD800P o. ä. kompatibel
  // Und NICHT anzeigen, wenn der Kunde ohnehin schon die Anhängerkupplung selbst anfragt
  const isBaumaxDumper =
    /baumax/i.test(machine.brand) && /kde550/i.test(machine.slug) && !isAnhaengerkupplungProduct;

  const [addonAnhaengerkupplung, setAddonAnhaengerkupplung] = useState(false);
  const [kupplungDumperModell, setKupplungDumperModell] = useState<string>("");
  const [selectedConfig, setSelectedConfig] = useState<string>(machine.initialConfig || machine.configOptions?.[0]?.name || "");

  // Block 2 — Lieferung
  const [lieferOption, setLieferOption] = useState("");
  const [lieferStrasse, setLieferStrasse] = useState("");
  const [lieferPlz, setLieferPlz] = useState("");
  const [lieferOrt, setLieferOrt] = useState("");
  const [lieferhinweis, setLieferhinweis] = useState("");

  // Block 3 — Kontakt
  const [kundentyp, setKundentyp] = useState("");
  const [firmenname, setFirmenname] = useState("");
  const [ustIdNr, setUstIdNr] = useState("");
  const [anrede, setAnrede] = useState("");
  const [titel, setTitel] = useState("");
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [wunschtermin, setWunschtermin] = useState("");

  // Block 4 — Rechnungsadresse
  const [rechnungGleich, setRechnungGleich] = useState(true);
  const [rechnungFirma, setRechnungFirma] = useState("");
  const [rechnungStrasse, setRechnungStrasse] = useState("");
  const [rechnungPlz, setRechnungPlz] = useState("");
  const [rechnungOrt, setRechnungOrt] = useState("");
  const [rechnungLand, setRechnungLand] = useState("Deutschland");

  // Block 5
  const [nachricht, setNachricht] = useState("");
  const [datenschutz, setDatenschutz] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const deliveryOptions = [
    { val: "Lieferung gewünscht", label: "Lieferung an meine Adresse" },
    { val: "Selbstabholung Krefeld", label: "Selbstabholung Krefeld" },
    { val: "Selbstabholung Bonn", label: "Selbstabholung Bonn" },
    { val: "Selbstabholung Mülheim an der Ruhr", label: "Selbstabholung Mülheim an der Ruhr" },
  ];

  const customerTypes = [
    { val: "Gewerblicher Kunde", label: "Gewerblicher Kunde" },
    { val: "Privatkunde", label: "Privatkunde" },
  ];

  useEffect(() => {
    if (open) {
      setView("form");
      setErrors({});
      setSelectedConfig(machine.initialConfig || machine.configOptions?.[0]?.name || "");
    }
  }, [open, machine.initialConfig, machine.configOptions]);

  const hasConfig = Array.isArray(machine.configOptions) && machine.configOptions.length > 0;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!lieferOption) errs.lieferOption = "Bitte Lieferung oder Abholung wählen";
    if (lieferOption === "Lieferung gewünscht") {
      if (!lieferStrasse.trim()) errs.lieferStrasse = "Pflichtfeld";
      if (!lieferPlz.trim()) errs.lieferPlz = "Pflichtfeld";
      if (!lieferOrt.trim()) errs.lieferOrt = "Pflichtfeld";
    }
    if (isAnhaengerkupplungProduct && !kupplungDumperModell) errs.kupplungDumperModell = "Bitte Dumper-Modell wählen";
    if (!kundentyp) errs.kundentyp = "Bitte Kundentyp wählen";
    if (kundentyp === "Gewerblicher Kunde" && !firmenname.trim()) errs.firmenname = "Pflichtfeld";
    if (!anrede) errs.anrede = "Pflichtfeld";
    if (!vorname.trim()) errs.vorname = "Pflichtfeld";
    if (!nachname.trim()) errs.nachname = "Pflichtfeld";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Bitte gültige E-Mail";
    if (!telefon.trim() || telefon.replace(/\D/g, "").length < 6) errs.telefon = "Mindestens 6 Ziffern";
    if (!rechnungGleich) {
      if (!rechnungFirma.trim()) errs.rechnungFirma = "Pflichtfeld";
      if (!rechnungStrasse.trim()) errs.rechnungStrasse = "Pflichtfeld";
      if (!rechnungPlz.trim()) errs.rechnungPlz = "Pflichtfeld";
      if (!rechnungOrt.trim()) errs.rechnungOrt = "Pflichtfeld";
    }
    if (!datenschutz) errs.datenschutz = "Bitte zustimmen";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-purchase-inquiry", {
        body: {
          marke: machine.brand,
          produktkategorie: machine.category || machine.name,
          modell: `${machine.brand} ${machine.model} – ${machine.name}${hasConfig && selectedConfig ? ` [Konfiguration: ${selectedConfig}]` : ""}${isAnhaengerkupplungProduct && kupplungDumperModell ? ` [Für Dumper: ${kupplungDumperModell}]` : ""}`,
          anzahl: "1",
          anforderungen: `Direktanfrage zur Produktseite: https://www.slt-rental.de/verkauf/neumaschinen/${machine.slug} – Preis: ${machine.priceLabel}${hasConfig && selectedConfig ? ` · gewählte Konfiguration: ${selectedConfig}` : ""}${isAnhaengerkupplungProduct && kupplungDumperModell ? ` · Anhängerkupplung für: ${kupplungDumperModell}` : ""}`,
          lieferOption,
          strasse: lieferStrasse,
          plz: lieferPlz,
          ort: lieferOrt,
          lieferhinweis,
          kundentyp,
          firmenname,
          ustIdNr,
          anrede,
          titel,
          vorname,
          nachname,
          email,
          telefon,
          wunschtermin,
          rechnungGleich,
          rechnungFirma,
          rechnungStrasse,
          rechnungPlz,
          rechnungOrt,
          rechnungLand,
          nachricht,
          wieGefunden: "Produktseite Neumaschine",
          addons: [
            ...(isBaumaxDumper && addonAnhaengerkupplung ? ["Anhängerkupplung"] : []),
            ...(isAnhaengerkupplungProduct && kupplungDumperModell ? [`Für Dumper: ${kupplungDumperModell}`] : []),
            ...(hasConfig && selectedConfig ? [`Konfiguration: ${selectedConfig}`] : []),
          ],
        },
      });
      if (error) throw error;
      setView("success");
    } catch (err) {
      console.error(err);
      setView("error");
    } finally {
      setSubmitting(false);
    }
  };

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-[640px] w-[calc(100vw-1rem)] max-h-[92vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sticky top-0 z-20 bg-background border-b border-border px-4 sm:px-6 py-4">
          <DialogTitle className="text-base sm:text-lg font-bold text-headline pr-10 leading-tight">
            Anfrage: {machine.brand} {machine.model}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {machine.priceLabel} · Antwort innerhalb von 1 Werktag · unverbindlich
          </DialogDescription>
        </DialogHeader>

        {view === "success" && (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto" />
            <h3 className="text-xl font-bold text-headline">Deine Anfrage ist eingegangen.</h3>
            <p className="text-muted-foreground text-sm">Wir melden uns innerhalb von 1 Werktag persönlich bei Dir.</p>
            <Button onClick={onClose}>Schließen</Button>
          </div>
        )}

        {view === "error" && (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <AlertTriangle className="h-14 w-14 text-destructive mx-auto" />
            <h3 className="text-xl font-bold text-headline">Versand fehlgeschlagen</h3>
            <p className="text-muted-foreground text-sm">
              Bitte erneut versuchen oder direkt schreiben an{" "}
              <a href="mailto:kaufanfrage@slt-rental.de" className="text-primary underline">kaufanfrage@slt-rental.de</a>
            </p>
            <Button onClick={() => setView("form")}>Nochmal versuchen</Button>
          </div>
        )}

        {view === "form" && (
          <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-5">
            {/* 1 — Pre-selected machine */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-foreground text-base">Ausgewählte Maschine</h3>
                <div className="flex gap-3 items-center bg-muted/40 rounded-lg p-3">
                  <div className="w-16 h-16 rounded bg-background flex items-center justify-center shrink-0 overflow-hidden border border-border">
                    {machine.image ? (
                      <img src={machine.image} alt={machine.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{machine.brand}</p>
                    <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{machine.name}</p>
                    <p className="text-xs text-primary font-semibold mt-0.5">{machine.priceLabel}</p>
                  </div>
                </div>

                {hasConfig && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="font-semibold text-foreground text-sm mb-2">Konfiguration wählen *</p>
                    <div className="space-y-2">
                      {machine.configOptions!.map((opt) => (
                        <label
                          key={opt.name}
                          className={`flex items-start gap-3 p-2.5 rounded-md border cursor-pointer transition-colors ${
                            selectedConfig === opt.name ? "border-primary bg-background" : "border-border bg-background/60 hover:border-primary/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name="hercu-config-modal"
                            checked={selectedConfig === opt.name}
                            onChange={() => setSelectedConfig(opt.name)}
                            className="mt-1 accent-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2 flex-wrap">
                              <span className="font-semibold text-foreground text-sm">{opt.name}</span>
                              <span className="text-sm font-bold text-primary">{opt.price}</span>
                            </div>
                            {opt.note && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{opt.note}</p>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}



                {isBaumaxDumper && (
                  <div className="rounded-lg border border-accent/40 bg-accent/5 p-3">
                    <p className="font-semibold text-foreground text-sm mb-2">Optionales Zubehör</p>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <Checkbox
                        checked={addonAnhaengerkupplung}
                        onCheckedChange={(v) => setAddonAnhaengerkupplung(v === true)}
                        className="mt-0.5"
                      />
                      <span className="text-sm text-foreground leading-snug">
                        <strong>Anhängerkupplung</strong> für den Raddumper hinzufügen{" "}
                        <span className="text-primary font-bold">99 € brutto</span>
                        {" "}<span className="text-muted-foreground line-through">119 €</span>{" "}
                        <Link
                          to="/verkauf/neumaschinen/baumax-anhaengerkupplung-kde550/"
                          target="_blank"
                          className="text-primary underline underline-offset-2 hover:text-primary/80"
                        >
                          Details
                        </Link>
                      </span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-2 ml-6">Sofort lieferbar · 1–2 Werktage · Sonderpreis bis 30.06.2026</p>
                  </div>
                )}

                {isAnhaengerkupplungProduct && (
                  <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
                    <p className="font-semibold text-foreground text-sm mb-2">Für welchen Dumper wird die Anhängerkupplung benötigt? *</p>
                    <Select value={kupplungDumperModell} onValueChange={setKupplungDumperModell}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Bitte Dumper-Modell wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baumax KDE 550">Baumax KDE 550</SelectItem>
                        <SelectItem value="Baumax KDE 550 P">Baumax KDE 550 P</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError field="kupplungDumperModell" />
                    <p className="text-xs text-muted-foreground mt-2">Damit wir die passende Ausführung für Deinen Raddumper vorbereiten können.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2 — Lieferung / Abholung */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-foreground text-base">Lieferung oder Abholung</h3>
                <div className="space-y-2">
                  {deliveryOptions.map((opt) => (
                    <label key={opt.val} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${lieferOption === opt.val ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <input type="radio" name="lieferOption" value={opt.val} checked={lieferOption === opt.val} onChange={() => setLieferOption(opt.val)} className="accent-primary" />
                      <span className="text-sm text-foreground">{opt.label}</span>
                    </label>
                  ))}
                </div>
                <FieldError field="lieferOption" />

                {lieferOption === "Lieferung gewünscht" && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label>Straße & Hausnummer *</Label>
                        <Input value={lieferStrasse} onChange={(e) => setLieferStrasse(e.target.value)} />
                        <FieldError field="lieferStrasse" />
                      </div>
                      <div>
                        <Label>PLZ *</Label>
                        <Input inputMode="numeric" maxLength={5} value={lieferPlz} onChange={(e) => setLieferPlz(e.target.value)} />
                        <FieldError field="lieferPlz" />
                      </div>
                    </div>
                    <div>
                      <Label>Ort *</Label>
                      <Input value={lieferOrt} onChange={(e) => setLieferOrt(e.target.value)} />
                      <FieldError field="lieferOrt" />
                    </div>
                    <div>
                      <Label>Lieferhinweis (optional)</Label>
                      <Textarea rows={2} value={lieferhinweis} onChange={(e) => setLieferhinweis(e.target.value)} placeholder="z. B. Zugang, Anlieferzeiten, Kontaktperson vor Ort" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3 — Kontakt */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-foreground text-base">Kontaktdaten</h3>
                <div className="space-y-2">
                  {customerTypes.map((opt) => (
                    <label key={opt.val} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${kundentyp === opt.val ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <input type="radio" name="kundentyp" value={opt.val} checked={kundentyp === opt.val} onChange={() => setKundentyp(opt.val)} className="accent-primary" />
                      <span className="text-sm text-foreground">{opt.label}</span>
                    </label>
                  ))}
                </div>
                <FieldError field="kundentyp" />

                {kundentyp === "Gewerblicher Kunde" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Firmenname *</Label>
                      <Input value={firmenname} onChange={(e) => setFirmenname(e.target.value)} />
                      <FieldError field="firmenname" />
                    </div>
                    <div>
                      <Label>USt-IdNr. (optional)</Label>
                      <Input value={ustIdNr} onChange={(e) => setUstIdNr(e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Anrede *</Label>
                    <Select value={anrede} onValueChange={setAnrede}>
                      <SelectTrigger><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Herr">Herr</SelectItem>
                        <SelectItem value="Frau">Frau</SelectItem>
                        <SelectItem value="Divers">Divers</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError field="anrede" />
                  </div>
                  <div>
                    <Label>Titel (optional)</Label>
                    <Input value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="z. B. Dr." />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Vorname *</Label>
                    <Input value={vorname} onChange={(e) => setVorname(e.target.value)} />
                    <FieldError field="vorname" />
                  </div>
                  <div>
                    <Label>Nachname *</Label>
                    <Input value={nachname} onChange={(e) => setNachname(e.target.value)} />
                    <FieldError field="nachname" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>E-Mail *</Label>
                    <Input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <FieldError field="email" />
                  </div>
                  <div>
                    <Label>Telefon *</Label>
                    <Input type="tel" inputMode="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
                    <FieldError field="telefon" />
                  </div>
                </div>

                <div>
                  <Label>Wunschtermin (optional)</Label>
                  <Input type="date" min={minDate} value={wunschtermin} onChange={(e) => setWunschtermin(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* 4 — Rechnungsadresse */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-foreground text-base">Rechnungsadresse</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={rechnungGleich} onCheckedChange={(v) => setRechnungGleich(v === true)} />
                  <span className="text-sm text-foreground">Rechnungsadresse ist identisch mit Lieferadresse</span>
                </label>

                {!rechnungGleich && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <Label>Firma / Name *</Label>
                      <Input value={rechnungFirma} onChange={(e) => setRechnungFirma(e.target.value)} />
                      <FieldError field="rechnungFirma" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label>Straße & Hausnummer *</Label>
                        <Input value={rechnungStrasse} onChange={(e) => setRechnungStrasse(e.target.value)} />
                        <FieldError field="rechnungStrasse" />
                      </div>
                      <div>
                        <Label>PLZ *</Label>
                        <Input value={rechnungPlz} onChange={(e) => setRechnungPlz(e.target.value)} />
                        <FieldError field="rechnungPlz" />
                      </div>
                    </div>
                    <div>
                      <Label>Ort *</Label>
                      <Input value={rechnungOrt} onChange={(e) => setRechnungOrt(e.target.value)} />
                      <FieldError field="rechnungOrt" />
                    </div>
                    <div>
                      <Label>Land</Label>
                      <Select value={rechnungLand} onValueChange={setRechnungLand}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 5 — Nachricht & Datenschutz */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-foreground text-base">Nachricht & Einwilligung</h3>
                <div>
                  <Label>Deine Nachricht (optional)</Label>
                  <Textarea rows={4} value={nachricht} onChange={(e) => setNachricht(e.target.value)} placeholder="Fragen, Wunschausstattung, Finanzierung, Rückruf …" />
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <Checkbox checked={datenschutz} onCheckedChange={(v) => setDatenschutz(v === true)} className="mt-0.5" />
                  <span className="text-xs text-muted-foreground leading-snug">
                    Ich habe die <Link to="/datenschutz" target="_blank" className="text-primary underline">Datenschutzerklärung</Link> gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung der Anfrage zu. *
                  </span>
                </label>
                <FieldError field="datenschutz" />
              </CardContent>
            </Card>

            {/* Trust + Submit */}
            <div className="space-y-3">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> SSL-verschlüsselt</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Rückruf möglich</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Antwort &lt; 1 Werktag</span>
                <span className="flex items-center gap-1"><Handshake className="h-3.5 w-3.5" /> Unverbindlich</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sticky bottom-0 bg-background pt-2 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-1 border-t border-border">
                <Button type="button" variant="outline" onClick={onClose} className="sm:w-auto">
                  Abbrechen
                </Button>
                <Button type="submit" disabled={submitting} className="sm:flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                  {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Wird gesendet…</>) : "Kaufanfrage absenden"}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">* Pflichtfelder</p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
