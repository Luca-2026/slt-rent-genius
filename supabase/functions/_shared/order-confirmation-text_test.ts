import { assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateOfferPdf } from "./offer-pdf.ts";
import { offerItemText } from "./offer-item-text.ts";
import { OFFER_FIXTURE } from "./pdf-test-fixtures.ts";

Deno.test("AB renders accepted loader/insurance overrides without changing snapshot", async () => {
  const items = [
    { product_name: "5,5t Kompakt- Raupenlader", name_override: "4,85 to. Kompakt-Raupenlader", quantity: 10, unit: "Miettage", unit_price: 215, total_price: 2150 },
    { product_name: "6-fach Ladegerät", name_override: "Maschinenbruchversicherung je Kalendertag", description_override: "Selbstbehalt: 8.000 Euro", quantity: 15, unit: "Miettage", unit_price: 21.5, total_price: 322.5 },
  ];
  const before = JSON.stringify(items);
  const pdf = await generateOfferPdf({ ...OFFER_FIXTURE, documentType: "order_confirmation", offerNumber: "AB-TEST", sourceOfferNumber: "ANG-TEST", orderConfirmationGreeting: { addressForm: "sie", salutation: "Sehr geehrter Herr Petermann," }, items: items.map(item => ({ ...item, ...offerItemText(item) })), servicesWithPrices: [], servicesSurcharge: 0, deliveryCost: 660, deliveryCostDelivery: 330, deliveryCostReturn: 330, netAmount: 3132.5, vatAmount: 595.18, grossAmount: 3727.68 });
  assert(pdf.length > 1000);
  assert(JSON.stringify(items) === before);
  await Deno.writeFile("/tmp/ab-override-regression.pdf", pdf);
});