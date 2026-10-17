import { describe, it, expect } from "vitest";
import { resolveCatalogPrice } from "./catalogPricing";

describe("resolveCatalogPrice (CMS netto → Angebot netto)", () => {
  it("Bau-Tagespreis bleibt auch ohne numerische Grundstaffel in Miettagen", async () => {
    expect(await resolveCatalogPrice({ pricing_scheme: "bau", price_per_day: "84,00 €/Tag" })).toEqual({ price: 84, unit: "miettage" });
  });
  it("Bau-Grundstaffel wird in Miettagen übernommen", async () => {
    expect(await resolveCatalogPrice({ pricing_scheme: "bau", price_from_1_rd: 84 })).toEqual({ price: 84, unit: "miettage" });
  });
  it("übernimmt den Netto-Tagespreis unverändert", async () => {
    expect(await resolveCatalogPrice({ slug: "x", price_per_day: "100,00 €/Tag" })).toEqual({ price: 100, unit: "kalendertage" });
  });
  it("Monatspreis ebenfalls unverändert netto", async () => {
    expect(await resolveCatalogPrice({ slug: "zzz-unbekannt", price_per_month: "1.000 €" })).toEqual({ price: 1000, unit: "monate" });
  });
});
