import { describe, expect, it } from "vitest";
import { eligibleSignCart, signBookingPrice, signCapacityAvailable, signHoldDeadline, signHoldExpired, signPaymentComplete, signLastRentalDate, validSignRentalRange, type SignBookingConfiguration } from "../../supabase/functions/_shared/sign-direct-booking";

const config: SignBookingConfiguration = { enabled: true, standardGrossCents: 4900, sorglosGrossCents: 19900, depositCents: 10000, maxRentalDays: 100, municipalFeesSeparate: true };
describe("Halteverbotsschilder direct booking", () => {
  it.each([["standard", 15, 5390, 49000], ["sorglos", 15, 21890, 199000], ["sorglos", 16, 32890, 299000]] as const)("adds one tenth after ten days for %s at %i km", (pkg, distanceKm, day11, day100) => {
    const c = { ...config, sorglosRadiusKm: 15, sorglosOuterGrossCents: 29900, additionalSignGrossCents: 500 };
    expect(signBookingPrice(c, { package: pkg, distanceKm, quantity: 1, rentalDays: 11, municipalFeesCents: null })?.grossCents).toBe(day11);
    expect(signBookingPrice(c, { package: pkg, distanceKm, quantity: 1, rentalDays: 100, municipalFeesCents: null, additionalSignQuantity: 2 })).toEqual({ grossCents: day100 + 1000, depositCents: 10000, totalCents: day100 + 11000 });
  });
  it("charges 5 euros per additional sign for the whole period", () => {
    const c = { ...config, additionalSignGrossCents: 500 };
    for (const rentalDays of [1, 10]) expect(signBookingPrice(c, { package: "standard", quantity: 1, rentalDays, municipalFeesCents: null, additionalSignQuantity: 3 })?.grossCents).toBe(6400);
    expect(signBookingPrice(config, { package: "standard", quantity: 1, rentalDays: 1, municipalFeesCents: null, additionalSignQuantity: 1 })).toBeNull();
  });
  it("never adds deposit for additional signs", () => {
    expect(signBookingPrice({ ...config, additionalSignGrossCents: 500 }, { package: "standard", quantity: 1, rentalDays: 10, municipalFeesCents: null, additionalSignQuantity: 4 })).toEqual({ grossCents: 6900, depositCents: 10000, totalCents: 16900 });
  });
  it("includes the selected start as day 1 and limits rental to day 100", () => { expect(signLastRentalDate("2027-03-01", 10)).toBe("2027-03-10"); expect(validSignRentalRange("2027-03-01", "2027-03-10")).toBe(true); expect(validSignRentalRange("2027-03-01", "2027-06-08")).toBe(true); expect(validSignRentalRange("2027-03-01", "2027-06-09")).toBe(false); });
  it("charges 199 through 15 km and 299 above 15 km", () => {
    const c = { ...config, sorglosRadiusKm: 15, sorglosOuterGrossCents: 29900 };
    const input = { package: "sorglos" as const, quantity: 1, rentalDays: 10, municipalFeesCents: null };
    expect(signBookingPrice(c, { ...input, distanceKm: 15 })?.grossCents).toBe(19900);
    expect(signBookingPrice(c, { ...input, distanceKm: 15.001 })?.grossCents).toBe(29900);
    expect(signBookingPrice(c, { ...input, distanceKm: null })).toBeNull();
  });
  it("uses the 49 euro package for a weekend and all ten days alike", () => { for (const rentalDays of [1,3,10]) expect(signBookingPrice(config,{package:"standard",quantity:1,rentalDays,municipalFeesCents:null})?.grossCents).toBe(4900); });
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
  it("charges 199 euros for sorglos and bills city fees separately", () => {
    expect(signBookingPrice(config, { package: "sorglos", quantity: 1, rentalDays: 10, municipalFeesCents: null })).toEqual({ grossCents: 19900, depositCents: 10000, totalCents: 29900 });
    expect(signBookingPrice(config, { package: "sorglos", quantity: 1, rentalDays: 5, municipalFeesCents: 2500 })?.grossCents).toBe(19900);
  });
  it("requires 100 euros deposit per set in addition to the rental", () => {
    expect(signBookingPrice(config, { package: "standard", quantity: 2, rentalDays: 5, municipalFeesCents: null })).toEqual({ grossCents: 9800, depositCents: 20000, totalCents: 29800 });
  });
  it("does not turn an unknown deposit or tariff period into a sale", () => {
    const input = { package: "standard" as const, quantity: 1, rentalDays: 5, municipalFeesCents: null };
    expect(signBookingPrice({ ...config, depositCents: null }, input)).toBeNull();
    expect(signBookingPrice({ ...config, maxRentalDays: null }, input)).toBeNull();
    expect(signBookingPrice({ ...config, enabled: false }, input)).toBeNull();
    expect(signBookingPrice(config, { ...input, rentalDays: 101 })).toBeNull();
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