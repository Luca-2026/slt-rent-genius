/**
 * Artikel-Liste einer Kundenanfrage: Hauptartikel + beliebig viele weitere
 * Mietartikel aus dem gesamten CMS (alle Standorte), jeweils mit Menge.
 */
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { loadCatalog, pickCatalogImage, type CatalogProduct } from "@/components/b2b/inquiries/InquiryProductCombobox";
import { parseSetSize } from "@/lib/setSize";

export interface RequestItem {
  product_name: string;
  product_slug?: string;
  quantity: number;
  set_size: number | null;
  image?: string;
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

  useEffect(() => {
    loadCatalog().then(setCatalog).catch(() => setCatalog([]));
  }, []);

  const available = useMemo(
    () => catalog.filter((p) => !items.some((i) => (i.product_slug && i.product_slug === p.slug) || i.product_name === p.name)),
    [catalog, items],
  );

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
          </li>
        ))}
      </ul>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-start gap-2 border-dashed" disabled={items.length >= MAX_ITEMS}>
            <Plus className="h-4 w-4" /> Weiteren Mietartikel hinzufügen
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
              <CommandGroup>
                {available.map((p) => (
                  <CommandItem key={p.slug} value={`${p.name} ${p.category}`} onSelect={() => add(p)}>
                    <span className="truncate">{p.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {items.length >= MAX_ITEMS && <p className="text-xs text-muted-foreground">Maximal {MAX_ITEMS} Artikel pro Anfrage.</p>}
    </div>
  );
}
