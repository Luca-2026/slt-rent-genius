import { describe, expect, it } from "vitest";
import { berlinDay, revenueRange, shiftRevenuePeriod, revenueQueryArgs, revenueEntryCsv, canViewRevenue, revenueBranch } from "@/lib/revenueReport";
import { visibleGroups } from "@/components/b2b/StaffNav";

describe("Berliner Umsatzzeiträume", () => {
  it("uses the Berlin day even while UTC is still the previous day", () => {
    expect(berlinDay(new Date("2026-11-23T23:30:00Z"))).toBe("2026-11-24");
  });
  it.each([
    ["day", "2026-11-24", "2026-11-24"], ["week", "2026-11-23", "2026-11-24"],
    ["month", "2026-11-01", "2026-11-24"], ["quarter", "2026-10-01", "2026-11-24"],
    ["year", "2026-01-01", "2026-11-24"],
  ] as const)("%s includes today and starts at its calendar boundary", (period, from, to) => {
    expect(revenueRange(period, "2026-11-24", "2026-11-24")).toEqual({ from, to });
  });
  it("Monday week can start in the previous year", () => {
    expect(revenueRange("week", "2027-01-01", "2027-01-01")).toEqual({ from: "2026-12-28", to: "2027-01-01" });
  });
  it("previous month navigation never skips February on a 31st", () => {
    expect(shiftRevenuePeriod("month", "2026-03-31", -1)).toBe("2026-02-01");
    expect(revenueRange("month", "2026-02-01", "2026-11-24")).toEqual({ from: "2026-02-01", to: "2026-02-28" });
  });
  it("DST does not shorten the calendar week", () => {
    expect(revenueRange("week", "2026-03-29", "2026-11-24")).toEqual({ from: "2026-03-23", to: "2026-03-29" });
  });
});
it("preserves explicit protected location and stage query parameters", () => {
  expect(revenueQueryArgs({ from: "2026-11-01", to: "2026-11-24", stage: "accepted", business: "sales", location: "bonn", offset: 100 })).toMatchObject({ p_location: "bonn", p_stage: "accepted", p_business: "sales", p_offset: 100 });
});
it("passes Mülheim as a separate report filter rather than converting it to Krefeld", () => {
  expect(revenueQueryArgs({ from: "2026-11-01", to: "2026-11-24", location: "muelheim" }).p_location).toBe("muelheim");
});
it("unknown net amounts stay empty in exports rather than being invented as zero", () => {
  const csv = revenueEntryCsv([{ id: "1", source_id: "2", source_table: "rental_inquiries", stage: "accepted", business: "rental", event_date: "2026-11-24", document_number: "ANG-1", order_code: "6ZHACN", customer_name: "Kunde", location: "bonn", net_amount: null, event_kind: "Annahme", warning: "Netto nicht belegt", status: "accepted" }]);
  expect(csv.split("\n")[1]?.split(";").slice(-2).map(s => s.replace(/^"|"$/g, ""))).toEqual(["", "Netto nicht belegt"]);
});
it("revenue access is separate from cost editing and is scoped to active managers", () => {
  expect(canViewRevenue(true, false, false)).toBe(true);
  expect(canViewRevenue(false, true, true, "bonn")).toBe(true);
  expect(canViewRevenue(false, true, false, "bonn")).toBe(false);
  expect(canViewRevenue(false, true, true, null)).toBe(false);
  expect(canViewRevenue(false, false, true, "bonn")).toBe(false);
  expect(revenueBranch("Mülheim an der Ruhr")).toBe("krefeld");
});
it("manager navigation exposes revenue without exposing team or audit", () => {
  const paths = visibleGroups(false, true, false, true).flatMap(g => g.items.map(i => i.path));
  expect(paths).toContain("/b2b/auswertungen");
  expect(visibleGroups(false, true).flatMap(g => g.items.map(i => i.label))).not.toContain("Umsatzauswertung");
  expect(visibleGroups(false, true, false, true).flatMap(g => g.items.map(i => i.label))).not.toContain("Audit-Log");
});