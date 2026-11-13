import { describe, expect, it } from "vitest";
import { signBookingPrice, signAdditionalGrossCents, type SignBookingConfiguration } from "../../supabase/functions/_shared/sign-direct-booking";
const config: SignBookingConfiguration = { enabled: true, standardGrossCents: 3900, sorglosGrossCents: 19900, depositCents: 10000, maxRentalDays: 100, additionalSignGrossCents: 600 };
describe("Additional sign pairs", () => {
  it("charges 6 euros gross per pair", () => expect(signAdditionalGrossCents(config, 1)).toBe(600));
  it("allows two pairs for two booked sets without multiplying extras twice", () => expect(signBookingPrice(config, { package: "standard", quantity: 2, rentalDays: 1, municipalFeesCents: 0, additionalSignQuantity: 2 })).toEqual({ grossCents: 9000, depositCents: 20000, totalCents: 29000 }));
});