/** Fail-closed rules for the narrowly scoped sign checkout. Money is integer cents. */
export const SIGN_PRODUCT_SLUG = "halteverbotsschilder-set";
export const SIGN_HOLD_HOURS = 24;
export const SIGN_LOCATIONS = ["krefeld", "bonn"] as const;
export type SignPackage = "standard" | "sorglos";
export interface SignBookingConfiguration {
  enabled: boolean;
  standardGrossCents: number | null;
  sorglosGrossCents: number | null;
  depositCents: number | null;
  maxRentalDays: number | null;
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
}): { grossCents: number; depositCents: number; totalCents: number } | null {
  const price = input.package === "standard" ? config.standardGrossCents : config.sorglosGrossCents;
  if (!config.enabled || !Number.isInteger(price) || price === null || price <= 0 ||
    config.depositCents === null || !Number.isInteger(config.depositCents) || config.depositCents < 0 ||
    config.maxRentalDays === null || !Number.isInteger(config.maxRentalDays) || config.maxRentalDays < 1 ||
    !Number.isInteger(input.rentalDays) || input.rentalDays < 1 || input.rentalDays > config.maxRentalDays ||
    !Number.isInteger(input.quantity) || input.quantity < 1) return null;
  const fees = input.package === "sorglos" ? input.municipalFeesCents : 0;
  if (fees === null || !Number.isInteger(fees) || fees < 0) return null;
  const grossCents = price * input.quantity + fees;
  const depositCents = config.depositCents * input.quantity;
  const totalCents = grossCents + depositCents;
  return Number.isSafeInteger(totalCents) ? { grossCents, depositCents, totalCents } : null;
}
export function signPaymentComplete(expectedCents: number, paidCents: number): boolean {
  return Number.isSafeInteger(expectedCents) && expectedCents > 0 &&
    Number.isSafeInteger(paidCents) && paidCents === expectedCents;
}
export function signCapacityAvailable(stock: number, booked: number, requested: number): boolean {
  return [stock, booked, requested].every(Number.isSafeInteger) && stock >= 0 && booked >= 0 &&
    requested > 0 && requested <= stock - booked;
}