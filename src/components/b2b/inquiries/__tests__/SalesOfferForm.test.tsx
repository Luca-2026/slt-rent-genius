import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InquiryOfferForm } from "../InquiryOfferForm";

const fixtures = vi.hoisted(() => ({
  draft: null as Record<string, unknown> | null,
  specialPrice: 0,
  invoke: vi.fn(),
  queries: vi.fn(),
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/invokeWithAuth", () => ({ invokeWithAuth: fixtures.invoke }));
vi.mock("../offerDraftStorage", () => ({
  inquiryDraftKey: () => "test-draft",
  readInquiryDraft: () => fixtures.draft,
  fetchServerDraft: async () => null,
  writeInquiryDraft: vi.fn(), saveServerDraft: vi.fn(),
  clearInquiryDraft: vi.fn(), deleteServerDraft: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: "staff" } } }) },
  from: (table: string) => {
    fixtures.queries(table);
    const data = table === "rental_inquiries" ? { b2b_profile_id: null, crm_customer_id: "crm" }
      : table === "crm_customers" ? { b2b_profile_id: "profile" }
      : table === "b2b_category_discounts" ? [{ discount_percent: 20, product_categories: { slug: "erdbewegung" } }]
      : table === "b2b_customer_prices" ? (fixtures.specialPrice ? [{ product_id: "machine", product_name: "2t Minibagger", unit_price: fixtures.specialPrice }] : [])
      : table === "b2b_managed_products" ? { id: "machine", pricing_scheme: "bau", prices_same_all_locations: true, price_from_1_rd: 100, price_from_3_rd: 90, price_from_10_rd: 80, price_from_20_rd: 60 }
      : null;
    const result = { data, error: null };
    const query: Record<string, unknown> = { then: (resolve: (r: unknown) => unknown) => Promise.resolve(result).then(resolve) };
    for (const method of ["select", "eq", "limit", "order", "in", "or"]) query[method] = () => query;
    query.maybeSingle = async () => result;
    return query;
  },
} }));
vi.mock("../InquiryProductCombobox", () => {
  const products = [
    { slug: "minibagger-2t", name: "2t Minibagger", category: "erdbewegung", images: [], price_from_1_rd: 100, pricing_scheme: "bau", addon_options: [] },
    { slug: "kramer-5045", name: "3t Radlader Kramer 5045", category: "erdbewegung", images: [], price_from_1_rd: 100, pricing_scheme: "bau", addon_options: [] },
  ];
  return {
    loadCatalog: async () => products,
    findCatalogProductByName: async (name: string) => products.find((p) => p.name === name),
    pickCatalogImage: () => undefined,
    categoryNameFor: async () => "Erdbewegung",
    InquiryProductCombobox: () => null,
  };
});

function line(slug = "minibagger-2t", name = "2t Minibagger") {
  return { product_slug: slug, product_name: name, quantity: 1, duration: 1, unit: "miettage" as const, unit_price: 100, discount_percent: 0, available_addons: [] };
}
function open(props: Partial<React.ComponentProps<typeof InquiryOfferForm>> = {}) {
  return render(<InquiryOfferForm inquiryType="rental" inquiryId="inquiry" location="krefeld" staffName="TEST" defaultItems={[line()]} customerKind="business" {...props} />);
}
function discounts() {
  return screen.getAllByRole("spinbutton").filter((input) => input.getAttribute("max") === "100") as HTMLInputElement[];
}
beforeEach(() => { fixtures.draft = null; fixtures.specialPrice = 0; fixtures.invoke.mockReset(); fixtures.invoke.mockResolvedValue({ data: null, error: null }); fixtures.queries.mockClear(); });
afterEach(cleanup);

vi.mock("@/hooks/useSalesCatalog", () => ({ loadSalesCatalog: async () => [], loadSalesCosts: async () => [] }));
vi.mock("../SalesProductCombobox", () => ({ SalesProductCombobox: () => null }));

describe("sales-only quote flow", () => {
  it("previews each quantity once with no inherited rental duration or deposit", async () => {
    fixtures.draft = { deposit: 300, deliveryCostReturn: 100, dismantleCost: 50, paymentTerms: "anzahlung_30" };
    open({ inquiryType: "sales", defaultItems: [{ ...line(), quantity: 2, duration: 10, unit_price: 1000 }, { ...line(), quantity: 3, duration: 5, unit_price: 200 }] });
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    const body = fixtures.invoke.mock.calls[0][1];
    expect(body.items.map((i: {quantity: number}) => i.quantity)).toEqual([2, 3]);
    expect(body.items.map((i: {duration: number}) => i.duration)).toEqual([1, 1]);
    expect(body.payment_terms).toBe("vorkasse");
    expect(body.deposit).toBe(0);
    expect(body.delivery_cost_return).toBe(0);
    expect(body.dismantle_cost).toBe(0);
  });
  it("preselects explicit customer financing request, and staff can exclude it", async () => {
    open({ inquiryType: "sales", financingRequest: { desired: true, term: "36" } });
    await waitFor(() => expect(screen.getByRole("checkbox", { name: "Finanzierungshinweis ausweisen" }).getAttribute("data-state")).toBe("checked"));
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    expect(fixtures.invoke.mock.calls[0][1].financing).toEqual({ enabled: true, note: "Gewünschte Laufzeit: 36 Monate" });
    fixtures.invoke.mockClear();
    fireEvent.click(screen.getByRole("checkbox", { name: "Finanzierungshinweis ausweisen" }));
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    expect(fixtures.invoke.mock.calls[0][1].financing.enabled).toBe(false);
  });
  it("restores the saved optional financing decision", async () => {
    fixtures.draft = { financing: { enabled: false, note: "Mitarbeiterentscheidung" } };
    open({ inquiryType: "sales", financingRequest: { desired: true } });
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    expect(fixtures.invoke.mock.calls[0][1].financing.enabled).toBe(false);
  });
});
