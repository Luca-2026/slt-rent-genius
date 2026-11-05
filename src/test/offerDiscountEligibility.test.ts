import { expect, it } from "vitest";
import { hasRentalPaymentChoice } from "../../supabase/functions/_shared/payment-incentive-rollout";
it("only rental online/bank choice qualifies for 3 percent", () => {
  expect(hasRentalPaymentChoice("rental", "vorkasse")).toBe(true);
  expect(hasRentalPaymentChoice("rental", "anzahlung_30")).toBe(true);
});
it.each(["net_7", "net_14", "net_30", "net_60", "custom", "rentpair_vorkasse"])("%s never creates a new bank rebate", terms => {
  expect(hasRentalPaymentChoice("rental", terms)).toBe(false);
});
it("bank-only sales and nonbinding quotes do not qualify", () => {
  expect(hasRentalPaymentChoice("sales", "vorkasse")).toBe(false);
  expect(hasRentalPaymentChoice("rental", "vorkasse", true)).toBe(false);
});