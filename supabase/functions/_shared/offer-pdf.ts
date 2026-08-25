import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { embedProductImages } from "./product-images.ts";
import { SLT_COMPANY } from "./offer-company.ts";

// ─── PDF Offer Generator ───────────────────────────────────
export async function generateOfferPdf(data: {
  offerNumber: string;
  offerDate: string;
  validUntil: string;
  profile: any;
  items: any[];
  deliveryCost: number;
  deliveryCostDelivery: number;
  deliveryCostReturn: number;
  servicesSurcharge: number;
  servicesWithPrices: { id: string; name: string; description?: string; pricePercent: number | null; amount: number; allocations?: { itemIndex: number; amount: number }[] }[];
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  grossAmount: number;
  isReverseCharge: boolean;
  notes: string | null;
  validDays: number;
  deposit: number;
  additionalServices?: any[];
  staffName: string;
  issuingLocation: string;
  returnLocation?: string;
  deliveryAddress?: { street?: string; postal_code?: string; city?: string };
  paymentTerms?: string;
  /** Freitext bei individuellen Zahlungsbedingungen (paymentTerms === "custom"). */
  paymentTermsCustom?: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // ── Layout-Konstanten: identisch zum Rechnungs-PDF (DIN 5008) ──
  const W = 595.28, H = 841.89;
  const ML = 57, MR = 57;
  const MT = 45, MB = 60;
  const CW = W - ML - MR;
  const BRAND = rgb(0 / 255, 80 / 255, 125 / 255);
  const ORANGE = rgb(255 / 255, 142 / 255, 2 / 255);
  const INK = rgb(0.13, 0.13, 0.15);
  const MUTED = rgb(0.48, 0.5, 0.55);
  const LINE = rgb(0.82, 0.84, 0.87);
  const ZEBRA = rgb(0.972, 0.976, 0.982);

  const ADDR_X = ML;
  const ADDR_Y_TOP = H - 105;

  const TITLE = "ANGEBOT";

  // WinAnsi-sichere Normalisierung: typografische Zeichen auf darstellbare mappen,
  // Euro-Zeichen bleibt erhalten (WinAnsi kann 0x20AC).
  const safe = (str: any) =>
    String(str ?? "")
      .replace(/[\u2010-\u2015]/g, "-")
      .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
      .replace(/[\u201C\u201D\u201E]/g, '"')
      .replace(/\u2026/g, "...")
      .replace(/\u00A0/g, " ")
      .replace(/[^\x20-\x7E\xA0-\xFF\u20AC]/g, "");

  const fm = (n: number) => {
    const abs = Math.abs(n || 0);
    const parts = abs.toFixed(2).split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (n < 0 ? "-" : "") + intPart + "," + parts[1] + " \u20AC";
  };
  /** Prozentwert deutsch, ohne unnötige Nullen: 10 → "10", 12,5 → "12,5" */
  const fm2 = (n: number) => {
    const v = Math.round((Number(n) || 0) * 100) / 100;
    return (Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0$/, "")).replace(".", ",");
  };

  const fmtDate = (d: string) => {
    if (!d) return "";
    const parts = String(d).split(" ");
    const p = parts[0].split("-");
    const dateStr = p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : parts[0];
    return parts[1] ? `${dateStr} \u00B7 ${parts[1]} Uhr` : dateStr;
  };
  const fd = fmtDate;

  const wt = (t: string, f: any, s: number, mw: number): string[] => {
    if (!t) return [""];
    const words = safe(t).split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (f.widthOfTextAtSize(test, s) <= mw) cur = test;
      else { if (cur) lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  };
  const dt = (pg: any, t: string, x: number, yy: number, f = font, s = 9.5, c = INK) => {
    try { pg.drawText(safe(t), { x, y: yy, size: s, font: f, color: c }); } catch {}
  };
  const dtr = (pg: any, t: string, xRight: number, yy: number, f = font, s = 9.5, c = INK) => {
    try {
      const txt = safe(t);
      const tw = f.widthOfTextAtSize(txt, s);
      pg.drawText(txt, { x: xRight - tw, y: yy, size: s, font: f, color: c });
    } catch {}
  };

  // Standortdaten
  const LOCATIONS: Record<string, { name: string; address: string; city: string; phone: string; email: string }> = {
    krefeld: { name: "SLT Rental Krefeld", address: "Anrather Str. 291", city: "47807 Krefeld", phone: "02151 417 990 4", email: "krefeld@slt-rental.de" },
    bonn: { name: "SLT Rental Bonn", address: "Drachenburgstr. 8", city: "53179 Bonn", phone: "0228 504 660 61", email: "bonn@slt-rental.de" },
    muelheim: { name: "SLT Rental M\u00FClheim", address: "Ruhrorter Str. 122", city: "45478 M\u00FClheim a. d. Ruhr", phone: "02151 417 990 4", email: "muelheim@slt-rental.de" },
  };
  const issuingLoc = LOCATIONS[data.issuingLocation] || LOCATIONS["krefeld"];
  const returnLoc = data.returnLocation ? LOCATIONS[data.returnLocation] : null;

  // Logo laden (Bitmap, identisch zur Rechnung)
  let logoImg: any = null;
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 3000);
    const lr = await fetch("https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png", { signal: ctrl.signal });
    clearTimeout(to);
    if (lr.ok) logoImg = await doc.embedPng(new Uint8Array(await lr.arrayBuffer()));
  } catch {}

  const pages: any[] = [];

  // ── Kopf Seite 1: Absenderzeile, Empfängeradresse, Logo rechts, Infoblock, Titel ──
  const renderHeader = (pg: any): number => {
    // Absenderzeile mit deutlichem Abstand zum Anschriftfeld (DIN 5008)
    dt(pg, `${SLT_COMPANY.name} \u00B7 ${SLT_COMPANY.street} \u00B7 ${SLT_COMPANY.city}`, ADDR_X, ADDR_Y_TOP + 30, font, 7, MUTED);
    pg.drawRectangle({ x: ADDR_X, y: ADDR_Y_TOP + 27, width: 220, height: 0.4, color: LINE });


    let ay = ADDR_Y_TOP;
    const companyLine = data.profile.legal_form
      ? `${data.profile.company_name} ${data.profile.legal_form}`
      : data.profile.company_name;
    dt(pg, companyLine, ADDR_X, ay, bold, 10.5); ay -= 12;
    const cn = `${data.profile.contact_first_name || ""} ${data.profile.contact_last_name || ""}`.trim();
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
    // Ansprechpartner nur ausgeben, wenn er sich vom Firmennamen unterscheidet
    if (cn && norm(cn) !== norm(String(companyLine || ""))) { dt(pg, cn, ADDR_X, ay, font, 9.5); ay -= 11; }

    dt(pg, `${data.profile.street || ""}${data.profile.house_number ? " " + data.profile.house_number : ""}`, ADDR_X, ay, font, 9.5); ay -= 11;
    dt(pg, `${data.profile.postal_code || ""} ${data.profile.city || ""}`, ADDR_X, ay, font, 9.5); ay -= 11;
    dt(pg, data.profile.country || "Deutschland", ADDR_X, ay, font, 9.5); ay -= 11;
    // Kontaktdaten (nur wenn übergeben, z. B. bei Anfrage-Angeboten)
    if (data.profile.contact_email) { dt(pg, String(data.profile.contact_email), ADDR_X, ay, font, 8.5, MUTED); ay -= 10; }
    if (data.profile.contact_phone) { dt(pg, String(data.profile.contact_phone), ADDR_X, ay, font, 8.5, MUTED); ay -= 10; }
    // USt-IdNr. bei Reverse Charge oder wenn explizit gewünscht (Geschäftskunde)
    if ((data.isReverseCharge || data.profile.show_tax_id) && data.profile.tax_id) {
      ay -= 2;
      dt(pg, `USt-IdNr.: ${data.profile.tax_id}`, ADDR_X, ay, font, 9, MUTED);
      ay -= 11;
    }

    // Logo oben rechts – die PNG-Datei hat viel transparenten Rand, deshalb
    // rechnen wir mit dem sichtbaren Bildausschnitt, damit der SLT-Kreis
    // exakt auf Höhe der Absenderzeile sitzt.
    const LOGO_BOX = { left: 0.1474, top: 0.3536, right: 0.8516, bottom: 0.6318 };
    const visibleTopY = ADDR_Y_TOP + 44;
    let logoBottomY = visibleTopY - 60;
    if (logoImg) {
      const visibleW = 150;
      const fullW = visibleW / (LOGO_BOX.right - LOGO_BOX.left);
      const fullH = (logoImg.height / logoImg.width) * fullW;
      const imgTopY = visibleTopY + LOGO_BOX.top * fullH;
      const imgY = imgTopY - fullH;
      const imgX = W - MR - LOGO_BOX.right * fullW;
      pg.drawImage(logoImg, { x: imgX, y: imgY, width: fullW, height: fullH });
      logoBottomY = visibleTopY - (LOGO_BOX.bottom - LOGO_BOX.top) * fullH;
    }

    // Infoblock rechts, zweispaltig
    const infoX = W - MR - 200;
    let iy = logoBottomY - 24;

    const infoRow = (label: string, value: string, c = INK) => {
      dt(pg, label, infoX, iy, font, 8.5, MUTED);
      dt(pg, value, infoX + 95, iy, font, 9, c);
      iy -= 13;
    };
    const infoSub = (value: string) => {
      dt(pg, value, infoX + 95, iy + 3, font, 7, MUTED);
      iy -= 10;
    };
    infoRow("Angebotsnummer:", data.offerNumber);
    infoRow("Angebotsdatum:", fd(data.offerDate));
    infoRow("G\u00FCltig bis:", fd(data.validUntil), rgb(0.7, 0.26, 0.04));
    // Anfragen aus dem öffentlichen Formular haben keine Kundennummer –
    // dann die Zeile weglassen statt eine UUID auszuweisen.
    if (String(data.profile.id || "").trim()) {
      infoRow("Kundennummer:", String(data.profile.id).substring(0, 8).toUpperCase());
    }

    infoRow("Ansprechpartner:", data.staffName || SLT_COMPANY.managingDirector);
    infoRow("Ausgabestandort:", issuingLoc.name);
    infoSub(`${issuingLoc.address}, ${issuingLoc.city}`);
    if (returnLoc && data.returnLocation !== data.issuingLocation) {
      infoRow("R\u00FCckgabestandort:", returnLoc.name);
      infoSub(`${returnLoc.address}, ${returnLoc.city}`);
    }
    if (data.isReverseCharge) infoRow("Verfahren:", "Reverse-Charge", BRAND);

    // Titelblock
    const contentTopY = Math.min(ay, iy) - 26;
    let ty = contentTopY;
    dt(pg, TITLE, ML, ty, bold, 30, BRAND);
    ty -= 26;
    dt(pg, `Nr. ${data.offerNumber}`, ML, ty, font, 10.5, MUTED);
    ty -= 22;


    // Lieferadresse (angebotsspezifisch)
    if (data.deliveryAddress && (data.deliveryAddress.street || data.deliveryAddress.city)) {
      dt(pg, "Lieferadresse:", ML, ty, bold, 9);
      const parts = [data.deliveryAddress.street, [data.deliveryAddress.postal_code, data.deliveryAddress.city].filter(Boolean).join(" ")].filter(Boolean) as string[];
      dt(pg, parts.join(", "), ML + 78, ty, font, 9, INK);
      ty -= 20;
    }

    // Anschreiben
    dt(pg, "Sehr geehrte Damen und Herren,", ML, ty, font, 9.5); ty -= 13;
    dt(pg, "vielen Dank f\u00FCr Ihre Anfrage. Gerne unterbreiten wir Ihnen folgendes Angebot:", ML, ty, font, 9.5);

    return ty - 30;
  };

  const renderTableHeader = (pg: any, startY: number): number => {
    const yy = startY;
    dt(pg, "Pos.", ML + 2, yy, bold, 8.5, BRAND);
    dt(pg, "Bezeichnung", ML + 32, yy, bold, 8.5, BRAND);
    dtr(pg, "Menge", ML + CW * 0.60, yy, bold, 8.5, BRAND);
    dt(pg, "Einheit", ML + CW * 0.60 + 8, yy, bold, 8.5, BRAND);
    dtr(pg, "Einzelpreis", ML + CW * 0.85, yy, bold, 8.5, BRAND);
    dtr(pg, "Gesamt", W - MR - 4, yy, bold, 8.5, BRAND);
    pg.drawRectangle({ x: ML, y: yy - 5, width: CW, height: 2, color: BRAND });
    return yy - 16;
  };

  let tableClosed = false;

  const newPage = (isFirst: boolean): { pg: any; y: number } => {
    const pg = doc.addPage([W, H]);
    pages.push(pg);
    if (isFirst) {
      const yy = renderHeader(pg);
      return { pg, y: renderTableHeader(pg, yy) };
    }
    let yy = H - MT;
    if (logoImg) {
      const targetW = 90;
      const scale = targetW / logoImg.width;
      const drawH = logoImg.height * scale;
      pg.drawImage(logoImg, { x: W - MR - targetW, y: yy - drawH, width: targetW, height: drawH });
    }
    dt(pg, `${TITLE} \u00B7 ${data.offerNumber}`, ML, yy - 46, bold, 10, BRAND);
    yy -= 74;
    // Fortsetzungsseiten nach der Positionstabelle brauchen keinen Tabellenkopf
    return { pg, y: tableClosed ? yy : renderTableHeader(pg, yy) };
  };


  let { pg, y } = newPage(true);

  const RESERVE_BOTTOM = MB + 60;
  const need = (h: number) => {
    if (y - h < RESERVE_BOTTOM) ({ pg, y } = newPage(false));
  };

  // Spalten (identisch zur Rechnung)
  const nameColX = ML + 32;
  const qtyColRight = ML + CW * 0.60;
  const unitColX = ML + CW * 0.60 + 8;
  const unitPriceRight = ML + CW * 0.85;
  const totalRight = W - MR - 4;

  const deriveUnit = (item: any, fallback = "St\u00FCck"): string => {
    if (item.unit) return item.unit;
    if (item.rental_start && item.rental_end) {
      try {
        const a = new Date(String(item.rental_start).split(" ")[0]);
        const b = new Date(String(item.rental_end).split(" ")[0]);
        const days = Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000) + 1);
        return days >= 28 && days % 7 === 0 ? "Wochen" : "Tage";
      } catch { return "Tage"; }
    }
    return fallback;
  };

  // Produktbilder vorladen (JPEG/PNG; WebP/AVIF via JPG-Geschwisterdatei)
  const imageCache = await embedProductImages(doc, data.items.map((i: any) => i.image_url));


  const IMG = 34;
  const hasAnyImage = data.items.some((i: any) => i.image_url && imageCache.get(i.image_url));
  const textColX = hasAnyImage ? nameColX + IMG + 8 : nameColX;
  const nameColW = qtyColRight - textColX - 12;

  const servicesByItem = new Map<number, { name: string; description?: string; amount: number }[]>();
  for (const svc of data.servicesWithPrices || []) {
    for (const alloc of svc.allocations || []) {
      const current = servicesByItem.get(alloc.itemIndex) || [];
      current.push({ name: svc.name, description: svc.description, amount: alloc.amount });
      servicesByItem.set(alloc.itemIndex, current);
    }
  }

  let posNum = 1;
  let rowZebra = false;
  const renderRow = (rowH: number, drawer: (rowTop: number) => void) => {
    need(rowH);
    if (rowZebra) pg.drawRectangle({ x: ML, y: y - rowH + 3, width: CW, height: rowH, color: ZEBRA });
    drawer(y);
    y -= rowH;
    rowZebra = !rowZebra;
  };

  // ── Positionen ──
  let discountTotal = 0;
  data.items.forEach((item: any, idx: number) => {
    const img = item.image_url ? imageCache.get(item.image_url) : null;
    const nameText = safe(item.product_name);
    const nameLines = wt(nameText, bold, 9.5, nameColW);
    const subLines: string[] = [];
    if (item.description) subLines.push(...wt(item.description, font, 8, nameColW));
    if (item.rental_start) {
      subLines.push(...wt(`Mietzeitraum: ${fd(item.rental_start)}${item.rental_end ? " - " + fd(item.rental_end) : ""}`, font, 8, nameColW));
    }
    // Rabattzeile: Listenpreis, Rabattsatz und Ersparnis transparent ausweisen
    const pct = Number(item.discount_percent) || 0;
    const grossLine = Math.round((item.quantity || 0) * (item.unit_price || 0) * 100) / 100;
    const savings = Math.round(grossLine * (pct / 100) * 100) / 100;
    const discountLines = pct > 0
      ? wt(`Listenpreis ${fm(grossLine)} \u2013 Rabatt ${fm2(pct)} % = \u2212 ${fm(savings)}`, bold, 8, nameColW)
      : [];
    if (pct > 0) discountTotal += savings;
    let rowH = 10 + nameLines.length * 12 + (subLines.length ? 4 + subLines.length * 10 : 0) +
      (discountLines.length ? 3 + discountLines.length * 10 : 0);
    if (img) rowH = Math.max(rowH, IMG + 14);
    if (pct > 0) rowH = Math.max(rowH, 34);


    renderRow(rowH, (top) => {
      dt(pg, `${posNum}`, ML + 2, top - 10, font, 9);
      if (img) {
        const sc = Math.min(IMG / img.width, IMG / img.height);
        pg.drawImage(img, { x: nameColX, y: top - 8 - img.height * sc, width: img.width * sc, height: img.height * sc });
      }
      nameLines.forEach((ln, li) => dt(pg, ln, textColX, top - 10 - li * 12, bold, 9.5));
      const subTop = top - 10 - nameLines.length * 12 - 4;
      subLines.forEach((ln, li) => dt(pg, ln, textColX, subTop - li * 10, font, 8, MUTED));
      const discTop = subTop - subLines.length * 10 - (subLines.length ? 3 : 0);
      discountLines.forEach((ln, li) => dt(pg, ln, textColX, discTop - li * 10, bold, 8, ORANGE));
      dtr(pg, String(item.quantity), qtyColRight, top - 10, font, 9.5);
      dt(pg, deriveUnit(item), unitColX, top - 10, font, 9.5, MUTED);
      dtr(pg, fm(item.unit_price), unitPriceRight, top - 10, font, 9.5);
      if (pct > 0) dtr(pg, `\u2212 ${fm2(pct)} %`, unitPriceRight, top - 22, bold, 8, ORANGE);
      dtr(pg, fm(item.total_price), totalRight, top - 10, bold, 9.5);
    });
    posNum++;


    // Zusatzoptionen direkt unter der Position
    for (const svc of servicesByItem.get(idx) || []) {
      if (!svc.amount || svc.amount <= 0) continue;
      const svcLines = wt(`- ${svc.name}`, font, 8.5, nameColW);
      renderRow(4 + svcLines.length * 10, (top) => {
        svcLines.forEach((ln, li) => dt(pg, ln, textColX + 8, top - 8 - li * 10, font, 8.5, MUTED));
        dt(pg, "Pauschale", unitColX, top - 8, font, 8.5, MUTED);
        dtr(pg, fm(svc.amount), totalRight, top - 8, font, 8.5, MUTED);
      });
    }
  });

  // ── Logistik-Positionen ──
  const deliveryRow = (label: string, amount: number) => {
    renderRow(26, (top) => {
      dt(pg, `${posNum}`, ML + 2, top - 10, font, 9);
      dt(pg, label, textColX, top - 10, bold, 9.5);
      dtr(pg, "1", qtyColRight, top - 10, font, 9.5);
      dt(pg, "Pauschale", unitColX, top - 10, font, 9.5, MUTED);
      dtr(pg, fm(amount), unitPriceRight, top - 10, font, 9.5);
      dtr(pg, fm(amount), totalRight, top - 10, bold, 9.5);
    });
    posNum++;
  };
  if (data.deliveryCostDelivery > 0) deliveryRow("Anlieferung / Transport", data.deliveryCostDelivery);
  if (data.deliveryCostReturn > 0) deliveryRow("R\u00FCcklieferung / Abholung", data.deliveryCostReturn);
  if (data.deliveryCost > 0 && data.deliveryCostDelivery <= 0 && data.deliveryCostReturn <= 0) {
    deliveryRow("Lieferkosten", data.deliveryCost);
  }

  // ── Nicht zugeordnete Zusatzoptionen ──
  for (const svc of data.servicesWithPrices || []) {
    const allocated = (svc.allocations || []).length > 0;
    if (allocated || !svc.amount || svc.amount <= 0) continue;
    const scLines = wt(svc.name, font, 9.5, nameColW);
    renderRow(4 + scLines.length * 11, (top) => {
      dt(pg, `${posNum}`, ML + 2, top - 8, font, 9);
      scLines.forEach((ln, li) => dt(pg, ln, textColX, top - 8 - li * 11, font, 9.5));
      dtr(pg, "1", qtyColRight, top - 8, font, 9.5);
      dt(pg, "Pauschale", unitColX, top - 8, font, 9.5, MUTED);
      dtr(pg, fm(svc.amount), totalRight, top - 8, bold, 9.5);
    });
    posNum++;
  }

  pg.drawRectangle({ x: ML, y, width: CW, height: 0.5, color: LINE });
  y -= 26;
  tableClosed = true;

  // ── Summenblock (rechtsbündig, wie Rechnung) ──
  // Höhe konservativ reservieren: 3 Zwischensummen + Netto + USt. + Kaution
  // + Gesamtbetrag-Kasten, damit der Block nie in die Fußzeile läuft.
  need(180);

  const tx = ML + CW * 0.55;
  const vx = W - MR - 4;
  const itemsTotal = data.items.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0);
  const servicesSubtotal = (data.servicesWithPrices || []).reduce((sum, svc) => sum + (svc.amount || 0), 0);
  const deliverySubtotal = (data.deliveryCostDelivery || 0) + (data.deliveryCostReturn || 0) ||
    ((data.deliveryCost > 0) ? data.deliveryCost : 0);

  if (servicesSubtotal > 0 || deliverySubtotal > 0) {
    dt(pg, "Zwischensumme Mietartikel", tx, y, font, 9, MUTED);
    dtr(pg, fm(itemsTotal), vx, y, font, 9); y -= 13;
  }
  if (servicesSubtotal > 0) {
    dt(pg, "Zwischensumme Zusatzoptionen", tx, y, font, 9, MUTED);
    dtr(pg, fm(servicesSubtotal), vx, y, font, 9); y -= 13;
  }
  if (deliverySubtotal > 0) {
    dt(pg, "Zwischensumme Logistik", tx, y, font, 9, MUTED);
    dtr(pg, fm(deliverySubtotal), vx, y, font, 9); y -= 13;
  }

  dt(pg, "Nettobetrag", tx, y, font, 9.5); dtr(pg, fm(data.netAmount), vx, y, font, 9.5); y -= 13;
  if (data.isReverseCharge) {
    dt(pg, "USt. (Reverse Charge)", tx, y, font, 9, MUTED); dtr(pg, "0,00 \u20AC", vx, y, font, 9); y -= 13;
  } else {
    dt(pg, `USt. ${data.vatRate}%`, tx, y, font, 9, MUTED); dtr(pg, fm(data.vatAmount), vx, y, font, 9); y -= 13;
  }
  if (data.deposit && data.deposit > 0) {
    dt(pg, "Kaution (umsatzsteuerfrei)", tx, y, font, 9, MUTED); dtr(pg, fm(data.deposit), vx, y, font, 9); y -= 13;
  }
  y -= 6;
  pg.drawRectangle({ x: tx - 6, y: y - 4, width: vx - tx + 10, height: 22, color: rgb(0.94, 0.96, 0.98) });
  pg.drawRectangle({ x: tx - 6, y: y + 17, width: vx - tx + 10, height: 1, color: BRAND });
  dt(pg, "Gesamtbetrag", tx, y + 4, bold, 11, BRAND);
  dtr(pg, fm(data.grossAmount), vx, y + 4, bold, 12, BRAND);
  y -= 38;

  // ── Zahlungsbedingungen ──
  const hasCreditLimit = data.profile.credit_limit && data.profile.credit_limit > 0;
  const paymentDueDays = data.profile.payment_due_days || 14;
  const PAYMENT_TEXTS: Record<string, string> = {
    vorkasse: "Zahlungsbedingungen: Vorkasse. Der Rechnungsbetrag ist vor Mietbeginn zu entrichten.",
    net_7: "Zahlungsbedingungen: Zahlung innerhalb von 7 Tagen nach Rechnungsstellung (netto).",
    net_14: "Zahlungsbedingungen: Zahlung innerhalb von 14 Tagen nach Rechnungsstellung (netto).",
    net_30: "Zahlungsbedingungen: Zahlung innerhalb von 30 Tagen nach Rechnungsstellung (netto).",
    net_60: "Zahlungsbedingungen: Zahlung innerhalb von 60 Tagen nach Rechnungsstellung (netto).",
    "50_50_14": "Zahlungsbedingungen: 50 % Vorkasse vor Mietbeginn, 50 % Restzahlung innerhalb von 14 Tagen nach Rechnungsstellung.",
    anzahlung_30:
      "Zahlungsbedingungen: Vorkasse. Nach Annahme dieses Angebots erhalten Sie eine Buchungsbest\u00E4tigung mit Zahlungslink. " +
      "Innerhalb von 48 Stunden sind mindestens 30 % des Bruttobetrages als Anzahlung zu leisten \u2013 bequem per PayPal, Kredit- oder Debitkarte " +
      "oder per \u00DCberweisung unter Angabe der Angebotsnummer. Der Restbetrag ist vor Mietbeginn f\u00E4llig. " +
      "Ohne fristgerechten Zahlungseingang wird die Reservierung systemseitig wieder freigegeben.",
    rentpair_vorkasse:
      "Zahlungsbedingungen: Vorkasse \u00FCber unser Buchungssystem. Nach Annahme dieses Angebots erhalten Sie eine Buchungsbest\u00E4tigung " +
      "mit Zahlungslink (PayPal, Kredit-/Debitkarte oder \u00DCberweisung unter Angabe der Angebotsnummer). Die Zahlung ist vor Mietbeginn f\u00E4llig.",
  };
  const customPaymentText = data.paymentTerms === "custom" && data.paymentTermsCustom?.trim()
    ? `Zahlungsbedingungen: ${data.paymentTermsCustom.trim()}`
    : null;
  const paymentText = customPaymentText ?? ((data.paymentTerms && PAYMENT_TEXTS[data.paymentTerms])
    ? PAYMENT_TEXTS[data.paymentTerms]
    : (hasCreditLimit
        ? `Zahlungsbedingungen: Zahlung innerhalb von ${paymentDueDays} Tagen nach Rechnungsstellung (Kreditlimit: ${fm(data.profile.credit_limit)}).`
        : "Zahlungsbedingungen: Vorkasse. Der Rechnungsbetrag ist vor Mietbeginn zu entrichten."));

  if (data.paymentTerms === "vorkasse") {
    // Zahlungskasten mit Bankdaten – Stil identisch zum Rechnungs-Zahlungshinweis
    need(120);
    const boxH = 106;
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: CW, height: boxH, color: rgb(0.995, 0.97, 0.93) });
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: 3, height: boxH, color: ORANGE });
    let by = y - 2;
    dt(pg, "Zahlungshinweis \u2013 Vorkasse", ML + 16, by, bold, 10, INK); by -= 16;
    dt(pg, `Bitte \u00FCberweisen Sie ${fm(data.grossAmount)}${data.deposit && data.deposit > 0 ? ` (zzgl. Kaution ${fm(data.deposit)})` : ""} bis sp\u00E4testens ${fd(data.validUntil)}`, ML + 16, by, font, 9, INK); by -= 12;
    dt(pg, "\u2013 innerhalb der Angebotsg\u00FCltigkeit \u2013 auf folgendes Konto:", ML + 16, by, font, 9, INK); by -= 14;
    const rows: [string, string][] = [
      ["Kontoinhaber:", SLT_COMPANY.name],
      ["Bank:", SLT_COMPANY.bankName],
      ["IBAN / BIC:", `${SLT_COMPANY.iban} | ${SLT_COMPANY.bic}`],
      ["Verwendungszweck:", data.offerNumber],
    ];
    for (const [label, value] of rows) {
      dt(pg, label, ML + 16, by, font, 8.5, MUTED);
      dt(pg, value, ML + 120, by, bold, 8.5, INK);
      by -= 11;
    }
    by -= 2;
    dt(pg, "Mit Zahlungseingang ist Ihre Buchung verbindlich best\u00E4tigt; nach Mietende erhalten Sie die Rechnung per E-Mail.", ML + 16, by, font, 8, MUTED);
    y -= boxH + 12;
  } else {
    // Mehrzeiliger Hinweiskasten – Höhe wächst mit dem Text
    const bodyLines = wt(paymentText.replace("Zahlungsbedingungen: ", ""), font, 9, CW - 32);
    const boxH = 26 + bodyLines.length * 12;
    need(boxH + 16);
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: CW, height: boxH, color: rgb(0.995, 0.97, 0.93) });
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: 3, height: boxH, color: ORANGE });
    dt(pg, "Zahlungshinweis", ML + 16, y - 2, bold, 10, INK);
    bodyLines.forEach((ln, li) => dt(pg, ln, ML + 16, y - 18 - li * 12, font, 9, INK));
    y -= boxH + 12;
  }


  // ── Reverse-Charge-Hinweis ──
  if (data.isReverseCharge) {
    need(46);
    pg.drawRectangle({ x: ML, y: y - 30, width: CW, height: 36, color: rgb(0.94, 0.97, 0.98) });
    pg.drawRectangle({ x: ML, y: y - 30, width: 3, height: 36, color: BRAND });
    dt(pg, "Steuerschuldnerschaft des Leistungsempf\u00E4ngers", ML + 12, y - 6, bold, 9, INK);
    dt(pg, "Reverse-Charge-Verfahren gem. \u00A713b UStG \u2013 die Umsatzsteuer schuldet der Leistungsempf\u00E4nger.", ML + 12, y - 20, font, 8.5, INK);
    y -= 46;
  }

  // ── Gültigkeit ──
  need(40);
  dt(pg, "G\u00FCltigkeit:", ML, y, bold, 9);
  dt(pg, `Dieses Angebot ist g\u00FCltig bis zum ${fd(data.validUntil)} (${data.validDays} Tage).`, ML + 58, y, font, 9, INK);
  y -= 22;

  // ── Anmerkungen ──
  const visibleNotes = data.notes
    ? data.notes.replace(/\[DELIVERY:[^\]]*\]/g, "").replace(/\[DELADDR:[^\]]*\]/g, "").replace(/\[PAYMENT:[^\]]*\]/g, "").trim()
    : null;
  if (visibleNotes) {
    need(34);
    dt(pg, "Anmerkungen:", ML, y, bold, 9);
    y -= 12;
    for (const line of wt(visibleNotes, font, 8.5, CW)) {
      need(12); dt(pg, line, ML, y, font, 8.5, INK); y -= 11;
    }
    y -= 6;
  }

  // ── Grußformel ──
  need(56);
  dt(pg, "Wir freuen uns auf Ihre R\u00FCckmeldung und stehen Ihnen f\u00FCr R\u00FCckfragen gerne zur Verf\u00FCgung.", ML, y, font, 9); y -= 22;
  dt(pg, "Mit freundlichen Gr\u00FC\u00DFen", ML, y, font, 9); y -= 15;
  dt(pg, data.staffName || SLT_COMPANY.managingDirector, ML, y, bold, 9); y -= 11;
  dt(pg, SLT_COMPANY.brand, ML, y, font, 8, MUTED);

  // ── Footer auf allen Seiten (3-spaltig, identisch zur Rechnung) ──
  const total = doc.getPageCount();
  const colW = CW / 3;
  const footerCol1 = [SLT_COMPANY.name, `GF ${SLT_COMPANY.managingDirector}`, `${SLT_COMPANY.registry}`];
  const footerCol2 = [`${SLT_COMPANY.street} | ${SLT_COMPANY.city}`, `Tel: ${SLT_COMPANY.phone}`, `${SLT_COMPANY.email} | ${SLT_COMPANY.web}`];
  const footerCol3 = [`Steuer-Nr. ${SLT_COMPANY.steuerNr}`, `USt-IdNr. ${SLT_COMPANY.ustId}`, `${SLT_COMPANY.bankName} | IBAN ${SLT_COMPANY.iban}`];
  for (let i = 0; i < total; i++) {
    const p = doc.getPage(i);
    p.drawRectangle({ x: ML, y: MB + 42, width: CW, height: 0.5, color: LINE });
    const drawCol = (lines: string[], x: number) => {
      lines.forEach((ln, li) => {
        try { p.drawText(safe(ln), { x, y: MB + 32 - li * 9, size: 6.8, font, color: MUTED }); } catch {}
      });
    };
    drawCol(footerCol1, ML);
    drawCol(footerCol2, ML + colW);
    drawCol(footerCol3, ML + 2 * colW);
    if (total > 1) {
      try {
        const t = `Seite ${i + 1} von ${total}`;
        const tw = font.widthOfTextAtSize(t, 7.5);
        p.drawText(t, { x: W - MR - tw, y: MB + 55, size: 7.5, font, color: MUTED });
      } catch {}
    }
  }

  return await doc.save();
}
