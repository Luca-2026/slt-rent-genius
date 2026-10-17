import { describe, expect, it } from "vitest";
import { computeSettlement, deductionProblem } from "@/lib/depositSettlement";
import { buildOfferTotals } from "@/components/b2b/inquiries/offerMath";

describe("Kautionsabrechnung", () => {
  it("Zahlung zählt zuerst auf die Miete (Janko Samuel: 500 € bar, 230,86 € Miete)", () => {
    const r = computeSettlement({ paid: 500, rent: 230.86, deductions: [] });
    expect(r.depositHeld).toBe(269.14);
    expect(r.refund).toBe(269.14);
  });
  it("Reinigung 15 Min (23,80 € brutto) wird von der Kaution abgezogen", () => {
    const r = computeSettlement({ paid: 500, rent: 230.86, deductions: [{ key: "c", label: "Reinigung", gross: 23.8, source: "protocol", kind: "service" }] });
    expect(r.deductionsGross).toBe(23.8);
    expect(r.refund).toBe(245.34);
  });
  it("Fehlbetrag ergibt Nachzahlung statt negativer Erstattung", () => {
    const r = computeSettlement({ paid: 250, rent: 230.86, deductions: [{ key: "s", label: "Schaden", gross: 119, source: "damage", kind: "damage" }] });
    expect(r.refund).toBe(0);
    expect(r.due).toBe(99.86);
    expect(r.offset).toBe(19.14);
  });
  it("Entfernter Abzug zählt nicht und braucht einen Grund", () => {
    const d = [{ key: "c", label: "Reinigung", gross: 23.8, source: "protocol" as const, kind: "service" as const, removed: true }];
    expect(computeSettlement({ paid: 500, rent: 230.86, deductions: d }).refund).toBe(269.14);
    expect(deductionProblem(d)).not.toBeNull();
  });
});

describe("Rückgabekosten: Service 19 % vs. nicht steuerbarer Schadensersatz", () => {
  it("Schadensersatz bleibt ohne USt (brutto = netto)", () => {
    const r = computeSettlement({
      paid: 500,
      rent: 230.86,
      deductions: [{ key: "s", label: "Lackarbeiten Bagger", gross: 100, source: "damage", kind: "damage" }],
    });
    expect(r.deductionsNet).toBe(100);
    expect(r.deductionsGross).toBe(100);
    expect(r.refund).toBe(169.14);
  });
  it("Gemischt: Reinigung 119 € brutto (100 netto + 19 USt) + Schaden 50 € ohne USt", () => {
    const r = computeSettlement({
      paid: 500,
      rent: 230.86,
      deductions: [
        { key: "c", label: "Reinigung", gross: 119, source: "protocol", kind: "service" },
        { key: "s", label: "Schaden", gross: 50, source: "damage", kind: "damage" },
      ],
    });
    expect(r.deductionsNet).toBe(150);
    expect(r.deductionsGross).toBe(169);
    expect(r.refund).toBe(100.14);
  });
  it("Rechnungssummen: USt nur auf steuerbare Positionen", () => {
    const t = buildOfferTotals([
      { product_name: "Reinigung", quantity: 1, unit_price: 100, discount_percent: 0, vat_rate: 19 },
      { product_name: "Schadensersatz", quantity: 1, unit_price: 50, discount_percent: 0, vat_rate: 0 },
    ]);
    expect(t.netAmount).toBe(150);
    expect(t.vatAmount).toBe(19);
    expect(t.grossAmount).toBe(169);
    expect(t.nonTaxableNet).toBe(50);
  });
});
