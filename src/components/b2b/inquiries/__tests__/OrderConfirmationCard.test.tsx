import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OrderConfirmationCard } from "../OrderConfirmationCard";

const mocks = vi.hoisted(() => ({ preview: vi.fn(), rpc: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/invokeWithAuth", () => ({ invokeWithAuth: mocks.preview }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: mocks.rpc, functions: { invoke: mocks.send } } }));
vi.mock("../OrderRevisionHistory", () => ({ OrderRevisionHistory: () => null }));
vi.mock("@/components/b2b/PdfPagesPreview", () => ({ PdfPagesPreview: () => null }));
const inquiry = {
  id: "test-inquiry", status: "accepted", offer_number: "ANG-1", order_revision: 0,
  customer_email: "test@example.com", offer_total_gross: 119,
  payments: [{ amount: 119 }], offer_payload: { totals: { grossAmount: 119 }, payment_terms: "vorkasse", items: [] },
};
function open(extra: Partial<React.ComponentProps<typeof OrderConfirmationCard>> = {}) {
  return render(<OrderConfirmationCard inquiryType="rental" inquiry={inquiry} senderName="TEST" onDone={vi.fn()} {...extra} />);
}
async function preview() {
  fireEvent.click(screen.getByRole("button", { name: "AB-Vorschau anzeigen" }));
  await screen.findByRole("dialog", { name: /Auftragsbestätigung – Vorschau/ });
  fireEvent.click(screen.getByRole("button", { name: "Zurück" }));
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: vi.fn(() => "blob:test"), revokeObjectURL: vi.fn() }));
  mocks.preview.mockResolvedValue({ data: { pdf_base64: btoa("test-pdf") }, error: null });
  mocks.rpc.mockResolvedValue({ data: { all_available: true, mode: "confirm" }, error: null });
  mocks.send.mockResolvedValue({ data: { success: true }, error: null });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe("AB preview and independent editing", () => {
  it("allows preview before payment without allowing dispatch", async () => {
    open({ inquiry: { ...inquiry, payments: [] } });
    await preview();
    expect(mocks.preview).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Auftragsbestätigung senden" })).toBeNull();
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("previews without changing the order, allocating devices or sending mail", async () => {
    open();
    expect(screen.getByRole("button", { name: "Auftragsbestätigung senden" })).toBeDisabled();
    await preview();
    expect(mocks.preview).toHaveBeenCalledWith("send-order-confirmation", expect.objectContaining({ preview: true, attach_pdf: false, expected_revision: 0 }));
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Auftragsbestätigung senden" })).toBeEnabled();
  });
  it("requires a fresh preview after changes to the AB note or payments", async () => {
    const view = open();
    await preview();
    fireEvent.change(screen.getByRole("textbox", { name: "Nachricht zur Auftragsbestätigung" }), { target: { value: "Neue Abholhinweise" } });
    expect(screen.getByRole("button", { name: "Auftragsbestätigung senden" })).toBeDisabled();
    await preview();
    view.rerender(<OrderConfirmationCard inquiryType="rental" inquiry={{ ...inquiry, payments: [{ amount: 100 }] }} senderName="TEST" onDone={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Auftragsbestätigung senden" })).toBeDisabled();
  });
  it("opens independent amendment editing without changing the accepted offer", () => {
    const onEdit = vi.fn();
    const original = JSON.stringify(inquiry);
    open({ onEdit });
    fireEvent.click(screen.getByRole("button", { name: "AB bearbeiten" }));
    expect(onEdit).toHaveBeenCalledOnce();
    expect(JSON.stringify(inquiry)).toBe(original);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("sends only after preview and the existing availability confirmation", async () => {
    open();
    await preview();
    fireEvent.click(screen.getByRole("button", { name: "Auftragsbestätigung senden" }));
    fireEvent.click(screen.getByRole("button", { name: "Jetzt senden" }));
    await waitFor(() => expect(mocks.send).toHaveBeenCalledOnce());
    expect(mocks.rpc.mock.calls.map(([name]) => name)).toEqual(["check_availability", "confirm_order"]);
    expect(mocks.send).toHaveBeenCalledWith("send-order-confirmation", expect.objectContaining({ body: expect.objectContaining({ expected_revision: 0, expected_paid_cents: 11900, expected_required_cents: 11900 }) }));
  });
});