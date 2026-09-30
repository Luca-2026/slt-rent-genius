/**
 * Preisrahmen für Verkaufsartikel (intern, nie für Kunden sichtbar).
 *
 * - Soll-Verkaufspreis = Preis auf der Website (netto).
 * - Mindestpreis = Einkaufspreis netto + Gemeinkosten (Standard 10 %).
 * - Bonusbasis = Differenz zwischen erzieltem Verkaufspreis und Mindestpreis.
 */
export const DEFAULT_OVERHEAD_PERCENT = 10;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function minimumPrice(
  purchaseNet: number | null | undefined,
  overheadPercent: number = DEFAULT_OVERHEAD_PERCENT,
): number | null {
  if (purchaseNet == null || !Number.isFinite(Number(purchaseNet)) || Number(purchaseNet) < 0) return null;
  const pct = Number.isFinite(Number(overheadPercent)) && Number(overheadPercent) >= 0 ? Number(overheadPercent) : DEFAULT_OVERHEAD_PERCENT;
  return round2(Number(purchaseNet) * (1 + pct / 100));
}

export interface PriceCheck {
  minimum: number | null;
  target: number | null;
  /** Erzielter Nettopreis je Stück (nach Rabatt) */
  achieved: number;
  /** Differenz zum Mindestpreis je Stück (negativ = darunter) */
  marginPerUnit: number | null;
  /** Differenz zum Mindestpreis für die gesamte Position */
  marginTotal: number | null;
  belowMinimum: boolean;
  belowTarget: boolean;
}

export function checkSalesPrice(params: {
  unitPrice: number;
  discountPercent?: number;
  quantity?: number;
  minimum: number | null;
  target: number | null;
}): PriceCheck {
  const discount = Math.min(100, Math.max(0, Number(params.discountPercent) || 0));
  const qty = Number(params.quantity) > 0 ? Number(params.quantity) : 1;
  const achieved = round2((Number(params.unitPrice) || 0) * (1 - discount / 100));
  const marginPerUnit = params.minimum != null ? round2(achieved - params.minimum) : null;
  return {
    minimum: params.minimum,
    target: params.target,
    achieved,
    marginPerUnit,
    marginTotal: marginPerUnit != null ? round2(marginPerUnit * qty) : null,
    belowMinimum: params.minimum != null && achieved < params.minimum,
    belowTarget: params.target != null && achieved < params.target,
  };
}

export interface SalesMatchable {
  slug: string;
  name: string;
  article_number: string | null;
}

const norm = (v: string | null | undefined) => (v ?? "").toLowerCase().replace(/\s+/g, " ").trim();

/** Findet den Verkaufsartikel zu einer Anfrage: Slug → Artikelnummer → Name. */
export function findSalesArticle<T extends SalesMatchable>(
  catalog: T[],
  q: { slug?: string | null; articleNumber?: string | null; name?: string | null },
): T | null {
  if (q.slug) {
    const hit = catalog.find((c) => c.slug === q.slug);
    if (hit) return hit;
  }
  const art = norm(q.articleNumber);
  if (art) {
    const hits = catalog.filter((c) => norm(c.article_number) === art);
    if (hits.length === 1) return hits[0];
  }
  // "BAUMAX BAUMAX SST350 – …" (Marke doppelt aus Anfrageformular) bereinigen.
  const name = norm(q.name).replace(/^(\S+) \1 /, "$1 ");
  if (!name) return null;
  const exact = catalog.find((c) => norm(c.name) === name);
  if (exact) return exact;
  // Website-Titel wie "BAUMAX SST350 – Steinsäge …" beginnen mit dem Katalognamen.
  const prefixed = catalog
    .filter((c) => norm(c.name).length >= 4 && (name.startsWith(norm(c.name) + " ") || name.startsWith(norm(c.name) + " –")))
    .sort((a, b) => b.name.length - a.name.length);
  return prefixed[0] ?? null;
}
