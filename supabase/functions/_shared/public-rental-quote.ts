import { computeRentalLinePrice, resolveProductPrices } from "./rental-pricing.ts";
import { calendarDaysInclusive, computeAddonAmount, daysPerUnit } from "./addon-calc.ts";

export async function publicRentalQuote(service: any, items: any[]) {
  const slugs = [...new Set(items.map(item => item.product_slug))];
  const { data: products, error } = await service.from("b2b_managed_products").select("*").eq("is_published", true).in("slug", slugs);
  if (error) throw new Error("Preise konnten nicht geladen werden");
  const { data: locationPrices, error: locationError } = await service.from("public_product_prices").select("*").in("managed_product_id", (products ?? []).map((p: any) => p.id));
  if (locationError) throw new Error("Standortpreise konnten nicht geladen werden");
  return items.map(item => {
    const product = (products ?? []).find((p: any) => p.slug === item.product_slug);
    if (!product || product.category === "anhaenger") throw new Error("Artikel nicht im eigenen Anfrage-System verfügbar");
    const line = computeRentalLinePrice({ prices: resolveProductPrices(product, item.location, locationPrices ?? []), scheme: product.pricing_scheme, start: { date: item.start_date, time: item.start_time }, end: { date: item.end_date, time: item.end_time }, opts: item });
    const unitPrice = line.kind === "duration_only" ? null : line.unit_price;
    const options = Array.isArray(product.addon_options) ? product.addon_options : [];
    const defaults = options.filter((o: any) => o.is_default);
    const selected = options.filter((o: any) => item.selected_addons.includes(o.key));
    const alternative = selected.find((o: any) => Number(o.surcharge_percent) > 0);
    const base = defaults[0];
    const calculate = (option: any) => {
      if (unitPrice === null && option.price_type === "percent") return null;
      return computeAddonAmount({ price_type: option.price_type, rate: Number(option.price), basis: option.full_period_default && daysPerUnit(line.unit) ? "full_period" : "line", days: calendarDaysInclusive(item.start_date, item.end_date) }, { articles: item.quantity, duration: line.duration, unit_price: unitPrice ?? 0, discount_percent: 0, days_per_unit: daysPerUnit(line.unit) });
    };
    const chosen = [...defaults, ...selected.filter((o: any) => !o.is_default && !(Number(o.surcharge_percent) > 0))];
    const addons = chosen.map((o: any) => ({ key: o.key, label: o.label, amount: calculate(o), deductible: o.deductible ?? null }));
    if (alternative && base) {
      const baseAmount = calculate(base);
      addons.push({ key: alternative.key, label: alternative.label, amount: baseAmount === null ? null : Math.round(baseAmount * Number(alternative.surcharge_percent)) / 100, deductible: alternative.deductible ?? null });
    }
    return { id: item.id, product_name: product.name, unit: line.unit, duration: line.duration, unit_price: unitPrice, rental_net: unitPrice === null ? null : Math.round(item.quantity * line.duration * unitPrice * 100) / 100, addons, options: options.map((o: any) => ({ key: o.key, label: o.label, is_default: o.is_default === true, surcharge_percent: o.surcharge_percent, deductible: o.deductible, amount: Number(o.surcharge_percent) > 0 && base ? (() => { const amount = calculate(base); return amount === null ? null : Math.round(amount * Number(o.surcharge_percent)) / 100; })() : calculate(o) })) };
  });
}