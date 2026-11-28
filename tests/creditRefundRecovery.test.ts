import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { stripe } = vi.hoisted(() => ({ stripe: { paymentIntents: { retrieve: vi.fn() }, refunds: { list: vi.fn(), create: vi.fn() } } }));
vi.mock("../supabase/functions/_shared/stripe-pay.ts", () => ({ stripeClient: () => stripe, isStripeTestMode: () => true,
  toCents: (n: unknown) => Math.max(0, Math.round(Number(n) * 100) || 0) }));
import { creditRefund } from "../supabase/functions/_shared/credit-refund";
type Claim = { status: string; amount_cents: number; allocations: Record<string, unknown>[]; created_at: string };
function fixture() {
  let claim: Claim | null = null;
  const accepted: Record<string, unknown>[] = [];
  const credit = { id: "credit", invoice_kind: "credit_note", status: "issued", parent_invoice_id: "parent", gross_amount: -40, created_at: "2026-11-28", invoice_number: "GS-TEST" };
  const parent = { id: "parent", gross_amount: 100, paid_amount: 100, payments: [{ amount: 100, reference: "pi_isolated" }] };
  const service = { from: (table: string) => {
    let id = "";
    const q = { select: () => q, eq: (_key: string, value: string) => { id = value; return q; }, neq: () => q,
      maybeSingle: async () => ({ data: table === "inquiry_invoices" ? credit : claim }),
      single: async () => ({ data: table === "inquiry_invoices" ? parent : claim }),
      insert: async (data: Omit<Claim, "status" | "created_at">) => {
        if (claim) return { error: { message: "Duplicate claim" } };
        claim = { ...data, status: "creating", created_at: new Date().toISOString() }; return { error: null };
      }, then: (resolve: (v: unknown) => unknown) => Promise.resolve({ data: id === "parent" ? [credit] : [] }).then(resolve) };
    return q;
  }, rpc: vi.fn(async (name: string, args: Record<string, unknown>): Promise<{ error: null | { message: string } }> => {
    if (name === "sync_credit_note_refund_v2" && claim) {
      claim.status = String(args._status);
      claim.allocations[0] = { ...claim.allocations[0], status: args._status, refund_id: args._refund_id };
    }
    return { error: null };
  }) };
  stripe.paymentIntents.retrieve.mockResolvedValue({ status: "succeeded", livemode: false, currency: "eur", latest_charge: { amount: 10000 } });
  stripe.refunds.list.mockImplementation(async function* () { yield* accepted; });
  stripe.refunds.create.mockImplementation(async (input: Record<string, unknown>) => {
    const refund = { ...input, id: "re_isolated", currency: "eur", status: "succeeded" }; accepted.push(refund); return refund;
  });
  return { service, parent, accepted, claim: () => claim };
}
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal("fetch", vi.fn(() => { throw new Error("External calls forbidden"); })); });
afterEach(() => { expect(fetch).not.toHaveBeenCalled(); vi.unstubAllGlobals(); });
it("persists a claim before provider failure and retries with the same idempotency key", async () => {
  const f = fixture(); stripe.refunds.create.mockRejectedValueOnce(new Error("Timeout"));
  await expect(creditRefund(f.service, "credit", "staff", true)).rejects.toThrow("Timeout");
  expect(f.claim()?.status).toBe("creating"); expect(f.claim()?.amount_cents).toBe(4000);
  const result = await creditRefund(f.service, "credit", "staff", true);
  expect(result.status).toBe("succeeded");
  expect(stripe.refunds.create.mock.calls.map(c => c[1])).toEqual([
    { idempotencyKey: "credit-credit-pi_isolated" }, { idempotencyKey: "credit-credit-pi_isolated" }]);
  expect(f.accepted).toHaveLength(1);
  expect(f.parent.paid_amount).toBe(100); expect(f.parent.gross_amount).toBe(100);
});
it("recovers provider acceptance after a persistence failure without another payout", async () => {
  const f = fixture();
  const originalRpc = f.service.rpc.getMockImplementation();
  let failReceipt = true;
  f.service.rpc.mockImplementation(async (name, args) => {
    if (name === "record_stripe_refund_receipt" && failReceipt) {
      failReceipt = false; return { error: { message: "Write failed" } };
    }
    return originalRpc ? originalRpc(name, args) : { error: null };
  });
  await expect(creditRefund(f.service, "credit", "staff", true)).rejects.toThrow();
  expect(f.claim()?.status).toBe("creating"); expect(f.accepted).toHaveLength(1);
  await creditRefund(f.service, "credit", "staff", true);
  await creditRefund(f.service, "credit", "staff", true);
  expect(stripe.refunds.create).toHaveBeenCalledTimes(1); expect(f.claim()?.status).toBe("succeeded");
});
it.each(["failed", "pending"])("preserves actual %s evidence on repeat execution rather than marking it succeeded", async (status) => {
  const f = fixture(); stripe.refunds.create.mockImplementationOnce(async input => {
    const refund = { ...input, id: "re_isolated", currency: "eur", status }; f.accepted.push(refund); return refund;
  });
  const first = await creditRefund(f.service, "credit", "staff", true);
  const repeat = await creditRefund(f.service, "credit", "staff", true);
  expect(first.status).toBe(status); expect(repeat.status).toBe(status);
  expect(repeat.already_requested).toBe(true); expect(stripe.refunds.create).toHaveBeenCalledTimes(1);
});