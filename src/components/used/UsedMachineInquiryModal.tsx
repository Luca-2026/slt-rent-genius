import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, CheckCircle, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface MachineData {
  id: string;
  manufacturer: string;
  model: string;
  year: number | null;
  price: string;
  location: string;
  pickupLocations?: string[];
  referenceNumber: string;
  status: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  machine: MachineData | null; // null = general inquiry
}

type FormView = "form" | "success" | "error";

const locationLabels: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim",
};

export function UsedMachineInquiryModal({ open, onClose, machine }: Props) {
  const [view, setView] = useState<FormView>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Block 1 general
  const [searchedMachine, setSearchedMachine] = useState("");
  const [preferredManufacturer, setPreferredManufacturer] = useState("");

  // Block 2
  const [interest, setInterest] = useState("");
  const [wishDate, setWishDate] = useState<Date | undefined>();
  const [deliveryOption, setDeliveryOption] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryPlz, setDeliveryPlz] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");

  // Block 3
  const [customerType, setCustomerType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [vatId, setVatId] = useState("");
  const [salutation, setSalutation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Block 4
  const [billingIdentical, setBillingIdentical] = useState(true);
  const [billingCompany, setBillingCompany] = useState("");
  const [billingStreet, setBillingStreet] = useState("");
  const [billingPlz, setBillingPlz] = useState("");
  const [billingCity, setBillingCity] = useState("");

  // Block 5
  const [message, setMessage] = useState("");
  const [privacy, setPrivacy] = useState(false);

  useEffect(() => {
    if (open) {
      setView("form");
      setErrors({});
    }
  }, [open]);

  const resetForm = () => {
    setSearchedMachine(""); setPreferredManufacturer("");
    setInterest(""); setWishDate(undefined); setDeliveryOption("");
    setPickupLocation("");
    setDeliveryStreet(""); setDeliveryPlz(""); setDeliveryCity("");
    setCustomerType(""); setCompanyName(""); setVatId("");
    setSalutation(""); setFirstName(""); setLastName("");
    setEmail(""); setPhone("");
    setBillingIdentical(true); setBillingCompany(""); setBillingStreet("");
    setBillingPlz(""); setBillingCity("");
    setMessage(""); setPrivacy(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    setView("form");
    onClose();
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!machine && !searchedMachine.trim()) errs.searchedMachine = "Bitte beschreiben Sie, welche Maschine Sie suchen.";
    if (!interest) errs.interest = "Bitte wählen Sie Ihre Kaufabsicht.";
    if (!deliveryOption) errs.deliveryOption = "Bitte wählen Sie Lieferung oder Abholung.";
    if (deliveryOption === "lieferung") {
      if (!deliveryStreet.trim()) errs.deliveryStreet = "Pflichtfeld";
      if (!deliveryPlz.trim()) errs.deliveryPlz = "Pflichtfeld";
      if (!deliveryCity.trim()) errs.deliveryCity = "Pflichtfeld";
    }
    const pickupLocs = machine?.pickupLocations && machine.pickupLocations.length > 0
      ? machine.pickupLocations
      : (machine?.location ? [machine.location] : []);
    if (deliveryOption === "abholung" && pickupLocs.length > 1 && !pickupLocation) {
      errs.pickupLocation = "Bitte wählen Sie einen Abholstandort.";
    }
    if (!customerType) errs.customerType = "Bitte wählen Sie einen Kundentyp.";
    if (customerType === "business" && !companyName.trim()) errs.companyName = "Pflichtfeld";
    if (!salutation) errs.salutation = "Pflichtfeld";
    if (!firstName.trim()) errs.firstName = "Pflichtfeld";
    if (!lastName.trim()) errs.lastName = "Pflichtfeld";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Bitte geben Sie eine gültige E-Mail ein.";
    if (!phone.trim() || phone.replace(/\D/g, "").length < 6) errs.phone = "Mindestens 6 Ziffern erforderlich.";
    if (!billingIdentical) {
      if (!billingCompany.trim()) errs.billingCompany = "Pflichtfeld";
      if (!billingStreet.trim()) errs.billingStreet = "Pflichtfeld";
      if (!billingPlz.trim()) errs.billingPlz = "Pflichtfeld";
      if (!billingCity.trim()) errs.billingCity = "Pflichtfeld";
    }
    if (!privacy) errs.privacy = "Bitte stimmen Sie der Datenschutzerklärung zu.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const loc = machine ? (locationLabels[machine.location] || machine.location) : "";
      const pickupLocs = machine?.pickupLocations && machine.pickupLocations.length > 0
        ? machine.pickupLocations
        : (machine?.location ? [machine.location] : []);
      const chosenPickup = pickupLocs.length > 1 ? pickupLocation : pickupLocs[0] || machine?.location || "";
      const pickupLabel = chosenPickup ? (locationLabels[chosenPickup] || chosenPickup) : loc;
      const { error } = await supabase.functions.invoke("send-used-inquiry", {
        body: {
          // machine data
          articleNumber: machine?.referenceNumber || "",
          manufacturerModel: machine ? `${machine.manufacturer} ${machine.model}` : "",
          year: machine?.year?.toString() || "",
          price: machine?.price || "",
          location: loc,
          // general inquiry
          searchedMachine: !machine ? searchedMachine : "",
          preferredManufacturer: !machine ? preferredManufacturer : "",
          // purchase intent
          interest,
          wishDate: wishDate ? format(wishDate, "dd.MM.yyyy") : "",
          deliveryOption: deliveryOption === "lieferung" ? "Lieferung an meine Adresse" : `Selbstabholung – Standort ${pickupLabel}`,
          deliveryStreet, deliveryPlz, deliveryCity,
          // contact
          customerType: customerType === "business" ? "Gewerblicher Kunde" : "Privatkunde",
          companyName, vatId,
          salutation, firstName, lastName, email, phone,
          // billing
          billingIdentical,
          billingCompany, billingStreet, billingPlz, billingCity,
          // message
          message,
        },
      });
      if (error) throw error;
      setView("success");
    } catch {
      setView("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loc = machine ? (locationLabels[machine.location] || machine.location) : "";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-[620px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <DialogTitle className="text-lg font-bold text-headline pr-8">
            {machine ? `Anfrage: ${machine.manufacturer} ${machine.model}` : "Gebrauchtmaschinen-Anfrage"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {machine
              ? `Artikel-Nr. ${machine.referenceNumber} · Bj. ${machine.year || "–"} · ${machine.price}`
              : "Sie suchen eine bestimmte Maschine?"
            }
          </DialogDescription>
        </DialogHeader>

        {view === "success" && (
          <div className="p-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-bold text-headline">Ihre Anfrage ist eingegangen.</h3>
            <p className="text-muted-foreground">Wir melden uns innerhalb von 1 Werktag persönlich bei Ihnen.</p>
            <Button onClick={handleClose}>Modal schließen</Button>
          </div>
        )}

        {view === "error" && (
          <div className="p-8 text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
            <h3 className="text-xl font-bold text-headline">Versand fehlgeschlagen</h3>
            <p className="text-muted-foreground">
              Bitte erneut versuchen oder direkt schreiben an:{" "}
              <a href="mailto:kaufanfrage@slt-rental.de" className="text-primary underline">kaufanfrage@slt-rental.de</a>
            </p>
            <Button onClick={() => setView("form")}>Nochmal versuchen</Button>
          </div>
        )}

        {view === "form" && (
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">

            {/* Block 1 — Machine Info */}
            {machine ? (
              <div className="space-y-2 pt-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Angefragte Maschine</h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1.5 text-sm">
                  <InfoRow label="Artikel-Nr." value={machine.referenceNumber} />
                  <InfoRow label="Hersteller & Modell" value={`${machine.manufacturer} ${machine.model}`} />
                  <InfoRow label="Baujahr" value={machine.year?.toString() || "–"} />
                  <InfoRow label="Preis" value={machine.price} />
                  <InfoRow label="Standort" value={loc} />
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gesuchte Maschine</h3>
                <div>
                  <Label htmlFor="searched-machine">Was suchen Sie? *</Label>
                  <Input
                    id="searched-machine"
                    placeholder="z. B. Minibagger ca. 3 t, Elektro"
                    value={searchedMachine}
                    onChange={(e) => setSearchedMachine(e.target.value)}
                  />
                  <FieldError field="searchedMachine" />
                </div>
                <div>
                  <Label htmlFor="pref-manufacturer">Gewünschter Hersteller (optional)</Label>
                  <Select value={preferredManufacturer} onValueChange={setPreferredManufacturer}>
                    <SelectTrigger><SelectValue placeholder="Hersteller wählen" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZOOMLION">ZOOMLION</SelectItem>
                      <SelectItem value="BAUMAX">BAUMAX</SelectItem>
                      <SelectItem value="TEMARED">TEMARED</SelectItem>
                      <SelectItem value="egal">Egal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Block 2 — Purchase Intent */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Kaufabsicht & Lieferung</h3>

              <div>
                <Label>Ich bin interessiert an: *</Label>
                <RadioGroup value={interest} onValueChange={setInterest} className="mt-1.5 space-y-1.5">
                  {[
                    { value: "kauf", label: "Kauf zum genannten Preis" },
                    { value: "verhandlung", label: "Preisverhandlung gewünscht" },
                    { value: "besichtigung", label: "Erst besichtigen, dann entscheiden" },
                    { value: "info", label: "Nur Informationen anfordern" },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`interest-${opt.value}`} />
                      <Label htmlFor={`interest-${opt.value}`} className="font-normal cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <FieldError field="interest" />
              </div>

              <div>
                <Label>Gewünschter Termin (Besichtigung / Übergabe)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !wishDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {wishDate ? format(wishDate, "PPP", { locale: de }) : "Termin wählen"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={wishDate}
                      onSelect={setWishDate}
                      disabled={(date) => date < tomorrow}
                      className="p-3 pointer-events-auto"
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {(() => {
                const pickupLocs = machine?.pickupLocations && machine.pickupLocations.length > 0
                  ? machine.pickupLocations
                  : (machine?.location ? [machine.location] : []);
                const singlePickupLabel = pickupLocs.length === 1
                  ? (locationLabels[pickupLocs[0]] || pickupLocs[0])
                  : "";
                return (
                  <div>
                    <Label>Lieferung oder Abholung? *</Label>
                    <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption} className="mt-1.5 space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lieferung" id="delivery-lieferung" />
                        <Label htmlFor="delivery-lieferung" className="font-normal cursor-pointer">Lieferung an meine Adresse</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="abholung" id="delivery-abholung" />
                        <Label htmlFor="delivery-abholung" className="font-normal cursor-pointer">
                          {!machine
                            ? "Selbstabholung"
                            : pickupLocs.length > 1
                              ? "Selbstabholung (Standort wählen)"
                              : `Selbstabholung – Standort ${singlePickupLabel}`}
                        </Label>
                      </div>
                    </RadioGroup>
                    <FieldError field="deliveryOption" />

                    {deliveryOption === "abholung" && pickupLocs.length > 1 && (
                      <div className="mt-3 pl-6 border-l-2 border-primary/20 py-2">
                        <Label className="text-sm">Abholstandort *</Label>
                        <RadioGroup value={pickupLocation} onValueChange={setPickupLocation} className="mt-1.5 space-y-1.5">
                          {pickupLocs.map((l) => (
                            <div key={l} className="flex items-center space-x-2">
                              <RadioGroupItem value={l} id={`pickup-${l}`} />
                              <Label htmlFor={`pickup-${l}`} className="font-normal cursor-pointer">
                                {locationLabels[l] || l}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        <FieldError field="pickupLocation" />
                      </div>
                    )}
                  </div>
                );
              })()}

              {deliveryOption === "lieferung" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-4 border-l-2 border-primary/20">
                  <div className="sm:col-span-3">
                    <Label>Straße & Hausnummer *</Label>
                    <Input value={deliveryStreet} onChange={(e) => setDeliveryStreet(e.target.value)} />
                    <FieldError field="deliveryStreet" />
                  </div>
                  <div>
                    <Label>PLZ *</Label>
                    <Input value={deliveryPlz} onChange={(e) => setDeliveryPlz(e.target.value)} />
                    <FieldError field="deliveryPlz" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Ort *</Label>
                    <Input value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} />
                    <FieldError field="deliveryCity" />
                  </div>
                </div>
              )}
            </div>

            {/* Block 3 — Contact */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Kontaktdaten</h3>

              <div>
                <Label>Kundentyp *</Label>
                <RadioGroup value={customerType} onValueChange={setCustomerType} className="mt-1.5 space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="ct-business" />
                    <Label htmlFor="ct-business" className="font-normal cursor-pointer">Gewerblicher Kunde / Unternehmen</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="ct-private" />
                    <Label htmlFor="ct-private" className="font-normal cursor-pointer">Privatkunde</Label>
                  </div>
                </RadioGroup>
                <FieldError field="customerType" />
              </div>

              {customerType === "business" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Firmenname *</Label>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    <FieldError field="companyName" />
                  </div>
                  <div>
                    <Label>USt-IdNr. (optional)</Label>
                    <Input value={vatId} onChange={(e) => setVatId(e.target.value)} />
                  </div>
                </div>
              )}

              <div>
                <Label>Anrede *</Label>
                <Select value={salutation} onValueChange={setSalutation}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Herr">Herr</SelectItem>
                    <SelectItem value="Frau">Frau</SelectItem>
                    <SelectItem value="Divers">Divers</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError field="salutation" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Vorname *</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  <FieldError field="firstName" />
                </div>
                <div>
                  <Label>Nachname *</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  <FieldError field="lastName" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>E-Mail *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <FieldError field="email" />
                </div>
                <div>
                  <Label>Telefon *</Label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <FieldError field="phone" />
                </div>
              </div>
            </div>

            {/* Block 4 — Billing */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rechnungsadresse</h3>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="billing-identical"
                  checked={billingIdentical}
                  onCheckedChange={(c) => setBillingIdentical(c === true)}
                />
                <Label htmlFor="billing-identical" className="font-normal cursor-pointer text-sm">
                  Rechnungsadresse identisch mit {deliveryOption === "lieferung" ? "Lieferadresse" : "Abholadresse"}
                </Label>
              </div>
              {!billingIdentical && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-4 border-l-2 border-primary/20">
                  <div className="sm:col-span-3">
                    <Label>Firma / Name *</Label>
                    <Input value={billingCompany} onChange={(e) => setBillingCompany(e.target.value)} />
                    <FieldError field="billingCompany" />
                  </div>
                  <div className="sm:col-span-3">
                    <Label>Straße & Nr. *</Label>
                    <Input value={billingStreet} onChange={(e) => setBillingStreet(e.target.value)} />
                    <FieldError field="billingStreet" />
                  </div>
                  <div>
                    <Label>PLZ *</Label>
                    <Input value={billingPlz} onChange={(e) => setBillingPlz(e.target.value)} />
                    <FieldError field="billingPlz" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Ort *</Label>
                    <Input value={billingCity} onChange={(e) => setBillingCity(e.target.value)} />
                    <FieldError field="billingCity" />
                  </div>
                </div>
              )}
            </div>

            {/* Block 5 — Message & Privacy */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Nachricht</h3>
              <div>
                <Label>Ihre Nachricht (optional)</Label>
                <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="used-privacy-modal"
                  checked={privacy}
                  onCheckedChange={(c) => setPrivacy(c === true)}
                />
                <Label htmlFor="used-privacy-modal" className="text-xs text-muted-foreground leading-relaxed font-normal cursor-pointer">
                  Ich habe die{" "}
                  <a href="/datenschutz" className="underline hover:text-primary" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>{" "}
                  gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung dieser Anfrage zu. *
                </Label>
              </div>
              <FieldError field="privacy" />
            </div>

            {/* Submit */}
            <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t border-border -mx-6 px-6">
              <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Anfrage absenden
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}
