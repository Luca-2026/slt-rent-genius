import { describe, expect, it } from "vitest";
import { managedRowToProduct, type ManagedProductRow } from "@/hooks/useManagedProducts";
import { legacyDayText, rowToPriceSet } from "@/components/b2b/admin/ManagedPriceFields";
import { priceText } from "@/components/rental/ProductPriceBlock";

const trailer = {
  id: "test-trailer", slug: "test-trailer", name: "Testanhänger", category: "anhaenger",
  images: [], price_per_day: "ab 15,00 €/Tag", pricing_scheme: "bau", price_from_1_rd: 89,
} as ManagedProductRow;

describe("Anhänger-Abpreis vom CMS bis zur Website", () => {
  it("Technikänderung und erneutes Speichern behalten den Betrag und die Abkennzeichnung", () => {
    const edited = { ...trailer, specifications: { Nutzlast: "900 kg" } };
    const saved = { ...edited, price_per_day: legacyDayText(edited.category, "bau", rowToPriceSet(edited), edited.price_per_day) };
    const product = managedRowToProduct(saved);
    expect(product.pricePerDay).toBe("ab 15,00 €/Tag");
    expect(priceText(product.pricePerDay ?? "", "private")).toBe("ab 17,85\u00a0€");
    expect(priceText(product.pricePerDay ?? "", "business")).toBe("ab 15,00\u00a0€");
    expect(product.specifications).toEqual({ Nutzlast: "900 kg" });
  });
  it("Bereits verlorenes Ab wird in der öffentlichen Darstellung ergänzt, Betrag bleibt gleich", () => {
    expect(managedRowToProduct({ ...trailer, price_per_day: "15,00 €/Tag" }).pricePerDay).toBe("ab 15,00 €/Tag");
  });
  it("Nicht-Anhänger bekommen keine neue Abkennzeichnung", () => {
    expect(managedRowToProduct({ ...trailer, category: "erdbewegung", price_per_day: "89,00 €/Tag" }).pricePerDay).toBe("89,00 €/Tag");
  });
});