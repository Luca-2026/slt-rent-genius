import { allPaymentsByBank, hasBankDiscountPolicy } from "./bank-transfer-discount.ts";
import { rentalPaymentPrices } from "./rental-payment-decision.ts";

/** One transaction records the receipt and payment-price decision, never a fake discount payment. */
export async function recordRentalPayments(service: any, id: string, actor: string, expectedPayments: unknown, payments: unknown[]) {
  const { data: inquiry, error } = await service.from("rental_inquiries").select("*").eq("id", id).maybeSingle();
  if (error || !inquiry) throw new Error("Auftrag konnte nicht geladen werden.");
  const policy = inquiry.offer_payload?.bank_transfer_discount;
  let bankPayload = null;
  if (payments.length > 0 && allPaymentsByBank(payments) && hasBankDiscountPolicy(policy) && policy.selected !== "bank") {
    // A receipt is not a request to correct an issued document's agreed price.
    const { data: invoices, error: invoiceError } = await service.from("inquiry_invoices")
      .select("id").eq("rental_inquiry_id", id).not("status", "in", "(draft,cancelled)").limit(1);
    const { data: settlements, error: settlementError } = await service.from("deposit_settlements")
      .select("id").eq("rental_inquiry_id", id).limit(1);
    if (invoiceError || settlementError) throw new Error("Belegstatus konnte nicht geprüft werden.");
    if (!invoices?.length && !settlements?.length) {
      const changed = { ...inquiry.offer_payload, bank_transfer_discount: { ...policy, selected: "bank" } };
      const priced = rentalPaymentPrices(changed);
      bankPayload = { ...changed, items: priced.items, totals: priced.totals };
    }
  }
  const { data, error: saveError } = await service.rpc("record_rental_staff_payments", {
    _id: id, _actor: actor, _expected_payments: expectedPayments ?? [],
    _expected_version: inquiry.payment_decision_version, _payments: payments, _bank_payload: bankPayload,
  });
  if (saveError) throw new Error(saveError.message);
  return data;
}