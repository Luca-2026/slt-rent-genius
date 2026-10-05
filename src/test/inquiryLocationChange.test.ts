import { describe, expect, it } from "vitest";
import {
  LOCATION_CHANGE_OPTIONS,
  initialTargetLocation,
  splitCheckableItems,
} from "@/components/b2b/inquiries/InquiryLocationSection";

describe("Standortwechsel – Auswahl des Zielstandorts", () => {
  it("bietet immer alle drei Standorte an", () => {
    expect(LOCATION_CHANGE_OPTIONS.map((o) => o.value)).toEqual(["krefeld", "bonn", "muelheim"]);
  });

  it("schlägt nie den aktuellen Standort als Ziel vor", () => {
    for (const current of ["krefeld", "bonn", "muelheim", "Krefeld", "Bonn", "Mülheim an der Ruhr"]) {
      const target = initialTargetLocation(current);
      expect(target).not.toBe(current.toLowerCase());
      expect(LOCATION_CHANGE_OPTIONS.some((o) => o.value === target)).toBe(true);
    }
  });

  it("nutzt ohne aktuellen Standort Krefeld als Vorschlag", () => {
    expect(initialTargetLocation(null)).toBe("krefeld");
    expect(initialTargetLocation(undefined)).toBe("krefeld");
  });
});

describe("Standortwechsel – prüfbare Artikel", () => {
  it("trennt CMS-Artikel von Freitext-Artikeln", () => {
    const { checkable, uncheckable } = splitCheckableItems([
      { product_name: "Minibagger", product_slug: "minibagger", quantity: 1 },
      { product_name: "Sonderwunsch", quantity: 2 },
    ]);
    expect(checkable).toHaveLength(1);
    expect(checkable[0].product_slug).toBe("minibagger");
    expect(uncheckable).toHaveLength(1);
    expect(uncheckable[0].product_name).toBe("Sonderwunsch");
  });

  it("behandelt eine leere Liste fehlerfrei", () => {
    const { checkable, uncheckable } = splitCheckableItems([]);
    expect(checkable).toEqual([]);
    expect(uncheckable).toEqual([]);
  });
});
