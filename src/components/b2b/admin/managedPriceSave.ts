import { PRICE_FIELDS, basePriceField, priceSetToColumns, legacyDayText, legacyWeekendText, legacyMonthText, type PriceSet, type PricingScheme } from "./ManagedPriceFields";

export interface ManagedPriceState {
  category: string;
  pricing_scheme: PricingScheme;
  prices: PriceSet;
  price_per_day: string;
  price_weekend: string;
  price_per_month: string;
  tier_prices_manual: string[];
  prices_same_all_locations: boolean;
}

/** Omitted columns are deliberately untouched, including legacy starting-price text. */
export function changedPriceColumns(current: PriceSet, previous?: PriceSet) {
  const next = priceSetToColumns(current);
  const before = previous ? priceSetToColumns(previous) : null;
  return Object.fromEntries(PRICE_FIELDS.filter((key) => !before || next[key] !== before[key]).map((key) => [key, next[key]]));
}

export function managedPricePatch(current: ManagedPriceState, previous?: ManagedPriceState) {
  const patch: Record<string, unknown> = changedPriceColumns(current.prices, previous?.prices);
  const changed = (key: keyof ManagedPriceState) => !previous || JSON.stringify(current[key]) !== JSON.stringify(previous[key]);
  for (const key of ["pricing_scheme", "prices_same_all_locations", "tier_prices_manual"] as const) {
    if (changed(key)) patch[key] = current[key];
  }
  const baseChanged = basePriceField(current.pricing_scheme) in patch;
  if (baseChanged || changed("price_per_day")) {
    patch.price_per_day = legacyDayText(current.category, current.pricing_scheme, current.prices, current.price_per_day.trim() || null);
  }
  if ("price_weekend_num" in patch || changed("price_weekend")) {
    patch.price_weekend = legacyWeekendText(current.prices, previous ? priceSetToColumns(previous.prices).price_weekend_num : null, current.price_weekend.trim() || null);
  }
  if ("price_from_20_rd" in patch || changed("price_per_month")) {
    patch.price_per_month = current.category === "anhaenger" ? current.price_per_month.trim() || null : legacyMonthText(current.pricing_scheme, current.prices, previous ? priceSetToColumns(previous.prices).price_from_20_rd : null, current.price_per_month.trim() || null);
  }
  return patch;
}