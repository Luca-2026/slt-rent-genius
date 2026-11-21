import { expect, it } from "vitest";
import { invoicePaymentAgreement, invoicePaymentDueDate } from "../../supabase/functions/_shared/customer-payment-terms";

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
it("uses #6ZHACN's three calendar days instead of fourteen", () => {
  const text = "Die Miete ist jeweils zu Beginn des Abrechnungszeitraums im Voraus fällig und innerhalb von 3 Kalendertagen nach Rechnungsdatum ohne Abzug zu zahlen.";
  const result = invoicePaymentAgreement("business", "custom", undefined, text, undefined);
  expect(result).toEqual({ terms: "custom", custom: text, days: 3 });
  expect(invoicePaymentDueDate(new Date("2026-11-21T13:13:00Z"), result.days ?? -1).toISOString().slice(0, 10)).toBe("2026-11-24");
});
it("inherits the custom three-day deadline from the operational agreement", () => {
  expect(invoicePaymentAgreement("business", undefined, "custom", undefined, "3 Kalendertage nach Rechnungsdatum").days).toBe(3);
});
it.each(["", "Zahlung nach Vereinbarung", "14 Tage nach Rechnungseingang", "3 Arbeitstage nach Rechnungsdatum", "50 % innerhalb von 3 Tagen nach Rechnungsdatum, Rest später", "3 Tage nach Rechnungsdatum oder 30 Tage nach Rechnungsdatum"])("does not invent fourteen days for ambiguous custom terms: %s", (text) => {
  expect(invoicePaymentAgreement("business", "custom", undefined, text, undefined).days).toBeNull();
});
it("keeps immediate payment for private customers despite a custom deadline", () => {
  expect(invoicePaymentAgreement("private", "custom", undefined, "3 Kalendertage nach Rechnungsdatum", undefined)).toEqual({ terms: "vorkasse", days: 0, custom: "" });
});