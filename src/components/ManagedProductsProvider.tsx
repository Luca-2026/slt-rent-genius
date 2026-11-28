/**
 * Lädt beim App-Start alle veröffentlichten CMS-Artikel aus DB in den globalen Cache,
 * damit die synchronen Helpers in `rentalData.ts` sie mit den TS-Artikeln mergen können.
 * Reagiert außerdem auf Realtime-Änderungen an `b2b_managed_products`.
 * Bei DB-/Netzwerkfehlern setzt der Provider den Cache in den Status "error";
 * unbestätigte historische Artikel bleiben gesperrt, regelmäßige Reads ermöglichen Recovery.
 */
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadPublicCatalog } from "@/lib/publicCatalog";
import { loadProductUrlHistory } from "@/lib/productUrlHistory";
import {
  setManagedProductsCache,
  setManagedProductsCacheError,
  type ManagedProductCacheEntry,
} from "@/data/managedProductsCache";
import {
  managedRowToProduct,
  type ManagedProductRow,
} from "@/hooks/useManagedProducts";

let pending: Promise<void> | null = null;
let reloadRequested = false;
async function loadCacheOnce() {
  try {
    const rows = await loadPublicCatalog();
    await loadProductUrlHistory();
    const entries: ManagedProductCacheEntry[] = rows.map((r) => ({
      slug: r.slug,
      category: r.category,
      availableLocations: r.available_locations ?? [],
      product: managedRowToProduct(r),
    }));
    setManagedProductsCache(entries);
  } catch (e) {
    console.warn("[ManagedProductsProvider] load threw:", (e as Error).message);
    setManagedProductsCacheError();
  }
}

function loadCache() {
  if (pending) { reloadRequested = true; return pending; }
  pending = (async () => {
    do { reloadRequested = false; await loadCacheOnce(); } while (reloadRequested);
  })().finally(() => { pending = null; });
  return pending;
}

export function ManagedProductsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    loadCache();
    const refresh = setInterval(() => loadCache(), 30_000);
    const onFocus = () => loadCache();
    window.addEventListener("focus", onFocus);
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel("managed-products-cache")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "b2b_managed_products" },
          () => loadCache(),
        )
        .subscribe();
    } catch (error) {
      // Live updates are optional; the loaded catalogue stays usable.
      console.warn("Live catalogue updates unavailable", error);
    }
    return () => {
      clearInterval(refresh);
      window.removeEventListener("focus", onFocus);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          /* ignore */
        }
      }
    };
  }, []);
  return <>{children}</>;
}
