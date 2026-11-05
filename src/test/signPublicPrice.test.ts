import { describe, expect, it } from "vitest";
import { signPublicBaseGrossCents } from "@/lib/signPublicPrice";
import { displayPrice } from "@/lib/priceDisplay";

describe("confirmed sign base price on first render", () => {
  it("shows 39 euros gross without waiting for configuration", () => {
    expect(signPublicBaseGrossCents()).toBe(3900);
    expect(displayPrice(signPublicBaseGrossCents() / 119, "private")).toBe("39,00\u00a0€");
  });
  it("uses maintained prices once loaded, rather than freezing the tariff", () => {
    expect(signPublicBaseGrossCents({ standardGrossCents: 4100 })).toBe(4100);
  });
});