import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getLocationById, getProductsForLocationCategory, type Product } from "@/data/rentalData";
import { useManagedProductsVersion } from "@/data/managedProductsCache";
import { useCustomerType } from "@/hooks/useCustomerType";
import { formatEuro, priceFor, vatNote } from "@/lib/priceDisplay";
import { resolveProductPrices, tierPriceBau, type LocationPriceRow } from "@/lib/pricing/rentalPricing";
import { openRentalBundle } from "./RentalRequestCart";

const COLS = "id,slug,name,pricing_scheme,prices_same_all_locations,price_per_day,price_from_1_rd,price_from_3_rd,price_from_10_rd,price_from_20_rd,price_weekend_num,price_base_1_3_cd,surcharge_per_cd_from_4,surcharge_per_cd_from_8,price_from_1_week,price_from_2_weeks,price_from_3_weeks,price_from_4_weeks,price_short_1_3_rd";

/** Lädt CMS-Preise der empfohlenen Artikel, damit Rechner und Artikelseite dieselben Staffelpreise nutzen. */
export function useCalculatorPrices(slugs: string[]) {
  const key = [...new Set(slugs)].sort();
  return useQuery({
    queryKey: ["calc-prices", key],
    enabled: key.length > 0,
    queryFn: async () => {
      const { data: products } = await supabase.from("b2b_managed_products").select(COLS).in("slug", key);
      const ids = (products ?? []).map((p: { id: string }) => p.id);
      const { data: rows } = ids.length ? await supabase.from("b2b_managed_product_location_prices").select("*").in("managed_product_id", ids) : { data: [] };
      return { products: (products ?? []) as any[], rows: (rows ?? []) as LocationPriceRow[] };
    },
    staleTime: 300000,
  });
}

/** Mietpreis-Richtwert (netto) für Menge × Tage nach Bau-Staffel; null = auf Anfrage. */
export function linePrice(data: ReturnType<typeof useCalculatorPrices>["data"], slug: string, locationId: string, qty: number, days: number) {
  const p = data?.products.find((x) => x.slug === slug);
  if (!p || days < 1) return null;
  const tier = tierPriceBau(resolveProductPrices(p, locationId, data?.rows), days);
  return tier ? tier.rate * days * qty : null;
}

/** Findet den Artikel am Standort (veröffentlicht + dort verfügbar) samt Kategorie für den Link. */
function findAtLocation(locationId: string, slug: string): { product: Product; category: string } | null {
  const loc = getLocationById(locationId);
  for (const category of Object.keys(loc?.products ?? {})) {
    const product = getProductsForLocationCategory(locationId, category).find((p) => p.id === slug);
    if (product) return { product, category };
  }
  return null;
}

export function CalculatorRecommendations({ lines, locationId, days, fallbackNames = {}, showPrices = true }: { lines: { slug: string; qty: number }[]; locationId: string; days: number; fallbackNames?: Record<string, string>; showPrices?: boolean }) {
  const version = useManagedProductsVersion();
  const { type } = useCustomerType();
  const { data } = useCalculatorPrices(lines.map((l) => l.slug));
  const resolved = useMemo(() => lines.map((l) => ({ ...l, hit: findAtLocation(locationId, l.slug) })), [lines, locationId, version]);
  const location = getLocationById(locationId);
  const bookable = resolved.filter((r) => r.hit);
  const prices = resolved.map((r) => linePrice(data, r.slug, locationId, r.qty, days));
  const total = prices.every((p) => p != null) && prices.length ? prices.reduce((s, p) => s! + p!, 0)! : null;

  return (
    <div className="mt-4 space-y-3">
      <ul className="divide-y divide-border rounded-lg border border-border bg-background">
        {resolved.map((r, i) => (
          <li key={r.slug} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 p-3 text-sm">
            <span className="min-w-0 break-words"><strong>{r.qty} ×</strong>{" "}
              {r.hit ? <Link className="text-primary underline-offset-2 hover:underline" to={`/mieten/${locationId}/${r.hit.category}/${r.slug}`}>{r.hit.product.name}</Link> : <>{fallbackNames[r.slug] ?? r.slug} <span className="text-muted-foreground">(auf Anfrage)</span></>}
            </span>
            {showPrices && <span className="font-semibold">{prices[i] != null ? formatEuro(priceFor(prices[i]!, type)) : "Preis auf Anfrage"}</span>}
          </li>
        ))}
      </ul>
      {showPrices && total != null && days > 0 && <p className="text-sm font-semibold flex flex-wrap justify-between gap-2"><span>Richtwert gesamt für {days} {days === 1 ? "Tag" : "Tage"}</span><span>{formatEuro(priceFor(total, type))} <span className="font-normal text-muted-foreground">{vatNote(type)}</span></span></p>}
      {location && bookable.length > 0 && (
        <Button className="w-full h-auto min-h-10 whitespace-normal" onClick={() => openRentalBundle(bookable.map((r) => ({ slug: r.slug, name: r.hit!.product.name, image: r.hit!.product.image, quantity: r.qty })), location)}>
          <ShoppingCart className="h-4 w-4 shrink-0" /> Alle empfohlenen Geräte in den Warenkorb
        </Button>
      )}
      {bookable.length < resolved.length && <p className="text-xs text-muted-foreground">Artikel mit „auf Anfrage“ sind an diesem Standort nicht online anfragbar – sprich uns gern an.</p>}
    </div>
  );
}

export function ToolsLink() {
  return <Link to="/tools" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">Alle Rechner & Tools <ArrowRight className="h-3.5 w-3.5" /></Link>;
}
