import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface DeliveryNoteItem {
  product_name: string;
  quantity: number;
  description?: string | null;
  serial_number?: string | null;
  condition_notes?: string | null;
}

export interface DeviceConditionData {
  meter_reading: string;
  fuel_level: string;
  cleanliness: string;
  additional_notes: string;
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
  deviceCondition?: DeviceConditionData;
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

  const darkBlue = rgb(0, 0.314, 0.49);
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
  drawText("SLT Technology Group GmbH & Co. KG", margin, y, 14, fontBold, darkBlue);
  y -= 22;
  drawText("Übergabeprotokoll", margin, y, 14, fontBold, black);
  y -= 20;

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

  const hasAnySerial = data.items.some(item => item.serial_number && item.serial_number.trim() !== "");
  const colX = hasAnySerial
    ? [margin, margin + 35, margin + 250, margin + 370]
    : [margin, margin + 35, margin + 370];

  page.drawRectangle({ x: margin, y: y - 2, width: pageWidth - 2 * margin, height: 16, color: rgb(0.94, 0.96, 0.98) });
  drawText("Menge", colX[0] + 2, y, 9, fontBold);
  drawText("Bezeichnung", colX[1] + 2, y, 9, fontBold);
  if (hasAnySerial) {
    drawText("Seriennr.", colX[2] + 2, y, 9, fontBold);
  }
  drawText("Zustandsnotizen", colX[hasAnySerial ? 3 : 2] + 2, y, 9, fontBold);
  y -= 18;

  for (const item of data.items) {
    checkPage(20);
    drawText(`${item.quantity}`, colX[0] + 2, y, 9);
    const nameText = item.description ? `${item.product_name} – ${item.description}` : item.product_name;
    drawText(nameText.substring(0, 40), colX[1] + 2, y, 9);
    if (hasAnySerial) {
      drawText((item.serial_number || "").substring(0, 20), colX[2] + 2, y, 9);
    }
    drawText((item.condition_notes || "").substring(0, 25), colX[hasAnySerial ? 3 : 2] + 2, y, 9);
    y -= 14;
    page.drawLine({ start: { x: margin, y: y + 4 }, end: { x: pageWidth - margin, y: y + 4 }, thickness: 0.5, color: lineGray });
  }

  y -= 20;

  // Notes
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

  // Device condition section
  checkPage(120);
  y -= 10;
  drawText("Gerätezustand bei Übergabe", margin, y, 12, fontBold, darkBlue);
  y -= 20;

  const dc = data.deviceCondition;

  const conditionFields: { label: string; value: string }[] = [
    { label: "Betriebsstunden:", value: dc?.meter_reading || "" },
    { label: "Tankfüllstand:", value: dc?.fuel_level || "" },
    { label: "Sauberkeit (1–5):", value: dc?.cleanliness || "" },
    { label: "Sonstige Anmerkungen:", value: dc?.additional_notes || "" },
  ];

  for (const field of conditionFields) {
    checkPage(22);
    drawText(field.label, margin, y, 10, fontBold);
    if (field.value) {
      // Pre-filled value
      drawText(field.value, margin + 135, y, 10, font, black);
    } else {
      // Empty line
      page.drawLine({ start: { x: margin + 130, y: y - 2 }, end: { x: pageWidth - margin, y: y - 2 }, thickness: 0.5, color: lineGray });
    }
    y -= 22;
  }

  // Signature field – only customer (blank for them to sign)
  checkPage(140);
  y -= 30;
  drawText("Unterschrift", margin, y, 12, fontBold, darkBlue);
  y -= 10;
  drawText("Mit meiner Unterschrift bestätige ich den Empfang der oben aufgeführten Mietgegenstände.", margin, y, 8, font, gray);
  y -= 25;

  const sigWidth = (pageWidth - 2 * margin - 30) / 2;

  // Customer signature box
  page.drawRectangle({
    x: margin,
    y: y - 70,
    width: sigWidth,
    height: 80,
    borderColor: lineGray,
    borderWidth: 1,
  });
  page.drawLine({ start: { x: margin + 10, y: y - 50 }, end: { x: margin + sigWidth - 10, y: y - 50 }, thickness: 0.5, color: lineGray });
  drawText("Unterschrift Kunde", margin + 5, y - 65, 8, font, gray);
  drawText("Datum: ____________________", margin + 5, y - 78, 8, font, gray);

  // Staff signature (pre-filled label)
  const rightX = margin + sigWidth + 30;
  page.drawRectangle({
    x: rightX,
    y: y - 70,
    width: sigWidth,
    height: 80,
    borderColor: lineGray,
    borderWidth: 1,
  });
  page.drawLine({ start: { x: rightX + 10, y: y - 50 }, end: { x: rightX + sigWidth - 10, y: y - 50 }, thickness: 0.5, color: lineGray });
  drawText("Unterschrift Mitarbeiter SLT", rightX + 5, y - 65, 8, font, gray);
  drawText("Datum: ____________________", rightX + 5, y - 78, 8, font, gray);

  y -= 100;

  // Footer
  checkPage(30);
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: lineGray });
  y -= 14;
  drawText("SLT Technology Group GmbH & Co. KG · www.slt-rental.de · mieten@slt-rental.de", margin, y, 8, font, gray);

  const bytes = await doc.save();
  return new Uint8Array(bytes) as unknown as Uint8Array;
}
