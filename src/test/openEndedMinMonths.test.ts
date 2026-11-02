import { describe, it, expect } from "vitest";
import { normalizeMinMonths, openEndedNote, OPEN_ENDED_NOTE, monthlyNetFromOffer, normalizeOpenEndedUnit, normalizeOpenEndedDuration, applyOpenEndedPeriod } from "../../supabase/functions/_shared/installments";
import { lineTotal } from "@/components/b2b/inquiries/offerMath";

describe("Mindestmietzeit unbefristete Monatsmiete", () => {
  it("normalisiert auf ganze Monate 1–60", () => {
    expect(normalizeMinMonths(undefined)).toBe(1);
    expect(normalizeMinMonths(3)).toBe(3);
    expect(normalizeMinMonths(0)).toBe(1);
    expect(normalizeMinMonths(99)).toBe(60);
  });
  it("vereinbart ab 2 Monaten die Mindestmietzeit verbindlich im Hinweis", () => {
    expect(openEndedNote(1)).toBe(OPEN_ENDED_NOTE);
    expect(openEndedNote(3)).toContain("Mindestmietzeit von 3 Monaten");
  });
  it("Abschlag bleibt Monatsbetrag, unabhängig von der Mindestmietzeit", () => {
    expect(monthlyNetFromOffer([{ unit: "monate", quantity: 1, unit_price: 500, duration: 3 }])).toBe(500);
  });
});

describe("Unbefristete Miete mit alternativen Einheiten", () => {
  for (const unit of ["monate", "arbeitstage", "kalendertage", "miettage"] as const) {
    it(`behält ${unit} und berechnet Menge × Mindestmietzeit × Einheitspreis`, () => {
      const item = applyOpenEndedPeriod({ unit: "kalendertage", duration: 1, rental_end: "2026-12-01", quantity: 2, unit_price: 50, discount_percent: 0 }, unit, 3);
      expect(normalizeOpenEndedUnit(unit)).toBe(unit);
      expect(item.unit).toBe(unit);
      expect(item.duration).toBe(3);
      expect(item.rental_end).toBeUndefined();
      expect(lineTotal(item)).toBe(300);
    });
  }
  it("erhält alte Monatsmieten als Standard", () => {
    expect(normalizeOpenEndedUnit(undefined)).toBe("monate");
    expect(normalizeOpenEndedUnit("stueck")).toBe("monate");
    expect(normalizeOpenEndedDuration(3, "monate")).toBe(3);
  });
  it("begrenzt Tages-Mindestmietzeiten nicht auf 60 Monate", () => {
    expect(normalizeOpenEndedDuration(90, "arbeitstage")).toBe(90);
    expect(normalizeOpenEndedDuration(90, "kalendertage")).toBe(90);
    expect(normalizeOpenEndedDuration(90, "miettage")).toBe(90);
    expect(normalizeOpenEndedDuration(90, "monate")).toBe(60);
    expect(normalizeOpenEndedDuration(0, "miettage")).toBe(1);
  });
  it("ändert keine Stück- oder Pauschalpositionen", () => {
    for (const unit of ["stueck", "pauschal"]) {
      const line = { unit, duration: 1, quantity: 2, unit_price: 150 };
      expect(applyOpenEndedPeriod(line, "miettage", 10)).toBe(line);
    }
  });
  it("macht aus Tagessätzen keinen monatlichen Abschlag", () => {
    for (const unit of ["arbeitstage", "kalendertage", "miettage"]) {
      expect(monthlyNetFromOffer([{ unit, quantity: 20, unit_price: 50 }])).toBe(0);
    }
  });
});
