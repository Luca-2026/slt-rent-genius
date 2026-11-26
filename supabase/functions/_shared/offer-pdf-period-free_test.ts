import { assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateOfferPdf } from "./offer-pdf.ts";
import { OFFER_FIXTURE } from "./pdf-test-fixtures.ts";
import { snapshotOf } from "./pdf-regression.ts";

const items = [
  {
    product_name: "Batterien für Warnlampen",
    description: "",
    quantity: 2,
    articles: 2,
    quantity_unit: "stk",
    period_free: true,
    duration: 1,
    unit: "Stk",
    unit_code: "stueck",
    unit_price: 5,
    discount_percent: 0,
    total_price: 10,
    vat_rate: 19,
  },
  {
    product_name: "Kraftstoff Diesel nachgetankt",
    description: "Rückgabekosten laut Rückgabeprotokoll",
    quantity: 24,
    articles: 24,
    quantity_unit: "liter",
    period_free: true,
    duration: 1,
    unit: "Liter",
    unit_code: "stueck",
    unit_price: 2.85,
    discount_percent: 0,
    total_price: 68.4,
    vat_rate: 19,
  },
];

for (const documentType of ["offer", "order_confirmation", "invoice"]) {
  Deno.test(`${documentType}: Liter und Verkaufsartikel ohne Mietzeitraum`, async () => {
    const pdf = await generateOfferPdf({
      ...OFFER_FIXTURE,
      documentType,
      businessType: "rental",
      items,
      deliveryCost: 0,
      deliveryCostDelivery: 0,
      deliveryCostReturn: 0,
      servicesSurcharge: 0,
      servicesWithPrices: [],
      netAmount: 78.4,
      vatAmount: 14.9,
      grossAmount: 93.3,
      deposit: 0,
      notes: null,
      inquiryOffer: { addressForm: "du", salutation: "Hallo Erika," },
    } as any);
    const snapshot = await snapshotOf(pdf);
    const text = snapshot.pageSnapshots.flatMap((page) => page.texts.map((entry) => entry.t)).join(" | ");
    assert(!text.includes("Mietzeitraum"), "Dauerfreie Position erhielt einen Mietzeitraum");
    assert(text.includes("2,85"), "Literpreis fehlt");
    assert(text.includes("68,40"), "Literpositionsumme fehlt");
    if (documentType === "offer") assert(text.includes("24 Liter"), "Litermenge fehlt im Angebot");
    await Deno.writeFile(`/tmp/offer-period-free-${documentType}.pdf`, pdf);
  });
}
