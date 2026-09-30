/**
 * Umsatzauswertung nach Standort, Kategorie und Artikel. Rein und testbar.
 *
 * Umsatzdefinition identisch zu dashboardMetrics (countsAsRevenue):
 *  - Rechnungen aus Anfragen inkl. stornierter + Gutschriften (negativ) → Storno hebt sich auf
 *  - B2B-Portal-Rechnungen ohne Entwürfe/Stornos
 * Beträge netto. Pro Rechnung wird der Netto-Rechnungsbetrag vollständig verteilt:
 *  Positionen (ohne Kaution) → Artikel; Differenz (Lieferung, Aufbau, Rundung) → „Lieferung & Service“.
 * So ergeben Standort-, Kategorie- und Artikelsumme immer exakt denselben Gesamtumsatz.
 */
import { countsAsRevenue } from "@/lib/dashboardMetrics";
import { segmentOf, matchesSegment, type CustomerSegment, type SegmentFilter } from "@/lib/customerSegment";

export type Business = "rental" | "sales";

export interface AnalyticsItem { product_name: string | null; total_price: number | null }

export interface AnalyticsInvoice {
  id: string;
  source: "inquiry" | "portal";
  business: Business;
  invoice_kind: string | null;
  status: string;
  invoice_date: string | null;
  net_amount: number | null;
  location: string | null;
  segment: CustomerSegment;
  /** Kategorie aus der Anfrage (z. B. Verkauf), falls vorhanden */
  fallbackCategory?: string | null;
  /** Liefer-/Aufbau-/Nebenkosten laut Rechnungskopf (netto) */
  serviceAmount?: number | null;
  /** Artikelname, falls die Rechnung keine Positionen hat (z. B. aus der Reservierung) */
  fallbackArticle?: string | null;
  items: AnalyticsItem[];
}

export interface AnalyticsFilter {
  business: Business;
  from: string | null; // YYYY-MM-DD inkl.
  to: string | null;
  location: string | "all";
  segment: SegmentFilter;
  category: string | "all";
}

export interface Bucket { key: string; label: string; revenue: number; count: number; category?: string }

export interface AnalyticsResult {
  total: number;
  invoiceCount: number;
  byLocation: Bucket[];
  byCategory: Bucket[];
  byArticle: Bucket[];
}

export const SERVICE_LABEL = "Lieferung & Service";
export const UNASSIGNED_CATEGORY = "Ohne Kategorie";
export const UNKNOWN_LOCATION = "Ohne Standort";
export const ADDON_LABEL = "Versicherung & Zusatzoptionen";
export const UNSPLIT_LABEL = "Nicht aufgeschlüsselt";

const num = (v: unknown) => { const x = Number(v); return isFinite(x) ? x : 0; };
const r2 = (v: number) => Math.round(v * 100) / 100;

export function normalizeName(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

export function isDepositLine(name: string | null | undefined): boolean {
  return /^kaution\b/.test(normalizeName(name));
}

export function isServiceLine(name: string | null | undefined): boolean {
  const n = normalizeName(name);
  return /^(anlieferung|lieferung|abholung|transport|aufbau|abbau|fracht)\b/.test(n);
}

export function isAddonLine(name: string | null | undefined): boolean {
  return /(versicherung|haftungsreduzierung|reinigung|zusatzoption|selbstbeteiligung)/.test(normalizeName(name));
}

const wordsOf = (s: string | null | undefined) => normalizeName(s).split(" ").filter((w) => w.length >= 5 && !/\d/.test(w));
const WORD_PREFIX = "\u0000w:";

/**
 * Artikelname → Kategorie aus dem CMS.
 * 1) exakter (normalisierter) Name, 2) eindeutiges Gerätewort (z. B. „minibagger“ nur in Erdbewegung).
 */
export function buildCategoryIndex(products: { name: string | null; category: string | null }[]): Map<string, string> {
  const m = new Map<string, string>();
  const words = new Map<string, Set<string>>();
  for (const p of products) {
    if (!p.category) continue;
    const k = normalizeName(p.name);
    if (k && !m.has(k)) m.set(k, p.category);
    for (const w of wordsOf(p.name)) words.set(w, (words.get(w) ?? new Set()).add(p.category));
  }
  for (const [w, cats] of words) if (cats.size === 1) m.set(WORD_PREFIX + w, [...cats][0]);
  return m;
}

export function lookupCategory(index: Map<string, string>, name: string | null | undefined): string | undefined {
  const exact = index.get(normalizeName(name));
  if (exact) return exact;
  // längstes eindeutiges Gerätewort gewinnt
  for (const w of wordsOf(name).sort((a, b) => b.length - a.length)) {
    const c = index.get(WORD_PREFIX + w);
    if (c) return c;
  }
  return undefined;
}

export function inquirySegment(customer_kind: string | null): CustomerSegment {
  return segmentOf({ customer_kind });
}

export function analyze(
  invoices: AnalyticsInvoice[],
  categoryIndex: Map<string, string>,
  f: AnalyticsFilter,
): AnalyticsResult {
  const loc = new Map<string, Bucket>();
  const cat = new Map<string, Bucket>();
  const art = new Map<string, Bucket>();
  const add = (m: Map<string, Bucket>, key: string, label: string, v: number, invId: string, seen: Set<string>, category?: string) => {
    const b = m.get(key) ?? { key, label, revenue: 0, count: 0, category };
    b.revenue += v;
    const sk = `${key}|${invId}`;
    if (!seen.has(sk)) { seen.add(sk); b.count += 1; }
    m.set(key, b);
  };
  const seenLoc = new Set<string>(), seenCat = new Set<string>(), seenArt = new Set<string>();
  let total = 0;
  let invoiceCount = 0;

  for (const inv of invoices) {
    if (inv.business !== f.business) continue;
    if (!countsAsRevenue({ ...inv, gross_amount: null }, inv.source === "portal")) continue;
    const d = inv.invoice_date!.slice(0, 10);
    if (f.from && d < f.from) continue;
    if (f.to && d > f.to) continue;
    const location = inv.location || UNKNOWN_LOCATION;
    if (f.location !== "all" && location !== f.location) continue;
    if (!matchesSegment(inv.segment, f.segment)) continue;

    const net = num(inv.net_amount);
    const sign = inv.invoice_kind === "credit_note" ? -1 : 1;
    // Positionen: Gutschriften können positiv oder negativ gespeichert sein → auf Vorzeichen der Rechnung bringen.
    const lines: { name: string; category: string; value: number }[] = [];
    let itemSum = 0;
    const push = (name: string, category: string, value: number) => { lines.push({ name, category, value }); itemSum += value; };
    for (const it of inv.items) {
      if (isDepositLine(it.product_name)) continue;
      const v = sign * Math.abs(num(it.total_price));
      const name = (it.product_name ?? "").trim() || "Ohne Bezeichnung";
      if (isServiceLine(name)) push(SERVICE_LABEL, SERVICE_LABEL, v);
      else if (isAddonLine(name)) push(name, ADDON_LABEL, v);
      else push(name, lookupCategory(categoryIndex, name) ?? inv.fallbackCategory ?? UNASSIGNED_CATEGORY, v);
    }
    // Nebenkosten aus dem Rechnungskopf, sofern nicht schon als Position enthalten
    const hasServiceLine = lines.some((l) => l.category === SERVICE_LABEL);
    const service = sign * Math.abs(num(inv.serviceAmount));
    if (!hasServiceLine && Math.abs(service) >= 0.01 && Math.abs(net - itemSum) >= Math.abs(service) - 0.01) push(SERVICE_LABEL, SERVICE_LABEL, service);
    const rest = r2(net - itemSum);
    if (Math.abs(rest) >= 0.01) {
      if (inv.items.length === 0 && inv.fallbackArticle) {
        push(inv.fallbackArticle, lookupCategory(categoryIndex, inv.fallbackArticle) ?? inv.fallbackCategory ?? UNASSIGNED_CATEGORY, rest);
      } else push(UNSPLIT_LABEL, UNSPLIT_LABEL, rest);
    }

    const inCategory = f.category === "all" ? lines : lines.filter((l) => l.category === f.category);
    if (inCategory.length === 0) continue;
    invoiceCount += 1;
    for (const l of inCategory) {
      total += l.value;
      add(loc, location, location, l.value, inv.id, seenLoc);
      add(cat, l.category, l.category, l.value, inv.id, seenCat);
      add(art, `${l.category}|${normalizeName(l.name)}`, l.name, l.value, inv.id, seenArt, l.category);
    }
  }

  const sorted = (m: Map<string, Bucket>) =>
    [...m.values()].map((b) => ({ ...b, revenue: r2(b.revenue) })).filter((b) => Math.abs(b.revenue) >= 0.01)
      .sort((a, b) => b.revenue - a.revenue || a.label.localeCompare(b.label, "de"));
  return { total: r2(total), invoiceCount, byLocation: sorted(loc), byCategory: sorted(cat), byArticle: sorted(art) };
}

export function toCsv(rows: Bucket[], total: number, withCategory: boolean): string {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const head = ["Bezeichnung", ...(withCategory ? ["Kategorie"] : []), "Umsatz netto (EUR)", "Anteil (%)", "Rechnungen"];
  const body = rows.map((r) => [
    esc(r.label), ...(withCategory ? [esc(r.category ?? "")] : []),
    r.revenue.toFixed(2).replace(".", ","),
    (total ? (r.revenue / total) * 100 : 0).toFixed(1).replace(".", ","),
    String(r.count),
  ].join(";"));
  return [head.join(";"), ...body].join("\n");
}
