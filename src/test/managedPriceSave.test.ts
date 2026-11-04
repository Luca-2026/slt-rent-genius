import { describe, expect, it } from "vitest";
import { managedPricePatch, changedPriceColumns, type ManagedPriceState } from "@/components/b2b/admin/managedPriceSave";
import { emptyPriceSet } from "@/components/b2b/admin/ManagedPriceFields";

const baseline = (): ManagedPriceState => ({ category: "erdbewegung", pricing_scheme: "bau", prices: { ...emptyPriceSet(), price_from_1_rd: "89,00", price_from_20_rd: "53,00" }, price_per_day: "ab 75,00 €/Tag", price_weekend: "auf Anfrage", price_per_month: "ab 999 €/Monat", tier_prices_manual: [], prices_same_all_locations: true });
describe("independent CMS price saving", () => {
  it("omits all unchanged prices and legacy starting prices during article edits", () => {
    const before = baseline();
    expect(managedPricePatch({ ...before }, before)).toEqual({});
  });
  it("does not clear a legacy starting price when the numeric base is absent", () => {
    const before = { ...baseline(), prices: emptyPriceSet() };
    expect(managedPricePatch({ ...before }, before)).toEqual({});
    expect(before.price_per_day).toBe("ab 75,00 €/Tag");
  });
  it("saves a deliberately changed base and retains its starting-price prefix", () => {
    const before = baseline();
    expect(managedPricePatch({ ...before, prices: { ...before.prices, price_from_1_rd: "100" } }, before)).toEqual({ price_from_1_rd: 100, price_per_day: "ab 100,00 €/Tag" });
  });
  it("weekend-only edit does not regenerate daily or monthly prices", () => {
    const before = baseline();
    expect(managedPricePatch({ ...before, prices: { ...before.prices, price_weekend_num: "120" } }, before)).toEqual({ price_weekend_num: 120, price_weekend: "120,00 €" });
  });
  it("deliberate clearing stays absent instead of zero", () => {
    const before = baseline();
    expect(managedPricePatch({ ...before, prices: { ...before.prices, price_from_1_rd: "" } }, before)).toEqual({ price_from_1_rd: null, price_per_day: null });
  });
  it("new articles without prices save null rather than zero", () => {
    const patch = managedPricePatch({ ...baseline(), prices: emptyPriceSet(), price_per_day: "", price_per_month: "", price_weekend: "" });
    expect(patch.price_from_1_rd).toBeNull();
    expect(patch.price_per_day).toBeNull();
  });
  it("omits untouched location prices and writes only changed location fields", () => {
    const prices = baseline().prices;
    expect(changedPriceColumns({ ...prices }, prices)).toEqual({});
    expect(changedPriceColumns({ ...prices, price_weekend_num: "55" }, prices)).toEqual({ price_weekend_num: 55 });
  });
});