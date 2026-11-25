import { describe, it, expect } from "vitest";
import { calculateDrying } from "@/lib/dryingCalculator";

describe("Bautrockner-Rechner", () => {
  it("bis 20 m² ein KT200", () => expect(calculateDrying({ length: 4, width: 5, height: 2.5, standingWater: false, withFans: false })?.dryer).toEqual({ slug: "bautrockner-kt200", qty: 1 }));
  it("über 20 m² je angefangene 50 m² ein KT553", () => expect(calculateDrying({ length: 10, width: 10.1, height: 2.5, standingWater: false, withFans: false })?.dryer).toEqual({ slug: "bautrockner-kt553", qty: 3 }));
  it("Lüfter verkürzen um 15 %", () => expect(calculateDrying({ length: 5, width: 5, height: 2.5, standingWater: false, withFans: true })?.days).toEqual({ min: 12, max: 18 }));
  it("ungültige Maße → null", () => expect(calculateDrying({ length: 0, width: 5, height: 2.5, standingWater: false, withFans: false })).toBeNull());
});
