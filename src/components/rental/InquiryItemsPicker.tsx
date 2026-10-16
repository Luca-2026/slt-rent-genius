/**
 * Artikel-Liste einer Kundenanfrage: Hauptartikel + beliebig viele weitere
 * Mietartikel aus dem gesamten CMS (alle Standorte), jeweils mit Menge.
 */
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Minus, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { loadCatalog, pickCatalogImage, type CatalogProduct } from "@/components/b2b/inquiries/InquiryProductCombobox";
import { parseSetSize } from "@/lib/setSize";
import { parseAddonOptions, type AddonOption } from "@/lib/offerAddons";
import { supabase } from "@/integrations/supabase/client";

export interface RequestItem {
  product_name: string;
  product_slug?: string;
  quantity: number;
  set_size: number | null;
  image?: string;
  /** Vom Kunden gewählte Zusatzoptionen (Versicherungsstufen), Keys aus addon_options. */
  selected_addons?: string[];
}

interface Props {
  items: RequestItem[];
  onChange: (items: RequestItem[]) => void;
}

const MAX_ITEMS = 30;

function QuantityStepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center rounded-md border border-border bg-background" aria-label={label}>
      <button type="button" className="h-9 w-9 flex items-center justify-center text-muted-foreground disabled:opacity-40"
        onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label="Weniger">
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={9999}
        value={value || ""}
        onChange={(e) => onChange(Math.min(9999, Math.max(0, Math.round(Number(e.target.value) || 0))))}
        onBlur={() => { if (!value) onChange(1); }}
        className="h-9 w-14 bg-transparent text-center text-sm font-medium outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        aria-label={label}
      />
      <button type="button" className="h-9 w-9 flex items-center justify-center text-muted-foreground"
        onClick={() => onChange(Math.min(9999, value + 1))} aria-label="Mehr">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function InquiryItemsPicker({ items, onChange }: Props) {
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [open, setOpen] = useState(false);

  const [cats, setCats] = useState<{ slug: string; name: string; sort_order: number | null }[]>([]);
  useEffect(() => {
    loadCatalog().then(setCatalog).catch(() => setCatalog([]));
    supabase.from("product_categories").select("slug,name,sort_order").then(({ data }) => setCats((data as never) ?? []));
  }, []);

  const available = useMemo(
    () => catalog.filter((p) => !items.some((i) => (i.product_slug && i.product_slug === p.slug) || i.product_name === p.name)),
    [catalog, items],
  );

  /** Passende Zusatzartikel: im CMS gepflegte Vorschläge aller angefragten Artikel, ohne bereits enthaltene. */
  const suggestions = useMemo(() => {
    const bySlug = new Map(catalog.map((p) => [p.slug, p]));
    const seen = new Set<string>();
    const out: CatalogProduct[] = [];
    for (const it of items) {
      const entry = it.product_slug ? bySlug.get(it.product_slug) : undefined;
      for (const s of entry?.suggested_accessory_slugs ?? []) {
        if (seen.has(s)) continue;
        const p = bySlug.get(s);
        if (!p) continue;
        if (items.some((i) => i.product_slug === s || i.product_name === p.name)) continue;
        seen.add(s);
        out.push(p);
      }
    }
    return out.slice(0, 8);
  }, [catalog, items]);

  /** Gepflegte Zusatzoptionen (Versicherungen) je Artikel-Slug. */
  const addonsBySlug = useMemo(() => {
    const m = new Map<string, AddonOption[]>();
    for (const p of catalog) {
      const opts = parseAddonOptions(p.addon_options);
      if (opts.length) m.set(p.slug, opts);
    }
    return m;
  }, [catalog]);

  const toggleAddon = (index: number, key: string, checked: boolean) =>
    onChange(items.map((it, j) => {
      if (j !== index) return it;
      const cur = it.selected_addons ?? [];
      return { ...it, selected_addons: checked ? [...cur, key] : cur.filter((k) => k !== key) };
    }));
  /** Nach Kategorie gruppiert (product_categories.sort_order), innerhalb alphabetisch. */
  const grouped = useMemo(() => {
    const meta = new Map(cats.map((c) => [c.slug, c]));
    const groups = new Map<string, { name: string; order: number; items: CatalogProduct[] }>();
    for (const p of available) {
      const c = meta.get(p.category);
      const key = c?.slug ?? p.category ?? "sonstige";
      if (!groups.has(key)) groups.set(key, { name: c?.name ?? "Weitere Artikel", order: c?.sort_order ?? 9999, items: [] });
      groups.get(key)!.items.push(p);
    }
    return [...groups.values()]
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "de"))
      .map((g) => ({ ...g, items: g.items.sort((a, b) => a.name.localeCompare(b.name, "de")) }));
  }, [available, cats]);

  const add = (p: CatalogProduct) => {
    if (items.length >= MAX_ITEMS) return;
    onChange([...items, { product_name: p.name, product_slug: p.slug, quantity: 1, set_size: parseSetSize(p.name), image: pickCatalogImage(p.images) }]);
    setOpen(false);
  };

  const patch = (i: number, q: number) => onChange(items.map((it, j) => (j === i ? { ...it, quantity: q } : it)));

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={`${it.product_slug ?? it.product_name}-${i}`} className="rounded-lg border border-border bg-background p-2.5">
            <div className="flex items-center gap-3">
              {it.image ? (
                <img src={it.image} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded object-cover bg-muted" />
              ) : null}
              <p className="min-w-0 flex-1 text-sm font-medium leading-snug break-words">{it.product_name}</p>
              {i > 0 && (
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                  aria-label={`${it.product_name} entfernen`} onClick={() => onChange(items.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0 text-xs leading-tight">
                <p className="font-medium text-foreground">{it.set_size ? "Anzahl Sets" : "Anzahl"}</p>
                {it.set_size ? (
                  <p className="text-muted-foreground">
                    1 Set = {it.set_size} Stück · <span className="font-semibold text-foreground">gesamt {it.quantity * it.set_size} Stück</span>
                  </p>
                ) : null}
              </div>
              <QuantityStepper value={it.quantity} onChange={(q) => patch(i, q)} label={`Menge ${it.product_name}`} />
            </div>
            {(() => {
              const opts = it.product_slug ? addonsBySlug.get(it.product_slug) : undefined;
              if (!opts?.length) return null;
              const sorted = [...opts].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
              return (
                <div className="mt-2 space-y-1.5 border-t border-border pt-2">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Versicherung & Zusatzoptionen
                  </p>
                  {sorted.map((o) => {
                    const mandatory = o.is_default === true;
                    const checked = mandatory || (it.selected_addons ?? []).includes(o.key);
                    const priceHint = o.price_type === "percent" ? `${o.price} % des Mietpreises` : o.price > 0 ? `${o.price.toFixed(2).replace(".", ",")} €` : null;
                    return (
                      <label key={o.key} className="flex items-start gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-3.5 w-3.5 accent-primary disabled:opacity-60"
                          checked={checked}
                          disabled={mandatory}
                          onChange={(e) => toggleAddon(i, o.key, e.target.checked)}
                        />
                        <span className="min-w-0 leading-snug">
                          <span className="font-medium">{o.label}</span>
                          {mandatory ? <span className="text-muted-foreground"> (Pflicht)</span> : null}
                          {o.deductible ? <span className="text-muted-foreground"> – Selbstbeteiligung {o.deductible.toLocaleString("de-DE")} €</span> : null}
                          {priceHint ? <span className="text-muted-foreground"> · {priceHint}</span> : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              );
            })()}
          </li>
        ))}
      </ul>

      {suggestions.length > 0 && (
        <div className="space-y-1.5 rounded-md border border-dashed border-primary/40 bg-primary/5 p-2.5">
          <p className="text-xs font-medium text-foreground">Passende Zusatzartikel</p>
          <ul className="space-y-1">
            {suggestions.map((p) => (
              <li key={p.slug} className="flex items-center gap-2">
                {pickCatalogImage(p.images) ? (
                  <img src={pickCatalogImage(p.images)} alt="" loading="lazy" className="h-8 w-8 shrink-0 rounded object-cover bg-muted" />
                ) : null}
                <span className="min-w-0 flex-1 truncate text-xs">{p.name}</span>
                <Button type="button" variant="outline" size="sm" className="h-7 shrink-0 px-2 text-xs"
                  onClick={() => add(p)} disabled={items.length >= MAX_ITEMS}>
                  <Plus className="mr-1 h-3 w-3" /> Hinzufügen
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-start gap-2 border-dashed" disabled={items.length >= MAX_ITEMS}>
            <Plus className="h-4 w-4" /> {items.length > 1 ? "Weiterer Zusatzartikel" : "Zusatzartikel hinzufügen"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
          <Command>
            <CommandInput placeholder="Artikel suchen, z. B. Stehtisch, Gläser …" />
            <CommandList className="max-h-72 overflow-y-auto overscroll-contain"
              onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
              <CommandEmpty>
                <span className="flex items-center justify-center gap-2 text-sm"><Search className="h-4 w-4" /> Kein Artikel gefunden – gern im Kommentar beschreiben.</span>
              </CommandEmpty>
              {grouped.map((g) => (
                <CommandGroup key={g.name} heading={g.name}>
                  {g.items.map((p) => (
                    <CommandItem key={p.slug} value={`${p.name} ${g.name}`} onSelect={() => add(p)}>
                      <span className="truncate">{p.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {items.length >= MAX_ITEMS && <p className="text-xs text-muted-foreground">Maximal {MAX_ITEMS} Artikel pro Anfrage.</p>}
    </div>
  );
}
