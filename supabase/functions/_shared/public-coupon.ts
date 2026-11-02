import { couponItemEligible } from "./feedback-coupon-math.ts";

export function couponCanPreview(coupon: { status: string; reserved_until?: string | null } | null, now = Date.now()): boolean {
  if (!coupon) return false;
  return coupon.status === "active" || (coupon.status === "reserved" && !!coupon.reserved_until && Date.parse(coupon.reserved_until) < now);
}

/** Possession of code and matching email permits only a non-mutating preliminary check. */
export async function previewPublicCoupon(service: any, code: string, email: string, slugs: string[]) {
  const { data: coupon, error } = await service.from("rental_feedback_coupons")
    .select("status,reserved_until,b2b_profile_id")
    .eq("code", code.trim().toUpperCase()).eq("customer_email", email.trim().toLowerCase()).maybeSingle();
  if (error) throw new Error("Gutscheinprüfung derzeit nicht möglich.");
  if (!couponCanPreview(coupon)) return { valid: false, message: "Dieser Gutschein ist für diese E-Mail und Anfrage nicht anwendbar." };
  const { data: products, error: catalogError } = await service.from("managed_products_public")
    .select("slug,name,category,subcategory").in("slug", slugs);
  if (catalogError) throw new Error("Gutscheinprüfung derzeit nicht möglich.");
  let specialNames = new Set<string>();
  if (coupon?.b2b_profile_id) {
    const { data, error: pricesError } = await service.from("b2b_customer_prices").select("product_name").eq("b2b_profile_id", coupon.b2b_profile_id);
    if (pricesError) throw new Error("Gutscheinprüfung derzeit nicht möglich.");
    specialNames = new Set((data ?? []).map((row: { product_name: string }) => row.product_name));
  }
  const eligibleSlugs = (products ?? []).filter((product: { slug: string; name: string }) =>
    !specialNames.has(product.name) && couponItemEligible({ quantity: 1, unit_price: 0 }, product)).map((product: { slug: string }) => product.slug);
  if (!eligibleSlugs.length) return { valid: false, message: "Keine rabattfähige Mietposition. Versicherung, Zubehör und Sonderpreise bleiben unverändert." };
  return { valid: true, discount_percent: 10, eligible_slugs: eligibleSlugs, message: "10 % auf rabattfähige Mietpositionen – vorbehaltlich der Angebotsprüfung." };
}