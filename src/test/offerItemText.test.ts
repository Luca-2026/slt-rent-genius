import { describe, expect, it } from "vitest";
import { offerItemText } from "../../supabase/functions/_shared/offer-item-text";
describe("accepted offer text in rental and sales confirmations", () => {
  it("preserves the actual loader label instead of the underlying catalogue label", () => {
    const item = { product_name: "5,5t Kompakt- Raupenlader", name_override: "4,85 to. Kompakt-Raupenlader", quantity: 10, unit_price: 215 };
    const before = JSON.stringify(item);
    expect(offerItemText(item).product_name).toBe("4,85 to. Kompakt-Raupenlader");
    expect(JSON.stringify(item)).toBe(before);
    expect(item.quantity * item.unit_price).toBe(2150);
  });
  it("preserves insurance rather than printing the placeholder charger", () => {
    expect(offerItemText({ product_name: "6-fach Ladegerät", name_override: "Maschinenbruchversicherung je Kalendertag", description: "Alt", description_override: "Selbstbehalt: 8.000 Euro" })).toEqual({ product_name: "Maschinenbruchversicherung je Kalendertag", description: "Selbstbehalt: 8.000 Euro" });
  });
  it("preserves sales overrides and falls back for legacy positions", () => {
    expect(offerItemText({ product_name: "Katalogmaschine", name_override: "Verkaufte Maschine" }).product_name).toBe("Verkaufte Maschine");
    expect(offerItemText({ product_name: "Original", description: "Beschreibung", name_override: "", description_override: "" })).toEqual({ product_name: "Original", description: "Beschreibung" });
  });
});