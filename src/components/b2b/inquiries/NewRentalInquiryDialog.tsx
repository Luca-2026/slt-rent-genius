import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";
import { InquiryProductCombobox, type CatalogProduct } from "./InquiryProductCombobox";
import { useCrmCustomers, crmCustomerLabel, type CrmCustomer } from "@/hooks/useCrmCustomers";
import { useStaffAccess } from "@/hooks/useStaffAccess";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Liefert die ID der neuen Anfrage, damit sie direkt geöffnet werden kann. */
  onCreated: (inquiryId?: string) => void;
}

/** CRM speichert b2c/b2b, rental_inquiries erwartet private/business. */
const toInquiryKind = (v: string | null | undefined) =>
  v === "b2b" || v === "business" ? "business" : "private";
const toCrmKind = (v: string) => (v === "business" ? "b2b" : "b2c");

const emptyForm = {
  location: "krefeld",
  product_name: "",
  quantity: "1",
  start_date: "",
  start_time: "08:00",
  end_date: "",
  end_time: "17:00",
  customer_kind: "private",
  company_name: "",
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  customer_street: "",
  customer_postal_code: "",
  customer_city: "",
  delivery_street: "",
  delivery_postal_code: "",
  delivery_city: "",
  vat_id: "",
  message: "",
};

/** Manuelle Aufnahme einer Mietanfrage (Laufkundschaft / Telefon). */
export function NewRentalInquiryDialog({ open, onOpenChange, onCreated }: Props) {
  const { rows: customers, save: saveCustomer } = useCrmCustomers();
  const { staffProfile, displayName } = useStaffAccess();
  const [form, setForm] = useState({ ...emptyForm });
  const [crmCustomerId, setCrmCustomerId] = useState<string | null>(null);
  const [storeCustomer, setStoreCustomer] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const applyCustomer = (c: CrmCustomer) => {
    setCrmCustomerId(c.id);
    setStoreCustomer(false);
    setForm((prev) => ({
      ...prev,
      customer_kind: toInquiryKind(c.customer_kind) || prev.customer_kind,
      company_name: c.company_name ?? "",
      customer_name: [c.first_name, c.last_name].filter(Boolean).join(" "),
      customer_email: c.email ?? "",
      customer_phone: c.phone ?? "",
      customer_street: c.street ?? "",
      customer_postal_code: c.postal_code ?? "",
      customer_city: c.city ?? "",
      vat_id: c.vat_id ?? "",
      location: c.location || prev.location,
    }));
    setPickerOpen(false);
  };

  const reset = () => {
    setForm({ ...emptyForm });
    setCrmCustomerId(null);
    setStoreCustomer(true);
  };

  const submit = async () => {
    if (!form.customer_name.trim() && !form.company_name.trim()) {
      toast.error("Bitte Name oder Firma des Kunden angeben.");
      return;
    }
    if (!form.customer_email.trim() || !/^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/.test(form.customer_email.trim())) {
      toast.error("Bitte eine gültige E-Mail-Adresse angeben (für den Angebotsversand).");
      return;
    }
    if (!form.product_name.trim()) {
      toast.error("Bitte einen Mietartikel angeben.");
      return;
    }
    if (!form.start_date) {
      toast.error("Bitte das Mietstart-Datum angeben.");
      return;
    }
    if (form.end_date && form.end_date < form.start_date) {
      toast.error("Das Rückgabedatum darf nicht vor dem Startdatum liegen.");
      return;
    }

    setBusy(true);
    try {
      let customerId = crmCustomerId;
      if (storeCustomer) {
        const [firstName, ...rest] = form.customer_name.trim().split(" ");
        customerId = await saveCustomer(
          {
            customer_kind: toCrmKind(form.customer_kind),
            company_name: form.company_name.trim() || null,
            first_name: firstName || null,
            last_name: rest.join(" ") || null,
            email: form.customer_email.trim() || null,
            phone: form.customer_phone.trim() || null,
            street: form.customer_street.trim() || null,
            postal_code: form.customer_postal_code.trim() || null,
            city: form.customer_city.trim() || null,
            vat_id: form.vat_id.trim() || null,
            location: form.location,
          },
          crmCustomerId ?? undefined,
        );
      }

      const hasDelivery = Boolean(form.delivery_street.trim() || form.delivery_city.trim());

      const { data: inserted, error } = await supabase
        .from("rental_inquiries")
        .insert({
          source: "manual",
          location: form.location,
          product_name: form.product_name.trim(),
          quantity: Number(form.quantity) > 0 ? Number(form.quantity) : 1,
          start_date: form.start_date,
          start_time: form.start_time || null,
          end_date: form.end_date || null,
          end_time: form.end_time || null,
          customer_kind: form.customer_kind,
          company_name: form.company_name.trim() || null,
          vat_id: form.vat_id.trim() || null,
          customer_name: form.customer_name.trim() || form.company_name.trim(),
          customer_email: form.customer_email.trim(),
          customer_phone: form.customer_phone.trim() || null,
          customer_street: form.customer_street.trim() || null,
          customer_postal_code: form.customer_postal_code.trim() || null,
          customer_city: form.customer_city.trim() || null,
          delivery_requested: hasDelivery,
          delivery_street: form.delivery_street.trim() || null,
          delivery_postal_code: form.delivery_postal_code.trim() || null,
          delivery_city: form.delivery_city.trim() || null,
          message: form.message.trim() || null,
          status: "in_progress",
          assigned_to: staffProfile?.user_id ?? null,
          assigned_name: displayName || null,
          assigned_at: new Date().toISOString(),
          crm_customer_id: customerId,
        } as never)
        .select("id")
        .maybeSingle();
      if (error) throw error;

      toast.success("Mietanfrage angelegt – Angebot kann jetzt erstellt werden.");
      reset();
      onOpenChange(false);
      onCreated((inserted as { id?: string } | null)?.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Anlegen fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[90vh] sm:w-[calc(100%-2rem)] sm:max-w-2xl sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <DialogTitle>Mietanfrage manuell aufnehmen</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <div>
            <Label>Bestandskunde übernehmen (optional)</Label>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  {crmCustomerId
                    ? crmCustomerLabel(customers.find((c) => c.id === crmCustomerId) as CrmCustomer)
                    : "Kunde aus Kundendaten wählen …"}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                <Command>
                  <CommandInput placeholder="Kunde suchen …" />
                  <CommandList
                    className="max-h-72 overflow-y-auto overscroll-contain"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    <CommandEmpty>Kein Kunde gefunden.</CommandEmpty>
                    <CommandGroup>
                      {customers.map((c) => (
                        <CommandItem key={c.id} value={`${crmCustomerLabel(c)} ${c.email ?? ""}`} onSelect={() => applyCustomer(c)}>
                          <Check className={`mr-2 h-4 w-4 ${crmCustomerId === c.id ? "opacity-100" : "opacity-0"}`} />
                          <span className="truncate">{crmCustomerLabel(c)}{c.email ? ` · ${c.email}` : ""}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Standort</Label>
              <Select value={form.location} onValueChange={(v) => set("location", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="krefeld">Krefeld</SelectItem>
                  <SelectItem value="bonn">Bonn</SelectItem>
                  <SelectItem value="muelheim">Mülheim an der Ruhr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kundentyp</Label>
              <Select value={form.customer_kind} onValueChange={(v) => set("customer_kind", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Privatkunde</SelectItem>
                  <SelectItem value="business">Firmenkunde</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Mietartikel</Label>
              <InquiryProductCombobox
                value={form.product_name}
                location={form.location}
                onSelect={(product: CatalogProduct | null, freeText: string) =>
                  set("product_name", product?.name ?? freeText)
                }
              />
            </div>
            <div>
              <Label htmlFor="nri-qty">Menge</Label>
              <Input id="nri-qty" type="number" min={1} value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
            </div>
            <div />
            <div>
              <Label htmlFor="nri-start-date">Abholung / Lieferung am</Label>
              <Input id="nri-start-date" type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
            </div>
            <div>
              <Label>Uhrzeit</Label>
              <Input type="time" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="nri-end-date">Rückgabe am</Label>
              <Input id="nri-end-date" type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
            </div>
            <div>
              <Label>Uhrzeit</Label>
              <Input type="time" value={form.end_time} onChange={(e) => set("end_time", e.target.value)} />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="nri-company">Firma</Label>
              <Input id="nri-company" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} maxLength={160} />
            </div>
            <div>
              <Label htmlFor="nri-name">Name des Kunden</Label>
              <Input id="nri-name" value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} maxLength={120} />
            </div>
            <div>
              <Label htmlFor="nri-vat">USt-IdNr. (optional)</Label>
              <Input id="nri-vat" value={form.vat_id} onChange={(e) => set("vat_id", e.target.value)} maxLength={30} />
            </div>
            <div>
              <Label htmlFor="nri-email">E-Mail (für Angebot)</Label>
              <Input id="nri-email" type="email" value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)} maxLength={255} />
            </div>
            <div>
              <Label htmlFor="nri-phone">Telefon</Label>
              <Input id="nri-phone" value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} maxLength={40} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="nri-street">Straße &amp; Hausnummer</Label>
              <Input id="nri-street" value={form.customer_street} onChange={(e) => set("customer_street", e.target.value)} maxLength={160} />
            </div>
            <div>
              <Label htmlFor="nri-zip">PLZ</Label>
              <Input id="nri-zip" value={form.customer_postal_code} onChange={(e) => set("customer_postal_code", e.target.value)} maxLength={10} />
            </div>
            <div>
              <Label htmlFor="nri-city">Ort</Label>
              <Input id="nri-city" value={form.customer_city} onChange={(e) => set("customer_city", e.target.value)} maxLength={100} />
            </div>
            <div className="sm:col-span-2 rounded-lg border border-border p-3 space-y-3">
              <p className="text-sm font-medium">Lieferadresse (optional – leer lassen bei Abholung)</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="nri-dstreet">Straße &amp; Hausnummer</Label>
                  <Input id="nri-dstreet" value={form.delivery_street} onChange={(e) => set("delivery_street", e.target.value)} maxLength={160} />
                </div>
                <div>
                  <Label htmlFor="nri-dzip">PLZ</Label>
                  <Input id="nri-dzip" value={form.delivery_postal_code} onChange={(e) => set("delivery_postal_code", e.target.value)} maxLength={10} />
                </div>
                <div>
                  <Label htmlFor="nri-dcity">Ort</Label>
                  <Input id="nri-dcity" value={form.delivery_city} onChange={(e) => set("delivery_city", e.target.value)} maxLength={100} />
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="nri-note">Notiz zur Anfrage</Label>
              <Textarea id="nri-note" value={form.message} onChange={(e) => set("message", e.target.value)} rows={3} maxLength={2000} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={storeCustomer} onCheckedChange={(v) => setStoreCustomer(Boolean(v))} />
            Kundendaten in der Kundenkartei speichern/aktualisieren
          </label>
        </div>

        <DialogFooter className="shrink-0 gap-3 border-t bg-background px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:gap-2 sm:px-6">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)} disabled={busy}>
            Abbrechen
          </Button>
          <Button className="w-full sm:w-auto" onClick={submit} disabled={busy}>
            {busy ? "Wird angelegt …" : "Anfrage anlegen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
