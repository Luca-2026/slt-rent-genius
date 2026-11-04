import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CustomerDocuments } from "./CustomerDocuments";
const mocks = vi.hoisted(() => ({ load: vi.fn(), open: vi.fn(), toast: vi.fn() }));
vi.mock("./customerDocuments", () => ({ loadCustomerDocuments: mocks.load, openCustomerDocument: mocks.open }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); mocks.open.mockResolvedValue(undefined); });
describe("document clicks in customer dossier", () => {
  it("opens the selected saved PDF without opening an inquiry editor", async () => {
    const document = { id: "sales-ab", label: "Auftragsbestätigung AB-V1 · Verkauf", date: null, url: "sales-ab.pdf" };
    mocks.load.mockResolvedValue([document]);
    render(<CustomerDocuments customerId="crm1" profileId="profile1" />);
    fireEvent.click(await screen.findByRole("button", { name: /Auftragsbestätigung AB-V1/ }));
    await waitFor(() => expect(mocks.open).toHaveBeenCalledWith(document));
    expect(mocks.load).toHaveBeenCalledWith("crm1", "profile1");
  });
  it("reports opening failures and allows another click", async () => {
    mocks.load.mockResolvedValue([{ id: "1", label: "Rechnung R1", date: null, url: "invoice.pdf" }]);
    mocks.open.mockRejectedValue(new Error("unavailable"));
    render(<CustomerDocuments customerId="crm1" />);
    const button = await screen.findByRole("button", { name: /Rechnung R1/ });
    fireEvent.click(button);
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledOnce());
    expect(button).toBeEnabled();
  });
});