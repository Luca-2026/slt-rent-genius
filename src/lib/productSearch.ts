/**
 * Gemeinsame Suchlogik für die Artikelsuche auf der Startseite
 * (HeroSearch + ProductSearchDialog).
 *
 * Wichtig:
 * - Deduplizierung erfolgt über die Produkt-ID, NICHT über den Namen.
 *   Sonst verschwinden verschiedene Modelle mit identischem Anzeigenamen
 *   (z.B. zwei "Akku Bohrhammer" von Bosch) komplett aus der Suche.
 * - Umlaute/Sonderzeichen werden normalisiert, damit "eiswurfel" auch
 *   "Eiswürfelbereiter" findet.
 */

import { locations, getAllProductsForLocation, type Product } from "@/data/rentalData";
import { isAccessoryProduct } from "@/lib/searchDiversify";

export function normalizeSearchText(value?: string): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/&/g, " und ")
    .replace(/,/g, ".")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.\s/-]/g, " ")
    .replace(/[/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSearchTokens(value: string): string[] {
  return normalizeSearchText(value).split(" ").filter(Boolean);
}

export function matchesAllTokens(target: string | undefined, queryTokens: string[]): boolean {
  if (!target || queryTokens.length === 0) return false;

  const normalizedTarget = normalizeSearchText(target);
  const compactTarget = normalizedTarget.replace(/\s+/g, "");

  return queryTokens.every((token) => {
    const compactToken = token.replace(/\s+/g, "");
    return normalizedTarget.includes(token) || compactTarget.includes(compactToken);
  });
}

export function countMatchingTokens(target: string | undefined, queryTokens: string[]): number {
  if (!target || queryTokens.length === 0) return 0;

  const normalizedTarget = normalizeSearchText(target);
  const compactTarget = normalizedTarget.replace(/\s+/g, "");

  return queryTokens.filter((token) => {
    const compactToken = token.replace(/\s+/g, "");
    return normalizedTarget.includes(token) || compactTarget.includes(compactToken);
  }).length;
}

export function getFieldSearchScore(
  target: string | undefined,
  normalizedQuery: string,
  queryTokens: string[],
  weights: {
    exact: number;
    startsWith: number;
    includes: number;
    allTokens: number;
    perToken: number;
  },
): number {
  if (!target || !normalizedQuery) return 0;

  const normalizedTarget = normalizeSearchText(target);
  if (!normalizedTarget) return 0;

  const compactTarget = normalizedTarget.replace(/\s+/g, "");
  const compactQuery = normalizedQuery.replace(/\s+/g, "");
  const matchedTokenCount = countMatchingTokens(target, queryTokens);

  let score = 0;

  if (normalizedTarget === normalizedQuery || compactTarget === compactQuery) score += weights.exact;
  if (normalizedTarget.startsWith(normalizedQuery) || compactTarget.startsWith(compactQuery)) score += weights.startsWith;
  if (normalizedTarget.includes(normalizedQuery) || compactTarget.includes(compactQuery)) score += weights.includes;
  if (matchesAllTokens(target, queryTokens)) score += weights.allTokens;
  score += matchedTokenCount * weights.perToken;

  return score;
}

/**
 * Alle Mietartikel aller Standorte – dedupliziert über die Produkt-ID.
 * Zubehör-Kategorien werden ausgeblendet.
 */
export function getAllUniqueRentalProducts(): Product[] {
  const productMap = new Map<string, Product>();

  for (const location of locations) {
    for (const product of getAllProductsForLocation(location.id)) {
      if (!product?.id || !product.name) continue;
      if (isAccessoryProduct(product)) continue;
      if (productMap.has(product.id)) continue;
      productMap.set(product.id, product);
    }
  }

  return Array.from(productMap.values());
}

/**
 * Namen, die mehrfach vorkommen (verschiedene Modelle, gleicher Anzeigename).
 * Für diese Artikel blenden wir zusätzlich das Modell ein, damit die
 * Vorschlagsliste keine scheinbaren Duplikate zeigt.
 */
export function getAmbiguousNameSet(products: Product[]): Set<string> {
  const counts = new Map<string, number>();
  for (const product of products) {
    const key = normalizeSearchText(product.name);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return new Set([...counts].filter(([, count]) => count > 1).map(([key]) => key));
}

export function getLocationsForProduct(productId: string): typeof locations {
  return locations.filter((location) =>
    getAllProductsForLocation(location.id).some((p) => p.id === productId),
  );
}

export function getProductIdAtLocation(productId: string, locationId: string): string | null {
  const product = getAllProductsForLocation(locationId).find((p) => p.id === productId);
  return product?.id ?? null;
}

export function getCategoryForProductAtLocation(productId: string, locationId: string): string {
  const location = locations.find((l) => l.id === locationId);
  if (!location) return "alle";

  for (const [categoryId, products] of Object.entries(location.products)) {
    if (products.some((p) => p.id === productId)) return categoryId;
  }
  return "alle";
}

export function buildProductPath(locationId: string, categoryId: string, productId: string): string {
  return `/mieten/${locationId}/${categoryId}/${productId}/`;
}
