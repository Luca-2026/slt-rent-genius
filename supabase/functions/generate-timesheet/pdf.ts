import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { SLT_COMPANY } from "../_shared/company.ts";

export interface TimesheetEntry {
  work_date: string; // YYYY-MM-DD
  start_time?: string | null; // HH:MM(:SS)
  end_time?: string | null;
  break_minutes?: number | null;
  note?: string | null;
  location?: string | null;
}

export interface TimesheetPdfData {
  staffName: string;
  staffEmail?: string | null;
  year: number;
  month: number; // 1-12
  entries: TimesheetEntry[];
  submittedAt?: string | null; // ISO
  confirmed?: boolean;
  /** Abrechnungszeitraum (21.–20.). Fehlt er, wird der Kalendermonat verwendet (Altnachweise). */
  periodStart?: string | null;
  periodEnd?: string | null;
}

export const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export const WEEKDAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export const LOCATION_LABELS: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

/** Minuten aus Beginn/Ende abzüglich Pause. Über-Mitternacht wird berücksichtigt. */
export function entryMinutes(e: TimesheetEntry): number {
  if (!e.start_time || !e.end_time) return 0;
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map((n) => parseInt(n, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
    return h * 60 + m;
  };
  const s = toMin(e.start_time);
  let en = toMin(e.end_time);
  if (Number.isNaN(s) || Number.isNaN(en)) return 0;
  if (en < s) en += 24 * 60; // Nachtschicht
  const net = en - s - Math.max(0, e.break_minutes ?? 0);
  return net > 0 ? net : 0;
}

/** "7:30 h" */
export function fmtHours(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${String(m).padStart(2, "0")} h`;
}

/** "7,50" (Dezimalstunden, deutsches Format) */
export function fmtDecimalHours(min: number): string {
  return (min / 60).toFixed(2).replace(".", ",");
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

const hm = (t?: string | null) => (t ? t.slice(0, 5) : "–");

export async function generateTimesheetPdf(data: TimesheetPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const W = 595.28, H = 841.89;
  const ML = 45, MR = 45;
  const CW = W - ML - MR;
  const BRAND = rgb(0 / 255, 80 / 255, 125 / 255);
  const INK = rgb(0.13, 0.13, 0.15);
  const MUTED = rgb(0.45, 0.47, 0.52);
  const LINE = rgb(0.82, 0.84, 0.87);
  const ZEBRA = rgb(0.972, 0.976, 0.982);
  const WEEKEND = rgb(0.94, 0.955, 0.97);

  let logoImg: any = null;
  try {
    const lr = await fetch(
      "https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png",
    );
    if (lr.ok) logoImg = await doc.embedPng(new Uint8Array(await lr.arrayBuffer()));
  } catch { /* Logo optional */ }

  const pages: any[] = [];
  const newPage = () => {
    const p = doc.addPage([W, H]);
    pages.push(p);
    return p;
  };
  const dt = (pg: any, t: string, x: number, y: number, f = font, s = 9, c = INK) => {
    try { pg.drawText(String(t ?? ""), { x, y, size: s, font: f, color: c }); } catch { /* noop */ }
  };
  const dtr = (pg: any, t: string, xRight: number, y: number, f = font, s = 9, c = INK) => {
    const tw = f.widthOfTextAtSize(String(t ?? ""), s);
    dt(pg, t, xRight - tw, y, f, s, c);
  };
  /** Text in mehrere Zeilen umbrechen (Wortgrenzen, harte Trennung bei langen Wörtern). */
  const wrap = (t: string, f: any, s: number, maxW: number, maxLines = 4): string[] => {
    const text = String(t ?? "").replace(/\s+/g, " ").trim();
    if (!text) return [];
    const lines: string[] = [];
    let line = "";
    const push = () => { if (line) { lines.push(line); line = ""; } };
    for (const word of text.split(" ")) {
      let w = word;
      // Sehr langes Einzelwort hart trennen
      while (f.widthOfTextAtSize(w, s) > maxW) {
        let cut = w;
        while (cut.length > 1 && f.widthOfTextAtSize(cut, s) > maxW) cut = cut.slice(0, -1);
        if (line) push();
        lines.push(cut);
        w = w.slice(cut.length);
        if (lines.length >= maxLines) return lines;
      }
      const candidate = line ? `${line} ${w}` : w;
      if (f.widthOfTextAtSize(candidate, s) <= maxW) {
        line = candidate;
      } else {
        push();
        line = w;
        if (lines.length >= maxLines) break;
      }
    }
    push();
    return lines.slice(0, maxLines);
  };
  const clip = (t: string, f: any, s: number, maxW: number) => {
    let out = String(t ?? "");
    if (f.widthOfTextAtSize(out, s) <= maxW) return out;
    while (out.length > 1 && f.widthOfTextAtSize(out + "…", s) > maxW) out = out.slice(0, -1);
    return out + "…";
  };

  // ── Spalten ──
  const cols = [
    { key: "date", label: "Datum", w: 118, align: "left" as const },
    { key: "start", label: "Beginn", w: 58, align: "right" as const },
    { key: "end", label: "Ende", w: 58, align: "right" as const },
    { key: "break", label: "Pause", w: 54, align: "right" as const },
    { key: "hours", label: "Stunden", w: 62, align: "right" as const },
    { key: "note", label: "Tätigkeit / Notiz", w: CW - 118 - 58 - 58 - 54 - 62, align: "left" as const },
  ];
  const colX: number[] = [];
  let acc = ML;
  for (const c of cols) { colX.push(acc); acc += c.w; }

  const ROW_H = 16.5;

  let page = newPage();
  let y = H - 45;

  // Kopf: Logo rechts
  if (logoImg) {
    const lw = 150;
    const lh = (logoImg.height / logoImg.width) * lw;
    page.drawImage(logoImg, { x: W - MR - lw, y: y - lh + 8, width: lw, height: lh });
  }

  dt(page, "Arbeitszeitnachweis", ML, y - 12, bold, 22, BRAND);
  page.drawRectangle({ x: ML, y: y - 22, width: 170, height: 2.2, color: BRAND });
  y -= 46;

  // Zeitraum: 21.–20. (neu) oder Kalendermonat (Altnachweise)
  const deDate = (iso: string) => { const [yy, mm, dd] = iso.split("-"); return `${dd}.${mm}.${yy}`; };
  const dim = daysInMonth(data.year, data.month);
  const rangeStart = data.periodStart ?? `${data.year}-${String(data.month).padStart(2, "0")}-01`;
  const rangeEnd = data.periodEnd ?? `${data.year}-${String(data.month).padStart(2, "0")}-${String(dim).padStart(2, "0")}`;

  dt(page, `Abrechnungszeitraum ${deDate(rangeStart)} – ${deDate(rangeEnd)}`, ML, y, bold, 13, INK);
  y -= 15;
  dt(page, `Lohnabrechnung ${MONTH_NAMES[data.month - 1]} ${data.year}`, ML, y, font, 9.5, MUTED);
  y -= 16;
  dt(page, `Mitarbeiter/in: ${data.staffName}`, ML, y, font, 10, INK);
  y -= 13;
  if (data.staffEmail) { dt(page, data.staffEmail, ML, y, font, 9, MUTED); y -= 13; }
  // Tabelle nie unter das Logo schieben – fester Mindestabstand vom Seitenkopf
  y = Math.min(y - 6, H - 150);

  const drawTableHead = (pg: any, yy: number) => {
    pg.drawRectangle({ x: ML, y: yy - 4, width: CW, height: ROW_H, color: BRAND });
    cols.forEach((c, i) => {
      const label = c.label;
      if (c.align === "right") dtr(pg, label, colX[i] + c.w - 6, yy + 1, bold, 8.5, rgb(1, 1, 1));
      else dt(pg, label, colX[i] + 6, yy + 1, bold, 8.5, rgb(1, 1, 1));
    });
    return yy - ROW_H;
  };

  y = drawTableHead(page, y);

  const byDate = new Map<string, TimesheetEntry>();
  for (const e of data.entries) byDate.set(e.work_date, e);

  let total = 0;
  let daysWorked = 0;

  const [sy, sm, sd] = rangeStart.split("-").map(Number);
  const [ey, em, ed] = rangeEnd.split("-").map(Number);
  const cursor = new Date(Date.UTC(sy, sm - 1, sd));
  const endDate = new Date(Date.UTC(ey, em - 1, ed));
  const NOTE_SIZE = 8;
  const LINE_H = 9.5;

  let rowIndex = 0;
  while (cursor <= endDate) {
    const d = cursor.getUTCDate();
    const mo = cursor.getUTCMonth() + 1;
    const yr = cursor.getUTCFullYear();
    const iso = `${yr}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dow = cursor.getUTCDay();
    const isWeekend = dow === 0 || dow === 6;
    const e = byDate.get(iso);
    const min = e ? entryMinutes(e) : 0;
    total += min;
    if (min > 0) daysWorked++;

    const noteParts = [
      e?.location ? (LOCATION_LABELS[String(e.location).toLowerCase()] ?? e.location) : "",
      e?.note ?? "",
    ].filter(Boolean).join(" · ");
    const noteLines = noteParts ? wrap(noteParts, font, NOTE_SIZE, cols[5].w - 12, 6) : [];
    const rowH = Math.max(ROW_H, noteLines.length * LINE_H + 7);

    if (y - rowH < 120) {
      page = newPage();
      y = H - 55;
      y = drawTableHead(page, y);
    }

    const rowTop = y + ROW_H - 4; // Oberkante der Zeile
    page.drawRectangle({
      x: ML, y: rowTop - rowH, width: CW, height: rowH,
      color: isWeekend ? WEEKEND : rowIndex % 2 === 0 ? ZEBRA : rgb(1, 1, 1),
    });

    const baseline = rowTop - 11;
    const dateLabel = `${WEEKDAY_SHORT[dow]}, ${String(d).padStart(2, "0")}.${String(mo).padStart(2, "0")}.${yr}`;
    dt(page, dateLabel, colX[0] + 6, baseline, isWeekend ? bold : font, 8.5, isWeekend ? MUTED : INK);
    dtr(page, hm(e?.start_time), colX[1] + cols[1].w - 6, baseline, font, 8.5, INK);
    dtr(page, hm(e?.end_time), colX[2] + cols[2].w - 6, baseline, font, 8.5, INK);
    dtr(page, e?.break_minutes ? `${e.break_minutes} min` : "–", colX[3] + cols[3].w - 6, baseline, font, 8.5, INK);
    dtr(page, min > 0 ? fmtHours(min) : "–", colX[4] + cols[4].w - 6, baseline, min > 0 ? bold : font, 8.5, INK);
    noteLines.forEach((ln, i) => {
      dt(page, ln, colX[5] + 6, baseline - i * LINE_H, font, NOTE_SIZE, MUTED);
    });

    page.drawRectangle({ x: ML, y: rowTop - rowH, width: CW, height: 0.4, color: LINE });
    y = rowTop - rowH - ROW_H + ROW_H; // neue Oberkante
    y = y - ROW_H + ROW_H;
    y = rowTop - rowH - (ROW_H - ROW_H);
    y = rowTop - rowH - 0;
    y = y - (ROW_H - ROW_H);
    y = rowTop - rowH - ROW_H + ROW_H - 0;
    y = rowTop - rowH - 0; // y zeigt weiterhin auf "Baseline-Offset"-Konvention
    y = y - ROW_H + ROW_H;
    y = rowTop - rowH - ROW_H + ROW_H;
    y = rowTop - rowH - (ROW_H - ROW_H) - 0;
    y = rowTop - rowH - 0;
    y = y; // ------------------------------------------------
    y = rowTop - rowH - ROW_H + ROW_H;
    y = rowTop - rowH - 0 - (ROW_H - ROW_H);
    y = rowTop - rowH + 4 - ROW_H; // zurück in die ursprüngliche y-Konvention (y = Textbasis der nächsten Zeile)
    rowIndex++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  // ── Summe ──
  if (y < 150) { page = newPage(); y = H - 60; }
  y -= 10;
  page.drawRectangle({ x: ML, y: y - 8, width: CW, height: 30, color: rgb(0.94, 0.965, 0.98) });
  dt(page, "Gesamt geleistete Arbeitszeit", ML + 8, y + 3, bold, 10.5, BRAND);
  dtr(page, `${fmtHours(total)}  (${fmtDecimalHours(total)} Std.)`, ML + CW - 8, y + 3, bold, 11.5, BRAND);
  y -= 34;
  dt(page, `Arbeitstage mit erfasster Zeit: ${daysWorked}`, ML, y, font, 9, MUTED);
  y -= 12;
  dt(
    page,
    `Durchschnitt je Arbeitstag: ${daysWorked ? fmtHours(Math.round(total / daysWorked)) : "–"}`,
    ML, y, font, 9, MUTED,
  );
  y -= 26;

  // ── Bestätigung / Unterschriften ──
  if (y < 78) { page = newPage(); y = H - 80; }
  if (data.confirmed) {
    const when = data.submittedAt
      ? new Date(data.submittedAt).toLocaleString("de-DE", {
          timeZone: "Europe/Berlin",
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      : "";
    dt(page, `Vom Mitarbeitenden digital bestätigt${when ? ` am ${when} Uhr` : ""}.`, ML, y, font, 9, INK);
    y -= 22;
  }
  const sigW = (CW - 40) / 2;
  page.drawRectangle({ x: ML, y: y, width: sigW, height: 0.6, color: LINE });
  page.drawRectangle({ x: ML + sigW + 40, y: y, width: sigW, height: 0.6, color: LINE });
  dt(page, "Datum, Unterschrift Mitarbeiter/in", ML, y - 11, font, 8, MUTED);
  dt(page, "Datum, Unterschrift Vorgesetzte/r", ML + sigW + 40, y - 11, font, 8, MUTED);

  // ── Fußzeile auf allen Seiten ──
  pages.forEach((pg, i) => {
    pg.drawRectangle({ x: ML, y: 46, width: CW, height: 0.5, color: LINE });
    dt(pg, `${SLT_COMPANY.name} · ${SLT_COMPANY.street} · ${SLT_COMPANY.city}`, ML, 34, font, 7.5, MUTED);
    dt(pg, `${SLT_COMPANY.phone} · ${SLT_COMPANY.email} · ${SLT_COMPANY.web}`, ML, 25, font, 7.5, MUTED);
    dtr(pg, `Seite ${i + 1} von ${pages.length}`, W - MR, 34, font, 7.5, MUTED);
  });

  return await doc.save();
}
