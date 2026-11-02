import { describe, expect, it } from "vitest";
import { calculateFinancing, financingEligible, parseEuro } from "@/lib/financing";

describe("financing calculator", () => {
  it("full financing 10.000 € over 12 months at 5,5 %", () => {
    expect(calculateFinancing(10000, 0, 0, 12)?.monthly).toBe(858.37);
  });
  it("VAT down payment leaves the net amount financed", () => {
    expect(calculateFinancing(23990 * 1.19, 23990 * 0.19, 0, 60)?.financed).toBe(23990);
  });
  it("balloon lowers the monthly rate", () => {
    expect(calculateFinancing(20000, 0, 5000, 36)!.monthly).toBeLessThan(calculateFinancing(20000, 0, 0, 36)!.monthly);
  });
  it("rejects down payment plus balloon covering the price", () => {
    expect(calculateFinancing(10000, 6000, 4000, 24)).toBeNull();
  });
  it("only machines from 10.000 € net qualify", () => {
    expect(financingEligible(9999.99)).toBe(false);
    expect(financingEligible(10000)).toBe(true);
    expect(financingEligible(20000, true)).toBe(false);
  });
  it("parses German amounts", () => {
    expect(parseEuro("4.558,10 €")).toBe(4558.1);
  });
});

import { teaserMonthlyRate as teaser } from "@/lib/financing";
test("Preis-Lockrate: 60 Monate, Anzahlung = USt., ohne Schlussrate", () => {
  expect(teaser(22598.10, 18990)).toBe(362.73);
});
