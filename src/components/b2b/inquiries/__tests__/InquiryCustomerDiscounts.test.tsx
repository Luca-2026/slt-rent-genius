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
      : table === "b2b_managed_products" ? { id: "machine", pricing_scheme: "bau", prices_same_all_locations: true, price_from_1_rd: 100 }
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

describe("Kundenrabatte im Mietanfrage-Angebot", () => {
  it("restores requested weekend use despite contradictory old draft globals and lets staff change it", async () => {
    const rental = { ...line(), rental_start: "2026-11-04", rental_end: "2026-11-24", rental_start_time: "07:00", rental_end_time: "18:00", duration: 21,
      use_saturday: true, use_sunday: true, pricing: { scheme: "bau", base_name: "2t Minibagger", prices: { price_from_1_rd: 100, price_from_3_rd: 90, price_from_10_rd: 80, price_from_20_rd: 60, price_weekend_num: null, price_base_1_3_cd: null, surcharge_per_cd_from_4: null, surcharge_per_cd_from_8: null } } };
    fixtures.draft = { items: [rental], useSaturday: false, useSunday: false };
    open({ defaultItems: [rental] });
    const saturday = screen.getByRole("checkbox", { name: /Einsatz Samstag/ });
    const sunday = screen.getByRole("checkbox", { name: /Einsatz Sonntag/ });
    expect(saturday.getAttribute("data-state")).toBe("checked");
    expect(sunday.getAttribute("data-state")).toBe("checked");
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    expect(fixtures.invoke.mock.calls[0][1].items[0].duration).toBe(21);
    expect(fixtures.invoke.mock.calls[0][1].use_saturday).toBe(true);
    expect(fixtures.invoke.mock.calls[0][1].use_sunday).toBe(true);
    fixtures.invoke.mockClear();
    fireEvent.click(saturday);
    fireEvent.click(sunday);
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    expect(fixtures.invoke.mock.calls[0][1].items[0].duration).toBe(15);
    expect(fixtures.invoke.mock.calls[0][1].items[0].use_saturday).toBe(false);
    expect(fixtures.invoke.mock.calls[0][1].items[0].use_sunday).toBe(false);
    expect(fixtures.invoke.mock.calls[0][1].items[0].unit_price).toBe(80);
  });
  it("übernimmt 20 % Erdbewegung aus CRM-verknüpftem Portalprofil für Bagger und Radlader", async () => {
    open({ defaultItems: [line(), line("kramer-5045", "3t Radlader Kramer 5045")] });
    await waitFor(() => expect(discounts().map((input) => input.value)).toEqual(["20", "20"]));
    expect(fixtures.queries).toHaveBeenCalledWith("crm_customers");
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    const payload = fixtures.invoke.mock.calls[0][1];
    expect(payload.items.map((item: { discount_percent: number }) => item.discount_percent)).toEqual([20, 20]);
    expect(payload.preview).toBe(true);
  });
  it("prüft angereicherte Altentwürfe trotz Wochenendnamen anhand des Artikel-Slugs", async () => {
    fixtures.draft = { items: [{ ...line(), product_name: "2t Minibagger – Wochenendtarif (Fr 16 – Mo 09:30)" }] };
    open();
    await waitFor(() => expect(discounts()[0].value).toBe("20"));
  });
  it("erhält bewusst manuell auf 0 gesetzte Rabatte", async () => {
    fixtures.draft = { items: [{ ...line(), discount_auto: false }] };
    open();
    await waitFor(() => expect(fixtures.queries).toHaveBeenCalledWith("b2b_managed_products"));
    expect(Number(discounts()[0].value)).toBe(0);
  });
  it("wendet keinen Kategorierabatt zusätzlich zu einem Kundensonderpreis an", async () => {
    fixtures.specialPrice = 80;
    open();
    await waitFor(() => expect(fixtures.queries).toHaveBeenCalledWith("b2b_customer_prices"));
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    expect(fixtures.invoke.mock.calls[0][1].items[0].discount_percent).toBe(0);
  });
  it("ändert Rabatte bestehender Angebotsrevisionen nicht", async () => {
    open({ reviseOf: "ANG-TEST" });
    expect(Number(discounts()[0].value)).toBe(0);
    expect(fixtures.queries).not.toHaveBeenCalledWith("b2b_category_discounts");
  });
});