import { describe, expect, it } from "vitest";
import { validateRentalPaymentDecision, revisedRentalPaymentPolicy, rentalPaymentPrices } from "../../supabase/functions/_shared/rental-payment-decision";
import { newBankDiscountPolicy } from "@/lib/bankTransferDiscount";
describe("rental payment decision safeguards", () => {
  it("preserves Pascal's paid bank price on revision without creating a 1.04 euro balance", () => {
    const policy = revisedRentalPaymentPolicy({ ...newBankDiscountPolicy(), selected: "bank" }, [{ amount: 133.47, label: "Banküberweisung" }], true);
    const price = rentalPaymentPrices({ items: [{ product_name: "Rüttelplatte", quantity: 1, unit_price: 29, discount_percent: 0 }], bank_transfer_discount: policy });
    expect(policy?.selected).toBe("bank");
    expect(price.discountGross).toBe(1.04);
    expect(price.totals.grossAmount).toBe(33.47);
    expect(Math.round((price.totals.grossAmount + 100 - 133.47) * 100)).toBe(0);
  });
  const input = { policy: newBankDiscountPolicy(), method: "bank" as const, payments: [], hasIssuedInvoice: false, hasSettlement: false };
  it("allows multiple bank-only installments without counting the discount as payment", () => {
    expect(() => validateRentalPaymentDecision({ ...input, payments: [{ amount: 30, label: "Banküberweisung" }, { amount: 67, label: "Banküberweisung" }] })).not.toThrow();
  });
  it("requires correction before changing an issued invoice", () => {
    expect(() => validateRentalPaymentDecision({ ...input, hasIssuedInvoice: true })).toThrow("Belegkorrektur");
  });
  it("never changes settled deposits", () => {
    expect(() => validateRentalPaymentDecision({ ...input, hasSettlement: true })).toThrow("Kaution");
  });
  it("does not infer discount eligibility for existing unversioned offers", () => {
    expect(() => validateRentalPaymentDecision({ ...input, policy: null })).toThrow("kein Überweisungsrabatt");
  });
});