import { describe, expect, it } from "vitest";
import { buildAddonsFromOptions } from "@/components/b2b/inquiries/OfferAddonSection";
import { parseAddonOptions } from "@/lib/offerAddons";

const options = parseAddonOptions([
  { key: "maschinenbruch", label: "Maschinenbruchversicherung", price: 10, deductible: 1500, is_default: true, price_type: "percent", sort_order: 0, full_period_default: true },
  { key: "sb_reduktion", label: "Reduzierung Selbstbehalt", price: 15, deductible: 500, is_default: false, price_type: "percent", sort_order: 1, surcharge_percent: null, full_period_default: true },
]);
const item = { product_name: "Minibagger", quantity: 1, duration: 3, unit: "miettage", unit_price: 100, discount_percent: 0 } as never;

describe("Versicherung im Angebot", () => {
  it("Maschinenbruch wird über Kalendertage des Zeitraums berechnet, nicht pauschal", () => {
    const [std] = buildAddonsFromOptions([options[0]], options, item, "2026-10-16", "2026-10-20");
    expect(std.basis).toBe("full_period");
    expect(std.days).toBe(5);
  });
  it("Reduzierung Selbstbehalt ohne Aufschlagsfeld erscheint als optionale Stufe", () => {
    const out = buildAddonsFromOptions([options[0]], options, item, "2026-10-16", "2026-10-20");
    const tier = out.find((a) => a.key === "opt-sb_reduktion");
    expect(tier?.optional).toBe(true);
    expect(tier?.label).toContain("500");
  });
});
