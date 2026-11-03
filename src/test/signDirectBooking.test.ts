import { describe, expect, it } from "vitest";
import { eligibleSignCart, signBookingPrice, signCapacityAvailable, signHoldDeadline, signHoldExpired, signPaymentComplete, type SignBookingConfiguration } from "../../supabase/functions/_shared/sign-direct-booking";

const config: SignBookingConfiguration = { enabled: true, standardGrossCents: 4900, sorglosGrossCents: 19900, depositCents: 0, maxRentalDays: 10 };
// Deposit and duration here are fixtures, not approved production defaults.
describe("Halteverbotsschilder direct booking", () => {
  it("only permits the existing sets in Krefeld and Bonn", () => {
    for (const location of ["krefeld", "bonn"]) expect(eligibleSignCart([{ product_slug: "halteverbotsschilder-set", location, quantity: 1 }])).toBe(true);
    expect(eligibleSignCart([{ product_slug: "halteverbotsschilder-set", location: "muelheim", quantity: 1 }])).toBe(false);
    expect(eligibleSignCart([{ product_slug: "minibagger", location: "bonn", quantity: 1 }])).toBe(false);
    expect(eligibleSignCart([])).toBe(false);
    expect(eligibleSignCart([{ product_slug: "halteverbotsschilder-set", location: "bonn", quantity: 1 }, { product_slug: "bauzaun", location: "bonn", quantity: 1 }])).toBe(false);
  });
  it("preserves the stated standard price of 49 euros gross per set", () => {
    expect(signBookingPrice(config, { package: "standard", quantity: 1, rentalDays: 5, municipalFeesCents: null })?.grossCents).toBe(4900);
    expect(signBookingPrice(config, { package: "standard", quantity: 2, rentalDays: 5, municipalFeesCents: null })?.grossCents).toBe(9800);
  });
  it("preserves the stated sorglos price of 199 euros and requires known city fees", () => {
    expect(signBookingPrice(config, { package: "sorglos", quantity: 1, rentalDays: 5, municipalFeesCents: 2500 })?.grossCents).toBe(22400);
    expect(signBookingPrice(config, { package: "sorglos", quantity: 1, rentalDays: 5, municipalFeesCents: null })).toBeNull();
  });
  it("does not turn an unknown deposit or tariff period into a sale", () => {
    const input = { package: "standard" as const, quantity: 1, rentalDays: 5, municipalFeesCents: null };
    expect(signBookingPrice({ ...config, depositCents: null }, input)).toBeNull();
    expect(signBookingPrice({ ...config, maxRentalDays: null }, input)).toBeNull();
    expect(signBookingPrice({ ...config, enabled: false }, input)).toBeNull();
    expect(signBookingPrice(config, { ...input, rentalDays: 11 })).toBeNull();
  });
  it("holds the reservation for exactly 24 hours, not 24 hours after a reminder", () => {
    const created = "2026-11-03T01:00:00Z";
    expect(signHoldDeadline(created)).toBe("2026-11-04T01:00:00.000Z");
    expect(signHoldExpired(created, Date.parse("2026-11-04T00:59:59.999Z"))).toBe(false);
    expect(signHoldExpired(created, Date.parse("2026-11-04T01:00:00Z"))).toBe(true);
  });
  it("requires full payment matched to the cent", () => {
    expect(signPaymentComplete(4900, 4900)).toBe(true);
    expect(signPaymentComplete(4900, 4899)).toBe(false);
    expect(signPaymentComplete(4900, 4901)).toBe(false);
    expect(signPaymentComplete(0, 0)).toBe(false);
  });
  it("treats the capacity of ten as sets, not eighteen contained pieces", () => {
    expect(signCapacityAvailable(10, 0, 10)).toBe(true);
    expect(signCapacityAvailable(10, 0, 11)).toBe(false);
    expect(signCapacityAvailable(10, 9, 1)).toBe(true);
    expect(signCapacityAvailable(10, 10, 1)).toBe(false);
  });
});