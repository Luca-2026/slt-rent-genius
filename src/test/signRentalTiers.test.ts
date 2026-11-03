import { describe, expect, it } from "vitest";
import { signBookingPrice, signRentalGrossCents } from "../../supabase/functions/_shared/sign-direct-booking";
import { signPackageEstimate } from "@/lib/signCartPackage";
const tiers = [{ fromDays: 1, grossCents: 3900, extraDayGrossCents: 0 }, { fromDays: 11, grossCents: 5500, extraDayGrossCents: 1000 }, { fromDays: 14, grossCents: 8500, extraDayGrossCents: 500 }, { fromDays: 22, grossCents: 12000, extraDayGrossCents: 200 }, { fromDays: 40, grossCents: 15500, extraDayGrossCents: 100 }];
const config = { enabled: true, standardGrossCents: 3900, standardRentalTiers: tiers, sorglosGrossCents: 19900, depositCents: 10000, maxRentalDays: 100, municipalFeesSeparate: true, additionalSignGrossCents: 500 };
describe("Luca's screenshot tariff for Bonn and Krefeld", () => {
  it.each([[1,3900],[10,3900],[11,5500],[12,6500],[13,7500],[14,8500],[15,9000],[21,12000],[22,12000],[23,12200],[39,15400],[40,15500],[41,15600],[100,21500]])("%i calendar days cost %i gross cents per set", (days, cents) => {
    expect(signRentalGrossCents(3900, days, 100, tiers)).toBe(cents);
    expect(signPackageEstimate(config, "standard", 2, days)).toBe(cents * 2 / 119);
    expect(signBookingPrice(config, { package: "standard", quantity: 2, rentalDays: days, municipalFeesCents: null, additionalSignQuantity: 1 })).toEqual({ grossCents: cents*2+500, depositCents: 20000, totalCents: cents*2+20500 });
  });
  it("does not change the Sorglos extension tariff", () => {
    expect(signBookingPrice(config, { package: "sorglos", quantity: 1, rentalDays: 14, municipalFeesCents: null })?.grossCents).toBe(27860);
  });
  it("rejects malformed tiers rather than charging the old tariff", () => {
    expect(signRentalGrossCents(3900, 14, 100, [])).toBeNull();
    expect(signRentalGrossCents(3900, 14, 100, [...tiers].reverse())).toBeNull();
  });
});