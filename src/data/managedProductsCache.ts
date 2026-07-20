/**
 * Modul-Cache für CMS-Managed-Products.
 * Wird beim App-Start einmal aus DB gefüllt (via ManagedProductsProvider) und von den
 * Helpers in rentalData.ts konsultiert. Ab Etappe 4 ist die DB die alleinige Quelle
 * im regulären Pfad; der statische Fallback greift nur, solange der Cache noch nicht
 * geladen wurde oder ein DB-Fehler auftrat (siehe `USE_STATIC_FALLBACK`).
 */
import { useSyncExternalStore } from "react";
import type { Product } from "@/data/rentalData";
import { USE_STATIC_FALLBACK } from "@/config/featureFlags";


export interface ManagedProductCacheEntry {
  slug: string;
  category: string;
  availableLocations: string[];
  product: Product;
}

export type ManagedProductsCacheStatus = "idle" | "loaded" | "error";

let cache: ManagedProductCacheEntry[] = [];
let status: ManagedProductsCacheStatus = "idle";
let version = 0;
const listeners = new Set<() => void>();

/** React-Hook: liefert eine Zahl, die sich bei jeder Cache-Änderung erhöht. */
export function useManagedProductsVersion(): number {
  return useSyncExternalStore(
    (cb) => subscribeManagedProducts(cb),
    () => version,
    () => version,
  );
}


export function setManagedProductsCache(entries: ManagedProductCacheEntry[]) {
  cache = entries;
  status = "loaded";
  version++;
  for (const l of listeners) l();
}

export function setManagedProductsCacheError() {
  status = "error";
  version++;
  for (const l of listeners) l();
}

export function getManagedProductsCache(): ManagedProductCacheEntry[] {
  return cache;
}

export function getManagedProductsCacheStatus(): ManagedProductsCacheStatus {
  return status;
}

export function subscribeManagedProducts(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function sortProducts(list: Product[]): Product[] {
  return [...list].sort((a, b) => {
    const sa = a.sortOrder ?? 999;
    const sb = b.sortOrder ?? 999;
    if (sa !== sb) return sa - sb;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Reguläre Merge-Funktion (Etappe 4):
 * - `status === "loaded"` → **ausschließlich** DB-Datensätze (statische Liste wird verworfen).
 * - `status === "error"` und Fallback aktiv → statische Liste als Notfall-Fallback.
 * - `status === "idle"` (initialer Load) und Fallback aktiv → statische Liste, um Weißseiten
 *   während des ersten Fetches zu vermeiden. Sobald der Cache "loaded" ist, kippt der Merge
 *   automatisch auf DB-only.
 */
export function mergeWithCache(
  locationId: string,
  categoryId: string,
  staticList: Product[],
): Product[] {
  if (status === "loaded") {
    const dbList = cache
      .filter((e) => e.availableLocations.includes(locationId))
      .filter((e) => categoryId === "alle" || e.category === categoryId)
      .map((e) => e.product);
    return sortProducts(dbList);
  }

  // status === "idle" | "error" → Fallback-Pfad
  if (!USE_STATIC_FALLBACK) return [];
  return sortProducts(staticList);
}

/**
 * Suche nach einem einzelnen Produkt.
 * - `status === "loaded"`: nur Cache-Treffer zählen (DB ist Single Source of Truth).
 * - `status === "idle" | "error"` + Fallback aktiv: Cache-Treffer bevorzugt, sonst gibt der
 *   Aufrufer über den statischen Pfad weiter.
 */
export function findInCache(productId: string): {
  product: Product;
  locationIds: string[];
  categoryId: string;
} | undefined {
  const entry = cache.find((e) => e.slug === productId);
  if (!entry) return undefined;
  return {
    product: entry.product,
    locationIds: entry.availableLocations,
    categoryId: entry.category,
  };
}

/** True, wenn getProductById den statischen Fallback konsultieren darf. */
export function shouldUseStaticFallbackForLookup(): boolean {
  if (status === "loaded") return false;
  return USE_STATIC_FALLBACK;
}
