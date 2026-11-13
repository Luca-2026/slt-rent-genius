import { describe, expect, it } from "vitest";
import { computeRentalLinePrice, rentalBlockCount, tierPriceWeek, resolveProductPrices } from "@/lib/pricing/rentalPricing";
import * as server from "../../supabase/functions/_shared/rental-pricing";
import { emptyPriceSet, schemeFields, applyBauTierAutofill } from "@/components/b2b/admin/ManagedPriceFields";
import { calendarDescription } from "@/components/b2b/inquiries/offerCalendarPeriod";
import { lineTotal } from "@/components/b2b/inquiries/offerMath";
import { displayPrice } from "@/lib/priceDisplay";
import { installmentPeriod, nextInstallmentDate } from "@/lib/installments";

const prices = { price_short_1_3_rd: 60, price_from_1_week: 100, price_from_2_weeks: 90, price_from_3_weeks: 80, price_from_4_weeks: 70, price_weekend_num: 1 };
describe("Preis-Woche: supplied tariff examples", () => {
  it("follow-up invoices recur after exactly four weeks, not one calendar month", () => {
    expect(installmentPeriod("2026-11-16", 1, 28)).toEqual({ start: "2026-11-16", end: "2026-12-13" });
    expect(nextInstallmentDate("2026-11-16", 1, 28)).toBe("2026-12-14");
    expect(nextInstallmentDate("2026-11-16", 1)).toBe("2026-12-16");
  });
  it.each([[2, 60], [4, 100], [7, 100], [8, 180], [15, 240], [22, 280], [42, 420]])("%i rental days cost %i net", (days, total) => {
    expect(tierPriceWeek(prices, days)?.total).toBe(total);
    expect(server.tierPriceWeek(prices, days)?.total).toBe(total);
  });
  it("2 days without short tariff cost one week, 100", () => expect(tierPriceWeek({ ...prices, price_short_1_3_rd: null }, 2)?.total).toBe(100));
  it("15 days with empty 3-week tier cost 270", () => expect(tierPriceWeek({ ...prices, price_from_3_weeks: null }, 15)?.total).toBe(270));
  it.each([["07:00", 7, 100], ["09:00", 8, 180]])("Monday 08:00 to next Monday %s counts %i days", (time, days, total) => {
    const start = { date: "2026-11-16", time: "08:00" }; const end = { date: "2026-11-23", time };
    expect(rentalBlockCount(start, end)).toBe(days);
    expect(computeRentalLinePrice({ scheme: "woche", prices, start, end })).toMatchObject({ unit: "pauschal", duration: 1, unit_price: total });
  });
  it("weekend tariff and unused weekend flags never affect week pricing", () => {
    expect(computeRentalLinePrice({ scheme: "woche", prices, start: { date: "2026-11-20", time: "16:00" }, end: { date: "2026-11-23", time: "09:00" }, opts: { use_saturday: false, use_sunday: false } })).toMatchObject({ kind: "tier", unit_price: 60 });
  });
  it("weekly example totals 180 once per article, not once per rental day", () => {
    const result = computeRentalLinePrice({ scheme: "woche", prices, start: { date: "2026-11-16", time: "08:00" }, end: { date: "2026-11-27", time: "16:00" } });
    expect(result).toMatchObject({ unit_price: 180, duration: 1, label: "2 Wochen" });
    if (result.kind === "duration_only") throw new Error("Expected a maintained tariff");
    expect(lineTotal({ quantity: 1, duration: result.duration, unit_price: result.unit_price, discount_percent: 0 })).toBe(180);
    expect(calendarDescription({ product_name: "Bautrockner", quantity: 1, unit_price: 180, discount_percent: 0, rental_period_label: result.label, rental_start: "2026-11-16", rental_start_time: "08:00", rental_end: "2026-11-27", rental_end_time: "16:00" })).toContain("Mietzeitraum 2 Wochen");
  });
  it("unknown week prices do not fall back to old daily or event amounts", () => {
    const resolved = resolveProductPrices({ pricing_scheme: "woche", price_per_day: "99 €/Tag" }, null);
    expect(tierPriceWeek(resolved, 2)).toBeNull();
  });
  it("location weekly prices override product tiers and keep empty tier fallback", () => {
    const resolved = resolveProductPrices({ id: "p", pricing_scheme: "woche", prices_same_all_locations: false, ...prices }, "bonn", [{ managed_product_id: "p", location: "bonn", price_from_1_week: 100, price_from_2_weeks: 90, price_from_3_weeks: null }]);
    expect(tierPriceWeek(resolved, 15)?.total).toBe(270);
  });
  it("CMS week schema has exactly five fields and no weekend/autofill", () => {
    expect(schemeFields("woche").map(field => field.key)).toEqual(["price_short_1_3_rd", "price_from_1_week", "price_from_2_weeks", "price_from_3_weeks", "price_from_4_weeks"]);
    const set = { ...emptyPriceSet(), price_from_1_week: "100" };
    expect(applyBauTierAutofill("woche", emptyPriceSet(), set, []).set).toEqual(set);
  });
  it("net 100 displays gross 119 for private customers and net 100 for businesses", () => {
    expect(displayPrice(100, "private")).toContain("119");
    expect(displayPrice(100, "business")).toContain("100");
  });
});