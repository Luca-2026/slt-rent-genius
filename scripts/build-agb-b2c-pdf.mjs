/**
 * Erzeugt aus `src/data/legal/agb-b2c.ts` (Single Source of Truth) das PDF
 * `agb-b2c.pdf`, das Privatkunden zusammen mit Angeboten zugesendet wird.
 *
 * Aufruf: npx tsx scripts/build-agb-b2c-pdf.mjs  (bzw. bun run)
 */
import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { AGB_B2C_META, AGB_B2C_SECTIONS } from "../src/data/legal/agb-b2c.ts";

const A4 = [595.28, 841.89];
const MARGIN = 56;
const WIDTH = A4[0] - MARGIN * 2;

const sanitize = (text) =>
  String(text)
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x20-\x7E\u00C0-\u00FF\u20AC§]/g, "");

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);

let page = doc.addPage(A4);
let y = A4[1] - MARGIN;

const newPage = () => {
  page = doc.addPage(A4);
  y = A4[1] - MARGIN;
};

const wrap = (text, size, usedFont, maxWidth) => {
  const words = sanitize(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (usedFont.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const write = (text, { size = 9.5, usedFont = font, gap = 3, indent = 0, color = rgb(0.1, 0.1, 0.1) } = {}) => {
  for (const line of wrap(text, size, usedFont, WIDTH - indent)) {
    if (y < MARGIN + 40) newPage();
    page.drawText(line, { x: MARGIN + indent, y, size, font: usedFont, color });
    y -= size + 2.5;
  }
  y -= gap;
};

write(AGB_B2C_META.title, { size: 15, usedFont: bold, gap: 5 });
write(AGB_B2C_META.subtitle, { size: 10, gap: 3 });
write(AGB_B2C_META.stand, { size: 9, gap: 12 });

for (const section of AGB_B2C_SECTIONS) {
  if (y < MARGIN + 90) newPage();
  write(`${section.number} ${section.title}`.trim(), { size: 12, usedFont: bold, gap: 5 });
  for (const sub of section.subsections) {
    const heading = [sub.number, sub.title].filter(Boolean).join(" ").trim();
    if (heading) write(heading, { size: 10.5, usedFont: bold, gap: 3 });
    for (const block of sub.body) {
      if (block.type === "p") write(block.text);
      else if (block.type === "h3") write(block.text, { size: 10, usedFont: bold, gap: 2 });
      else if (block.type === "list") for (const item of block.items) write(`- ${item}`, { indent: 12, gap: 1 });
    }
    y -= 4;
  }
  y -= 6;
}

const pages = doc.getPages();
pages.forEach((p, index) => {
  p.drawText(`Seite ${index + 1} von ${pages.length}  ·  SLT Technology Group GmbH & Co. KG  ·  www.slt-rental.de`, {
    x: MARGIN,
    y: 28,
    size: 7.5,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });
});

const bytes = await doc.save();
writeFileSync("public/b2b-documents/agb-b2c.pdf", bytes);
console.log(`agb-b2c.pdf geschrieben: ${bytes.length} Bytes, ${pages.length} Seiten`);
