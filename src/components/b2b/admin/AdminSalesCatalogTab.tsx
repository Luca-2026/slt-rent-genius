/**
 * Admin-Tab: Verkaufsartikel-CMS (Neu- und Gebrauchtartikel).
 * Anlegen, filtern, bearbeiten, sichtbar schalten und löschen.
 */
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import {
  useSalesCatalogAdmin,
  invalidateSalesCatalog,
  grossToNet,
  type NewMachineRow,
  type SalesArticleKind,
  type UsedMachineRow,
} from "@/hooks/useSalesCatalog";
import { SalesArticleEditorDialog } from "./SalesArticleEditorDialog";

const euro = (v: number | null) =>
  v == null ? "–" : new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);

const USED_STATUS_LABELS: Record<string, string> = {
  available: "Verfügbar",
  reserved: "Reserviert",
  sold: "Verkauft",
  hidden: "Ausgeblendet",
};

export function AdminSalesCatalogTab() {
  const { newMachines, usedMachines, loading, reload } = useSalesCatalogAdmin();
  const { canManageInventory } = useStaffAccess();
  const [tab, setTab] = useState<SalesArticleKind>("new");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [editing, setEditing] = useState<{ kind: SalesArticleKind; row: NewMachineRow | UsedMachineRow | null } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ kind: SalesArticleKind; id: string; label: string } | null>(null);

  const categories = useMemo(() => {
    const source = tab === "new" ? newMachines.map((m) => m.category) : usedMachines.map((m) => m.category);
    return Array.from(new Set(source.filter(Boolean))).sort((a, b) => a.localeCompare(b, "de"));
  }, [tab, newMachines, usedMachines]);

  const matches = (haystack: (string | null | undefined)[]) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return haystack.filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
  };

  const filteredNew = useMemo(
    () => newMachines.filter((m) => (catFilter === "all" || m.category === catFilter) && matches([m.brand, m.model, m.name, m.slug, m.article_number])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newMachines, catFilter, search],
  );
  const filteredUsed = useMemo(
    () => usedMachines.filter((m) => (catFilter === "all" || m.category === catFilter) && matches([m.manufacturer, m.model, m.slug, m.reference_number])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [usedMachines, catFilter, search],
  );

  async function toggleVisible(kind: SalesArticleKind, row: NewMachineRow | UsedMachineRow) {
    if (kind === "new") {
      const r = row as NewMachineRow;
      const { error } = await supabase.from("new_machines").update({ is_active: !r.is_active } as never).eq("id", r.id);
      if (error) return toast.error(error.message);
      toast.success(!r.is_active ? "Veröffentlicht" : "Ausgeblendet");
    } else {
      const r = row as UsedMachineRow;
      const next = r.status === "available" ? "hidden" : "available";
      const { error } = await supabase.from("used_machines").update({ status: next } as never).eq("id", r.id);
      if (error) return toast.error(error.message);
      toast.success(next === "available" ? "Veröffentlicht" : "Ausgeblendet");
    }
    invalidateSalesCatalog();
    reload();
  }

  async function doDelete() {
    if (!confirmDelete) return;
    const table = confirmDelete.kind === "new" ? "new_machines" : "used_machines";
    const { error } = await supabase.from(table).delete().eq("id", confirmDelete.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Gelöscht");
      invalidateSalesCatalog();
      reload();
    }
    setConfirmDelete(null);
  }

  const ItemCard = ({
    kind, row, title, subtitle, price, visible, statusLabel,
  }: {
    kind: SalesArticleKind;
    row: NewMachineRow | UsedMachineRow;
    title: string;
    subtitle: string;
    price: string;
    visible: boolean;
    statusLabel?: string;
  }) => (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold break-words">{title}</span>
          <Badge variant={visible ? "default" : "outline"}>{visible ? "Sichtbar" : "Versteckt"}</Badge>
          {statusLabel ? <span className="text-xs text-muted-foreground">{statusLabel}</span> : null}
        </div>
        <p className="text-sm text-muted-foreground break-words">{subtitle}</p>
        <p className="text-sm font-medium">{price}</p>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button size="sm" variant="outline" onClick={() => setEditing({ kind, row })}>
          <Pencil className="h-4 w-4 mr-1" /> {canManageInventory ? "Bearbeiten" : "Ansehen"}
        </Button>
        {canManageInventory && (
          <>
            <Button size="sm" variant="outline" onClick={() => toggleVisible(kind, row)}>
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              aria-label="Artikel löschen"
              onClick={() => setConfirmDelete({ kind, id: row.id, label: title })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Verkaufsartikel-CMS
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Neu- und Gebrauchtartikel für den Verkauf – Preise, Bilder, Technik und SEO-Inhalte inklusive KI-Unterstützung.
            </p>
          </div>
          {canManageInventory ? (
            <Button className="w-full shrink-0 sm:w-auto" onClick={() => setEditing({ kind: tab, row: null })}>
              <Plus className="h-4 w-4 mr-1" /> Neuer Verkaufsartikel
            </Button>
          ) : (
            <Badge variant="outline" className="shrink-0 self-start">Nur Ansicht</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as SalesArticleKind); setCatFilter("all"); }}>
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex">
              <TabsTrigger value="new">Neuartikel ({newMachines.length})</TabsTrigger>
              <TabsTrigger value="used">Gebrauchtartikel ({usedMachines.length})</TabsTrigger>
            </TabsList>

            <div className="grid gap-3 pt-4 sm:grid-cols-2">
              <Input placeholder="Suche nach Hersteller, Modell, Nummer …" value={search} onChange={(e) => setSearch(e.target.value)} />
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger><SelectValue placeholder="Kategorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="new" className="space-y-3 pt-4">
              {loading ? (
                <p className="text-muted-foreground">Wird geladen …</p>
              ) : filteredNew.length === 0 ? (
                <p className="text-muted-foreground">Keine Neuartikel gefunden.</p>
              ) : (
                filteredNew.map((m) => (
                  <ItemCard
                    key={m.id}
                    kind="new"
                    row={m}
                    title={[m.brand, m.model].filter(Boolean).join(" ") || m.name}
                    subtitle={[m.category, m.article_number].filter(Boolean).join(" · ")}
                    price={
                      m.price_on_request
                        ? "Preis auf Anfrage"
                        : `${euro(m.price_gross)} brutto · ${euro(grossToNet(m.price_gross, m.vat_rate))} netto`
                    }
                    visible={m.is_active}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="used" className="space-y-3 pt-4">
              {loading ? (
                <p className="text-muted-foreground">Wird geladen …</p>
              ) : filteredUsed.length === 0 ? (
                <p className="text-muted-foreground">Keine Gebrauchtartikel gefunden.</p>
              ) : (
                filteredUsed.map((m) => (
                  <ItemCard
                    key={m.id}
                    kind="used"
                    row={m}
                    title={[m.manufacturer, m.model].filter(Boolean).join(" ")}
                    subtitle={[m.category, m.reference_number, m.year ? `BJ ${m.year}` : null, m.hours != null ? `${m.hours} Bh` : null]
                      .filter(Boolean)
                      .join(" · ")}
                    price={m.price_on_request ? "Preis auf Anfrage" : `${euro(m.price_net != null ? Number(m.price_net) : null)} netto`}
                    visible={m.status === "available" || m.status === "reserved"}
                    statusLabel={USED_STATUS_LABELS[m.status] ?? m.status}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <SalesArticleEditorDialog
        open={!!editing}
        kind={editing?.kind ?? "new"}
        row={editing?.row ?? null}
        readOnly={!canManageInventory}
        onOpenChange={(o) => !o && setEditing(null)}
        onSaved={reload}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verkaufsartikel löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{confirmDelete?.label}" wird dauerhaft entfernt und ist danach nicht mehr auf der Website sichtbar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
