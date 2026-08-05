
// ─── PDF Generator for Invoice (DIN 5008 + SLT CI) ─────────────────────
// SINGLE SOURCE OF TRUTH für Firmen- & Steuerdaten ist die Konstante SLT_COMPANY
// oben in dieser Datei (spiegelt die Angaben im Impressum). Keine Hardcodes im
// Template unten – alles wird ausschließlich aus SLT_COMPANY gelesen.
async function generateDocumentPdf(data: {
  title: string;
  documentNumber: string;
  date: string;
  profile: any;
  productItems: Array<{ name: string; description?: string; quantity: number; unit?: string; unitPrice?: number; totalPrice?: number; discount?: number; rentalStart?: string; rentalEnd?: string; itemIndex?: number; imageUrl?: string | null }>;
  serviceItems: Array<{ name: string; description?: string; amount: number; parentItemIndex?: number }>;
  surchargeItems: Array<{ name: string; description?: string; amount: number }>;
  sections: Array<{ label: string; value: string }>;
  signatures?: { customerData?: string; staffData?: string; staffName?: string };
  totals?: { net: number; vatRate: number; vat: number; gross: number; deliveryCost?: number; isReverseCharge?: boolean; paymentDueDays?: number; dueDate?: string; depositTotal?: number };
  isProforma?: boolean;
  deliveryAddress?: { street?: string; postal_code?: string; city?: string };
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  // ── Layout constants (A4, DIN 5008 fensterkuverttauglich) ──
  const W = 595.28, H = 841.89;
  const ML = 57, MR = 57;          // ~20 mm links/rechts
  const MT = 45, MB = 60;          // Ränder oben/unten
  const CW = W - ML - MR;
  const BRAND = rgb(0/255, 80/255, 125/255);   // #00507d
  const ORANGE = rgb(255/255, 142/255, 2/255); // #ff8e02
  const INK = rgb(0.13, 0.13, 0.15);
  const MUTED = rgb(0.48, 0.5, 0.55);
  const LINE = rgb(0.82, 0.84, 0.87);
  const ZEBRA = rgb(0.972, 0.976, 0.982);

  // DIN 5008 Sichtfenster: Adresse links bei ca. 25mm/45mm
  const ADDR_X = ML;
  const ADDR_Y_TOP = H - 105;     // ~37 mm von oben (Fensterbereich)

  let pageIdx = 0;
  const pages: any[] = [];
  const proformaFlag = !!data.isProforma;

  // Load logo (bitmap – niemals als SVG/Text nachbauen)
  let logoImg: any = null;
  try {
    const lr = await fetch("https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png");
    if (lr.ok) {
      const lb = new Uint8Array(await lr.arrayBuffer());
      logoImg = await doc.embedPng(lb);
    }
  } catch {}

  // ── helpers ──
  const fm = (n: number) => n.toFixed(2).replace('.', ',') + ' \u20AC';
  const fd = (d: string) => {
    if (!d) return '';
    const sp = d.split(' '); const p = sp[0].split('-');
    return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : sp[0];
  };
  const wt = (t: string, f: any, s: number, mw: number): string[] => {
    if (!t) return [''];
    const words = String(t).split(/\s+/); const lines: string[] = []; let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (f.widthOfTextAtSize(test, s) <= mw) cur = test;
      else { if (cur) lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  };
  const dt = (pg: any, t: string, x: number, yy: number, f = font, s = 9.5, c = INK) => {
    try { pg.drawText(String(t ?? ''), { x, y: yy, size: s, font: f, color: c }); } catch {}
  };
  const dtr = (pg: any, t: string, xRight: number, yy: number, f = font, s = 9.5, c = INK) => {
    try {
      const tw = f.widthOfTextAtSize(String(t ?? ''), s);
      pg.drawText(String(t ?? ''), { x: xRight - tw, y: yy, size: s, font: f, color: c });
    } catch {}
  };

  const drawProformaWatermark = (pg: any) => {
    if (!proformaFlag) return;
    try {
      pg.drawText("PROFORMA", { x: 90, y: H / 2 - 60, size: 96, font: bold, color: rgb(0.95, 0.9, 0.85), rotate: { type: 'degrees', angle: 30 } as any });
    } catch {}
  };

  // Renders sender line, address block, info block, title. Only on page 1.
  const renderHeader = (pg: any): number => {
    // Absenderzeile (7pt) direkt über Adressfeld
    dt(pg, `${SLT_COMPANY.name} · ${SLT_COMPANY.street} · ${SLT_COMPANY.city}`, ADDR_X, ADDR_Y_TOP + 12, font, 7, MUTED);
    pg.drawRectangle({ x: ADDR_X, y: ADDR_Y_TOP + 10, width: 220, height: 0.4, color: LINE });

    // Empfängeradresse (DIN 5008 Fensterbereich, max ~85mm × 40mm)
    let ay = ADDR_Y_TOP;
    const companyLine = data.profile.legal_form
      ? `${data.profile.company_name} ${data.profile.legal_form}`
      : data.profile.company_name;
    dt(pg, companyLine, ADDR_X, ay, bold, 10.5); ay -= 12;
    const cn = `${data.profile.contact_first_name || ''} ${data.profile.contact_last_name || ''}`.trim();
    if (cn) { dt(pg, cn, ADDR_X, ay, font, 9.5); ay -= 11; }
    dt(pg, `${data.profile.street}${data.profile.house_number ? ' ' + data.profile.house_number : ''}`, ADDR_X, ay, font, 9.5); ay -= 11;
    dt(pg, `${data.profile.postal_code} ${data.profile.city}`, ADDR_X, ay, font, 9.5); ay -= 11;
    dt(pg, data.profile.country || 'Deutschland', ADDR_X, ay, font, 9.5); ay -= 11;
    // USt-IdNr NUR bei Reverse-Charge (innergemeinschaftliche Leistung) im Adressblock
    if (data.totals?.isReverseCharge && data.profile.tax_id) {
      ay -= 2;
      dt(pg, `USt-IdNr.: ${data.profile.tax_id}`, ADDR_X, ay, font, 9, MUTED);
    }

    // Logo oben RECHTS (~60 mm breit ≈ 170 pt), mit Luft zum Seitenrand und zum Inhalt
    let logoBottomY = H - MT;
    if (logoImg) {
      const targetW = 170; // ~60 mm
      const scale = targetW / logoImg.width;
      const drawH = logoImg.height * scale;
      logoBottomY = H - MT - drawH;
      pg.drawImage(logoImg, { x: W - MR - targetW, y: logoBottomY, width: targetW, height: drawH });
    }

    // Info-Block rechts, zweispaltig (Label grau / Wert schwarz) – deutlich UNTER dem Logo
    const infoX = W - MR - 200;
    let iy = Math.min(ADDR_Y_TOP, logoBottomY - 26);
    const infoRow = (label: string, value: string) => {
      dt(pg, label, infoX, iy, font, 8.5, MUTED);
      dt(pg, value, infoX + 95, iy, font, 9, INK);
      iy -= 13;
    };
    infoRow("Rechnungsnummer:", data.documentNumber);
    infoRow("Rechnungsdatum:", fd(data.date));
    infoRow("Kundennummer:", String(data.profile.id).substring(0, 8).toUpperCase());
    // Leistungszeitraum aus productItems (falls einheitlich)
    const periods = data.productItems.filter(i => i.rentalStart).map(i => `${i.rentalStart}|${i.rentalEnd || ''}`);
    if (periods.length && periods.every(p => p === periods[0])) {
      const first = data.productItems.find(i => i.rentalStart)!;
      infoRow("Leistungszeitraum:", `${fd(first.rentalStart!)}${first.rentalEnd ? ' – ' + fd(first.rentalEnd) : ''}`);
    }
    // Zahlungskondition
    const termsLabel = proformaFlag
      ? "Vorkasse"
      : data.totals?.paymentDueDays === 0 ? "Vorkasse"
      : data.totals?.paymentDueDays === 7 ? "7 Tage netto"
      : data.totals?.paymentDueDays === 30 ? "30 Tage netto"
      : "14 Tage netto";
    infoRow("Zahlungskondition:", termsLabel);
    infoRow("Ansprechpartner:", SLT_COMPANY.managingDirector);

    // Titelblock (dominant in linker Spalte, spürbar Luft zwischen Adresse und Titel,
    // sowie zwischen Titel und Nummer)
    const contentTopY = Math.min(ay, iy) - 40;
    let ty = contentTopY;
    dt(pg, data.title, ML, ty, bold, 30, BRAND);
    ty -= 26;
    dt(pg, `Nr. ${data.documentNumber}`, ML, ty, font, 10.5, MUTED);

    return ty - 34; // deutlich mehr Abstand zum nächsten Block (Tabellenkopf)
  };

  const renderTableHeader = (pg: any, startY: number): number => {
    // Weiße Kopfzeile mit 2pt Unterstreichung in BRAND, Titel in BRAND
    const y = startY;
    dt(pg, "Pos.", ML + 2, y, bold, 8.5, BRAND);
    dt(pg, "Bezeichnung", ML + 32, y, bold, 8.5, BRAND);
    dtr(pg, "Menge", ML + CW * 0.60, y, bold, 8.5, BRAND);
    dt(pg, "Einheit", ML + CW * 0.60 + 8, y, bold, 8.5, BRAND);
    dtr(pg, "Einzelpreis", ML + CW * 0.85, y, bold, 8.5, BRAND);
    dtr(pg, "Gesamt", W - MR - 4, y, bold, 8.5, BRAND);
    pg.drawRectangle({ x: ML, y: y - 5, width: CW, height: 2, color: BRAND });
    return y - 16;
  };

  const newPage = (isFirst: boolean): { pg: any; y: number } => {
    const pg = doc.addPage([W, H]);
    pages.push(pg);
    drawProformaWatermark(pg);
    pageIdx = pages.length - 1;
    if (isFirst) {
      const y = renderHeader(pg);
      return { pg, y: renderTableHeader(pg, y) };
    }
    // Folgeseiten: nur schlanker Tabellenkopf (Titel + Nr. dünn)
    let y = H - MT;
    if (logoImg) {
      const targetW = 90;
      const scale = targetW / logoImg.width;
      const drawH = logoImg.height * scale;
      pg.drawImage(logoImg, { x: W - MR - targetW, y: y - drawH, width: targetW, height: drawH });
    }
    dt(pg, `${data.title} · ${data.documentNumber}`, ML, y - 46, bold, 10, BRAND);
    y -= 74;
    return { pg, y: renderTableHeader(pg, y) };
  };

  let { pg, y } = newPage(true);

  // Reserve space at bottom for summary/payment/footer so we don't crash into them
  const RESERVE_BOTTOM = MB + 60;
  const need = (h: number) => {
    if (y - h < RESERVE_BOTTOM) {
      ({ pg, y } = newPage(false));
    }
  };

  // ── Produktbilder auflösen und einbetten ──
  const imgServiceClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  for (const it of data.productItems) {
    it.imageUrl = normalizeImageUrl(it.imageUrl);
  }
  const missingImgNames = data.productItems.filter((i) => !i.imageUrl).map((i) => i.name);
  if (missingImgNames.length) {
    const resolvedImgs = await resolveImagesByName(imgServiceClient, missingImgNames);
    for (const it of data.productItems) {
      if (it.imageUrl) continue;
      it.imageUrl = resolvedImgs.get((it.name || "").trim().toLowerCase()) || null;
    }
  }
  const imageCache = await embedProductImages(doc, data.productItems.map((i) => i.imageUrl));
  console.log(
    `Produktbilder (Rechnung): ${data.productItems.filter((i) => i.imageUrl && imageCache.get(i.imageUrl)).length}/${data.productItems.length} Positionen mit Bild`,
  );

  // ── item rendering ──
  const IMG = 34;
  const hasAnyImage = data.productItems.some((i) => i.imageUrl && imageCache.get(i.imageUrl));
  const nameColX = ML + 32;
  const textColX = hasAnyImage ? nameColX + IMG + 8 : nameColX;
  const nameColW = ML + CW * 0.60 - textColX - 6;
  const qtyColRight = ML + CW * 0.60;
  const unitColX = ML + CW * 0.60 + 8;
  const unitPriceRight = ML + CW * 0.85;
  const totalRight = W - MR - 4;

  // Einheit = NUR das Wort (Tage/Wochen/Stück/Pauschale). Menge steht separat
  // in der Menge-Spalte. Niemals Zahl in die Einheit mischen.
  const deriveUnit = (item: any, fallback = 'Stück'): string => {
    if (item.unit) return item.unit;
    if (item.rentalStart && item.rentalEnd) {
      try {
        const a = new Date(item.rentalStart.split(' ')[0]);
        const b = new Date(item.rentalEnd.split(' ')[0]);
        const days = Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000) + 1);
        return days >= 28 && days % 7 === 0 ? 'Wochen' : 'Tage';
      } catch { return 'Tage'; }
    }
    return fallback;
  };

  let posNum = 1;
  let rowZebra = false;

  const renderRow = (rowH: number, drawer: (rowTop: number) => void) => {
    need(rowH);
    if (rowZebra) pg.drawRectangle({ x: ML, y: y - rowH + 3, width: CW, height: rowH, color: ZEBRA });
    drawer(y);
    y -= rowH;
    rowZebra = !rowZebra;
  };

  data.productItems.forEach((item, productIndex) => {
    let nameText = item.name || '';
    if (item.discount && item.discount > 0) nameText += ` (${item.discount}% Rabatt)`;
    const nameLines = wt(nameText, bold, 9.5, nameColW);
    let subLines: string[] = [];
    if (item.description) subLines.push(...wt(item.description, font, 8, nameColW));
    if (item.rentalStart) {
      const period = `Mietzeitraum: ${fd(item.rentalStart)}${item.rentalEnd ? ' – ' + fd(item.rentalEnd) : ''}`;
      subLines.push(...wt(period, font, 8, nameColW));
    }
    const img = item.imageUrl ? imageCache.get(item.imageUrl) : null;
    let rowH = 10 + nameLines.length * 12 + (subLines.length ? 4 + subLines.length * 10 : 0);
    if (img) rowH = Math.max(rowH, IMG + 14);
    renderRow(rowH, (top) => {
      dt(pg, `${posNum}`, ML + 2, top - 10, font, 9);
      if (img) {
        const sc = Math.min(IMG / img.width, IMG / img.height);
        pg.drawImage(img, { x: nameColX, y: top - 8 - img.height * sc, width: img.width * sc, height: img.height * sc });
      }
      nameLines.forEach((ln, li) => dt(pg, ln, textColX, top - 10 - li * 12, bold, 9.5));
      subLines.forEach((ln, li) => dt(pg, ln, textColX, top - 10 - nameLines.length * 12 - 4 - li * 10, font, 8, MUTED));
      dtr(pg, String(item.quantity), qtyColRight, top - 10, font, 9.5);
      dt(pg, deriveUnit(item), unitColX, top - 10, font, 9.5, MUTED);
      if (item.unitPrice != null) dtr(pg, fm(item.unitPrice), unitPriceRight, top - 10, font, 9.5);
      dtr(pg, fm(item.totalPrice || 0), totalRight, top - 10, bold, 9.5);
    });
    posNum++;

    // Linked services under a product
    const linked = data.serviceItems.filter(s => s.parentItemIndex === productIndex);
    linked.forEach(svc => {
      const svcLines = wt(`- ${svc.name}`, font, 8.5, nameColW);
      const h = 4 + svcLines.length * 10;
      renderRow(h, (top) => {
        svcLines.forEach((ln, li) => dt(pg, ln, textColX + 8, top - 8 - li * 10, font, 8.5, MUTED));
        dt(pg, 'Pauschale', unitColX, top - 8, font, 8.5, MUTED);
        dtr(pg, fm(svc.amount), totalRight, top - 8, font, 8.5, MUTED);
      });
    });
  });

  // Delivery cost as its own row
  if (data.totals?.deliveryCost && data.totals.deliveryCost > 0) {
    renderRow(26, (top) => {
      dt(pg, `${posNum}`, ML + 2, top - 10, font, 9);
      dt(pg, "Anlieferung / Transport", textColX, top - 10, bold, 9.5);
      dtr(pg, "1", qtyColRight, top - 10, font, 9.5);
      dt(pg, "Pauschale", unitColX, top - 10, font, 9.5, MUTED);
      dtr(pg, fm(data.totals.deliveryCost), unitPriceRight, top - 10, font, 9.5);
      dtr(pg, fm(data.totals.deliveryCost), totalRight, top - 10, bold, 9.5);
    });
    posNum++;
  }

  // Unassigned services
  const unassigned = data.serviceItems.filter(s => s.parentItemIndex == null);
  unassigned.forEach(svc => {
    const svcLines = wt(svc.name, font, 9.5, nameColW);
    const h = 4 + svcLines.length * 11;
    renderRow(h, (top) => {
      dt(pg, `${posNum}`, ML + 2, top - 8, font, 9);
      svcLines.forEach((ln, li) => dt(pg, ln, textColX, top - 8 - li * 11, font, 9.5));
      dtr(pg, "1", qtyColRight, top - 8, font, 9.5);
      dt(pg, "Pauschale", unitColX, top - 8, font, 9.5, MUTED);
      dtr(pg, fm(svc.amount), totalRight, top - 8, bold, 9.5);
    });
    posNum++;
  });

  // Surcharges
  data.surchargeItems.forEach(sc => {
    const scLines = wt(sc.name, font, 9.5, nameColW);
    const h = 4 + scLines.length * 11;
    renderRow(h, (top) => {
      dt(pg, `${posNum}`, ML + 2, top - 8, font, 9);
      scLines.forEach((ln, li) => dt(pg, ln, textColX, top - 8 - li * 11, font, 9.5));
      dtr(pg, "1", qtyColRight, top - 8, font, 9.5);
      dt(pg, "Pauschale", unitColX, top - 8, font, 9.5, MUTED);
      dtr(pg, fm(sc.amount), totalRight, top - 8, bold, 9.5);
    });
    posNum++;
  });

  // Underline table end
  pg.drawRectangle({ x: ML, y, width: CW, height: 0.5, color: LINE });
  y -= 26;

  // ── Totals block (right aligned) ──
  if (data.totals) {
    need(120);
    const tx = ML + CW * (proformaFlag ? 0.38 : 0.55);
    const vx = W - MR - 4;
    const showSubtotals = (data.serviceItems.length > 0) || (data.surchargeItems.length > 0) || ((data.totals.deliveryCost || 0) > 0);

    if (showSubtotals) {
      const itemsSubtotal = data.productItems.reduce((s, i) => s + (i.totalPrice || 0), 0);
      dt(pg, "Zwischensumme Mietartikel", tx, y, font, 9, MUTED);
      dtr(pg, fm(itemsSubtotal), vx, y, font, 9); y -= 13;
    }

    if (proformaFlag) {
      if (data.totals.depositTotal && data.totals.depositTotal > 0) {
        dt(pg, "Kaution (umsatzsteuerfrei)", tx, y, font, 9, MUTED);
        dtr(pg, fm(data.totals.depositTotal), vx, y, font, 9); y -= 13;
      }
      y -= 6;
      // dezenter Hintergrund #00507d @ ~6%
      pg.drawRectangle({ x: tx - 6, y: y - 4, width: vx - tx + 10, height: 22, color: rgb(0.94, 0.96, 0.98) });
      pg.drawRectangle({ x: tx - 6, y: y + 17, width: vx - tx + 10, height: 1, color: BRAND });
      dt(pg, "Zu zahlender Betrag (inkl. gesetzl. MwSt.)", tx, y + 4, bold, 10.5, BRAND);
      dtr(pg, fm(data.totals.gross), vx, y + 4, bold, 12, BRAND);
      y -= 30;
    } else {
      dt(pg, "Nettobetrag", tx, y, font, 9.5); dtr(pg, fm(data.totals.net), vx, y, font, 9.5); y -= 13;
      if (data.totals.isReverseCharge) {
        dt(pg, "USt. (Reverse Charge)", tx, y, font, 9, MUTED); dtr(pg, "0,00 \u20AC", vx, y, font, 9); y -= 13;
      } else {
        dt(pg, `USt. ${data.totals.vatRate}%`, tx, y, font, 9, MUTED); dtr(pg, fm(data.totals.vat), vx, y, font, 9); y -= 13;
      }
      if (data.totals.depositTotal && data.totals.depositTotal > 0) {
        dt(pg, "Kaution (umsatzsteuerfrei)", tx, y, font, 9, MUTED); dtr(pg, fm(data.totals.depositTotal), vx, y, font, 9); y -= 13;
      }
      y -= 6;
      pg.drawRectangle({ x: tx - 6, y: y - 4, width: vx - tx + 10, height: 22, color: rgb(0.94, 0.96, 0.98) });
      pg.drawRectangle({ x: tx - 6, y: y + 17, width: vx - tx + 10, height: 1, color: BRAND });
      dt(pg, "Gesamtbetrag", tx, y + 4, bold, 11, BRAND);
      dtr(pg, fm(data.totals.gross), vx, y + 4, bold, 12, BRAND);
      y -= 30;
    }
  }

  // ── Payment / Proforma-Kasten (mit deutlich mehr Innenpadding und Zeilenabstand) ──
  y -= 8; // Luft vor dem Kasten
  if (proformaFlag) {
    const notice = "Dies ist keine Rechnung im Sinne des \u00A714 UStG und berechtigt nicht zum Vorsteuerabzug. Zahlung vor Mietbeginn (Vorkasse); die Bereitstellung erfolgt nach Zahlungseingang.";
    const lines = wt(notice, font, 9, CW - 32);
    const boxH = 24 + 16 + lines.length * 13 + 14;
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: CW, height: boxH, color: rgb(1, 0.97, 0.88) });
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: 3, height: boxH, color: ORANGE });
    dt(pg, "Proforma – Hinweis nach §14 UStG", ML + 16, y - 4, bold, 10, rgb(0.55, 0.32, 0));
    lines.forEach((ln, i) => dt(pg, ln, ML + 16, y - 22 - i * 13, font, 9, rgb(0.35, 0.25, 0.1)));
    y -= boxH + 10;
  } else if (data.totals?.dueDate) {
    const dueText = data.totals.paymentDueDays === 0
      ? "Zahlungsziel: Vorkasse. Die Bereitstellung erfolgt nach Zahlungseingang."
      : `Zahlbar bis: ${fd(data.totals.dueDate)} (${data.totals.paymentDueDays} Tage netto)`;
    const bankLine = `${SLT_COMPANY.bankName} | IBAN: ${SLT_COMPANY.iban} | BIC: ${SLT_COMPANY.bic}`;
    const ref = `Verwendungszweck: ${data.documentNumber}`;
    const boxH = 84;
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: CW, height: boxH, color: rgb(0.995, 0.97, 0.93) });
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: 3, height: boxH, color: ORANGE });
    dt(pg, "Zahlungshinweis", ML + 16, y - 2, bold, 10, INK);
    dt(pg, dueText, ML + 16, y - 20, font, 9.5, INK);
    dt(pg, bankLine, ML + 16, y - 38, font, 9.5, INK);
    dt(pg, ref, ML + 16, y - 56, bold, 9.5, INK);
    y -= boxH + 10;
  }

  if (data.totals?.isReverseCharge && !proformaFlag) {
    need(46);
    // Pflichthinweis Reverse-Charge (§13b UStG). USt-IdNr. des Kunden steht bereits im Adressblock.
    pg.drawRectangle({ x: ML, y: y - 30, width: CW, height: 36, color: rgb(0.94, 0.97, 0.98) });
    pg.drawRectangle({ x: ML, y: y - 30, width: 3, height: 36, color: BRAND });
    dt(pg, "Steuerschuldnerschaft des Leistungsempfängers", ML + 12, y - 6, bold, 9, INK);
    dt(pg, "Reverse-Charge-Verfahren gem. §13b UStG – die Umsatzsteuer schuldet der Leistungsempfänger.", ML + 12, y - 20, font, 8.5, INK);
    y -= 46;
  }


  // Sections (notes)
  for (const sec of data.sections) {
    need(30);
    dt(pg, sec.label + ":", ML, y, bold, 9);
    y -= 12;
    const lines = wt(sec.value, font, 8.5, CW);
    for (const line of lines) { need(12); dt(pg, line, ML, y, font, 8.5, INK); y -= 11; }
    y -= 6;
  }

  // Signatures
  if (data.signatures) {
    need(80); y -= 6;
    pg.drawRectangle({ x: ML, y, width: CW, height: 0.5, color: LINE }); y -= 50;
    for (const [sigData, xOff] of [[data.signatures.customerData, 0], [data.signatures.staffData, CW / 2 + 10]] as [string | undefined, number][]) {
      if (sigData) { try {
        const b64 = sigData.split(',')[1]; const sb = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const si = sigData.includes('png') ? await doc.embedPng(sb) : await doc.embedJpg(sb);
        const sc = Math.min(120 / si.width, 45 / si.height);
        pg.drawImage(si, { x: ML + xOff, y, width: si.width * sc, height: si.height * sc });
      } catch {} }
    }
    y -= 6;
    pg.drawRectangle({ x: ML, y, width: CW / 2 - 15, height: 0.5, color: MUTED });
    pg.drawRectangle({ x: ML + CW / 2 + 10, y, width: CW / 2 - 10, height: 0.5, color: MUTED });
    y -= 10; dt(pg, "Kunde", ML, y, font, 8, MUTED);
    dt(pg, `Mitarbeiter: ${data.signatures.staffName || ''}`, ML + CW / 2 + 10, y, font, 8, MUTED);
  }

  // ── Footer auf ALLEN Seiten (3-spaltig, Trenner = Pipe) ──
  const total = doc.getPageCount();
  const colW = CW / 3;
  const footerCol1 = [
    SLT_COMPANY.name,
    `GF ${SLT_COMPANY.managingDirector}`,
    `${SLT_COMPANY.registry}`,
  ];
  const footerCol2 = [
    `${SLT_COMPANY.street} | ${SLT_COMPANY.city}`,
    `Tel: ${SLT_COMPANY.phone}`,
    `${SLT_COMPANY.email} | ${SLT_COMPANY.web}`,
  ];
  const footerCol3 = [
    `Steuer-Nr. ${SLT_COMPANY.steuerNr}`,
    `USt-IdNr. ${SLT_COMPANY.ustId}`,
    `${SLT_COMPANY.bankName} | IBAN ${SLT_COMPANY.iban}`,
  ];
  for (let i = 0; i < total; i++) {
    const p = doc.getPage(i);
    // Trennlinie
    p.drawRectangle({ x: ML, y: MB + 42, width: CW, height: 0.5, color: LINE });
    const drawCol = (lines: string[], x: number) => {
      lines.forEach((ln, li) => {
        try { p.drawText(ln, { x, y: MB + 32 - li * 9, size: 6.8, font, color: MUTED }); } catch {}
      });
    };
    drawCol(footerCol1, ML);
    drawCol(footerCol2, ML + colW);
    drawCol(footerCol3, ML + 2 * colW);
    // Seite X von Y ab Seite 2
    if (total > 1 && i >= 1) {
      try {
        const t = `Seite ${i + 1} von ${total}`;
        const tw = font.widthOfTextAtSize(t, 7.5);
        p.drawText(t, { x: W - MR - tw, y: MB + 55, size: 7.5, font, color: MUTED });
      } catch {}
    }
  }

  return await doc.save();
}