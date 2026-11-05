import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateOfferPdf } from "./offer-pdf.ts";
import { OFFER_FIXTURE } from "./pdf-test-fixtures.ts";
import { BANK_DISCOUNT_TERMS, priceBankTransfer } from "./bank-transfer-discount.ts";

Deno.test("discounted AB and invoice retain rental, insurance, VAT and unchanged deposit", async () => {
  const original = [{ product_name: "Miete", quantity: 1, unit_price: 100, discount_percent: 0, addons: [{ key: "insurance", label: "Versicherung", amount: 10 }] }];
  const priced = priceBankTransfer(original, 0, "bank");
  assertEquals(priced.totals.grossAmount, 126.97);
  for (const kind of ["order_confirmation", "invoice"] as const) {
    const bytes = await generateOfferPdf({ ...OFFER_FIXTURE, documentType: kind, offerNumber: "ISOLIERTER-TEST", items: priced.items.map(i => ({ ...i, total_price: 100 })), deliveryCost: 0, deliveryCostDelivery: 0, deliveryCostReturn: 0,
      servicesWithPrices: priced.items.flatMap((i, index) => (i.addons ?? []).map(a => ({ id: a.key, name: a.label, pricePercent: null, amount: a.amount, allocations: [{ itemIndex: index, amount: a.amount }] }))),
      servicesSurcharge: 6.7, ...priced.totals, deposit: 100, notes: BANK_DISCOUNT_TERMS, payments: [{ amount: 226.97, label: "Banküberweisung" }] });
    await Deno.writeFile(`/tmp/bank-discount-${kind}.pdf`, bytes);
  }
  assertEquals(original[0].addons.length, 1);
});