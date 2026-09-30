// PDF für Übergabe- und Rückgabeprotokolle zu Mietaufträgen.
// Layout angelehnt an Angebot/Auftragsbestätigung (DIN-A4, Logo rechts, Markenblau).
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "https://esm.sh/pdf-lib@1.17.1";
import { SLT_COMPANY } from "../_shared/offer-company.ts";

export interface ProtocolPdfPhoto { bytes: Uint8Array; takenAt: string; caption: string | null; damageNo: number | null }
export interface ProtocolPdfDamage {
  no: number; itemName: string | null; category: string; description: string | null; amount: number | null;
  needsRepair: boolean; reducesStock: boolean; quantity: number; photoNos: number[];
}
export interface ProtocolPdfData {
  kind: "delivery" | "return";
  number: string;
  createdAt: Date;
  customer: { company: string | null; name: string | null; street: string | null; postalCity: string | null; email: string | null; phone: string | null };
  order: { confirmationNumber: string | null; offerNumber: string | null; location: string; locationAddress: string; start: string | null; end: string | null; deliveryAddress: string | null; deliveryNoteNumber: string | null };
  items: { name: string; quantity: number; detail: string | null }[];
  condition: { readings?: { item_name: string; operating_hours: string; fuel_level: string }[]; operatingHours: string | null; fuelLevel: string | null; cleanliness: number | null; knownDefects: string | null; notes: string | null; allReturned: boolean | null; missingNotes: string | null };
  idCheck: { checked: boolean; type: string | null };
  confirmations: { instructed?: boolean; agb: boolean; items: boolean; customerNotPresent: boolean };
  damages: ProtocolPdfDamage[];
  photos: ProtocolPdfPhoto[];
  signatures: { customer: Uint8Array | null; customerName: string | null; staff: Uint8Array | null; staffName: string };
}

const W = 595.28, H = 841.89, ML = 50, MR = 50, MB = 62;
const CW = W - ML - MR;
const BRAND = rgb(0, 80 / 255, 125 / 255);
const ORANGE = rgb(1, 142 / 255, 2 / 255);
const INK = rgb(0.13, 0.13, 0.15);
const MUTED = rgb(0.45, 0.47, 0.52);
const LINE = rgb(0.82, 0.84, 0.87);
const SOFT = rgb(0.955, 0.965, 0.975);
const RED = rgb(0.72, 0.11, 0.11);

const FUEL: Record<string, string> = { voll: "Voll (100 %)", dreiviertel: "3/4 (75 %)", halb: "1/2 (50 %)", viertel: "1/4 (25 %)", leer: "Leer" };
const ID_TYPES: Record<string, string> = { personalausweis: "Personalausweis", reisepass: "Reisepass", fuehrerschein: "F\u00FChrerschein", sonstiges: "Sonstiges Ausweisdokument" };
const CATS: Record<string, string> = {
  kratzer: "Kratzer", delle: "Delle", schlag: "Schlag / Bruch", lack: "Lack", glas: "Glas / Scheibe", reifen: "Reifen / Fahrwerk",
  verschmutzung: "Verschmutzung", technischer_defekt: "Technischer Defekt", fehlendes_zubehoer: "Fehlendes Zubeh\u00F6r", sonstiges: "Sonstiges",
};

export const safe = (s: unknown) =>
  String(s ?? "")
    .replace(/[\u2010-\u2015]/g, "-").replace(/[\u2018\u2019\u201A]/g, "'").replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\u2026/g, "...").replace(/\u00A0/g, " ").replace(/\u00D7/g, "x")
    .replace(/[^\x20-\x7E\xA0-\xFF\u20AC]/g, "");

export function berlin(d: Date | string): string {
  const x = new Date(d);
  const date = x.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" });
  const time = x.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });
  return `${date}, ${time} Uhr`;
}
const fmtDay = (v: string | null) => {
  if (!v) return "-";
  const [d, t] = v.split(" ");
  const p = d.split("-");
  const s = p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d;
  return t ? `${s}, ${t.slice(0, 5)} Uhr` : s;
};
const euro = (n: number) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u20AC";

export async function renderProtocolPdf(data: ProtocolPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const isReturn = data.kind === "return";
  const TITLE = isReturn ? "R\u00DCCKGABEPROTOKOLL" : "\u00DCBERGABEPROTOKOLL";
  doc.setTitle(`${isReturn ? "R\u00FCckgabeprotokoll" : "\u00DCbergabeprotokoll"} ${data.number}`);
  doc.setAuthor(SLT_COMPANY.name);

  let logo: PDFImage | null = null;
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 3000);
    const r = await fetch("https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png", { signal: ctrl.signal });
    clearTimeout(to);
    if (r.ok) logo = await doc.embedPng(new Uint8Array(await r.arrayBuffer()));
  } catch { /* ohne Logo weiter */ }

  const photoImgs: (PDFImage | null)[] = [];
  for (const p of data.photos) {
    try { photoImgs.push(await doc.embedJpg(p.bytes)); } catch {
      try { photoImgs.push(await doc.embedPng(p.bytes)); } catch { photoImgs.push(null); }
    }
  }
  const embedSig = async (b: Uint8Array | null) => { if (!b) return null; try { return await doc.embedPng(b); } catch { return null; } };
  const sigCustomer = await embedSig(data.signatures.customer);
  const sigStaff = await embedSig(data.signatures.staff);

  const pages: PDFPage[] = [];
  let page!: PDFPage;
  let y = 0;

  const text = (t: string, x: number, yy: number, f: PDFFont = font, s = 9.5, c = INK) => {
    try { page.drawText(safe(t), { x, y: yy, size: s, font: f, color: c }); } catch { /* Zeichen nicht darstellbar */ }
  };
  const wrap = (t: string, f: PDFFont, s: number, mw: number): string[] => {
    const out: string[] = [];
    for (const para of safe(t).split(/\n/)) {
      let cur = "";
      for (const w of para.split(/\s+/)) {
        const test = cur ? `${cur} ${w}` : w;
        if (f.widthOfTextAtSize(test, s) <= mw) cur = test;
        else { if (cur) out.push(cur); cur = w; }
      }
      out.push(cur);
    }
    return out.length ? out : [""];
  };

  const newPage = (first = false) => {
    page = doc.addPage([W, H]);
    pages.push(page);
    if (!first) {
      // Folgeseiten: schmale Kopfzeile
      text(`${TITLE} ${data.number}`, ML, H - 40, bold, 9, BRAND);
      page.drawRectangle({ x: ML, y: H - 48, width: CW, height: 0.6, color: LINE });
      y = H - 70;
    }
  };
  const ensure = (need: number) => { if (y - need < MB) newPage(); };

  const section = (title: string) => {
    ensure(40);
    y -= 8;
    page.drawRectangle({ x: ML, y: y - 4, width: 3, height: 14, color: ORANGE });
    text(title, ML + 10, y, bold, 11, BRAND);
    y -= 20;
  };
  const kv = (label: string, value: string, opts: { color?: typeof INK; labelW?: number } = {}) => {
    const lw = opts.labelW ?? 150;
    const lines = wrap(value || "-", font, 9.5, CW - lw);
    ensure(lines.length * 12 + 4);
    text(label, ML, y, font, 9, MUTED);
    lines.forEach((ln, i) => text(ln, ML + lw, y - i * 12, font, 9.5, opts.color ?? INK));
    y -= lines.length * 12 + 4;
  };
  const para = (t: string, s = 9.5, c = INK) => {
    const lines = wrap(t, font, s, CW);
    for (const ln of lines) { ensure(s + 4); text(ln, ML, y, font, s, c); y -= s + 3.5; }
  };

  // ── Seite 1: Kopf ──
  newPage(true);
  text(`${SLT_COMPANY.name} \u00B7 ${SLT_COMPANY.street} \u00B7 ${SLT_COMPANY.city}`, ML, H - 62, font, 7, MUTED);
  page.drawRectangle({ x: ML, y: H - 66, width: 230, height: 0.4, color: LINE });
  if (logo) {
    const LOGO_BOX = { left: 0.1474, top: 0.3536, right: 0.8516, bottom: 0.6318 };
    const visibleW = 140;
    const fullW = visibleW / (LOGO_BOX.right - LOGO_BOX.left);
    const fullH = (logo.height / logo.width) * fullW;
    const topY = H - 40;
    page.drawImage(logo, { x: W - MR - LOGO_BOX.right * fullW, y: topY + LOGO_BOX.top * fullH - fullH, width: fullW, height: fullH });
  }
  // Kundenanschrift links
  let ay = H - 84;
  const c = data.customer;
  if (c.company) { text(c.company, ML, ay, bold, 10.5); ay -= 13; }
  if (c.name) { text(c.name, ML, ay, c.company ? font : bold, c.company ? 9.5 : 10.5); ay -= 12; }
  if (c.street) { text(c.street, ML, ay); ay -= 12; }
  if (c.postalCity) { text(c.postalCity, ML, ay); ay -= 12; }
  if (c.email) { text(c.email, ML, ay, font, 8.5, MUTED); ay -= 11; }
  if (c.phone) { text(c.phone, ML, ay, font, 8.5, MUTED); ay -= 11; }
  // Infoblock rechts
  const ix = W - MR - 210;
  let iy = H - 118;
  const info = (l: string, v: string, col = INK) => { text(l, ix, iy, font, 8.5, MUTED); text(v, ix + 88, iy, font, 9, col); iy -= 13; };
  info("Protokoll-Nr.:", data.number, BRAND);
  info("Erstellt am:", berlin(data.createdAt));
  if (data.order.confirmationNumber) info("Auftragsbest.:", data.order.confirmationNumber);
  if (data.order.offerNumber) info("Angebot:", data.order.offerNumber);
  if (isReturn && data.order.deliveryNoteNumber) info("\u00DCbergabe:", data.order.deliveryNoteNumber);
  info("Standort:", data.order.location);
  y = Math.min(ay, iy) - 22;
  text(TITLE, ML, y, bold, 22, BRAND);
  y -= 18;
  text(`Nr. ${data.number}`, ML, y, font, 10, MUTED);
  y -= 22;

  // ── Mietauftrag ──
  section("Mietauftrag");
  kv("Mietzeitraum", `${fmtDay(data.order.start)} - ${fmtDay(data.order.end)}`);
  kv(isReturn ? "Zeitpunkt der R\u00FCckgabe" : "Zeitpunkt der \u00DCbergabe", berlin(data.createdAt));
  kv("Standort", `${data.order.location}, ${data.order.locationAddress}`);
  if (data.order.deliveryAddress) kv("Lieferadresse", data.order.deliveryAddress);

  // ── Artikel ──
  section(isReturn ? "Zur\u00FCckgenommene Artikel" : "\u00DCbergebene Artikel");
  ensure(22);
  page.drawRectangle({ x: ML, y: y - 5, width: CW, height: 17, color: BRAND });
  text("Pos.", ML + 6, y, bold, 8.5, rgb(1, 1, 1));
  text("Artikel", ML + 40, y, bold, 8.5, rgb(1, 1, 1));
  text("Menge", ML + CW - 50, y, bold, 8.5, rgb(1, 1, 1));
  y -= 18;
  data.items.forEach((it, i) => {
    const lines = wrap(it.name, font, 9.5, CW - 110);
    const detail = it.detail ? wrap(it.detail, font, 8, CW - 110) : [];
    const h = lines.length * 12 + detail.length * 10 + 6;
    ensure(h);
    if (i % 2 === 0) page.drawRectangle({ x: ML, y: y - h + 11, width: CW, height: h, color: SOFT });
    text(String(i + 1), ML + 6, y);
    lines.forEach((ln, k) => text(ln, ML + 40, y - k * 12));
    detail.forEach((ln, k) => text(ln, ML + 40, y - lines.length * 12 - k * 10, font, 8, MUTED));
    text(`${it.quantity} x`, ML + CW - 50, y, bold);
    y -= h;
  });
  if (isReturn && data.condition.allReturned !== null) {
    y -= 4;
    kv("Vollst\u00E4ndig zur\u00FCck", data.condition.allReturned ? "Ja" : "Nein", { color: data.condition.allReturned ? INK : RED });
    if (!data.condition.allReturned && data.condition.missingNotes) kv("Fehlende Artikel", data.condition.missingNotes, { color: RED });
  }

  // ── Zustand ──
  section("Zustand");
  const rd = data.condition.readings ?? [];
  if (rd.length) {
    for (const m of rd) kv(m.item_name.length > 34 ? m.item_name.slice(0, 33) + "\u2026" : m.item_name, `Betriebsstunden ${m.operating_hours} h \u00B7 Tank ${FUEL[m.fuel_level] ?? (m.fuel_level === "kein_tank" ? "Elektro / kein Tank" : m.fuel_level)}`);
  } else {
    if (data.condition.operatingHours) kv("Betriebsstunden", data.condition.operatingHours);
    if (data.condition.fuelLevel) kv("Tankf\u00FCllstand", FUEL[data.condition.fuelLevel] ?? data.condition.fuelLevel);
  }
  if (data.condition.cleanliness) kv("Sauberkeit", `${data.condition.cleanliness} von 5 (1 = sehr verschmutzt, 5 = sauber)`);
  kv(isReturn ? "Zustand / M\u00E4ngel" : "Bekannte M\u00E4ngel", data.condition.knownDefects || "Keine angegeben");
  if (data.condition.notes) kv("Anmerkungen", data.condition.notes);
  kv("Ausweisabgleich", data.confirmations.customerNotPresent
    ? "Nicht m\u00F6glich - Kunde nicht anwesend"
    : data.idCheck.checked ? `Erfolgt${data.idCheck.type ? ` (${ID_TYPES[data.idCheck.type] ?? data.idCheck.type})` : ""}, keine Kopie gespeichert` : "Nicht erfolgt");

  // ── Schäden ──
  section(`Sch\u00E4den (${data.damages.length})`);
  if (!data.damages.length) {
    para(isReturn ? "Bei der R\u00FCckgabe wurden keine Sch\u00E4den festgestellt." : "Bei der \u00DCbergabe wurden keine Sch\u00E4den festgestellt.", 9.5, MUTED);
  }
  for (const d of data.damages) {
    const desc = wrap(d.description || "-", font, 9.5, CW - 24);
    const flags = [d.needsRepair ? "Reparatur n\u00F6tig" : "", d.reducesStock ? `Bestand -${d.quantity}` : "", d.amount ? `Betrag ${euro(d.amount)}` : ""].filter(Boolean).join(" \u00B7 ");
    const photoLine = d.photoNos.length ? `Fotos: ${d.photoNos.map((n) => `Nr. ${n}`).join(", ")} (siehe Fotodokumentation)` : "";
    const thumbs = d.photoNos.map((n) => photoImgs[n - 1]).filter(Boolean) as PDFImage[];
    const TH = 64;
    const h = 16 + desc.length * 12 + (flags ? 12 : 0) + (photoLine ? 12 : 0) + (thumbs.length ? TH + 8 : 0) + 8;
    ensure(h);
    page.drawRectangle({ x: ML, y: y - h + 12, width: CW, height: h, borderColor: LINE, borderWidth: 0.8, color: rgb(1, 0.985, 0.97) });
    text(`Schaden ${d.no}: ${CATS[d.category] ?? d.category}${d.itemName ? ` - ${d.itemName}` : ""}`, ML + 10, y, bold, 9.5, RED);
    let yy = y - 14;
    desc.forEach((ln) => { text(ln, ML + 10, yy); yy -= 12; });
    if (flags) { text(flags, ML + 10, yy, font, 8.5, MUTED); yy -= 12; }
    if (photoLine) { text(photoLine, ML + 10, yy, font, 8.5, BRAND); yy -= 12; }
    let tx = ML + 10;
    for (const img of thumbs) {
      const sc = TH / img.height;
      const w = Math.min(img.width * sc, 110);
      const hh = (w / img.width) * img.height;
      if (tx + w > ML + CW - 10) break;
      page.drawImage(img, { x: tx, y: yy - TH + 4 + (TH - hh) / 2, width: w, height: hh });
      tx += w + 8;
    }
    y -= h + 6;
  }

  // ── Bestätigung & Unterschriften (bleiben zusammen auf einer Seite) ──
  ensure(232);
  section("Best\u00E4tigung und Unterschriften");
  if (data.confirmations.customerNotPresent) {
    para(`Der Kunde war bei der ${isReturn ? "R\u00FCckgabe" : "\u00DCbergabe"} nicht anwesend. Das Protokoll wurde vom Mitarbeiter allein erstellt.`, 9.5, RED);
  } else {
    if (!isReturn) para(`${data.confirmations.agb ? "[x]" : "[ ]"} Der Mieter hat die Allgemeinen Gesch\u00E4ftsbedingungen und die Auftragsbest\u00E4tigung erhalten und zur Kenntnis genommen.`);
    if (!isReturn && rd.length) para(`${data.confirmations.instructed ? "[x]" : "[ ]"} Der Mieter wurde in Bedienung, Betankung und sichere Handhabung der Maschinen eingewiesen.`);
    para(`${data.confirmations.items ? "[x]" : "[ ]"} ${isReturn
      ? "Der Mieter best\u00E4tigt die R\u00FCckgabe der Mietgegenst\u00E4nde sowie die Richtigkeit der erfassten Betriebsstunden, Tankf\u00FCllst\u00E4nde, der Sauberkeit und der dokumentierten Sch\u00E4den."
      : "Der Mieter best\u00E4tigt, die oben aufgef\u00FChrten Mietgegenst\u00E4nde vollst\u00E4ndig, funktionsf\u00E4hig und in einwandfreiem, betriebssicherem Zustand \u00FCbernommen zu haben - mit Ausnahme der in diesem Protokoll dokumentierten Sch\u00E4den und M\u00E4ngel. Die erfassten Betriebsstunden, Tankf\u00FCllst\u00E4nde und die Sauberkeit sind zutreffend."}`);
  }
  y -= 6;
  ensure(120);
  const boxW = (CW - 20) / 2;
  const sigBox = (x: number, title: string, img: PDFImage | null, name: string | null, empty: string) => {
    page.drawRectangle({ x, y: y - 95, width: boxW, height: 95, borderColor: LINE, borderWidth: 0.8 });
    text(title, x + 8, y - 12, bold, 8.5, MUTED);
    if (img) {
      const maxW = boxW - 20, maxH = 50;
      const sc = Math.min(maxW / img.width, maxH / img.height);
      page.drawImage(img, { x: x + 10, y: y - 70, width: img.width * sc, height: img.height * sc });
    } else {
      text(empty, x + 10, y - 50, font, 8.5, MUTED);
    }
    page.drawRectangle({ x: x + 8, y: y - 76, width: boxW - 16, height: 0.5, color: LINE });
    text(`${name || "-"} \u00B7 ${berlin(data.createdAt)}`, x + 8, y - 88, font, 8, INK);
  };
  sigBox(ML, "Kunde", sigCustomer, data.signatures.customerName, data.confirmations.customerNotPresent ? "Kunde nicht anwesend" : "Keine Unterschrift");
  sigBox(ML + boxW + 20, `Mitarbeiter ${SLT_COMPANY.brand}`, sigStaff, data.signatures.staffName, "Keine Unterschrift");
  y -= 110;

  // ── Fotodokumentation ──
  if (data.photos.length) {
    newPage();
    section(`Fotodokumentation (${data.photos.length} ${data.photos.length === 1 ? "Foto" : "Fotos"})`);
    const cols = 3, gap = 10;
    const cellW = (CW - gap * (cols - 1)) / cols;
    const imgH = cellW * 0.75;
    const cellH = imgH + 34;
    for (let i = 0; i < data.photos.length; i++) {
      const col = i % cols;
      if (col === 0) ensure(cellH + 4);
      const x = ML + col * (cellW + gap);
      const p = data.photos[i];
      const img = photoImgs[i];
      page.drawRectangle({ x, y: y - imgH, width: cellW, height: imgH, color: SOFT, borderColor: LINE, borderWidth: 0.6 });
      if (img) {
        const sc = Math.min(cellW / img.width, imgH / img.height);
        const w = img.width * sc, h = img.height * sc;
        page.drawImage(img, { x: x + (cellW - w) / 2, y: y - imgH + (imgH - h) / 2, width: w, height: h });
      } else {
        text("Foto nicht darstellbar", x + 8, y - imgH / 2, font, 8, MUTED);
      }
      const label = `Nr. ${i + 1}${p.damageNo ? ` \u00B7 Schaden ${p.damageNo}` : ""}`;
      text(label, x, y - imgH - 11, bold, 8, p.damageNo ? RED : BRAND);
      text(berlin(p.takenAt), x, y - imgH - 21, font, 7.5, MUTED);
      if (p.caption) text(wrap(p.caption, font, 7.5, cellW)[0], x, y - imgH - 30, font, 7.5, INK);
      if (col === cols - 1 || i === data.photos.length - 1) y -= cellH + 6;
    }
    para("Zeitstempel = Aufnahmezeitpunkt laut Kamera, sonst Zeitpunkt des Hochladens.", 7.5, MUTED);
  }

  // ── Fußzeile auf jeder Seite ──
  const total = pages.length;
  pages.forEach((pg, idx) => {
    page = pg;
    pg.drawRectangle({ x: ML, y: 44, width: CW, height: 0.5, color: LINE });
    text(`${SLT_COMPANY.name} \u00B7 ${SLT_COMPANY.street}, ${SLT_COMPANY.city} \u00B7 ${SLT_COMPANY.phone} \u00B7 ${SLT_COMPANY.email}`, ML, 32, font, 7, MUTED);
    text(`${SLT_COMPANY.registry} \u00B7 USt-IdNr. ${SLT_COMPANY.ustId}`, ML, 22, font, 7, MUTED);
    const pgTxt = `Seite ${idx + 1} von ${total}`;
    text(pgTxt, W - MR - font.widthOfTextAtSize(pgTxt, 7.5), 32, font, 7.5, MUTED);
  });

  return await doc.save();
}
