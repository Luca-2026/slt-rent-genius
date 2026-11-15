import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InventoryEditorDialog } from "@/components/b2b/admin/InventoryEditorDialog";
import { SalesArticleEditorDialog } from "@/components/b2b/admin/SalesArticleEditorDialog";
import { cmsDraftKey, readCmsDraft } from "@/lib/cmsDraftStorage";

const mocks = vi.hoisted(() => ({ error: vi.fn(), rpc: vi.fn(), info: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: mocks.error, success: vi.fn(), info: mocks.info } }));
vi.mock("@/hooks/useStaffAccess", () => ({ useStaffAccess: () => ({ canEditCosts: true }) }));
vi.mock("@/hooks/useManagedProducts", () => ({ resolveSubcategory: () => "", useAdminManagedProducts: () => ({ data: [] }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  rpc: mocks.rpc,
  from: () => {
    const query: Record<string, unknown> = { then: (resolve: (r: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve) };
    query.select = () => query; query.eq = () => query; query.order = () => query; query.limit = () => query;
    return query;
  },
} }));
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });
afterEach(() => { cleanup(); localStorage.clear(); });

describe("incomplete article editors", () => {
  it.each(["rental", "sales"])("keeps incomplete %s input when closing and restores it on reopening", async (kind) => {
    const onOpenChange = vi.fn();
    const editor = () => kind === "rental"
      ? <InventoryEditorDialog open onOpenChange={onOpenChange} onSaved={vi.fn()} />
      : <SalesArticleEditorDialog open kind="new" row={null} onOpenChange={onOpenChange} onSaved={vi.fn()} />;
    const first = render(editor());
    const input = screen.getAllByRole("textbox")[0];
    fireEvent.change(input, { target: { value: "Unvollständiger Artikel" } });
    fireEvent.click(screen.getByRole("button", { name: "Schließen", exact: true }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    const draft = readCmsDraft<Record<string, unknown>>(cmsDraftKey(kind === "rental" ? "inventory" : "sales-new", kind === "rental" ? "__new__" : "new"));
    expect(draft?.form[kind === "rental" ? "name" : "brand"]).toBe("Unvollständiger Artikel");
    expect(mocks.rpc).not.toHaveBeenCalled();
    first.unmount();
    render(editor());
    expect(screen.getByDisplayValue("Unvollständiger Artikel")).toBeTruthy();
  });

  it.each(["rental", "sales"])("rejects explicit incomplete %s saves with feedback instead of closing", async (kind) => {
    const onOpenChange = vi.fn();
    render(kind === "rental"
      ? <InventoryEditorDialog open onOpenChange={onOpenChange} onSaved={vi.fn()} />
      : <SalesArticleEditorDialog open kind="new" row={null} onOpenChange={onOpenChange} onSaved={vi.fn()} />);
    fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "Incomplete" } });
    fireEvent.click(screen.getByRole("button", { name: kind === "rental" ? "Anlegen" : "Speichern", exact: true }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalled());
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});