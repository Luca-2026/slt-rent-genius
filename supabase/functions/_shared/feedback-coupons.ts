import { couponCategoryEligible, couponLine, couponSaving, type CouponLine } from "./feedback-coupon-math.ts";

export async function applyFeedbackCoupon<T extends CouponLine & { product_name: string; product_slug?: string }>(
  service: any, code: unknown, kind: "inquiry" | "portal", orderId: string | null, profileId: string | null, items: T[],
): Promise<{ items: T[]; code: string | null; saving: number }> {
  if (code === undefined || code === null || code === "") return { items, code: null, saving: 0 };
  if (typeof code !== "string" || !/^[A-F0-9]{20}$/i.test(code.trim())) throw new Error("Ungültiger Gutscheincode");
  const normalized = code.trim().toUpperCase();
  const { error } = await service.rpc("check_rental_coupon", { p_code: normalized, p_kind: kind, p_order: orderId, p_profile: profileId });
  if (error) throw new Error(error.message);
  let saving = 0;
  const updated: T[] = [];
  for (const item of items) {
    let query = service.from("b2b_managed_products").select("slug,name,category");
    query = item.product_slug ? query.eq("slug", item.product_slug) : query.eq("name", item.product_name);
    const { data: product } = await query.limit(1).maybeSingle();
    const eligible = !!product && couponCategoryEligible(product.category ?? "") && couponCategoryEligible(product.name ?? "");
    saving += couponSaving(item, eligible);
    updated.push(couponLine(item, eligible));
  }
  saving = Math.round(saving * 100) / 100;
  if (saving <= 0) throw new Error("Keine rabattfähige Mietposition: Sonderpreise, bestehende höhere Rabatte und Anhänger bleiben unverändert.");
  return { items: updated, code: normalized, saving };
}

export async function rentalFeedbackEmail(service: any, kind: "inquiry" | "portal", invoiceId: string): Promise<string> {
  const { data, error } = await service.rpc("ensure_rental_feedback_invitation", { p_kind: kind, p_invoice: invoiceId });
  if (error) { console.error("Feedback-Zuordnung muss geklärt werden", error.code); return ""; }
  if (!data?.token) return "";
  const url = `https://www.slt-rental.de/feedback/mietprozess?token=${encodeURIComponent(data.token)}`;
  return `<p>Feedback zu diesem Mietauftrag: <a href="${url}">Rückmeldung zum Mietprozess abgeben</a></p>`;
}