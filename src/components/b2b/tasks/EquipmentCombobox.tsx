import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { locationLabel } from "./types";

interface CatalogItem {
  slug: string;
  name: string;
  category: string;
  available_locations: string[] | null;
}

let cache: CatalogItem[] | null = null;

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Optionaler Standort-Filter (z. B. Von-Standort) */
  location?: string;
  placeholder?: string;
  id?: string;
}

/**
 * Kombiniertes Auswahlfeld: greift auf denselben CMS-Katalog zu wie die
 * Mietartikel-Verwaltung, erlaubt aber jederzeit freien Text.
 */
export function EquipmentCombobox({ value, onChange, location, placeholder, id }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CatalogItem[]>(cache ?? []);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("managed_products_public")
        .select("slug,name,category,available_locations")
        .order("name");
      if (cancelled || !data) return;
      cache = data as CatalogItem[];
      setItems(cache);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const base = location
      ? items.filter((i) => !i.available_locations?.length || i.available_locations.includes(location))
      : items;
    return base;
  }, [items, location]);

  const trimmed = search.trim();
  const isNewFreeText =
    trimmed.length > 0 && !filtered.some((i) => i.name.toLowerCase() === trimmed.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-full justify-between font-normal overflow-hidden h-auto min-h-10 py-2 border-input text-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className={cn("min-w-0 flex-1 truncate text-left", !value && "text-muted-foreground")}>
            {value || placeholder || "Artikel wählen oder eintragen"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-3rem)] p-0 overflow-hidden"
        align="start"
      >
        <Command shouldFilter>
          <CommandInput
            placeholder="Suchen oder freien Text eintragen…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList
            className="max-h-64 overflow-y-auto overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {isNewFreeText && (
              <CommandGroup heading="Freier Eintrag">
                <CommandItem
                  value={`__free__${trimmed}`}
                  onSelect={() => {
                    onChange(trimmed);
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
              {filtered.map((item) => (
                <CommandItem
                  key={item.slug}
                  value={`${item.name} ${item.category}`}
                  onSelect={() => {
                    onChange(item.name);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === item.name ? "opacity-100" : "opacity-0")} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {item.category}
                      {item.available_locations?.length
                        ? ` · ${item.available_locations.map(locationLabel).join(", ")}`
                        : ""}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
