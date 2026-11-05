import { generateOfferPdf } from "./offer-pdf.ts";
import { OFFER_FIXTURE, INVOICE_FIXTURE } from "./pdf-test-fixtures.ts";
import { generateDocumentPdf } from "../generate-invoice/pdf.ts";
import { documentTransferCents } from "./document-transfer.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

for (const [name, extras, expected] of [
  ["offer-net14", { paymentTerms: "net_14" }, 55692],
  ["sales-offer-net14", { paymentTerms: "net_14", businessType: "sales" }, 55692],
  ["invoice-net14", { documentType: "invoice", paymentTerms: "net_14" }, 55692],
  ["invoice-partial", { documentType: "invoice", paymentTerms: "net_14", payments: [{ amount: 100 }] }, 45692],
  ["invoice-credit", { documentType: "invoice", payments: [{ amount: 680.68 }] }, null],
] as const) {
  Deno.test(`transfer document ${name} preserves payable amount`, async () => {
    const data = { ...OFFER_FIXTURE, grossAmount: 556.92, deposit: 500, orderCode: "TEST01", offerNumber: "TEST-QR", ...extras };
    assertEquals(documentTransferCents(data), expected);
    await Deno.writeFile(`/tmp/${name}.pdf`, await generateOfferPdf(data as Parameters<typeof generateOfferPdf>[0]));
  });
}
Deno.test("separate portal invoice has readable transfer code", async () => {
  await Deno.writeFile("/tmp/portal-invoice-qr.pdf", await generateDocumentPdf(structuredClone(INVOICE_FIXTURE) as never));
});