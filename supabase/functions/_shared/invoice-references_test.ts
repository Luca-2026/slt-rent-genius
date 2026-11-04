import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateOfferPdf } from "./offer-pdf.ts";
import { invoiceExtraFields } from "./inquiry-offer-math.ts";
import { OFFER_FIXTURE } from "./pdf-test-fixtures.ts";

const references = { commission: "KOM-2026-014", project: "BV-2026-081", cost_center: "KS-42", orderer: "Testbesteller" };
for (const businessType of ["rental", "sales"] as const) {
  for (const documentType of ["invoice", "supplement", "installment", "final"] as const) {
    Deno.test(`${businessType} ${documentType} retains offer commission and project in PDF`, async () => {
      const bytes = await generateOfferPdf({
        ...OFFER_FIXTURE, businessType, documentType,
        extraFields: invoiceExtraFields({ extra_fields: references }, undefined),
        offerNumber: "RE-TEST-REFERENZ", sourceOfferNumber: "ANG-TEST-REFERENZ",
      });
      const dir = await Deno.makeTempDir();
      try {
        const path = `${dir}/invoice.pdf`;
        await Deno.writeFile(path, bytes);
        const result = await new Deno.Command("pdftotext", { args: ["-layout", path, "-"] }).output();
        assertEquals(result.success, true);
        const text = new TextDecoder().decode(result.stdout);
        for (const value of Object.values(references)) assertEquals(text.includes(value), true, `${value} missing from ${businessType} ${documentType}`);
      } finally {
        await Deno.remove(dir, { recursive: true });
      }
    });
  }
}