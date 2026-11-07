export interface DepositPayment { id: string; status: string; deposit_cents: number; paid_cents: number | null }
export interface DepositRefund { link_id: string; amount_cents: number; status: string; request_id?: string }

/** Resume an unresolved claim before choosing any new payment; never release its reserved capacity. */
export function pendingDepositRefund(refunds: DepositRefund[]) {
  return refunds.find(r => ["creating", "pending", "requires_action"].includes(r.status) && r.request_id);
}

/** Choose the original receipt with sufficient remaining deposit capacity, not the newest top-up. */
export function depositRefundPayment<T extends DepositPayment>(links: T[], refunds: DepositRefund[], requestedCents = 0) {
  const candidates = links.filter(l => l.status === "paid").map(link => {
    const reserved = refunds.filter(r => r.link_id === link.id && !["failed", "canceled"].includes(r.status)).reduce((s, r) => s + r.amount_cents, 0);
    return { link, available: Math.max(0, Math.min(link.deposit_cents, link.paid_cents ?? 0) - reserved) };
  }).sort((a, b) => b.available - a.available);
  return candidates.find(c => c.available > 0 && c.available >= requestedCents) ?? null;
}