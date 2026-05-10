/**
 * Schema.org JSON-LD sanitizer.
 *
 * Google requires every `Offer` (or `AggregateOffer`) to expose either
 * `price` or `priceSpecification.price`. Offers without one of these
 * values cause "Ungültige Elemente" warnings in Search Console and
 * disable Rich Results.
 *
 * This helper walks any JSON-LD object/array and:
 *   – removes `Offer` / `AggregateOffer` nodes that have no price,
 *   – removes parent `offers` props that become empty as a result,
 *   – removes `makesOffer` / `itemOffered` parents whose Offer is invalid.
 *
 * It never mutates the input – it returns a deep-cleaned copy.
 *
 * Pure function, safe for use in Node (build-time prerender) and in
 * the browser (runtime SEO component).
 */

type AnyJson =
  | string
  | number
  | boolean
  | null
  | undefined
  | AnyJson[]
  | { [key: string]: AnyJson };

const OFFER_TYPES = new Set(["Offer", "AggregateOffer"]);

function isObject(value: unknown): value is Record<string, AnyJson> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getType(node: Record<string, AnyJson>): string | null {
  const t = node["@type"];
  if (typeof t === "string") return t;
  if (Array.isArray(t) && typeof t[0] === "string") return t[0];
  return null;
}

function hasValidPrice(node: Record<string, AnyJson>): boolean {
  // Direct price (string or number, must be parseable & > 0 OR explicit "0")
  const direct = node.price;
  if (typeof direct === "number" && Number.isFinite(direct)) return true;
  if (typeof direct === "string" && direct.trim() !== "") return true;

  // priceSpecification.price (or array of specs)
  const spec = node.priceSpecification;
  const specs = Array.isArray(spec) ? spec : spec ? [spec] : [];
  for (const s of specs) {
    if (isObject(s)) {
      const p = s.price;
      if (typeof p === "number" && Number.isFinite(p)) return true;
      if (typeof p === "string" && p.trim() !== "") return true;
    }
  }

  // AggregateOffer alternative: lowPrice / highPrice
  const t = getType(node);
  if (t === "AggregateOffer") {
    if (node.lowPrice != null && String(node.lowPrice).trim() !== "") return true;
  }

  return false;
}

/**
 * Recursively walk `node`, returning a cleaned copy.
 * Returns `undefined` if the node itself becomes invalid (e.g. Offer w/o price)
 * so the caller can drop the property.
 */
function clean(node: AnyJson): AnyJson | undefined {
  if (Array.isArray(node)) {
    const out = node
      .map((item) => clean(item))
      .filter((item) => item !== undefined) as AnyJson[];
    return out;
  }

  if (!isObject(node)) return node;

  const type = getType(node);

  // Drop Offer-typed nodes lacking a price.
  if (type && OFFER_TYPES.has(type) && !hasValidPrice(node)) {
    return undefined;
  }

  const out: Record<string, AnyJson> = {};
  for (const [key, value] of Object.entries(node)) {
    const cleaned = clean(value);

    // Property-level invalidation: if `offers` becomes empty, drop it.
    if (key === "offers") {
      if (cleaned === undefined) continue;
      if (Array.isArray(cleaned) && cleaned.length === 0) continue;
      out[key] = cleaned;
      continue;
    }

    // `makesOffer` is an array of Offers – drop the prop if it empties out.
    if (key === "makesOffer") {
      if (cleaned === undefined) continue;
      if (Array.isArray(cleaned) && cleaned.length === 0) continue;
      out[key] = cleaned;
      continue;
    }

    if (cleaned !== undefined) out[key] = cleaned;
  }

  return out;
}

export function sanitizeJsonLd<T extends AnyJson>(input: T): T {
  const result = clean(input);
  // If a top-level Offer was invalid, fall back to the original (without the
  // node); callers expect *something* back. Returning empty array is safer.
  if (result === undefined) {
    return (Array.isArray(input) ? [] : {}) as T;
  }
  return result as T;
}
