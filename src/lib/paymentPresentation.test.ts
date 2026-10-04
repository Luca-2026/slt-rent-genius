import { describe, expect, it } from "vitest";
import { isStripePayment, shortPaymentReference } from "./paymentPresentation";
describe("Stripe payment presentation", () => {
  it("recognizes live, test and legacy records", () => {
    for (const reference of ["cs_live_long", "cs_test_long", "cs_legacy", "pi_payment"]) expect(isStripePayment({ reference })).toBe(true);
    expect(isStripePayment({ label: "Online-Zahlung (Stripe)" })).toBe(true);
    expect(isStripePayment({ reference: "RE-M-2026-10-0002", label: "Banküberweisung" })).toBe(false);
  });
  it("shortens only the display", () => {
    const reference = "cs_live_" + "1234567890".repeat(8);
    expect(shortPaymentReference(reference)).toBe(reference.slice(0, 12) + "…" + reference.slice(-8));
    expect(reference).toHaveLength(88);
    expect(shortPaymentReference("ANG-M-2026-0001")).toBe("ANG-M-2026-0001");
    expect(shortPaymentReference()).toBe("");
  });
});