import { useMemo, useState } from "react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useCrmCustomers, crmCustomerLabel, type CrmCustomer } from "@/hooks/useCrmCustomers";
import { CustomerFormDialog } from "@/components/b2b/customers/CustomerFormDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";
import { toast } from "sonner";

export default function Customers() {
  const { isStaff, isAdmin, loading: accessLoading } = useStaffAccess();
  const { rows, loading, save, remove } = useCrmCustomers();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CrmCustomer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((c) =>
      [c.company_name, c.first_name, c.last_name, c.email, c.phone, c.city, c.postal_code]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, search]);

  if (!accessLoading && !isStaff) {
    return (
      <B2BPortalLayout title="Kundendaten">
        <p className="text-muted-foreground">Kein Zugriff auf diesen Bereich.</p>
      </B2BPortalLayout>
    );
  }

  const handleDelete = async (c: CrmCustomer) => {
    if (!window.confirm(`Kunde „${crmCustomerLabel(c)}" wirklich löschen?`)) return;
    try {
      await remove(c.id);
      toast.success("Kunde gelöscht.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Löschen fehlgeschlagen.");
    }
  };

  return (
    <B2BPortalLayout title="Kundendaten" subtitle="Kundenkartei für Ladengeschäft & Telefon">
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche nach Firma, Name, E-Mail, Ort …"
          className="sm:max-w-sm"
        />
        <Button
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="sm:ml-auto"
        >
          <Plus className="h-4 w-4 mr-1" /> Neuer Kunde
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Wird geladen …</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">Keine Kunden gefunden.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold break-words">{crmCustomerLabel(c)}</span>
                    <Badge variant="outline">{c.customer_kind === "b2b" ? "Firma" : "Privat"}</Badge>
                    {c.location && <Badge variant="secondary">{getLocationDisplayName(c.location)}</Badge>}
                  </div>
                  {c.company_name && (c.first_name || c.last_name) && (
                    <p className="text-sm text-muted-foreground break-words">
                      {[c.salutation, c.first_name, c.last_name].filter(Boolean).join(" ")}
                    </p>
                  )}
                  <div className="mt-1 flex flex-col gap-0.5 text-sm text-muted-foreground">
                    {c.email && <span className="flex items-center gap-1.5 break-all"><Mail className="h-3.5 w-3.5 shrink-0" />{c.email}</span>}
                    {c.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" />{c.phone}</span>}
                    {(c.street || c.city) && (
                      <span className="flex items-center gap-1.5 break-words">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {[c.street, [c.postal_code, c.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(c); setDialogOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Bearbeiten
                  </Button>
                  {isAdmin && (
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(c)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editing}
        onSave={save}
      />
    </B2BPortalLayout>
  );
}
