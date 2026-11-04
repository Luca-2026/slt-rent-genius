import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InventoryEditorDialog } from "@/components/b2b/admin/InventoryEditorDialog";
import type { AdminManagedProductRow } from "@/hooks/useManagedProducts";

const mocks = vi.hoisted(() => ({ update: vi.fn(), upsert: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: mocks.error, success: vi.fn() } }));
vi.mock("@/hooks/useManagedProducts", () => ({ resolveSubcategory: () => "", useAdminManagedProducts: () => ({ data: [] }) }));
vi.mock("@/lib/cmsDraftStorage", () => ({ cmsDraftKey: () => "test", readCmsDraft: () => null, clearCmsDraft: vi.fn(), writeCmsDraft: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: "staff" } } }) },
  from: (table: string) => {
    const query: Record<string, unknown> = { then: (resolve: (r: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve) };
    query.select = () => query; query.eq = () => query;
    query.update = (payload: unknown) => { mocks.update(table, payload); return query; };
    query.upsert = (payload: unknown) => { mocks.upsert(table, payload); return query; };
    return query;
  },
} }));
const product = (overrides = {}) => ({ id: "test-article", name: "TEST Artikel", slug: "test-artikel", category: "erdbewegung", main_category: "bau", pricing_scheme: "bau", available_locations: ["krefeld"], stocked_locations: ["krefeld"], is_published: true, on_request: false, price_per_day: "ab 75,00 €/Tag", price_per_month: "ab 999 €/Monat", price_from_1_rd: null, price_from_20_rd: null, ...overrides }) as unknown as AdminManagedProductRow;
beforeEach(() => { mocks.update.mockClear(); mocks.upsert.mockClear(); mocks.error.mockClear(); });
afterEach(cleanup);
describe("actual CMS article save", () => {
  it.each([true, false])("saves published content independently of shared prices=%s", async (samePrices) => {
    render(<InventoryEditorDialog open onOpenChange={vi.fn()} onSaved={vi.fn()} initial={product({ prices_same_all_locations: samePrices })} />);
    fireEvent.change(screen.getByDisplayValue("TEST Artikel"), { target: { value: "TEST Artikel bearbeitet" } });
    fireEvent.click(screen.getByRole("button", { name: /^Speichern$/ }));
    await waitFor(() => expect(mocks.update).toHaveBeenCalled());
    const payload = mocks.update.mock.calls[0][1];
    expect(payload.name).toBe("TEST Artikel bearbeitet");
    expect(payload).not.toHaveProperty("price_per_day");
    expect(payload).not.toHaveProperty("price_per_month");
    expect(payload).not.toHaveProperty("price_from_1_rd");
    expect(mocks.upsert).not.toHaveBeenCalled();
    expect(mocks.error).not.toHaveBeenCalled();
  });
  it("saves a deliberately edited price together with article changes", async () => {
    render(<InventoryEditorDialog open onOpenChange={vi.fn()} onSaved={vi.fn()} initial={product()} />);
    fireEvent.mouseDown(screen.getByRole("tab", { name: /Preise/ }), { button: 0, ctrlKey: false });
    fireEvent.change(await screen.findByLabelText("ab 1 Miettag (€ netto je Miettag)"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: /^Speichern$/ }));
    await waitFor(() => expect(mocks.update).toHaveBeenCalled());
    expect(mocks.update.mock.calls[0][1]).toMatchObject({ price_from_1_rd: 100, price_from_3_rd: 90, price_from_10_rd: 80, price_from_20_rd: 60, price_per_day: "ab 100,00 €/Tag" });
  });
});