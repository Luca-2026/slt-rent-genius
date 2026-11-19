import { computeSettlement, sumPayments } from "@/lib/depositSettlement";

export interface DepositDueInquiry { id: string; status: string; offer_total_gross: number | null; payments: unknown; offer_payload: unknown; closed_manually_at?: string | null }
export interface DepositDueSettlement { rental_inquiry_id: string; balance: number; payout_status: string; settled_at: string }
export interface DepositDueReturn { rental_inquiry_id: string | null; status: string; damages_total: number | null; b2b_return_extra_charges?: { quantity: number; unit_price: number }[] }
export interface DepositDueEvidence { inquiryId: string; amountCents: number; pending: boolean }
export interface DepositDue { amount: number; stage: "settlement" | "payout" | "processing"; since: string | null }

/** No phase gate: a recorded positive payout is due even on completed/cancelled orders.
 * Unsettled returns are estimates, not permission to pay. Only confirmed refunds reduce the balance. */
export function depositRefundDue(inquiry: DepositDueInquiry, settlement: DepositDueSettlement | undefined, returns: DepositDueReturn[], evidence?: DepositDueEvidence): DepositDue | null {
  if (settlement?.payout_status === "paid") return null;
  const returned = returns.filter(p => p.rental_inquiry_id === inquiry.id && ["signed", "signed_staff_only"].includes(p.status));
  let amount: number;
  if (settlement) amount = Math.max(0, Number(settlement.balance));
  else {
    if (!returned.length && !inquiry.closed_manually_at && inquiry.status !== "cancelled") return null;
    const payload = inquiry.offer_payload && typeof inquiry.offer_payload === "object" ? inquiry.offer_payload as { deposit?: unknown } : {};
    const deposit = payload.deposit == null ? undefined : Math.max(0, Number(payload.deposit) || 0);
    const deductions = returned.flatMap(p => [
      ...(p.b2b_return_extra_charges ?? []).map((c, n) => ({ key: `charge-${n}`, label: "", gross: Number(c.quantity) * Number(c.unit_price), source: "protocol" as const, kind: "service" as const })),
      { key: "damage", label: "", gross: Number(p.damages_total) || 0, source: "damage" as const, kind: "damage" as const },
    ]);
    amount = computeSettlement({ paid: sumPayments(inquiry.payments), rent: Number(inquiry.offer_total_gross) || 0, deposit, deductions }).refund;
  }
  const remaining = Math.max(0, Math.round(amount * 100) - (evidence?.amountCents ?? 0));
  if (remaining <= 0) return null;
  return { amount: remaining / 100, stage: evidence?.pending ? "processing" : settlement ? "payout" : "settlement", since: settlement?.settled_at ?? null };
}