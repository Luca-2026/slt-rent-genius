import { describe, expect, it } from "vitest";
import {
  CLEANING_UNIT_GROSS, cleaningChargeGross, FUEL_PRICES, cleaningSuggested, depositSettlementNote, fuelChargeGross, fuelSuggested, settleDeposit,
} from "@/lib/returnCharges";

describe("Zusatzkosten bei Rücknahme", () => {
  it("Reinigung 20 € netto je 15 Min = 23,80 € brutto; 3 Einheiten = 71,40 € brutto", () => {
    expect(CLEANING_UNIT_GROSS).toBe(23.8);
    expect(cleaningChargeGross(3)).toBe(71.4);
    expect(cleaningChargeGross(1)).toBe(23.8);
    expect(cleaningChargeGross(0)).toBe(0);
  });
  it("Verschmutzt gilt ein Gerät ab Stufe 2 (1 = sauber)", () => {
    expect(cleaningSuggested(1)).toBe(false);
    expect(cleaningSuggested(2)).toBe(true);
    expect(cleaningSuggested(5)).toBe(true);
    expect(cleaningSuggested(0)).toBe(false);
    expect(cleaningSuggested(null)).toBe(false);
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

import { chargeQuantityText } from "@/lib/returnCharges";
describe("Mengenangabe Rückgabekosten", () => {
  it("Reinigung in 15-Minuten-Einheiten, 20 € netto", () => {
    expect(chargeQuantityText("Reinigungsservice Bagger", 2, 23.8)).toBe("2 × 15 Min = 30 Min à 20,00 € netto je 15 Min");
  });
  it("Diesel in Litern", () => {
    expect(chargeQuantityText("Kraftstoff Diesel nachgetankt – Bagger", 12.5, 2.85)).toBe("12,5 Liter à 2,39 € netto je Liter");
  });
  it("sonstige Posten ohne Mengenangabe", () => {
    expect(chargeQuantityText("Mehrstunden", 3, 10)).toBeNull();
  });
});

import { chargeMeasure, quantityFromText } from "@/lib/returnCharges";
describe("Einheiten der Rückgabekosten auf der Rechnung", () => {
  it("Diesel 4,5 Liter: Einheit Liter, Menge × Einzelpreis ergibt die Netto-Summe", () => {
    const m = chargeMeasure("Kraftstoff Diesel nachgetankt", 4.5, 10.78)!;
    expect(m.unit).toBe("liter");
    expect(m.quantity).toBe(4.5);
    expect(Math.round(m.quantity * m.unit_price * 100) / 100).toBe(10.78);
  });
  it("Reinigung 2 Einheiten: 15 Min à 20 € netto", () => {
    expect(chargeMeasure("Reinigungsservice 1t Minibagger", 2, 40)).toEqual({ quantity: 2, unit: "15min", unit_price: 20 });
  });
  it("Menge aus gespeicherter Mengenangabe", () => {
    expect(quantityFromText("4,5 Liter à 2,39 € netto je Liter")).toBe(4.5);
    expect(quantityFromText("2 × 15 Min = 30 Min à 20,00 €")).toBe(2);
  });
});
