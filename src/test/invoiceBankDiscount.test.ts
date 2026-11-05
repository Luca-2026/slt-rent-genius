import { describe, expect, it } from "vitest";
import { invoiceBankDiscount } from "../../supabase/functions/_shared/invoice-bank-discount";
import { newBankDiscountPolicy, priceBankTransfer } from "@/lib/bankTransferDiscount";
import { buildOfferTotals } from "../../supabase/functions/_shared/inquiry-offer-math";
const policy = { ...newBankDiscountPolicy(), selected: "bank" as const };
const line = (net: number) => ({ product_name: "Miete", quantity: 1, unit_price: net, discount_percent: 0 });
describe("installments and final bank rebate", () => {
  it("keeps two installments and final equal to the once-discounted contract", () => {
    const order = priceBankTransfer([line(1000)], 0, "bank");
    const first = buildOfferTotals(invoiceBankDiscount([line(300)], 0, policy, "installment", false).items);
    const second = buildOfferTotals(invoiceBankDiscount([line(400)], 0, policy, "installment", false).items);
    const final = buildOfferTotals(invoiceBankDiscount([line(1000), line(-300), line(-400)], 0, policy, "final", false).items);
    expect(first.netAmount).toBe(300); expect(second.netAmount).toBe(400); expect(final.netAmount).toBe(270);
    expect(first.netAmount + second.netAmount + final.netAmount).toBe(order.totals.netAmount);
    expect(first.grossAmount + second.grossAmount + final.grossAmount).toBe(1154.3);
  });
  it("does not discount deposit settlement deductions", () => {
    expect(buildOfferTotals(invoiceBankDiscount([line(100)], 0, policy, "invoice", true).items).grossAmount).toBe(119);
  });
});