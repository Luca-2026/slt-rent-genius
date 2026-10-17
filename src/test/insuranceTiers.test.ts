import { describe, expect, it } from "vitest";
import { buildAddonsFromOptions } from "@/components/b2b/inquiries/OfferAddonSection";
import { parseAddonOptions } from "@/lib/offerAddons";

const options = parseAddonOptions([
  { key: "maschinenbruch", label: "Maschinenbruchversicherung", price: 10, deductible: 1500, is_default: true, price_type: "percent", sort_order: 0, full_period_default: true },
  { key: "sb_reduktion", label: "Reduzierung Selbstbehalt", price: 15, deductible: 500, is_default: false, price_type: "percent", sort_order: 1, surcharge_percent: 50, full_period_default: true },
]);
const item = { product_name: "Minibagger", quantity: 1, duration: 3, unit: "miettage", unit_price: 100, discount_percent: 0 } as never;

describe("Versicherung im Angebot", () => {
  it("Maschinenbruch wird über Kalendertage des Zeitraums berechnet, nicht pauschal", () => {
    const [std] = buildAddonsFromOptions([options[0]], options, item, "2026-10-16", "2026-10-20");
    expect(std.basis).toBe("full_period");
    expect(std.days).toBe(5);
  });
  it("Stufen-Prozentsatz bezieht sich auf den Standardbetrag, nie auf den Mietpreis", () => {
    // Standard: 10 % von 100 €/Tag = 10 €/KT; Stufe 50 % = 5 €/KT Aufpreis, 5 KT = 25 €
    const out = buildAddonsFromOptions([options[0]], options, item, "2026-10-16", "2026-10-20");
    const tier = out.find((a) => a.key === "opt-sb_reduktion");
    expect(tier?.optional).toBe(true);
    expect(tier?.label).toContain("500");
    expect(tier?.per_day).toBe(5);
    expect(tier?.amount).toBe(25);
  });
  it("Stufe ohne Aufschlag wird nicht angeboten (keine zweite Variante „Prozent vom Mietpreis“)", () => {
    const noSurcharge = parseAddonOptions([
      { key: "maschinenbruch", label: "Maschinenbruchversicherung", price: 10, deductible: 1500, is_default: true, price_type: "percent", sort_order: 0, full_period_default: true },
      { key: "sb_reduktion", label: "Reduzierung Selbstbehalt", price: 15, deductible: 500, is_default: false, price_type: "percent", sort_order: 1, surcharge_percent: null, full_period_default: true },
    ]);
    const out = buildAddonsFromOptions([noSurcharge[0]], noSurcharge, item, "2026-10-16", "2026-10-20");
    expect(out.some((a) => a.key === "opt-sb_reduktion")).toBe(false);
  });
});
