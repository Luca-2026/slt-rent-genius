/** Routine acknowledgements do not add a second email to the document workflow. */
export type CustomerEmailKind =
  | "offer" | "order_confirmation" | "invoice" | "credit_note"
  | "handover_protocol" | "return_protocol" | "onsite_signed_offer"
  | "security" | "required_action" | "manual_payment_reminder"
  | "request_confirmation" | "online_acceptance_confirmation"
  | "deposit_refund_confirmation" | "credit_refund_confirmation"
  | "automatic_payment_reminder" | "offer_followup";

const suppressed = new Set<CustomerEmailKind>([
  "request_confirmation", "online_acceptance_confirmation",
  "deposit_refund_confirmation", "credit_refund_confirmation",
  "automatic_payment_reminder", "offer_followup",
]);

export function shouldSendCustomerEmail(kind: CustomerEmailKind): boolean {
  return !suppressed.has(kind);
}