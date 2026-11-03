import { describe, expect, it } from "vitest";
import { calendarDescription, calendarDuration, inheritCalendarPeriod, withoutLegacyPeriod } from "@/components/b2b/inquiries/offerCalendarPeriod";
import { recalcAddons } from "@/components/b2b/inquiries/OfferAddonSection";
import { normalizeInquiryOfferItems } from "../../supabase/functions/_shared/inquiry-offer-math";
import { lineTotal, type OfferLine } from "@/components/b2b/inquiries/offerMath";

const line: OfferLine = { product_name: "Test", quantity: 1, duration: 5, unit: "miettage", unit_price: 5, discount_percent: 0,
  description: "Mo, 16.11.2026, 09:00 – Fr, 20.11.2026, 16:30",
  rental_start: "2026-11-23", rental_end: "2026-11-24", rental_start_time: "09:00", rental_end_time: "16:30" };
describe("Calendar is the rental offer period source", () => {
  it("allows manually billed days without changing the HYPW7X calendar or insurance period", () => {
    const updated = calendarDuration<OfferLine>({ ...line, rental_start: "2026-11-04", rental_end: "2026-11-24", rental_start_time: "07:00", rental_end_time: "18:00", duration_override: 10,
      unit_price: 51, addons: [{ key: "insurance", label: "Insurance", basis: "full_period", days: 10, amount: 0 }] }, {});
    expect(updated.duration).toBe(10);
    expect(lineTotal(updated)).toBe(510);
    expect(updated.rental_end).toBe("2026-11-24");
    expect(updated.addons?.[0].days).toBe(21);
    expect(calendarDuration({ ...updated, duration_override: undefined }, {}).duration).toBe(15);
  });
  it("preserves the explicit override through server normalization", () => {
    expect(normalizeInquiryOfferItems([{ ...line, duration_override: 10 }])[0].duration_override).toBe(10);
  });
  it("removes previously generated periods when reopening and never duplicates them", () => {
    const saved = calendarDescription(line);
    expect(withoutLegacyPeriod(saved)).toBe("");
    expect(calendarDescription({ ...line, description: saved })).toBe(saved);
  });
  it("Friday to Saturday insurance is two days, independent of Monday collection", () => {
    const updated = recalcAddons(calendarDuration<OfferLine>({ ...line, rental_start: "2026-11-06", rental_end: "2026-11-07", collection_at: "2026-11-09T09:00", addons: [{ key: "insurance", label: "Versicherung", basis: "full_period", price_type: "per_unit", rate: 10, days: 4, amount: 40 }] }, {}));
    expect(updated.duration).toBe(2);
    expect(updated.addons?.[0].days).toBe(2);
    expect(updated.addons?.[0].amount).toBe(20);
    expect(updated.addons?.[0].period_end).toBe("2026-11-07");
  });
  it("stores independent delivery and collection moments without changing rent", () => {
    const logistics = { delivery_at: "2026-11-05T17:00", collection_at: "2026-11-09T09:00" };
    const saved = normalizeInquiryOfferItems([{ ...line, ...logistics }])[0];
    expect(saved.delivery_at).toBe(logistics.delivery_at);
    expect(saved.collection_at).toBe(logistics.collection_at);
    expect(lineTotal(calendarDuration({ ...line, ...logistics }, {}))).toBe(10);
    expect(calendarDescription({ ...line, ...logistics })).toContain("Rückholung: 09.11.2026, 09:00");
  });
  it("rejects invalid logistics dates and collection before delivery", () => {
    expect(() => normalizeInquiryOfferItems([{ ...line, delivery_at: "2026-02-30T17:00" }])).toThrow();
    expect(() => normalizeInquiryOfferItems([{ ...line, delivery_at: "2026-11-09T09:00", collection_at: "2026-11-05T17:00" }])).toThrow();
  });
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
    const updated = calendarDuration<OfferLine>({ ...line, addons: [{ key: "insurance", label: "Insurance", amount: 25, days: 5, basis: "full_period" }] }, {});
    expect(updated.addons?.[0].days).toBe(2);
    expect(updated.addons?.[0].period_start).toBe("2026-11-23");
    expect(updated.addons?.[0].period_end).toBe("2026-11-24");
  });
});