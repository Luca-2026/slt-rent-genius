import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductInstancesDialog } from "@/components/b2b/admin/ProductInstancesDialog";
const mocks = vi.hoisted(() => ({ update: vi.fn(), single: vi.fn(), invalidate: vi.fn() }));
vi.mock("@/hooks/useStaffAccess", () => ({ useStaffAccess: () => ({ canManageInventory: true }) }));
vi.mock("@/hooks/useProductInstances", () => ({
  useProductInstances: () => ({ data: [{ id: "instance", managed_product_id: "product", serial_number: "", internal_inventory_number: "INV-1", location: "krefeld", status: "available", purchase_date: null, purchase_price: null, supplier: null, notes: "original", current_operating_hours: 0 }], refetch: vi.fn() }),
  useInvalidateInstances: () => mocks.invalidate, useMaintenanceIntervals: () => ({ data: [], refetch: vi.fn() }), useMaintenanceLog: () => ({ data: [] }), useCompleteMaintenance: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => {
  const query = { update: (p: unknown) => { mocks.update(p); return query; }, eq: () => query, select: () => query, single: mocks.single };
  return query;
} } }));
beforeEach(() => { mocks.update.mockReset(); mocks.single.mockResolvedValue({ data: { id: "instance" }, error: null }); });
afterEach(() => { cleanup(); localStorage.clear(); });
describe("individual article autosave", () => {
  it.each([
    ["original", "new notes", "notes", "new notes"],
    ["INV-1", "INV-2", "internal_inventory_number", "INV-2"],
  ])("saves %s on changing inventory fields without a save click", async (oldValue, newValue, column, storedValue) => {
    render(<ProductInstancesDialog open onOpenChange={vi.fn()} productId="product" productName="article" productCategory="verdichtung" availableLocations={["krefeld"]} />);
    fireEvent.click(screen.getByText("INV-1"));
    fireEvent.change(screen.getByDisplayValue(oldValue), { target: { value: newValue } });
    await waitFor(() => expect(mocks.update).toHaveBeenCalledWith({ [column]: storedValue }), { timeout: 1500 });
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Betriebsstunden" }), { button: 0, ctrlKey: false });
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Stammdaten" }), { button: 0, ctrlKey: false });
    expect(screen.getByDisplayValue(newValue)).toBeInTheDocument();
  });
});