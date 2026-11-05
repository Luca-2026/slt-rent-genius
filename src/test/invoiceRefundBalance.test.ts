import { expect, it } from "vitest";
import { confirmedRefundsByMethod, invoiceRefundBalance } from "../../supabase/functions/_shared/invoice-refund-balance";
const invoice = { paid_amount: 680.68, gross_amount: 556.92 };
it("refund confirmation uses the actual completed payment method only", () => {
  expect(confirmedRefundsByMethod([
    { status: "succeeded", amount_cents: 10000, payout_method: "transfer" },
    { status: "creating", amount_cents: 9999, payout_method: "transfer" },
    { status: "partial_failed", amount_cents: 2376, payout_method: "stripe", allocations: [{ status: "succeeded", amount_cents: 2000 }, { status: "failed", amount_cents: 376 }] },
  ])).toEqual({ transfer_cents: 10000, stripe_cents: 2000 });
});
it("shows 123.76 refunded and zero remaining without subtracting invoice or deposit twice", () => {
  expect(invoiceRefundBalance(invoice, [{ status: "succeeded", amount_cents: 12376, payout_method: "transfer" }])).toEqual({ credit_cents: 12376, refunded_cents: 12376, remaining_cents: 0 });
  expect(invoice.gross_amount).toBe(556.92);
});
it("never claims a pending transfer has been paid", () => {
  expect(invoiceRefundBalance(invoice, [{ status: "creating", amount_cents: 12376, payout_method: "transfer" }]).remaining_cents).toBe(12376);
});
it("partial Stripe outcomes only count confirmed allocations", () => {
  expect(invoiceRefundBalance(invoice, [{ status: "partial_failed", amount_cents: 12376, payout_method: "stripe", allocations: [{ status: "succeeded", amount_cents: 10000 }, { status: "failed", amount_cents: 2376 }] }])).toEqual({ credit_cents: 12376, refunded_cents: 10000, remaining_cents: 2376 });
});
it("blocks over-refunded payment statements", () => {
  expect(() => invoiceRefundBalance(invoice, [{ status: "succeeded", amount_cents: 12377, payout_method: "transfer" }])).toThrow("übersteigen");
});