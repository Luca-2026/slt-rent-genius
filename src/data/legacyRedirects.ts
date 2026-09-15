// Zentrale Auflösung von Alt-URLs (Legacy-Pfade aus der alten Website).
// -------------------------------------------------------------------
// Ziel: Jede Alt-URL landet auf dem bestmöglichen Ziel — bevorzugt die
// konkrete Produktseite, sonst die passende Kategorie, erst als letzte
// Notlösung der Standort-Hub. Wird von der SPA (LegacyRedirects.tsx) UND
// vom .htaccess-Generator (über scripts/exportRoutes.ts) benutzt, damit
// Client- und Server-Redirects identisch sind.

import { locations, productCategories, type Product } from "@/data/rentalData";
import {
  CATEGORY_REASSIGNMENT_SOURCES,
  DUPLICATE_PRODUCT_CANONICAL,
  DUPLICATE_SOURCE_CATEGORY,
} from "@/data/categoryModel";

export const LEGACY_LOCATION_IDS = ["krefeld", "bonn", "muelheim"] as const;

/** Alte Standort-Präfixe in Legacy-Slugs → aktuelle Standort-ID. */
export const LEGACY_LOCATION_PREFIXES: Record<string, string> = {
  "krefeld-": "krefeld",
  "bonn-": "bonn",
  "muelheim-": "muelheim",
  "muehlheim-": "muelheim",
  "duisburg-": "muelheim",
};

/** Alte Kategorie-Slugs → aktuelle Kategorie-IDs. */
export const LEGACY_CATEGORY_ALIASES: Record<string, string> = {
  rigging: "traversen-rigging",
  traversen: "traversen-rigging",
  buehnen: "buehne",
  bühnen: "buehne",
  bühne: "buehne",
  hebebuehnen: "arbeitsbuehnen",
  hubarbeitsbuehnen: "arbeitsbuehnen",
  bagger: "erdbewegung",
  minibagger: "erdbewegung",
  baumaschinen: "erdbewegung",
  ruettelplatten: "verdichtung",
  rüttelplatten: "verdichtung",
  stampfer: "verdichtung",
  heizung: "heizung-trocknung",
  trocknung: "heizung-trocknung",
  bautrockner: "heizung-trocknung",
  licht: "beleuchtung",
  ton: "beschallung",
  audio: "beschallung",
  sound: "beschallung",
  strom: "kabel-stromverteiler",
  stromverteiler: "kabel-stromverteiler",
  kabel: "kabel-stromverteiler",
  generatoren: "aggregate",
  stromerzeuger: "aggregate",
  leitern: "leitern-gerueste",
  geruest: "leitern-gerueste",
  gerueste: "leitern-gerueste",
  zelte: "moebel-zelte",
  partyzelte: "moebel-zelte",
  moebel: "moebel-zelte",
  geschirr: "geschirr-glaeser-besteck",
  glaeser: "geschirr-glaeser-besteck",
  besteck: "geschirr-glaeser-besteck",
  huepfburg: "huepfburgen",
  garten: "gartenpflege",
  gartengeraete: "gartenpflege",
  funk: "kommunikation",
  funkgeraete: "kommunikation",
  absperrung: "absperrtechnik",
  effekte: "spezialeffekte",
  nebelmaschinen: "spezialeffekte",
};

/** Vereinheitlicht Umlaut-Schreibweisen, damit "ruttelplatte" == "rüttelplatte". */
export function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "s")
    .replace(/ae/g, "a")
    .replace(/oe/g, "o")
    .replace(/ue/g, "u")
    .replace(/ss/g, "s")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tokens(value: string): string[] {
  return normalizeSlug(value).split("-").filter(Boolean);
}

function extractKg(value: string): number | undefined {
  const m = normalizeSlug(value).match(/(\d{2,4})-?kg/);
  return m ? Number(m[1]) : undefined;
}

export interface ResolvedLegacyTarget {
  path: string;
  /** product | category | location | root */
  kind: "product" | "category" | "location" | "root";
}

interface Candidate {
  product: Product;
  locationId: string;
  categoryId: string;
}

function allCandidates(locationId?: string): Candidate[] {
  const out: Candidate[] = [];
  for (const location of locations) {
    if (locationId && location.id !== locationId) continue;
    for (const [categoryId, products] of Object.entries(location.products)) {
      for (const product of products) out.push({ product, locationId: location.id, categoryId });
    }
  }
  return out;
}

/** Bewertet, wie gut ein Legacy-Slug zu einem Produkt passt (0…1). */
function scoreCandidate(slugTokens: string[], slugKg: number | undefined, c: Candidate): number {
  const idTokens = tokens(c.product.id);
  const nameTokens = tokens(c.product.name);
  const haystack = new Set([...idTokens, ...nameTokens]);

  if (normalizeSlug(c.product.id) === slugTokens.join("-")) return 1;

  let hits = 0;
  for (const t of slugTokens) {
    if (haystack.has(t)) hits += 1;
    else if ([...haystack].some((h) => h.length > 3 && (h.includes(t) || t.includes(h)))) hits += 0.6;
  }
  let score = hits / Math.max(slugTokens.length, 1);

  // Gewichtsangaben (z. B. "100-kg") gegen Produktgewicht / Namen abgleichen.
  if (slugKg) {
    const productKg = c.product.weightKg ?? extractKg(c.product.name) ?? extractKg(c.product.id);
    if (productKg) {
      const diff = Math.abs(productKg - slugKg) / slugKg;
      if (diff <= 0.25) score += 0.35 * (1 - diff / 0.25);
    }
  }
  return score;
}

/** Findet die Kategorie, zu deren Produkten der Slug thematisch passt. */
function guessCategory(slugTokens: string[], locationId: string): string | undefined {
  const aliasHit = slugTokens.map((t) => LEGACY_CATEGORY_ALIASES[t]).find(Boolean);
  if (aliasHit) return aliasHit;

  const direct = productCategories.find((c) =>
    slugTokens.some((t) => normalizeSlug(c.id) === t || normalizeSlug(c.title) === t),
  );
  if (direct) return direct.id;

  const counts = new Map<string, number>();
  for (const c of allCandidates(locationId)) {
    const haystack = new Set([...tokens(c.product.id), ...tokens(c.product.name)]);
    for (const t of slugTokens) {
      if (t.length < 4) continue;
      if (haystack.has(t) || [...haystack].some((h) => h.length > 3 && h.includes(t))) {
        counts.set(c.categoryId, (counts.get(c.categoryId) || 0) + 1);
      }
    }
  }
  let best: string | undefined;
  let bestCount = 0;
  for (const [cat, n] of counts) {
    if (n > bestCount) {
      best = cat;
      bestCount = n;
    }
  }
  return best;
}

function categoryExists(locationId: string, categoryId: string): boolean {
  const loc = locations.find((l) => l.id === locationId);
  return !!loc && loc.availableCategories.includes(categoryId);
}

/** Alt-Kategoriepfad (z. B. "bonn-anhaenger" oder "heizung-trocknung"). */
export function resolveLegacyCategory(rawSlug: string, defaultLocation = "krefeld"): ResolvedLegacyTarget {
  let slug = (rawSlug || "").toLowerCase().replace(/\/+$/, "");
  let locationId = defaultLocation;

  for (const [prefix, locId] of Object.entries(LEGACY_LOCATION_PREFIXES)) {
    if (slug.startsWith(prefix)) {
      locationId = locId;
      slug = slug.slice(prefix.length);
      break;
    }
  }
  slug = slug.replace(/zus$/i, "").replace(/^-+|-+$/g, "");

  if (!slug || slug === "alle" || slug === "alle-produkte") {
    return { path: `/mieten/${locationId}`, kind: "location" };
  }

  const normalized = normalizeSlug(slug);
  const exact = productCategories.find(
    (c) => c.id !== "alle" && (c.id === slug || normalizeSlug(c.id) === normalized),
  );
  const mapped = exact?.id || LEGACY_CATEGORY_ALIASES[slug] || guessCategory(tokens(slug), locationId);

  if (mapped && categoryExists(locationId, mapped)) {
    return { path: `/mieten/${locationId}/${mapped}`, kind: "category" };
  }
  if (mapped) {
    // Kategorie gibt es an diesem Standort nicht → Standort mit Kategorie suchen.
    const alt = LEGACY_LOCATION_IDS.find((l) => categoryExists(l, mapped));
    if (alt) return { path: `/mieten/${alt}/${mapped}`, kind: "category" };
  }
  return { path: `/mieten/${locationId}`, kind: "location" };
}

/** Alt-Produktpfad (z. B. "/produkte/ruttelplatte-100-kg"). */
export function resolveLegacyProduct(rawSlug: string, preferredLocation?: string): ResolvedLegacyTarget {
  const slug = (rawSlug || "").toLowerCase().replace(/\/+$/, "");
  if (!slug) {
    return preferredLocation
      ? { path: `/mieten/${preferredLocation}`, kind: "location" }
      : { path: "/mieten", kind: "root" };
  }

  // Manche Alt-URLs sind in Wahrheit Kategorien (/produkte/arbeitsbuehnen).
  const asCategory = productCategories.find((c) => c.id !== "alle" && c.id === slug);
  if (asCategory) {
    return resolveLegacyCategory(slug, preferredLocation || "krefeld");
  }

  const slugTokens = tokens(slug);
  const slugKg = extractKg(slug);

  const pools: (string | undefined)[] = preferredLocation
    ? [preferredLocation, undefined]
    : [undefined];

  for (const pool of pools) {
    let best: Candidate | undefined;
    let bestScore = 0;
    for (const c of allCandidates(pool)) {
      const s = scoreCandidate(slugTokens, slugKg, c);
      if (s > bestScore) {
        bestScore = s;
        best = c;
      }
    }
    if (best && bestScore >= 0.6) {
      return {
        path: `/mieten/${best.locationId}/${best.categoryId}/${best.product.id}`,
        kind: "product",
      };
    }
    // Kein klarer Treffer, aber plausibler Kandidat → wenigstens dessen Kategorie.
    if (best && bestScore >= 0.34) {
      return {
        path: `/mieten/${best.locationId}/${best.categoryId}`,
        kind: "category",
      };
    }
  }

  const locationId = preferredLocation || "krefeld";
  const guessed = guessCategory(slugTokens, locationId);
  if (guessed && categoryExists(locationId, guessed)) {
    return { path: `/mieten/${locationId}/${guessed}`, kind: "category" };
  }
  return { path: `/mieten/${locationId}`, kind: "location" };
}

export interface LegacyRedirectRule {
  from: string;
  to: string;
  kind: ResolvedLegacyTarget["kind"];
}

/**
 * Erzeugt alle bekannten Legacy-Pfade → Ziel-Paare für den .htaccess-Generator.
 * Deckt Kategorie- und Produkt-Altpfade vollständig ab, sodass Server-301s
 * punktgenau statt pauschal auf den Standort-Hub zeigen.
 */
export function buildLegacyRedirectRules(): LegacyRedirectRule[] {
  const rules = new Map<string, LegacyRedirectRule>();
  const add = (from: string, target: ResolvedLegacyTarget) => {
    if (!from || rules.has(from)) return;
    rules.set(from, { from, to: `${target.path.replace(/\/$/, "")}/`, kind: target.kind });
  };

  const legacyLocationSlugs: Record<string, string[]> = {
    krefeld: ["krefeld"],
    bonn: ["bonn"],
    muelheim: ["muelheim", "duisburg"],
  };

  // Etappe 3.5/3.6: umgehängte Artikel und entfallene Duplikat-Zweitseiten
  // behalten ihre alte URL als 301 auf die gültige Produktseite.
  // Ziel bevorzugt am selben Standort, sonst am nächsten verfügbaren.
  const productPath = (productId: string, preferredLocationId?: string): string | undefined => {
    const ordered = preferredLocationId
      ? [...locations].sort((a, b) =>
          a.id === preferredLocationId ? -1 : b.id === preferredLocationId ? 1 : 0,
        )
      : locations;
    for (const location of ordered) {
      for (const [categoryId, products] of Object.entries(location.products)) {
        if (products.some((p) => p.id === productId)) {
          return `/mieten/${location.id}/${categoryId}/${productId}`;
        }
      }
    }
    return undefined;
  };

  for (const location of locations) {
    for (const [productId, fromCategory] of Object.entries(CATEGORY_REASSIGNMENT_SOURCES)) {
      const path = productPath(productId, location.id);
      if (!path) continue;
      add(`/mieten/${location.id}/${fromCategory}/${productId}`, { path, kind: "product" });
    }
    for (const [duplicateId, canonicalId] of Object.entries(DUPLICATE_PRODUCT_CANONICAL)) {
      const path = productPath(canonicalId, location.id);
      if (!path) continue;
      add(`/mieten/${location.id}/${DUPLICATE_SOURCE_CATEGORY}/${duplicateId}`, {
        path,
        kind: "product",
      });
    }
  }

  for (const location of locations) {
    const slugs = legacyLocationSlugs[location.id] || [location.id];
    for (const categoryId of location.availableCategories) {
      if (categoryId === "alle") continue;
      const target: ResolvedLegacyTarget = {
        path: `/mieten/${location.id}/${categoryId}`,
        kind: "category",
      };
      for (const locSlug of slugs) {
        add(`/kategorien-${locSlug}/${categoryId}`, target);
        add(`/kategorie/${locSlug}-${categoryId}`, target);
      }
      if (location.id === "krefeld") {
        add(`/kategorien/${categoryId}`, target);
        add(`/kategorie/${categoryId}`, target);
        add(`/produkte/${categoryId}`, target);
      }
    }

    for (const [categoryId, products] of Object.entries(location.products)) {
      for (const product of products) {
        const target: ResolvedLegacyTarget = {
          path: `/mieten/${location.id}/${categoryId}/${product.id}`,
          kind: "product",
        };
        for (const locSlug of slugs) add(`/produkte-${locSlug}/${product.id}`, target);
        add(`/produkte/${product.id}`, target);
      }
    }
  }

  // Kategorie-Aliase (rigging → traversen-rigging etc.)
  for (const alias of Object.keys(LEGACY_CATEGORY_ALIASES)) {
    if (!/^[a-z0-9-]+$/.test(alias)) continue;
    for (const locId of LEGACY_LOCATION_IDS) {
      const target = resolveLegacyCategory(alias, locId);
      if (target.kind !== "category") continue;
      const slugs = legacyLocationSlugs[locId] || [locId];
      for (const locSlug of slugs) {
        add(`/kategorien-${locSlug}/${alias}`, target);
        add(`/kategorie/${locSlug}-${alias}`, target);
      }
      if (locId === "krefeld") {
        add(`/kategorien/${alias}`, target);
        add(`/kategorie/${alias}`, target);
      }
    }
  }

  return [...rules.values()];
}
