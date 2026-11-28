import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getLocationById, getProductsForLocationCategory, type Product } from "@/data/rentalData";
import { getManagedProductsCacheStatus, useManagedProductsVersion } from "@/data/managedProductsCache";
import { useCustomerType } from "@/hooks/useCustomerType";
import { formatEuro, priceFor, vatNote } from "@/lib/priceDisplay";
import { resolveProductPrices, tierPriceBau, type LocationPriceRow } from "@/lib/pricing/rentalPricing";
import { openRentalBundle } from "./RentalRequestCart";

const COLS = "id,slug,name,pricing_scheme,prices_same_all_locations,price_per_day,price_from_1_rd,price_from_3_rd,price_from_10_rd,price_from_20_rd,price_weekend_num,price_base_1_3_cd,surcharge_per_cd_from_4,surcharge_per_cd_from_8,price_from_1_week,price_from_2_weeks,price_from_3_weeks,price_from_4_weeks,price_short_1_3_rd";

/** Lädt CMS-Preise der empfohlenen Artikel, damit Rechner und Artikelseite dieselben Staffelpreise nutzen. */
export function useCalculatorPrices(slugs: string[]) {
  const key = [...new Set(slugs)].sort();
  const query = useQuery({
    queryKey: ["calc-prices", key],
    enabled: key.length > 0,
    queryFn: async () => {
      const { data: products, error } = await supabase.from("managed_products_public").select(COLS).in("slug", key);
      if (error) throw error;
      const ids = (products ?? []).map((p: { id: string }) => p.id);
      const { data: rows, error: priceError } = ids.length ? await supabase.from("public_product_prices").select("*").in("managed_product_id", ids) : { data: [], error: null };
      if (priceError) throw priceError;
      return { products: (products ?? []) as any[], rows: (rows ?? []) as LocationPriceRow[] };
    },
    staleTime: 60_000,
    refetchInterval: 30_000,
  });
  const expired = !!query.data && Date.now() - query.dataUpdatedAt >= 60_000;
  return { ...query, data: query.isError || expired ? undefined : query.data, isError: query.isError || expired };
}

/** Mietpreis-Richtwert (netto) für Menge × Tage nach Bau-Staffel; null = auf Anfrage. */
export function linePrice(data: ReturnType<typeof useCalculatorPrices>["data"], slug: string, locationId: string, qty: number, days: number) {
  const p = data?.products.find((x) => x.slug === slug);
  if (!p || days < 1) return null;
  const tier = tierPriceBau(resolveProductPrices(p, locationId, data?.rows), days);
  return tier ? tier.rate * days * qty : null;
}

export type PriceSnapshot = { status: "loading" | "error" | "ready"; items: { slug: string; qty: number; days: number; lineNet: number | null; unitNet: number | null }[]; knownNet: number; complete: boolean };
/** Ein Preis-Snapshot für Rechner und Projektbericht: gleiche Daten, gleiche Funktion, kein veralteter Stand. */
export function priceSnapshot(query: { data?: ReturnType<typeof useCalculatorPrices>["data"]; isLoading: boolean; isError: boolean }, lines: { slug: string; qty: number }[], locationId: string | undefined, days: number, priceOf: typeof linePrice = linePrice): PriceSnapshot {
  const status = !lines.length ? "ready" : query.isLoading || (!query.data && !query.isError) ? "loading" : query.isError ? "error" : "ready";
  const items = lines.map((l) => { const lineNet = status === "ready" && locationId ? priceOf(query.data, l.slug, locationId, l.qty, days) : null; return { slug: l.slug, qty: l.qty, days, lineNet, unitNet: lineNet != null ? lineNet / l.qty / days : null }; });
  const known = items.filter((i) => i.lineNet != null);
  return { status, items, knownNet: Math.round(known.reduce((sum, i) => sum + i.lineNet!, 0) * 1e6) / 1e6, complete: status === "ready" && items.length > 0 && known.length === items.length };
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

export function CalculatorRecommendations({ lines, locationId, days, fallbackNames = {}, showPrices = true, priceOf = linePrice }: { lines: { slug: string; qty: number }[]; locationId: string; days: number; fallbackNames?: Record<string, string>; showPrices?: boolean; priceOf?: typeof linePrice }) {
  const version = useManagedProductsVersion();
  const { type } = useCustomerType();
  const query = useCalculatorPrices(lines.map((l) => l.slug));
  const resolved = useMemo(() => lines.map((l) => ({ ...l, hit: findAtLocation(locationId, l.slug) })), [lines, locationId, version]);
  const location = getLocationById(locationId);
  const bookable = resolved.filter((r) => r.hit);
  const catalogueReady = getManagedProductsCacheStatus() === "loaded";
  const snap = priceSnapshot(catalogueReady ? query : { isLoading: false, isError: true }, resolved.map((r) => ({ slug: r.slug, qty: r.qty })), locationId, days, priceOf);
  const prices = snap.items.map((i) => i.lineNet);
  const names = bookable.map((r) => `${r.qty} × ${r.hit!.product.name}`);
  return (
    <div className="mt-4 space-y-3">
      {!catalogueReady && <p role="status" className="text-sm text-muted-foreground">Artikeldaten gerade nicht abrufbar. Die Mengenberechnung bleibt möglich; zu passenden Geräten berät dich unser Standortteam.</p>}
      <ul className="divide-y divide-border rounded-lg border border-border bg-background">
        {resolved.map((r, i) => (
          <li key={r.slug} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 p-3 text-sm">
            <span className="min-w-0 break-words"><strong>{r.qty} ×</strong>{" "}
              {r.hit ? <Link className="text-primary underline-offset-2 hover:underline" to={`/mieten/${locationId}/${r.hit.category}/${r.slug}`}>{r.hit.product.name}</Link> : <>{fallbackNames[r.slug] ?? r.slug} <span className="text-muted-foreground">(auf Anfrage)</span></>}
            </span>
            {showPrices && <span className="font-semibold" data-testid={`calc-price-${r.slug}`}>{snap.status === "loading" ? "Preis wird berechnet …" : snap.status === "error" ? "Preis derzeit nicht abrufbar" : prices[i] != null ? formatEuro(priceFor(prices[i]!, type)) : "Preis auf Anfrage"}</span>}
          </li>
        ))}
      </ul>
      {showPrices && snap.status === "ready" && snap.knownNet > 0 && days > 0 && <p className="text-sm font-semibold flex flex-wrap justify-between gap-2" data-testid="calc-total"><span>{snap.complete ? "Richtwert gesamt" : "Teilsumme der bekannten Preise"} für {days} {days === 1 ? "Miettag" : "Miettage"}</span><span>{formatEuro(priceFor(snap.knownNet, type))} <span className="font-normal text-muted-foreground">{vatNote(type)}</span></span></p>}
      {showPrices && snap.status === "ready" && !snap.complete && snap.knownNet > 0 && <p className="text-xs text-muted-foreground">Ohne Positionen mit „Preis auf Anfrage“ – kein Gesamtpreis.</p>}
      {location && bookable.length > 0 && (<>
        <Button className="w-full h-auto min-h-10 whitespace-normal" aria-label={`${bookable.length === 1 ? "1 Gerät" : `${bookable.length} Geräte`} in den Warenkorb legen: ${names.join(", ")}`} onClick={() => openRentalBundle(bookable.map((r) => ({ slug: r.slug, name: r.hit!.product.name, image: r.hit!.product.image, quantity: r.qty })), location)}>
          <ShoppingCart className="h-4 w-4 shrink-0" /> {bookable.length === 1 ? `${bookable[0].hit!.product.name} in den Warenkorb` : `Diese ${bookable.length} Geräte in den Warenkorb`}
        </Button>
        <p className="text-xs text-muted-foreground">Übernommen werden: {names.join(", ")}. Den gemeinsamen Mietzeitraum bestätigst du im nächsten Schritt.</p>
      </>)}
      {bookable.length < resolved.length && <p className="text-xs text-muted-foreground">Artikel mit „auf Anfrage“ sind an diesem Standort nicht online anfragbar – sprich uns gern an.</p>}
    </div>
  );
}

export function ToolsLink() {
  return <Link to="/tools" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">Alle Rechner & Tools <ArrowRight className="h-3.5 w-3.5" /></Link>;
}
