import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X } from "lucide-react";

export type CustomerKind = "private" | "business";

interface Props {
  inquiryType: "rental" | "sales";
  customerKind: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  companyName?: string | null;
  vatId?: string | null;
  street?: string | null;
  postalCode?: string | null;
  city?: string | null;
  /** Paket 3b: Anrede (nur Mietanfragen; undefined = Feld ausblenden). */
  salutation?: string | null;
  /** Paket 4: Mobilnummer und Anrede-Form (nur Mietanfragen; undefined = ausblenden). */
  mobile?: string | null;
  addressForm?: string | null;
  busy?: boolean;
  /**
   * Persists the edited values. Field mapping (rental vs. sales) is handled by
   * the caller, because the two tables store the name differently.
   */
  onSave: (values: {
    customer_kind: CustomerKind;
    name: string;
    email: string;
    phone: string;
    company_name: string;
    vat_id: string;
    street: string;
    postal_code: string;
    city: string;
    salutation: "" | "herr" | "frau";
    mobile: string;
    address_form: "du" | "sie";
  }) => Promise<boolean | void>;
}

export function InquiryCustomerCard({
  inquiryType,
  customerKind,
  customerName,
  customerEmail,
  customerPhone,
  companyName,
  vatId,
  street,
  postalCode,
  city,
  salutation,
  mobile,
  addressForm,
  busy,
  onSave,
}: Props) {
  const showAddressForm = addressForm !== undefined;
  const showSalutation = salutation !== undefined;
  const initial = {
    customer_kind: (customerKind === "business" ? "business" : "private") as CustomerKind,
    name: customerName ?? "",
    email: customerEmail ?? "",
    phone: customerPhone ?? "",
    company_name: companyName ?? "",
    vat_id: vatId ?? "",
    street: street ?? "",
    postal_code: postalCode ?? "",
    city: city ?? "",
    salutation: (salutation === "herr" || salutation === "frau" ? salutation : "") as "" | "herr" | "frau",
    mobile: mobile ?? "",
    address_form: (addressForm === "sie" ? "sie" : "du") as "du" | "sie",
  };
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(initial);

  useEffect(() => {
    setValues(initial);
    setEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerKind, customerName, customerEmail, customerPhone, companyName, vatId, street, postalCode, city, salutation, mobile, addressForm]);

  const isBusiness = initial.customer_kind === "business";

  if (!editing) {
    return (
      <div className="rounded-lg border border-border p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">Kunde</span>
            <Badge variant={isBusiness ? "default" : "secondary"}>
              {isBusiness ? "Geschäftskunde (B2B-AGB)" : "Privatkunde (B2C-AGB)"}
            </Badge>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)} disabled={busy}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Bearbeiten
          </Button>
        </div>
        <div className="text-sm text-muted-foreground break-words space-y-0.5">
          {isBusiness && initial.company_name ? (
            <div className="font-medium text-foreground">{initial.company_name}</div>
          ) : null}
          <div>
            {initial.salutation ? `${initial.salutation === "herr" ? "Herr" : "Frau"} ` : ""}
            {initial.name || "—"}
            {initial.email ? ` · ${initial.email}` : ""}
            {initial.phone ? ` · ${initial.phone}` : ""}
            {initial.mobile ? ` · Mobil ${initial.mobile}` : ""}
          </div>
          {showAddressForm && <div>Anrede-Form: {initial.address_form === "sie" ? "Sie" : "Du"}</div>}
          {(initial.street || initial.postal_code || initial.city) && (
            <div>
              {[initial.street, [initial.postal_code, initial.city].filter(Boolean).join(" ")]
                .filter(Boolean)
                .join(", ")}
            </div>
          )}
          {isBusiness && initial.vat_id ? <div>USt-IdNr.: {initial.vat_id}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-primary/40 p-3 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Kundenart (steuert die beigefügten AGB)</Label>
          <Select
            value={values.customer_kind}
            onValueChange={(v) => setValues({ ...values, customer_kind: v as CustomerKind })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Privatkunde (B2C-AGB)</SelectItem>
              <SelectItem value="business">Geschäftskunde (B2B-AGB)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{inquiryType === "sales" ? "Vor- und Nachname" : "Name"}</Label>
          <div className="flex gap-2">
            {showSalutation && (
              <Select
                value={values.salutation || "none"}
                onValueChange={(v) => setValues({ ...values, salutation: v === "herr" || v === "frau" ? v : "" })}
              >
                <SelectTrigger className="h-10 w-28 shrink-0" aria-label="Anrede"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Anrede</SelectItem>
                  <SelectItem value="herr">Herr</SelectItem>
                  <SelectItem value="frau">Frau</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Input value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
          </div>
        </div>
        {showAddressForm && (
          <div className="space-y-1.5">
            <Label className="text-xs">Anrede-Form</Label>
            <Select value={values.address_form} onValueChange={(v) => setValues({ ...values, address_form: v === "sie" ? "sie" : "du" })}>
              <SelectTrigger className="h-10" aria-label="Anrede-Form"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="du">Du (Standard)</SelectItem>
                <SelectItem value="sie">Sie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="text-xs">E-Mail</Label>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Telefon</Label>
          <Input value={values.phone} onChange={(e) => setValues({ ...values, phone: e.target.value })} />
        </div>
        {showAddressForm && (
          <div className="space-y-1.5">
            <Label className="text-xs">Mobil</Label>
            <Input value={values.mobile} onChange={(e) => setValues({ ...values, mobile: e.target.value })} />
          </div>
        )}
        {values.customer_kind === "business" && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">Firma</Label>
              <Input
                value={values.company_name}
                onChange={(e) => setValues({ ...values, company_name: e.target.value })}
                placeholder="Firmenname"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">USt-IdNr.</Label>
              <Input
                value={values.vat_id}
                onChange={(e) => setValues({ ...values, vat_id: e.target.value })}
                placeholder="DE123456789"
              />
            </div>
          </>
        )}
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Straße und Hausnummer</Label>
          <Input value={values.street} onChange={(e) => setValues({ ...values, street: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">PLZ</Label>
          <Input value={values.postal_code} onChange={(e) => setValues({ ...values, postal_code: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Ort</Label>
          <Input value={values.city} onChange={(e) => setValues({ ...values, city: e.target.value })} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={busy}
          onClick={async () => {
            const ok = await onSave(values);
            if (ok !== false) setEditing(false);
          }}
        >
          <Save className="h-3.5 w-3.5 mr-1" /> Speichern
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setValues(initial); setEditing(false); }}>
          <X className="h-3.5 w-3.5 mr-1" /> Abbrechen
        </Button>
      </div>
    </div>
  );
}
