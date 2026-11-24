import { csvCell } from "@/lib/csvCell";

export type RevenueStage = "offered" | "accepted" | "invoiced";
export type RevenuePeriod = "day" | "week" | "month" | "quarter" | "year" | "custom";
export type RevenueBusiness = "all" | "rental" | "sales";
export const REVENUE_STAGES: { value: RevenueStage; label: string }[] = [
  { value: "offered", label: "Versendete Angebote" },
  { value: "accepted", label: "Angenommene Angebote" },
  { value: "invoiced", label: "Fakturierter Umsatz" },
];
export const REVENUE_PERIODS: { value: RevenuePeriod; label: string }[] = [
  { value: "day", label: "Tag" }, { value: "week", label: "Woche" },
  { value: "month", label: "Monat" }, { value: "quarter", label: "Quartal" },
  { value: "year", label: "Jahr" }, { value: "custom", label: "Eigener Zeitraum" },
];
export const revenueMoney = (value: number) => value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
export const revenueLocationLabel = (value: string | null) => value === "bonn" ? "Bonn" : value === "krefeld" ? "Krefeld einschließlich Mülheim an der Ruhr" : "Nicht zugeordnet / prüfen";
export function revenueBranch(value?: string | null): string | null {
  const location = value?.toLowerCase() ?? "";
  if (location.includes("bonn")) return "bonn";
  if (/krefeld|mülheim|muelheim/.test(location)) return "krefeld";
  return null;
}
export function canViewRevenue(admin: boolean, branchManager: boolean, active: boolean, location?: string | null): boolean {
  return admin || (branchManager && active && revenueBranch(location) !== null);
}
export const berlinDay = (now = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
const dateOf = (iso: string) => new Date(`${iso}T12:00:00Z`);
const isoOf = (date: Date) => date.toISOString().slice(0, 10);
export function revenueRange(period: RevenuePeriod, anchor: string, today = berlinDay()): { from: string; to: string } {
  const d = dateOf(anchor);
  const y = d.getUTCFullYear(), m = d.getUTCMonth();
  let from = anchor, end = anchor;
  if (period === "week") {
    d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
    from = isoOf(d); d.setUTCDate(d.getUTCDate() + 6); end = isoOf(d);
  } else if (["month", "quarter", "year"].includes(period)) {
    const startMonth = period === "year" ? 0 : period === "quarter" ? Math.floor(m / 3) * 3 : m;
    const months = period === "year" ? 12 : period === "quarter" ? 3 : 1;
    from = isoOf(new Date(Date.UTC(y, startMonth, 1)));
    end = isoOf(new Date(Date.UTC(y, startMonth + months, 0)));
  }
  return { from, to: from <= today && today <= end ? today : end };
}
export function shiftRevenuePeriod(period: RevenuePeriod, anchor: string, direction: number): string {
  const range = revenueRange(period, anchor, "0001-01-01");
  const d = dateOf(range.from);
  if (period === "day" || period === "week" || period === "custom") d.setUTCDate(d.getUTCDate() + direction * (period === "week" ? 7 : 1));
  else d.setUTCMonth(d.getUTCMonth() + direction * (period === "quarter" ? 3 : period === "year" ? 12 : 1));
  return isoOf(d);
}
export interface RevenueEntry {
  id: string; stage: RevenueStage; business: "rental" | "sales"; event_date: string | null;
  document_number: string | null; order_code: string | null; customer_name: string | null;
  location: string | null; net_amount: number | null; event_kind: string; warning: string | null;
  source_table: string; source_id: string; status: string | null;
}
export interface RevenueBucket { key: string; label: string; revenue: number; count: number; category?: string }
export interface RevenueReport {
  scope: { admin: boolean; location: string | null };
  summary: Record<RevenueStage, { net: number; count: number; unknown: number; rental: number; sales: number }>;
  trend: { day: string; net: number; rental: number; sales: number }[];
  entries: RevenueEntry[]; total_count: number; warnings: number;
  by_location: RevenueBucket[]; by_category: RevenueBucket[]; by_article: RevenueBucket[];
  categories: string[];
}
export interface RevenueQuery {
  from: string; to: string; business?: RevenueBusiness; stage?: RevenueStage;
  location?: string; segment?: string; category?: string; offset?: number;
}
export function revenueQueryArgs(q: RevenueQuery) {
  return { p_from: q.from, p_to: q.to, p_business: q.business ?? "all", p_stage: q.stage ?? "invoiced", p_location: q.location ?? "all", p_segment: q.segment ?? "all", p_category: q.category ?? "all", p_offset: q.offset ?? 0 };
}
export function revenueEntryCsv(rows: RevenueEntry[]): string {
  const head = ["Datum", "Auftrags-ID", "Dokument", "Bereich", "Art", "Kunde", "Standort", "Netto (EUR)", "Hinweis"];
  return [head.join(";"), ...rows.map(r => [r.event_date ?? "", r.order_code ? `#${r.order_code}` : "", r.document_number ?? "", r.business === "sales" ? "Verkauf" : "Miete", r.event_kind, r.customer_name ?? "", revenueLocationLabel(r.location), r.net_amount == null ? "" : r.net_amount.toFixed(2).replace(".", ","), r.warning ?? ""].map(csvCell).join(";"))].join("\n");
}