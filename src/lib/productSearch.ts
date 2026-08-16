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

/**
 * Zweite Normalisierung: Umlaute werden auf den Grundbuchstaben reduziert
 * (ü -> u), damit sowohl "eiswuerfel" als auch "eiswurfel" treffen.
 */
export function foldSearchText(value?: string): string {
  return (value ?? "")
    .toLowerCase()
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

function targetVariants(target: string): string[] {
  const a = normalizeSearchText(target);
  const b = foldSearchText(target);
  const variants = [a, a.replace(/\s+/g, "")];
  if (b && b !== a) variants.push(b, b.replace(/\s+/g, ""));
  return variants.filter(Boolean);
}

export interface SearchToken {
  variants: string[];
}

export function getSearchTokens(value: string): string[] {
  return normalizeSearchText(value).split(" ").filter(Boolean);
}

function getTokenVariants(value: string): SearchToken[] {
  const a = normalizeSearchText(value).split(" ").filter(Boolean);
  const b = foldSearchText(value).split(" ").filter(Boolean);
  return a.map((token, i) => {
    const variants = new Set([token, token.replace(/\s+/g, "")]);
    const alt = b[i];
    if (alt) {
      variants.add(alt);
      variants.add(alt.replace(/\s+/g, ""));
    }
    return { variants: [...variants] };
  });
}

function tokenHits(target: string, queryTokens: string[]): number {
  const variants = targetVariants(target);
  if (variants.length === 0) return 0;

  // queryTokens kommen bereits normalisiert; Varianten aus dem Rohtoken ableiten
  return queryTokens.filter((token) => {
    const tokenVariants = new Set([token, token.replace(/\s+/g, ""), foldSearchText(token)]);
    return [...tokenVariants].some((tv) => tv && variants.some((v) => v.includes(tv)));
  }).length;
}

export function matchesAllTokens(target: string | undefined, queryTokens: string[]): boolean {
  if (!target || queryTokens.length === 0) return false;
  return tokenHits(target, queryTokens) === queryTokens.length;
}

export function countMatchingTokens(target: string | undefined, queryTokens: string[]): number {
  if (!target || queryTokens.length === 0) return 0;
  return tokenHits(target, queryTokens);
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

  const variants = targetVariants(target);
  if (variants.length === 0) return 0;

  const queryVariants = [
    normalizedQuery,
    normalizedQuery.replace(/\s+/g, ""),
    foldSearchText(normalizedQuery),
    foldSearchText(normalizedQuery).replace(/\s+/g, ""),
  ].filter(Boolean);

  const matchedTokenCount = countMatchingTokens(target, queryTokens);

  let score = 0;
  if (variants.some((v) => queryVariants.includes(v))) score += weights.exact;
  if (variants.some((v) => queryVariants.some((q) => v.startsWith(q)))) score += weights.startsWith;
  if (variants.some((v) => queryVariants.some((q) => v.includes(q)))) score += weights.includes;
  if (matchedTokenCount === queryTokens.length && queryTokens.length > 0) score += weights.allTokens;
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
