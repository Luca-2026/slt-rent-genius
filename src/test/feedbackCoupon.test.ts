import { describe, expect, it } from "vitest";
import { couponLine, couponSaving, couponCategoryEligible } from "../../supabase/functions/_shared/feedback-coupon-math";
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
  it("puts a personal own-domain feedback link in invoice email without coupon promotion", async () => {
    const html = await rentalFeedbackEmail({ rpc: async () => ({ data: { token: "personal-token" }, error: null }) }, "inquiry", "invoice");
    expect(html).toContain("https://www.slt-rental.de/feedback/mietprozess?token=personal-token");
    expect(html).not.toMatch(/10\s*%|Gutschein|Google/);
  });
});