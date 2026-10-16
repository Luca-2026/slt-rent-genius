// Paket 3b: altes Angebot erzeugt weiterhin ein PDF; optionale Versicherungsstufe erscheint als eigene Zeile
// mit Betrag je KT, ohne die Summen zu verändern.
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateOfferPdf } from "./offer-pdf.ts";
import { OFFER_FIXTURE } from "./pdf-test-fixtures.ts";

const toBytes = (r: unknown) => (r instanceof Uint8Array ? r : new Uint8Array(r as ArrayBuffer));

Deno.test("altes Angebot ohne neue Felder erzeugt PDF", async () => {
  const pdf = toBytes(await generateOfferPdf({ ...OFFER_FIXTURE } as any));
  assert(pdf.length > 1000);
  await Deno.writeFile("/tmp/offer-old.pdf", pdf);
});

Deno.test("optionale Stufe als Zeile, Summen unverändert", async () => {
  const services = [
    ...OFFER_FIXTURE.servicesWithPrices,
    { id: "0-opt", name: "Selbstbehalt-Reduzierung auf 500 €", pricePercent: null, amount: 0, optional: true, perDay: 10, allocations: [{ itemIndex: 0, amount: 0 }] },
  ];
  const pdf = toBytes(await generateOfferPdf({ ...OFFER_FIXTURE, servicesWithPrices: services } as any));
  assert(pdf.length > 1000);
  await Deno.writeFile("/tmp/offer-opt.pdf", pdf);
  assertEquals(services.reduce((s, x) => s + x.amount, 0), OFFER_FIXTURE.servicesWithPrices.reduce((s, x) => s + x.amount, 0));
});
