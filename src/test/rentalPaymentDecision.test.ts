import { describe, expect, it } from "vitest";
import { validateRentalPaymentDecision } from "../../supabase/functions/_shared/rental-payment-decision";
import { newBankDiscountPolicy } from "@/lib/bankTransferDiscount";
describe("rental payment decision safeguards", () => {
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