import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CrmCustomer, CrmCustomerInput } from "@/hooks/useCrmCustomers";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CrmCustomer | null;
  onSave: (input: CrmCustomerInput, id?: string) => Promise<string>;
  onSaved?: (id: string) => void;
  /** Admin: beim Anlegen optional Portalzugang (Login) für Firmenkunden einrichten. */
  allowPortal?: boolean;
  onPortalCreated?: () => void;
}

const empty: CrmCustomerInput = {
  customer_kind: "b2c",
  company_name: "",
  salutation: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  street: "",
  postal_code: "",
  city: "",
  country: "Deutschland",
  vat_id: "",
  location: "krefeld",
  notes: "",
};

export function CustomerFormDialog({ open, onOpenChange, customer, onSave, onSaved, allowPortal, onPortalCreated }: Props) {
  const [form, setForm] = useState<CrmCustomerInput>(empty);
  const [busy, setBusy] = useState(false);
  const [portal, setPortal] = useState(false);
  const [password, setPassword] = useState("");
  const [legalForm, setLegalForm] = useState("");
  const [creditLimit, setCreditLimit] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(customer ? { ...empty, ...customer } : empty);
    setPortal(false);
    setPassword("");
    setLegalForm("");
    setCreditLimit("");
  }, [open, customer]);

  const withPortal = Boolean(allowPortal && !customer && portal);

  const submitPortal = async () => {
    const t = (v: string | null | undefined) => (v ?? "").trim();
    const missing = [
      !t(form.company_name) && "Firma",
      !t(form.first_name) && "Vorname",
      !t(form.last_name) && "Nachname",
      !t(form.email) && "E-Mail",
      !t(form.phone) && "Telefon",
      !t(form.street) && "Straße",
      !t(form.postal_code) && "PLZ",
      !t(form.city) && "Ort",
    ].filter(Boolean);
    if (missing.length) {
      toast.error(`Für den Portalzugang fehlt: ${missing.join(", ")}`);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/.test(t(form.email))) {
      toast.error("Bitte eine gültige E-Mail-Adresse angeben.");
      return;
    }
    if (password.length < 6) {
      toast.error("Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-customer", {
        body: {
          email: t(form.email),
          password,
          company_name: t(form.company_name),
          legal_form: legalForm.trim() || null,
          contact_first_name: t(form.first_name),
          contact_last_name: t(form.last_name),
          contact_phone: t(form.phone),
          contact_email: t(form.email),
          street: t(form.street),
          house_number: null,
          postal_code: t(form.postal_code),
          city: t(form.city),
          country: t(form.country) || "Deutschland",
          tax_id: t(form.vat_id) || null,
          credit_limit: Number(creditLimit) || 0,
          assigned_location: form.location || null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Firmenkunde mit Portalzugang angelegt.${data?.email_sent ? " Willkommens-E-Mail wurde versendet." : ""}`);
      onOpenChange(false);
      onPortalCreated?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Anlegen fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const set = (key: keyof CrmCustomerInput, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (withPortal) return submitPortal();
    const hasName = form.company_name?.trim() || form.last_name?.trim();
    if (!hasName) {
      toast.error("Bitte Firma oder Nachname angeben.");
      return;
    }
    if (form.email && !/^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) {
      toast.error("Bitte eine gültige E-Mail-Adresse angeben.");
      return;
    }
    setBusy(true);
    try {
      const payload: CrmCustomerInput = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? v.trim() || null : v]),
      );
      const id = await onSave(payload, customer?.id);
      toast.success(customer ? "Kunde aktualisiert." : "Kunde gespeichert.");
      onOpenChange(false);
      onSaved?.(id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? "Kunde bearbeiten" : "Neuen Kunden anlegen"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Kundentyp</Label>
            <Select value={form.customer_kind ?? "b2c"} onValueChange={(v) => set("customer_kind", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="b2c">Privatkunde</SelectItem>
                <SelectItem value="b2b">Firmenkunde</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Standort</Label>
            <Select value={form.location ?? "krefeld"} onValueChange={(v) => set("location", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="krefeld">Krefeld</SelectItem>
                <SelectItem value="bonn">Bonn</SelectItem>
                <SelectItem value="muelheim">Mülheim an der Ruhr</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Firma</Label>
            <Input value={form.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} maxLength={160} />
          </div>
          <div>
            <Label>Anrede</Label>
            <Input value={form.salutation ?? ""} onChange={(e) => set("salutation", e.target.value)} maxLength={20} placeholder="Herr / Frau" />
          </div>
          <div>
            <Label>USt-IdNr.</Label>
            <Input value={form.vat_id ?? ""} onChange={(e) => set("vat_id", e.target.value)} maxLength={30} />
          </div>
          <div>
            <Label>Vorname</Label>
            <Input value={form.first_name ?? ""} onChange={(e) => set("first_name", e.target.value)} maxLength={80} />
          </div>
          <div>
            <Label>Nachname</Label>
            <Input value={form.last_name ?? ""} onChange={(e) => set("last_name", e.target.value)} maxLength={80} />
          </div>
          <div>
            <Label>E-Mail</Label>
            <Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} maxLength={255} />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} maxLength={40} />
          </div>
          <div className="sm:col-span-2">
            <Label>Straße & Hausnummer</Label>
            <Input value={form.street ?? ""} onChange={(e) => set("street", e.target.value)} maxLength={160} />
          </div>
          <div>
            <Label>PLZ</Label>
            <Input value={form.postal_code ?? ""} onChange={(e) => set("postal_code", e.target.value)} maxLength={10} />
          </div>
          <div>
            <Label>Ort</Label>
            <Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} maxLength={100} />
          </div>
          {allowPortal && !customer && form.customer_kind === "b2b" && (
            <div className="sm:col-span-2 rounded-lg border border-border bg-muted/40 p-3 space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <Checkbox checked={portal} onCheckedChange={(v) => setPortal(v === true)} />
                Portalzugang für Firmenkunden einrichten (optional)
              </label>
              {portal && (
                <>
                  <p className="text-xs text-muted-foreground">
                    Die E-Mail oben wird die Login-Adresse. Das Konto ist sofort freigeschaltet; Rabatte, berechtigte Personen,
                    Zahlungskondition usw. pflegst du danach über „Bearbeiten“.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <Label>Passwort *</Label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 Zeichen" />
                    </div>
                    <div>
                      <Label>Rechtsform</Label>
                      <Input value={legalForm} onChange={(e) => setLegalForm(e.target.value)} placeholder="GmbH" maxLength={40} />
                    </div>
                    <div>
                      <Label>Kreditlimit (€)</Label>
                      <Input type="number" min={0} step={100} value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} placeholder="0" />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="sm:col-span-2">
            <Label>Notizen</Label>
            <Textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} maxLength={2000} rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Abbrechen</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Speichert …" : withPortal ? "Kunde mit Portalzugang anlegen" : "Speichern"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
