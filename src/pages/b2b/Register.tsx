import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Upload, CheckCircle2, Eye, EyeOff, Mail, FileText } from "lucide-react";
import { getNearestLocation, getLocationDisplayName } from "@/utils/plzLocationMapping";
import { AGBScrollableText } from "@/components/b2b/AGBScrollableText";

const legalForms = [
  "GmbH",
  "UG (haftungsbeschränkt)",
  "AG",
  "GmbH & Co. KG",
  "OHG",
  "KG",
  "Einzelunternehmen",
  "Freiberufler",
  "GbR",
  "Sonstige",
];

export default function B2BRegister() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Company
  const [companyName, setCompanyName] = useState("");
  const [legalForm, setLegalForm] = useState("");
  const [taxId, setTaxId] = useState("");
  const [tradeRegisterNumber, setTradeRegisterNumber] = useState("");

  // Contact
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");

  // Billing
  const [billingEmail, setBillingEmail] = useState("");
  // Address
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  // Document
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Terms
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  // Postal invoice
  const [postalInvoice, setPostalInvoice] = useState(false);

  const validateStep1 = () => {
    if (!email || !password || !passwordConfirm) {
      toast({ title: "Bitte alle Felder ausfüllen", variant: "destructive" });
      return false;
    }
    if (password.length < 8) {
      toast({ title: "Passwort muss mindestens 8 Zeichen haben", variant: "destructive" });
      return false;
    }
    if (password !== passwordConfirm) {
      toast({ title: "Passwörter stimmen nicht überein", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!companyName || !firstName || !lastName || !phone || !street || !houseNumber || !postalCode || !city) {
      toast({ title: "Bitte alle Pflichtfelder ausfüllen", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentFile) {
      toast({ title: "Bitte lade ein Dokument hoch", variant: "destructive" });
      return;
    }
    if (!acceptTerms || !acceptPrivacy) {
      toast({ title: "Bitte akzeptiere die AGB und Datenschutzerklärung", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create user account
      const { error: signUpError, data: signUpData } = await signUp(email, password);
      if (signUpError) throw signUpError;

      const user = signUpData?.user;
      
      if (!user) {
        throw new Error("Benutzer konnte nicht erstellt werden. Bitte versuche es erneut.");
      }

      // If the user has no identities, the email is already taken
      if (user.identities && user.identities.length === 0) {
        throw new Error(
          "Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich über die Login-Seite an oder setze dein Passwort zurück."
        );
      }

      const userId = user.id;
      const hasSession = !!signUpData?.session;

      if (hasSession) {
        // Session available — upload document and create profile directly
        const fileExt = documentFile.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("b2b-documents")
          .upload(fileName, documentFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("b2b-documents")
          .getPublicUrl(fileName);

        const assignedLocation = getNearestLocation(postalCode);

        const { error: profileError } = await supabase.from("b2b_profiles").insert({
          user_id: userId,
          company_name: companyName,
          legal_form: legalForm,
          tax_id: taxId,
          trade_register_number: tradeRegisterNumber,
          contact_first_name: firstName,
          contact_last_name: lastName,
          contact_position: position,
          contact_phone: phone,
          contact_email: email,
          billing_email: billingEmail || null,
          street: street,
          house_number: houseNumber,
          postal_code: postalCode,
          city: city,
          assigned_location: assignedLocation,
          document_url: publicUrl,
          document_filename: documentFile.name,
          postal_invoice: postalInvoice,
          status: "pending",
        });

        if (profileError) throw profileError;

        toast({
          title: "Registrierung erfolgreich!",
          description: "Dein Antrag wird geprüft. Du erhältst eine E-Mail, sobald dein Konto freigeschaltet wurde.",
        });
        navigate("/b2b/dashboard");
      } else {
        // No session — email confirmation required
        // Store registration data in localStorage so we can complete profile after confirmation
        localStorage.setItem("b2b_pending_registration", JSON.stringify({
          companyName, legalForm, taxId, tradeRegisterNumber,
          firstName, lastName, position, phone, email,
          billingEmail, street, houseNumber, postalCode, city,
          postalInvoice,
        }));

        toast({
          title: "Bestätigungs-E-Mail gesendet!",
          description: "Bitte überprüfe dein E-Mail-Postfach und klicke auf den Bestätigungslink, um die Registrierung abzuschließen.",
        });
        navigate("/b2b/login");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorTitle = "Registrierung fehlgeschlagen";
      let errorDescription = error.message || "Ein Fehler ist aufgetreten. Bitte versuche es erneut.";
      
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("rate limit") || msg.includes("rate_limit")) {
        errorTitle = "Zu viele Versuche";
        errorDescription = "Bitte warte einige Minuten und versuche es dann erneut.";
      } else if (msg.includes("already registered") || msg.includes("bereits registriert")) {
        errorTitle = "E-Mail bereits vergeben";
        errorDescription = "Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich über die Login-Seite an oder setze dein Passwort zurück.";
      } else if (msg.includes("password") && (msg.includes("short") || msg.includes("weak") || msg.includes("length"))) {
        errorTitle = "Passwort zu schwach";
        errorDescription = "Bitte wähle ein stärkeres Passwort mit mindestens 6 Zeichen.";
      } else if (msg.includes("invalid") && msg.includes("email")) {
        errorTitle = "Ungültige E-Mail";
        errorDescription = "Bitte gib eine gültige E-Mail-Adresse ein.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <section className="py-12 lg:py-16 bg-surface-light">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      s < step
                        ? "bg-accent text-accent-foreground"
                        : s === step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-1 ${s < step ? "bg-accent" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>

            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">B2B-Registrierung</CardTitle>
                <CardDescription>
                  {step === 1 && "Schritt 1: Zugangsdaten erstellen"}
                  {step === 2 && "Schritt 2: Firmendaten angeben"}
                  {step === 3 && "Schritt 3: Dokument hochladen & abschließen"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Account */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-headline mb-1.5">
                          E-Mail *
                        </label>
                        <Input
                          type="email"
                          placeholder="firma@beispiel.de"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-headline mb-1.5">
                          Passwort * (mind. 8 Zeichen)
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-headline mb-1.5">
                          Passwort bestätigen *
                        </label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                        onClick={() => validateStep1() && setStep(2)}
                      >
                        Weiter zu Firmendaten
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Company Info */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-headline mb-1.5">
                            Firmenname *
                          </label>
                          <Input
                            placeholder="Musterfirma (ohne Gesellschaftsform)"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-headline mb-1.5">
                            Rechtsform
                          </label>
                          <Select value={legalForm} onValueChange={setLegalForm}>
                            <SelectTrigger>
                              <SelectValue placeholder="Auswählen..." />
                            </SelectTrigger>
                            <SelectContent>
                              {legalForms.map((form) => (
                                <SelectItem key={form} value={form}>{form}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-headline mb-1.5">
                            USt-IdNr.
                          </label>
                          <Input
                            placeholder="DE123456789"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                          />
                        </div>
                      </div>

                      <hr className="my-4" />
                      <h3 className="font-medium text-headline">Ansprechpartner</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-headline mb-1.5">
                            Vorname *
                          </label>
                          <Input
                            placeholder="Max"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-headline mb-1.5">
                            Nachname *
                          </label>
                          <Input
                            placeholder="Mustermann"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-headline mb-1.5">
                            Position
                          </label>
                          <Input
                            placeholder="Geschäftsführer"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-headline mb-1.5">
                            Telefon *
                          </label>
                          <Input
                            placeholder="0151 123 456 78"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <hr className="my-4" />
                      <h3 className="font-medium text-headline">Rechnungsversand</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-headline mb-1.5">
                          E-Mail für Rechnungsversand
                        </label>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="rechnung@musterfirma.de"
                            value={billingEmail}
                            onChange={(e) => setBillingEmail(e.target.value)}
                          />
                          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Optional – wird für den digitalen Rechnungsversand verwendet. Falls leer, wird die Kontakt-E-Mail genutzt.
                        </p>
                      </div>

                      <hr className="my-4" />
                      <h3 className="font-medium text-headline">Firmenadresse</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-headline mb-1.5">
                            Straße *
                          </label>
                          <Input
                            placeholder="Musterstraße"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-headline mb-1.5">
                            Hausnr. *
                          </label>
                          <Input
                            placeholder="123"
                            value={houseNumber}
                            onChange={(e) => setHouseNumber(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-headline mb-1.5">
                            PLZ *
                          </label>
                          <Input
                            placeholder="47807"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            required
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-headline mb-1.5">
                            Stadt *
                          </label>
                          <Input
                            placeholder="Krefeld"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setStep(1)}>
                          Zurück
                        </Button>
                        <Button
                          type="button"
                          className="flex-1 bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                          onClick={() => validateStep2() && setStep(3)}
                        >
                          Weiter zum Upload
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Document & Submit */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-headline mb-2">
                          Handelsregisterauszug oder Gewerbeanmeldung hochladen *
                        </label>
                        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                          {documentFile ? (
                            <div className="flex items-center justify-center gap-3">
                              <CheckCircle2 className="h-6 w-6 text-accent" />
                              <span className="text-headline font-medium">{documentFile.name}</span>
                              <button
                                type="button"
                                onClick={() => setDocumentFile(null)}
                                className="text-destructive text-sm hover:underline"
                              >
                                Entfernen
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                              <p className="text-muted-foreground mb-3">
                                PDF, JPG oder PNG (max. 10 MB)
                              </p>
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                                  className="hidden"
                                />
                                <Button type="button" variant="outline" asChild>
                                  <span>Datei auswählen</span>
                                </Button>
                              </label>
                            </>
                          )}
                        </div>
                      </div>

                      {/* AGB Full Text */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <label className="block text-sm font-medium text-headline">
                            Allgemeine Geschäftsbedingungen (AGB) *
                          </label>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Bitte lies die folgenden AGB sorgfältig durch und bestätige sie anschließend.
                        </p>
                        <AGBScrollableText />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id="terms"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mt-1"
                          />
                          <label htmlFor="terms" className="text-sm text-muted-foreground">
                            Ich habe die oben aufgeführten <Link to="/agb" className="text-primary hover:underline">AGB</Link> vollständig gelesen und akzeptiere sie. *
                          </label>
                        </div>
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id="privacy"
                            checked={acceptPrivacy}
                            onChange={(e) => setAcceptPrivacy(e.target.checked)}
                            className="mt-1"
                          />
                          <label htmlFor="privacy" className="text-sm text-muted-foreground">
                            Ich habe die <Link to="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</Link> gelesen und stimme der Verarbeitung meiner Daten zu. *
                          </label>
                        </div>

                        {/* Postal Invoice Option */}
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              id="postalInvoice"
                              checked={postalInvoice}
                              onChange={(e) => setPostalInvoice(e.target.checked)}
                              className="mt-1"
                            />
                            <label htmlFor="postalInvoice" className="text-sm text-muted-foreground">
                              <span className="font-medium text-headline">Rechnungsversand per Post</span>
                              <br />
                              Ich möchte meine Rechnungen zusätzlich per Post erhalten.
                              <span className="inline-block ml-1 text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                                +2,50 € pro Rechnung
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setStep(2)}>
                          Zurück
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                          disabled={isLoading}
                        >
                          {isLoading ? "Wird registriert..." : "Registrierung abschließen"}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>

                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    Bereits registriert?{" "}
                    <Link to="/b2b/login" className="text-primary hover:underline">
                      Zum Login
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
