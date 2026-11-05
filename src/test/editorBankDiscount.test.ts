import { expect, it } from "vitest";
import { editorBankDiscount } from "@/lib/editorBankDiscount";
import { buildOfferTotals } from "@/components/b2b/inquiries/offerMath";
import { BANK_DISCOUNT_KEY, newBankDiscountPolicy } from "../../supabase/functions/_shared/bank-transfer-discount";
const policy = { ...newBankDiscountPolicy(), selected: "bank" as const };
it.each(["amendment", "invoice", "final"] as const)("%s recalculates saved bank discount after 20 percent manual reduction", kind => {
  const original = [{ product_name: "Bagger", quantity: 2, duration: 5, unit_price: 100, discount_percent: 20, addons: [{ key: BANK_DISCOUNT_KEY, label: "alt", amount: -30 }] }];
  const priced = editorBankDiscount(original, 0, policy, kind);
  expect(priced[0].addons).toEqual([expect.objectContaining({ amount: -24 })]);
  expect(buildOfferTotals(priced).grossAmount).toBe(923.44);
  expect(original[0].addons[0].amount).toBe(-30);
  expect(priced[0].quantity).toBe(2);
});
it("explicit reset to zero restores the 3 percent rebate without accumulating it", () => {
  const line = { product_name: "Bagger", quantity: 1, duration: 1, unit_price: 100, discount_percent: 0 };
  const first = editorBankDiscount([line], 0, policy, "amendment");
  expect(editorBankDiscount(first, 0, policy, "amendment")[0].addons).toHaveLength(1);
  expect(buildOfferTotals(first).grossAmount).toBe(115.43);
});
it("settlement costs are not discounted again", () => {
  const lines = [{ product_name: "Kosten", quantity: 1, unit_price: 100, discount_percent: 0 }];
  expect(buildOfferTotals(editorBankDiscount(lines, 0, policy, "invoice", true)).grossAmount).toBe(119);
});