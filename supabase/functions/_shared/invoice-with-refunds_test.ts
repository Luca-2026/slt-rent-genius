import { PDFDocument, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { invoiceWithRefunds } from "./invoice-with-refunds.ts";

Deno.test("late invoice receipt appends payment evidence without refunds or rewriting original pages", async () => {
  const original = await PDFDocument.create();
  original.addPage([595.28, 841.89]);
  const bytes = await original.save();
  const service = {
    storage: { from: () => ({ download: async () => ({ data: new Blob([new Uint8Array(bytes)]) }) }) },
    from: () => { const q: any = { select: () => q, eq: () => q, then: (resolve: any) => resolve({ data: [] }) }; return q; },
  };
  const invoice = { id: "late", file_path: "original.pdf", invoice_number: "RE-M-2026-11-0009", created_at: "2026-11-09T07:40:34Z", paid_amount: 60.69, gross_amount: 60.69,
    payments: [{ amount: 60.69, receipt_amount: 160.69, date: "2026-11-09", label: "Online-Zahlung (Stripe)", invoice_payment_recorded_at: "2026-11-09T07:42:33Z" }] };
  const result = await PDFDocument.load(await invoiceWithRefunds(service, invoice));
  if (result.getPageCount() !== 2 || result.getPage(0).getWidth() !== 595.28) throw new Error("Missing late payment evidence or changed original");
});

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

Deno.test("confirmed Stripe rental refund is incorporated without a separate receipt", async () => {
  const doc = await PDFDocument.create();
  doc.addPage();
  const bytes = await doc.save();
  const service = {
    storage: { from: () => ({ download: async () => ({ data: new Blob([new Uint8Array(bytes)]) }) }) },
    from: () => { const q: any = { select: () => q, eq: () => q, then: (resolve: any) => resolve({ data: [{ status: "succeeded", amount_cents: 12376, payout_method: "stripe", allocations: [{ status: "succeeded", amount_cents: 12376, refund_id: "re_TEST" }] }] }) }; return q; },
  };
  const result = await invoiceWithRefunds(service, { id: "test", file_path: "original.pdf", invoice_number: "RE-STRIPE-TEST", paid_amount: 680.68, gross_amount: 556.92 });
  if ((await PDFDocument.load(result)).getPageCount() !== 2) throw new Error("Missing refund statement");
  await Deno.writeFile("/tmp/invoice-stripe-confirmed.pdf", result);
});