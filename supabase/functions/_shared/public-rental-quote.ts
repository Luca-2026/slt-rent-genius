import { computeRentalLinePrice, resolveProductPrices, insuranceCalendarDays } from "./rental-pricing.ts";
import { computeAddonAmount, daysPerUnit } from "./addon-calc.ts";
import { catalogDeposit } from "./catalog-deposit.ts";
import { validPublicRentalPeriod } from "./public-rental-period.ts";

import { FREE_CANCELLATION_OPTION, cancellationAmount } from "./cancellation-option.ts";
export { FREE_CANCELLATION_OPTION } from "./cancellation-option.ts";

export async function publicRentalQuote(service: any, items: any[]) {
  const slugs = [...new Set(items.map(item => item.product_slug))];
  const { data: products, error } = await service.from("b2b_managed_products").select("id,slug,name,category,pricing_scheme,prices_same_all_locations,price_per_day,price_from_1_rd,price_from_3_rd,price_from_10_rd,price_from_20_rd,price_weekend_num,price_base_1_3_cd,surcharge_per_cd_from_4,surcharge_per_cd_from_8,addon_options,specifications,rental_notes").eq("is_published", true).in("slug", slugs);
  if (error) throw new Error("Preise konnten nicht geladen werden");
  const { data: locationPrices, error: locationError } = await service.from("public_product_prices").select("*").in("managed_product_id", (products ?? []).map((p: any) => p.id));
  if (locationError) throw new Error("Standortpreise konnten nicht geladen werden");
  return items.map(item => {
    if (!validPublicRentalPeriod(item)) throw new Error("Ungültiger Zeitraum oder Standortzeiten");
    const product = (products ?? []).find((p: any) => p.slug === item.product_slug);
    if (!product || product.category === "anhaenger") throw new Error("Artikel nicht im eigenen Anfrage-System verfügbar");
    const line = computeRentalLinePrice({ prices: resolveProductPrices(product, item.location, locationPrices ?? []), scheme: product.pricing_scheme, start: { date: item.start_date, time: item.start_time }, end: { date: item.end_date, time: item.end_time }, opts: item });
    const unitPrice = line.kind === "duration_only" ? null : line.unit_price;
    const options = [...(Array.isArray(product.addon_options) ? product.addon_options : []).filter((o: any) => o?.key !== FREE_CANCELLATION_OPTION.key), FREE_CANCELLATION_OPTION];
    if (item.selected_addons.some((key: string) => !options.some((o: any) => o.key === key)) || new Set(item.selected_addons).size !== item.selected_addons.length) throw new Error("Ungültige Zusatzoptionen");
    const defaults = options.filter((o: any) => o.is_default);
    const selected = options.filter((o: any) => item.selected_addons.includes(o.key) && !(String(o.key).startsWith("sb_reduktion") && !o.surcharge_percent));
    if (selected.filter((o: any) => Number(o.surcharge_percent) > 0).length > 1) throw new Error("Bitte nur eine Versicherungsstufe wählen");
    const alternative = selected.find((o: any) => Number(o.surcharge_percent) > 0);
    const base = defaults[0];
    const insuranceDays = insuranceCalendarDays({ date: item.start_date }, { date: item.end_date });
    const calculate = (option: any) => {
      if (option.key === FREE_CANCELLATION_OPTION.key) return cancellationAmount(unitPrice === null ? null : item.quantity * line.duration * unitPrice);
      if (unitPrice === null && option.price_type === "percent") return null;
      return computeAddonAmount({ price_type: option.price_type, rate: Number(option.price), basis: option.full_period_default && daysPerUnit(line.unit) ? "full_period" : "line", days: insuranceDays }, { articles: item.quantity, duration: line.duration, unit_price: unitPrice ?? 0, discount_percent: 0, days_per_unit: daysPerUnit(line.unit) });
    };
    const tierAmount = (tier: any) => {
      if (!base || unitPrice === null || !daysPerUnit(line.unit)) return null;
      const basePerDay = computeAddonAmount({ price_type: base.price_type, rate: Number(base.price), basis: "full_period", days: 1 }, { articles: 1, duration: line.duration, unit_price: unitPrice, discount_percent: 0, days_per_unit: daysPerUnit(line.unit) });
      if (basePerDay === null) return null;
      const perDay = Math.round((basePerDay * Number(tier.surcharge_percent) / 100 + Number.EPSILON) * 100) / 100;
      return computeAddonAmount({ price_type: "per_unit", rate: perDay, basis: "full_period", days: insuranceDays }, { articles: item.quantity, duration: line.duration, unit_price: unitPrice, discount_percent: 0, days_per_unit: daysPerUnit(line.unit) });
    };
    const chosen = [...defaults, ...selected.filter((o: any) => !o.is_default && !(Number(o.surcharge_percent) > 0))];
    const addons = chosen.map((o: any) => ({ key: o.key, label: o.label, amount: calculate(o), deductible: o.deductible ?? null }));
    if (alternative && base) {
      addons.push({ key: alternative.key, label: alternative.label, amount: tierAmount(alternative), deductible: alternative.deductible ?? null });
    }
    const depositPerItem = catalogDeposit(product);
    return { deposit: depositPerItem === null ? null : Math.round(depositPerItem * item.quantity * 100) / 100, id: item.id, product_name: product.name, category: product.category, unit: line.unit, duration: line.duration, unit_price: unitPrice, rental_net: unitPrice === null ? null : Math.round(item.quantity * line.duration * unitPrice * 100) / 100, addons, options: options.map((o: any) => ({ key: o.key, label: o.label, is_default: o.is_default === true, surcharge_percent: o.surcharge_percent, deductible: o.deductible, amount: Number(o.surcharge_percent) > 0 ? tierAmount(o) : calculate(o) })) };
  });
}