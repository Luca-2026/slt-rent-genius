/**
 * Dialog zum Festlegen der Artikel-Reihenfolge innerhalb einer Kategorie.
 * Statt manuell Zahlen einzutragen, werden Artikel per Pfeiltasten verschoben;
 * beim Speichern werden fortlaufende sort_order-Werte (10, 20, 30 …) geschrieben.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, ChevronsDown, ChevronsUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { resolveSubcategory, type AdminManagedProductRow } from "@/hooks/useManagedProducts";
import { productCategories } from "@/data/rentalData";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  products: AdminManagedProductRow[];
  /** Vorbelegte Hauptkategorie */
  initialCategory?: string;
  onSaved: () => void;
}

export function CategorySortDialog({ open, onOpenChange, products, initialCategory, onSaved }: Props) {
  const [category, setCategory] = useState(initialCategory ?? "");
  const [subcategory, setSubcategory] = useState("all");
  const [order, setOrder] = useState<AdminManagedProductRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCategory(initialCategory ?? "");
      setSubcategory("all");
    }
  }, [open, initialCategory]);

  const subOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (category && p.category !== category) continue;
      const sub = resolveSubcategory(p);
      if (sub && sub !== p.category) set.add(sub);
    }
    return Array.from(set).sort();
  }, [products, category]);

  // Liste bei Filterwechsel neu aufbauen (aktuelle Reihenfolge aus sort_order)
  useEffect(() => {
    const list = products
      .filter((p) => (category ? p.category === category : false))
      .filter((p) => (subcategory === "all" ? true : resolveSubcategory(p) === subcategory))
      .sort((a, b) => {
        const sa = a.sort_order ?? 9999;
        const sb = b.sort_order ?? 9999;
        if (sa !== sb) return sa - sb;
        return a.name.localeCompare(b.name, "de");
      });
    setOrder(list);
  }, [products, category, subcategory]);

  function move(index: number, target: number) {
    setOrder((prev) => {
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  async function save() {
    if (!order.length) return;
    setSaving(true);
    try {
      for (let i = 0; i < order.length; i++) {
        const wanted = (i + 1) * 10;
        if (order[i].sort_order === wanted) continue;
        const { error } = await (supabase.from("b2b_managed_products" as never) as any)
          .update({ sort_order: wanted })
          .eq("id", order[i].id);
        if (error) throw error;
      }
      toast.success("Reihenfolge gespeichert");
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[calc(100vw-1.5rem)] sm:w-full max-h-[92vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Reihenfolge festlegen</DialogTitle>
          <DialogDescription>
            Artikel mit den Pfeilen verschieben. Ganz oben stehende Artikel erscheinen im Shop zuerst.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Kategorie wählen" /></SelectTrigger>
            <SelectContent>
              {productCategories.filter((c) => c.id !== "alle").map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={subcategory} onValueChange={setSubcategory} disabled={!subOptions.length}>
            <SelectTrigger><SelectValue placeholder="Filter (optional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Filter der Kategorie</SelectItem>
              {subOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto mt-3 border rounded-lg divide-y">
          {!category && <p className="p-4 text-sm text-muted-foreground">Bitte zuerst eine Kategorie wählen.</p>}
          {category && !order.length && <p className="p-4 text-sm text-muted-foreground">Keine Artikel in dieser Auswahl.</p>}
          {order.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 p-2">
              <span className="w-7 shrink-0 text-xs text-muted-foreground tabular-nums">{i + 1}.</span>
              {p.images?.[0]
                ? <img src={p.images[0]} alt="" loading="lazy" className="h-9 w-9 rounded object-cover shrink-0" />
                : <div className="h-9 w-9 rounded bg-muted shrink-0" />}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{resolveSubcategory(p)}</div>
              </div>
              {!p.is_published && <Badge variant="outline" className="text-xs shrink-0">Entwurf</Badge>}
              <div className="flex shrink-0">
                <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => move(i, 0)} title="Ganz nach oben">
                  <ChevronsUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => move(i, i - 1)} title="Nach oben">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" disabled={i === order.length - 1} onClick={() => move(i, i + 1)} title="Nach unten">
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" disabled={i === order.length - 1} onClick={() => move(i, order.length - 1)} title="Ganz nach unten">
                  <ChevronsDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="mt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={save} disabled={saving || !order.length}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Reihenfolge speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
