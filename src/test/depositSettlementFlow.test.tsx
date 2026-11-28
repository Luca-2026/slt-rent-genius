import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DepositSettlementCard } from "@/components/b2b/inquiries/DepositSettlementCard";

const { rpc, invoke, toast, state } = vi.hoisted(() => ({ rpc: vi.fn(), invoke: vi.fn(), toast: vi.fn(),
  state: { saved: null as Record<string, unknown> | null, refunds: [] as Record<string, unknown>[] } }));
vi.mock("@/lib/invokeWithAuth", () => ({ invokeWithAuth: invoke }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/b2b/inquiries/RentalCreditRefund", () => ({ RentalCreditRefund: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc, from: (table: string) => {
  const result = () => ({ data: table === "deposit_settlements" ? state.saved : table === "offer_payment_links"
    ? [{ id: "link", status: "paid", deposit_cents: 10000, paid_cents: 21900 }]
    : table === "deposit_refunds" ? state.refunds : [], error: null });
  const q = { select: () => q, eq: () => q, in: () => q, not: () => q, gt: () => q, order: () => q,
    single: async () => result(), maybeSingle: async () => result(),
    then: (resolve: (v: ReturnType<typeof result>) => unknown) => Promise.resolve(result()).then(resolve) };
  return q;
} } }));
const inquiry = { id: "isolated-order", order_code: "TEST01", offer_total_gross: 119, offer_payload: { deposit: 100 },
  payments: [{ amount: 219, label: "Stripe", reference: "pi_isolated" }] };
const saved = { id: "saved-request", rental_inquiry_id: inquiry.id, balance: 100, paid_amount: 219, rent_amount: 119,
  deposit_held: 100, deductions: [], settled_at: "2026-11-28T10:00:00Z", payout_method: "stripe", payout_status: "pending" };
beforeEach(() => {
  vi.clearAllMocks(); state.saved = { ...saved }; state.refunds = [];
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Network forbidden in financial fixture"); }));
  vi.spyOn(window, "confirm").mockReturnValue(true);
  rpc.mockResolvedValue({ error: null });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function open(canMarkStripePayout = true) {
  render(<DepositSettlementCard inquiry={inquiry} staffName="Isolated staff" canMarkStripePayout={canMarkStripePayout} onDone={vi.fn()} showRentalRefunds={false} />);
}
it("executes the full remaining deposit only after reconciliation and marks paid only on succeeded evidence", async () => {
  invoke.mockResolvedValueOnce({ data: { success: true } }).mockResolvedValueOnce({ data: { success: true, status: "succeeded" } });
  open(); fireEvent.click(await screen.findByRole("button", { name: "Kaution erstatten" }));
  await waitFor(() => expect(rpc).toHaveBeenCalledWith("mark_deposit_payout_done", { _settlement_id: "saved-request" }));
  expect(invoke).toHaveBeenNthCalledWith(1, "offer-payment-admin", { action: "sync_deposit_refunds", inquiry_id: inquiry.id });
  expect(invoke).toHaveBeenNthCalledWith(2, "offer-payment-admin", expect.objectContaining({ action: "refund_deposit", link_id: "link", amount_cents: 10000, request_id: "saved-request" }));
  expect(fetch).not.toHaveBeenCalled();
});
it.each(["pending", "failed"])("never marks a %s provider result as paid", async (status) => {
  invoke.mockResolvedValueOnce({ data: { success: true } }).mockResolvedValueOnce({ data: { success: status !== "failed", status } });
  open(); fireEvent.click(await screen.findByRole("button", { name: "Kaution erstatten" }));
  await waitFor(() => expect(toast).toHaveBeenCalled());
  expect(rpc).not.toHaveBeenCalled();
  expect(state.saved?.payout_status).toBe("pending");
});
it("refuses execution when reconciliation fails", async () => {
  invoke.mockResolvedValue({ data: { success: false, error: "Not verified" } });
  open(); fireEvent.click(await screen.findByRole("button", { name: "Kaution erstatten" }));
  await waitFor(() => expect(toast).toHaveBeenCalled());
  expect(invoke).toHaveBeenCalledTimes(1); expect(rpc).not.toHaveBeenCalled();
});
it("never reports successful settlement completion when the protected completion RPC rejects the evidence", async () => {
  invoke.mockResolvedValueOnce({ data: { success: true } }).mockResolvedValueOnce({ data: { success: true, status: "succeeded" } });
  rpc.mockResolvedValue({ error: { message: "Provider evidence does not cover balance" } });
  open(); fireEvent.click(await screen.findByRole("button", { name: "Kaution erstatten" }));
  await waitFor(() => expect(toast).toHaveBeenCalled());
  expect(toast).toHaveBeenCalledTimes(1);
  expect(toast).toHaveBeenLastCalledWith(expect.objectContaining({ variant: "destructive" }));
  expect(state.saved?.payout_status).toBe("pending");
});
it("resumes a durable partial 40-euro request without creating another request or paying the full 100 euros", async () => {
  state.refunds = [{ link_id: "link", amount_cents: 4000, status: "creating", request_id: "partial-request" }];
  invoke.mockResolvedValueOnce({ data: { success: true } }).mockResolvedValueOnce({ data: { success: true, status: "pending" } });
  open(); fireEvent.click(await screen.findByRole("button", { name: "Erstattungsstatus abgleichen" }));
  await waitFor(() => expect(invoke).toHaveBeenCalledTimes(2));
  expect(invoke).toHaveBeenLastCalledWith("offer-payment-admin", expect.objectContaining({ action: "refund_deposit", amount_cents: 4000, request_id: "partial-request" }));
  expect(rpc).not.toHaveBeenCalled();
  await waitFor(() => expect(toast).toHaveBeenCalled());
  // Financial amount must describe the actual durable claim, not the full settlement.
  expect(toast.mock.calls[0][0].description).toContain("40,00");
  expect(toast.mock.calls[0][0].description).not.toContain("100,00");
});
it("does not execute again when reconciliation already confirms full repayment", async () => {
  invoke.mockImplementation(async () => { state.saved = { ...saved, payout_status: "paid" }; return { data: { success: true } }; });
  open(); fireEvent.click(await screen.findByRole("button", { name: "Kaution erstatten" }));
  await waitFor(() => expect(toast).toHaveBeenCalled());
  expect(invoke).toHaveBeenCalledTimes(1); expect(rpc).not.toHaveBeenCalled();
});
it("does not expose the payout action to an ineligible employee", async () => {
  open(false); await screen.findByTestId("deposit-settlement");
  expect(screen.queryByRole("button", { name: "Kaution erstatten" })).toBeNull();
  expect(invoke).not.toHaveBeenCalled(); expect(rpc).not.toHaveBeenCalled();
});
it("keeps a second click disabled while the first provider reconciliation is unresolved", async () => {
  let release: ((value: unknown) => void) | undefined;
  invoke.mockImplementation(() => new Promise(resolve => { release = resolve; }));
  open(); const button = await screen.findByRole("button", { name: "Kaution erstatten" });
  fireEvent.click(button); fireEvent.click(button);
  expect(button).toBeDisabled(); expect(invoke).toHaveBeenCalledTimes(1);
  release?.({ data: { success: false } });
  await waitFor(() => expect(screen.getByRole("button", { name: "Kaution erstatten" })).toBeEnabled());
});