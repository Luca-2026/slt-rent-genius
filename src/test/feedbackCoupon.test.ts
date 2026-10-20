import { describe, expect, it } from "vitest";
import { couponLine, couponSaving, couponCategoryEligible } from "../../supabase/functions/_shared/feedback-coupon-math";

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