export interface CouponLine {
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  price_manual?: boolean;
  price_basis?: string;
}

/** Never stack discounts or change insurance/logistics/addon amounts. */
export function couponLine<T extends CouponLine>(line: T, eligible: boolean): T {
  if (!eligible || line.price_manual || line.price_basis === "customer") return line;
  return { ...line, discount_percent: Math.max(Number(line.discount_percent) || 0, 10) };
}

export function couponSaving(line: CouponLine, eligible: boolean): number {
  const after = couponLine(line, eligible);
  return Math.round(line.quantity * line.unit_price * ((Number(after.discount_percent) || 0) - (Number(line.discount_percent) || 0))) / 100;
}

export function couponCategoryEligible(category: string): boolean {
  return !/anh(?:a|ä|ae)nger|trailer|versicherung|service|reinigung|kraftstoff|diesel|schaden|transport/i.test(category);
}