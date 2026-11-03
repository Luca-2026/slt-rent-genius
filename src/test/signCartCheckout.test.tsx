import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { RentalRequestCart, RentalCartButton } from "@/components/rental/RentalRequestCart";

const { config, invoke } = vi.hoisted(() => ({
  config: { enabled: true, standardGrossCents: 3900, standardRentalTiers: [{ fromDays: 1, grossCents: 3900, extraDayGrossCents: 0 }, { fromDays: 11, grossCents: 5500, extraDayGrossCents: 1000 }, { fromDays: 14, grossCents: 8500, extraDayGrossCents: 500 }, { fromDays: 22, grossCents: 12000, extraDayGrossCents: 200 }, { fromDays: 40, grossCents: 15500, extraDayGrossCents: 100 }], sorglosGrossCents: 19900, depositCents: 10000, maxRentalDays: 100 },
  invoke: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke } } }));
vi.mock("@/hooks/useManagedProducts", () => { const data: never[] = []; return { useManagedProducts: () => ({ data }) }; });
vi.mock("@/hooks/usePublicCoupon", () => ({ usePublicCoupon: () => ({ valid: true, eligibleSlugs: [] }) }));
vi.mock("@/components/rental/SignPackageSelection", () => ({ useSignBookingConfig: () => ({ data: config }), SignPackageSelection: () => null }));
vi.mock("@/components/rental/useSignSetupQuote", () => ({ useSignSetupQuote: () => ({ key: "", cents: null, loading: false }) }));

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  localStorage.clear();
  localStorage.setItem("slt-customer-type", "private");
  localStorage.setItem("slt-sign-booking-receipt", "previous-reservation");
  invoke.mockImplementation((_name, { body }) => Promise.resolve({ data: body.action === "config" ? { config, additionalSigns: [] } : body.action === "info" ? { status: "reserved", order_code: "OLD123", amount_cents: 15400, expires_at: "2026-12-01T12:00:00Z", payment_url: null, bank: { holder: "SLT", iban: "", bic: "", reference: "Auftrag OLD123" } } : { lines: [{ id: "new-sign", rental_net: 104.20, deposit: 100, addons: [], options: [] }] } }));
});
afterEach(() => { const close = screen.queryByRole("button", { name: "Close" }); if (close) fireEvent.click(close); cleanup(); invoke.mockClear(); });

function mount() {
  render(<MemoryRouter><RentalCartButton /><RentalRequestCart /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: /Mietanfrage-Warenkorb/ }));
}

describe("Neue Schildermiete und frühere Reservierung bleiben getrennt", () => {
  it("zeigt für 24 Tage durchgehend 124,00 € Miete plus 100 € Kaution statt des alten 154-Euro-Belegs", async () => {
    localStorage.setItem("slt.rental-cart.v1", JSON.stringify({ version: 1, expiresAt: Date.now() + 890000, requestId: "11111111-1111-4111-8111-111111111111", items: [{ id: "new-sign", product_slug: "halteverbotsschilder-set", product_name: "Halteverbotsschilder-Set", location: "krefeld", quantity: 1, start_date: "2026-11-09", start_time: "08:00", end_date: "2026-12-02", end_time: "16:00", selected_addons: [], use_saturday: false, use_sunday: false, sign_package: "standard" }] }));
    mount();
    await waitFor(() => expect(screen.getByRole("button", { name: "Weiter zur Buchung" })).not.toBeDisabled());
    expect(within(screen.getByRole("dialog")).getAllByText("124,00 €", { exact: false }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Weiter zur Buchung" }));
    await screen.findByText(/Jetzt zu zahlen: 224,00/);
    expect(screen.getByText(/Miete inkl. USt.: 124,00/)).toBeInTheDocument();
    expect(invoke.mock.calls.some(([, options]) => options.body.action === "info")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Zurück zum Warenkorb" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weiter zur Buchung" })).toBeInTheDocument();
    expect(localStorage.getItem("slt-sign-booking-receipt")).toBe("previous-reservation");
  });

  it("kehrt vom alten Zahlungsbeleg in den offenen leeren Warenkorb zurück und hält ihn erreichbar", async () => {
    mount();
    await screen.findByText(/Gesamt inkl. Kaution: 154,00/);
    fireEvent.click(screen.getByRole("button", { name: "Zurück zum Warenkorb" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Dein Anfrage-Warenkorb ist leer.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zur reservierten Schilderbuchung" }));
    await screen.findByText(/Gesamt inkl. Kaution: 154,00/);
    expect(localStorage.getItem("slt-sign-booking-receipt")).toBe("previous-reservation");
  });
});