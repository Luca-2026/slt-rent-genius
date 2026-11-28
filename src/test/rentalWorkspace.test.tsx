import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { InquiryDetailPanel } from "@/components/b2b/inquiries/InquiryDetailPanel";
import { INQUIRY_STATUSES } from "@/lib/inquiryStatus";

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "staff" }, isAdmin: false }) }));
vi.mock("@/hooks/useStaffAccess", () => ({ useStaffAccess: () => ({ isStaff: true, isBranchManager: false, canManageInventory: true }) }));
const { refundInfo, payoutEditor } = vi.hoisted(() => ({ refundInfo: vi.fn(), payoutEditor: vi.fn() }));
vi.mock("@/lib/invokeWithAuth", () => ({ invokeWithAuth: refundInfo }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => {
  const result = { data: [], error: null };
  const q = { select: () => q, eq: () => q, in: () => q, order: () => q, limit: () => q,
    maybeSingle: async () => ({ data: null, error: null }),
    then: (resolve: (v: typeof result) => unknown) => Promise.resolve(result).then(resolve) };
  return q;
} } }));
vi.mock("@/components/b2b/inquiries/useInquiryActions", () => ({ useInquiryActions: () => ({ busy: false, actorName: "Staff", claim: vi.fn(), release: vi.fn(), setStatus: vi.fn(), saveNotes: vi.fn(), update: vi.fn() }) }));
vi.mock("@/components/b2b/inquiries/useDepositState", () => ({ useDepositState: () => ({ loaded: true, settled: false, chargeLines: [], reload: vi.fn() }), depositBlocksInvoice: () => false, paymentsUpToRent: (p: unknown) => p }));
vi.mock("@/components/b2b/inquiries/offerDraftStorage", () => ({ inquiryDraftKey: () => "draft", readInquiryDraft: () => null, listServerDraftsForInquiry: () => Promise.resolve([]) }));
vi.mock("@/components/b2b/inquiries/InquiryOfferForm", () => ({ InquiryOfferForm: ({ mode, onSent }: { mode: string; onSent: () => void }) => <div><input aria-label="Arbeitsentwurf" defaultValue="Unverändert" /><span>Modus {mode}</span><button onClick={onSent}>Erfolgreich abschließen</button></div> }));
vi.mock("@/components/b2b/inquiries/OrderConfirmationCard", () => ({ OrderConfirmationCard: ({ onDone }: { onDone: () => void }) => <button onClick={onDone}>AB erfolgreich senden</button> }));
vi.mock("@/components/b2b/inquiries/InquiryCustomerCard", () => ({ InquiryCustomerCard: () => null }));
vi.mock("@/components/b2b/inquiries/InquiryLocationSection", () => ({ InquiryLocationSection: () => null }));
vi.mock("@/components/b2b/inquiries/InquiryPaymentsCard", () => ({ InquiryPaymentsCard: () => null, parseInquiryPayments: () => [] }));
vi.mock("@/components/b2b/inquiries/StripePaymentCard", () => ({ StripePaymentCard: (props: unknown) => { payoutEditor(props); return null; } }));
vi.mock("@/components/b2b/inquiries/InstallmentCard", () => ({ InstallmentCard: () => null }));
vi.mock("@/components/b2b/inquiries/OfferAcceptanceNotice", () => ({ OfferAcceptanceNotice: () => null }));
vi.mock("@/components/b2b/inquiries/OfferDecisionHistory", () => ({ OfferDecisionHistory: () => null }));
vi.mock("@/components/b2b/inquiries/ReturnChargesSummary", () => ({ ReturnChargesSummary: () => null }));
vi.mock("@/components/b2b/inquiries/RejectInquiryDialog", () => ({ RejectInquiryDialog: () => null }));
vi.mock("@/components/b2b/inquiries/OnSiteOfferSignDialog", () => ({ OnSiteOfferSignDialog: () => null }));
const depositEditor = vi.fn();
vi.mock("@/components/b2b/inquiries/DepositSettlementCard", () => ({ DepositSettlementCard: (props: unknown) => { depositEditor(props); return null; } }));

beforeAll(() => { Element.prototype.scrollIntoView = vi.fn(); });
afterEach(cleanup);
const inquiry = { id: "workspace-test", status: "accepted", location: "bonn", assigned_to: "staff", assigned_name: "Staff", internal_notes: null, offer_number: "ANG-TEST", offer_file_url: null, offer_total_gross: 119, offer_sent_at: null };
function openWorkspace() {
  render(<MemoryRouter><InquiryDetailPanel layout="page" table="rental_inquiries" inquiryType="rental" inquiry={inquiry} defaultItems={[{ product_name: "Bagger", quantity: 1, duration: 1, unit_price: 100, discount_percent: 0 }]} details={null} onChanged={vi.fn()} /></MemoryRouter>);
}
describe("rental document workspace", () => {
  it.each(INQUIRY_STATUSES)("allows invoicing in phase %s even without an offer", (status) => {
    render(<MemoryRouter><InquiryDetailPanel layout="page" table="rental_inquiries" inquiryType="rental" inquiry={{ ...inquiry, id: `invoice-${status}`, status, offer_number: null }} defaultItems={[]} details={null} onChanged={vi.fn()} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Rechnung erstellen" }));
    expect(screen.getByText("Modus invoice")).toBeVisible();
  });
  it.each(INQUIRY_STATUSES)("allows location staff to open deposit refunds in phase %s without an offer", async (status) => {
    depositEditor.mockClear();
    payoutEditor.mockClear();
    // Actual central refund route requires a successfully read payment balance;
    // combined execution stays disabled, as in production. No endpoint is used.
    refundInfo.mockResolvedValue({ data: { success: true, execution_available: false, paid_cents: 10000,
      deposit_available: 10000, rent_available: 0, deposit_used: 0, rent_used: 0,
      pending: false, can_refund_rent: false, requests: [] }, error: null });
    const paidInquiry = { ...inquiry, id: `deposit-${status}`, status, offer_number: null, offer_total_gross: 0,
      payments: [{ amount: 100, label: "Stripe", reference: "pi_isolated" }], offer_payload: { deposit: 100 } };
    render(<MemoryRouter><InquiryDetailPanel layout="page" table="rental_inquiries" inquiryType="rental" inquiry={paidInquiry} defaultItems={[]} details={null} onChanged={vi.fn()} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "Erstattung bearbeiten" }));
    expect(await screen.findByRole("dialog")).toBeVisible();
    expect(refundInfo).toHaveBeenCalledWith("offer-payment-admin", { action: "order_refund_info", inquiry_id: `deposit-${status}` });
    if (status === "cancelled") {
      // Cancellation deliberately uses the original-payment route, not settlement
      // against the cancelled rent. Assert that route rather than weakening the test.
      expect(payoutEditor).toHaveBeenCalledWith(expect.objectContaining({ cancelled: true, inquiryId: `deposit-${status}`, deposit: 100 }));
      expect(depositEditor).not.toHaveBeenCalled();
    } else {
      expect(depositEditor).toHaveBeenCalledWith(expect.objectContaining({ canMarkStripePayout: true, inquiry: expect.objectContaining({ status, offer_number: null }) }));
    }
  });
  it("opens accepted order positions as an amendment and retains the chosen workspace and draft when toggled", () => {
    openWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Positionen bearbeiten" }));
    expect(screen.getByText("Modus amendment")).toBeVisible();
    fireEvent.change(screen.getByRole("textbox", { name: "Arbeitsentwurf" }), { target: { value: "Auftragsänderung" } });
    fireEvent.click(screen.getByRole("button", { name: "Dokumentbearbeitung einklappen" }));
    fireEvent.click(screen.getByRole("button", { name: "Positionen bearbeiten" }));
    expect(screen.getByRole("textbox", { name: "Arbeitsentwurf" })).toHaveValue("Auftragsänderung");
    fireEvent.click(screen.getByRole("button", { name: "Rechnung erstellen" }));
    fireEvent.click(screen.getByRole("button", { name: "Dokumentbearbeitung einklappen" }));
    fireEvent.click(screen.getByRole("button", { name: "Positionen bearbeiten" }));
    expect(screen.getByText("Modus invoice")).toBeVisible();
  });
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