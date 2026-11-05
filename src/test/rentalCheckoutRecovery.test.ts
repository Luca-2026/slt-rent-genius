import { describe, expect, it, vi } from "vitest";
import { reconcileRentalCheckout } from "../../supabase/functions/_shared/rental-checkout-recovery";
describe("terminal provider reconciliation", () => {
  it("does not release an unknown provider outcome", async () => {
    const rpc = vi.fn();
    const stripe = { checkout: { sessions: { retrieve: vi.fn().mockRejectedValue(new Error("timeout")) } } };
    await expect(reconcileRentalCheckout({ rpc }, stripe, { id: "link", stripe_session_id: "cs_test", checkout_claim: "claim" })).rejects.toThrow("timeout");
    expect(rpc).not.toHaveBeenCalled();
  });
  it("requires confirmed provider expiry before releasing an unpaid attempt", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true });
    const expire = vi.fn().mockResolvedValue({ status: "expired" });
    await reconcileRentalCheckout({ rpc }, { checkout: { sessions: { retrieve: vi.fn().mockResolvedValue({ status: "open" }), expire } } }, { id: "link", stripe_session_id: "cs_test", checkout_claim: "claim" });
    expect(expire).toHaveBeenCalledWith("cs_test");
    expect(rpc).toHaveBeenCalledWith("release_terminal_rental_checkout", { _link: "link", _session: "cs_test", _claim: "claim", _terminal: "expired" });
  });
  it("does not expire a completed payment and requires its recorded receipt", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: { message: "Zahlung noch nicht gebucht" } });
    const expire = vi.fn();
    await expect(reconcileRentalCheckout({ rpc }, { checkout: { sessions: { retrieve: vi.fn().mockResolvedValue({ status: "complete" }), expire } } }, { id: "link", stripe_session_id: "cs_test" })).rejects.toThrow("noch nicht gebucht");
    expect(expire).not.toHaveBeenCalled();
  });
});