import { describe, expect, it } from "vitest";
import { buildOrderAmendment } from "../../supabase/functions/_shared/order-amendment";
import { signPaymentState, signCheckoutExpiry, signResidualPlan } from "../../supabase/functions/_shared/sign-amendment";
import { evaluateOrderPayment } from "../lib/orderConfirmation";

const original = { direct_booking: true, deposit: 100, payment_terms: "vorkasse", items: [{ product_name: "Halteverbotsschilder-Set", product_slug: "halteverbotsschilder-set", quantity: 1, articles: 1, unit: "pauschal", unit_price: 39 / 1.19, start_date: "2026-11-24", end_date: "2026-12-03" }], totals: { netAmount: 32.77, vatAmount: 6.23, grossAmount: 39 } };
const base = { ...original.items[0], rental_start: "2026-11-24", rental_end: "2026-12-03" };
const extra = { product_name: "Zusatzzeichen", product_slug: "vz-1060-31-ra1-gr-1", quantity: 1, articles: 1, unit_price: 6 / 1.19, rental_start: "2026-11-24", rental_end: "2026-12-03" };
const now = Date.parse("2026-11-24T15:04:00Z");
const paid = { status: "paid", expires_at: "2026-11-22T15:00:00Z" };
describe("Paid sign booking additions", () => {
  it("preserves the original package and adds 6 euros without charging the 100 euro deposit twice", () => {
    const result = buildOrderAmendment({ items: [base, extra], deposit: 100 }, original, "bonn");
    expect(result.items[0]).toEqual(original.items[0]);
    expect(result.totals.grossAmount).toBe(45);
    expect(result.deposit).toBe(100);
    const balance = evaluateOrderPayment({ gross: result.totals.grossAmount, deposit: result.deposit, payments: [{ amount: 139 }], paymentTerms: "vorkasse" });
    expect(balance.openCents).toBe(600);
    expect(balance.canSend).toBe(true);
    expect(balance.needsAcknowledgement).toBe(true);
    expect(signResidualPlan({ openCents: 600, rentCents: 0, depositCents: 600 }, result, 1)).toEqual({ openCents: 600, rentCents: 600, depositCents: 0 });
  });
  it("rejects modifying a paid package instead of appending extras", () => {
    expect(() => buildOrderAmendment({ items: [{ ...base, quantity: 2 }, extra], deposit: 100 }, original, "bonn")).toThrow(/unverändert/);
  });
  it("rejects changing the original deposit", () => {
    expect(() => buildOrderAmendment({ items: [base, extra], deposit: 200 }, original, "bonn")).toThrow(/Kaution/);
  });
  it("does not allow extra main sets to bypass the separate reservation capacity", () => {
    expect(() => buildOrderAmendment({ items: [base, base], deposit: 100 }, original, "bonn")).toThrow(/separat buchen/);
  });
  it("keeps an amended paid booking payable after its original 24-hour hold", () => {
    expect(signPaymentState({ booking: paid, revision: 1, linkStatus: "active", openCents: 600, now })).toBe("active");
    expect(signCheckoutExpiry(paid, now)).toBe(Math.floor(now / 1000) + 23 * 3600);
  });
  it("does not reactivate superseded links or unpaid expired bookings", () => {
    expect(signPaymentState({ booking: paid, revision: 1, linkStatus: "superseded", openCents: 600, now })).toBe("superseded");
    expect(signPaymentState({ booking: { ...paid, status: "expired" }, revision: 1, linkStatus: "active", openCents: 600, now })).toBe("superseded");
  });
  it("retains the original unpaid hold and stops charging fully paid amendments", () => {
    const hold = { status: "reserved", expires_at: new Date(now + 3600000).toISOString() };
    expect(signCheckoutExpiry(hold, now)).toBe(Math.floor(now / 1000) + 3600);
    expect(signPaymentState({ booking: paid, revision: 1, linkStatus: "active", openCents: 0, now })).toBe("paid");
  });
});