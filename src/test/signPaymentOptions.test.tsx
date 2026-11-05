import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SignPaymentOptions } from "@/components/rental/SignPaymentOptions";
const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke } } }));
describe("sign payment selection", () => {
  it("saves the bank decision and reloads the authoritative receipt", async () => {
    invoke.mockResolvedValue({ data: { status: "active" }, error: null });
    const changed = vi.fn().mockResolvedValue(undefined);
    render(<SignPaymentOptions paymentUrl="https://www.slt-rental.de/zahlung/abcdefghijklmnopqrstuv" selected="regular" onChanged={changed} />);
    fireEvent.click(screen.getByRole("radio", { name: "Überweisung · 3 % Rabatt" }));
    await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
    expect(invoke).toHaveBeenCalledWith("offer-pay", { body: { action: "select_method", token: "abcdefghijklmnopqrstuv", method: "bank" } });
  });
  it("never reloads a rejected payment choice as if it succeeded", async () => {
    invoke.mockResolvedValue({ data: { error: "Online-Zahlung muss zuerst abgeglichen werden" }, error: null });
    const changed = vi.fn();
    render(<SignPaymentOptions paymentUrl="https://www.slt-rental.de/zahlung/abcdefghijklmnopqrstuv" selected="regular" onChanged={changed} />);
    fireEvent.click(screen.getByRole("radio", { name: "Überweisung · 3 % Rabatt" }));
    await screen.findByRole("alert");
    expect(changed).not.toHaveBeenCalled();
  });
});