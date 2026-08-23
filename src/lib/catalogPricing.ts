/**
 * Preisauflösung für Angebotspositionen.
 *
 * Reihenfolge: CMS-Tagespreis → „ab"-Preis aus den SEO-Produktdaten
 * (dailyPriceFrom) → Wochenend-/Monatspreis als letzte Rückfallebene.
 * Die SEO-Daten werden per dynamischem Import geladen, damit das große
 * Datenmodul nicht im Portal-Bundle landet.
 */

/** "89,00 €/Tag" -> 89 ; undefined, wenn kein Betrag erkennbar ist. */
export function parsePriceValue(raw: string | null | undefined): number | undefined {
  if (!raw) return undefined;
  const match = String(raw).replace(/\s/g, "").match(/(\d+(?:[.,]\d{1,2})?)/);
  if (!match) return undefined;
  const value = Number(match[1].replace(".", "").replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

let seoPriceMap: Record<string, number> | null = null;

/** „ab"-Tagespreis aus productSEOData (inkl. Standort-Präfix-Fallback). */
export async function getSeoDayPrice(slug: string | undefined | null): Promise<number | undefined> {
  if (!slug) return undefined;
  if (!seoPriceMap) {
    const mod = await import("@/data/productSEOData");
    const map: Record<string, number> = {};
    for (const [key, entry] of Object.entries(mod.productSEOData)) {
      if (typeof entry.dailyPriceFrom === "number") map[key] = entry.dailyPriceFrom;
    }
    seoPriceMap = map;
  }
  const direct = seoPriceMap[slug];
  if (typeof direct === "number") return direct;
  // Standort-Präfix entfernen bzw. ergänzen
  const stripped = slug.replace(/^(krefeld|bonn|muelheim)-/, "");
  if (stripped !== slug && typeof seoPriceMap[stripped] === "number") return seoPriceMap[stripped];
  for (const loc of ["krefeld", "bonn", "muelheim"]) {
    const value = seoPriceMap[`${loc}-${slug}`];
    if (typeof value === "number") return value;
  }
  return undefined;
}

export interface PricedCatalogRow {
  slug?: string | null;
  price_per_day?: string | null;
  price_weekend?: string | null;
  price_per_month?: string | null;
}

export interface ResolvedPrice {
  price: number;
  unit: "kalendertage" | "wochen" | "monate" | "stueck";
}

/** Netto-Einzelpreis eines CMS-Artikels inkl. passender Mengeneinheit. */
export async function resolveCatalogPrice(
  row: PricedCatalogRow | null | undefined,
): Promise<ResolvedPrice | undefined> {
  if (!row) return undefined;
  const day = parsePriceValue(row.price_per_day);
  if (day !== undefined) return { price: day, unit: "kalendertage" };
  const seo = await getSeoDayPrice(row.slug);
  if (seo !== undefined) return { price: seo, unit: "kalendertage" };
  const weekend = parsePriceValue(row.price_weekend);
  if (weekend !== undefined) return { price: weekend, unit: "wochen" };
  const month = parsePriceValue(row.price_per_month);
  if (month !== undefined) return { price: month, unit: "monate" };
  return undefined;
}
