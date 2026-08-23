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
  }) => Promise<boolean | void>;
}

export function InquiryCustomerCard({
  inquiryType,
  customerKind,
  customerName,
  customerEmail,
  customerPhone,
  busy,
  onSave,
}: Props) {
  const initial = {
    customer_kind: (customerKind === "business" ? "business" : "private") as CustomerKind,
    name: customerName ?? "",
    email: customerEmail ?? "",
    phone: customerPhone ?? "",
  };
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(initial);

  useEffect(() => {
    setValues(initial);
    setEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerKind, customerName, customerEmail, customerPhone]);

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
        <div className="text-sm text-muted-foreground break-words">
          {initial.name || "—"}
          {initial.email ? ` · ${initial.email}` : ""}
          {initial.phone ? ` · ${initial.phone}` : ""}
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
          <Input value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
        </div>
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
