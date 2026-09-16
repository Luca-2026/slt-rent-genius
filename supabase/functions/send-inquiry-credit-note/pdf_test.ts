import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateOfferPdf } from "../_shared/offer-pdf.ts";
import { findText, snapshotOf } from "../_shared/pdf-regression.ts";

const profile = {
  id: "K-10042",
  company_name: "Musterbau GmbH",
  contact_first_name: "Erika",
  contact_last_name: "Musterfrau",
  street: "Teststraße 12",
  postal_code: "40213",
  city: "Düsseldorf",
  country: "Deutschland",
};

const base = {
  documentType: "credit_note" as const,
  offerNumber: "GS-2026-09-0001",
  offerDate: "2026-09-16",
  validUntil: "2026-09-16",
  parentInvoiceNumber: "RE-2026-09-0001",
  parentInvoiceDate: "2026-09-15",
  creditReason: "Mietzeit verkürzt",
  servicePeriodStart: "2026-09-01",
  servicePeriodEnd: "2026-09-05",
  profile,
  items: [{
    product_name: "Teilgutschrift Mietdauer",
    description: "Zwei Kalendertage",
    quantity: 1,
    unit: "Pauschale",
    unit_price: 168.07,
    discount_percent: 0,
    total_price: 168.07,
    image_url: null,
  }],
  deliveryCost: 0,
  deliveryCostDelivery: 0,
  deliveryCostReturn: 0,
  servicesSurcharge: 0,
  servicesWithPrices: [],
  netAmount: 168.07,
  vatRate: 19,
  vatAmount: 31.93,
  grossAmount: 200,
  isReverseCharge: false,
  notes: null,
  validDays: 0,
  deposit: 0,
  staffName: "Max Mustermann",
  issuingLocation: "krefeld",
  paymentTerms: "net_14",
};

Deno.test("Teilgutschrift bleibt auf einer Seite und weist den Restbetrag aus", async () => {
  const bytes = await generateOfferPdf({
    ...base,
    creditIsPartial: true,
    creditRefundAmount: 0,
    creditRemainingBalance: 612.93,
  });
  const snap = await snapshotOf(bytes);
  assertEquals(snap.pageSnapshots.length, 1);
  const title = findText(snap, "RECHNUNGSKORREKTUR");
  assert(title, "Titel fehlt");
  assertEquals(title.size, 20);
  assert(findText(snap, "612,93"), "Restbetrag fehlt");
  assert(!findText(snap, "Zahlung innerhalb"), "Unpassender Zahlungshinweis vorhanden");
});

Deno.test("Vollgutschrift nennt Erstattung und vollständige Aufhebung", async () => {
  const bytes = await generateOfferPdf({
    ...base,
    creditIsPartial: false,
    creditRefundAmount: 200,
    creditRemainingBalance: 0,
  });
  const snap = await snapshotOf(bytes);
  assertEquals(snap.pageSnapshots.length, 1);
  assert(findText(snap, "erstattet"), "Erstattungshinweis fehlt");
  assert(findText(snap, "vollständig auf"), "Hinweis auf vollständige Aufhebung fehlt");
});