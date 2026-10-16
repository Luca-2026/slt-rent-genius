import { describe, it, expect } from "vitest";
import { parsePriceInput, formatDayPriceText, legacyDayPrice, emptyPriceSet } from "@/components/b2b/admin/ManagedPriceFields";
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
