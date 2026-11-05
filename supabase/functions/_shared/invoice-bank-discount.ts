import { BANK_DISCOUNT_TERMS, hasBankDiscountPolicy, priceBankTransfer, withoutBankDiscount } from "./bank-transfer-discount.ts";
import type { InquiryOfferItem } from "./inquiry-offer-math.ts";

/** Installments are already an amount against the discounted contract; final deductions are never discounted again. */
export function invoiceBankDiscount(items: InquiryOfferItem[], costs: number, policy: unknown, kind: "invoice" | "supplement" | "installment" | "final", depositSettlement: boolean) {
  if (!hasBankDiscountPolicy(policy)) return { items, note: null };
  const clean = withoutBankDiscount(items);
  return {
    items: policy.selected === "bank" && kind !== "installment" && !depositSettlement ? priceBankTransfer(clean, costs, "bank").items : clean,
    note: policy.selected === "bank" && kind === "installment" ? "Abschlag auf die bereits um 3 % reduzierte Auftragssumme; kein erneuter Rabattabzug." : BANK_DISCOUNT_TERMS,
  };
}