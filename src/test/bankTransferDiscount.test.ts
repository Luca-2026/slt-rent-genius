import { describe, expect, it } from "vitest";
import { allPaymentsByBank, priceBankTransfer, newBankDiscountPolicy, hasBankDiscountPolicy } from "@/lib/bankTransferDiscount";

const line = { product_name: "Miete", quantity: 1, unit_price: 100, discount_percent: 0 };
describe("3 % Überweisungsrabatt", () => {
  it("discounts rental plus insurance, delivery and accessories by exactly 3 %", () => {
    const result = priceBankTransfer([{ ...line, addons: [{ key: "insurance", label: "Versicherung", amount: 10 }] }, { ...line, product_name: "Zubehör", unit_price: 20 }], 30, "bank");
    expect(result.discountNet).toBe(4.8);
    expect(result.totals.netAmount).toBe(155.2);
    expect(result.totals.grossAmount).toBe(184.69);
  });
  it("never discounts deposit, damages or municipal fees", () => {
    const result = priceBankTransfer([line, { ...line, unit_price: 100, payment_cost_kind: "deposit" }, { ...line, unit_price: 40, vat_rate: 0, payment_cost_kind: "damage" }, { ...line, unit_price: 20, payment_cost_kind: "municipal" }], 0, "bank");
    expect(result.discountNet).toBe(3);
    expect(result.totals.netAmount).toBe(257);
    expect(result.totals.grossAmount).toBe(298.23);
  });
  it("applies after existing customer discounts", () => {
    expect(priceBankTransfer([{ ...line, discount_percent: 20 }], 0, "bank").discountNet).toBe(2.4);
  });
  it("accepts multiple bank transfers, but no mixed payment", () => {
    expect(allPaymentsByBank([{ amount: 30, label: "Banküberweisung" }, { amount: 67, label: "Banküberweisung" }])).toBe(true);
    expect(allPaymentsByBank([{ amount: 30, label: "Banküberweisung" }, { amount: 67, label: "Barzahlung" }])).toBe(false);
    expect(allPaymentsByBank([{ amount: 97, label: "Banküberweisung", reference: "pi_confirmed" }])).toBe(false);
  });
  it("does not duplicate the discount after reopening", () => {
    const first = priceBankTransfer([line], 0, "bank");
    expect(priceBankTransfer(first.items, 0, "bank").totals).toEqual(first.totals);
    expect(priceBankTransfer(first.items, 0, "regular").totals.grossAmount).toBe(119);
  });
  it("only recognises versioned new agreements, leaving old snapshots ineligible", () => {
    expect(hasBankDiscountPolicy(undefined)).toBe(false);
    expect(hasBankDiscountPolicy({ rate: 3 })).toBe(false);
    expect(hasBankDiscountPolicy(newBankDiscountPolicy())).toBe(true);
  });
  it("does not discount negative installment deductions again", () => {
    const result = priceBankTransfer([line, { ...line, quantity: 1, unit_price: -50 }], 0, "bank");
    expect(result.discountNet).toBe(3);
    expect(result.totals.netAmount).toBe(47);
  });
});