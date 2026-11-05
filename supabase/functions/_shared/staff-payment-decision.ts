import { hasBankDiscountPolicy, type RentalPaymentMethod } from "./bank-transfer-discount.ts";
import { rentalPaymentPrices, validateRentalPaymentDecision } from "./rental-payment-decision.ts";

/** Staff use the same protected decision as customers, never a browser-written price. */
export async function selectStaffRentalPayment(service: any, inquiryId: string, method: RentalPaymentMethod) {
  const { data: inquiry, error } = await service.from("rental_inquiries").select("*").eq("id", inquiryId).maybeSingle();
  if (error || !inquiry || !hasBankDiscountPolicy(inquiry.offer_payload?.bank_transfer_discount)) throw new Error("Kein vereinbarter Überweisungsrabatt vorhanden.");
  const policy = inquiry.offer_payload.bank_transfer_discount;
  const { data: invoices, error: invoiceError } = await service.from("inquiry_invoices").select("id").eq("rental_inquiry_id", inquiryId).not("status", "in", "(draft,cancelled)").limit(1);
  const { data: settlements, error: settlementError } = await service.from("deposit_settlements").select("id").eq("rental_inquiry_id", inquiryId).limit(1);
  if (invoiceError || settlementError) throw new Error("Belegstatus konnte nicht geprüft werden.");
  validateRentalPaymentDecision({ policy, method, payments: inquiry.payments, hasIssuedInvoice: Boolean(invoices?.length), hasSettlement: Boolean(settlements?.length) });
  if (method === policy.selected) return { success: true, gross: inquiry.offer_total_gross };
  // RPC intentionally blocks active/unknown provider attempts; staff never blindly retires one.
  const changed = { ...inquiry.offer_payload, bank_transfer_discount: { ...policy, selected: method } };
  const priced = rentalPaymentPrices(changed);
  const payload = { ...changed, items: priced.items, totals: priced.totals };
  const { data, error: decisionError } = await service.rpc("select_rental_payment_method", { _id: inquiry.id, _offer: inquiry.offer_number, _expected: inquiry.payment_decision_version, _method: method, _payload: payload });
  if (decisionError) throw new Error(decisionError.message);
  return { success: true, ...data };
}