/**
 * Modul-Cache für CMS-Managed-Products.
 * Wird beim App-Start einmal aus DB gefüllt (via ManagedProductsProvider) und von den
 * Helpers in rentalData.ts konsultiert. Nur frisch bestätigte vollständige CMS-Daten
 * sind öffentlich nutzbar; Fehler und Ablauf reaktivieren niemals historische Artikel.
 */
import { useSyncExternalStore } from "react";
import type { Product } from "@/data/rentalData";
import { CATALOG_FRESH_MS } from "../../supabase/functions/_shared/catalog-pagination";


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
let verifiedAt = 0;
let expiryTimer: ReturnType<typeof setTimeout> | undefined;
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
  verifiedAt = Date.now();
  clearTimeout(expiryTimer);
  expiryTimer = setTimeout(() => { if (getManagedProductsCacheStatus() === "error") setManagedProductsCacheError(); }, CATALOG_FRESH_MS);
  version++;
  for (const l of listeners) l();
}

export function setManagedProductsCacheError() {
  clearTimeout(expiryTimer);
  status = "error";
  version++;
  for (const l of listeners) l();
}

export function getManagedProductsCache(): ManagedProductCacheEntry[] {
  return getManagedProductsCacheStatus() === "loaded" ? cache : [];
}

export function getManagedProductsCacheStatus(): ManagedProductsCacheStatus {
  return status === "loaded" && Date.now() - verifiedAt >= CATALOG_FRESH_MS ? "error" : status;
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
 * - Fehler/initiales Laden/Ablauf → keine unbestätigten Artikel, allgemeine Seiten bleiben.
 */
export function mergeWithCache(
  locationId: string,
  categoryId: string,
  staticList: Product[],
): Product[] {
  if (getManagedProductsCacheStatus() === "loaded") {
    const dbList = cache
      .filter((e) => e.availableLocations.includes(locationId))
      .filter((e) => categoryId === "alle" || e.category === categoryId)
      .map((e) => e.product);
    return sortProducts(dbList);
  }

  // status === "idle" | "error" → Fallback-Pfad
  return [];
}

/**
 * Suche nach einem einzelnen Produkt.
 * - `status === "loaded"`: nur Cache-Treffer zählen (DB ist Single Source of Truth).
 * - Fehler/initiales Laden/Ablauf: kein Treffer aus unbestätigten Daten.
 */
export function findInCache(productId: string): {
  product: Product;
  locationIds: string[];
  categoryId: string;
} | undefined {
  const entry = getManagedProductsCache().find((e) => e.slug === productId);
  if (!entry) return undefined;
  return {
    product: entry.product,
    locationIds: entry.availableLocations,
    categoryId: entry.category,
  };
}

/** True, wenn getProductById den statischen Fallback konsultieren darf. */
export function shouldUseStaticFallbackForLookup(): boolean {
  return false;
}
