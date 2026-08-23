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
import { SalesProductCombobox } from "./SalesProductCombobox";
import type { SalesCatalogItem } from "@/hooks/useSalesCatalog";
import { useCrmCustomers, crmCustomerLabel, type CrmCustomer } from "@/hooks/useCrmCustomers";
import { useStaffAccess } from "@/hooks/useStaffAccess";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Liefert die ID der neuen Anfrage, damit sie direkt geöffnet werden kann. */
  onCreated: (inquiryId?: string) => void;
}

/** CRM speichert b2c/b2b, sales_inquiries erwartet private/business. */
const toInquiryKind = (v: string | null | undefined) =>
  v === "b2b" || v === "business" ? "business" : "private";
const toCrmKind = (v: string) => (v === "business" ? "b2b" : "b2c");

const emptyForm = {
  location: "krefeld",
  kind: "new_machine",
  product_name: "",
  product_slug: "",
  product_kind: "",
  product_category: "",
  brand: "",
  article_number: "",
  listed_price: "",
  quantity: "1",
  wish_date: "",
  customer_kind: "private",
  company_name: "",
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  street: "",
  postal_code: "",
  city: "",
  vat_id: "",
  delivery_street: "",
  delivery_postal_code: "",
  delivery_city: "",
  message: "",
};

/** Manuelle Aufnahme einer Verkaufsanfrage (Laufkundschaft / Telefon). */
export function NewSalesInquiryDialog({ open, onOpenChange, onCreated }: Props) {
  const { rows: customers, save: saveCustomer } = useCrmCustomers();
  const { staffProfile, displayName } = useStaffAccess();
  const [form, setForm] = useState({ ...emptyForm });
  const [crmCustomerId, setCrmCustomerId] = useState<string | null>(null);
  const [storeCustomer, setStoreCustomer] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const applyArticle = (item: SalesCatalogItem | null, freeText: string) => {
    if (!item) {
      setForm((prev) => ({ ...prev, product_name: freeText, product_slug: "", product_kind: "" }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      product_name: item.name,
      product_slug: item.slug,
      product_kind: item.kind,
      kind: item.kind === "used" ? "used_machine" : "new_machine",
      product_category: item.category || prev.product_category,
      article_number: item.article_number ?? prev.article_number,
      listed_price:
        item.net_price != null
          ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(item.net_price) + " netto"
          : "Preis auf Anfrage",
    }));
  };

  const applyCustomer = (c: CrmCustomer) => {
    setCrmCustomerId(c.id);
    setStoreCustomer(false);
    setForm((prev) => ({
      ...prev,
      customer_kind: toInquiryKind(c.customer_kind),
      company_name: c.company_name ?? "",
      customer_name: [c.first_name, c.last_name].filter(Boolean).join(" "),
      customer_email: c.email ?? "",
      customer_phone: c.phone ?? "",
      street: c.street ?? "",
      postal_code: c.postal_code ?? "",
      city: c.city ?? "",
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
      toast.error("Bitte einen Verkaufsartikel angeben.");
      return;
    }

    setBusy(true);
    try {
      const [firstName, ...rest] = form.customer_name.trim().split(" ");
      let customerId = crmCustomerId;
      if (storeCustomer) {
        customerId = await saveCustomer(
          {
            customer_kind: toCrmKind(form.customer_kind),
            company_name: form.company_name.trim() || null,
            first_name: firstName || null,
            last_name: rest.join(" ") || null,
            email: form.customer_email.trim() || null,
            phone: form.customer_phone.trim() || null,
            street: form.street.trim() || null,
            postal_code: form.postal_code.trim() || null,
            city: form.city.trim() || null,
            vat_id: form.vat_id.trim() || null,
            location: form.location,
          },
          crmCustomerId ?? undefined,
        );
      }

      const hasDelivery = Boolean(form.delivery_street.trim() || form.delivery_city.trim());

      const { data: inserted, error } = await supabase.from("sales_inquiries").insert({
        source: "manual",
        kind: form.kind,
        location: form.location,
        brand: form.brand.trim() || null,
        model: form.product_name.trim(),
        product_category: form.product_category.trim() || null,
        article_number: form.article_number.trim() || null,
        product_slug: form.product_slug || null,
        product_kind: form.product_kind || null,
        listed_price: form.listed_price.trim() || null,
        quantity: form.quantity.trim() || "1",
        wish_date: form.wish_date || null,
        delivery_option: hasDelivery ? "Lieferung gewünscht" : "Abholung",
        delivery_street: form.delivery_street.trim() || null,
        delivery_postal_code: form.delivery_postal_code.trim() || null,
        delivery_city: form.delivery_city.trim() || null,
        customer_kind: form.customer_kind,
        customer_type: form.customer_kind === "business" ? "Firmenkunde" : "Privatkunde",
        company_name: form.company_name.trim() || null,
        vat_id: form.vat_id.trim() || null,
        first_name: firstName || null,
        last_name: rest.join(" ") || null,
        customer_email: form.customer_email.trim(),
        customer_phone: form.customer_phone.trim() || null,
        billing_street: form.street.trim() || null,
        billing_postal_code: form.postal_code.trim() || null,
        billing_city: form.city.trim() || null,
        billing_company: form.company_name.trim() || null,
        message: form.message.trim() || null,
        status: "in_progress",
        assigned_to: staffProfile?.user_id ?? null,
        assigned_name: displayName || null,
        assigned_at: new Date().toISOString(),
        crm_customer_id: customerId,
      } as never).select("id").maybeSingle();
      if (error) throw error;

      toast.success("Verkaufsanfrage angelegt – Angebot kann jetzt erstellt werden.");
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
          <DialogTitle>Verkaufsanfrage manuell aufnehmen</DialogTitle>
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
                  <CommandList className="max-h-64 overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
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
              <Label>Anfragetyp</Label>
              <Select value={form.kind} onValueChange={(v) => set("kind", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_machine">Neuartikel</SelectItem>
                  <SelectItem value="used_machine">Gebrauchtartikel</SelectItem>
                  <SelectItem value="rental_purchase">Mietkauf / Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label>Verkaufsartikel</Label>
              <SalesProductCombobox value={form.product_name} onSelect={applyArticle} />
            </div>
            <div>
              <Label htmlFor="nsi-brand">Hersteller / Marke</Label>
              <Input id="nsi-brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} maxLength={120} />
            </div>
            <div>
              <Label htmlFor="nsi-article">Artikel-/Referenznummer</Label>
              <Input id="nsi-article" value={form.article_number} onChange={(e) => set("article_number", e.target.value)} maxLength={80} />
            </div>
            <div>
              <Label htmlFor="nsi-qty">Menge</Label>
              <Input id="nsi-qty" type="number" min={1} value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="nsi-wish">Wunschtermin</Label>
              <Input id="nsi-wish" type="date" value={form.wish_date} onChange={(e) => set("wish_date", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="nsi-price">Listenpreis / Preisrahmen (optional)</Label>
              <Input id="nsi-price" value={form.listed_price} onChange={(e) => set("listed_price", e.target.value)} maxLength={80} />
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
            <div>
              <Label htmlFor="nsi-vat">USt-IdNr. (optional)</Label>
              <Input id="nsi-vat" value={form.vat_id} onChange={(e) => set("vat_id", e.target.value)} maxLength={30} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="nsi-company">Firma</Label>
              <Input id="nsi-company" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} maxLength={160} />
            </div>
            <div>
              <Label htmlFor="nsi-name">Name des Kunden</Label>
              <Input id="nsi-name" value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} maxLength={120} />
            </div>
            <div>
              <Label htmlFor="nsi-email">E-Mail (für Angebot)</Label>
              <Input id="nsi-email" type="email" value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)} maxLength={255} />
            </div>
            <div>
              <Label htmlFor="nsi-phone">Telefon</Label>
              <Input id="nsi-phone" value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} maxLength={40} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="nsi-street">Straße &amp; Hausnummer</Label>
              <Input id="nsi-street" value={form.street} onChange={(e) => set("street", e.target.value)} maxLength={160} />
            </div>
            <div>
              <Label htmlFor="nsi-zip">PLZ</Label>
              <Input id="nsi-zip" value={form.postal_code} onChange={(e) => set("postal_code", e.target.value)} maxLength={10} />
            </div>
            <div>
              <Label htmlFor="nsi-city">Ort</Label>
              <Input id="nsi-city" value={form.city} onChange={(e) => set("city", e.target.value)} maxLength={100} />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="nsi-dstreet">Lieferadresse – Straße (optional)</Label>
              <Input id="nsi-dstreet" value={form.delivery_street} onChange={(e) => set("delivery_street", e.target.value)} maxLength={160} />
            </div>
            <div>
              <Label htmlFor="nsi-dzip">Liefer-PLZ</Label>
              <Input id="nsi-dzip" value={form.delivery_postal_code} onChange={(e) => set("delivery_postal_code", e.target.value)} maxLength={10} />
            </div>
            <div>
              <Label htmlFor="nsi-dcity">Lieferort</Label>
              <Input id="nsi-dcity" value={form.delivery_city} onChange={(e) => set("delivery_city", e.target.value)} maxLength={100} />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="nsi-note">Notiz zur Anfrage</Label>
              <Textarea id="nsi-note" value={form.message} onChange={(e) => set("message", e.target.value)} rows={3} maxLength={2000} />
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
