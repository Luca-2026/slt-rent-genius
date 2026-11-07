import { beforeEach, expect, it, vi } from "vitest";
const { stripe } = vi.hoisted(() => ({ stripe: { checkout: { sessions: { retrieve: vi.fn() } }, paymentIntents: { retrieve: vi.fn() }, refunds: { list: vi.fn(), create: vi.fn() } } }));
vi.mock("../supabase/functions/_shared/stripe-pay.ts", () => ({ stripeClient: () => stripe, isStripeTestMode: () => false, toCents: (v: unknown) => Math.round(Number(v) * 100) }));
import { creditRefund } from "../supabase/functions/_shared/credit-refund";

beforeEach(() => {
  vi.clearAllMocks();
  stripe.checkout.sessions.retrieve.mockResolvedValue({ payment_status: "paid", payment_intent: "pi_original" });
  stripe.paymentIntents.retrieve.mockResolvedValue({ livemode: true, status: "succeeded", currency: "eur", latest_charge: { amount: 102963 } });
  stripe.refunds.list.mockImplementation(async function* () { yield { id: "pyr_deposit", payment_intent: "pi_original", amount: 70000, currency: "eur", status: "succeeded", metadata: { kind: "deposit" } }; });
  stripe.refunds.create.mockResolvedValue({ id: "pyr_credit", payment_intent: "pi_original", amount: 6997, currency: "eur", status: "succeeded", metadata: { credit_note_id: "invoice" } });
});

function serviceFixture(orderCredit = false) {
  let claim: any = null;
  const invoice = { id: "invoice", rental_inquiry_id: "florian", status: "paid", invoice_kind: "final", paid_amount: 377.23, gross_amount: 307.26, invoice_number: "RE-TEST", payments: [{ reference: "cs_original", amount: 377.23 }] };
  const service = {
    rpc: vi.fn(async (name: string, args: any) => {
      if (name === "sync_credit_note_refund_v2" || name === "sync_rental_order_refund") {
        claim.allocations = claim.allocations.map((a: any) => ({ ...a, refund_id: args._refund_id, status: args._status }));
        claim.status = "succeeded";
      }
      return { data: null, error: null };
    }),
    from(table: string) {
      let lookup = false;
      const q: any = {
        select: () => q, eq: (key: string) => { if ((table === "inquiry_invoices" || table === "rental_refund_bases") && key === "id") lookup = true; return q; }, neq: () => q,
        insert: (data: any) => { claim = { ...data, status: "creating", created_at: new Date().toISOString() }; return q; },
        maybeSingle: async () => ({ data: table === "rental_refund_bases" ? { ...invoice, inquiry_id: "florian" } : table === "inquiry_invoices" ? invoice : claim, error: null }),
        single: async () => ({ data: table === "rental_refund_bases" ? { ...invoice, inquiry_id: "florian" } : table === "inquiry_invoices" ? invoice : claim, error: null }),
        then: (resolve: any) => resolve({ data: table === "inquiry_invoices" ? orderCredit ? [] : lookup ? invoice : [] : table === "deposit_refunds" ? [] : claim, error: null }),
      };
      return q;
    },
  };
  return { service, invoice, claim: () => claim };
}

it("Florian: after 700 € deposit refund, invoice-backed 69.97 € is paid once and its provider receipt persisted", async () => {
  const f = serviceFixture();
  const preview = await creditRefund(f.service, "invoice", "admin", false, true);
  expect(preview.amount_cents).toBe(6997);
  expect(stripe.refunds.create).not.toHaveBeenCalled();
  const result = await creditRefund(f.service, "invoice", "admin", true, true);
  expect(result).toEqual(expect.objectContaining({ success: true, status: "succeeded", amount_cents: 6997 }));
  expect(stripe.refunds.create).toHaveBeenCalledWith(expect.objectContaining({ payment_intent: "pi_original", amount: 6997 }), { idempotencyKey: "credit-invoice-pi_original" });
  expect(f.service.rpc).toHaveBeenCalledWith("record_stripe_refund_receipt", expect.objectContaining({ _id: "pyr_credit", _amount: 6997 }));
  await creditRefund(f.service, "invoice", "admin", true, true);
  expect(stripe.refunds.create).toHaveBeenCalledTimes(1);
  expect(f.invoice.gross_amount).toBe(307.26);
  expect(f.invoice.paid_amount).toBe(377.23);
});

it("Florian: insufficient original-payment capacity blocks rental refund before a claim or payment is created", async () => {
  const f = serviceFixture();
  stripe.paymentIntents.retrieve.mockResolvedValue({ livemode: true, status: "succeeded", currency: "eur", latest_charge: { amount: 76996 } });
  await expect(creditRefund(f.service, "invoice", "admin", true, true)).rejects.toThrow("Kein vollständig");
  expect(f.claim()).toBeNull();
  expect(stripe.refunds.create).not.toHaveBeenCalled();
});

it("Florian: refunds 69.97 before invoice issuance, persists pyr_ receipt and never executes twice", async () => {
  const f = serviceFixture(true);
  stripe.refunds.create.mockResolvedValue({ id: "pyr_credit", payment_intent: "pi_original", amount: 6997, currency: "eur", status: "succeeded", metadata: { rental_basis_id: "invoice" } });
  expect((await creditRefund(f.service, "invoice", "admin", false, true, true)).amount_cents).toBe(6997);
  const result = await creditRefund(f.service, "invoice", "admin", true, true, true);
  expect(result.status).toBe("succeeded");
  expect(f.service.rpc).toHaveBeenCalledWith("sync_rental_order_refund", expect.objectContaining({ _basis: "invoice", _amount: 6997, _refund_id: "pyr_credit" }));
  await creditRefund(f.service, "invoice", "admin", true, true, true);
  expect(stripe.refunds.create).toHaveBeenCalledTimes(1);
  expect(f.claim().basis_id).toBe("invoice");
  expect(f.invoice.paid_amount).toBe(377.23);
});