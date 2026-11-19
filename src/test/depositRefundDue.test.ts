import { describe, expect, it } from "vitest";
import { depositRefundDue } from "@/lib/depositRefundDue";
import { matchesInquiryListFilter } from "@/lib/inquiryStatus";
const inquiry = { id: "one", status: "done", payments: [{ amount: 147.6 }], offer_total_gross: 47.6, offer_payload: { deposit: 100 } };
const settlement = { rental_inquiry_id: "one", balance: 100, payout_status: "pending", settled_at: "2026-11-16" };
describe("Kaution zu erstatten", () => {
  it("includes a settled but unpaid 100 euro deposit on a completed order", () => expect(depositRefundDue(inquiry, settlement, [])?.amount).toBe(100));
  it("excludes a confirmed paid deposit", () => expect(depositRefundDue(inquiry, { ...settlement, payout_status: "paid" }, [])).toBeNull());
  it("subtracts confirmed partial refunds", () => expect(depositRefundDue(inquiry, settlement, [], { inquiryId: "one", amountCents: 2500, pending: false })?.amount).toBe(75));
  it("keeps unresolved payouts visible rather than claiming they are refunded", () => expect(depositRefundDue(inquiry, settlement, [], { inquiryId: "one", amountCents: 0, pending: true })?.stage).toBe("processing"));
  it("excludes fully consumed deposits", () => expect(depositRefundDue(inquiry, { ...settlement, balance: 0 }, [])).toBeNull());
  it("estimates received deposits after a return without settlement", () => expect(depositRefundDue(inquiry, undefined, [{ rental_inquiry_id: "one", status: "signed_staff_only", damages_total: 20 }])?.amount).toBe(80));
  it("does not confuse a future rental deposit with an outstanding refund", () => expect(depositRefundDue({ ...inquiry, status: "accepted" }, undefined, [])).toBeNull());
  it("includes cancelled orders and never counts rental credit as deposit", () => expect(depositRefundDue({ ...inquiry, status: "cancelled", payments: [{ amount: 247.6 }] }, undefined, [])?.amount).toBe(100));
  it("filters independently of the order phase", () => {
    for (const status of ["accepted", "done", "cancelled"]) {
      expect(matchesInquiryListFilter({ status, deposit_refund_due: true }, "deposit_refund")).toBe(true);
      expect(matchesInquiryListFilter({ status, deposit_refund_due: false }, "deposit_refund")).toBe(false);
    }
  });
});