import { describe, expect, it } from "vitest";
import { calendarDescription, calendarDuration, inheritCalendarPeriod } from "@/components/b2b/inquiries/offerCalendarPeriod";
import { lineTotal, type OfferLine } from "@/components/b2b/inquiries/offerMath";

const line: OfferLine = { product_name: "Test", quantity: 1, duration: 5, unit: "miettage", unit_price: 5, discount_percent: 0,
  description: "Mo, 16.11.2026, 09:00 – Fr, 20.11.2026, 16:30",
  rental_start: "2026-11-23", rental_end: "2026-11-24", rental_start_time: "09:00", rental_end_time: "16:30" };
describe("Calendar is the rental offer period source", () => {
  it("uses changed calendar dates and times instead of legacy description", () => {
    expect(calendarDescription(line)).toBe("Mietzeitraum: 23.11.2026, 09:00 – 24.11.2026, 16:30");
  });
  it("updates duration and total even with a manual unit price", () => {
    const updated = calendarDuration({ ...line, price_manual: true }, {});
    expect(updated.duration).toBe(2);
    expect(lineTotal(updated)).toBe(10);
  });
  it("inherits dates but computes the second item's own billing unit", () => {
    const updated = calendarDuration(inheritCalendarPeriod({ ...line, unit: "wochen", rental_end: "2026-12-31" }, line), {});
    expect(updated.rental_end).toBe("2026-11-24");
    expect(updated.duration).toBe(1);
    expect(updated.unit).toBe("wochen");
  });
  it("preserves genuine article descriptions and removes only the legacy period", () => {
    expect(calendarDescription({ ...line, description: `Inkl. Tieflöffel · ${line.description}` })).toBe("Inkl. Tieflöffel · Mietzeitraum: 23.11.2026, 09:00 – 24.11.2026, 16:30");
  });
  it("updates full-period insurance days from the selected calendar", () => {
    const updated = calendarDuration({ ...line, addons: [{ key: "insurance", label: "Insurance", amount: 25, days: 5, basis: "full_period" as const }] }, {});
    expect(updated.addons?.[0].days).toBe(2);
    expect(updated.addons?.[0].period_start).toBe("2026-11-23");
    expect(updated.addons?.[0].period_end).toBe("2026-11-24");
  });
});