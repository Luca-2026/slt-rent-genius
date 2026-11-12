type InvoiceSyncService = {
  rpc(name: string, args: { _inquiry: string }): PromiseLike<{ error: { message: string } | null }>;
};

/** Retry invoice reconciliation even when the original receipt is already committed. */
export async function syncInvoiceForStripeReceipt(
  service: InvoiceSyncService,
  result: string | null | undefined,
  inquiryTable: string | null | undefined,
  inquiryId: string | null | undefined,
): Promise<void> {
  if (inquiryTable !== "rental_inquiries" || !inquiryId || (result !== "booked" && result !== "already_booked")) return;
  const { error } = await service.rpc("sync_single_rental_invoice_receipts", { _inquiry: inquiryId });
  if (error) throw new Error(`Rechnungszahlung konnte nicht abgeglichen werden: ${error.message}`);
}