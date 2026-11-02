/** One-time surcharge on rental only; insurance, other options and deposit are not inputs. */
export const FREE_CANCELLATION_OPTION = {
  key: "kostenfreie_stornierung",
  label: "Kostenfreie Stornierung bis 72 Std. vor Mietbeginn",
  price_type: "percent",
  price: 5,
  is_default: false,
} as const;

export function cancellationAmount(rentalNet: number | null): number | null {
  if (rentalNet === null || !Number.isFinite(rentalNet) || rentalNet < 0) return null;
  return Math.round((rentalNet * FREE_CANCELLATION_OPTION.price / 100 + Number.EPSILON) * 100) / 100;
}