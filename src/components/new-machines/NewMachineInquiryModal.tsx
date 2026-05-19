import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, AlertTriangle, Package } from "lucide-react";
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
    priceLabel: string;
    image?: string | null;
  };
}

type View = "form" | "success" | "error";

export function NewMachineInquiryModal({ open, onClose, machine }: Props) {
  const [view, setView] = useState<View>("form");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [kundentyp, setKundentyp] = useState("Privatkunde");
  const [firmenname, setFirmenname] = useState("");
  const [anrede, setAnrede] = useState("");
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [anzahl, setAnzahl] = useState("1");
  const [lieferOption, setLieferOption] = useState("Lieferung");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [nachricht, setNachricht] = useState("");
  const [datenschutz, setDatenschutz] = useState(false);

  useEffect(() => {
    if (open) {
      setView("form");
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!anrede) errs.anrede = "Pflichtfeld";
    if (!vorname.trim()) errs.vorname = "Pflichtfeld";
    if (!nachname.trim()) errs.nachname = "Pflichtfeld";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Bitte gültige E-Mail";
    if (!telefon.trim() || telefon.replace(/\D/g, "").length < 6) errs.telefon = "Mindestens 6 Ziffern";
    if (kundentyp === "Gewerbekunde" && !firmenname.trim()) errs.firmenname = "Pflichtfeld";
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
          produktkategorie: machine.name,
          modell: `${machine.brand} ${machine.model} (${machine.name})`,
          anzahl,
          anforderungen: `Direktanfrage zu: ${machine.name} – Preis: ${machine.priceLabel} – URL: https://www.slt-rental.de/verkauf/neumaschinen/${machine.slug}`,
          lieferOption,
          strasse: "",
          plz,
          ort,
          lieferhinweis: "",
          kundentyp,
          firmenname,
          ustIdNr: "",
          anrede,
          titel: "",
          vorname,
          nachname,
          email,
          telefon,
          wunschtermin: "",
          rechnungGleich: true,
          rechnungLand: "Deutschland",
          nachricht,
          wieGefunden: "Produktseite Neumaschine",
          addons: [],
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
      <DialogContent className="max-w-[620px] w-[calc(100vw-1rem)] max-h-[92vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sticky top-0 z-10 bg-background border-b border-border px-4 sm:px-6 py-4">
          <DialogTitle className="text-base sm:text-lg font-bold text-headline pr-8 leading-tight">
            Anfrage: {machine.brand} {machine.model}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {machine.priceLabel} · Antwort innerhalb von 1 Werktag
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
            {/* Machine summary */}
            <div className="flex gap-3 items-center bg-muted/50 rounded-lg p-3">
              <div className="w-14 h-14 rounded bg-background flex items-center justify-center shrink-0 overflow-hidden border border-border">
                {machine.image ? (
                  <img src={machine.image} alt={machine.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{machine.brand}</p>
                <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{machine.name}</p>
              </div>
            </div>

            {/* Kundentyp */}
            <div>
              <Label>Kundentyp *</Label>
              <RadioGroup value={kundentyp} onValueChange={setKundentyp} className="mt-1.5 flex flex-wrap gap-x-4 gap-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Privatkunde" id="kt-priv" />
                  <Label htmlFor="kt-priv" className="font-normal cursor-pointer">Privatkunde</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Gewerbekunde" id="kt-gew" />
                  <Label htmlFor="kt-gew" className="font-normal cursor-pointer">Gewerbekunde</Label>
                </div>
              </RadioGroup>
            </div>

            {kundentyp === "Gewerbekunde" && (
              <div>
                <Label htmlFor="firmenname">Firmenname *</Label>
                <Input id="firmenname" value={firmenname} onChange={(e) => setFirmenname(e.target.value)} />
                <FieldError field="firmenname" />
              </div>
            )}

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
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
                <Label htmlFor="vorname">Vorname *</Label>
                <Input id="vorname" value={vorname} onChange={(e) => setVorname(e.target.value)} />
                <FieldError field="vorname" />
              </div>
              <div>
                <Label htmlFor="nachname">Nachname *</Label>
                <Input id="nachname" value={nachname} onChange={(e) => setNachname(e.target.value)} />
                <FieldError field="nachname" />
              </div>
              <div>
                <Label htmlFor="email">E-Mail *</Label>
                <Input id="email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <FieldError field="email" />
              </div>
              <div>
                <Label htmlFor="telefon">Telefon *</Label>
                <Input id="telefon" type="tel" inputMode="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
                <FieldError field="telefon" />
              </div>
            </div>

            {/* Order info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="anzahl">Anzahl</Label>
                <Input id="anzahl" type="number" min={1} value={anzahl} onChange={(e) => setAnzahl(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Lieferung / Abholung</Label>
                <Select value={lieferOption} onValueChange={setLieferOption}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lieferung">Lieferung an meine Adresse</SelectItem>
                    <SelectItem value="Abholung Krefeld">Selbstabholung Krefeld</SelectItem>
                    <SelectItem value="Abholung Bonn">Selbstabholung Bonn</SelectItem>
                    <SelectItem value="Abholung Mülheim an der Ruhr">Selbstabholung Mülheim an der Ruhr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {lieferOption === "Lieferung" && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="plz">PLZ</Label>
                  <Input id="plz" inputMode="numeric" value={plz} onChange={(e) => setPlz(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="ort">Ort</Label>
                  <Input id="ort" value={ort} onChange={(e) => setOrt(e.target.value)} />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="nachricht">Nachricht (optional)</Label>
              <Textarea id="nachricht" rows={3} value={nachricht} onChange={(e) => setNachricht(e.target.value)} placeholder="Fragen, Wunschtermin, Finanzierung…" />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <Checkbox checked={datenschutz} onCheckedChange={(v) => setDatenschutz(v === true)} className="mt-0.5" />
              <span className="text-xs text-muted-foreground leading-snug">
                Ich habe die <Link to="/datenschutz" target="_blank" className="text-primary underline">Datenschutzerklärung</Link> gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung der Anfrage zu.
              </span>
            </label>
            <FieldError field="datenschutz" />

            <div className="flex flex-col sm:flex-row gap-2 sticky bottom-0 bg-background pt-2 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-1 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} className="sm:w-auto">
                Abbrechen
              </Button>
              <Button type="submit" disabled={submitting} className="sm:flex-1">
                {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Wird gesendet…</>) : "Anfrage absenden"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
