import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { mode, stripeClient } = vi.hoisted(() => ({ mode: { test: false }, stripeClient: vi.fn(() => { throw new Error("Provider forbidden"); }) }));
vi.mock("../supabase/functions/_shared/stripe-pay.ts", () => ({ stripeClient, isStripeTestMode: () => mode.test }));
import { orderRefund } from "../supabase/functions/_shared/order-refund";
function fixture(location = "bonn", staffLocation = "bonn", admin = false, canEdit = true) {
  const service = { rpc: vi.fn(async (name: string, args: Record<string, unknown>) => ({ data: name === "has_role" ? args._role === "admin" && admin
    : name === "can_edit_operations" ? canEdit : { paid_cents: 10000, deposit_available: 10000, rent_available: 0, pending: false }, error: null })),
    from: (table: string) => {
      const result = () => ({ data: table === "rental_inquiries" ? { id: "order", location, payments: [{ amount: 100, label: "Bar" }] }
        : table === "staff_profiles" ? { location: staffLocation } : [], error: null });
      const q = { select: () => q, eq: () => q, order: () => q, single: async () => result(), maybeSingle: async () => result(),
        then: (resolve: (v: ReturnType<typeof result>) => unknown) => Promise.resolve(result()).then(resolve) }; return q;
    } };
  return service;
}
beforeEach(() => { vi.clearAllMocks(); mode.test = false; vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Network forbidden"); })); });
afterEach(() => { expect(fetch).not.toHaveBeenCalled(); expect(stripeClient).not.toHaveBeenCalled(); vi.unstubAllGlobals(); });
it("rejects Bonn staff accessing a Krefeld refund before reading provider data", async () => {
  await expect(orderRefund(fixture("krefeld", "bonn"), "staff", { action: "order_refund_info", inquiry_id: "order" })).rejects.toThrow("Standortberechtigung");
});
it("rejects users without operations eligibility, including an otherwise administrative account", async () => {
  await expect(orderRefund(fixture("bonn", "bonn", true, false), "staff", { action: "order_refund_info", inquiry_id: "order" })).rejects.toThrow("Standortberechtigung");
});
it("preserves admin access across locations without enabling live execution", async () => {
  const result = await orderRefund(fixture("krefeld", "bonn", true), "admin", { action: "order_refund_info", inquiry_id: "order" });
  expect(result.execution_available).toBe(false); expect(result.can_refund_rent).toBe(true);
});
it("keeps combined live execution blocked even for valid local staff and cash receipts", async () => {
  const service = fixture();
  await expect(orderRefund(service, "staff", { action: "order_refund_execute", inquiry_id: "order", request_id: "request", deposit_cents: 10000, rent_cents: 0 })).rejects.toThrow("Live-Erstattung noch nicht freigegeben");
  expect(service.rpc.mock.calls.map(c => c[0])).not.toContain("reserve_order_refund");
});