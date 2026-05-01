/**
 * Diversifies a sorted list of search results by rotating through "model families"
 * so that visually similar variants (e.g. multiple heights of the same scaffold)
 * don't dominate the top of the result list.
 *
 * Example: 8 "Krause Rollgerüst Breitaufbau" variants no longer push out the
 * "Krause Rollgerüst Schmalaufbau" or plain "Krause Rollgerüst" entries.
 */

/**
 * Kategorien, die reines Zubehör/Ersatzteile zu einem Hauptmietartikel sind
 * (z.B. Belagbühnen, Diagonalen für Gerüste, Traversen-Zubehör).
 * Diese Produkte sollen NICHT in der allgemeinen Suche auftauchen,
 * weil Kunden sonst denken, wir hätten nur Zubehörteile.
 */
export const ACCESSORY_CATEGORIES = new Set<string>([
  "geruestteil",
  "buehnen-zubehoer",
  "traversen-zubehoer",
]);

/**
 * Returns true if the product belongs to an accessory-only category and should be hidden from search.
 */
export function isAccessoryProduct(product: { category?: string } | undefined | null): boolean {
  if (!product?.category) return false;
  return ACCESSORY_CATEGORIES.has(product.category);
}

/**
 * Extract a coarse "family" key from a product name.
 * Strips everything from the first digit / dash-with-number / measurement onward,
 * collapsing all height/size variants of the same model to one bucket.
 *
 * "Krause Rollgerüst Breitaufbau – 10,4 m" -> "krause rollgerust breitaufbau"
 * "Krause Rollgerüst – 9,4 m Arbeitshöhe (2,00 × 0,75 m)" -> "krause rollgerust"
 */
export function getModelFamilyKey(name: string | undefined | null): string {
  if (!name) return "";
  let s = name.toLowerCase();
  // Remove diacritics
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Cut at first parenthesis, comma, dash, or digit-with-unit
  s = s.split(/[(,]/)[0];
  s = s.split(/\s[–\-]\s/)[0];
  // Cut at first standalone number (e.g. "9,4 m" / "10m" / "Serie 10")
  s = s.replace(/\s+\d.*$/, "");
  // Normalize whitespace and special chars
  s = s.replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  return s;
}

/**
 * Round-robin a sorted list across model families and return the top `limit` items.
 * Preserves relative score order within each family.
 */
export function diversifyByFamily<T>(
  items: T[],
  getName: (item: T) => string | undefined | null,
  limit: number,
): T[] {
  if (items.length <= 1) return items.slice(0, limit);

  const buckets = new Map<string, T[]>();
  const order: string[] = [];

  for (const item of items) {
    const family = getModelFamilyKey(getName(item)) || `__solo_${order.length}`;
    if (!buckets.has(family)) {
      buckets.set(family, []);
      order.push(family);
    }
    buckets.get(family)!.push(item);
  }

  // If everything ended up in a single family, just return the head.
  if (order.length === 1) return items.slice(0, limit);

  const result: T[] = [];
  let added = true;
  while (added && result.length < limit) {
    added = false;
    for (const family of order) {
      const bucket = buckets.get(family)!;
      if (bucket.length === 0) continue;
      result.push(bucket.shift()!);
      added = true;
      if (result.length >= limit) break;
    }
  }
  return result;
}
