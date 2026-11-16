import { describe, expect, it } from "vitest";
import { getUsedMachineHeading, getUsedMachineName, usedMachineCategoryRows } from "@/data/usedMachineDisplayNames";
import { analyze, buildCategoryIndex, lookupCategory } from "@/lib/revenueAnalytics";

describe("used sales goods without model", () => {
  it("uses the maintained name once without inventing a model", () => {
    const article = { manufacturer: "Schrankenzaun RA1", model: "" };
    expect(getUsedMachineHeading(article)).toBe("Schrankenzaun RA1");
    expect(getUsedMachineName(article)).toBe("Schrankenzaun RA1");
    expect(getUsedMachineHeading({ ...article, model: "  " })).toBe("Schrankenzaun RA1");
  });
  it("keeps maintained model display overrides", () => {
    const article = { manufacturer: "Zoomlion", model: "ZMP09J Mastbühne" };
    expect(getUsedMachineHeading(article)).toBe("ZMP09J Mastbühne (11,2m Arbeitshöhe)");
    expect(getUsedMachineName(article)).toBe("Zoomlion ZMP09J Mastbühne (11,2m Arbeitshöhe)");
  });
  it("assigns model-free sales amounts without modifying paid invoice evidence", () => {
    const index = buildCategoryIndex(usedMachineCategoryRows([{ manufacturer: "Schrankenzaun RA1", model: "", category: "Absperr- & Verkehrstechnik" }]));
    const invoice = { id: "test", source: "inquiry" as const, business: "sales" as const, invoice_kind: "invoice", status: "paid", invoice_date: "2026-11-16", net_amount: 100, location: "bonn", segment: "business" as const, items: [{ product_name: "Schrankenzaun RA1", total_price: 100 }] };
    const original = structuredClone(invoice);
    const result = analyze([invoice], index, { business: "sales", from: null, to: null, location: "all", segment: "all", category: "all" });
    expect(result.byCategory[0].key).toBe("Absperr- & Verkehrstechnik");
    expect(result.byCategory[0].revenue).toBe(100); expect(result.total).toBe(100);
    expect(invoice).toEqual(original);
  });
  it("retains model-only and full catalogue names for old and new sales lines", () => {
    const index = buildCategoryIndex(usedMachineCategoryRows([{ manufacturer: "BAUMAX", model: "VP16", category: "Verdichtung" }]));
    expect(lookupCategory(index, "VP16")).toBe("Verdichtung");
    expect(lookupCategory(index, "BAUMAX VP16")).toBe("Verdichtung");
  });
});