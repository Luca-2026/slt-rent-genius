import { describe, expect, it } from "vitest";
import { nrwWorkday, signEarliestDay, signLeadError } from "../../supabase/functions/_shared/sign-booking-lead";
describe("Genehmigungsvorlauf", () => {
  const now = Date.parse("2026-11-03T10:00:00Z");
  it("zählt 14 Werktage Mo–Sa nach dem Buchungstag", () => {
    expect(signEarliestDay("slt", now)).toBe("2026-11-19");
    expect(signLeadError("sorglos", "slt", "2026-11-18", "11:00", now)).not.toBeNull();
    expect(signLeadError("sorglos", "slt", "2026-11-19", "11:00", now)).toBeNull();
  });
  it("zählt Samstag, aber keine Sonntage oder NRW-Feiertage", () => {
    expect(nrwWorkday("2026-11-07")).toBe(true);
    expect(nrwWorkday("2026-11-08")).toBe(false);
    expect(nrwWorkday("2026-12-26")).toBe(false);
    expect(nrwWorkday("2027-03-26")).toBe(false);
    expect(nrwWorkday("2027-05-27")).toBe(false);
  });
  it("erfordert exakt 96 Stunden mit Berliner Uhrzeit bei vorhandener Genehmigung", () => {
    expect(signLeadError("sorglos", "existing", "2026-11-07", "10:59", now)).not.toBeNull();
    expect(signLeadError("sorglos", "existing", "2026-11-07", "11:00", now)).toBeNull();
  });
  it("erzwingt die Genehmigungswahl nur für Aufstellpakete", () => {
    expect(signLeadError("sorglos", undefined, "2026-12-01", "10:00", now)).not.toBeNull();
    expect(signLeadError("standard", undefined, "2026-11-03", "10:00", now)).toBeNull();
  });
});