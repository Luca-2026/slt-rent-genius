import { describe, expect, it } from "vitest";
import { allocateOrderRefund, refundBalances } from "../../supabase/functions/_shared/order-refund-math";
describe("combined order refunds", () => {
  it("UHSMCV has no remaining entitlement after 100 deposit and 29.75 rent were refunded", () => {
    expect(refundBalances({ paid: 12975, depositEntitlement: 10000, rentEntitlement: 2975, depositUsed: 10000, rentUsed: 2975 })).toEqual({ deposit: 0, rent: 0, total: 0, fullyRefunded: true, pending: false });
  });
  it("combines 100 deposit and 29.75 rent into one original-payment allocation", () => {
    expect(allocateOrderRefund(10000, 2975, [{ payment_intent: "pi_original", link_id: "original", available: 12975 }])).toEqual([{ payment_intent: "pi_original", link_id: "original", amount_cents: 12975, deposit_cents: 10000, rent_cents: 2975, status: "creating" }]);
  });
  it("partial refund leaves the separate rent entitlement unchanged", () => {
    expect(refundBalances({ paid: 12975, depositEntitlement: 10000, rentEntitlement: 2975, depositUsed: 5000, rentUsed: 1000 })).toMatchObject({ deposit: 5000, rent: 1975 });
  });
  it("does not allocate twice from duplicate original receipts", () => {
    expect(() => allocateOrderRefund(10000, 2975, [{ payment_intent: "pi_same", link_id: "a", available: 10000 }, { payment_intent: "pi_same", link_id: "b", available: 10000 }])).toThrow();
  });
  it("rejects overpayment and invalid amounts", () => {
    expect(() => allocateOrderRefund(10000, 2976, [{ payment_intent: "pi_original", link_id: "original", available: 12975 }])).toThrow();
    expect(() => allocateOrderRefund(-1, 2975, [])).toThrow();
  });
});