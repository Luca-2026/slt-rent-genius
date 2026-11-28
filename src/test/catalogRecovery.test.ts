import { afterEach, expect, it, vi } from "vitest";
import { findInCache, getManagedProductsCache, getManagedProductsCacheStatus, mergeWithCache, setManagedProductsCache, setManagedProductsCacheError, shouldUseStaticFallbackForLookup } from "@/data/managedProductsCache";
import { CATALOG_FRESH_MS } from "../../supabase/functions/_shared/catalog-pagination";
const entry = { slug: "fixture", category: "erdbewegung", availableLocations: ["bonn"], product: { id: "fixture", managedId: "uuid", name: "Synthetic", priceFrom1Rd: 100 } };
afterEach(() => { vi.useRealTimers(); setManagedProductsCache([]); });
it("healthy, successful empty, failure and recovery never revive a static article", () => {
  const staticList = [{ id: "removed", name: "Historical" }];
  setManagedProductsCache([entry]); expect(mergeWithCache("bonn", "erdbewegung", staticList).map(p => p.id)).toEqual(["fixture"]);
  setManagedProductsCache([]); expect(mergeWithCache("bonn", "erdbewegung", staticList)).toEqual([]); expect(getManagedProductsCacheStatus()).toBe("loaded");
  setManagedProductsCache([entry]); setManagedProductsCacheError(); expect(getManagedProductsCache()).toEqual([]); expect(findInCache("fixture")).toBeUndefined(); expect(shouldUseStaticFallbackForLookup()).toBe(false);
  setManagedProductsCache([{ ...entry, product: { ...entry.product, priceFrom1Rd: 120 } }]); expect(findInCache("fixture")?.product.priceFrom1Rd).toBe(120);
});
it("expires unconfirmed catalogue data at 60 seconds even with a missed refresh", () => {
  vi.useFakeTimers(); setManagedProductsCache([entry]); vi.advanceTimersByTime(CATALOG_FRESH_MS - 1);
  expect(findInCache("fixture")).toBeDefined(); vi.advanceTimersByTime(1); expect(findInCache("fixture")).toBeUndefined(); expect(getManagedProductsCacheStatus()).toBe("error");
});
it("site-wide all-products lookup includes CMS-only articles", () => {
  setManagedProductsCache([entry]); expect(mergeWithCache("bonn", "alle", []).map(p => p.id)).toEqual(["fixture"]);
});