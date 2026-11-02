import { describe, expect, it } from "vitest";
import { couponCanPreview } from "../../supabase/functions/_shared/public-coupon";
describe("Nicht schreibende Gutscheinvorprüfung", () => {
  it("erlaubt aktive, nicht aber verbrauchte oder gesperrte Codes", () => {
    expect(couponCanPreview({ status: "active" })).toBe(true);
    expect(couponCanPreview({ status: "redeemed" })).toBe(false);
    expect(couponCanPreview({ status: "blocked" })).toBe(false);
    expect(couponCanPreview(null)).toBe(false);
  });
  it("hält fremde Reservierungen bis zum Ablauf geschützt", () => {
    const deadline = "2026-11-02T08:00:00Z";
    expect(couponCanPreview({ status: "reserved", reserved_until: deadline }, Date.parse(deadline))).toBe(false);
    expect(couponCanPreview({ status: "reserved", reserved_until: deadline }, Date.parse(deadline) + 1)).toBe(true);
    expect(couponCanPreview({ status: "reserved", reserved_until: null })).toBe(false);
  });
});