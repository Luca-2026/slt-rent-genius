import { describe, expect, it } from "vitest";
import { buildOfferTotals } from "@/components/b2b/inquiries/offerMath";
import { resolveReturnLocation } from "../../supabase/functions/_shared/inquiry-offer-math";

describe("Rückgabe an anderem Standort", () => {
  it("erkennt einen abweichenden Rückgabestandort samt Aufpreis", () => {
    expect(resolveReturnLocation("krefeld", "Bonn", 45)).toEqual({ key: "krefeld", name: "Krefeld", cost: 45 });
    expect(resolveReturnLocation("muelheim", "krefeld", "12,5")).toMatchObject({ key: "muelheim", name: "Mülheim an der Ruhr" });
  });

  it("ignoriert gleichen, leeren oder ungültigen Standort – dann auch kein Aufpreis", () => {
    expect(resolveReturnLocation("bonn", "Bonn", 50)).toBeNull();
    expect(resolveReturnLocation("", "Bonn", 50)).toBeNull();
    expect(resolveReturnLocation(null, "Bonn", 50)).toBeNull();
    expect(resolveReturnLocation("bochum", "Bonn", 50)).toBeNull();
  });

  it("lässt keine negativen Aufpreise zu", () => {
    expect(resolveReturnLocation("krefeld", "bonn", -20)?.cost).toBe(0);
  });

  it("der Aufpreis geht netto in die Angebotssumme ein", () => {
    const line = { product_name: "Bagger", quantity: 1, unit_price: 100, discount_percent: 0 };
    const base = buildOfferTotals([line], 0);
    const withReturn = buildOfferTotals([line], 50);
    expect(withReturn.netAmount - base.netAmount).toBe(50);
    expect(withReturn.grossAmount).toBe(178.5);
  });
});
