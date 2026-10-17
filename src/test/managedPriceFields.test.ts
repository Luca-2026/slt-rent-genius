import { describe, it, expect } from "vitest";
import { parsePriceInput, formatDayPriceText, legacyDayPrice, emptyPriceSet, bauTierPrice, applyBauTierAutofill, recalcBauTiers } from "@/components/b2b/admin/ManagedPriceFields";
import { serializeAddonOptions } from "@/components/b2b/admin/InsuranceTiersEditor";
import { parsePriceValue } from "@/lib/catalogPricing";

describe("CMS-Preisschema", () => {
  it("Monatspreis 900 € ergibt 45,00 ab 20 Miettagen", () => {
    expect(Math.round((parsePriceValue("900,00 €/Monat")! / 20) * 100) / 100).toBe(45);
  });
  it("Zurückgeschriebener Tagespreis liest sich wie vorher", () => {
    const text = formatDayPriceText(parsePriceInput("89,00"));
    expect(text).toBe("89,00 €/Tag");
    expect(parsePriceValue(text)).toBe(89);
  });
  it("Event schreibt den Grundpreis 1–3 KT als Tagespreis zurück", () => {
    expect(legacyDayPrice("event", { ...emptyPriceSet(), price_from_1_rd: "10", price_base_1_3_cd: "120,50" })).toBe(120.5);
    expect(legacyDayPrice("bau", { ...emptyPriceSet(), price_from_1_rd: "10", price_base_1_3_cd: "120,50" })).toBe(10);
  });
  it("Tausenderpunkt wird erkannt", () => {
    expect(parsePriceInput("1.499")).toBe(1499);
  });
  it("Erste Versicherung ist Standard, Aufschlag erst ab Stufe 2", () => {
    const out = serializeAddonOptions(
      [
        { key: "maschinenbruch", label: "Maschinenbruchversicherung", price_type: "percent", price: 10 },
        { key: "vollkasko", label: "Vollkaskoversicherung", price_type: "percent", price: 15 },
      ],
      { maschinenbruch: { surcharge_percent: "5" }, vollkasko: { surcharge_percent: "20" } },
    );
    expect(out.map((o) => [o.sort_order, o.is_default, o.surcharge_percent])).toEqual([[0, true, null], [1, false, 20]]);
  });
});

import { basePriceRequired, isBasePriceMissing } from "@/components/b2b/admin/ManagedPriceFields";

describe("Grundpreis-Pflicht", () => {
  it("nur veröffentlicht und nicht auf Anfrage", () => {
    expect(basePriceRequired({ is_published: true, on_request: false })).toBe(true);
    expect(basePriceRequired({ is_published: false, on_request: false })).toBe(false);
    expect(basePriceRequired({ is_published: true, on_request: true })).toBe(false);
  });
  it("Event prüft 1–3 KT, Bau prüft ab 1 Miettag", () => {
    const set = { ...emptyPriceSet(), price_from_1_rd: "10" };
    expect(isBasePriceMissing("event", set)).toBe(true);
    expect(isBasePriceMissing("bau", set)).toBe(false);
    expect(isBasePriceMissing("event", { ...emptyPriceSet(), price_base_1_3_cd: "99" })).toBe(false);
  });
});

import { legacyWeekendText, legacyMonthText } from "@/components/b2b/admin/ManagedPriceFields";

describe("Rückschreiben Wochenende/Monat in die Alt-Textfelder", () => {
  it("Wochenendpreis 135 landet als Text für die Webseite", () => {
    expect(legacyWeekendText({ ...emptyPriceSet(), price_weekend_num: "135" }, 100, "100,00 €")).toBe("135,00 €");
  });
  it("gelöschter Wochenendpreis leert den Text, nie migrierter Text bleibt", () => {
    expect(legacyWeekendText(emptyPriceSet(), 100, "100,00 €")).toBeNull();
    expect(legacyWeekendText(emptyPriceSet(), null, "ca. 120 €")).toBe("ca. 120 €");
  });
  it("Bau: Monatspreis = ab 20 Miettagen × 20", () => {
    expect(legacyMonthText("bau", { ...emptyPriceSet(), price_from_20_rd: "45" }, 40, "800,00 €")).toBe("900,00 €");
  });
  it("Bau: gelöschte 20er-Staffel leert den Monatstext; Event lässt ihn unverändert", () => {
    expect(legacyMonthText("bau", emptyPriceSet(), 45, "900,00 €")).toBeNull();
    expect(legacyMonthText("event", emptyPriceSet(), null, "900,00 €")).toBe("900,00 €");
  });
});

describe("Automatische Bau-Staffelpreise", () => {
  it("84 € Tagespreis ergibt 76 / 67 / 50 € (kaufmännisch gerundet)", () => {
    expect(bauTierPrice(84, 0.9)).toBe(76);
    expect(bauTierPrice(84, 0.8)).toBe(67);
    expect(bauTierPrice(84, 0.6)).toBe(50);
  });
  it("Tagespreis-Änderung füllt alle drei Staffeln automatisch", () => {
    const prev = emptyPriceSet();
    const next = { ...prev, price_from_1_rd: "115,00" };
    const r = applyBauTierAutofill("bau", prev, next, []);
    expect(r.set.price_from_3_rd).toBe("104,00");
    expect(r.set.price_from_10_rd).toBe("92,00");
    expect(r.set.price_from_20_rd).toBe("69,00");
    expect(r.manual).toEqual([]);
  });
  it("Manuell geänderte Staffel wird markiert und bei Tagespreis-Änderung nicht überschrieben", () => {
    const base = { ...emptyPriceSet(), price_from_1_rd: "100,00", price_from_3_rd: "90,00", price_from_10_rd: "80,00", price_from_20_rd: "60,00" };
    const edited = { ...base, price_from_3_rd: "85,00" };
    const r1 = applyBauTierAutofill("bau", base, edited, []);
    expect(r1.manual).toEqual(["price_from_3_rd"]);
    const r2 = applyBauTierAutofill("bau", r1.set, { ...r1.set, price_from_1_rd: "200,00" }, r1.manual);
    expect(r2.set.price_from_3_rd).toBe("85,00");
    expect(r2.set.price_from_10_rd).toBe("160,00");
    expect(r2.set.price_from_20_rd).toBe("120,00");
  });
  it("Geleerte Staffel gilt wieder als automatisch und wird neu gefüllt", () => {
    const base = { ...emptyPriceSet(), price_from_1_rd: "100,00", price_from_3_rd: "85,00", price_from_10_rd: "80,00", price_from_20_rd: "60,00" };
    const r = applyBauTierAutofill("bau", base, { ...base, price_from_3_rd: "" }, ["price_from_3_rd"]);
    expect(r.manual).toEqual([]);
    expect(r.set.price_from_3_rd).toBe("90,00");
  });
  it("Event-Artikel bleiben unberührt", () => {
    const prev = emptyPriceSet();
    const next = { ...prev, price_base_1_3_cd: "120,00" };
    const r = applyBauTierAutofill("event", prev, next, []);
    expect(r.set.price_from_3_rd).toBe("");
  });
  it("Staffeln neu berechnen verwirft manuelle Markierungen", () => {
    const set = { ...emptyPriceSet(), price_from_1_rd: "84,00", price_from_3_rd: "70,00" };
    const r = recalcBauTiers(set);
    expect(r.price_from_3_rd).toBe("76,00");
    expect(r.price_from_10_rd).toBe("67,00");
    expect(r.price_from_20_rd).toBe("50,00");
  });
});
