export interface CouponLine {
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  price_manual?: boolean;
  price_basis?: string;
  unit?: string;
  unit_code?: string;
  protocol_charge_source?: string;
}

/** Never stack discounts or change insurance/logistics/addon amounts. */
export function validCouponPercent(percent: number): boolean {
  return Number.isFinite(percent) && percent > 0 && percent <= 20;
}

export function couponLine<T extends CouponLine>(line: T, eligible: boolean, percent = 10): T {
  if (!validCouponPercent(percent)) throw new Error("Ungültiger Gutscheinrabatt");
  if (!eligible || line.price_manual || line.price_basis === "customer") return line;
  return { ...line, discount_percent: Math.max(Number(line.discount_percent) || 0, percent) };
}

export function couponSaving(line: CouponLine, eligible: boolean, percent = 10): number {
  const after = couponLine(line, eligible, percent);
  return Math.round(line.quantity * line.unit_price * ((Number(after.discount_percent) || 0) - (Number(line.discount_percent) || 0))) / 100;
}

export function couponCategoryEligible(category: string): boolean {
  const value = category.toLowerCase();
  if (accessoryCategories.has(value) || accessoryProducts.has(value)) return false;
  return !/anh(?:a|ä|ae)nger|trailer|versicherung|insurance|service|reinigung|kraftstoff|diesel|schaden|transport|zubeh(?:ö|oe|o)r|accessor|haftungsfreistellung|selbstbehalt|haftungsreduzierung|stundenlohn|arbeitszeit|personal|lohn|labor/i.test(category);
}

const accessoryCategories = new Set([
  "cee-kabel", "schuko-kabel", "netzwerkkabel", "hdmi-kabel", "powercon-kabel", "adapter", "kabelbruecke",
  "kabeltrommel", "erdung", "geruestteil", "buehnen-zubehoer", "traversen-zubehoer", "traversenverbinder", "husse", "garderobe", "zubehoer",
]);
const accessoryProducts = new Set(["nivtec-fuesse", "kleiderbuegel", "staubsaugeraufsatz", "kanister"]);

export function couponItemEligible(line: CouponLine, product: { slug?: string; name?: string; category?: string; subcategory?: string } | null): boolean {
  if (!product || line.protocol_charge_source) return false;
  if (/^(h|hr|hour|hours|stunde|stunden|15min)$/i.test(line.unit_code ?? line.unit ?? "")) return false;
  return [product.slug, product.name, product.category, product.subcategory].every(value => couponCategoryEligible(value ?? ""));
}