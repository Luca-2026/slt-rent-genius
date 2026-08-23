import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { parsePriceValue } from "@/lib/catalogPricing";

export interface CatalogProduct {
  slug: string;
  name: string;
  category: string;
  images: string[] | null;
  price_per_day: string | null;
  price_weekend?: string | null;
  price_per_month?: string | null;
  available_locations: string[] | null;
  addon_options?: unknown;
}

let catalogCache: CatalogProduct[] | null = null;
let catalogPromise: Promise<CatalogProduct[]> | null = null;

async function loadCatalog(): Promise<CatalogProduct[]> {
  if (catalogCache) return catalogCache;
  if (!catalogPromise) {
    catalogPromise = (async () => {
      const { data } = await supabase
        .from("managed_products_public")
        .select("slug,name,category,images,price_per_day,price_weekend,price_per_month,available_locations,addon_options")
        .order("name");
      catalogCache = (data ?? []) as CatalogProduct[];
      return catalogCache;
    })();
  }
  return catalogPromise;
}

/** Erstes im PDF nutzbares Bild (JPEG/PNG bevorzugt, Platzhalter ignoriert). */
export function pickCatalogImage(images: string[] | null | undefined): string | undefined {
  const list = (images ?? []).filter(Boolean).map(String).filter((i) => !i.toLowerCase().includes("placeholder"));
  if (!list.length) return undefined;
  return list.find((i) => /\.(jpe?g|png)(\?|$)/i.test(i)) ?? list[0];
}

/** "89,00 €/Tag" -> 89 ; gibt undefined zurück, wenn kein Betrag erkennbar ist. */
export const parsePrice = parsePriceValue;

interface Props {
  value: string;
  location?: string | null;
  disabled?: boolean;
  onSelect: (product: CatalogProduct | null, freeText: string) => void;
}

/**
 * Artikelauswahl für Anfrage-Angebote: greift auf denselben CMS-Katalog zu wie
 * die Mietartikel-Verwaltung und liefert Bild sowie Tagespreis mit.
 */
export function InquiryProductCombobox({ value, location, disabled, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CatalogProduct[]>(catalogCache ?? []);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadCatalog().then((list) => {
      if (!cancelled) setItems(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!location) return items;
    const loc = location.toLowerCase();
    return items.filter((i) => !i.available_locations?.length || i.available_locations.includes(loc));
  }, [items, location]);

  const trimmed = search.trim();
  const isFreeText = trimmed.length > 0 && !filtered.some((i) => i.name.toLowerCase() === trimmed.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          aria-expanded={open}
          className="w-full justify-between font-normal overflow-hidden h-auto min-h-10 py-2 border-input text-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className={cn("min-w-0 flex-1 truncate text-left", !value && "text-muted-foreground")}>
            {value || "Artikel aus CMS wählen oder eintragen"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-3rem)] p-0" align="start">
        <Command shouldFilter>
          <CommandInput placeholder="Artikel suchen …" value={search} onValueChange={setSearch} />
          <CommandList
            className="max-h-72 overflow-y-auto overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {isFreeText && (
              <CommandGroup heading="Freier Eintrag">
                <CommandItem
                  value={`__free__${trimmed}`}
                  onSelect={() => {
                    onSelect(null, trimmed);
                    setOpen(false);
                  }}
                >
                  <PencilLine className="mr-2 h-4 w-4" />
                  <span className="truncate">„{trimmed}" übernehmen</span>
                </CommandItem>
              </CommandGroup>
            )}
            <CommandEmpty>Tippe einen Begriff, um ihn frei zu übernehmen.</CommandEmpty>
            <CommandGroup heading="Mietartikel (CMS)">
              {filtered.map((item) => {
                const img = pickCatalogImage(item.images);
                return (
                  <CommandItem
                    key={item.slug}
                    value={`${item.name} ${item.category}`}
                    onSelect={() => {
                      onSelect(item, item.name);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4 shrink-0", value === item.name ? "opacity-100" : "opacity-0")} />
                    {img ? (
                      <img src={img} alt="" loading="lazy" className="mr-2 h-8 w-8 rounded object-cover shrink-0" />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.category}
                        {item.price_per_day ? ` · ${item.price_per_day}` : ""}
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Bild + Preis eines CMS-Artikels anhand des Namens nachschlagen. */
export async function findCatalogProductByName(name: string): Promise<CatalogProduct | undefined> {
  const list = await loadCatalog();
  const needle = name.trim().toLowerCase();
  return list.find((i) => i.name.trim().toLowerCase() === needle);
}
