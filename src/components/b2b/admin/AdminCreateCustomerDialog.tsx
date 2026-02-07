import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function AdminCreateCustomerDialog({ open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    company_name: "",
    legal_form: "",
    contact_first_name: "",
    contact_last_name: "",
    contact_phone: "",
    contact_email: "",
    street: "",
    house_number: "",
    postal_code: "",
    city: "",
    country: "Deutschland",
    tax_id: "",
    credit_limit: 0,
    assigned_location: "",
  });

  const resetForm = () => {
    setForm({
      email: "", password: "", company_name: "", legal_form: "",
      contact_first_name: "", contact_last_name: "", contact_phone: "",
      contact_email: "", street: "", house_number: "", postal_code: "",
      city: "", country: "Deutschland", tax_id: "", credit_limit: 0,
      assigned_location: "",
    });
  };

  const handleCreate = async () => {
    if (!form.email || !form.password || !form.company_name || !form.contact_first_name || 
        !form.contact_last_name || !form.contact_phone || !form.street || !form.postal_code || !form.city) {
      toast({ title: "Fehler", description: "Bitte fülle alle Pflichtfelder aus.", variant: "destructive" });
      return;
    }

    if (form.password.length < 6) {
      toast({ title: "Fehler", description: "Passwort muss mindestens 6 Zeichen lang sein.", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin-create-customer", {
        body: {
          ...form,
          contact_email: form.contact_email || form.email,
          credit_limit: form.credit_limit || 0,
          assigned_location: form.assigned_location || null,
          legal_form: form.legal_form || null,
          tax_id: form.tax_id || null,
          house_number: form.house_number || null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Kunde angelegt!",
        description: `${form.company_name} wurde erfolgreich erstellt und freigeschaltet.`,
      });
      resetForm();
      onCreated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Create customer error:", error);
      toast({
        title: "Fehler",
        description: error.message || "Kunde konnte nicht angelegt werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Neuen Kunden anlegen
          </DialogTitle>
          <DialogDescription>
            Lege einen neuen B2B-Kunden manuell an (z.B. für Laufkunden vor Ort). 
            Der Account wird sofort freigeschaltet.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Login-Daten</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>E-Mail (Login) *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="kunde@firma.de" />
              </div>
              <div>
                <Label>Passwort *</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 Zeichen" />
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <Label>Firmenname *</Label>
            <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Musterfirma GmbH" />
          </div>
          <div>
            <Label>Rechtsform</Label>
            <Input value={form.legal_form} onChange={(e) => setForm({ ...form, legal_form: e.target.value })} placeholder="GmbH" />
          </div>
          <div>
            <Label>USt-IdNr.</Label>
            <Input value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} placeholder="DE123456789" />
          </div>

          <div>
            <Label>Vorname *</Label>
            <Input value={form.contact_first_name} onChange={(e) => setForm({ ...form, contact_first_name: e.target.value })} />
          </div>
          <div>
            <Label>Nachname *</Label>
            <Input value={form.contact_last_name} onChange={(e) => setForm({ ...form, contact_last_name: e.target.value })} />
          </div>
          <div>
            <Label>Telefon *</Label>
            <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} placeholder="+49 ..." />
          </div>
          <div>
            <Label>Kontakt E-Mail</Label>
            <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="Falls abweichend" />
          </div>

          <div className="sm:col-span-2">
            <Label>Straße *</Label>
            <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
          </div>
          <div>
            <Label>Hausnummer</Label>
            <Input value={form.house_number} onChange={(e) => setForm({ ...form, house_number: e.target.value })} />
          </div>
          <div>
            <Label>PLZ *</Label>
            <Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
          </div>
          <div>
            <Label>Stadt *</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label>Land</Label>
            <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>

          <div>
            <Label>Kreditlimit (€)</Label>
            <Input type="number" min={0} step={100} value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Standort</Label>
            <Select value={form.assigned_location} onValueChange={(v) => setForm({ ...form, assigned_location: v })}>
              <SelectTrigger><SelectValue placeholder="Standort wählen" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="krefeld">Krefeld</SelectItem>
                <SelectItem value="bonn">Bonn</SelectItem>
                <SelectItem value="muelheim">Mülheim</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleCreate} disabled={saving} className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
            {saving ? "Wird angelegt..." : "Kunde anlegen & freischalten"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
