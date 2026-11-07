import { describe, expect, it } from "vitest";
import { shouldSendCustomerEmail, type CustomerEmailKind } from "../../supabase/functions/_shared/customer-email-policy";

describe("essential customer email policy", () => {
  it.each<CustomerEmailKind>(["offer", "order_confirmation", "invoice", "credit_note", "handover_protocol", "return_protocol"])("preserves %s", kind => {
    expect(shouldSendCustomerEmail(kind)).toBe(true);
  });
  it.each<CustomerEmailKind>(["request_confirmation", "online_acceptance_confirmation", "deposit_refund_confirmation", "credit_refund_confirmation", "automatic_payment_reminder", "offer_followup"])("suppresses extra %s", kind => {
    expect(shouldSendCustomerEmail(kind)).toBe(false);
  });
  it.each<CustomerEmailKind>(["security", "required_action", "manual_payment_reminder", "onsite_signed_offer"])("preserves necessary %s", kind => {
    expect(shouldSendCustomerEmail(kind)).toBe(true);
  });
});