import { expect, it, vi } from "vitest";
import { syncInvoiceForStripeReceipt } from "../../supabase/functions/_shared/stripe-invoice-sync";

it("retries invoice allocation after a committed payment and failed reconciliation", async () => {
  const rpc = vi.fn().mockResolvedValueOnce({ error: { message: "lock timeout" } }).mockResolvedValueOnce({ error: null });
  await expect(syncInvoiceForStripeReceipt({ rpc }, "booked", "rental_inquiries", "order-id")).rejects.toThrow("lock timeout");
  await syncInvoiceForStripeReceipt({ rpc }, "booked", "rental_inquiries", "order-id");
  expect(rpc).toHaveBeenCalledTimes(2);
  expect(rpc).toHaveBeenLastCalledWith("sync_single_rental_invoice_receipts", { _inquiry: "order-id" });
});

it("reconciles an already-booked receipt without adding a new payment", async () => {
  const rpc = vi.fn().mockResolvedValue({ error: null });
  await syncInvoiceForStripeReceipt({ rpc }, "already_booked", "rental_inquiries", "order-id");
  expect(rpc).toHaveBeenCalledTimes(1);
});

it.each(["reconciliation_required", "not_paid_yet", "duplicate_payment", null])("does not allocate unverified result %s", async result => {
  const rpc = vi.fn();
  await syncInvoiceForStripeReceipt({ rpc }, result, "rental_inquiries", "order-id");
  expect(rpc).not.toHaveBeenCalled();
});

it("does not apply rental allocations to sales", async () => {
  const rpc = vi.fn();
  await syncInvoiceForStripeReceipt({ rpc }, "booked", "sales_inquiries", "order-id");
  expect(rpc).not.toHaveBeenCalled();
});