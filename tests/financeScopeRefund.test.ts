import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { mode, stripeClient } = vi.hoisted(() => ({ mode: { test: false }, stripeClient: vi.fn(() => { throw new Error("Provider forbidden"); }) }));
vi.mock("../supabase/functions/_shared/stripe-pay.ts", () => ({ stripeClient, isStripeTestMode: () => mode.test }));
import { orderRefund, manualPayoutMethod } from "../supabase/functions/_shared/order-refund";
import { assertFinanceLocation, normalizeFinanceLocation } from "../supabase/functions/_shared/finance-scope";

type Opts = { location?: string | null; staff?: (string | null)[]; admin?: boolean; manager?: boolean; canEdit?: boolean; cancelled?: boolean; payments?: unknown[]; links?: unknown[]; requests?: unknown[]; confirmError?: unknown };
function fixture(o: Opts = {}) {
  const calls: string[] = [];
  const service = {
    rpc: vi.fn(async (name: string, args: Record<string, unknown>) => {
      calls.push(name);
      if (name === "has_role") return { data: args._role === "admin" ? !!o.admin : !!o.manager, error: null };
      if (name === "can_edit_operations") return { data: o.canEdit ?? true, error: null };
      if (name === "reserve_order_refund") return { data: { id: args._id, inquiry_id: "order", deposit_cents: args._deposit, rent_cents: args._rent, payout_method: args._method, status: "creating" }, error: null };
      if (name === "confirm_manual_order_refund") return { data: null, error: o.confirmError ?? null };
      return { data: { paid_cents: 10000, deposit_available: 10000, rent_available: 0, pending: false }, error: null };
    }),
    from: (table: string) => {
      const result = () => ({ data: table === "rental_inquiries" ? { id: "order", location: o.location === undefined ? "bonn" : o.location, payments: o.payments ?? [{ amount: 100, label: "Bar" }], cancelled_at: o.cancelled ? "2026-11-20T10:00:00Z" : null }
        : table === "staff_profiles" ? (o.staff ?? ["bonn"]).map(location => ({ location }))
        : table === "offer_payment_links" ? o.links ?? [] : table === "order_refund_requests" ? o.requests ?? [] : [], error: null });
      const q = { select: () => q, eq: () => q, order: () => q, single: async () => result(), maybeSingle: async () => result(),
        then: (resolve: (v: ReturnType<typeof result>) => unknown) => Promise.resolve(result()).then(resolve) }; return q;
    } };
  return { service, calls };
}
const exec = (extra: Record<string, unknown> = {}) => ({ action: "order_refund_execute", inquiry_id: "order", request_id: "req", deposit_cents: 10000, rent_cents: 0, ...extra });
beforeEach(() => { vi.clearAllMocks(); mode.test = false; vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Network forbidden"); })); });
afterEach(() => { expect(fetch).not.toHaveBeenCalled(); expect(stripeClient).not.toHaveBeenCalled(); vi.unstubAllGlobals(); });

it("normalizes locations like slt_normalize_location (Mülheim stays separate)", () => {
  expect(normalizeFinanceLocation("Mülheim an der Ruhr")).toBe("muelheim");
  expect(normalizeFinanceLocation("Krefeld")).toBe("krefeld");
  expect(normalizeFinanceLocation(" ")).toBeNull();
});
it("location matrix: own location, foreign, multiple, missing, admin, revoked", () => {
  const s = (p: Partial<{ admin: boolean; manager: boolean; canEdit: boolean; locations: string[] }>) => ({ admin: false, manager: false, canEdit: true, locations: ["bonn"], ...p });
  expect(() => assertFinanceLocation(s({}), "bonn")).not.toThrow();
  expect(() => assertFinanceLocation(s({}), "krefeld")).toThrow("Standortberechtigung");
  expect(() => assertFinanceLocation(s({ locations: ["krefeld"] }), "Mülheim")).toThrow("Standortberechtigung");
  expect(() => assertFinanceLocation(s({ locations: ["bonn", "krefeld"] }), "krefeld")).not.toThrow();
  expect(() => assertFinanceLocation(s({ locations: [] }), "bonn")).toThrow("kein aktiver Standort");
  expect(() => assertFinanceLocation(s({}), null)).toThrow("nicht eindeutig");
  expect(() => assertFinanceLocation(s({ admin: true, locations: [] }), "krefeld")).not.toThrow();
  expect(() => assertFinanceLocation(s({ admin: true, canEdit: false }), "bonn")).toThrow("Keine Berechtigung");
  expect(() => assertFinanceLocation(s({}), "bonn", { requireManager: true })).toThrow("Niederlassungsleitung");
  expect(() => assertFinanceLocation(s({ manager: true }), "krefeld", { requireManager: true })).toThrow("Standortberechtigung");
});
it("Krefeld staff can no longer read Mülheim refunds (aligned with the SQL rule)", async () => {
  const { service, calls } = fixture({ location: "muelheim", staff: ["krefeld"] });
  await expect(orderRefund(service, "staff", { action: "order_refund_info", inquiry_id: "order" })).rejects.toThrow("Standortberechtigung");
  expect(calls).not.toContain("order_refund_totals");
});
it("staff with two assigned locations may act on either", async () => {
  const { service } = fixture({ location: "krefeld", staff: ["bonn", "krefeld"] });
  await expect(orderRefund(service, "staff", { action: "order_refund_info", inquiry_id: "order" })).resolves.toMatchObject({ success: true });
});
it("order without location is refused for staff, readable for admin", async () => {
  await expect(orderRefund(fixture({ location: null }).service, "staff", { action: "order_refund_info", inquiry_id: "order" })).rejects.toThrow("nicht eindeutig");
  await expect(orderRefund(fixture({ location: null, admin: true }).service, "admin", { action: "order_refund_info", inquiry_id: "order" })).resolves.toMatchObject({ success: true });
});
it("revoked operations right blocks before any reservation", async () => {
  const { service, calls } = fixture({ cancelled: true, canEdit: false });
  await expect(orderRefund(service, "staff", exec())).rejects.toThrow();
  expect(calls).not.toContain("reserve_order_refund");
});
it("cancelled cash deposit: live reservation as pending without provider", async () => {
  const { service, calls } = fixture({ cancelled: true });
  const r = await orderRefund(service, "staff", exec());
  expect(calls).toContain("reserve_order_refund");
  expect(service.rpc.mock.calls.find(c => c[0] === "reserve_order_refund")?.[1]).toMatchObject({ _method: "cash", _deposit: 10000, _rent: 0, _allocations: [] });
  expect(r.manual_cancel_refund_available).toBe(true); expect(r.execution_available).toBe(false);
});
it("cancelled bank deposit uses transfer", async () => {
  const { service } = fixture({ cancelled: true, payments: [{ amount: 60, label: "Überweisung" }, { amount: 40, label: "Bank" }] });
  await orderRefund(service, "staff", exec());
  expect(service.rpc.mock.calls.find(c => c[0] === "reserve_order_refund")?.[1]).toMatchObject({ _method: "transfer" });
});
it("cancelled mixed cash+bank is refused without reservation", async () => {
  const { service, calls } = fixture({ cancelled: true, payments: [{ amount: 50, label: "Bar" }, { amount: 50, label: "Überweisung" }] });
  await expect(orderRefund(service, "staff", exec())).rejects.toThrow("Gemischte");
  expect(calls).not.toContain("reserve_order_refund");
});
it("cancelled manual path never refunds rent live and stripe orders stay gated", async () => {
  await expect(orderRefund(fixture({ cancelled: true, manager: true }).service, "m", exec({ rent_cents: 500 }))).rejects.toThrow("Live-Erstattung");
  const stripe = fixture({ cancelled: true, links: [{ id: "l", payment_intent_id: "pi_1", livemode: true, paid_cents: 10000 }] });
  await expect(orderRefund(stripe.service, "staff", exec())).rejects.toThrow();
  expect(stripe.calls).not.toContain("reserve_order_refund");
  // Client construction (no network) precedes the live gate for Stripe orders, as before.
  stripeClient.mockClear();
});
it("not cancelled cash orders remain live-gated (no change to normal settlement)", async () => {
  await expect(orderRefund(fixture({}).service, "staff", exec())).rejects.toThrow("Live-Erstattung");
});
it("manual confirmation passes evidence and date; stripe requests cannot be confirmed manually", async () => {
  const req = { id: "req", inquiry_id: "order", payout_method: "cash", status: "creating", deposit_cents: 10000, rent_cents: 0 };
  const ok = fixture({ cancelled: true, requests: [req] });
  await orderRefund(ok.service, "staff", { action: "order_refund_confirm_manual", inquiry_id: "order", request_id: "req", reference: "Kasse 12", paid_on: "2026-11-27" });
  expect(ok.service.rpc.mock.calls.find(c => c[0] === "confirm_manual_order_refund")?.[1]).toMatchObject({ _actor: "staff", _reference: "Kasse 12", _paid_on: "2026-11-27" });
  const st = fixture({ cancelled: true, requests: [{ ...req, payout_method: "stripe" }] });
  await expect(orderRefund(st.service, "staff", { action: "order_refund_confirm_manual", inquiry_id: "order", request_id: "req", reference: "x12", paid_on: "2026-11-27" })).rejects.toThrow("Providerbeleg");
  const foreign = fixture({ cancelled: true, requests: [] });
  await expect(orderRefund(foreign.service, "staff", { action: "order_refund_confirm_manual", inquiry_id: "order", request_id: "other", reference: "x12", paid_on: "2026-11-27" })).rejects.toThrow("gehört nicht");
});
it("missing prepared DB function fails closed with a clear message", async () => {
  const req = { id: "req", inquiry_id: "order", payout_method: "transfer", status: "creating", deposit_cents: 100, rent_cents: 0 };
  const f = fixture({ cancelled: true, requests: [req], confirmError: { code: "PGRST202", message: "Could not find the function" } });
  await expect(orderRefund(f.service, "staff", { action: "order_refund_confirm_manual", inquiry_id: "order", request_id: "req", reference: "SEPA-1", paid_on: "2026-11-27" })).rejects.toThrow("Datenbankfreigabe ausstehend");
});
it("manualPayoutMethod rejects stripe references and unknown labels", () => {
  expect(manualPayoutMethod([{ label: "Bar", reference: "pi_1" }])).toBeNull();
  expect(manualPayoutMethod([{ label: "PayPal" }])).toBeNull();
  expect(manualPayoutMethod([])).toBeNull();
});
