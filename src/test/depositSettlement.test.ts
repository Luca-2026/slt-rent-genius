import { describe, expect, it } from "vitest";
import { computeSettlement, deductionProblem } from "@/lib/depositSettlement";

describe("Kautionsabrechnung", () => {
  it("Zahlung zählt zuerst auf die Miete (Janko Samuel: 500 € bar, 230,86 € Miete)", () => {
    const r = computeSettlement({ paid: 500, rent: 230.86, deductions: [] });
    expect(r.depositHeld).toBe(269.14);
    expect(r.refund).toBe(269.14);
  });
  it("Reinigung 15 Min (23,80 € brutto) wird von der Kaution abgezogen", () => {
    const r = computeSettlement({ paid: 500, rent: 230.86, deductions: [{ key: "c", label: "Reinigung", gross: 23.8, source: "protocol" }] });
    expect(r.deductionsGross).toBe(23.8);
    expect(r.refund).toBe(245.34);
  });
  it("Fehlbetrag ergibt Nachzahlung statt negativer Erstattung", () => {
    const r = computeSettlement({ paid: 250, rent: 230.86, deductions: [{ key: "s", label: "Schaden", gross: 119, source: "damage" }] });
    expect(r.refund).toBe(0);
    expect(r.due).toBe(99.86);
    expect(r.offset).toBe(19.14);
  });
  it("Entfernter Abzug zählt nicht und braucht einen Grund", () => {
    const d = [{ key: "c", label: "Reinigung", gross: 23.8, source: "protocol" as const, removed: true }];
    expect(computeSettlement({ paid: 500, rent: 230.86, deductions: d }).refund).toBe(269.14);
    expect(deductionProblem(d)).not.toBeNull();
  });
});
