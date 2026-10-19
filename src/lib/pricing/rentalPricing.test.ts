import { describe, expect, it } from "vitest";
import {
  berlinInstant,
  computeRentalLinePrice,
  defaultUnit,
  insuranceCalendarDays,
  isUncountedBlock,
  resolveProductPrices,
  rentalDuration,
  tierPriceBau,
  tierPriceEvent,
  unitAbbreviation,
  unitLabel,
  weekendTariff,
} from "./rentalPricing";
import * as mirror from "../../../supabase/functions/_shared/rental-pricing";

// Oktober 2026: Fr 16.10., Sa 17., So 18., Mo 19., Di 20.; Di 13.10.
const m = (date: string, time?: string) => ({ date, time });
const at = (date: string, time: string) => berlinInstant(m(date, time), "00:00")!;

describe("1a rentalDuration – Kalendertage", () => {
  it("13.10. bis 14.10. = 2 KT", () => expect(rentalDuration(m("2026-10-13"), m("2026-10-14"), "kalendertage")).toBe(2));
  it("13.10. 08:00 bis 13.10. 17:00 = 1 KT", () =>
    expect(rentalDuration(m("2026-10-13", "08:00"), m("2026-10-13", "17:00"), "kalendertage")).toBe(1));
  it("13.10. 08:00 bis 14.10. 17:00 = 2 KT / 2 MT", () => {
    expect(rentalDuration(m("2026-10-13", "08:00"), m("2026-10-14", "17:00"), "kalendertage")).toBe(2);
    expect(rentalDuration(m("2026-10-13", "08:00"), m("2026-10-14", "17:00"), "miettage")).toBe(2);
  });
  it("13.10. 08:00 bis 14.10. 07:00 = 2 KT / 1 MT", () => {
    expect(rentalDuration(m("2026-10-13", "08:00"), m("2026-10-14", "07:00"), "kalendertage")).toBe(2);
    expect(rentalDuration(m("2026-10-13", "08:00"), m("2026-10-14", "07:00"), "miettage")).toBe(1);
  });
  it("späte Uhrzeit verschiebt keinen Kalendertag (keine UTC-Mitternacht)", () =>
    expect(rentalDuration(m("2026-10-13", "23:30"), m("2026-10-14", "00:30"), "kalendertage")).toBe(2));
});

describe("1a rentalDuration – Miettage", () => {
  it("Fr 10:00 bis Mo 09:30 = 2 MT (Sonntag frei, Montagmorgen frei)", () =>
    expect(rentalDuration(m("2026-10-16", "10:00"), m("2026-10-19", "09:30"), "miettage")).toBe(2));
  it("Fr 16:30 bis Di 12:00 = 3 MT (Fr, Sa, Mo; So frei)", () =>
    expect(rentalDuration(m("2026-10-16", "16:30"), m("2026-10-20", "12:00"), "miettage")).toBe(3));
  it("Mo 08:00 bis folgenden Mo 08:00 ohne Haken = 5 MT", () =>
    expect(rentalDuration(m("2026-10-12", "08:00"), m("2026-10-19", "08:00"), "miettage")).toBe(5));
  it("… mit use_saturday = 6 MT", () =>
    expect(rentalDuration(m("2026-10-12", "08:00"), m("2026-10-19", "08:00"), "miettage", { use_saturday: true })).toBe(6));
});

describe("isUncountedBlock (Stand 15.10., Bestätigung ausstehend)", () => {
  const end = at("2026-10-20", "12:00");
  it("unter 5 Blöcken: Sonntagsblock zählt nicht", () => expect(isUncountedBlock(at("2026-10-18", "10:00"), end, 3)).toBe(true));
  it("unter 5 Blöcken: Samstagsblock zählt", () => expect(isUncountedBlock(at("2026-10-17", "10:00"), end, 3)).toBe(false));
  it("Montagsblock zählt nicht bei Rückgabe Mo bis 09:30", () =>
    expect(isUncountedBlock(at("2026-10-19", "08:00"), at("2026-10-19", "09:30"), 3)).toBe(true));
  it("Montagsblock zählt bei Rückgabe Mo nach 09:30", () =>
    expect(isUncountedBlock(at("2026-10-19", "08:00"), at("2026-10-19", "09:31"), 3)).toBe(false));
  it("ab 5 Blöcken: Samstag/Sonntag nur mit Haken", () => {
    expect(isUncountedBlock(at("2026-10-17", "08:00"), end, 7)).toBe(true);
    expect(isUncountedBlock(at("2026-10-17", "08:00"), end, 7, { use_saturday: true })).toBe(false);
    expect(isUncountedBlock(at("2026-10-18", "08:00"), end, 7)).toBe(true);
    expect(isUncountedBlock(at("2026-10-18", "08:00"), end, 7, { use_sunday: true })).toBe(false);
    expect(isUncountedBlock(at("2026-10-19", "08:00"), at("2026-10-19", "09:00"), 7)).toBe(false);
  });
});

describe("1b defaultUnit", () => {
  it("bau → miettage, event → kalendertage", () => {
    expect(defaultUnit({ pricing_scheme: "bau" })).toBe("miettage");
    expect(defaultUnit({ pricing_scheme: "event" })).toBe("kalendertage");
  });
});

describe("1c tierPriceBau", () => {
  it("5 MT, Stufe ab 3 leer → Satz ab 1", () =>
    expect(tierPriceBau({ price_from_1_rd: 100, price_from_3_rd: null }, 5)).toMatchObject({ rate: 100, threshold: 1 }));
  it("5 MT, Stufe ab 3 gefüllt → Satz ab 3", () =>
    expect(tierPriceBau({ price_from_1_rd: 100, price_from_3_rd: 80 }, 5)).toMatchObject({ rate: 80, threshold: 3 }));
  it("25 MT, ab 20 und ab 10 leer → Satz ab 3", () =>
    expect(tierPriceBau({ price_from_1_rd: 100, price_from_3_rd: 80 }, 25)?.rate).toBe(80));
  it("ohne Werte → null", () => expect(tierPriceBau({}, 5)).toBeNull());
});

describe("1d tierPriceEvent (Grundpreis 100)", () => {
  const p = { price_base_1_3_cd: 100 };
  it("3 KT = 100", () => expect(tierPriceEvent(p, 3)?.total).toBe(100));
  it("5 KT = 200", () => expect(tierPriceEvent(p, 5)?.total).toBe(200));
  it("7 KT = 300", () => expect(tierPriceEvent(p, 7)?.total).toBe(300));
  it("10 KT = 240", () => expect(tierPriceEvent(p, 10)?.total).toBe(240));
  it("eigene Aufschläge haben Vorrang", () =>
    expect(tierPriceEvent({ price_base_1_3_cd: 100, surcharge_per_cd_from_4: 10 }, 5)?.total).toBe(120));
});

describe("1e weekendTariff", () => {
  const prices = { price_from_1_rd: 100, price_weekend_num: 150 };
  it("Fr 16:30 bis Mo 09:00 → Wochenendtarif", () =>
    expect(weekendTariff(m("2026-10-16", "16:30"), m("2026-10-19", "09:00"), prices)).toEqual({ price: 150 }));
  it("Fr 10:00 bis Mo 09:30 → kein Wochenendtarif, 2 MT", () => {
    expect(weekendTariff(m("2026-10-16", "10:00"), m("2026-10-19", "09:30"), prices)).toBeNull();
    expect(computeRentalLinePrice({ prices, scheme: "bau", start: m("2026-10-16", "10:00"), end: m("2026-10-19", "09:30") }))
      .toMatchObject({ kind: "tier", unit: "miettage", duration: 2, unit_price: 100 });
  });
  it("Fr 16:30 bis Di 12:00 → kein Wochenendtarif", () =>
    expect(weekendTariff(m("2026-10-16", "16:30"), m("2026-10-20", "12:00"), prices)).toBeNull());
  it("ohne price_weekend_num → normale Berechnung", () =>
    expect(computeRentalLinePrice({ prices: { price_from_1_rd: 100 }, scheme: "bau", start: m("2026-10-16", "16:30"), end: m("2026-10-19", "09:00") }).kind).toBe("tier"));
  it("Positionspreis = price_weekend_num, pauschal", () =>
    expect(computeRentalLinePrice({ prices, scheme: "event", start: m("2026-10-16", "16:30"), end: m("2026-10-19", "09:00") }))
      .toMatchObject({ kind: "weekend", unit: "pauschal", duration: 1, unit_price: 150 }));
});

describe("1f insuranceCalendarDays", () => {
  it("immer Kalendertage", () => expect(insuranceCalendarDays(m("2026-10-16", "10:00"), m("2026-10-19", "09:30"))).toBe(4));
});

describe("1g unitLabel", () => {
  it("Einzahl bei 1, sonst Mehrzahl", () => {
    expect(unitLabel(1, "miettage")).toBe("Miettag");
    expect(unitLabel(1, "kalendertage")).toBe("Kalendertag");
    expect(unitLabel(1, "wochen")).toBe("Woche");
    expect(unitLabel(1, "monate")).toBe("Monat");
    expect(unitLabel(1, "stueck")).toBe("Stück");
    expect(unitLabel(2, "miettage")).toBe("Miettage");
    expect(unitLabel(3, "wochen")).toBe("Wochen");
  });
  it("Abkürzungen MT/KT", () => {
    expect(unitAbbreviation("miettage")).toBe("MT");
    expect(unitAbbreviation("kalendertage")).toBe("KT");
  });
});

describe("1h resolveProductPrices", () => {
  const product = { id: "p1", pricing_scheme: "bau", prices_same_all_locations: false, price_from_1_rd: 100 };
  it("Standortzeile, wenn Preise je Standort abweichen", () =>
    expect(resolveProductPrices(product, "bonn", [{ location: "bonn", managed_product_id: "p1", price_from_1_rd: 90 }]).price_from_1_rd).toBe(90));
  it("sonst Artikelfelder", () =>
    expect(resolveProductPrices({ ...product, prices_same_all_locations: true }, "bonn", [{ location: "bonn", price_from_1_rd: 90 }]).price_from_1_rd).toBe(100));
  it("Fallback auf price_per_day", () => {
    expect(resolveProductPrices({ pricing_scheme: "bau", price_per_day: "89,00 €/Tag" }, null).price_from_1_rd).toBe(89);
    expect(resolveProductPrices({ pricing_scheme: "event", price_per_day: "89,00 €/Tag" }, null).price_base_1_3_cd).toBe(89);
  });
});

describe("Spiegelkopie", () => {
  it("Server-Kopie rechnet identisch", () =>
    expect(mirror.rentalDuration(m("2026-10-16", "10:00"), m("2026-10-19", "09:30"), "miettage")).toBe(2));
});

describe("Sonntag als Nutzungstag gewünscht", () => {
  it("Fr 23.10. 18:00 bis Mo 26.10. 16:41 mit Sa+So = 3 Miettage", () => {
    expect(rentalDuration({ date: "2026-10-23", time: "18:00" }, { date: "2026-10-26", time: "16:41" }, "miettage", { use_saturday: true, use_sunday: true })).toBe(3);
  });
  it("ohne Sonntagsnutzung bleibt es bei 2 Miettagen", () => {
    expect(rentalDuration({ date: "2026-10-23", time: "18:00" }, { date: "2026-10-26", time: "16:41" }, "miettage")).toBe(2);
  });
});
