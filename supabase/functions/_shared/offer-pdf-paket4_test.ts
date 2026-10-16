// Paket 4: Anrede (du/sie), Angebotsbedingungen (Bau-Regel) und PDF-Ausgabe für Mietanfrage-Angebote.
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateOfferPdf } from "./offer-pdf.ts";
import { OFFER_FIXTURE } from "./pdf-test-fixtures.ts";
import { salutationLine } from "./salutation.ts";
import { defaultTermsText, printableTerms } from "./offer-terms.ts";

const toBytes = (r: unknown) => (r instanceof Uint8Array ? r : new Uint8Array(r as ArrayBuffer));
const P1B = "Grundlage ... zzgl. der jeweils gültigen MwSt.";
const P1P = "Grundlage ... inkl. der jeweils gültigen MwSt.";
const P2 = "Wir gehen von einer Nutzung montags bis freitags im Einschichtbetrieb aus.";
const BLOCK = { text_business: `${P1B}\n\n${P2}`, text_private: `${P1P}\n\n${P2}` };

Deno.test("du: Hallo Vorname", () => {
  assertEquals(salutationLine({ address_form: "du", salutation: "frau", name: "Anna Müller" }), "Hallo Anna,");
  assertEquals(salutationLine({ address_form: "du", name: "" }), "Hallo,");
  assertEquals(salutationLine({ name: "Anna Müller" }), "Hallo Anna,"); // Standard = du
});

Deno.test("sie: Sehr geehrte Frau / Herr Nachname, sonst Damen und Herren", () => {
  assertEquals(salutationLine({ address_form: "sie", salutation: "frau", name: "Anna Müller" }), "Sehr geehrte Frau Müller,");
  assertEquals(salutationLine({ address_form: "sie", salutation: "herr", name: "Max von Berg" }), "Sehr geehrter Herr Berg,");
  assertEquals(salutationLine({ address_form: "sie", salutation: null, name: "Anna Müller" }), "Sehr geehrte Damen und Herren,");
  assertEquals(salutationLine({ address_form: "sie", salutation: "frau", name: "" }), "Sehr geehrte Damen und Herren,");
});

Deno.test("Bedingungen: Unternehmen zzgl., Privat inkl.", () => {
  assert(defaultTermsText(BLOCK, "business").startsWith(P1B));
  assert(defaultTermsText(BLOCK, "private").startsWith(P1P));
});

Deno.test("Bedingungen: ohne Bau-Artikel nur Absatz 1, mit Bau beide", () => {
  assertEquals(printableTerms(BLOCK.text_business, false), P1B);
  assertEquals(printableTerms(BLOCK.text_business, true), `${P1B}\n\n${P2}`);
});

Deno.test("PDF mit Ihre Daten, Gruppen, Dauer, optionaler Stufe und Bedingungen", async () => {
  const items = OFFER_FIXTURE.items.map((i: any, k: number) => ({ ...i, articles: 1, duration: 3, unit_code: "miettage", quantity_unit: "stk", group_id: k === 0 ? "g1" : undefined }));
  const services = [
    ...OFFER_FIXTURE.servicesWithPrices,
    { id: "0-opt", name: "Selbstbehalt-Reduzierung", pricePercent: null, amount: 0, optional: true, perDay: 10, allocations: [{ itemIndex: 0, amount: 0 }] },
  ];
  for (const form of ["du", "sie"] as const) {
    const pdf = toBytes(await generateOfferPdf({
      ...OFFER_FIXTURE,
      items,
      servicesWithPrices: services,
      inquiryOffer: {
        addressForm: form,
        salutation: salutationLine({ address_form: form, salutation: "frau", name: "Anna Müller" }),
        customerData: { contact: "Anna Müller", email: "luca@sandhoff.org" },
        orderType: "delivery",
        groups: [{ id: "g1", name: "Verdichtung" }],
        termsText: printableTerms(BLOCK.text_business, false),
      },
    } as any));
    assert(pdf.length > 1000);
    await Deno.writeFile(`/tmp/offer-p4-${form}.pdf`, pdf);
  }
});
