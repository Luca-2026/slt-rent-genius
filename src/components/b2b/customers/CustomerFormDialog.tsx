import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { CrmCustomer, CrmCustomerInput } from "@/hooks/useCrmCustomers";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CrmCustomer | null;
  onSave: (input: CrmCustomerInput, id?: string) => Promise<string>;
  onSaved?: (id: string) => void;
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

export function CustomerFormDialog({ open, onOpenChange, customer, onSave, onSaved }: Props) {
  const [form, setForm] = useState<CrmCustomerInput>(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(customer ? { ...empty, ...customer } : empty);
  }, [open, customer]);

  const set = (key: keyof CrmCustomerInput, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
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
          <DialogTitle>{customer ? "Kunde bearbeiten" : "Neuer Kunde"}</DialogTitle>
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
          <div className="sm:col-span-2">
            <Label>Notizen</Label>
            <Textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} maxLength={2000} rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Abbrechen</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Speichert …" : "Speichern"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
