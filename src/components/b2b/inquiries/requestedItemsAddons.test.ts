import { describe, expect, it } from "vitest";
import { requestedItemsOf } from "./types";

describe("requestedItemsOf – selected_addons", () => {
  it("übernimmt vom Kunden gewählte Zusatzoptionen", () => {
    const items = requestedItemsOf({
      product_name: "6t Minibagger",
      quantity: 1,
      requested_items: [
        { product_name: "6t Minibagger", product_slug: "minibagger-6t", quantity: 1, selected_addons: ["sb_reduktion"] },
      ],
    });
    expect(items[0].selected_addons).toEqual(["sb_reduktion"]);
  });

  it("liefert leere Liste bei Anfragen ohne Zusatzoptionen (Alt-Daten)", () => {
    const items = requestedItemsOf({
      product_name: "Bauzaun",
      quantity: 5,
      requested_items: [{ product_name: "Bauzaun", quantity: 5 }],
    });
    expect(items[0].selected_addons).toEqual([]);
  });

  it("ignoriert ungültige Einträge und begrenzt auf 10", () => {
    const items = requestedItemsOf({
      product_name: "X",
      quantity: 1,
      requested_items: [
        { product_name: "X", selected_addons: ["a", null, 5, "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"] },
      ],
    });
    expect(items[0].selected_addons).toEqual(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]);
  });

  it("Fallback-Einzelartikel hat keine Zusatzoptionen", () => {
    const items = requestedItemsOf({ product_name: "Rüttelplatte", quantity: 2, requested_items: null });
    expect(items).toHaveLength(1);
    expect(items[0].selected_addons).toBeUndefined();
  });
});
