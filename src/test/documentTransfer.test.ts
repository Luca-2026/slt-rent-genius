import { expect, it } from "vitest";
import { documentTransferCents } from "../../supabase/functions/_shared/document-transfer";
const base = { grossAmount: 556.92, deposit: 500, paymentTerms: "net_14" };
it("invoice customer QR includes only 556.92 and not the 500 deposit", () => {
  expect(documentTransferCents(base)).toBe(55692);
  expect(documentTransferCents({ ...base, documentType: "invoice" })).toBe(55692);
});
it("invoice QR contains remaining amount after actual payments", () => {
  expect(documentTransferCents({ ...base, documentType: "final", payments: [{ amount: 100 }] })).toBe(45692);
});
it("paid invoices and positive credit never request a new payment", () => {
  expect(documentTransferCents({ ...base, documentType: "invoice", payments: [{ amount: 556.92 }] })).toBeNull();
  expect(documentTransferCents({ ...base, documentType: "invoice", payments: [{ amount: 680.68 }] })).toBeNull();
});
it("prepayment QR uses shared discounted total and leaves deposit unchanged", () => {
  expect(documentTransferCents({ ...base, paymentTerms: "vorkasse" })).toBe(105692);
  expect(documentTransferCents({ ...base, bankTransferOffer: { amountCents: 103000 } })).toBe(103000);
});
it("deposit is not requested prematurely for 30 percent down payment", () => {
  expect(documentTransferCents({ ...base, paymentTerms: "anzahlung_30" })).toBe(16708);
});
it("undated offers and credit notes are not payable documents", () => {
  expect(documentTransferCents({ ...base, undatedOffer: true })).toBeNull();
  expect(documentTransferCents({ ...base, documentType: "credit_note" })).toBeNull();
});