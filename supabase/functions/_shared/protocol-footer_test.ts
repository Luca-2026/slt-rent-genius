import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateOfferPdf } from "../generate-offer/pdf.ts";
import { OFFER_FIXTURE } from "./pdf-test-fixtures.ts";
import { snapshotOf } from "./pdf-regression.ts";
import { FOOTER_RULE_Y, FOOTER_TOP, unifiedFooterHtml, resolvePdfLocation } from "./pdf-footer.ts";
import { SLT_COMPANY } from "./company.ts";

// Load only the production renderer, never Deno.serve, database writes or mail.
async function legacyRenderer(kind: string) {
  const file = new URL(`../${kind}/index.ts`, import.meta.url);
  const source = await Deno.readTextFile(file);
  const renderer = source.slice(source.indexOf("async function generateDocumentPdf("));
  assert(renderer.startsWith("async function generateDocumentPdf("));
  const footer = new URL("./pdf-footer.ts", import.meta.url).href;
  const company = new URL("./company.ts", import.meta.url).href;
  const code = `import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { drawUnifiedFooter, resolvePdfLocation, FOOTER_TOP } from ${JSON.stringify(footer)};
import { SLT_COMPANY } from ${JSON.stringify(company)};
export ${renderer}`;
  return (await import(`data:application/typescript;base64,${btoa(unescape(encodeURIComponent(code)))}`)).generateDocumentPdf;
}

for (const kind of ["generate-delivery-note", "generate-return-protocol"]) {
  for (const location of ["krefeld", "bonn", "muelheim"]) {
    Deno.test(`${kind}: identical offer footer at ${location}, short and multi-page`, async () => {
      const render = await legacyRenderer(kind);
      const fixture = { ...structuredClone(OFFER_FIXTURE), issuingLocation: location };
      const reference = await snapshotOf(await generateOfferPdf(fixture as never));
      const expected = reference.pageSnapshots[0].texts.filter((t) => t.y < FOOTER_RULE_Y);
      for (const count of [1, 28]) {
        const bytes = await render({ title: "TESTPROTOKOLL", documentNumber: "TEST-NICHT-VERSENDEN", date: "2026-10-03",
          issuingLocation: location,
          profile: { company_name: "Testmuster", contact_first_name: "Test", contact_last_name: "Prüfung", street: "Testanschrift", postal_code: "00000", city: "Testort", assigned_location: "krefeld" },
          items: Array.from({ length: count }, (_, i) => ({ name: `Testposition ${i + 1}`, quantity: 1, description: "Lange Testbeschreibung für Seitenumbruch und Fußzeilenabstand. ".repeat(3) })),
          sections: [{ label: "Bemerkungen", value: "Testtext ä ö ü ß. ".repeat(count * 3) }], signatures: { staffName: "Testmitarbeiter" },
        });
        const snapshot = await snapshotOf(bytes);
        if (count > 1) assert(snapshot.pages > 1);
        for (const page of snapshot.pageSnapshots) {
          assertEquals(page.texts.filter((t) => t.y < FOOTER_RULE_Y), expected);
          assert(page.texts.filter((t) => t.y >= FOOTER_RULE_Y && !t.t.startsWith("Seite ")).every((t) => t.y >= FOOTER_TOP));
        }
      }
      const html = unifiedFooterHtml(SLT_COMPANY, resolvePdfLocation(location));
      assert(html.includes("Persönlich haftende Gesellschafterin:"));
      assert(html.includes(resolvePdfLocation(location).street));
    });
  }
}