import { describe, expect, it, vi, beforeEach } from "vitest";
const { stripe } = vi.hoisted(() => ({ stripe: { checkout: { sessions: { retrieve: vi.fn() } }, paymentIntents: { retrieve: vi.fn() }, refunds: { list: vi.fn(), create: vi.fn() } } }));
vi.mock("../supabase/functions/_shared/stripe-pay.ts", () => ({ stripeClient: () => stripe, toCents: (n: unknown) => Math.max(0, Math.round(Number(n) * 100) || 0) }));
import { creditRefund } from "../supabase/functions/_shared/credit-refund";

function fixture(paid = 100, creditAmount = 40, used = 0, existing: any = null, previousCredit = 0) {
  const credit = { id: "credit", invoice_kind: "credit_note", status: "paid", parent_invoice_id: "parent", gross_amount: -creditAmount, created_at: "2026-10-04", invoice_number: "GS-M" };
  const parent = { id: "parent", gross_amount: 100, paid_amount: paid, payments: [{ amount: paid, reference: "cs_live_receipt" }] };
  const calls: any[] = [];
  const service = { from: (table: string) => {
    const q: any = { select: () => q, eq: (_key: string, value: string) => { q.id = value; return q; }, neq: () => q,
      maybeSingle: async () => ({ data: table === "inquiry_invoices" ? credit : existing }), single: async () => ({ data: table === "inquiry_invoices" ? parent : { status: "succeeded", amount_cents: creditAmount * 100 } }),
      insert: async (data: any) => { calls.push(data); return {}; }, then: (resolve: any) => resolve({ data: [credit, ...(previousCredit ? [{ id: "earlier", created_at: "2026-10-03", gross_amount: -previousCredit }] : [])] }) };
    return q;
  }, rpc: vi.fn(async () => ({ error: null })) };
  stripe.checkout.sessions.retrieve.mockResolvedValue({ payment_status: "paid", payment_intent: "pi_receipt" });
  stripe.paymentIntents.retrieve.mockResolvedValue({ status: "succeeded", currency: "eur", latest_charge: { amount: 10000 } });
  stripe.refunds.list.mockImplementation(async function* () { if (used) yield { amount: used, status: "succeeded" }; });
  stripe.refunds.create.mockResolvedValue({ id: "re_refund", status: "succeeded" });
  return { service, calls };
}
beforeEach(() => vi.clearAllMocks());
describe("Credit refund safety (mock Stripe, no money movement)", () => {
  it("preflight never creates a refund", async () => { const { service, calls } = fixture(); expect((await creditRefund(service, "credit", "user", false)).amount_cents).toBe(4000); expect(stripe.refunds.create).not.toHaveBeenCalled(); expect(calls).toHaveLength(0); });
  it("caps partial-paid refund after debt offset", async () => { const { service } = fixture(70, 40); expect((await creditRefund(service, "credit", "user", false)).amount_cents).toBe(1000); });
  it("accounts for earlier credit notes before debt offset", async () => { const { service } = fixture(70, 20, 0, null, 20); expect((await creditRefund(service, "credit", "user", false)).amount_cents).toBe(1000); });
  it("does not use the deposit balance for rent already refunded", async () => { const { service } = fixture(); stripe.paymentIntents.retrieve.mockResolvedValue({ status: "succeeded", currency: "eur", latest_charge: { amount: 20000 } }); stripe.refunds.list.mockImplementation(async function* () { yield { amount: 7000, status: "succeeded", metadata: { kind: "credit_note" } }; }); await expect(creditRefund(service, "credit", "user", false)).rejects.toThrow(); });
  it("keeps known deposit refunds separate from the rent allocation", async () => { const { service } = fixture(); stripe.paymentIntents.retrieve.mockResolvedValue({ status: "succeeded", currency: "eur", latest_charge: { amount: 20000 } }); stripe.refunds.list.mockImplementation(async function* () { yield { amount: 10000, status: "succeeded", metadata: { kind: "deposit" } }; }); expect((await creditRefund(service, "credit", "user", false)).amount_cents).toBe(4000); });
  it("rejects unpaid and already refunded charges", async () => { await expect(creditRefund(fixture(0).service, "credit", "user", false)).rejects.toThrow(); await expect(creditRefund(fixture(100, 40, 9000).service, "credit", "user", false)).rejects.toThrow(); });
  it("persists allocation before using stable provider key", async () => { const { service, calls } = fixture(); await creditRefund(service, "credit", "user", true); expect(calls[0].allocations[0].amount_cents).toBe(4000); expect(stripe.refunds.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 4000 }), { idempotencyKey: "credit-credit-pi_receipt" }); expect(service.rpc).toHaveBeenCalled(); });
  it("does not repeat completed refunds", async () => { const { service } = fixture(100, 40, 0, { status: "succeeded", amount_cents: 4000, allocations: [{ refund_id: "re_existing" }] }); expect((await creditRefund(service, "credit", "user", true)).already_requested).toBe(true); expect(stripe.refunds.create).not.toHaveBeenCalled(); });
  it("reconciles previous provider acceptance before retrying", async () => { const { service } = fixture(100, 40, 0, { status: "creating", amount_cents: 4000, allocations: [{ payment_intent: "pi_receipt", amount_cents: 4000 }] }); stripe.refunds.list.mockImplementation(async function* () { yield { id: "re_found", metadata: { credit_note_id: "credit" }, status: "succeeded" }; }); await creditRefund(service, "credit", "user", true); expect(stripe.refunds.create).not.toHaveBeenCalled(); expect(service.rpc).toHaveBeenCalledWith("sync_credit_note_refund", expect.objectContaining({ _refund_id: "re_found" })); });
});