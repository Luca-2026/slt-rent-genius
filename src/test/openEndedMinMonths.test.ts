import { describe, it, expect } from "vitest";
import { normalizeMinMonths, openEndedNote, OPEN_ENDED_NOTE, monthlyNetFromOffer } from "../../supabase/functions/_shared/installments";

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
