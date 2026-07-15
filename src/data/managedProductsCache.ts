/**
 * Modul-Cache für CMS-Managed-Products.
 * Wird beim App-Start einmal aus DB gefüllt (via useManagedProducts + ManagedProductsProvider)
 * und von den Helpers in rentalData.ts konsultiert. So bleiben die Helpers synchron.
 */
import { useSyncExternalStore } from "react";
import type { Product } from "@/data/rentalData";


export interface ManagedProductCacheEntry {
  slug: string;
  category: string;
  availableLocations: string[];
  product: Product;
}

let cache: ManagedProductCacheEntry[] = [];
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
  for (const l of listeners) l();
}

export function getManagedProductsCache(): ManagedProductCacheEntry[] {
  return cache;
}

export function subscribeManagedProducts(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Merge helper – Slug ist der Merge-Key. DB gewinnt vor TS. */
export function mergeWithCache(
  locationId: string,
  categoryId: string,
  staticList: Product[],
): Product[] {
  if (!cache.length) return staticList;
  const bySlug = new Map<string, Product>();
  for (const p of staticList) bySlug.set(p.id, p);

  for (const entry of cache) {
    if (!entry.availableLocations.includes(locationId)) continue;
    if (categoryId !== "alle" && entry.category !== categoryId) continue;
    bySlug.set(entry.slug, entry.product);
  }

  return Array.from(bySlug.values()).sort((a, b) => {
    const sa = a.sortOrder ?? 999;
    const sb = b.sortOrder ?? 999;
    if (sa !== sb) return sa - sb;
    return a.name.localeCompare(b.name);
  });
}

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
