import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Camera, Plus, Trash2, Wrench, PackageMinus } from "lucide-react";
import { EquipmentCombobox } from "../tasks/EquipmentCombobox";
import { DAMAGE_CATEGORIES } from "../protocols/protocolShared";

interface InventoryDamage {
  id: string;
  product_slug: string | null;
  product_name: string;
  location: string;
  category: string;
  description: string | null;
  photo_urls: string[] | null;
  quantity: number;
  needs_repair: boolean;
  reduces_stock: boolean;
  status: string;
  protocol_type: string | null;
  protocol_number: string | null;
  amount: number | null;
  created_at: string;
  resolved_at: string | null;
}

const LOCATION_LABELS: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

const STATUS_LABELS: Record<string, string> = {
  offen: "Offen",
  in_reparatur: "In Reparatur",
  repariert: "Repariert",
};

const categoryLabel = (value: string) =>
  DAMAGE_CATEGORIES.find((c) => c.value === value)?.label ?? value;

/**
 * Zentrale Schadensverwaltung: zeigt alle aus Protokollen gemeldeten und
 * manuell erfassten Schäden, steuert Reparaturaufgaben und Bestandsabzug.
 */
export function InventoryDamageManager() {
  const { toast } = useToast();
  const [damages, setDamages] = useState<InventoryDamage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("offen_alle");
  const [locationFilter, setLocationFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    productName: "",
    productSlug: null as string | null,
    location: "krefeld",
    category: "sonstiges",
    description: "",
    quantity: "1",
    needsRepair: false,
    reducesStock: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("b2b_inventory_damages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
    setDamages((data as InventoryDamage[] | null) ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () =>
      damages.filter((d) => {
        if (statusFilter === "offen_alle" && d.status === "repariert") return false;
        if (statusFilter !== "offen_alle" && statusFilter !== "all" && d.status !== statusFilter) return false;
        if (locationFilter !== "all" && d.location !== locationFilter) return false;
        return true;
      }),
    [damages, statusFilter, locationFilter],
  );

  const updateDamage = async (id: string, patch: Record<string, unknown>) => {
    const { error } = await supabase.from("b2b_inventory_damages").update(patch).eq("id", id);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  const removeDamage = async (id: string) => {
    const { error } = await supabase.from("b2b_inventory_damages").delete().eq("id", id);
    setDeleteId(null);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Gelöscht", description: "Der Schaden wurde entfernt, abgezogener Bestand wurde zurückgebucht." });
    load();
  };

  const createDamage = async () => {
    if (!form.productName.trim()) {
      toast({ title: "Artikel fehlt", description: "Bitte wähle oder tippe einen Artikel.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("b2b_inventory_damages").insert({
      product_slug: form.productSlug,
      product_name: form.productName.trim(),
      location: form.location,
      category: form.category,
      description: form.description.trim() || null,
      quantity: Math.max(1, Number(form.quantity) || 1),
      needs_repair: form.needsRepair,
      reduces_stock: form.reducesStock,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Schaden erfasst", description: "Der Schaden wurde in der Übersicht angelegt." });
    setDialogOpen(false);
    setForm({
      productName: "",
      productSlug: null,
      location: "krefeld",
      category: "sonstiges",
      description: "",
      quantity: "1",
      needsRepair: false,
      reducesStock: false,
    });
    load();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5 text-accent" />
            Schadensverwaltung & Reparaturen
          </CardTitle>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Schaden erfassen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-52">
            <Label className="text-xs">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="offen_alle">Nicht repariert</SelectItem>
                <SelectItem value="offen">Offen</SelectItem>
                <SelectItem value="in_reparatur">In Reparatur</SelectItem>
                <SelectItem value="repariert">Repariert</SelectItem>
                <SelectItem value="all">Alle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-52">
            <Label className="text-xs">Standort</Label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Standorte</SelectItem>
                {Object.entries(LOCATION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Wird geladen…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Schäden für diese Auswahl.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {visible.map((d) => (
              <li key={d.id} className="p-3 space-y-2">
                <div className="flex flex-wrap items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium break-words">
                      {d.product_name}
                      {d.quantity > 1 ? ` · ${d.quantity} Stk.` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {LOCATION_LABELS[d.location] ?? d.location} · {categoryLabel(d.category)} ·{" "}
                      {new Date(d.created_at).toLocaleDateString("de-DE")}
                      {d.protocol_number ? ` · ${d.protocol_number}` : ""}
                      {!d.product_slug ? " · kein Katalogartikel (kein Bestandsabzug)" : ""}
                    </div>
                    {d.description && <p className="text-sm mt-1 break-words">{d.description}</p>}
                  </div>
                  <Badge variant={d.status === "repariert" ? "secondary" : "default"} className="shrink-0">
                    {STATUS_LABELS[d.status] ?? d.status}
                  </Badge>
                </div>

                {!!d.photo_urls?.length && (
                  <div className="flex flex-wrap gap-2">
                    {d.photo_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex">
                        <img src={url} alt={`Schadensfoto ${i + 1}`} className="h-16 w-16 rounded object-cover border" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <Switch
                      checked={d.needs_repair}
                      onCheckedChange={(v) => updateDamage(d.id, { needs_repair: v })}
                    />
                    <span className="flex items-center gap-1"><Wrench className="h-3 w-3" /> Reparatur nötig</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Switch
                      checked={d.reduces_stock}
                      onCheckedChange={(v) => updateDamage(d.id, { reduces_stock: v })}
                    />
                    <span className="flex items-center gap-1"><PackageMinus className="h-3 w-3" /> Bestand reduzieren</span>
                  </label>
                  <div className="ml-auto flex items-center gap-2">
                    {d.status !== "repariert" ? (
                      <Button size="sm" variant="outline" onClick={() => updateDamage(d.id, { status: "repariert" })}>
                        Als repariert markieren
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => updateDamage(d.id, { status: "offen" })}>
                        Wieder öffnen
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(d.id)} aria-label="Schaden löschen">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schaden erfassen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Artikel *</Label>
              <EquipmentCombobox
                value={form.productName}
                onChange={(name, slug) => setForm((f) => ({ ...f, productName: name, productSlug: slug }))}
                location={form.location}
              />
              {form.productName && !form.productSlug && (
                <p className="text-xs text-muted-foreground">
                  Freier Eintrag – für diesen Artikel kann kein Bestand abgezogen werden.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Standort</Label>
                <Select value={form.location} onValueChange={(v) => setForm((f) => ({ ...f, location: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LOCATION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Menge</Label>
                <Input
                  inputMode="numeric"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Art des Schadens</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAMAGE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Beschreibung</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Was ist beschädigt?"
              />
            </div>
            <div className="rounded-md border bg-muted/40 p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs font-semibold">Reparatur nötig</Label>
                <Switch
                  checked={form.needsRepair}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, needsRepair: v }))}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs font-semibold">Bestand reduzieren</Label>
                <Switch
                  checked={form.reducesStock}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, reducesStock: v }))}
                />
              </div>
            </div>
            <Button className="w-full" onClick={createDamage} disabled={saving}>
              <Camera className="h-4 w-4 mr-1" /> Schaden anlegen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Schaden löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Ein abgezogener Bestand wird zurückgebucht und eine offene Reparaturaufgabe entfällt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && removeDamage(deleteId)}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
