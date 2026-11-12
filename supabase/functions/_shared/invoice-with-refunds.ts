import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { drawUnifiedFooter, resolvePdfLocation } from "./pdf-footer.ts";
import { SLT_COMPANY } from "./offer-company.ts";
import { confirmedRefundsByMethod, invoiceRefundBalance } from "./invoice-refund-balance.ts";
import { resolveAddressForm } from "./salutation.ts";
import { lateInvoicePaymentStatement } from "./late-invoice-payments.ts";

/** Keep issued invoice pages byte-for-byte in content; append the current payment statement to the same invoice. */
export async function invoiceWithRefunds(service: any, invoice: any): Promise<Uint8Array> {
  if (!invoice.file_path) throw new Error("Kein ursprüngliches Rechnungs-PDF vorhanden.");
  const { data: file, error: fileError } = await service.storage.from("b2b-invoices").download(invoice.file_path);
  if (fileError || !file) throw new Error("Ursprüngliches Rechnungs-PDF konnte nicht geladen werden.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { data: refunds, error } = await service.from("credit_note_refunds").select("*").eq("credit_note_id", invoice.id).eq("refund_kind", "rental_credit");
  if (error) throw new Error("Erstattungsstand konnte nicht sicher gelesen werden.");
  const latePayments = lateInvoicePaymentStatement(invoice);
  if (!refunds?.length && !latePayments.payments.length) return bytes;
  const balance = invoiceRefundBalance(invoice, refunds ?? []);
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
  let addressForm: "du" | "sie" = "du";
  line(`Rechnung ${invoice.invoice_number}`, true, 18);
  line(refunds?.length ? "Zahlungsstand einschließlich Mieterstattung" : "Aktueller Zahlungsstand zur Rechnung", true, 14);
  line(`Stand: ${new Date().toISOString().slice(0, 10)}`);
  if (invoice.rental_inquiry_id) {
    const { data: inquiry, error: readError } = await service.from("rental_inquiries").select("order_code,address_form,crm_customer_id,b2b_profile_id").eq("id", invoice.rental_inquiry_id).single();
    if (readError) throw new Error("Auftrags-ID konnte nicht gelesen werden.");
    if (inquiry?.order_code) line(`Auftrag #${inquiry.order_code}`);
    addressForm = await resolveAddressForm(service, inquiry);
  }
  line(`Angerechnete Mietzahlungen: ${euro(Math.round(Number(invoice.paid_amount) * 100))}`);
  line(`Rechnungsbetrag: ${euro(Math.round(Number(invoice.gross_amount) * 100))}`);
  for (const p of latePayments.payments) {
    line(`${p.label || "Zahlungseingang"} vom ${String(p.date ?? "").split("-").reverse().join(".")}: ${euro(Math.round(Number(p.receipt_amount ?? p.amount) * 100))}`);
    line(`Davon auf diese Rechnung angerechnet: ${euro(Math.round(p.amount * 100))}`);
    if (p.receipt_amount && p.receipt_amount > p.amount) line("Der übrige Zahlungseingang gehört nicht zu dieser Rechnungsanrechnung; die Kaution wird getrennt abgerechnet.", false, 10);
  }
  line(`Offener Rechnungsbetrag: ${euro(Math.round(latePayments.balance * 100))}`, true);
  if (!refunds?.length) {
    line("Dieser Zahlungsnachtrag ergänzt die ursprüngliche Rechnung. Rechnungsnummer, Leistungen, Rechnungsbetrag und Umsatzsteuer bleiben unverändert.", false, 10);
    drawUnifiedFooter({ doc, font, company: SLT_COMPANY, location: resolvePdfLocation(invoice.location), W: 595.28, ML: 50, MR: 50, safe, showPageNo: index => index === doc.getPageCount() - 1 });
    return doc.save();
  }
  line(`Mietguthaben vor Erstattung: ${euro(balance.credit_cents)}`);
  line(`Bereits erstattetes Mietguthaben: ${euro(balance.refunded_cents)}`, true);
  line(`Noch zu erstattendes Mietguthaben: ${euro(balance.remaining_cents)}`, true);
  const methods = confirmedRefundsByMethod(refunds);
  const recipient = addressForm === "sie" ? "Ihnen" : "dir";
  if (methods.transfer_cents > 0) line(`Das Guthaben von ${euro(methods.transfer_cents)} haben wir ${recipient} per Überweisung erstattet.`, true);
  if (methods.stripe_cents > 0) line(`Das Guthaben von ${euro(methods.stripe_cents)} haben wir ${recipient} über Stripe auf das ursprünglich verwendete Zahlungsmittel erstattet.`, true);
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