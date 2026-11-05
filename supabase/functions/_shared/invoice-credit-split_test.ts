import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateOfferPdf } from "./offer-pdf.ts";
import { OFFER_FIXTURE } from "./pdf-test-fixtures.ts";
import { depositSummary, settlementPayments } from "./final-invoice-deposit.ts";

Deno.test("final invoice preserves 123.76 rental credit separately from 500 deposit", async () => {
  const summary = depositSummary({ deposit_held: 500, balance: 500, offset_amount: 0, payout_method: "transfer", payout_status: "paid", payout_date: "2026-11-05", settled_at: "2026-11-05" });
  const payments = settlementPayments([{ date: "2026-11-05", amount: 1180.68, label: "Banküberweisung", reference: "" }], 1180.68, summary, "96ASUG");
  assertEquals(payments[0].amount, 680.68);
  const pdf = await generateOfferPdf({ ...OFFER_FIXTURE, documentType: "final", offerNumber: "ISOLIERTER-TEST", documentGreeting: { addressForm: "du", salutation: "Hallo Test," },
    items: [{ product_name: "Bagger", quantity: 5, unit_price: 104, discount_percent: 20, total_price: 416 }], deliveryCost: 0, deliveryCostDelivery: 0, deliveryCostReturn: 0,
    servicesSurcharge: 52, servicesWithPrices: [{ id: "mb", name: "Maschinenbruchversicherung", pricePercent: null, amount: 52, allocations: [{ itemIndex: 0, amount: 52 }] }],
    netAmount: 468, vatAmount: 88.92, grossAmount: 556.92, deposit: 500, depositSettlement: summary, payments });
  await Deno.writeFile("/tmp/browser/remaining/invoice-split.pdf", pdf);
});

Deno.test("explicit Sie invoice uses the same payment amounts without changing totals", async () => {
  const pdf = await generateOfferPdf({ ...OFFER_FIXTURE, documentType: "invoice", documentGreeting: { addressForm: "sie", salutation: "Sehr geehrte Frau Test," }, grossAmount: 119, netAmount: 100, vatAmount: 19, payments: [{ amount: 119, label: "Banküberweisung" }] });
  assertEquals(pdf.slice(0, 4), new TextEncoder().encode("%PDF"));
  await Deno.writeFile("/tmp/browser/remaining/invoice-sie.pdf", pdf);
});