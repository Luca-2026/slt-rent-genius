import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { InstallmentCard } from "@/components/b2b/inquiries/InstallmentCard";

const invoke = vi.hoisted(() => vi.fn(async (_name: string, _body: Record<string, unknown>) => ({ data: { error: "Preview test" }, error: null })));
vi.mock("@/lib/invokeWithAuth", () => ({ invokeWithAuth: invoke }));
vi.mock("@/components/b2b/PdfPagesPreview", () => ({ PdfPagesPreview: () => null }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

it("rental and sales installments send the agreed custom three-day term and staff edits", async () => {
  const custom = "innerhalb von 3 Kalendertagen nach Rechnungsdatum";
  for (const kind of ["rental", "sales"] as const) {
    invoke.mockClear();
    const view = render(<InstallmentCard table={kind === "rental" ? "rental_inquiries" : "sales_inquiries"} inquiryType={kind} inquiry={{ id: "test", customer_kind: "business", status: "accepted", offer_number: "test", installment_open_ended: true, offer_payload: { payment_terms: "custom", payment_terms_custom: custom, items: [{ product_name: "Gerät", quantity: 1, unit_price: 100 }] } }} invoices={[]} staffName="Test" onChanged={() => {}} onFinalInvoice={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Abschlagsrechnung erstellen/ }));
    expect(screen.getByLabelText("Individuelle Zahlungsbedingungen")).toHaveValue(custom);
    fireEvent.click(screen.getByRole("button", { name: "PDF-Vorschau anzeigen" }));
    await waitFor(() => expect(invoke).toHaveBeenCalled());
    expect(invoke.mock.calls[0]?.[1]).toMatchObject({ payment_terms: "custom", payment_terms_custom: custom, preview: true });
    fireEvent.change(screen.getByLabelText("Individuelle Zahlungsbedingungen"), { target: { value: "7 Tage nach Rechnungsdatum" } });
    fireEvent.click(screen.getByRole("button", { name: "PDF-Vorschau anzeigen" }));
    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(2));
    expect(invoke.mock.calls[1]?.[1]).toMatchObject({ payment_terms_custom: "7 Tage nach Rechnungsdatum" });
    view.unmount();
  }
});