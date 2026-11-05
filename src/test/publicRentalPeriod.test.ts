import { describe, it, expect } from "vitest";
import { validPublicRentalPeriod, validCalendarDate } from "../../supabase/functions/_shared/public-rental-period";
const period = { location: "bonn", start_date: "2026-11-05", start_time: "07:00", end_date: "2026-11-06", end_time: "18:00" };
describe("Öffentliche Mietzeiträume", () => {
  it("Bonn erlaubt Freitag bis 18 Uhr", () => expect(validPublicRentalPeriod(period)).toBe(true));
  it("Bonn schließt Donnerstag um 16:30 Uhr", () => expect(validPublicRentalPeriod({ ...period, start_time: "17:00" })).toBe(false));
  it("Bonn ist Samstag geschlossen", () => expect(validPublicRentalPeriod({ ...period, end_date: "2026-11-07", end_time: "10:00" })).toBe(false));
  it("Krefeld erlaubt Samstag bis 14:30 Uhr", () => expect(validPublicRentalPeriod({ ...period, location: "krefeld", start_time: "08:00", end_date: "2026-11-07", end_time: "14:30" })).toBe(true));
  it("Mülheim bleibt nach Vereinbarung anfragbar", () => expect(validPublicRentalPeriod({ ...period, location: "muelheim", end_date: "2026-11-07" })).toBe(true));
  it("Kalender-invalides Datum wird nicht normalisiert", () => expect(validCalendarDate("2026-02-30")).toBe(false));
  for (const location of ["bonn", "krefeld"]) {
    it(`${location}: nur reine Schildermiete erlaubt Sonntag 00:00 bis 23:59`, () => {
      const row = { location, product_slug: "halteverbotsschilder-set", sign_package: "standard", start_date: "2026-11-08", end_date: "2026-11-08", start_time: "00:00", end_time: "23:59" };
      expect(validPublicRentalPeriod(row)).toBe(true);
      expect(validPublicRentalPeriod({ ...row, product_slug: "minibagger" })).toBe(false);
      expect(validPublicRentalPeriod({ ...row, sign_package: "sorglos" })).toBe(false);
    });
  }
  it("24/7 hebt weder Kalender- noch Zeitreihenfolgeprüfung auf", () => {
    const row = { ...period, product_slug: "halteverbotsschilder-set", sign_package: "standard" };
    expect(validPublicRentalPeriod({ ...row, start_time: "24:00" })).toBe(false);
    expect(validPublicRentalPeriod({ ...row, start_date: "2026-02-30" })).toBe(false);
    expect(validPublicRentalPeriod({ ...row, end_date: row.start_date, end_time: row.start_time })).toBe(false);
  });
});