/** Confirmed public base price; checkout always uses the current server tariff. */
export const SIGN_PUBLIC_BASE_GROSS_CENTS = 3900;

export function signPublicBaseGrossCents(config?: { standardGrossCents?: number | null } | null): number {
  const cents = config?.standardGrossCents;
  return cents != null && Number.isSafeInteger(cents) && cents > 0 ? cents : SIGN_PUBLIC_BASE_GROSS_CENTS;
}