import { supabase } from "@/integrations/supabase/client";
import { readCompleteCatalog, validatePublicProduct } from "../../supabase/functions/_shared/catalog-pagination";
import type { ManagedProductRow } from "@/hooks/useManagedProducts";

function isManagedProductRow(value: unknown): value is ManagedProductRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.slug !== "string" || typeof row.name !== "string" || typeof row.category !== "string") return false;
  for (const key of ["available_locations", "images", "features", "tags", "rental_notes", "video_urls", "related_slugs", "image_alts", "spec_order"]) {
    const v = row[key];
    if (v != null && (!Array.isArray(v) || v.some(x => typeof x !== "string"))) return false;
  }
  if (!Array.isArray(row.images) || !Array.isArray(row.available_locations)) return false;
  for (const key of ["specifications", "rentware_code", "seo_local_content"]) {
    const v = row[key];
    if (v != null && (typeof v !== "object" || Array.isArray(v) || Object.values(v).some(x => typeof x !== "string"))) return false;
  }
  if (row.seo_faqs != null && (!Array.isArray(row.seo_faqs) || row.seo_faqs.some(f => !f || typeof f !== "object" || typeof (f.question ?? f.q) !== "string" || typeof (f.answer ?? f.a) !== "string"))) return false;
  for (const key of ["model_name", "description", "detailed_description", "price_per_day", "price_weekend", "price_per_month", "pdf_url", "external_manual_url", "video_url", "seo_meta_description"]) if (row[key] != null && typeof row[key] !== "string") return false;
  return true;
}

export async function loadPublicCatalog(): Promise<ManagedProductRow[]> {
  return readCompleteCatalog<ManagedProductRow>(async ({ after, limit, signal }) => {
    let query = supabase.from("managed_products_public").select("*", { count: "exact" }).order("id").limit(limit).abortSignal(signal);
    if (after) query = query.gt("id", after);
    const { data, error, count } = await query;
    if (error) throw error;
    if (!Array.isArray(data)) throw new Error("Invalid public catalog response");
    const rows: ManagedProductRow[] = [];
    for (const row of data) {
      if (!isManagedProductRow(row)) throw new Error("Invalid public article fields");
      rows.push(row);
    }
    return { rows, count };
  }, { validate: validatePublicProduct });
}