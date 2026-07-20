/**
 * Admin-Tab: Übersicht aller CMS-Mietartikel. Neu anlegen, filtern, editieren, löschen, veröffentlichen.
 */
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff, Copy, Package, Wrench } from "lucide-react";
import { useAdminManagedProducts, type AdminManagedProductRow } from "@/hooks/useManagedProducts";
import { InventoryEditorDialog } from "./InventoryEditorDialog";
import { ProductInstancesDialog } from "./ProductInstancesDialog";
import { useInstanceCounts } from "@/hooks/useProductInstances";
import { productCategories } from "@/data/rentalData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LOCATIONS = [
  { id: "krefeld", label: "Krefeld" },
  { id: "bonn", label: "Bonn" },
  { id: "muelheim", label: "Mülheim" },
];

export function AdminInventoryTab() {
  const { data: products = [], isLoading, refetch } = useAdminManagedProducts();
  const [search, setSearch] = useState("");
  const [locFilter, setLocFilter] = useState<string>("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<AdminManagedProductRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [instancesFor, setInstancesFor] = useState<AdminManagedProductRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminManagedProductRow | null>(null);
  const { data: instanceCounts = {} } = useInstanceCounts();

  const hasDraft = (p: AdminManagedProductRow) =>
    !!(p.seo_draft_meta_description && p.seo_draft_meta_description.trim()) ||
    !!(p.seo_draft_faqs && Array.isArray(p.seo_draft_faqs) && p.seo_draft_faqs.length > 0);

  const draftCount = useMemo(() => products.filter(hasDraft).length, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (locFilter !== "all" && !p.available_locations?.includes(locFilter)) return false;
      if (catFilter !== "all" && p.category !== catFilter) return false;
      if (statusFilter === "published" && !p.is_published) return false;
      if (statusFilter === "draft" && p.is_published) return false;
      if (statusFilter === "seo-draft" && !hasDraft(p)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, search, locFilter, catFilter, statusFilter]);

  async function togglePublish(row: AdminManagedProductRow) {
    const { error } = await (supabase.from("b2b_managed_products" as never) as any)
      .update({ is_published: !row.is_published })
      .eq("id", row.id);
    if (error) toast.error(error.message);
    else {
      toast.success(!row.is_published ? "Veröffentlicht" : "Auf Entwurf gesetzt");
      refetch();
    }
  }

  async function duplicate(row: AdminManagedProductRow) {
    const { id, created_at, updated_at, slug, name, ...rest } = row as AdminManagedProductRow & { created_by?: string; updated_by?: string };
    delete (rest as Record<string, unknown>).created_by;
    delete (rest as Record<string, unknown>).updated_by;

    const suffix = "-kopie-" + Math.random().toString(36).slice(2, 6);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await (supabase.from("b2b_managed_products" as never) as any)
      .insert({ ...rest, slug: slug + suffix, name: name + " (Kopie)", is_published: false, created_by: user?.id });
    if (error) toast.error(error.message);
    else { toast.success("Dupliziert"); refetch(); }
  }

  async function doDelete() {
    if (!confirmDelete) return;
    const { error } = await (supabase.from("b2b_managed_products" as never) as any)
      .delete()
      .eq("id", confirmDelete.id);
    if (error) toast.error(error.message);
    else { toast.success("Gelöscht"); refetch(); }
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Mietartikel-CMS</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              CMS-gepflegte Artikel überschreiben statische Artikel mit gleicher Slug im Frontend. Interne Bestandsmengen sind nie öffentlich sichtbar.
            </p>
          </div>
          <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-1" /> Neuer Artikel</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="Suche nach Name oder Slug…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={locFilter} onValueChange={setLocFilter}>
              <SelectTrigger><SelectValue placeholder="Standort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Standorte</SelectItem>
                {LOCATIONS.map((l) => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger><SelectValue placeholder="Kategorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {productCategories.filter((c) => c.id !== "alle").map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="published">Veröffentlicht</SelectItem>
                <SelectItem value="draft">Entwurf</SelectItem>
                <SelectItem value="seo-draft">SEO-Entwurf vorhanden{draftCount ? ` (${draftCount})` : ""}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bild</TableHead>
                  <TableHead>Name / Slug</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Standorte</TableHead>
                  <TableHead>Einzelartikel K / B / M</TableHead>
                  <TableHead>Rentware</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Lade …</TableCell></TableRow>}
                {!isLoading && !filtered.length && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Keine Artikel im CMS. Über „Neuer Artikel" anlegen.</TableCell></TableRow>}
                {filtered.map((row) => {
                  const cat = productCategories.find((c) => c.id === row.category);
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        {row.images?.[0] ? <img src={row.images[0]} className="h-12 w-12 object-cover rounded" alt="" /> : <div className="h-12 w-12 bg-muted rounded" />}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-muted-foreground">{row.slug}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{cat?.title ?? row.category}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {row.available_locations?.map((l) => <Badge key={l} variant="secondary" className="text-xs">{l.slice(0, 1).toUpperCase()}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {(() => {
                          const c = instanceCounts[row.id];
                          if (!c || c.total === 0) return <span className="text-muted-foreground">—</span>;
                          return ["krefeld", "bonn", "muelheim"].map((l) => c.byLocation[l] ?? 0).join(" / ");
                        })()}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {(() => {
                          const codes = ["krefeld", "bonn", "muelheim"]
                            .filter((l) => row.rentware_code?.[l])
                            .map((l) => `${l.slice(0, 1).toUpperCase()}:${row.rentware_code?.[l]}`);
                          return codes.length ? (
                            <div className="flex flex-col gap-0.5">
                              {codes.map((c) => <span key={c}>{c}</span>)}
                            </div>
                          ) : "—";
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {row.is_published
                            ? <Badge className="bg-green-600 hover:bg-green-700">Live</Badge>
                            : <Badge variant="outline">Entwurf</Badge>}
                          {hasDraft(row) && (
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white">SEO-Entwurf</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" title="Bearbeiten" onClick={() => setEditing(row)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" title="Duplizieren" onClick={() => duplicate(row)}><Copy className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" title={row.is_published ? "Verstecken" : "Veröffentlichen"} onClick={() => togglePublish(row)}>
                            {row.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" title="Löschen" onClick={() => setConfirmDelete(row)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InventoryEditorDialog
        open={creating || !!editing}
        onOpenChange={(v) => { if (!v) { setCreating(false); setEditing(null); } }}
        initial={editing}
        onSaved={refetch}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Artikel wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{confirmDelete?.name}" wird endgültig aus dem CMS entfernt. Statische TS-Artikel bleiben unberührt.
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
