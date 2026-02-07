import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface B2BProfile {
  id: string;
  company_name: string;
  legal_form: string | null;
  tax_id: string | null;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  billing_email: string | null;
  street: string;
  house_number: string | null;
  postal_code: string;
  city: string;
  country: string | null;
  credit_limit: number;
  payment_due_days: number;
  assigned_location: string | null;
  status: string;
}

interface Props {
  profile: B2BProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function AdminCustomerEditDialog({ profile, open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    company_name: "",
    legal_form: "",
    tax_id: "",
    contact_first_name: "",
    contact_last_name: "",
    contact_email: "",
    billing_email: "",
    street: "",
    house_number: "",
    postal_code: "",
    city: "",
    country: "",
    credit_limit: 0,
    payment_due_days: 14,
    assigned_location: "",
    status: "approved",
  });

  // Sync form when profile changes
  const resetForm = (p: B2BProfile) => {
    setForm({
      company_name: p.company_name,
      legal_form: p.legal_form || "",
      tax_id: p.tax_id || "",
      contact_first_name: p.contact_first_name,
      contact_last_name: p.contact_last_name,
      contact_email: p.contact_email,
      billing_email: p.billing_email || "",
      street: p.street,
      house_number: p.house_number || "",
      postal_code: p.postal_code,
      city: p.city,
      country: p.country || "Deutschland",
      credit_limit: p.credit_limit,
      payment_due_days: p.payment_due_days,
      assigned_location: p.assigned_location || "",
      status: p.status,
    });
  };

  // Reset form when dialog opens
  if (open && profile && form.company_name !== profile.company_name && form.contact_email !== profile.contact_email) {
    resetForm(profile);
  }

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("b2b_profiles")
      .update({
        company_name: form.company_name,
        legal_form: form.legal_form || null,
        tax_id: form.tax_id || null,
        contact_first_name: form.contact_first_name,
        contact_last_name: form.contact_last_name,
        contact_email: form.contact_email,
        billing_email: form.billing_email || null,
        street: form.street,
        house_number: form.house_number || null,
        postal_code: form.postal_code,
        city: form.city,
        country: form.country || "Deutschland",
        credit_limit: form.credit_limit,
        payment_due_days: form.payment_due_days,
        assigned_location: form.assigned_location || null,
        status: form.status as any,
      } as any)
      .eq("id", profile.id);

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Kundendaten gespeichert", description: `${form.company_name} wurde aktualisiert.` });
      onSaved();
      onOpenChange(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v || profile) { onOpenChange(v); if (v && profile) resetForm(profile); } }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kundendaten bearbeiten</DialogTitle>
          <DialogDescription>Alle Felder des B2B-Kundenprofils bearbeiten.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Firmenname *</Label>
            <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          </div>
          <div>
            <Label>Rechtsform</Label>
            <Input value={form.legal_form} onChange={(e) => setForm({ ...form, legal_form: e.target.value })} placeholder="z.B. GmbH" />
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
            <Label>Kontakt E-Mail *</Label>
            <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          </div>
          <div>
            <Label>Rechnungs E-Mail</Label>
            <Input type="email" value={form.billing_email} onChange={(e) => setForm({ ...form, billing_email: e.target.value })} />
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
            <Label>Zahlungsziel (Tage)</Label>
            <Select value={String(form.payment_due_days)} onValueChange={(v) => setForm({ ...form, payment_due_days: Number(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[7, 14, 21, 30, 45, 60, 90].map((d) => (
                  <SelectItem key={d} value={String(d)}>{d} Tage</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Zugewiesener Standort</Label>
            <Select value={form.assigned_location} onValueChange={(v) => setForm({ ...form, assigned_location: v })}>
              <SelectTrigger><SelectValue placeholder="Standort wählen" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="krefeld">Krefeld</SelectItem>
                <SelectItem value="bonn">Bonn</SelectItem>
                <SelectItem value="muelheim">Mülheim</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="approved">Freigegeben</SelectItem>
                <SelectItem value="rejected">Abgelehnt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
            {saving ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
