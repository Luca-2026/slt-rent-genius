import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { drawUnifiedFooter, resolvePdfLocation } from "./pdf-footer.ts";
import { SLT_COMPANY } from "./offer-company.ts";
import { invoiceRefundBalance } from "./invoice-refund-balance.ts";

/** Keep issued invoice pages byte-for-byte in content; append the current payment statement to the same invoice. */
export async function invoiceWithRefunds(service: any, invoice: any): Promise<Uint8Array> {
  if (!invoice.file_path) throw new Error("Kein ursprüngliches Rechnungs-PDF vorhanden.");
  const { data: file, error: fileError } = await service.storage.from("b2b-invoices").download(invoice.file_path);
  if (fileError || !file) throw new Error("Ursprüngliches Rechnungs-PDF konnte nicht geladen werden.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { data: refunds, error } = await service.from("credit_note_refunds").select("*").eq("credit_note_id", invoice.id).eq("refund_kind", "rental_credit");
  if (error) throw new Error("Erstattungsstand konnte nicht sicher gelesen werden.");
  if (!refunds?.length) return bytes;
  const balance = invoiceRefundBalance(invoice, refunds);
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595.28, 841.89]);
  let y = 780;
  const safe = (s: string) => s.replace(/[^\x20-\x7E\xA0-\xFF€]/g, "-");
  const line = (text: string, strong = false, size = 11) => {
    const textFont = strong ? bold : font;
    const words = safe(text).split(" "); let current = "";
    for (const word of words) {
      if (textFont.widthOfTextAtSize(`${current} ${word}`, size) > 495 && current) { page.drawText(current, { x: 50, y, size, font: textFont }); y -= 18; current = ""; }
      current += (current ? " " : "") + word;
    }
    page.drawText(current, { x: 50, y, size, font: textFont, color: rgb(0, .31, .49) }); y -= 25;
  };
  const euro = (cents: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
  line(`Rechnung ${invoice.invoice_number}`, true, 18);
  line("Zahlungsstand einschließlich Mieterstattung", true, 14);
  line(`Stand: ${new Date().toISOString().slice(0, 10)}`);
  if (invoice.rental_inquiry_id) {
    const { data: inquiry, error: readError } = await service.from("rental_inquiries").select("order_code").eq("id", invoice.rental_inquiry_id).single();
    if (readError) throw new Error("Auftrags-ID konnte nicht gelesen werden.");
    if (inquiry?.order_code) line(`Auftrag #${inquiry.order_code}`);
  }
  line(`Angerechnete Mietzahlungen: ${euro(Math.round(Number(invoice.paid_amount) * 100))}`);
  line(`Rechnungsbetrag: ${euro(Math.round(Number(invoice.gross_amount) * 100))}`);
  line(`Mietguthaben vor Erstattung: ${euro(balance.credit_cents)}`);
  line(`Bereits erstattetes Mietguthaben: ${euro(balance.refunded_cents)}`, true);
  line(`Noch zu erstattendes Mietguthaben: ${euro(balance.remaining_cents)}`, true);
  for (const r of refunds) {
    if (r.payout_method === "transfer" && r.status === "succeeded") {
      line(`Überweisung vom ${String(r.updated_at).slice(0, 10)}: ${euro(r.amount_cents)}`);
      if (r.bank_reference) line(`Banknachweis: ${String(r.bank_reference).slice(0, 200)}`);
    } else if (r.payout_method === "stripe") {
      for (const a of r.allocations ?? []) line(`Online-Erstattung ${a.refund_id ?? "vorbereitet"}: ${euro(a.amount_cents)} - ${a.status === "succeeded" ? "erstattet" : "noch nicht als erstattet bestätigt"}`);
    } else line("Überweisungsauftrag vorbereitet; noch keine Auszahlung bestätigt.");
  }
  line("Die Kaution bleibt gesondert abgerechnet. Rechnungsbetrag, Umsatzsteuer und ursprüngliche Zahlungseingänge werden durch die Auszahlung nicht erneut geändert.", false, 10);
  drawUnifiedFooter({ doc, font, company: SLT_COMPANY, location: resolvePdfLocation(invoice.location), W: 595.28, ML: 50, MR: 50, safe, showPageNo: index => index === doc.getPageCount() - 1 });
  return doc.save();
}