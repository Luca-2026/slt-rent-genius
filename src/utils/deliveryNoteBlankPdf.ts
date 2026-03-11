import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface DeliveryNoteItem {
  product_name: string;
  quantity: number;
  description?: string | null;
  serial_number?: string | null;
  condition_notes?: string | null;
}

interface DeliveryNoteData {
  delivery_note_number: string;
  created_at: string;
  notes?: string | null;
  known_defects?: string | null;
  additional_defects?: string | null;
  items: DeliveryNoteItem[];
  company_name: string;
  contact_name: string;
}

export async function generateBlankDeliveryNotePdf(data: DeliveryNoteData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const darkBlue = rgb(0, 0.314, 0.49); // #00507d
  const black = rgb(0, 0, 0);
  const gray = rgb(0.4, 0.4, 0.4);
  const lineGray = rgb(0.75, 0.75, 0.75);

  const drawText = (text: string, x: number, yPos: number, size: number, f = font, color = black) => {
    page.drawText(text, { x, y: yPos, size, font: f, color });
  };

  const checkPage = (needed: number) => {
    if (y - needed < margin) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  };

  // Header
  drawText("SLT-Rental GmbH", margin, y, 18, fontBold, darkBlue);
  y -= 22;
  drawText("Übergabeprotokoll", margin, y, 14, fontBold, black);
  y -= 20;

  // Line
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 2, color: darkBlue });
  y -= 25;

  // Doc info
  drawText("Protokoll-Nr.:", margin, y, 10, fontBold);
  drawText(data.delivery_note_number, margin + 90, y, 10);
  const dateStr = new Date(data.created_at).toLocaleDateString("de-DE");
  drawText("Datum:", pageWidth - margin - 150, y, 10, fontBold);
  drawText(dateStr, pageWidth - margin - 100, y, 10);
  y -= 18;

  drawText("Kunde:", margin, y, 10, fontBold);
  drawText(data.company_name, margin + 90, y, 10);
  y -= 14;
  drawText("Ansprechpartner:", margin, y, 10, fontBold);
  drawText(data.contact_name, margin + 90, y, 10);
  y -= 25;

  // Items table
  drawText("Übergebene Artikel", margin, y, 12, fontBold, darkBlue);
  y -= 18;

  // Table header
  const colX = [margin, margin + 35, margin + 250, margin + 370];
  page.drawRectangle({ x: margin, y: y - 2, width: pageWidth - 2 * margin, height: 16, color: rgb(0.94, 0.96, 0.98) });
  drawText("Menge", colX[0] + 2, y, 9, fontBold);
  drawText("Bezeichnung", colX[1] + 2, y, 9, fontBold);
  drawText("Seriennr.", colX[2] + 2, y, 9, fontBold);
  drawText("Zustandsnotizen", colX[3] + 2, y, 9, fontBold);
  y -= 18;

  for (const item of data.items) {
    checkPage(20);
    drawText(`${item.quantity}`, colX[0] + 2, y, 9);
    const nameText = item.description ? `${item.product_name} – ${item.description}` : item.product_name;
    drawText(nameText.substring(0, 40), colX[1] + 2, y, 9);
    drawText((item.serial_number || "–").substring(0, 20), colX[2] + 2, y, 9);
    drawText((item.condition_notes || "").substring(0, 25), colX[3] + 2, y, 9);
    y -= 14;
    page.drawLine({ start: { x: margin, y: y + 4 }, end: { x: pageWidth - margin, y: y + 4 }, thickness: 0.5, color: lineGray });
  }

  y -= 20;

  // Notes section
  if (data.known_defects) {
    checkPage(40);
    drawText("Bekannte Mängel:", margin, y, 10, fontBold);
    y -= 14;
    drawText(data.known_defects.substring(0, 100), margin, y, 9, font, gray);
    y -= 20;
  }

  if (data.additional_defects) {
    checkPage(40);
    drawText("Zusätzliche Mängel:", margin, y, 10, fontBold);
    y -= 14;
    drawText(data.additional_defects.substring(0, 100), margin, y, 9, font, gray);
    y -= 20;
  }

  if (data.notes) {
    checkPage(40);
    drawText("Anmerkungen:", margin, y, 10, fontBold);
    y -= 14;
    drawText(data.notes.substring(0, 100), margin, y, 9, font, gray);
    y -= 20;
  }

  // Meter readings / fuel / cleanliness section (blank for admin to fill)
  checkPage(120);
  y -= 10;
  drawText("Gerätezustand bei Übergabe", margin, y, 12, fontBold, darkBlue);
  y -= 20;

  const fieldLabels = [
    "Betriebsstunden:",
    "Tankstand:",
    "Sauberkeit (1–5):",
    "Sonstige Anmerkungen:",
  ];

  for (const label of fieldLabels) {
    checkPage(22);
    drawText(label, margin, y, 10, fontBold);
    // Blank line for filling in
    page.drawLine({ start: { x: margin + 130, y: y - 2 }, end: { x: pageWidth - margin, y: y - 2 }, thickness: 0.5, color: lineGray });
    y -= 22;
  }

  // Signature fields
  checkPage(140);
  y -= 30;
  drawText("Unterschriften", margin, y, 12, fontBold, darkBlue);
  y -= 30;

  // Customer signature
  const sigWidth = (pageWidth - 2 * margin - 30) / 2;

  // Left: Customer
  page.drawRectangle({
    x: margin,
    y: y - 60,
    width: sigWidth,
    height: 70,
    borderColor: lineGray,
    borderWidth: 1,
  });
  drawText("Unterschrift Kunde", margin + 5, y - 70, 8, font, gray);
  page.drawLine({ start: { x: margin + 10, y: y - 48 }, end: { x: margin + sigWidth - 10, y: y - 48 }, thickness: 0.5, color: lineGray });

  // Right: Staff
  const rightX = margin + sigWidth + 30;
  page.drawRectangle({
    x: rightX,
    y: y - 60,
    width: sigWidth,
    height: 70,
    borderColor: lineGray,
    borderWidth: 1,
  });
  drawText("Unterschrift Mitarbeiter", rightX + 5, y - 70, 8, font, gray);
  page.drawLine({ start: { x: rightX + 10, y: y - 48 }, end: { x: rightX + sigWidth - 10, y: y - 48 }, thickness: 0.5, color: lineGray });

  y -= 90;

  // Date fields under signatures
  drawText("Datum: ____________________", margin, y, 9, font, gray);
  drawText("Datum: ____________________", rightX, y, 9, font, gray);

  y -= 30;

  // Footer
  checkPage(30);
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: lineGray });
  y -= 14;
  drawText("SLT-Rental GmbH · www.slt-rental.de · info@slt-rental.de", margin, y, 8, font, gray);

  const bytes = await doc.save();
  return new Uint8Array(bytes) as unknown as Uint8Array;
}
