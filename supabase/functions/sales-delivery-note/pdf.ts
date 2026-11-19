import { PDFDocument, StandardFonts, rgb, type PDFFont } from "https://esm.sh/pdf-lib@1.17.1";
import { drawUnifiedFooter, resolvePdfLocation, FOOTER_TOP } from "../_shared/pdf-footer.ts";
import { SLT_COMPANY } from "../_shared/company.ts";

// Same DIN 5008 Form B geometry and visual roles as offer/invoice PDFs.
const MM = 72 / 25.4;
const W = 595.28, H = 841.89, ML = 25 * MM, MR = 20 * MM;
const CW = W - ML - MR, ADDRESS_W = 85 * MM, BOTTOM = FOOTER_TOP + 8;
const BRAND = rgb(0, 80 / 255, 125 / 255), ORANGE = rgb(1, 142 / 255, 2 / 255);
const INK = rgb(.13, .13, .15), MUTED = rgb(.45, .47, .52);
const LINE = rgb(.82, .84, .87), SOFT = rgb(.955, .965, .975), WHITE = rgb(1, 1, 1);
const safe = (v: unknown) => String(v ?? "").replace(/[\u2010-\u2015]/g, "-").replace(/[\u2018\u2019]/g, "'")
  .replace(/[\u201c\u201d]/g, '"').replace(/[^\x20-\x7e\xa0-\xff\u20ac\n]/g, " ");
const berlin = (v: string) => new Date(v).toLocaleString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " Uhr";

export async function salesDeliveryPdf(snapshot: any, number: string, receipt?: { name: string; at: string; signature: string }) {
  const doc = await PDFDocument.create();
  doc.setTitle(`Lieferschein ${number}`); doc.setAuthor(SLT_COMPANY.name);
  const font = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold);
  // Do not silently issue an unbranded document if the existing brand asset is unavailable.
  const response = await fetch("https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png", { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("Firmenlogo konnte nicht geladen werden. Bitte erneut versuchen.");
  const logo = await doc.embedPng(new Uint8Array(await response.arrayBuffer()));
  let page = doc.addPage([W, H]), y = 0;
  const text = (value: unknown, x: number, yy: number, f = font, size = 9.5, color = INK) =>
    page.drawText(safe(value), { x, y: yy, font: f, size, color });
  const wrap = (value: unknown, f: PDFFont, size: number, width: number) => {
    const result: string[] = [];
    for (const paragraph of safe(value).split("\n")) {
      let current = "";
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        const next = current ? `${current} ${word}` : word;
        if (f.widthOfTextAtSize(next, size) <= width) { current = next; continue; }
        if (current) result.push(current);
        current = "";
        for (const char of word) {
          if (current && f.widthOfTextAtSize(current + char, size) > width) { result.push(current); current = ""; }
          current += char;
        }
      }
      if (current) result.push(current);
    }
    return result;
  };
  const drawLogo = () => {
    const box = { left: .1474, top: .3536, right: .8516 };
    const fullW = 46 * MM / (box.right - box.left), fullH = logo.height / logo.width * fullW;
    page.drawImage(logo, { x: W - MR - box.right * fullW, y: H - 15 * MM + box.top * fullH - fullH, width: fullW, height: fullH });
  };
  const newPage = () => {
    page = doc.addPage([W, H]);
    text(`LIEFERSCHEIN ${number}`, ML, H - 24 * MM, bold, 10, BRAND);
    drawLogo();
    page.drawLine({ start: { x: ML, y: H - 35 * MM }, end: { x: W - MR, y: H - 35 * MM }, thickness: .6, color: LINE });
    y = H - 43 * MM;
  };
  const ensure = (height: number) => { if (y - height < BOTTOM) newPage(); };
  const para = (value: unknown, strong = false, size = 9.5, color = INK) => {
    for (const line of wrap(value, strong ? bold : font, size, CW)) {
      ensure(size + 5); text(line, ML, y, strong ? bold : font, size, color); y -= size + 4;
    }
    y -= 4;
  };
  const section = (title: string) => {
    ensure(42); y -= 8;
    page.drawRectangle({ x: ML, y: y - 4, width: 3, height: 14, color: ORANGE });
    text(title, ML + 10, y, bold, 11, BRAND); y -= 22;
  };

  drawLogo();
  for (const mmY of [105, 210]) page.drawRectangle({ x: 0, y: H - mmY * MM, width: 14, height: .4, color: LINE });
  page.drawRectangle({ x: 0, y: H - 148.5 * MM, width: 20, height: .4, color: LINE });
  const sender = safe(`${SLT_COMPANY.name} · ${SLT_COMPANY.street} · ${SLT_COMPANY.city}`);
  const senderSize = Math.min(7, ADDRESS_W / font.widthOfTextAtSize(sender, 7) * 7);
  text(sender, ML, H - 57 * MM, font, senderSize, MUTED);
  page.drawRectangle({ x: ML, y: H - 57 * MM - 3, width: ADDRESS_W, height: .4, color: LINE });
  // Old snapshots stored one string; split only a recognizable German postal line.
  const address = Array.isArray(snapshot.address_lines) ? snapshot.address_lines : safe(snapshot.address).replace(/\s+(\d{5}\s+)/, "\n$1").split("\n");
  let addressSize = 10;
  const addressRows = () => [
    ...wrap(snapshot.customer, bold, addressSize, ADDRESS_W).map(t => ({ t, f: bold })),
    ...address.flatMap((v: string) => wrap(v, font, addressSize, ADDRESS_W).map(t => ({ t, f: font })))
  ];
  let rows = addressRows();
  while (rows.length * (addressSize + 2) > 62 && addressSize > 8) { addressSize -= .25; rows = addressRows(); }
  if (rows.length * (addressSize + 2) > 62) throw new Error("Anschrift ist zu lang für das Fensterfeld. Bitte die Kundenanschrift prüfen.");
  rows.forEach((row, n) => text(row.t, ML, H - 67 * MM - n * (addressSize + 2), row.f, addressSize));
  let iy = H - 57 * MM;
  const info = (label: string, value: unknown) => {
    if (!value) return;
    text(label, 125 * MM, iy, font, 8.5, MUTED);
    const lines = wrap(value, font, 8.5, W - MR - 155 * MM);
    for (const line of lines) { text(line, 155 * MM, iy, font, 8.5); iy -= 11; }
    iy -= 3;
  };
  info("Lieferschein-Nr.:", number); info("Auftrags-ID:", snapshot.order_code ? `#${snapshot.order_code}` : "");
  info("Erstellt am:", berlin(snapshot.created_at)); info("Angebot:", snapshot.offer_number);
  info("Auftragsbest.:", snapshot.order_confirmation_number); info("Rechnung:", snapshot.source_invoice_number);
  info("Standort:", resolvePdfLocation(snapshot.location).name);
  y = Math.min(H - 102 * MM, iy - 24);
  text("LIEFERSCHEIN", ML, y, bold, 22, BRAND); y -= 19;
  text(`Verkauf · Nr. ${number}`, ML, y, font, 10, MUTED); y -= 23;
  if (snapshot.delivery_address) { section("Lieferadresse"); para(snapshot.delivery_address); }
  section("Gelieferte Verkaufsartikel");
  const tableHeader = () => {
    ensure(32);
    page.drawRectangle({ x: ML, y: y - 6, width: CW, height: 20, color: BRAND });
    text("Pos.", ML + 6, y, bold, 8.5, WHITE); text("Artikel", ML + 38, y, bold, 8.5, WHITE);
    text("Menge", W - MR - 85, y, bold, 8.5, WHITE); y -= 23;
  };
  tableHeader();
  for (const [n, item] of snapshot.items.entries()) {
    const nameLines = wrap(item.name, bold, 9.5, CW - 145);
    const detailLines = wrap(item.description, font, 8.5, CW - 145);
    const quantityLines = wrap(`${item.quantity} ${item.unit}`, font, 9, 75);
    const count = Math.max(nameLines.length + detailLines.length, quantityLines.length, 1);
    // Keep normal goods rows intact; only unusually tall rows may span pages.
    const rowHeight = count * 14 + 6;
    if (y - rowHeight < BOTTOM && rowHeight < H - 43 * MM - BOTTOM - 32) { newPage(); tableHeader(); }
    for (let k = 0; k < count; k++) {
      if (y - 18 < BOTTOM) { newPage(); tableHeader(); }
      if (n % 2 === 0) page.drawRectangle({ x: ML, y: y - 5, width: CW, height: 14, color: SOFT });
      if (k === 0) text(n + 1, ML + 6, y);
      if (k < nameLines.length) text(nameLines[k], ML + 38, y, bold, 9.5);
      else if (detailLines[k - nameLines.length]) text(detailLines[k - nameLines.length], ML + 38, y, font, 8.5, MUTED);
      if (quantityLines[k]) text(quantityLines[k], W - MR - 85, y, font, 9);
      y -= 14;
    }
    y -= 6;
  }
  section("Bemerkungen");
  if (snapshot.notes) para(snapshot.notes);
  else { para("____________________________________________________________________________"); y -= 8; }
  // Keep receipt wording, names and signature area together, including long recipient names.
  const statement = "Ich bestätige den Erhalt der oben aufgeführten gekauften Ware. Abweichungen oder fehlende Artikel sind unter Bemerkungen dokumentiert.";
  const recipientLines = receipt ? wrap(`Empfänger: ${receipt.name}`, font, 9.5, CW) : [];
  ensure(180 + recipientLines.length * 14);
  section("Empfangsbestätigung"); para(statement);
  if (receipt) {
    para(`Empfänger: ${receipt.name}`); para(`Empfang bestätigt: ${berlin(receipt.at)}`);
    const image = await doc.embedPng(receipt.signature), dims = image.scaleToFit(240, 65);
    page.drawImage(image, { x: ML + 8, y: y - 70, width: dims.width, height: dims.height }); y -= 82;
    para("Unterschrift Empfänger", false, 8.5, MUTED);
  } else {
    para("Name des Empfängers: ___________________________________________________");
    para("Ort / Datum: __________________________________________________________"); y -= 26;
    para("Unterschrift Empfänger: __________________________________________________");
  }
  drawUnifiedFooter({ doc, font, company: SLT_COMPANY, location: resolvePdfLocation(snapshot.location), W, ML, MR, safe, showPageNo: () => true });
  return doc.save();
}