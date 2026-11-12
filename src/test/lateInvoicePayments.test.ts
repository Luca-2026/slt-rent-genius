import { expect, it } from "vitest";
import { lateInvoicePaymentStatement } from "../../supabase/functions/_shared/late-invoice-payments";

it("M2VG4X credits 60.69 rent from the 160.69 Stripe receipt, leaving the 100 deposit separate", () => {
  const result = lateInvoicePaymentStatement({ created_at: "2026-11-09T07:40:34Z", gross_amount: 60.69,
    paid_amount: 60.69, payments: [{ amount: 60.69, receipt_amount: 160.69,
      invoice_payment_recorded_at: "2026-11-09T07:42:33Z" }] });
  expect(result.balance).toBe(0);
  expect(Number(result.payments[0]?.receipt_amount) - Number(result.payments[0]?.amount)).toBe(100);
});
it("does not describe payments already present at invoice creation as later receipts", () => {
  expect(lateInvoicePaymentStatement({ created_at: "2026-11-09T07:40:34Z", gross_amount: 60.69,
    paid_amount: 60.69, payments: [{ amount: 60.69 }] }).payments).toHaveLength(0);
});
it("retains a genuine 20 euro balance instead of marking a partial payment settled", () => {
  expect(lateInvoicePaymentStatement({ gross_amount: 80.69, paid_amount: 60.69 }).balance).toBe(20);
});