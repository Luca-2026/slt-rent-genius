import { describe, expect, it } from "vitest";
import { checkSalesPrice, findSalesArticle, minimumPrice } from "@/lib/salesPricing";

describe("minimumPrice", () => {
  it("adds 10 % overhead by default", () => {
    expect(minimumPrice(1000)).toBe(1100);
    expect(minimumPrice(1234.56)).toBe(1358.02);
  });
  it("respects custom overhead and handles missing values", () => {
    expect(minimumPrice(1000, 15)).toBe(1150);
    expect(minimumPrice(null)).toBeNull();
    expect(minimumPrice(-5)).toBeNull();
  });
});

describe("checkSalesPrice", () => {
  it("computes margin after discount and quantity", () => {
    const r = checkSalesPrice({ unitPrice: 1500, discountPercent: 10, quantity: 2, minimum: 1100, target: 1500 });
    expect(r.achieved).toBe(1350);
    expect(r.marginPerUnit).toBe(250);
    expect(r.marginTotal).toBe(500);
    expect(r.belowMinimum).toBe(false);
    expect(r.belowTarget).toBe(true);
  });
  it("flags prices below minimum", () => {
    const r = checkSalesPrice({ unitPrice: 1000, minimum: 1100, target: 1500 });
    expect(r.belowMinimum).toBe(true);
    expect(r.marginPerUnit).toBe(-100);
  });
  it("has no margin without purchase price", () => {
    const r = checkSalesPrice({ unitPrice: 1000, minimum: null, target: null });
    expect(r.marginPerUnit).toBeNull();
    expect(r.belowMinimum).toBe(false);
  });
});

describe("findSalesArticle", () => {
  const catalog = [
    { slug: "baumax-sst350", name: "BAUMAX SST350", article_number: "SST350" },
    { slug: "baumax-hvp3050", name: "BAUMAX HVP30/50", article_number: "HVP30/50" },
    { slug: "hercu-hp45", name: "Hercu HP45 T", article_number: null },
  ];
  it("matches by slug first", () => {
    expect(findSalesArticle(catalog, { slug: "baumax-hvp3050", name: "egal" })?.slug).toBe("baumax-hvp3050");
  });
  it("falls back to article number", () => {
    expect(findSalesArticle(catalog, { articleNumber: "hvp30/50" })?.slug).toBe("baumax-hvp3050");
  });
  it("matches website titles that start with the catalog name", () => {
    expect(findSalesArticle(catalog, { name: "BAUMAX SST350 – Steinsäge BAUMAX SST350 inkl. Diamanttrennscheibe" })?.slug).toBe("baumax-sst350");
    expect(findSalesArticle(catalog, { name: "Hercu HP45 T – Erdrakete [Konfiguration: Solo]" })?.slug).toBe("hercu-hp45");
  });
  it("returns null when nothing fits", () => {
    expect(findSalesArticle(catalog, { name: "Unbekannt" })).toBeNull();
  });
});
