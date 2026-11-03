import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { RentalRequestCart, RentalCartButton } from "@/components/rental/RentalRequestCart";

const invoke = vi.hoisted(() => vi.fn(() => new Promise(() => {})));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke }, from: () => ({ select: () => ({ eq: () => new Promise(() => {}) }) }) } }));
// Products still loading: the hook returns no data on every render.
vi.mock("@/hooks/useManagedProducts", () => ({ useManagedProducts: () => ({ data: undefined }) }));
vi.mock("@/hooks/usePublicCoupon", () => ({ usePublicCoupon: () => ({ valid: true, eligibleSlugs: [] }) }));
vi.mock("@/components/rental/SignPackageSelection", () => ({ useSignBookingConfig: () => ({ data: null }), SignPackageSelection: () => null }));
vi.mock("@/components/rental/useSignSetupQuote", () => ({ useSignSetupQuote: () => ({ key: "", cents: null, loading: false }) }));

beforeEach(() => { vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} }); localStorage.clear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("bleibt beim Laden der Artikel ohne Endlosschleife bedienbar", () => {
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  render(<MemoryRouter><RentalCartButton /><RentalRequestCart /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: /Mietanfrage-Warenkorb/ }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(errors.mock.calls.some(call => String(call[0]).includes("Maximum update depth"))).toBe(false);
});
