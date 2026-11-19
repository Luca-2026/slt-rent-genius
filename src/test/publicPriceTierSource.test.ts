import { describe, expect, it } from "vitest";
import { managedRowToProduct, type ManagedProductRow } from "@/hooks/useManagedProducts";
import { productManagedPrices } from "@/components/rental/ProductPriceBlock";

const row = {
  id: "p", slug: "machine", name: "Machine", category: "erdbewegung", images: [],
  pricing_scheme: "bau", prices_same_all_locations: false,
  price_from_1_rd: 100, price_from_3_rd: 90, price_from_10_rd: 80, price_from_20_rd: 60,
} as ManagedProductRow;
const location = [{ managed_product_id: "p", location: "bonn", price_from_1_rd: 90, price_from_3_rd: 81, price_from_10_rd: 72, price_from_20_rd: 54 }];
describe("public tier source across detail views", () => {
  it("preserves location-specific price choice through public product mapping", () => {
    const product = managedRowToProduct(row);
    expect(product.pricesSameAllLocations).toBe(false);
    expect(productManagedPrices(product, "bonn", location)).toMatchObject({ price_from_1_rd: 90, price_from_3_rd: 81, price_from_10_rd: 72, price_from_20_rd: 54 });
  });
  it("does not override shared article tiers with obsolete location rows", () => {
    expect(productManagedPrices(managedRowToProduct({ ...row, prices_same_all_locations: true }), "bonn", location)).toMatchObject({ price_from_1_rd: 100, price_from_3_rd: 90, price_from_10_rd: 80, price_from_20_rd: 60 });
  });
});