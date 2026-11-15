export type RefundAllocation = { payment_intent?: string; amount_cents: number; deposit_cents: number; rent_cents: number; status: string; refund_id?: string; link_id?: string };
export function refundBalances(input: { paid: number; depositEntitlement: number; rentEntitlement: number; depositUsed: number; rentUsed: number; pending?: boolean }) {
  const deposit = Math.max(0, input.depositEntitlement - input.depositUsed);
  const rent = Math.max(0, input.rentEntitlement - input.rentUsed);
  return { deposit, rent, total: deposit + rent, fullyRefunded: input.paid > 0 && input.depositUsed + input.rentUsed >= input.paid, pending: Boolean(input.pending) };
}
/** Use only verified original-charge capacity, never a new payment method. */
export function allocateOrderRefund(deposit: number, rent: number, receipts: { payment_intent: string; link_id: string; available: number }[]): RefundAllocation[] {
  if (![deposit, rent].every(n => Number.isSafeInteger(n) && n >= 0) || deposit + rent <= 0) throw new Error("Ungültiger Erstattungsbetrag");
  let d = deposit, r = rent;
  const seen = new Set<string>();
  const result: RefundAllocation[] = [];
  for (const receipt of receipts) {
    if (seen.has(receipt.payment_intent)) continue;
    seen.add(receipt.payment_intent);
    const dc = Math.min(d, Math.max(0, receipt.available));
    const rc = Math.min(r, Math.max(0, receipt.available - dc));
    if (dc + rc) result.push({ payment_intent: receipt.payment_intent, link_id: receipt.link_id, amount_cents: dc + rc, deposit_cents: dc, rent_cents: rc, status: "creating" });
    d -= dc; r -= rc;
  }
  if (d + r) throw new Error("Originalzahlung deckt die Erstattung nicht vollständig. Status prüfen, nicht zusätzlich auszahlen.");
  return result;
}