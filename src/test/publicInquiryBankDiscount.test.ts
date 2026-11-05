import { describe, expect, it } from "vitest";
import { bankDiscountLive, publicInquiryBankDiscount } from "../../supabase/functions/_shared/payment-incentive-rollout";

const rental = [{ product_slug: "minibagger" }];
describe("Anfragerabatt und Angebotsfreigabe", () => {
  it("offers exactly 3 percent only for an enabled rental inquiry", () => {
    expect(publicInquiryBankDiscount(true, rental)).toEqual({ version: "bank-transfer-3-v1", rate: 3, selected: "regular" });
  });
  it("does not promise a discount while its billing is disabled", () => {
    expect(publicInquiryBankDiscount(false, rental)).toBeNull();
  });
  it("does not promise the inquiry incentive for the separate sign checkout", () => {
    expect(publicInquiryBankDiscount(true, [{ product_slug: "halteverbotsschilder-set" }])).toBeNull();
    expect(publicInquiryBankDiscount(true, [...rental, { product_slug: "halteverbotsschilder-set" }])).toBeNull();
  });
  it("does not advertise an incentive without an article", () => {
    expect(publicInquiryBankDiscount(true, [])).toBeNull();
  });
  it("fails closed when the rollout setting cannot be read", async () => {
    const service = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { live_enabled: true }, error: new Error("unavailable") }) }) }) }) };
    expect(await bankDiscountLive(service)).toBe(false);
  });
});