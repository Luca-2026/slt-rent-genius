import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminGlobalSearch } from "@/components/b2b/admin/AdminGlobalSearch";

afterEach(cleanup);
describe("global staff search", () => {
  const order = { id: "rental-id", order_code: "VXQCC4", booking_id: "booking-uuid", customer_name: "Ralf Döhler", company_name: "SLT", product_name: "Bagger", status: "accepted", kind: "rental" as const };
  it("returns the exact order before more than twelve matching customers", () => {
    const onSelect = vi.fn();
    render(<AdminGlobalSearch customers={Array.from({ length: 20 }, (_, n) => ({ id: String(n), company_name: "VXQCC4 Kundenfirma" }))} invoices={[]} offers={[]} reservations={[order]} onSelect={onSelect} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "VXQCC4" } });
    const hits = screen.getAllByRole("button");
    fireEvent.click(hits[0]);
    expect(onSelect).toHaveBeenCalledWith({ type: "reservation", id: "rental-id", tab: "reservations", kind: "rental" });
  });
  it.each(["#vxqcc4", "booking-uuid", "Doehler Ralf", "SLT"])("opens the linked order for %s", query => {
    const onSelect = vi.fn();
    render(<AdminGlobalSearch customers={[]} invoices={[]} offers={[]} reservations={[order]} onSelect={onSelect} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: query } });
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "rental-id", kind: "rental" }));
  });
  it("preserves the sales destination", () => {
    const onSelect = vi.fn();
    render(<AdminGlobalSearch customers={[]} invoices={[]} offers={[]} reservations={[{ ...order, kind: "sales" }]} onSelect={onSelect} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "VXQCC4" } });
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "rental-id", kind: "sales" }));
  });
});