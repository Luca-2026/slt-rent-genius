import { allPaymentsByBank, hasBankDiscountPolicy, priceBankTransfer, type RentalPaymentMethod } from "./bank-transfer-discount.ts";
import type { InquiryOfferItem } from "./inquiry-offer-math.ts";

export function rentalPaymentPrices(payload: Record<string, unknown>) {
  const costs = ["delivery_cost_delivery", "delivery_cost_return", "setup_cost", "dismantle_cost", "return_location_cost"]
    .reduce((sum, key) => sum + (Number(payload[key]) || 0), 0);
  return priceBankTransfer(Array.isArray(payload.items) ? payload.items as InquiryOfferItem[] : [], costs,
    hasBankDiscountPolicy(payload.bank_transfer_discount) ? payload.bank_transfer_discount.selected : "regular");
}

export function validateRentalPaymentDecision(input: { policy: unknown; method: RentalPaymentMethod; payments: unknown; hasIssuedInvoice: boolean; hasSettlement: boolean }) {
  if (!hasBankDiscountPolicy(input.policy)) throw new Error("Für dieses Angebot wurde kein Überweisungsrabatt vereinbart.");
  if (input.hasSettlement) throw new Error("Kaution bereits abgerechnet. Zahlungswechsel gesperrt.");
  if (input.method !== input.policy.selected && input.hasIssuedInvoice) throw new Error("Zahlungswechsel erfordert zunächst eine Belegkorrektur durch SLT.");
  if (input.method === "bank" && !allPaymentsByBank(input.payments)) throw new Error("3 % Rabatt gelten nur bei vollständig per Banküberweisung bezahltem Mietbetrag.");
}