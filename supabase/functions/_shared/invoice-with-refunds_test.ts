import { PDFDocument, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { invoiceWithRefunds } from "./invoice-with-refunds.ts";

Deno.test("invoice retains original page and incorporates confirmed rental refund without any new stored receipt", async () => {
  const original = await PDFDocument.create();
  const font = await original.embedFont(StandardFonts.Helvetica);
  original.addPage([595.28, 841.89]).drawText("Original invoice 556.92", { x: 50, y: 700, font });
  const originalBytes = await original.save();
  let writes = 0;
  const service = {
    storage: { from: () => ({ download: async () => ({ data: new Blob([new Uint8Array(originalBytes)]) }), upload: () => { writes++; throw new Error("Forbidden write"); } }) },
    from: () => { const q: any = { select: () => q, eq: () => q, then: (resolve: any) => resolve({ data: [{ status: "succeeded", amount_cents: 12376, payout_method: "transfer", updated_at: "2026-11-05", bank_reference: "TEST" }] }) }; return q; },
  };
  const result = await invoiceWithRefunds(service, { id: "test", file_path: "original.pdf", invoice_number: "RE-M-TEST", paid_amount: 680.68, gross_amount: 556.92 });
  const doc = await PDFDocument.load(result);
  if (doc.getPageCount() !== 2 || doc.getPage(0).getWidth() !== 595.28 || writes !== 0) throw new Error("Original invoice or read-only guarantee violated");
});