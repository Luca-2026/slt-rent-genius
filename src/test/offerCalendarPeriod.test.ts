import { describe, expect, it } from "vitest";
import { calendarDescription, calendarDuration, inheritCalendarPeriod, withoutLegacyPeriod } from "@/components/b2b/inquiries/offerCalendarPeriod";
import { recalcAddons } from "@/components/b2b/inquiries/OfferAddonSection";
import { normalizeInquiryOfferItems } from "../../supabase/functions/_shared/inquiry-offer-math";
import { lineTotal, type OfferLine } from "@/components/b2b/inquiries/offerMath";
import { requestedItemsOf } from "@/components/b2b/inquiries/types";

const line: OfferLine = { product_name: "Test", quantity: 1, duration: 5, unit: "miettage", unit_price: 5, discount_percent: 0,
  description: "Mo, 16.11.2026, 09:00 – Fr, 20.11.2026, 16:30",
  rental_start: "2026-11-23", rental_end: "2026-11-24", rental_start_time: "09:00", rental_end_time: "16:30" };
describe("Calendar is the rental offer period source", () => {
  it("counts both requested weekend days for HYPW7X: 21 instead of 15 rental days", () => {
    const requested = requestedItemsOf({ product_name: "20 kVA Aggregat", quantity: 1, requested_items: [{ product_name: "20 kVA Aggregat", quantity: 1, use_saturday: true, use_sunday: true }] })[0];
    const actual = { ...line, rental_start: "2026-11-04", rental_end: "2026-11-24", rental_start_time: "07:00", rental_end_time: "18:00" };
    expect(calendarDuration(actual, requested).duration).toBe(21);
    expect(calendarDuration(actual, {}).duration).toBe(15);
  });
  it("preserves per-line true and explicit false weekend use through offer normalization", () => {
    const saved = normalizeInquiryOfferItems([{ ...line, use_saturday: true, use_sunday: false }])[0];
    expect(saved.use_saturday).toBe(true);
    expect(saved.use_sunday).toBe(false);
  });
  it("leaves missing legacy weekend flags undefined so inquiry defaults can apply", () => {
    const requested = requestedItemsOf({ product_name: "20 kVA Aggregat", quantity: 1, requested_items: [{ product_name: "20 kVA Aggregat" }] })[0];
    expect(requested.use_saturday).toBeUndefined();
    expect(requested.use_sunday).toBeUndefined();
  });
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
  it("Friday to Saturday rent stays two days while Monday collection extends insurance to four", () => {
    const updated = recalcAddons(calendarDuration<OfferLine>({ ...line, rental_start: "2026-11-06", rental_end: "2026-11-07", collection_at: "2026-11-09T09:00", addons: [{ key: "insurance", label: "Versicherung", basis: "full_period", price_type: "per_unit", rate: 10, days: 4, amount: 40 }] }, {}));
    expect(updated.duration).toBe(2);
    expect(updated.addons?.[0].days).toBe(4);
    expect(updated.addons?.[0].amount).toBe(40);
    expect(updated.addons?.[0].period_end).toBe("2026-11-09");
    const saved = normalizeInquiryOfferItems([{ ...updated, articles: 1, quantity: 2 }])[0];
    expect(saved.addons?.[0].days).toBe(4);
    expect(saved.addons?.[0].amount).toBe(40);
    expect(() => normalizeInquiryOfferItems([{ ...updated, articles: 1, quantity: 2, addons: [{ ...updated.addons?.[0], days: 2, amount: 20 }] }])).toThrow(/Versicherungszeitraum/);
  });
  it("uses earlier delivery and later collection independently of billed rental days", () => {
    const updated = calendarDuration<OfferLine>({ ...line, rental_start: "2026-11-06", rental_end: "2026-11-07", delivery_at: "2026-11-05T17:00", collection_at: "2026-11-09T09:00", duration_override: 1, addons: [{ key: "insurance", label: "Versicherung", basis: "full_period", amount: 0 }] }, {});
    expect(updated.duration).toBe(1);
    expect(updated.addons?.[0].days).toBe(5);
    expect(updated.addons?.[0].period_start).toBe("2026-11-05");
    expect(updated.addons?.[0].period_end).toBe("2026-11-09");
  });
  it("falls back to rental end when only delivery is specified", () => {
    const updated = calendarDuration<OfferLine>({ ...line, rental_start: "2026-11-06", rental_end: "2026-11-07", delivery_at: "2026-11-05T17:00", addons: [{ key: "insurance", label: "Versicherung", basis: "full_period", amount: 0 }] }, {});
    expect(updated.addons?.[0].days).toBe(3);
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