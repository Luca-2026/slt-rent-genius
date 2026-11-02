import { describe, expect, it } from "vitest";
import { couponLine, couponSaving, couponCategoryEligible, couponItemEligible } from "../../supabase/functions/_shared/feedback-coupon-math";
import { applyFeedbackCoupon, rentalFeedbackEmail } from "../../supabase/functions/_shared/feedback-coupons";

describe("Feedback: 10 % nächste Miete", () => {
  it("subtracts exactly 10 % of rental net, rounded to cents", () => {
    expect(couponSaving({ quantity: 3, unit_price: 81, discount_percent: 0 }, true)).toBe(24.3);
    expect(couponSaving({ quantity: 1, unit_price: 84.17 }, true)).toBe(8.42);
  });
  it("does not stack with 20 % customer discount", () => {
    expect(couponLine({ quantity: 1, unit_price: 100, discount_percent: 20 }, true).discount_percent).toBe(20);
    expect(couponSaving({ quantity: 1, unit_price: 100, discount_percent: 20 }, true)).toBe(0);
  });
  it("keeps manually negotiated and special prices unchanged", () => {
    expect(couponSaving({ quantity: 1, unit_price: 100, price_manual: true }, true)).toBe(0);
    expect(couponSaving({ quantity: 1, unit_price: 100, price_basis: "customer" }, true)).toBe(0);
  });
  it("excludes trailers and extra charges", () => {
    for (const category of ["anhaenger", "Anhänger", "Versicherung", "Reinigung", "Diesel", "Schadensersatz", "Transport"]) {
      expect(couponCategoryEligible(category)).toBe(false);
      expect(couponSaving({ quantity: 1, unit_price: 100 }, false)).toBe(0);
    }
    expect(couponCategoryEligible("erdbewegung")).toBe(true);
  });
  it.each(["Versicherung", "Zubehör", "Haftungsfreistellung", "Stundenlohn"])("excludes %s", category => {
    const line = { quantity: 1, unit_price: 100, discount_percent: 0 };
    const eligible = couponItemEligible(line, { name: category, category });
    expect(eligible).toBe(false);
    expect(couponSaving(line, eligible)).toBe(0);
    expect(couponLine(line, eligible).discount_percent).toBe(0);
  });
  it("uses catalog accessory subcategories and stable slugs", () => {
    expect(couponItemEligible({ quantity: 1, unit_price: 100 }, { category: "beschallung", subcategory: "adapter" })).toBe(false);
    expect(couponItemEligible({ quantity: 1, unit_price: 100 }, { slug: "nivtec-fuesse", category: "buehne" })).toBe(false);
  });
  it("does not discount hourly or protocol lines even with a rental catalog match", () => {
    const product = { category: "erdbewegung" };
    expect(couponItemEligible({ quantity: 1, unit_price: 100, unit_code: "stunden" }, product)).toBe(false);
    expect(couponItemEligible({ quantity: 1, unit_price: 100, protocol_charge_source: "extra_charge" }, product)).toBe(false);
  });
  it("keeps insurance and accessories untouched while discounting the rental", async () => {
    const service = {
      rpc: async () => ({ error: null }),
      from: () => {
        const query = { select: () => query, eq: () => query, limit: () => query, maybeSingle: async () => ({ data: { name: "Minibagger", category: "erdbewegung" } }) };
        return query;
      },
    };
    const addons = [{ key: "insurance", amount: 20 }, { key: "accessory", amount: 30 }];
    const result = await applyFeedbackCoupon(service, "0123456789ABCDEF0123", "portal", null, null, [{ product_name: "Minibagger", quantity: 1, unit_price: 100, discount_percent: 0, addons }]);
    expect(result.saving).toBe(10);
    expect(result.items[0].addons).toEqual(addons);
    expect(result.items[0].discount_percent).toBe(10);
  });
});

describe("Serverseitige Feedback-Gutscheinprüfung", () => {
  it("rejects a foreign customer before changing a rental price", async () => {
    const service = { rpc: async () => ({ error: { message: "Gutschein gehört zu einem anderen Kunden" } }) };
    await expect(applyFeedbackCoupon(service, "0123456789ABCDEF0123", "portal", null, "other-customer", [{ product_name: "1t Minibagger", quantity: 3, unit_price: 81 }])).rejects.toThrow("anderen Kunden");
  });
  it("does not grant a discount when coupon is already redeemed", async () => {
    const service = { rpc: async () => ({ error: { message: "Gutschein ist bereits eingelöst oder gesperrt" } }) };
    await expect(applyFeedbackCoupon(service, "0123456789ABCDEF0123", "portal", null, "customer", [{ product_name: "1t Minibagger", quantity: 3, unit_price: 81 }])).rejects.toThrow("bereits eingelöst");
  });
  it("keeps persisted customer special prices even if client omits the marker", async () => {
    const service = {
      rpc: async () => ({ error: null }),
      from: (table: string) => {
        const query = { select: () => query, eq: () => query, limit: () => query, maybeSingle: async () => ({ data: table === "b2b_customer_prices" ? { id: "special-price" } : { name: "1t Minibagger", category: "erdbewegung" } }) };
        return query;
      },
    };
    await expect(applyFeedbackCoupon(service, "0123456789ABCDEF0123", "portal", null, "customer", [{ product_name: "1t Minibagger", quantity: 3, unit_price: 81 }])).rejects.toThrow("Keine rabattfähige Mietposition");
  });
  it("does not issue an invitation when completed rental eligibility is absent", async () => {
    const html = await rentalFeedbackEmail({ rpc: async () => ({ data: null, error: null }) }, "inquiry", "invoice");
    expect(html).toBe("");
  });
});