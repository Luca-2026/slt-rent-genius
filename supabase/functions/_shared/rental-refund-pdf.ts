import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { drawUnifiedFooter, resolvePdfLocation } from "./pdf-footer.ts";
import { SLT_COMPANY } from "./offer-company.ts";

/** Cash-movement evidence only: the reduced invoice already accounts for the discount and VAT. */
export async function rentalRefundPdf(invoice: any, claim: any, orderCode: string | null) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595.28, 841.89]);
  let y = 780;
  const safe = (s: string) => s.replace(/[^\x20-\x7E\xA0-\xFF€]/g, "-");
  const line = (text: string, strong = false, size = 11) => {
    const words = safe(text).split(" "); let current = "";
    for (const word of words) {
      if (font.widthOfTextAtSize(`${current} ${word}`, size) > 495 && current) { page.drawText(current, { x: 50, y, size, font: strong ? bold : font }); y -= 18; current = ""; }
      current += (current ? " " : "") + word;
    }
    page.drawText(current, { x: 50, y, size, font: strong ? bold : font, color: rgb(0, .31, .49) }); y -= 25;
  };
  const euro = (value: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
  line("SLT-Rental", true, 20);
  line("Mietguthaben - Erstattungsbeleg", true, 17);
  line(`Beleg: MG-${claim.id ?? "VORSCHAU"}`, true);
  line(`Auftrag ${orderCode ? `#${orderCode}` : "-"} | Rechnung ${invoice.invoice_number}`);
  line(`Empfänger: ${invoice.company_name || invoice.customer_name || ""}`);
  line(`Datum: ${String(claim.created_at ?? new Date().toISOString()).slice(0, 10)}`);
  y -= 15;
  line(`Angerechnete Mietzahlungen: ${euro(Number(invoice.paid_amount))}`);
  line(`Abzüglich Mietrechnungsbetrag: - ${euro(Number(invoice.gross_amount))}`);
  line(`Mietguthaben: ${euro(Number(claim.amount_cents) / 100)}`, true, 14);
  line("Die Kaution wird gesondert abgerechnet und ist hier nicht enthalten.");
  line(`Zahlungsweg: ${claim.payout_method === "transfer" ? "Banküberweisung" : "Ursprüngliches Online-Zahlungsmittel"}`);
  const status: Record<string, string> = { available: "Noch nicht beauftragt", creating: "Vorbereitet - Auszahlung noch nicht bestätigt", pending: "Beauftragt - wird noch verarbeitet", succeeded: "Erstattung bestätigt", failed: "Fehlgeschlagen", partial_failed: "Teilweise erstattet - Abgleich erforderlich" };
  line(`Status: ${status[claim.status] ?? "Abgleich erforderlich"}`, true);
  if (claim.bank_reference) line(`Banknachweis: ${claim.bank_reference}`);
  for (const a of claim.allocations ?? []) if (a.refund_id) line(`Erstattungskennung: ${a.refund_id}`);
  y -= 15;
  line("Dieser Beleg dokumentiert ausschließlich das Mietguthaben und seine Auszahlung. Er ist keine Rechnungskorrektur und zieht keinen Rabatt ein zweites Mal ab. Die ursprüngliche Rechnung und Zahlungseingänge bleiben unverändert.", false, 10);
  drawUnifiedFooter({ doc, font, company: SLT_COMPANY, location: resolvePdfLocation(invoice.location), W: 595.28, ML: 50, MR: 50, safe });
  return doc.save();
}