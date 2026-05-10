import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const LOCATION_LABEL: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};
const LOCATION_EMAIL: Record<string, string> = {
  krefeld: "krefeld@slt-rental.de",
  bonn: "bonn@slt-rental.de",
  muelheim: "muelheim@slt-rental.de",
};
const LOCATION_PHONE: Record<string, string> = {
  krefeld: "02151 417 99 04",
  bonn: "0228 504 660 61",
  muelheim: "02151 417 99 04",
};
const LOCATION_ADDRESS: Record<string, string> = {
  krefeld: "Anrather Straße 291, 47807 Krefeld",
  bonn: "Drachenburgstraße 8, 53179 Bonn",
  muelheim: "Ruhrorter Str. 122, 45478 Mülheim an der Ruhr",
};

interface Props {
  productName: string;
  subjectPrefill: string;
}

export function CampingInquiryForm({ productName, subjectPrefill }: Props) {
  const [view, setView] = useState<"form" | "success" | "error">("form");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [location, setLocation] = useState<string>("krefeld");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [persons, setPersons] = useState("");
  const [pets, setPets] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [privacy, setPrivacy] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!location) errs.location = "Bitte Wunschstandort wählen.";
    if (!startDate) errs.startDate = "Pflichtfeld";
    if (!endDate) errs.endDate = "Pflichtfeld";
    if (!name.trim()) errs.name = "Pflichtfeld";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Gültige E-Mail erforderlich.";
    if (!phone.trim() || phone.replace(/\D/g, "").length < 6) errs.phone = "Mindestens 6 Ziffern.";
    if (!privacy) errs.privacy = "Bitte Datenschutz akzeptieren.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const composedMessage = [
        `Betreff: ${subjectPrefill}`,
        ``,
        `Wunschstandort: ${LOCATION_LABEL[location]}`,
        `Anzahl Personen: ${persons || "—"}`,
        `Haustiere: ${pets ? "Ja" : "Nein"}`,
        ``,
        message ? `Nachricht des Kunden:\n${message}` : "(Keine zusätzliche Nachricht)",
      ].join("\n");

      const { error } = await supabase.functions.invoke("send-inquiry-email", {
        body: {
          productName,
          locationName: LOCATION_LABEL[location],
          locationEmail: LOCATION_EMAIL[location],
          locationPhone: LOCATION_PHONE[location],
          locationAddress: LOCATION_ADDRESS[location],
          name,
          email,
          phone,
          startDate,
          endDate,
          message: composedMessage,
          deliveryRequested: false,
        },
      });
      if (error) throw error;
      setView("success");
    } catch {
      setView("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (view === "success") {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center space-y-4">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
        <h3 className="text-xl font-bold text-headline">Deine Anfrage ist eingegangen.</h3>
        <p className="text-muted-foreground">
          Wir melden uns innerhalb von 24 Stunden mit einem konkreten Angebot bei dir.
        </p>
      </div>
    );
  }

  if (view === "error") {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center space-y-4">
        <AlertTriangle className="h-14 w-14 text-destructive mx-auto" />
        <h3 className="text-xl font-bold text-headline">Versand fehlgeschlagen</h3>
        <p className="text-muted-foreground">
          Bitte erneut versuchen oder direkt schreiben an{" "}
          <a href="mailto:mieten@slt-rental.de" className="text-primary underline">
            mieten@slt-rental.de
          </a>.
        </p>
        <Button onClick={() => setView("form")}>Nochmal versuchen</Button>
      </div>
    );
  }

  const FieldError = ({ k }: { k: string }) =>
    errors[k] ? <p className="text-xs text-destructive mt-1">{errors[k]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-headline">Mietanfrage senden</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Betreff: <span className="font-medium text-foreground">{subjectPrefill}</span>
        </p>
      </div>

      <div>
        <Label htmlFor="loc">Wunschstandort *</Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger id="loc" className="mt-1">
            <SelectValue placeholder="Standort wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="krefeld">Krefeld</SelectItem>
            <SelectItem value="bonn">Bonn</SelectItem>
            <SelectItem value="muelheim">Mülheim an der Ruhr</SelectItem>
          </SelectContent>
        </Select>
        <FieldError k="location" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start">Abholung *</Label>
          <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" />
          <FieldError k="startDate" />
        </div>
        <div>
          <Label htmlFor="end">Rückgabe *</Label>
          <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1" />
          <FieldError k="endDate" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="persons">Anzahl Personen</Label>
          <Input
            id="persons"
            type="number"
            min={1}
            max={5}
            value={persons}
            onChange={(e) => setPersons(e.target.value)}
            className="mt-1"
            placeholder="z. B. 4"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer pb-2">
            <Checkbox checked={pets} onCheckedChange={(v) => setPets(!!v)} />
            <span className="text-sm">Haustiere geplant</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          <FieldError k="name" />
        </div>
        <div>
          <Label htmlFor="email">E-Mail *</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          <FieldError k="email" />
        </div>
        <div>
          <Label htmlFor="phone">Telefon *</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
          <FieldError k="phone" />
        </div>
      </div>

      <div>
        <Label htmlFor="msg">Nachricht (optional)</Label>
        <Textarea
          id="msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1"
          placeholder="Zugfahrzeug, Reiseziel, Sonderwünsche …"
        />
      </div>

      <label className="flex items-start gap-2 cursor-pointer">
        <Checkbox checked={privacy} onCheckedChange={(v) => setPrivacy(!!v)} className="mt-0.5" />
        <span className="text-xs text-muted-foreground">
          Ich habe die{" "}
          <Link to="/datenschutz" className="underline text-primary">
            Datenschutzerklärung
          </Link>{" "}
          zur Kenntnis genommen.
        </span>
      </label>
      <FieldError k="privacy" />

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Wird gesendet …
          </>
        ) : (
          "Unverbindliche Anfrage senden"
        )}
      </Button>
    </form>
  );
}
