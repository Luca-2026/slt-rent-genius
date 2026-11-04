import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Customers from "@/pages/b2b/Customers";

const state = vi.hoisted(() => ({ staff: true, customer: { id: "crm-123", first_name: "Test", last_name: "Kunde", customer_type: "private", created_at: "2026-11-04", b2b_profile_id: null } }));
vi.mock("@/hooks/useStaffAccess", () => ({ useStaffAccess: () => ({ isStaff: state.staff, isAdmin: false, isBranchManager: false, loading: false }) }));
vi.mock("@/hooks/useCrmCustomers", () => ({ useCrmCustomers: () => ({ rows: [state.customer], loading: false, save: vi.fn(), remove: vi.fn(), reload: vi.fn() }), crmCustomerLabel: () => "Test Kunde" }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ select: () => ({ not: () => Promise.resolve({ data: [] }), then: (resolve: (x: unknown) => unknown) => Promise.resolve({ data: [] }).then(resolve) }) }) } }));
vi.mock("@/components/b2b/B2BPortalLayout", () => ({ B2BPortalLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/b2b/customers/CustomerOverviewDialog", () => ({ CustomerOverviewDialog: ({ open, customer }: { open: boolean; customer: { id: string } }) => open ? <div role="dialog" aria-label="Kundenakte">{customer.id}</div> : null }));
vi.mock("@/components/b2b/customers/CustomerFormDialog", () => ({ CustomerFormDialog: ({ open }: { open: boolean }) => open ? <div role="dialog" aria-label="Bearbeiten" /> : null }));
vi.mock("@/components/b2b/customers/B2BOnboardingDialog", () => ({ B2BOnboardingDialog: () => null }));
vi.mock("@/components/b2b/admin/AdminCustomerDetailDialog", () => ({ AdminCustomerDetailDialog: () => null }));
vi.mock("@/components/b2b/admin/AdminCustomerEditDialog", () => ({ AdminCustomerEditDialog: () => null }));
vi.mock("@/components/b2b/DeclineCreditLimitButton", () => ({ DeclineCreditLimitButton: () => null }));
vi.mock("@/components/b2b/GrantCreditLimitButton", () => ({ GrantCreditLimitButton: () => null }));

beforeEach(() => { state.staff = true; });
afterEach(cleanup);
describe("customer dossier navigation", () => {
  it("opens the linked dossier even when the list filter hides the customer", async () => {
    render(<MemoryRouter initialEntries={["/b2b/kundendaten?kunde=crm-123&aktion=ansehen&kunden=business"]}><Customers /></MemoryRouter>);
    expect(await screen.findByRole("dialog", { name: "Kundenakte" })).toHaveTextContent("crm-123");
    expect(screen.queryByRole("dialog", { name: "Bearbeiten" })).toBeNull();
  });
  it("preserves the existing explicit editing flow", async () => {
    render(<MemoryRouter initialEntries={["/b2b/kundendaten?kunde=crm-123&aktion=bearbeiten"]}><Customers /></MemoryRouter>);
    expect(await screen.findByRole("dialog", { name: "Bearbeiten" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Kundenakte" })).toBeNull();
  });
  it("does not open a dossier without staff access", () => {
    state.staff = false;
    render(<MemoryRouter initialEntries={["/b2b/kundendaten?kunde=crm-123&aktion=ansehen"]}><Customers /></MemoryRouter>);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});