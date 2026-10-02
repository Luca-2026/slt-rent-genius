import { describe, it, expect } from "vitest";
import { resolveCatalogPrice, rentalGrossToNet } from "./catalogPricing";

describe("resolveCatalogPrice (CMS brutto → Angebot netto)", () => {
  it("rechnet den Brutto-Tagespreis in netto um", async () => {
    expect(await resolveCatalogPrice({ slug: "x", price_per_day: "119,00 €/Tag" })).toEqual({ price: 100, unit: "kalendertage" });
  });
  it("rundet auf Cent", async () => {
    expect((await resolveCatalogPrice({ slug: "x", price_per_day: "89 €" }))?.price).toBe(74.79);
  });
  it("Monatspreis ebenfalls netto", async () => {
    expect(await resolveCatalogPrice({ slug: "zzz-unbekannt", price_per_month: "1.190 €" })).toEqual({ price: 1000, unit: "monate" });
  });
  it("Hilfsfunktion", () => {
    expect(rentalGrossToNet(59.5)).toBe(50);
  });
});
