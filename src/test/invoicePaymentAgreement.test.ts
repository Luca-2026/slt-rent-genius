import { expect, it } from "vitest";
import { invoicePaymentAgreement } from "../../supabase/functions/_shared/customer-payment-terms";

it("inherits Blumen Peeters' agreed fourteen-day invoice term", () => {
  expect(invoicePaymentAgreement("business", undefined, "net_14", undefined, undefined)).toEqual({ terms: "net_14", days: 14, custom: "" });
});
it("preserves an explicit staff payment-term choice", () => {
  expect(invoicePaymentAgreement("business", "net_7", "net_14", undefined, undefined).days).toBe(7);
});
it("does not grant private customers invoice payment", () => {
  expect(invoicePaymentAgreement("private", undefined, "net_14", undefined, undefined).days).toBe(0);
});
it("retains individually agreed payment conditions", () => {
  expect(invoicePaymentAgreement("business", undefined, "custom", undefined, "14 Tage nach Rechnungseingang").custom).toBe("14 Tage nach Rechnungseingang");
});