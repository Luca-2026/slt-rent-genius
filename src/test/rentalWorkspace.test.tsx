import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InquiryDetailPanel } from "@/components/b2b/inquiries/InquiryDetailPanel";

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "staff" }, isAdmin: false }) }));
vi.mock("@/hooks/useStaffAccess", () => ({ useStaffAccess: () => ({ isStaff: true, isBranchManager: false }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [] }) }) }) }) } }));
vi.mock("@/components/b2b/inquiries/useInquiryActions", () => ({ useInquiryActions: () => ({ busy: false, actorName: "Staff", claim: vi.fn(), release: vi.fn(), setStatus: vi.fn(), saveNotes: vi.fn(), update: vi.fn() }) }));
vi.mock("@/components/b2b/inquiries/useDepositState", () => ({ useDepositState: () => ({ loaded: true, settled: false, chargeLines: [], reload: vi.fn() }), depositBlocksInvoice: () => false, paymentsUpToRent: (p: unknown) => p }));
vi.mock("@/components/b2b/inquiries/offerDraftStorage", () => ({ inquiryDraftKey: () => "draft", readInquiryDraft: () => null, listServerDraftsForInquiry: () => Promise.resolve([]) }));
vi.mock("@/components/b2b/inquiries/InquiryOfferForm", () => ({ InquiryOfferForm: ({ mode, onSent }: { mode: string; onSent: () => void }) => <div><input aria-label="Arbeitsentwurf" defaultValue="Unverändert" /><span>Modus {mode}</span><button onClick={onSent}>Erfolgreich abschließen</button></div> }));
vi.mock("@/components/b2b/inquiries/OrderConfirmationCard", () => ({ OrderConfirmationCard: ({ onDone }: { onDone: () => void }) => <button onClick={onDone}>AB erfolgreich senden</button> }));
vi.mock("@/components/b2b/inquiries/InquiryCustomerCard", () => ({ InquiryCustomerCard: () => null }));
vi.mock("@/components/b2b/inquiries/InquiryLocationSection", () => ({ InquiryLocationSection: () => null }));
vi.mock("@/components/b2b/inquiries/InquiryPaymentsCard", () => ({ InquiryPaymentsCard: () => null, parseInquiryPayments: () => [] }));
vi.mock("@/components/b2b/inquiries/StripePaymentCard", () => ({ StripePaymentCard: () => null }));
vi.mock("@/components/b2b/inquiries/InstallmentCard", () => ({ InstallmentCard: () => null }));
vi.mock("@/components/b2b/inquiries/OfferAcceptanceNotice", () => ({ OfferAcceptanceNotice: () => null }));
vi.mock("@/components/b2b/inquiries/OfferDecisionHistory", () => ({ OfferDecisionHistory: () => null }));
vi.mock("@/components/b2b/inquiries/ReturnChargesSummary", () => ({ ReturnChargesSummary: () => null }));
vi.mock("@/components/b2b/inquiries/RejectInquiryDialog", () => ({ RejectInquiryDialog: () => null }));
vi.mock("@/components/b2b/inquiries/OnSiteOfferSignDialog", () => ({ OnSiteOfferSignDialog: () => null }));

afterEach(cleanup);
const inquiry = { id: "workspace-test", status: "accepted", location: "bonn", assigned_to: "staff", assigned_name: "Staff", internal_notes: null, offer_number: "ANG-TEST", offer_file_url: null, offer_total_gross: 119, offer_sent_at: null };
function openWorkspace() {
  render(<MemoryRouter><InquiryDetailPanel table="rental_inquiries" inquiryType="rental" inquiry={inquiry} defaultItems={[{ product_name: "Bagger", quantity: 1, duration: 1, unit_price: 100, discount_percent: 0 }]} details={null} onChanged={vi.fn()} /></MemoryRouter>);
}
describe("rental document workspace", () => {
  it("opens only on an explicit action and retains edits across collapse/reopen", () => {
    openWorkspace();
    expect(screen.queryByRole("textbox", { name: "Arbeitsentwurf" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Neues Angebot" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Arbeitsentwurf" }), { target: { value: "Bearbeitung" } });
    fireEvent.click(screen.getByRole("button", { name: "Dokumentbearbeitung einklappen" }));
    expect(screen.queryByRole("textbox", { name: "Arbeitsentwurf" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Neues Angebot" }));
    expect(screen.getByRole("textbox", { name: "Arbeitsentwurf" })).toHaveValue("Bearbeitung");
  });
  it("closes a completed offer and can reopen for invoicing", () => {
    openWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Neues Angebot" }));
    fireEvent.click(screen.getByRole("button", { name: "Erfolgreich abschließen" }));
    expect(screen.queryByRole("textbox", { name: "Arbeitsentwurf" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Rechnung erstellen" }));
    expect(screen.getByRole("textbox", { name: "Arbeitsentwurf" })).toBeVisible();
  });
  it("keeps AB review open after an amendment and closes after sending the AB", () => {
    openWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "AB bearbeiten" }));
    fireEvent.click(screen.getByRole("button", { name: "Erfolgreich abschließen" }));
    expect(screen.getByRole("button", { name: "AB erfolgreich senden" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "AB erfolgreich senden" }));
    expect(screen.queryByRole("button", { name: "AB erfolgreich senden" })).toBeNull();
  });
});