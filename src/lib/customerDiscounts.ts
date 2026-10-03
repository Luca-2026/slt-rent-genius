import { supabase } from "@/integrations/supabase/client";

/** Kategorie-Slug → Rabatt in Prozent (Kundenrabatte aus dem B2B-Portal). */
export type DiscountMap = Record<string, number>;

/**
 * Rabatt-Vorbelegung für eine Angebotsposition: nur wenn noch kein Rabatt eingetragen ist
 * und für die Kategorie ein Kundenrabatt hinterlegt ist. Manuell gesetzte Rabatte bleiben.
 */
export function applyCategoryDiscount<T extends { discount_percent: number }>(
  item: T,
  categorySlug: string | null | undefined,
  discounts: DiscountMap,
): T {
  if (!categorySlug || (item.discount_percent ?? 0) > 0) return item;
  const pct = Number(discounts[categorySlug]);
  if (!Number.isFinite(pct) || pct <= 0) return item;
  return { ...item, discount_percent: Math.min(pct, 100) };
}

export async function loadCategoryDiscounts(profileId: string | null | undefined): Promise<DiscountMap> {
  if (!profileId) return {};
  const { data } = await supabase
    .from("b2b_category_discounts")
    .select("discount_percent, product_categories!inner(slug)")
    .eq("b2b_profile_id", profileId);
  const map: DiscountMap = {};
  for (const row of (data ?? []) as { discount_percent: number; product_categories: { slug: string } | null }[]) {
    const slug = row.product_categories?.slug;
    if (slug) map[slug] = Number(row.discount_percent) || 0;
  }
  return map;
}

/** Portal-Kundenkonto einer Mietanfrage: direkt verknüpft oder über die Kundenkartei. */
export async function loadInquiryProfileId(inquiryId: string): Promise<string | null> {
  const { data } = await supabase
    .from("rental_inquiries")
    .select("b2b_profile_id, crm_customer_id")
    .eq("id", inquiryId)
    .maybeSingle();
  const row = data as { b2b_profile_id: string | null; crm_customer_id: string | null } | null;
  if (row?.b2b_profile_id) return row.b2b_profile_id;
  if (!row?.crm_customer_id) return null;
  const { data: crm } = await supabase
    .from("crm_customers")
    .select("b2b_profile_id")
    .eq("id", row.crm_customer_id)
    .maybeSingle();
  return (crm as { b2b_profile_id: string | null } | null)?.b2b_profile_id ?? null;
}
