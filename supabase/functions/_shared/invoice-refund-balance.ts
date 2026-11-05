export interface InvoiceRefund { status: string; amount_cents: number; payout_method: string; allocations?: { status: string; amount_cents: number }[] }
export function confirmedRefundsByMethod(refunds: InvoiceRefund[]) {
  return refunds.reduce((sum, r) => {
    if (r.payout_method === "transfer" && r.status === "succeeded") sum.transfer_cents += r.amount_cents;
    if (r.payout_method === "stripe") sum.stripe_cents += (r.allocations ?? []).filter(a => a.status === "succeeded").reduce((n, a) => n + a.amount_cents, 0);
    return sum;
  }, { transfer_cents: 0, stripe_cents: 0 });
}
export function invoiceRefundBalance(invoice: { paid_amount: unknown; gross_amount: unknown }, refunds: InvoiceRefund[]) {
  const credit = Math.max(0, Math.round((Number(invoice.paid_amount) - Number(invoice.gross_amount)) * 100));
  const methods = confirmedRefundsByMethod(refunds);
  const refunded = methods.transfer_cents + methods.stripe_cents;
  if (refunded > credit) throw new Error("Erstattungen übersteigen das Mietguthaben; Zahlungsstand prüfen.");
  return { credit_cents: credit, refunded_cents: refunded, remaining_cents: credit - refunded };
}