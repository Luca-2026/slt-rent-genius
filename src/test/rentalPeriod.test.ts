import { describe, it, expect } from "vitest";
import { formatRentalMoment, rentalPeriodOf } from "@/lib/rentalPeriod";

describe("Mietbeginn/-ende", () => {
  it("Format mit Wochentag und Uhrzeit", () => {
    expect(formatRentalMoment("2026-10-20", "08:00:00")).toBe("Mo, 20.10.2026, 08:00");
  });
  it("ohne Uhrzeit nur Datum, ohne Datum Strich", () => {
    expect(formatRentalMoment("2026-10-20", null)).toBe("Mo, 20.10.2026");
    expect(formatRentalMoment(null, "08:00")).toBe("—");
  });
  it("abweichende Positionsdaten haben Vorrang", () => {
    const p = rentalPeriodOf({
      start_date: "2026-10-20", start_time: "08:00", end_date: "2026-10-21", end_time: "17:00",
      offer_payload: { items: [{ rental_start: "2026-10-22", rental_end: "2026-10-24" }] },
    });
    expect(p).toEqual({ start: "Do, 22.10.2026, 08:00", end: "Sa, 24.10.2026, 17:00" });
  });
});
