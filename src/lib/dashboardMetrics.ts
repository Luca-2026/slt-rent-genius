/**
 * Kennzahlen für die Portal-Startseite. Rein und testbar.
 *
 * Umsatz = fakturierter Nettoumsatz nach Rechnungsdatum:
 *  - Rechnungen aus Mietanfragen (inkl. stornierter) + Gutschriften (negativ)
 *    → eine stornierte Rechnung und ihre Gutschrift heben sich auf.
 *  - Portalbelege mit Belegart ebenfalls inkl. stornierter Rechnung + Gutschrift.
 *    Alte Portalstornos ohne Belegart bleiben ausgeschlossen.
 */

export interface InquiryInvoiceRow {
  invoice_kind: string | null;
  status: string;
  invoice_date: string | null;
  net_amount: number | null;
  gross_amount: number | null;
  paid_amount?: number | null;
  credited_amount?: number | null;
  due_date?: string | null;
}

export interface PortalInvoiceRow {
  invoice_kind?: string | null;
  status: string;
  invoice_date: string | null;
  net_amount: number | null;
  gross_amount: number | null;
  due_date?: string | null;
}

import { effectiveEnd } from "@/lib/calendarEntries";

export interface PipelineInquiryRow {
  status: string;
  offer_total_gross: number | null;
  order_confirmed_at?: string | null;
  end_date?: string | null;
  start_date?: string | null;
  end_time?: string | null;
  offer_payload?: unknown;
}

/** Mietende nach Berliner Datum/Uhrzeit; ohne Uhrzeit erst nach Ende des Tages. */
export function hasRentalEnded(row: PipelineInquiryRow, now: Date = new Date()): boolean {
  const end = effectiveEnd({ start_date: row.start_date, end_date: row.end_date ?? null, offer_payload: row.offer_payload });
  if (!end) return false;
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const part = (key: string) => parts.find((p) => p.type === key)?.value ?? "";
  const day = `${part("year")}-${part("month")}-${part("day")}`;
  const time = /^\d{2}:\d{2}/.test(row.end_time ?? "") ? row.end_time?.slice(0, 5) : null;
  return end < day || (end === day && !!time && time <= `${part("hour")}:${part("minute")}`);
}

/** Acceptance age is irrelevant; an ended rental belongs to closeout instead. */
export function isAwaitingOfferConfirmation(row: PipelineInquiryRow, now: Date = new Date()): boolean {
  return row.status === "accepted" && !row.order_confirmed_at && !hasRentalEnded(row, now);
}

/** Closeout only for real orders: confirmed, or accepted (awaiting confirmation). "done" without confirmation = closed request, never a to-do. */
export function needsRentalCloseout(row: PipelineInquiryRow, now: Date = new Date()): boolean {
  if (!hasRentalEnded(row, now)) return false;
  return !!row.order_confirmed_at || row.status === "accepted";
}

export function rentalCloseoutTasks(state: { deliverySigned: boolean; returnSigned: boolean; invoiced: boolean }): string[] {
  return [!state.deliverySigned && "Übergabeprotokoll fehlt", !state.returnSigned && "Rückgabe klären · Rückgabeprotokoll fehlt", !state.invoiced && "Schlussrechnung fehlt"].filter((v): v is string => typeof v === "string");
}

const n = (v: number | null | undefined) => (typeof v === "number" && isFinite(v) ? v : Number(v) || 0);
const round2 = (v: number) => Math.round(v * 100) / 100;

/** YYYY-MM-DD in lokaler Zeit. */
export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function periodStarts(today: Date) {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weekday = (t.getDay() + 6) % 7; // Montag = 0
  const week = new Date(t);
  week.setDate(t.getDate() - weekday);
  return {
    day: isoDay(t),
    week: isoDay(week),
    month: isoDay(new Date(t.getFullYear(), t.getMonth(), 1)),
    year: isoDay(new Date(t.getFullYear(), 0, 1)),
  };
}

export function countsAsRevenue(row: InquiryInvoiceRow | PortalInvoiceRow, portal: boolean): boolean {
  if (!row.invoice_date || row.status === "draft") return false;
  if (portal && row.status === "cancelled" && !row.invoice_kind) return false;
  return true;
}

export interface RevenueSummary {
  day: number;
  week: number;
  month: number;
  year: number;
}

export function revenueSummary(
  inquiry: InquiryInvoiceRow[],
  portal: PortalInvoiceRow[],
  today: Date,
): RevenueSummary {
  const p = periodStarts(today);
  const end = p.day;
  const sum = { day: 0, week: 0, month: 0, year: 0 };
  const add = (date: string, net: number) => {
    const d = date.slice(0, 10);
    if (d > end) return;
    if (d >= p.year) sum.year += net;
    if (d >= p.month) sum.month += net;
    if (d >= p.week) sum.week += net;
    if (d === p.day) sum.day += net;
  };
  for (const r of inquiry) if (r.invoice_date && countsAsRevenue(r, false)) add(r.invoice_date, n(r.net_amount));
  for (const r of portal) if (r.invoice_date && countsAsRevenue(r, true)) add(r.invoice_date, n(r.net_amount));
  return { day: round2(sum.day), week: round2(sum.week), month: round2(sum.month), year: round2(sum.year) };
}

export interface ReceivablesSummary {
  open: number;
  overdue: number;
  overdueCount: number;
}

/** Offene Forderungen (brutto) = Rechnungsbetrag − Zahlungen − Gutschriften. */
export function receivables(inquiry: InquiryInvoiceRow[], portal: PortalInvoiceRow[], today: Date): ReceivablesSummary {
  const t = isoDay(today);
  let open = 0, overdue = 0, overdueCount = 0;
  const handle = (rest: number, status: string, due: string | null | undefined) => {
    if (rest <= 0.005) return;
    open += rest;
    if (status === "overdue" || (due && due.slice(0, 10) < t)) { overdue += rest; overdueCount++; }
  };
  for (const r of inquiry) {
    if (!["invoice", "installment", "final"].includes(r.invoice_kind ?? "invoice")) continue;
    if (r.status !== "open" && r.status !== "overdue") continue;
    handle(n(r.gross_amount) - n(r.paid_amount) - n(r.credited_amount), r.status, r.due_date);
  }
  for (const r of portal) {
    if (r.status !== "open" && r.status !== "overdue" && r.status !== "sent") continue;
    handle(n(r.gross_amount), r.status, r.due_date);
  }
  return { open: round2(open), overdue: round2(overdue), overdueCount };
}

export interface PipelineSummary {
  offered: number;
  offeredCount: number;
  accepted: number;
  acceptedCount: number;
}

/** Pipeline (brutto, laut Angebot): gesendete Angebote und angenommene, noch nicht abgerechnete Aufträge. */
export function pipeline(rows: PipelineInquiryRow[]): PipelineSummary {
  const s = { offered: 0, offeredCount: 0, accepted: 0, acceptedCount: 0 };
  for (const r of rows) {
    if (r.status === "offer_sent") { s.offered += n(r.offer_total_gross); s.offeredCount++; }
    else if (r.status === "accepted") { s.accepted += n(r.offer_total_gross); s.acceptedCount++; }
  }
  return { ...s, offered: round2(s.offered), accepted: round2(s.accepted) };
}

export const formatEuro = (v: number) =>
  v.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
