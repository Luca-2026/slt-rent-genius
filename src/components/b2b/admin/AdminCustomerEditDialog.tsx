import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  default_payment_terms?: string | null;
  status: string;
  contact_phone?: string | null;
  contact_position?: string | null;
  trade_register_number?: string | null;
  internal_notes?: string | null;
  rejection_reason?: string | null;
  vat_id_verified?: boolean;
  postal_invoice?: boolean | null;
  credit_limit_requested_at?: string | null;
}

interface Props {
  profile: B2BProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const emptyForm = {
  company_name: "", legal_form: "", tax_id: "", trade_register_number: "",
  contact_first_name: "", contact_last_name: "", contact_position: "", contact_phone: "",
  contact_email: "", billing_email: "",
  street: "", house_number: "", postal_code: "", city: "", country: "",
  credit_limit: "" as number | "", payment_due_days: 14, assigned_location: "",
  default_payment_terms: "net_14", status: "approved",
  vat_id_verified: false, postal_invoice: false, internal_notes: "", rejection_reason: "",
};

export function AdminCustomerEditDialog({ profile, open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open || !profile) return;
    const p = profile;
    setForm({
      company_name: p.company_name ?? "",
      legal_form: p.legal_form || "",
      tax_id: p.tax_id || "",
      trade_register_number: p.trade_register_number || "",
      contact_first_name: p.contact_first_name ?? "",
      contact_last_name: p.contact_last_name ?? "",
      contact_position: p.contact_position || "",
      contact_phone: p.contact_phone || "",
      contact_email: p.contact_email ?? "",
      billing_email: p.billing_email || "",
      street: p.street ?? "",
      house_number: p.house_number || "",
      postal_code: p.postal_code ?? "",
      city: p.city ?? "",
      country: p.country || "Deutschland",
      credit_limit: Number(p.credit_limit) || "",
      payment_due_days: p.payment_due_days ?? 14,
      assigned_location: p.assigned_location || "",
      default_payment_terms: p.default_payment_terms || "net_14",
      status: p.status,
      vat_id_verified: !!p.vat_id_verified,
      postal_invoice: !!p.postal_invoice,
      internal_notes: p.internal_notes || "",
      rejection_reason: p.rejection_reason || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, profile?.id]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!profile) return;
    const required: [string, string][] = [
      [form.company_name, "Firmenname"], [form.contact_first_name, "Vorname"], [form.contact_last_name, "Nachname"],
      [form.contact_email, "Kontakt-E-Mail"], [form.street, "Straße"], [form.postal_code, "PLZ"], [form.city, "Stadt"],
    ];
    const missing = required.filter(([v]) => !String(v).trim()).map(([, l]) => l);
    if (missing.length) {
      toast({ title: "Pflichtfelder fehlen", description: missing.join(", "), variant: "destructive" });
      return;
    }
    const creditLimit = form.credit_limit === "" ? 0 : Number(form.credit_limit);
    if (!Number.isFinite(creditLimit) || creditLimit < 0) {
      toast({ title: "Kreditlimit ungültig", description: "Bitte einen Betrag ab 0 € eingeben.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const statusChanged = form.status !== profile.status;
    const userId = statusChanged ? (await supabase.auth.getUser()).data.user?.id ?? null : null;

    const update: Record<string, unknown> = {
      company_name: form.company_name.trim(),
      legal_form: form.legal_form || null,
      tax_id: form.tax_id || null,
      trade_register_number: form.trade_register_number || null,
      contact_first_name: form.contact_first_name.trim(),
      contact_last_name: form.contact_last_name.trim(),
      contact_position: form.contact_position || null,
      contact_phone: form.contact_phone,
      contact_email: form.contact_email.trim(),
      billing_email: form.billing_email || null,
      street: form.street,
      house_number: form.house_number || null,
      postal_code: form.postal_code,
      city: form.city,
      country: form.country || "Deutschland",
      payment_due_days: form.payment_due_days,
      assigned_location: form.assigned_location || null,
      default_payment_terms: form.default_payment_terms,
      status: form.status,
      vat_id_verified: form.tax_id ? form.vat_id_verified : false,
      postal_invoice: form.postal_invoice,
      internal_notes: form.internal_notes || null,
      rejection_reason: form.status === "rejected" ? form.rejection_reason || null : null,
    };
    // Kreditlimit-Antrag gilt als erledigt, sobald ein Limit vergeben ist
    // Neues/erhöhtes Limit > 0 läuft über grant-credit-limit (Bestätigungs-E-Mail an den Kunden)
    const creditChanged = creditLimit !== Number(profile.credit_limit || 0);
    const grantWithEmail = creditChanged && creditLimit > 0;
    if (creditChanged && creditLimit === 0) update.credit_limit = 0;
    if (statusChanged) {
      update.status_changed_at = new Date().toISOString();
      update.status_changed_by = userId;
    }

    const { error } = await supabase.from("b2b_profiles").update(update as never).eq("id", profile.id);

    let grantError: string | null = null;
    if (!error && grantWithEmail) {
      const { data, error: gErr } = await supabase.functions.invoke("grant-credit-limit", { body: { profileId: profile.id, amount: creditLimit } });
      if (gErr || data?.error) grantError = data?.error || gErr?.message || "Unbekannter Fehler";
      else toast({ title: "Kreditlimit vergeben", description: data?.email_sent ? `Bestätigung an ${data.email_sent_to} gesendet.` : "E-Mail konnte nicht gesendet werden." });
    }

    if (error || grantError) {
      toast({ title: "Fehler", description: error?.message || `Kreditlimit: ${grantError}`, variant: "destructive" });
    } else {
      toast({ title: "Kundendaten gespeichert", description: `${form.company_name} wurde aktualisiert.` });
      if (statusChanged && form.status === "approved") {
        supabase.functions.invoke("notify-profile-approval", { body: { profileId: profile.id } })
          .then(({ error: e }) => { if (e) console.error("Freigabe-E-Mail fehlgeschlagen", e); });
      }
      onSaved();
      onOpenChange(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kunde bearbeiten</DialogTitle>
          <DialogDescription>Stammdaten, Freigabe, Kreditlimit und Zahlungskonditionen des Firmenkunden.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Freigabe & Konditionen</p>
          <div>
            <Label htmlFor="ce-status">Freigabestatus</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger id="ce-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Freigabe offen</SelectItem>
                <SelectItem value="approved">Freigeschaltet</SelectItem>
                <SelectItem value="rejected">Abgelehnt</SelectItem>
              </SelectContent>
            </Select>
            {form.status === "approved" && profile?.status !== "approved" && (
              <p className="text-xs text-muted-foreground mt-1">Beim Speichern erhält der Kunde die Freischaltungs-E-Mail.</p>
            )}
          </div>
          <div>
            <Label htmlFor="ce-credit">Kreditlimit (€)</Label>
            <Input id="ce-credit" type="number" inputMode="decimal" min={0} step={100} placeholder="0"
              value={form.credit_limit} onChange={(e) => set("credit_limit", e.target.value === "" ? "" : Number(e.target.value))} />
            <p className="text-xs text-muted-foreground mt-1">Bei neuem Limit über 0 € erhält der Kunde eine Bestätigungs-E-Mail.</p>
            {profile?.credit_limit_requested_at && (
              <p className="text-xs text-accent mt-1">Kunde hat ein Kreditlimit beantragt. Mit einem Betrag über 0 € gilt der Antrag als erledigt.</p>
            )}
          </div>
          {form.status === "rejected" && (
            <div className="sm:col-span-2">
              <Label htmlFor="ce-reject">Ablehnungsgrund</Label>
              <Input id="ce-reject" value={form.rejection_reason} onChange={(e) => set("rejection_reason", e.target.value)} />
            </div>
          )}
          <div>
            <Label>Standard-Zahlungskondition (neue Rechnungen)</Label>
            <Select value={form.default_payment_terms} onValueChange={(v) => set("default_payment_terms", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vorkasse">Vorkasse (0 Tage)</SelectItem>
                <SelectItem value="net_7">Zahlbar innerhalb 7 Tagen</SelectItem>
                <SelectItem value="net_14">Zahlbar innerhalb 14 Tagen</SelectItem>
                <SelectItem value="net_30">Zahlbar innerhalb 30 Tagen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Zahlungsziel (Tage) – Legacy</Label>
            <Select value={String(form.payment_due_days)} onValueChange={(v) => set("payment_due_days", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[7, 14, 21, 30, 45, 60, 90].map((d) => <SelectItem key={d} value={String(d)}>{d} Tage</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Zugewiesener Standort</Label>
            <Select value={form.assigned_location} onValueChange={(v) => set("assigned_location", v)}>
              <SelectTrigger><SelectValue placeholder="Standort wählen" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="krefeld">Krefeld</SelectItem>
                <SelectItem value="bonn">Bonn</SelectItem>
                <SelectItem value="muelheim">Mülheim an der Ruhr</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col justify-end gap-2 pb-1">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.postal_invoice} onCheckedChange={(v) => set("postal_invoice", v === true)} />
              Rechnung zusätzlich per Post
            </label>
          </div>

          <p className="sm:col-span-2 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Firma</p>
          <div className="sm:col-span-2">
            <Label>Firmenname *</Label>
            <Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
          </div>
          <div>
            <Label>Rechtsform</Label>
            <Input value={form.legal_form} onChange={(e) => set("legal_form", e.target.value)} placeholder="z. B. GmbH" />
          </div>
          <div>
            <Label>Handelsregisternummer</Label>
            <Input value={form.trade_register_number} onChange={(e) => set("trade_register_number", e.target.value)} />
          </div>
          <div>
            <Label>USt-IdNr.</Label>
            <Input value={form.tax_id} onChange={(e) => set("tax_id", e.target.value)} placeholder="DE123456789" />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox disabled={!form.tax_id} checked={form.vat_id_verified && !!form.tax_id} onCheckedChange={(v) => set("vat_id_verified", v === true)} />
              USt-IdNr. geprüft (Reverse Charge)
            </label>
          </div>

          <p className="sm:col-span-2 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ansprechpartner</p>
          <div>
            <Label>Vorname *</Label>
            <Input value={form.contact_first_name} onChange={(e) => set("contact_first_name", e.target.value)} />
          </div>
          <div>
            <Label>Nachname *</Label>
            <Input value={form.contact_last_name} onChange={(e) => set("contact_last_name", e.target.value)} />
          </div>
          <div>
            <Label>Position</Label>
            <Input value={form.contact_position} onChange={(e) => set("contact_position", e.target.value)} />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input type="tel" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
          </div>
          <div>
            <Label>Kontakt-E-Mail *</Label>
            <Input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
          </div>
          <div>
            <Label>Rechnungs-E-Mail</Label>
            <Input type="email" value={form.billing_email} onChange={(e) => set("billing_email", e.target.value)} />
          </div>

          <p className="sm:col-span-2 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Adresse</p>
          <div className="sm:col-span-2">
            <Label>Straße *</Label>
            <Input value={form.street} onChange={(e) => set("street", e.target.value)} />
          </div>
          <div>
            <Label>Hausnummer</Label>
            <Input value={form.house_number} onChange={(e) => set("house_number", e.target.value)} />
          </div>
          <div>
            <Label>PLZ *</Label>
            <Input value={form.postal_code} onChange={(e) => set("postal_code", e.target.value)} />
          </div>
          <div>
            <Label>Stadt *</Label>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div>
            <Label>Land</Label>
            <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
          </div>

          <div className="sm:col-span-2 pt-2">
            <Label>Interne Notizen (nur für das Team sichtbar)</Label>
            <Textarea rows={3} value={form.internal_notes} onChange={(e) => set("internal_notes", e.target.value)} />
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
