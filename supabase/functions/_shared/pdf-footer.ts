// Einheitliche Fußzeile für alle Geschäfts-PDFs (Angebot, Auftragsbestätigung,
// Rechnung, Rechnungskorrektur, Übergabe-/Rückgabeprotokoll).
// DIN 5008 legt den Abstand zum unteren Blattrand nicht fest; die letzte Zeile
// endet hier 12 mm über der Blattkante (sicher über dem nicht bedruckbaren Rand
// üblicher Drucker, ~5 mm).
import { rgb } from "https://esm.sh/pdf-lib@1.17.1";

const MMU = 72 / 25.4;
export const FOOTER_SIZE = 6.6;
export const FOOTER_LEAD = 7.8;
export const FOOTER_LAST_BASELINE = 12 * MMU;            // ~34 pt
const FOOTER_LINES = 8;
export const FOOTER_FIRST_BASELINE = FOOTER_LAST_BASELINE + (FOOTER_LINES - 1) * FOOTER_LEAD;
export const FOOTER_RULE_Y = FOOTER_FIRST_BASELINE + 9;
export const FOOTER_PAGE_Y = FOOTER_RULE_Y + 7;
/** Unterkante für Fließtext: darunter beginnt der Fußbereich. */
export const FOOTER_TOP = FOOTER_PAGE_Y + 14;

export type PdfLocation = { name: string; street: string; city: string; phone: string; email: string };

export const PDF_LOCATIONS: Record<string, PdfLocation> = {
  krefeld: { name: "Krefeld", street: "Anrather Stra\u00DFe 291", city: "47807 Krefeld", phone: "02151 417 990 4", email: "krefeld@slt-rental.de" },
  bonn: { name: "Bonn", street: "Drachenburgstra\u00DFe 8", city: "53179 Bonn", phone: "0228 504 660 61", email: "bonn@slt-rental.de" },
  muelheim: { name: "M\u00FClheim an der Ruhr", street: "Ruhrorter Str. 122", city: "45478 M\u00FClheim an der Ruhr", phone: "02151 417 990 4", email: "muelheim@slt-rental.de" },
};

export function pdfLocationKey(raw: string | null | undefined): string {
  const v = String(raw ?? "").toLowerCase();
  if (v.includes("bonn")) return "bonn";
  if (v.includes("lheim") || v.includes("muelheim")) return "muelheim";
  return "krefeld";
}

export function resolvePdfLocation(raw: string | null | undefined): PdfLocation {
  return PDF_LOCATIONS[pdfLocationKey(raw)];
}

type Company = { name: string; street: string; city: string; registry: string; liablePartner: string; partnerRegistry: string; managingDirector: string; steuerNr: string; ustId: string; bankName: string; iban: string; bic: string; web: string };

/** Same contents and column order for legacy protocol HTML downloads. */
export function unifiedFooterHtml(c: Company, l: PdfLocation): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const columns = footerColumns(c, l);
  return `<div class="unified-footer" style="border-top:0.5pt solid #d9dee6;padding-top:9pt;margin-top:18pt;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:5pt;color:#6b7380;font-family:Arial,sans-serif;font-size:${FOOTER_SIZE}pt;line-height:${FOOTER_LEAD}pt;break-inside:avoid;">${columns.map((lines, i) => `<div style="min-width:0;${i === 2 ? "text-align:right;" : ""}">${lines.map((line) => `<div style="overflow-wrap:anywhere;">${esc(line)}</div>`).join("")}</div>`).join("")}</div>`;
}

function footerColumns(c: Company, l: PdfLocation): string[][] {
  return [
    [c.name, `Sitz: ${c.street}, ${c.city}`, c.registry,
      "Persönlich haftende Gesellschafterin:", c.liablePartner, "Sitz: Krefeld",
      c.partnerRegistry, `Geschäftsführer (GmbH): ${c.managingDirector}`],
    [`Standort ${l.name}`, `${l.street}, ${l.city}`, `Tel. ${l.phone}`, `${l.email} · ${c.web}`],
    [`Steuer-Nr. ${c.steuerNr} · USt-IdNr. ${c.ustId}`, c.bankName, `IBAN ${c.iban}`, `BIC ${c.bic}`],
  ];
}

/** Zeichnet die Fußzeile auf allen Seiten. `showPageNo(i,total)` steuert die Seitenzahl. */
export function drawUnifiedFooter(opts: {
  doc: any; font: any; company: Company; location: PdfLocation;
  W: number; ML: number; MR: number;
  safe?: (s: string) => string;
  showPageNo?: (index: number, total: number) => boolean;
}) {
  const { doc, font, company: c, location: l, W, ML, MR } = opts;
  const safe = opts.safe ?? ((s: string) => s);
  const MUTED = rgb(0.42, 0.45, 0.5);
  const LINE = rgb(0.85, 0.87, 0.9);
  const CW = W - ML - MR;
  const colW = CW / 3;
  // Die KG bleibt Vertragspartnerin; die GmbH wird ausschließlich in ihrer
  // Funktion als persönlich haftende Gesellschafterin der KG ausgewiesen.
  const [col1, col2, col3] = footerColumns(c, l);
  const total = doc.getPageCount();
  const show = opts.showPageNo ?? ((_i: number, t: number) => t > 1);
  for (let i = 0; i < total; i++) {
    const p = doc.getPage(i);
    p.drawRectangle({ x: ML, y: FOOTER_RULE_Y, width: CW, height: 0.5, color: LINE });
    const draw = (t: string, x: number, y: number, maxWidth = colW - 5) => {
      try {
        const s = safe(t);
        const size = Math.min(FOOTER_SIZE, FOOTER_SIZE * maxWidth / Math.max(font.widthOfTextAtSize(s, FOOTER_SIZE), 1));
        p.drawText(s, { x, y, size, font, color: MUTED });
      } catch { /* glyph */ }
    };
    col1.forEach((t, li) => draw(t, ML, FOOTER_FIRST_BASELINE - li * FOOTER_LEAD));
    col2.forEach((t, li) => draw(t, ML + colW, FOOTER_FIRST_BASELINE - li * FOOTER_LEAD));
    col3.forEach((t, li) => {
      const s = safe(t);
      const size = Math.min(FOOTER_SIZE, FOOTER_SIZE * (colW - 5) / Math.max(font.widthOfTextAtSize(s, FOOTER_SIZE), 1));
      draw(s, W - MR - font.widthOfTextAtSize(s, size), FOOTER_FIRST_BASELINE - li * FOOTER_LEAD, colW - 5);
    });
    if (show(i, total)) {
      try {
        const t = `Seite ${i + 1} von ${total}`;
        p.drawText(t, { x: W - MR - font.widthOfTextAtSize(t, 7.5), y: FOOTER_PAGE_Y, size: 7.5, font, color: MUTED });
      } catch { /* ignore */ }
    }
  }
}
