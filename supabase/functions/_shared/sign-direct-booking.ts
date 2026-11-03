/** Fail-closed rules for the narrowly scoped sign checkout. Money is integer cents. */
export const SIGN_PRODUCT_SLUG = "halteverbotsschilder-set";
export const SIGN_HOLD_HOURS = 24;
export const SIGN_BASE_RENTAL_DAYS = 10;
export const SIGN_MAX_RENTAL_DAYS = 100;
export const SIGN_LOCATIONS = ["krefeld", "bonn"] as const;
export type SignPackage = "standard" | "sorglos";
export interface SignRentalTier { fromDays: number; grossCents: number; extraDayGrossCents: number }
export interface SignBookingConfiguration {
  enabled: boolean;
  standardGrossCents: number | null;
  standardRentalTiers?: SignRentalTier[];
  sorglosGrossCents: number | null;
  depositCents: number | null;
  maxRentalDays: number | null;
  municipalFeesSeparate?: boolean;
  sorglosOuterGrossCents?: number | null;
  sorglosRadiusKm?: number | null;
  additionalSignGrossCents?: number | null;
}
export interface SignBookingLine {
  product_slug: string;
  location: string;
  quantity: number;
}
export function eligibleSignCart(items: SignBookingLine[]): boolean {
  return items.length > 0 && items.every(item =>
    item.product_slug === SIGN_PRODUCT_SLUG &&
    SIGN_LOCATIONS.some(location => location === item.location) &&
    Number.isInteger(item.quantity) && item.quantity > 0,
  );
}
export function signHoldDeadline(createdAt: string): string {
  const timestamp = Date.parse(createdAt);
  if (!Number.isFinite(timestamp)) throw new Error("Ungültiger Reservierungsbeginn");
  return new Date(timestamp + SIGN_HOLD_HOURS * 60 * 60 * 1000).toISOString();
}
export function signHoldExpired(createdAt: string, now: number): boolean {
  return now >= Date.parse(signHoldDeadline(createdAt));
}
export function signBookingPrice(config: SignBookingConfiguration, input: {
  package: SignPackage;
  quantity: number;
  rentalDays: number;
  municipalFeesCents: number | null;
  distanceKm?: number | null;
  additionalSignQuantity?: number;
}): { grossCents: number; depositCents: number; totalCents: number } | null {
  const price = input.package === "standard" ? config.standardGrossCents : signSetupGrossCents(config, input.distanceKm);
  if (!config.enabled || !Number.isInteger(price) || price === null || price <= 0 ||
    config.depositCents === null || !Number.isInteger(config.depositCents) || config.depositCents < 0 ||
    config.maxRentalDays === null || !Number.isInteger(config.maxRentalDays) || config.maxRentalDays < 1 ||
    !Number.isInteger(input.rentalDays) || input.rentalDays < 1 || input.rentalDays > config.maxRentalDays ||
    !Number.isInteger(input.quantity) || input.quantity < 1) return null;
  const fees = input.package === "sorglos" && !config.municipalFeesSeparate ? input.municipalFeesCents : 0;
  if (fees === null || !Number.isInteger(fees) || fees < 0) return null;
  const extras = signAdditionalGrossCents(config, input.additionalSignQuantity ?? 0);
  if (extras === null) return null;
  const rental = signRentalGrossCents(price, input.rentalDays, config.maxRentalDays, input.package === "standard" ? config.standardRentalTiers : undefined);
  if (rental === null) return null;
  const grossCents = rental * input.quantity + fees + extras;
  const depositCents = config.depositCents * input.quantity;
  const totalCents = grossCents + depositCents;
  return Number.isSafeInteger(totalCents) ? { grossCents, depositCents, totalCents } : null;
}
export function signAdditionalGrossCents(config: SignBookingConfiguration, quantity: number): number | null {
  if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 100) return null;
  if (quantity === 0) return 0;
  const cents = config.additionalSignGrossCents;
  return cents != null && Number.isSafeInteger(cents) && cents > 0 ? cents * quantity : null;
}
export function signSetupGrossCents(config: SignBookingConfiguration, distanceKm?: number | null): number | null {
  if (config.sorglosRadiusKm == null) return config.sorglosGrossCents;
  if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm < 0) return null;
  return distanceKm <= config.sorglosRadiusKm ? config.sorglosGrossCents : config.sorglosOuterGrossCents ?? null;
}
export function signRentalDays(start: string, end: string): number {
  return Math.round((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86400000) + 1;
}
/** First ten calendar days are included; each extra day adds one tenth of the CMS package. */
export function signRentalGrossCents(baseCents: number | null | undefined, days: number, maxDays = SIGN_MAX_RENTAL_DAYS, tiers?: SignRentalTier[]): number | null {
  if (baseCents == null || !Number.isSafeInteger(baseCents) || baseCents <= 0 || !Number.isInteger(days) || days < 1 || days > maxDays) return null;
  if (tiers !== undefined) {
    if (!Array.isArray(tiers) || !tiers.length || tiers[0]?.fromDays !== 1 || tiers[0]?.grossCents !== baseCents) return null;
    let selected: SignRentalTier | undefined;
    let previous = 0;
    for (const tier of tiers) {
      if (!Number.isSafeInteger(tier.fromDays) || tier.fromDays <= previous || !Number.isSafeInteger(tier.grossCents) || tier.grossCents <= 0 || !Number.isSafeInteger(tier.extraDayGrossCents) || tier.extraDayGrossCents < 0) return null;
      previous = tier.fromDays;
      if (days >= tier.fromDays) selected = tier;
    }
    if (!selected) return null;
    const cents = selected.grossCents + (days - selected.fromDays) * selected.extraDayGrossCents;
    return Number.isSafeInteger(cents) ? cents : null;
  }
  const cents = Math.round(baseCents * (SIGN_BASE_RENTAL_DAYS + Math.max(0, days - SIGN_BASE_RENTAL_DAYS)) / SIGN_BASE_RENTAL_DAYS);
  return Number.isSafeInteger(cents) ? cents : null;
}
export function signLastRentalDate(start: string, maxDays = SIGN_MAX_RENTAL_DAYS): string | null {
  const time = Date.parse(`${start}T12:00:00Z`);
  if (!Number.isFinite(time) || !Number.isInteger(maxDays) || maxDays < 1) return null;
  return new Date(time + (maxDays - 1) * 86400000).toISOString().slice(0, 10);
}
export function validSignRentalRange(start: string, end: string, maxDays = SIGN_MAX_RENTAL_DAYS): boolean {
  const last = signLastRentalDate(start, maxDays);
  return last !== null && end >= start && end <= last;
}
export function signPaymentComplete(expectedCents: number, paidCents: number): boolean {
  return Number.isSafeInteger(expectedCents) && expectedCents > 0 &&
    Number.isSafeInteger(paidCents) && paidCents === expectedCents;
}
export function signCapacityAvailable(stock: number, booked: number, requested: number): boolean {
  return [stock, booked, requested].every(Number.isSafeInteger) && stock >= 0 && booked >= 0 &&
    requested > 0 && requested <= stock - booked;
}