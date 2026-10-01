/**
 * Abschlags- und Schlussrechnungen, getrennte Rechnungskreise.
 * Rein und abhängigkeitsfrei – getestet aus der Frontend-Testsuite,
 * genutzt von Edge Functions und Portal.
 */

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Rechnungskreis je Geschäftsart: Miete → RE-M-…, Verkauf → RE-V-… */
export function invoiceSeries(inquiryType: "rental" | "sales"): "M" | "V" {
  return inquiryType === "sales" ? "V" : "M";
}

/** Datum (YYYY-MM-DD) um n Monate verschieben; Monatsende wird gekappt (31.01. + 1 → 28./29.02.). */
export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Vorgeschlagener Leistungszeitraum eines Abschlags: Beginn bis Tag vor Beginn + Intervall. */
export function installmentPeriod(start: string, intervalMonths = 1): { start: string; end: string } {
  return { start: start.slice(0, 10), end: addDays(addMonths(start, Math.max(1, intervalMonths)), -1) };
}

export interface InstallmentInvoiceRow {
  id?: string;
  invoice_number: string | null;
  invoice_kind: string | null;
  invoice_date: string | null;
  status: string;
  net_amount: number | null;
  vat_amount: number | null;
  gross_amount: number | null;
  credited_amount?: number | null;
  installment_number?: number | null;
}

export interface InstallmentDeduction {
  invoice_id?: string;
  invoice_number: string;
  invoice_date: string | null;
  net: number;
  vat: number;
  gross: number;
}

/** Abschläge, die auf der Schlussrechnung abzuziehen sind (stornierte/gutgeschriebene Anteile nicht). */
export function installmentDeductions(rows: InstallmentInvoiceRow[]): InstallmentDeduction[] {
  return rows
    .filter((r) => r.invoice_kind === "installment" && r.status !== "draft" && r.status !== "cancelled")
    .map((r) => {
      const gross = Number(r.gross_amount) || 0;
      const credited = Math.max(0, Number(r.credited_amount) || 0);
      const share = gross > 0 ? Math.max(0, gross - credited) / gross : 0;
      const net = round2((Number(r.net_amount) || 0) * share);
      const grossLeft = round2(gross * share);
      return {
        invoice_id: r.id,
        invoice_number: r.invoice_number ?? "",
        invoice_date: r.invoice_date,
        net,
        vat: round2(grossLeft - net),
        gross: grossLeft,
      };
    })
    .filter((d) => d.gross > 0.004)
    .sort((a, b) => (a.invoice_date ?? "").localeCompare(b.invoice_date ?? ""));
}

export function sumDeductions(list: InstallmentDeduction[]) {
  return {
    net: round2(list.reduce((s, d) => s + d.net, 0)),
    vat: round2(list.reduce((s, d) => s + d.vat, 0)),
    gross: round2(list.reduce((s, d) => s + d.gross, 0)),
  };
}

/** Nächste laufende Abschlagsnummer (stornierte zählen mit – Nummern werden nie wiederverwendet). */
export function nextInstallmentNumber(rows: InstallmentInvoiceRow[]): number {
  const nums = rows
    .filter((r) => r.invoice_kind === "installment")
    .map((r) => Number(r.installment_number) || 0);
  return (nums.length ? Math.max(...nums, nums.length) : 0) + 1;
}

/** Netto-Summe aller nicht stornierten Abschläge (für die Obergrenze bei befristeten Aufträgen). */
export function billedInstallmentNet(rows: InstallmentInvoiceRow[]): number {
  return sumDeductions(installmentDeductions(rows)).net;
}

/**
 * Prüft einen neuen Abschlag. Bei befristeten Aufträgen dürfen die Abschläge
 * zusammen den Auftragswert (netto) nicht übersteigen.
 */
export function validateInstallment(
  net: number,
  opts: { openEnded: boolean; orderNet: number | null; alreadyBilledNet: number },
): string | null {
  if (!Number.isFinite(net) || net <= 0) return "Der Abschlag muss größer als 0 € sein.";
  if (net > 1_000_000) return "Der Abschlag ist zu hoch.";
  if (!opts.openEnded && opts.orderNet != null && opts.orderNet > 0) {
    const rest = round2(opts.orderNet - opts.alreadyBilledNet);
    if (net - rest > 0.009) {
      return `Der Abschlag übersteigt den noch offenen Auftragswert (${rest.toFixed(2).replace(".", ",")} € netto).`;
    }
  }
  return null;
}

/** Netto-Betrag aus Prozent des Auftragswerts. */
export function percentOf(orderNet: number, percent: number): number {
  return round2((Number(orderNet) || 0) * (Number(percent) || 0) / 100);
}

/** Monatlicher Netto-Vorschlag aus den Angebotspositionen mit Einheit „Monat“ (inkl. Zusatzoptionen). */
export function monthlyNetFromOffer(items: Array<Record<string, unknown>> | null | undefined): number {
  if (!Array.isArray(items)) return 0;
  let sum = 0;
  for (const it of items) {
    const unit = String(it.unit ?? "").toLowerCase();
    if (!unit.startsWith("monat")) continue;
    const qty = Number(it.quantity) || 0;
    const price = Number(it.unit_price) || 0;
    const disc = Number(it.discount_percent) || 0;
    sum += qty * price * (1 - disc / 100);
    const addons = Array.isArray(it.addons) ? (it.addons as Array<Record<string, unknown>>) : [];
    for (const a of addons) sum += Number(a.amount) || 0;
  }
  return round2(sum);
}

export interface InstallmentPlanRow {
  id: string;
  installment_enabled: boolean | null;
  installment_next_due: string | null;
  status?: string | null;
}

/** Fällige Abschläge (Plan aktiv, Fälligkeit heute oder früher, Auftrag nicht abgelehnt). */
export function isInstallmentDue(row: InstallmentPlanRow, todayIso: string): boolean {
  if (!row.installment_enabled || !row.installment_next_due) return false;
  if (row.status === "rejected") return false;
  return row.installment_next_due.slice(0, 10) <= todayIso.slice(0, 10);
}

export const OPEN_ENDED_NOTE =
  "Unbefristete Monatsmiete: Die ausgewiesenen Mietpreise gelten jeweils pro Monat. " +
  "Ein Enddatum ist nicht vereinbart. Die Abrechnung erfolgt monatlich per Abschlagsrechnung; " +
  "nach Rückgabe erhalten Sie eine Schlussrechnung über die tatsächliche Mietdauer, in der alle Abschläge verrechnet werden.";

/** Hinweistext für die Schlussrechnung (§ 14 Abs. 5 UStG: Abschläge mit Entgelt und Steuer ausweisen). */
export function deductionNote(list: InstallmentDeduction[], fmtDate: (iso: string) => string): string {
  if (!list.length) return "";
  const money = (n: number) => n.toFixed(2).replace(".", ",") + " €";
  const lines = list.map(
    (d) =>
      `${d.invoice_number}${d.invoice_date ? ` vom ${fmtDate(d.invoice_date)}` : ""}: netto ${money(d.net)}, USt. ${money(d.vat)}, brutto ${money(d.gross)}`,
  );
  const s = sumDeductions(list);
  return [
    "Verrechnete Abschlagsrechnungen:",
    ...lines,
    `Summe der Abschläge: netto ${money(s.net)}, USt. ${money(s.vat)}, brutto ${money(s.gross)}.`,
  ].join("\n");
}
