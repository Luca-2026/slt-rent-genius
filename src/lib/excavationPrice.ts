import { linePrice, type useCalculatorPrices } from "@/components/rental/CalculatorRecommendations";

/** Mietpreis-Richtwert (netto) für den Aushubrechner. Nur für Bau-Staffelartikel belegbar –
 *  identisch mit der serverseitigen Preisvorschau für Werktage; sonst null = „Preis auf Anfrage“. */
export function excavationLinePrice(data: ReturnType<typeof useCalculatorPrices>["data"], slug: string, locationId: string, qty: number, days: number) {
  const p = data?.products.find((x) => x.slug === slug);
  if (!p || p.pricing_scheme !== "bau") return null;
  return linePrice(data, slug, locationId, qty, days);
}
