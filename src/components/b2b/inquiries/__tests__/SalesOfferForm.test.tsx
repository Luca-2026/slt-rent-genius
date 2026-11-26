import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InquiryOfferForm } from "../InquiryOfferForm";

const fixtures = vi.hoisted(() => ({
  draft: null as Record<string, unknown> | null,
  specialPrice: 0,
  invoke: vi.fn(),
  queries: vi.fn(),
  saveDraft: vi.fn(),
  localWrite: vi.fn(),
  toast: vi.fn(),
  remote: null as null | { data: Record<string, unknown>; updatedBy: string; updatedAt: string },
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: fixtures.toast }) }));
vi.mock("@/lib/invokeWithAuth", () => ({ invokeWithAuth: fixtures.invoke }));
vi.mock("../offerDraftStorage", () => ({
  inquiryDraftKey: () => "test-draft",
  readInquiryDraft: () => fixtures.draft,
  fetchServerDraft: async () => fixtures.remote,
  writeInquiryDraft: fixtures.localWrite, saveServerDraft: fixtures.saveDraft,
  clearInquiryDraft: vi.fn(), deleteServerDraft: vi.fn().mockResolvedValue(undefined),
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
async function choose(combobox: HTMLElement, option: string) {
  fireEvent.keyDown(combobox, { key: "ArrowDown" });
  fireEvent.click(await screen.findByRole("option", { name: option }));
}
beforeEach(() => { window.HTMLElement.prototype.scrollIntoView = vi.fn(); fixtures.draft = null; fixtures.remote = null; fixtures.saveDraft.mockReset().mockResolvedValue(undefined); fixtures.localWrite.mockClear(); fixtures.toast.mockClear(); fixtures.specialPrice = 0; fixtures.invoke.mockReset(); fixtures.invoke.mockResolvedValue({ data: null, error: null }); fixtures.queries.mockClear(); });
afterEach(cleanup);

vi.mock("@/hooks/useSalesCatalog", () => ({ loadSalesCatalog: async () => [], loadSalesCosts: async () => [] }));
vi.mock("../SalesProductCombobox", () => ({ SalesProductCombobox: () => null }));

describe("sales-only quote flow", () => {
  it.each(["rental", "sales"] as const)("saves %s amendment edits locally before the server debounce", inquiryType => {
    open({ inquiryType, mode: "amendment" });
    fixtures.localWrite.mockClear();
    fireEvent.change(screen.getByLabelText(/Telefonische.*Vereinbarung/), { target: { value: "Telefonisch vereinbart" } });
    expect(fixtures.localWrite.mock.calls.at(-1)?.[1].agreementNote).toBe("Telefonisch vereinbart");
    expect(fixtures.saveDraft).not.toHaveBeenCalled();
  });
  it("reports a rejected shared draft while retaining local inputs", async () => {
    fixtures.saveDraft.mockRejectedValueOnce(new Error("offline"));
    open({ mode: "amendment" });
    fireEvent.change(screen.getByLabelText(/Telefonische.*Vereinbarung/), { target: { value: "Telefonisch vereinbart" } });
    await waitFor(() => expect(fixtures.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" })), { timeout: 2500 });
    expect(fixtures.localWrite.mock.calls.at(-1)?.[1].agreementNote).toBe("Telefonisch vereinbart");
  });
  it("does not recreate a discarded amendment draft", async () => {
    fixtures.draft = { agreementNote: "Alter Entwurf" };
    open({ mode: "amendment" });
    fireEvent.change(screen.getByLabelText(/Telefonische.*Vereinbarung/), { target: { value: "Neue Eingabe" } });
    fireEvent.click(screen.getByRole("button", { name: /Entwurf verwerfen/ }));
    fixtures.localWrite.mockClear();
    await new Promise(resolve => setTimeout(resolve, 1400));
    expect(fixtures.saveDraft).not.toHaveBeenCalled();
    expect(fixtures.localWrite).not.toHaveBeenCalled();
  });
  it("keeps amendment agreement evidence in the first server draft after editing", async () => {
    open({ mode: "amendment" });
    fireEvent.change(screen.getByLabelText(/Telefonische.*Vereinbarung/), { target: { value: "Verlängerung telefonisch vereinbart" } });
    fireEvent.change(screen.getByLabelText(/Vereinbart am/), { target: { value: "2026-11-20T17:00" } });
    await waitFor(() => expect(fixtures.saveDraft).toHaveBeenCalled(), { timeout: 2500 });
    expect(fixtures.saveDraft.mock.calls.at(-1)?.[3]).toEqual(expect.objectContaining({ agreementNote: "Verlängerung telefonisch vereinbart", agreedAt: "2026-11-20T17:00" }));
  });
  it.each(["local", "server"])("restores %s amendment note and date into the preview request", async source => {
    const evidence = { agreementNote: "Verlängerung telefonisch vereinbart", agreedAt: "2026-11-20T17:00" };
    if (source === "local") fixtures.draft = evidence;
    else fixtures.remote = { data: evidence, updatedBy: "staff", updatedAt: "2026-11-20T17:00:00Z" };
    open({ mode: "amendment" });
    await waitFor(() => expect((screen.getByLabelText(/Telefonische.*Vereinbarung/) as HTMLInputElement).value).toBe(evidence.agreementNote));
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    expect(fixtures.invoke.mock.calls[0][1].agreement_note).toBe(evidence.agreementNote);
    expect(fixtures.invoke.mock.calls[0][1].agreed_at).toBe(new Date(evidence.agreedAt).toISOString());
  });
  it("does not request an amendment preview without agreement evidence", async () => {
    open({ mode: "amendment" });
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    expect(fixtures.invoke).not.toHaveBeenCalled();
  });
  it.each(["rental", "sales"] as const)("inherits agreed fourteen-day terms into the %s invoice request", async inquiryType => {
    open({ inquiryType, mode: "invoice", defaultMeta: { payment_terms: "net_14" } });
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    expect(fixtures.invoke.mock.calls[0][1].payment_terms).toBe("net_14");
  });
  it.each(["amendment", "invoice"] as const)("%s serializes newly entered manual discount and recalculated bank rebate", async mode => {
    open({ mode, discountPolicy: { version: "bank-transfer-3-v1", rate: 3, selected: "bank" }, defaultItems: [{ ...line(), price_manual: true, rental_start: "2026-11-10", rental_end: "2026-11-10", addons: [{ key: "bank_transfer_discount_v1", label: "alt", amount: -3, manual: true }] }] });
    await waitFor(() => expect(discounts().length).toBeGreaterThan(0));
    fireEvent.change(discounts()[0], { target: { value: "20" } });
    if (mode === "amendment") {
      const reason = screen.getByLabelText(/Vereinbarung|Änderungsgrund|Grund der Änderung/);
      fireEvent.change(reason, { target: { value: "Gerät eingeschränkt nutzbar" } });
    }
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    const body=fixtures.invoke.mock.calls[0][1];
    expect(body.items[0].discount_percent).toBe(20);
    expect(body.items[0].addons.filter((a: {key:string})=>a.key==="bank_transfer_discount_v1")).toEqual([expect.objectContaining({amount:-2.4})]);
    expect(body.items[0].quantity).toBe(1);
  });
  it.each(["rental", "sales"] as const)("carries offer references into the %s invoice preview despite an older empty draft", async (inquiryType) => {
    fixtures.draft = { extraFields: {} };
    open({ inquiryType, mode: "invoice", defaultMeta: { extra_fields: { commission: "KOM-2026-014", project: "BV-2026-081" } } });
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    expect(fixtures.invoke.mock.calls[0][0]).toBe("send-inquiry-invoice");
    expect(fixtures.invoke.mock.calls[0][1].extra_fields).toEqual({ commission: "KOM-2026-014", project: "BV-2026-081" });
  });
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
  it("wählt eine manuell eingetragene Dauer vollständig ab", async () => {
    open({ defaultItems: [{ ...line(), duration: 10, duration_override: 10, price_manual: true, rental_start: "2026-11-20", rental_end: "2026-11-30" }] });
    await choose(screen.getByRole("combobox", { name: "Einheit der Dauer" }), "Ohne Dauer");
    expect(screen.getByTestId("duration-none")).toHaveTextContent("ohne Dauer");
    expect(screen.queryByLabelText("Abgerechnete Dauer")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Mietbeginn")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    expect(fixtures.invoke.mock.calls[0][1].items[0]).toEqual(expect.objectContaining({ duration: 1, duration_override: undefined, period_free: true, rental_start: undefined, rental_end: undefined }));
  });
  it("wählt Liter und verwendet die eingegebene Menge ohne Dauer-Multiplikation", async () => {
    open({ defaultItems: [{ ...line(), unit: "pauschal" as const, period_free: true, custom_period: true, price_manual: true }] });
    const position = screen.getByTestId("offer-position");
    await choose(within(position).getByRole("combobox", { name: "Mengeneinheit" }), "Liter");
    const quantity = within(position).getAllByRole("spinbutton")[0];
    fireEvent.change(quantity, { target: { value: "24" } });
    expect(screen.getByTestId("duration-none")).toHaveTextContent("ohne Dauer");
    expect(within(position).getByText("24 Liter", { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    expect(fixtures.invoke.mock.calls[0][1].items[0]).toEqual(expect.objectContaining({ quantity: 24, articles: 24, quantity_unit: "liter", duration: 1, period_free: true }));
  });
  it("serialisiert einen zugefügten Verkaufsartikel ohne manuell abgewählte Dauer und Mietzeitraum", async () => {
    open({ defaultItems: [{
      product_name: "Batterien für Warnlampen",
      quantity: 2,
      duration: 10,
      unit: "stueck" as const,
      unit_price: 7.5,
      discount_percent: 0,
      period_free: true,
      custom_period: true,
      rental_start: "2026-11-20",
      rental_end: "2026-11-30",
    }] });
    fireEvent.click(screen.getByRole("button", { name: /Vorschau/ }));
    await waitFor(() => expect(fixtures.invoke).toHaveBeenCalled());
    expect(fixtures.invoke.mock.calls[0][1].items[0]).toEqual(expect.objectContaining({
      product_name: "Batterien für Warnlampen",
      quantity: 2,
      articles: 2,
      duration: 1,
      duration_override: undefined,
      unit_code: "stueck",
      period_free: true,
      rental_start: undefined,
      rental_end: undefined,
    }));
  });
});
