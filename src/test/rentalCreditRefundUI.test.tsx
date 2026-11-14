import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RentalCreditRefund } from "@/components/b2b/inquiries/RentalCreditRefund";
const { invoke, toast } = vi.hoisted(() => ({ invoke: vi.fn(), toast: vi.fn() }));
vi.mock("@/lib/invokeWithAuth", () => ({ invokeWithAuth: invoke }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe("rental credit information", () => {
  it("offers UHSMCV's 29.75 euro rent separately from its 100 euro deposit without an invoice id", async () => {
    const prepare = vi.fn().mockResolvedValue(true);
    invoke.mockResolvedValueOnce({ data: { success: true, amount_cents: 2975, status: "available", payout_method: "stripe" }, error: null })
      .mockResolvedValueOnce({ data: { success: true, amount_cents: 2975, status: "succeeded", payout_method: "stripe" }, error: null });
    render(<RentalCreditRefund inquiryId="cancelled-order" prepareBasis={prepare} />);
    fireEvent.click(screen.getByRole("button", { name: "Mietguthaben / Erstattung" }));
    await screen.findByRole("dialog");
    expect(screen.getByRole("heading", { name: /29,75/ })).toBeInTheDocument();
    expect(prepare).toHaveBeenCalledOnce();
    expect(invoke).toHaveBeenNthCalledWith(1, "offer-payment-admin", { action: "order_credit_info", inquiry_id: "cancelled-order" });
    fireEvent.click(screen.getByRole("button", { name: "Verbindlich auf ursprüngliche Zahlung erstatten" }));
    await waitFor(() => expect(invoke).toHaveBeenNthCalledWith(2, "offer-payment-admin", { action: "refund_order_credit", inquiry_id: "cancelled-order" }));
    expect(prepare).toHaveBeenCalledOnce();
  });
  it("does not request a refund when the cancellation basis cannot be prepared", async () => {
    render(<RentalCreditRefund inquiryId="cancelled-order" prepareBasis={vi.fn().mockResolvedValue(false)} />);
    fireEvent.click(screen.getByRole("button", { name: "Mietguthaben / Erstattung" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Mietguthaben / Erstattung" })).toBeEnabled());
    expect(invoke).not.toHaveBeenCalled();
  });
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