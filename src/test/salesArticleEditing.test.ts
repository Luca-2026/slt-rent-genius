import { describe, expect, it } from "vitest";
import { salesArticleCopy, salesArticleValidation } from "@/lib/salesArticleEditing";
import type { NewMachineRow, UsedMachineRow } from "@/hooks/useSalesCatalog";

describe("sales article editing", () => {
  it("accepts a sale article without a model", () => {
    expect(salesArticleValidation({ brand: "Schrankenzaun RA1", category: "Absperr- & Verkehrstechnik" })).toBeNull();
  });
  it("retains the remaining required fields", () => {
    expect(salesArticleValidation({ brand: "", category: "Verkauf" })).not.toBeNull();
    expect(salesArticleValidation({ brand: "Schrankenzaun", category: "" })).not.toBeNull();
  });
  it("copies new goods independently, unpublished, keeping prices and specifications", () => {
    const row = { id: "source", slug: "schrankenzaun", brand: "Schrankenzaun", model: "", price_gross: 94, is_active: true, is_featured: true, article_number: "RA1", gtin: "123", specifications: { Farbe: "Rot" } } as unknown as NewMachineRow;
    const copy = salesArticleCopy("new", row, "new-id") as NewMachineRow;
    expect(copy.id).toBe("new-id"); expect(copy.slug).toBe("schrankenzaun-kopie-new-id");
    expect(copy.is_active).toBe(false); expect(copy.article_number).toBeNull(); expect(copy.gtin).toBeNull();
    expect(copy.price_gross).toBe(94); expect(copy.model).toBe("");
    copy.specifications = { Farbe: "Blau" };
    expect(row.specifications).toEqual({ Farbe: "Rot" }); expect(row.is_active).toBe(true);
  });
  it("copies used goods hidden without reusing their reference number", () => {
    const row = { id: "source", slug: "gebraucht", manufacturer: "BAUMAX", model: "VP16", status: "sold", reference_number: "123", price_net: 100, hours: 20 } as UsedMachineRow;
    const copy = salesArticleCopy("used", row, "new-id") as UsedMachineRow;
    expect(copy.status).toBe("hidden"); expect(copy.reference_number).toBeNull();
    expect(copy.price_net).toBe(100); expect(copy.hours).toBe(20); expect(row.status).toBe("sold");
  });
});