import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  appendPayment,
  paymentMatches,
  planPaymentAmounts,
  refundableDepositCents,
  shouldOfferPaymentLink,
  toCents,
} from "./stripe-pay.ts";

Deno.test("Betrag: Miete + Kaution centgenau", () => {
  assertEquals(planPaymentAmounts({ gross: 119.99, deposit: 200 }), { openCents: 31999, rentCents: 11999, depositCents: 20000 });
  assertEquals(toCents(0.1 + 0.2), 30);
});

Deno.test("Vorzahlung deckt zuerst die Miete", () => {
  assertEquals(planPaymentAmounts({ gross: 100, deposit: 50, paidCents: 10000 }), { openCents: 5000, rentCents: 0, depositCents: 5000 });
  assertEquals(planPaymentAmounts({ gross: 100, deposit: 50, paidCents: 4000 }), { openCents: 11000, rentCents: 6000, depositCents: 5000 });
  assertEquals(planPaymentAmounts({ gross: 100, deposit: 0, paidCents: 10000 }).openCents, 0);
});

Deno.test("Link nur für Vorkasse; Testmodus nur Testadresse", () => {
  const base = { paymentTerms: "anzahlung_30", customerEmail: "kunde@firma.de", testMode: false, openCents: 100 };
  assertEquals(shouldOfferPaymentLink(base), true);
  assertEquals(shouldOfferPaymentLink({ ...base, paymentTerms: "net_14" }), false);
  assertEquals(shouldOfferPaymentLink({ ...base, testMode: true }), false);
  assertEquals(shouldOfferPaymentLink({ ...base, testMode: true, customerEmail: " Luca@Sandhoff.org " }), true);
  assertEquals(shouldOfferPaymentLink({ ...base, openCents: 0 }), false);
});

Deno.test("Zahlung nur bei exaktem Betrag", () => {
  assertEquals(paymentMatches(31999, 31999), true);
  assertEquals(paymentMatches(31998, 31999), false);
  assertEquals(paymentMatches(null, 31999), false);
});

Deno.test("Zahlung wird nicht doppelt gebucht", () => {
  const p = { date: "2026-10-04", amount: 319.99, label: "Online-Zahlung (Stripe)", reference: "cs_1" };
  const first = appendPayment([{ amount: 10, reference: "bank" }], p);
  assertEquals(first.added, true);
  assertEquals(first.paidAmount, 329.99);
  const second = appendPayment(first.payments, p);
  assertEquals(second.added, false);
  assertEquals(second.paidAmount, 329.99);
});

Deno.test("Kaution: nur noch offener Anteil erstattbar", () => {
  assertEquals(refundableDepositCents(20000, []), 20000);
  assertEquals(refundableDepositCents(20000, [{ amount_cents: 5000, status: "succeeded" }, { amount_cents: 3000, status: "pending" }]), 12000);
  assertEquals(refundableDepositCents(20000, [{ amount_cents: 5000, status: "failed" }]), 20000);
  assertEquals(refundableDepositCents(20000, [{ amount_cents: 20000, status: "succeeded" }]), 0);
});
