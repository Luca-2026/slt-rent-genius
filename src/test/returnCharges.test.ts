import { describe, expect, it } from "vitest";
import {
  CLEANING_UNIT_GROSS, cleaningChargeGross, FUEL_PRICES, cleaningSuggested, depositSettlementNote, fuelChargeGross, fuelSuggested, settleDeposit,
} from "@/lib/returnCharges";

describe("Zusatzkosten bei Rücknahme", () => {
  it("Reinigung 40 € netto je 15 Min = 47,60 € brutto; 30 Min = 80 € netto = 95,20 € brutto", () => {
    expect(CLEANING_UNIT_GROSS).toBe(47.6);
    expect(cleaningChargeGross(2)).toBe(95.2);
    expect(cleaningChargeGross(0)).toBe(0);
  });
  it("Reinigung wird bei Sauberkeit unter 5 vorgeschlagen", () => {
    expect(cleaningSuggested(5)).toBe(false);
    expect(cleaningSuggested(4)).toBe(true);
    expect(cleaningSuggested(1)).toBe(true);
    expect(cleaningSuggested(0)).toBe(false);
  });
  it("Literpreise laut Mietbedingungen", () => {
    expect(FUEL_PRICES.find((f) => f.value === "diesel")!.pricePerLiter).toBe(2.85);
    expect(FUEL_PRICES.find((f) => f.value === "benzin")!.pricePerLiter).toBe(2.95);
    expect(FUEL_PRICES.find((f) => f.value === "adblue")!.pricePerLiter).toBe(1.85);
    expect(fuelChargeGross(12.5, 2.85)).toBe(35.63);
    expect(fuelChargeGross(0, 2.85)).toBe(0);
  });
  it("Kraftstoff nur, wenn weniger als bei Übergabe", () => {
    expect(fuelSuggested("voll", "halb")).toBe(true);
    expect(fuelSuggested("voll", "voll")).toBe(false);
    expect(fuelSuggested("halb", "halb")).toBe(false);
    expect(fuelSuggested(null, "dreiviertel")).toBe(true);
  });
});

describe("Verrechnung mit Kaution", () => {
  it("Kaution gezahlt: Zusatzkosten werden abgezogen, Rest erstattet", () => {
    // Miete 236,10 + Kaution 750 bezahlt, Reinigung 59,50
    const s = settleDeposit({ deposit: 750, amountPaid: 986.1, grossWithoutCharges: 236.1, chargesGross: 59.5 });
    expect(s).toEqual({ depositHeld: 750, offset: 59.5, refund: 690.5, uncovered: 0 });
    expect(depositSettlementNote(s, 59.5, ["RP-2026-0005"])).toContain("690,50");
  });
  it("Kosten über der Kaution bleiben offen", () => {
    expect(settleDeposit({ deposit: 100, amountPaid: 336.1, grossWithoutCharges: 236.1, chargesGross: 150 }))
      .toEqual({ depositHeld: 100, offset: 100, refund: 0, uncovered: 50 });
  });
  it("Keine Kaution gezahlt: nichts verrechnen", () => {
    const s = settleDeposit({ deposit: 750, amountPaid: 236.1, grossWithoutCharges: 236.1, chargesGross: 59.5 });
    expect(s.offset).toBe(0);
    expect(depositSettlementNote(s, 59.5)).toBe("");
  });
});
