import { describe, expect, it } from "vitest";
import { calendarDaysInclusive, computeAddonAmount, daysPerUnit, describeAddon } from "@/lib/addonCalc";
import { recalcAddons } from "@/components/b2b/inquiries/OfferAddonSection";
import { suggestAddonAmount } from "@/lib/offerAddons";

const bagger = { articles: 2, duration: 10, days_per_unit: 1, unit_price: 120, discount_percent: 0 };

describe("Zusatzoptionen – Berechnung", () => {
  it("zählt Kalendertage inkl. Start und Ende", () => {
    expect(calendarDaysInclusive("2026-10-01", "2026-10-14")).toBe(14);
    expect(calendarDaysInclusive("2026-10-01", "2026-10-01")).toBe(1);
    expect(calendarDaysInclusive("2026-10-05", "2026-10-01")).toBeNull();
    expect(calendarDaysInclusive("2026-10-01", null)).toBeNull();
  });

  it("Prozent wie Mietposition: nach Arbeitstagen", () => {
    expect(computeAddonAmount({ price_type: "percent", rate: 12, basis: "line" }, bagger)).toBe(288);
  });

  it("Prozent über gesamte Mietdauer: 14 Kalendertage statt 10 Arbeitstage", () => {
    expect(computeAddonAmount({ price_type: "percent", rate: 12, basis: "full_period", days: 14 }, bagger)).toBe(403.2);
  });

  it("berücksichtigt Rabatt", () => {
    expect(
      computeAddonAmount({ price_type: "percent", rate: 10, basis: "full_period", days: 7 }, { ...bagger, articles: 1, discount_percent: 50 }),
    ).toBe(42);
  });

  it("Tagessatz je Artikel", () => {
    expect(computeAddonAmount({ price_type: "per_unit", rate: 4, basis: "line" }, bagger)).toBe(80);
    expect(computeAddonAmount({ price_type: "per_unit", rate: 4, basis: "full_period", days: 14 }, bagger)).toBe(112);
  });

  it("Wochenpreis wird auf Tagespreis umgerechnet", () => {
    const woche = { articles: 1, duration: 2, days_per_unit: 7, unit_price: 700, discount_percent: 0 };
    expect(computeAddonAmount({ price_type: "percent", rate: 10, basis: "full_period", days: 16 }, woche)).toBe(160);
  });

  it("Pauschale bleibt Festbetrag, fehlende Tage → nicht berechenbar", () => {
    expect(computeAddonAmount({ price_type: "flat", rate: 35, basis: "once" }, bagger)).toBe(35);
    expect(computeAddonAmount({ price_type: "percent", rate: 12, basis: "full_period", days: null }, bagger)).toBeNull();
    expect(computeAddonAmount({ price_type: "percent", rate: 12, basis: "full_period", days: 5 }, { ...bagger, days_per_unit: null })).toBeNull();
  });

  it("Einheiten → Tage", () => {
    expect(daysPerUnit("arbeitstage")).toBe(1);
    expect(daysPerUnit("Wochen")).toBe(7);
    expect(daysPerUnit("Monat")).toBe(30);
    expect(daysPerUnit("Stück")).toBeNull();
    expect(daysPerUnit("pauschal")).toBeNull();
  });

  it("Kundentext erklärt die gesamte Mietdauer", () => {
    const t = describeAddon({ price_type: "percent", rate: 12, basis: "full_period", days: 14, period_start: "2026-10-01", period_end: "2026-10-14" });
    expect(t).toContain("12 %");
    expect(t).toContain("14 Kalendertage (01.10.–14.10.2026)");
    expect(t).toContain("Wochenende");
    expect(describeAddon({ price_type: "percent", rate: 12, basis: "line" })).toBe("12 % der Mietsumme dieser Position");
    expect(describeAddon({})).toBe("");
  });

  it("Vorschlag bezieht die Mietdauer ein (alter Fehler)", () => {
    expect(suggestAddonAmount({ price_type: "percent", price: 12 }, { quantity: 2, duration: 5, unit_price: 120 })).toBe(144);
  });

  it("Neuberechnung bei Mengenänderung, manuelle Beträge bleiben", () => {
    const line = {
      product_name: "Bagger", quantity: 3, duration: 10, unit: "arbeitstage" as const, unit_price: 120, discount_percent: 0,
      addons: [
        { key: "mb", label: "MB", amount: 403.2, price_type: "percent" as const, rate: 12, basis: "full_period" as const, days: 14 },
        { key: "x", label: "X", amount: 99, price_type: "percent" as const, rate: 12, basis: "line" as const, manual: true },
      ],
    };
    const r = recalcAddons(line);
    expect(r.addons![0].amount).toBe(604.8);
    expect(r.addons![1].amount).toBe(99);
    const stueck = recalcAddons({ ...line, unit: "stueck" as const });
    expect(stueck.addons![0].basis).toBe("line");
  });
});
