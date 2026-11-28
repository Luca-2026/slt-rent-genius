/** Presentation only: never infer executable rent credit from the gross receipt surplus. */
export type RefundSummaryInput = {
  deposit_available: number; rent_available: number; deposit_used: number; rent_used: number;
};
export function orderRefundSummary(totals: RefundSummaryInput, pending: { deposit: number; rent: number }, basisKnown: boolean, evidenceReady: boolean) {
  const values = [...Object.values(totals), pending.deposit, pending.rent];
  const valid = evidenceReady && values.every(n => Number.isSafeInteger(n) && n >= 0)
    && pending.deposit <= totals.deposit_used && pending.rent <= totals.rent_used;
  return {
    depositConfirmed: valid ? totals.deposit_used - pending.deposit : null,
    rentConfirmed: valid ? totals.rent_used - pending.rent : null,
    depositPending: valid ? pending.deposit : null,
    rentPending: valid ? pending.rent : null,
    open: valid && basisKnown ? totals.deposit_available + totals.rent_available : null,
  };
}
export function reservedRefundCents(rows: Array<{ status: string; amount_cents: number }>) {
  return rows.filter(r => !["succeeded", "failed", "canceled"].includes(r.status))
    .reduce((sum, r) => sum + Number(r.amount_cents), 0);
}