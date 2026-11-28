import { expect, it } from "vitest";
import { computeSettlement } from "@/lib/depositSettlement";
import { orderRefundSummary, reservedRefundCents } from "@/lib/orderRefundSummary";
const base = {deposit_available:50000,rent_available:1940,deposit_used:0,rent_used:0};
it("713.32 paid minus 193.92 rent leaves 500 deposit and 19.40 separate rental credit", () => {
  const result = computeSettlement({paid:713.32,rent:193.92,deposit:500,deductions:[]});
  expect(result.refund).toBe(500); expect(result.rentalCredit).toBe(19.4);
  expect(orderRefundSummary(base,{deposit:0,rent:0},true,true).open).toBe(51940);
});
it.each([
  [{...base,rent_available:0,rent_used:1940},50000,0,1940],
  [{...base,deposit_available:0,deposit_used:50000},1940,50000,0],
  [{...base,deposit_available:30000,deposit_used:20000},31940,20000,0],
])("confirmed payouts reduce the remaining claim, not the rental/deposit split", (totals,open,depositConfirmed,rentConfirmed) => {
  expect(orderRefundSummary(totals,{deposit:0,rent:0},true,true)).toMatchObject({open,depositConfirmed,rentConfirmed});
});
it("pending rental transfer is reserved, not confirmed and cannot appear in open funds", () => {
  expect(orderRefundSummary({...base,rent_available:0,rent_used:1940},{deposit:0,rent:1940},true,true)).toMatchObject({open:50000,rentConfirmed:0,rentPending:1940});
});
it.each([[false,true],[true,false]])("missing basis/evidence never asserts a final total", (basis,evidence) => {
  expect(orderRefundSummary(base,{deposit:0,rent:0},basis,evidence).open).toBeNull();
});
it("deductions reduce only the authoritative deposit amount", () => {
  expect(orderRefundSummary({...base,deposit_available:45000},{deposit:0,rent:0},true,true).open).toBe(46940);
});
it("invalid or inconsistent cents fail closed", () => {
  expect(orderRefundSummary(base,{deposit:1,rent:0},true,true).open).toBeNull();
  expect(orderRefundSummary({...base,rent_available:19.4},{deposit:0,rent:0},true,true).open).toBeNull();
});
it("failed requests do not reserve capacity; unresolved requests do", () => {
  expect(reservedRefundCents([{amount_cents:1940,status:'creating'},{amount_cents:50000,status:'succeeded'},{amount_cents:500,status:'failed'},{amount_cents:100,status:'partial_failed'}])).toBe(2040);
});