import { describe, expect, it } from "vitest";
import { couponCanPreview, previewPublicCoupon } from "../../supabase/functions/_shared/public-coupon";
describe("Nicht schreibende Gutscheinvorprüfung", () => {
  it("returns the stored manual 20-percent rate without writes", async () => {
    const service = { from: (table: string) => {
      const q: any = { select: () => q, eq: () => q, maybeSingle: async () => ({ data: table === "rental_feedback_coupons" ? null : { status: "active", discount_percent: 20 }, error: null }), in: async () => ({ data: [{ slug: "bagger", category: "erdbewegung" }], error: null }) };
      return q;
    } };
    const result = await previewPublicCoupon(service, "0123456789ABCDEF0123", "test@example.com", ["bagger"]);
    expect(result.valid).toBe(true);
    expect(result.discount_percent).toBe(20);
    expect(result.eligible_slugs).toEqual(["bagger"]);
  });
  it("erlaubt aktive, nicht aber verbrauchte oder gesperrte Codes", () => {
    expect(couponCanPreview({ status: "active" })).toBe(true);
    expect(couponCanPreview({ status: "redeemed" })).toBe(false);
    expect(couponCanPreview({ status: "blocked" })).toBe(false);
    expect(couponCanPreview(null)).toBe(false);
  });
  it("hält fremde Reservierungen bis zum Ablauf geschützt", () => {
    const deadline = "2026-11-02T08:00:00Z";
    expect(couponCanPreview({ status: "reserved", reserved_until: deadline }, Date.parse(deadline))).toBe(false);
    expect(couponCanPreview({ status: "reserved", reserved_until: deadline }, Date.parse(deadline) + 1)).toBe(true);
    expect(couponCanPreview({ status: "reserved", reserved_until: null })).toBe(false);
  });
  it("prüft Code und E-Mail ohne Reservierung oder Einlösung", async () => {
    const filters: [string, unknown][] = [];
    const service = { from: (table: string) => {
      const query: any = { select: () => query, eq: (key: string, value: unknown) => { filters.push([key, value]); return query; }, maybeSingle: async () => ({ data: { status: "active", b2b_profile_id: null }, error: null }), in: async () => ({ data: [{ slug: "bagger", name: "Bagger", category: "erdbewegung", subcategory: "minibagger" }], error: null }) };
      if (!["rental_feedback_coupons", "managed_products_public"].includes(table)) throw new Error("Unexpected write or table");
      return query;
    } };
    const result = await previewPublicCoupon(service, "abcdefabcdefabcdefab", "TEST@example.com", ["bagger"]);
    expect(result.valid).toBe(true);
    expect(result.discount_percent).toBe(10);
    expect(filters).toContainEqual(["customer_email", "test@example.com"]);
    expect(filters).toContainEqual(["code", "ABCDEFABCDEFABCDEFAB"]);
  });
});