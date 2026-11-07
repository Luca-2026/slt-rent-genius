import { expect, it } from "vitest";
import { settledInvoiceBalance } from "../../supabase/functions/_shared/invoice-refund-balance";
it("Florian's 307.26 invoice has zero balance after the 69.97 rental refund", () => {
  expect(settledInvoiceBalance(307.26, 377.23, 69.97)).toBe(0);
});
it("keeps unrefunded rental credit visible instead of disguising it as zero", () => {
  expect(settledInvoiceBalance(307.26, 377.23)).toBe(-69.97);
});
it("preserves an actual customer debt", () => {
  expect(settledInvoiceBalance(397.23, 377.23)).toBe(20);
});