import type { PublicUrlRedirect } from "../../supabase/functions/_shared/product-url-history";

/** Prepared-only: no history query or activation without separate SQL + release approval. */
export const CMS_URL_HISTORY_ENABLED = false;
let history: PublicUrlRedirect[] = [];
export const getProductUrlHistory = () => history;
export async function loadProductUrlHistory(): Promise<void> {
  history = [];
  if (!CMS_URL_HISTORY_ENABLED) return;
  // Explicit REST adapter avoids pretending the uninstalled projection exists in generated types.
  const { readRestCatalog } = await import("../../supabase/functions/_shared/catalog-rest");
  try {
    history = await readRestCatalog<PublicUrlRedirect>(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, "public_product_url_redirects", { select: "*" });
  } catch { history = []; } // Current routes and article saving stay independent.
}