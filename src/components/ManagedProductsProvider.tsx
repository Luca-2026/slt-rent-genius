/**
 * Lädt beim App-Start alle veröffentlichten CMS-Artikel aus DB in den globalen Cache,
 * damit die synchronen Helpers in `rentalData.ts` sie mit den TS-Artikeln mergen können.
 * Reagiert außerdem auf Realtime-Änderungen an `b2b_managed_products`.
 * Bei DB-/Netzwerkfehlern setzt der Provider den Cache in den Status "error",
 * damit der statische Fallback aus `USE_STATIC_FALLBACK` greifen kann (Etappe 4).
 */
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  setManagedProductsCache,
  setManagedProductsCacheError,
  type ManagedProductCacheEntry,
} from "@/data/managedProductsCache";
import {
  managedRowToProduct,
  type ManagedProductRow,
} from "@/hooks/useManagedProducts";

async function loadCache() {
  try {
    const { data, error } = await supabase
      .from("managed_products_public" as never)
      .select("*");
    if (error) {
      console.warn("[ManagedProductsProvider] load failed:", error.message);
      setManagedProductsCacheError();
      return;
    }
    const rows = (data as unknown as ManagedProductRow[]) ?? [];
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

export function ManagedProductsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    loadCache();
    const channel = supabase
      .channel("managed-products-cache")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "b2b_managed_products" },
        () => loadCache(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return <>{children}</>;
}
