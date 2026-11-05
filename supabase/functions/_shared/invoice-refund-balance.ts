export function invoiceRefundBalance(invoice: { paid_amount: unknown; gross_amount: unknown }, refunds: { status: string; amount_cents: number; payout_method: string; allocations?: { status: string; amount_cents: number }[] }[]) {
  const credit = Math.max(0, Math.round((Number(invoice.paid_amount) - Number(invoice.gross_amount)) * 100));
  const refunded = refunds.reduce((sum, r) => sum + (r.payout_method === "transfer" ? r.status === "succeeded" ? r.amount_cents : 0 : (r.allocations ?? []).filter(a => a.status === "succeeded").reduce((n, a) => n + a.amount_cents, 0)), 0);
  if (refunded > credit) throw new Error("Erstattungen übersteigen das Mietguthaben; Zahlungsstand prüfen.");
  return { credit_cents: credit, refunded_cents: refunded, remaining_cents: credit - refunded };
}