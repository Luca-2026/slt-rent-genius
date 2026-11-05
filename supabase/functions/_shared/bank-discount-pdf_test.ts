import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateOfferPdf } from "./offer-pdf.ts";
import { OFFER_FIXTURE } from "./pdf-test-fixtures.ts";
import { BANK_DISCOUNT_TERMS, priceBankTransfer } from "./bank-transfer-discount.ts";
import { lineTotal } from "./inquiry-offer-math.ts";

Deno.test("offer transfer QR uses 3 percent rental discount and unchanged deposit", async () => {
  const priced = priceBankTransfer([{ product_name: "Miete", quantity: 1, unit_price: 100, discount_percent: 0 }], 0, "bank");
  assertEquals(priced.bankTotals.grossAmount, 115.43);
  const bytes = await generateOfferPdf({ ...OFFER_FIXTURE, offerNumber: "ANG-TEST-QR", orderCode: "TEST01", paymentTerms: "vorkasse", bankTransferOffer: { amountCents: 41543, discountGross: 3.57 }, deposit: 300,
    items: [{ product_name: "Miete", quantity: 1, unit_price: 100, discount_percent: 0, total_price: 100 }], deliveryCost: 0, deliveryCostDelivery: 0, deliveryCostReturn: 0, servicesSurcharge: 0, servicesWithPrices: [],
    netAmount: 100, vatAmount: 19, grossAmount: 119 });
  await Deno.writeFile("/tmp/bank-discount-offer-qr.pdf", bytes);
});

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

Deno.test("post-acceptance 20 percent rental discount propagates to AB and invoice with recalculated bank rebate", async () => {
  const priced = priceBankTransfer([{ product_name: "Bagger", quantity: 10, articles: 1, unit_price: 100, discount_percent: 20 }], 0, "bank");
  assertEquals(priced.totals.grossAmount, 923.44);
  assertEquals(priced.items[0].addons?.[0].amount, -24);
  for (const documentType of ["order_confirmation", "invoice"] as const) {
    const bytes = await generateOfferPdf({ ...OFFER_FIXTURE, documentType, offerNumber: "NACHTRAEGLICH-TEST", items: priced.items.map(i => ({ ...i, total_price: lineTotal(i) })), ...priced.totals,
      deliveryCost: 0, deliveryCostDelivery: 0, deliveryCostReturn: 0, servicesSurcharge: -24, deposit: 100,
      servicesWithPrices: [{ id: "bank", name: "3 % Überweisungsrabatt", pricePercent: null, amount: -24, allocations: [{ itemIndex: 0, amount: -24 }] }] });
    await Deno.writeFile(`/tmp/post-discount-${documentType}.pdf`, bytes);
  }
});