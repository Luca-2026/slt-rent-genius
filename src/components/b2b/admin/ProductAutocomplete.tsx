import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { locations, type Product } from "@/data/rentalData";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (name: string, productId: string, categorySlug: string) => void;
  location?: string;
  placeholder?: string;
  className?: string;
}

/** Flatten all products across all locations into a unique list by id */
function getAllUniqueProducts(): { product: Product; categorySlug: string }[] {
  const seen = new Set<string>();
  const results: { product: Product; categorySlug: string }[] = [];

  for (const loc of locations) {
    for (const [catSlug, products] of Object.entries(loc.products)) {
      for (const product of products) {
        if (!seen.has(product.id)) {
          seen.add(product.id);
          results.push({ product, categorySlug: catSlug });
        }
      }
    }
  }

  return results;
}

export function ProductAutocomplete({ value, onChange, location, placeholder, className }: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const allProducts = useMemo(() => getAllUniqueProducts(), []);

  // Filter products: optionally by location, then by search query
  const filtered = useMemo(() => {
    if (!query || query.length < 2) return [];

    const q = query.toLowerCase();

    let pool = allProducts;
    if (location) {
      const loc = locations.find((l) => l.id === location);
      if (loc) {
        const locProductIds = new Set(
          Object.values(loc.products)
            .flat()
            .map((p) => p.id)
        );
        pool = allProducts.filter((item) => locProductIds.has(item.product.id));
      }
    }

    return pool
      .filter((item) => item.product.name.toLowerCase().includes(q) || item.product.id.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, location, allProducts]);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          // Also push raw text so the parent always has the current value
          onChange(e.target.value, e.target.value.toLowerCase().replace(/\s+/g, "-"), "");
        }}
        onFocus={() => query.length >= 2 && setOpen(true)}
        placeholder={placeholder || "z.B. Minibagger 1,5t"}
        className={className}
        autoComplete="off"
      />

      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((item) => (
            <button
              key={item.product.id}
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent/10 transition-colors"
              onClick={() => {
                setQuery(item.product.name);
                onChange(item.product.name, item.product.id, item.categorySlug);
                setOpen(false);
              }}
            >
              {item.product.image && (
                <img
                  src={item.product.image}
                  alt=""
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-foreground">{item.product.name}</p>
                {item.product.description && (
                  <p className="text-xs text-muted-foreground truncate">{item.product.description}</p>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground capitalize flex-shrink-0">
                {item.categorySlug}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
