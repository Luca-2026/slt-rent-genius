import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RentalCreditRefund } from "@/components/b2b/inquiries/RentalCreditRefund";
const { invoke, toast } = vi.hoisted(() => ({ invoke: vi.fn(), toast: vi.fn() }));
vi.mock("@/lib/invokeWithAuth", () => ({ invokeWithAuth: invoke }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe("rental credit information", () => {
  it("shows zero credit without offering a payout", async () => {
    invoke.mockResolvedValue({ data: { success: true, amount_cents: 0, status: "none", payout_method: "none" }, error: null });
    render(<RentalCreditRefund invoiceId="invoice" />);
    fireEvent.click(screen.getByRole("button", { name: "Mietguthaben / Erstattung" }));
    await screen.findByRole("dialog");
    expect(screen.queryByRole("button", { name: /Verbindlich|Überweisungsauftrag/ })).toBeNull();
    expect(invoke).toHaveBeenCalledWith("offer-payment-admin", { action: "rental_credit_info", invoice_id: "invoice" });
  });
  it("catches unexpected request failures and leaves the control usable", async () => {
    invoke.mockRejectedValue(new Error("network failure"));
    render(<RentalCreditRefund invoiceId="invoice" />);
    fireEvent.click(screen.getByRole("button", { name: "Mietguthaben / Erstattung" }));
    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "Mietguthaben / Erstattung" })).toBeEnabled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});