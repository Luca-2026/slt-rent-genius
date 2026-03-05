import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getNearestLocation } from "@/utils/plzLocationMapping";
import { Building2, Save, AlertTriangle, Mail } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AuthorizedPersonsManager } from "@/components/b2b/AuthorizedPersonsManager";

const legalForms = [
  "GmbH", "UG (haftungsbeschränkt)", "AG", "GmbH & Co. KG",
  "OHG", "KG", "Einzelunternehmen", "Freiberufler", "GbR", "Sonstige",
];

export default function CompanyProfile() {
  const { user, b2bProfile, loading, refreshB2BProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [legalForm, setLegalForm] = useState("");
  const [taxId, setTaxId] = useState("");
  const [tradeRegisterNumber, setTradeRegisterNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  // Track if any field changed
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/b2b/login");
  }, [user, loading, navigate]);

  // Populate form from profile
  useEffect(() => {
    if (b2bProfile) {
      setCompanyName(b2bProfile.company_name || "");
      setFirstName(b2bProfile.contact_first_name || "");
      setLastName(b2bProfile.contact_last_name || "");
      setBillingEmail(b2bProfile.billing_email || "");
      // Fetch full profile for remaining fields
      fetchFullProfile();
    }
  }, [b2bProfile?.id]);

  const fetchFullProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("b2b_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setCompanyName(data.company_name);
      setLegalForm(data.legal_form || "");
      setTaxId(data.tax_id || "");
      setTradeRegisterNumber(data.trade_register_number || "");
      setFirstName(data.contact_first_name);
      setLastName(data.contact_last_name);
      setPosition(data.contact_position || "");
      setPhone(data.contact_phone);
      setBillingEmail(data.billing_email || "");
      setStreet(data.street);
      setHouseNumber(data.house_number || "");
      setPostalCode(data.postal_code);
      setCity(data.city);
    }
  };

  const handleFieldChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!user || !b2bProfile) return;
    setSaving(true);

    try {
      const assignedLocation = getNearestLocation(postalCode);

      const { error } = await supabase
        .from("b2b_profiles")
        .update({
          company_name: companyName,
          legal_form: legalForm || null,
          tax_id: taxId || null,
          trade_register_number: tradeRegisterNumber || null,
          contact_first_name: firstName,
          contact_last_name: lastName,
          contact_position: position || null,
          contact_phone: phone,
          billing_email: billingEmail || null,
          street,
          house_number: houseNumber || null,
          postal_code: postalCode,
          city,
          assigned_location: assignedLocation,
          status: "pending" as const,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Notify admins via edge function
      try {
        await supabase.functions.invoke("notify-profile-change", {
          body: {
            profileId: b2bProfile.id,
            companyName,
            contactName: `${firstName} ${lastName}`,
          },
        });
      } catch {
        // Non-critical - don't block the save
      }

      await refreshB2BProfile();
      setHasChanges(false);
      setConfirmOpen(false);

      toast({
        title: "Firmendaten aktualisiert",
        description: "Deine Änderungen wurden gespeichert. Dein Konto muss erneut von einem Administrator freigegeben werden.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Ein Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <B2BPortalLayout title="Firmendaten & Berechtigungen" subtitle="Firmenprofil bearbeiten und autorisierte Personen verwalten">
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="company">Firmendaten</TabsTrigger>
          <TabsTrigger value="persons">Autorisierte Personen</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Firmendaten bearbeiten</CardTitle>
                  <CardDescription>
                    Änderungen an deinen Firmendaten erfordern eine erneute Freigabe durch einen Administrator.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {b2bProfile?.status === "pending" && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Freigabe ausstehend</p>
                    <p className="text-sm text-yellow-700">Dein Profil wird aktuell geprüft. Weitere Änderungen sind möglich.</p>
                  </div>
                </div>
              )}

              {/* Company info */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Unternehmen</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Firmenname *</label>
                    <Input value={companyName} onChange={handleFieldChange(setCompanyName)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Rechtsform</label>
                    <Select value={legalForm} onValueChange={(v) => { setLegalForm(v); setHasChanges(true); }}>
                      <SelectTrigger><SelectValue placeholder="Auswählen..." /></SelectTrigger>
                      <SelectContent>
                        {legalForms.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">USt-IdNr.</label>
                    <Input value={taxId} onChange={handleFieldChange(setTaxId)} placeholder="DE123456789" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Handelsregisternummer</label>
                    <Input value={tradeRegisterNumber} onChange={handleFieldChange(setTradeRegisterNumber)} />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Ansprechpartner</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Vorname *</label>
                    <Input value={firstName} onChange={handleFieldChange(setFirstName)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Nachname *</label>
                    <Input value={lastName} onChange={handleFieldChange(setLastName)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Position</label>
                    <Input value={position} onChange={handleFieldChange(setPosition)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Telefon *</label>
                    <Input value={phone} onChange={handleFieldChange(setPhone)} />
                  </div>
                </div>
              </div>

              {/* Billing */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Rechnungsversand</h3>
                <div>
                  <label className="block text-sm font-medium mb-1.5">E-Mail für Rechnungsversand</label>
                  <div className="relative">
                    <Input type="email" value={billingEmail} onChange={handleFieldChange(setBillingEmail)} placeholder="rechnung@firma.de" />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Firmenadresse</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium mb-1.5">Straße *</label>
                    <Input value={street} onChange={handleFieldChange(setStreet)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Hausnr.</label>
                    <Input value={houseNumber} onChange={handleFieldChange(setHouseNumber)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">PLZ *</label>
                    <Input value={postalCode} onChange={handleFieldChange(setPostalCode)} />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium mb-1.5">Stadt *</label>
                    <Input value={city} onChange={handleFieldChange(setCity)} />
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => setConfirmOpen(true)}
                  disabled={!hasChanges || saving || !companyName || !firstName || !lastName || !phone || !street || !postalCode || !city}
                  className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Änderungen speichern
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation dialog */}
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Firmendaten ändern?</AlertDialogTitle>
                <AlertDialogDescription>
                  Nach dem Speichern muss dein Konto erneut von einem Administrator freigegeben werden. 
                  Bis zur Freigabe kannst du keine neuen Mietanfragen stellen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleSave} disabled={saving}>
                  {saving ? "Wird gespeichert..." : "Bestätigen & Speichern"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="persons">
          {b2bProfile && <AuthorizedPersonsManager profileId={b2bProfile.id} />}
        </TabsContent>
      </Tabs>
    </B2BPortalLayout>
  );
}
