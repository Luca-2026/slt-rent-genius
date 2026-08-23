import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalesCatalog, type SalesCatalogItem } from "@/hooks/useSalesCatalog";

interface Props {
  value: string;
  disabled?: boolean;
  onSelect: (item: SalesCatalogItem | null, freeText: string) => void;
}

const euro = (v: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);

/**
 * Auswahl eines Verkaufsartikels (Neu- oder Gebrauchtartikel) aus dem
 * Verkaufs-CMS – liefert Bild und Nettopreis für Angebote mit.
 */
export function SalesProductCombobox({ value, disabled, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { items } = useSalesCatalog();

  const groups = useMemo(
    () => ({
      neu: items.filter((i) => i.kind === "new"),
      gebraucht: items.filter((i) => i.kind === "used"),
    }),
    [items],
  );

  const trimmed = search.trim();
  const isFreeText = trimmed.length > 0 && !items.some((i) => i.name.toLowerCase() === trimmed.toLowerCase());

  const renderItem = (item: SalesCatalogItem) => (
    <CommandItem
      key={`${item.kind}-${item.id}`}
      value={`${item.name} ${item.category} ${item.article_number ?? ""}`}
      onSelect={() => {
        onSelect(item, item.name);
        setOpen(false);
      }}
    >
      <Check className={cn("mr-2 h-4 w-4 shrink-0", value === item.name ? "opacity-100" : "opacity-0")} />
      {item.image ? (
        <img src={item.image} alt="" loading="lazy" className="mr-2 h-8 w-8 rounded object-cover shrink-0" />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="truncate">{item.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {item.category}
          {item.price_on_request
            ? " · Preis auf Anfrage"
            : item.net_price != null
              ? ` · ${euro(item.net_price)} netto`
              : ""}
          {item.year ? ` · BJ ${item.year}` : ""}
        </div>
      </div>
    </CommandItem>
  );

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
            {value || "Verkaufsartikel wählen oder eintragen"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-3rem)] p-0" align="start">
        <Command shouldFilter>
          <CommandInput placeholder="Verkaufsartikel suchen …" value={search} onValueChange={setSearch} />
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
            {groups.neu.length > 0 && (
              <CommandGroup heading="Neuartikel">{groups.neu.map(renderItem)}</CommandGroup>
            )}
            {groups.gebraucht.length > 0 && (
              <CommandGroup heading="Gebrauchtartikel">{groups.gebraucht.map(renderItem)}</CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
