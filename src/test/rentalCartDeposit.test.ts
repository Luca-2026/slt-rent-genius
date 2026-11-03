import { expect, it } from "vitest";
import { rentalCartDeposit } from "../lib/rentalCartDeposit";

it("shows the known 100 euro set deposit before dates or a quote exist", () => {
  expect(rentalCartDeposit(1, undefined, { deposit_amount: 100 })).toBe(100);
  expect(rentalCartDeposit(2, undefined, { deposit_amount: 100 })).toBe(200);
});
it("keeps a known quote total without multiplying it or adding VAT", () => {
  expect(rentalCartDeposit(2, 300, { deposit_amount: 100 })).toBe(300);
});
it("preserves unknown deposits and explicit zero for all rental inquiries", () => {
  expect(rentalCartDeposit(1, null, { deposit_amount: null })).toBeNull();
  expect(rentalCartDeposit(1, undefined, { deposit_amount: 0 })).toBe(0);
  expect(rentalCartDeposit(1, undefined, { deposit_amount: 150 })).toBe(150);
});