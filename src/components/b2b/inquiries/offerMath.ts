import type { OfferUnit } from "@/lib/offerUnits";
import type { AddonBasis, AddonPriceType } from "@/lib/addonCalc";

/**
 * Frontend mirror of the offer math used by the `send-inquiry-offer`
 * edge function. Kept pure and dependency free so it is unit testable and
 * always shows the exact totals the customer will receive.
 */

export interface OfferLineAddon {
  key: string;
  label: string;
  /** Netto-Betrag der Zusatzoption für diese Position */
  amount: number;
  /** informativer Zusatz, z. B. "Selbstbehalt 500 €" */
  note?: string;
  /** Berechnungsangaben (fehlen bei alten Angeboten) */
  price_type?: AddonPriceType;
  rate?: number;
  basis?: AddonBasis;
  /** Kalendertage der gesamten Mietdauer (basis = full_period) */
  days?: number | null;
  period_start?: string | null;
  period_end?: string | null;
  /** Betrag wurde von Hand überschrieben – keine automatische Neuberechnung */
  manual?: boolean;
  /** Paket 3b: Kalendertage von Hand geändert (z. B. 12 statt 10) und interner Grund (nicht im PDF). */
  days_manual?: boolean;
  days_reason?: string;
  /** Paket 3b: optionale weitere Versicherungsstufe – wird angeboten, zählt aber nicht in die Summe. */
  optional?: boolean;
  /** Paket 3b: Aufpreis je Kalendertag der optionalen Stufe (Anzeige „€/KT“). */
  per_day?: number;
}

export interface OfferLine {
  product_name: string;
  description?: string;
  /** Anzahl der Artikel */
  quantity: number;
  /** Mietdauer/Menge in der gewählten Einheit (Tage, Wochen, Monate …) */
  duration?: number;
  /** Mengeneinheit der Position */
  unit?: OfferUnit;
  unit_price: number;
  discount_percent: number;
  rental_start?: string;
  rental_end?: string;
  /** Uhrzeiten des Positionszeitraums (HH:MM, Europe/Berlin) – Paket 2 */
  rental_start_time?: string;
  rental_end_time?: string;
  /** Einzelpreis von Hand geändert – keine automatische Neuberechnung (Paket 2) */
  price_manual?: boolean;
  /** Herkunft des Einzelpreises: Staffel, Wochenendtarif oder Kundenpreis (Paket 2) */
  price_basis?: "tier" | "weekend" | "customer";
  /** Bild-URL aus dem CMS – wird im Angebots-PDF eingebettet. */
  image_url?: string;
  /** Zusatzoptionen (Versicherungen etc.) dieser Position */
  addons?: OfferLineAddon[];
  /** Paket 3b: Gruppe der Position (offer_payload.groups[].id). */
  group_id?: string;
  /** Paket 3b: Mengeneinheit der Artikelmenge (Standard Stück). */
  quantity_unit?: QuantityUnit;
  /** Paket 3b: Name/Beschreibung nur für dieses Angebot (null = Stammdaten). */
  name_override?: string | null;
  description_override?: string | null;
}

// ---------------------------------------------------------------- Paket 3b: Felder und Positionen

export type QuantityUnit = "stk" | "m2" | "lfm";
export const QUANTITY_UNITS: { value: QuantityUnit; label: string; short: string }[] = [
  { value: "stk", label: "Stück", short: "Stk" },
  { value: "m2", label: "Quadratmeter", short: "m²" },
  { value: "lfm", label: "Laufende Meter", short: "lfm" },
];
export function quantityUnitShort(u?: QuantityUnit | null): string {
  return QUANTITY_UNITS.find((q) => q.value === u)?.short ?? "Stk";
}

export type OrderType = "pickup" | "delivery";

export interface OfferExtraFields {
  orderer?: string;
  cost_center?: string;
  project?: string;
}
export const EXTRA_FIELD_LABELS: Record<keyof OfferExtraFields, string> = {
  orderer: "Besteller",
  cost_center: "Kostenstelle",
  project: "Bauvorhaben",
};

/** Nur ausgefüllte Zusatzfelder speichern; leer → undefined (Feld entfällt im offer_payload). */
export function cleanExtraFields(raw: unknown): OfferExtraFields | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out: OfferExtraFields = {};
  for (const k of Object.keys(EXTRA_FIELD_LABELS) as (keyof OfferExtraFields)[]) {
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, 200);
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Auftragsart: ein Liefer- oder Abholbetrag > 0 schaltet auf Lieferung.
 * Beträge auf 0 schalten nicht zurück – nur der Mitarbeiter schaltet manuell auf Abholung.
 */
export function nextOrderType(current: OrderType, deliveryCost: number, returnCost: number): OrderType {
  if ((Number(deliveryCost) || 0) > 0 || (Number(returnCost) || 0) > 0) return "delivery";
  return current;
}
export function parseOrderType(raw: unknown): OrderType {
  return raw === "delivery" ? "delivery" : "pickup";
}

export interface OfferGroup {
  id: string;
  name: string;
  sort_order: number;
  source: "category" | "manual";
}
/** Gruppe für alte Angebote bzw. Positionen ohne Gruppe. */
export const FALLBACK_GROUP_NAME = "Positionen";

export function parseGroups(raw: unknown): OfferGroup[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((g, i) => {
      const o = (g ?? {}) as Record<string, unknown>;
      const id = String(o.id ?? "").trim();
      const name = String(o.name ?? "").trim();
      if (!id || !name) return null;
      return {
        id: id.slice(0, 60),
        name: name.slice(0, 120),
        sort_order: Number.isFinite(Number(o.sort_order)) ? Number(o.sort_order) : i,
        source: o.source === "category" ? "category" : "manual",
      } as OfferGroup;
    })
    .filter((g): g is OfferGroup => g !== null)
    .sort((a, b) => a.sort_order - b.sort_order);
}

let groupSeq = 0;
export function newGroupId(): string {
  groupSeq += 1;
  return `g-${Date.now().toString(36)}-${groupSeq}`;
}

/** Kategorie-Gruppe anlegen oder wiederverwenden (Name, Groß-/Kleinschreibung egal). */
export function ensureCategoryGroup(groups: OfferGroup[], name: string): { groups: OfferGroup[]; id: string } {
  const clean = name.trim() || FALLBACK_GROUP_NAME;
  const found = groups.find((g) => g.name.toLowerCase() === clean.toLowerCase());
  if (found) return { groups, id: found.id };
  const g: OfferGroup = {
    id: newGroupId(),
    name: clean,
    sort_order: groups.length ? Math.max(...groups.map((x) => x.sort_order)) + 1 : 0,
    source: "category",
  };
  return { groups: [...groups, g], id: g.id };
}

/**
 * Sichtbare Gruppen inkl. Sammelgruppe „Positionen“ für Positionen ohne (gültige) Gruppe.
 * Gibt die Gruppen in Reihenfolge samt Positionsindizes zurück.
 */
export function groupedIndices<T extends { group_id?: string }>(
  groups: OfferGroup[],
  items: T[],
): { group: OfferGroup | null; indices: number[] }[] {
  const known = new Set(groups.map((g) => g.id));
  const loose = items.map((_, i) => i).filter((i) => !items[i].group_id || !known.has(items[i].group_id!));
  const out: { group: OfferGroup | null; indices: number[] }[] = [];
  if (loose.length || !groups.length) out.push({ group: null, indices: loose });
  for (const g of groups) out.push({ group: g, indices: items.map((_, i) => i).filter((i) => items[i].group_id === g.id) });
  return out;
}

/** Positionen in Gruppenreihenfolge (für PDF/Versand), Reihenfolge innerhalb der Gruppe bleibt. */
export function orderItemsByGroups<T extends { group_id?: string }>(groups: OfferGroup[], items: T[]): T[] {
  return groupedIndices(groups, items).flatMap((b) => b.indices.map((i) => items[i]));
}

/** Zählt diese Zusatzoption in die Angebotssumme? Optionale Stufen nicht. */
export function countsInTotal(a: Pick<OfferLineAddon, "optional">): boolean {
  return a.optional !== true;
}

export const VAT_RATE = 19;


const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function lineTotal(
  item: Pick<OfferLine, "quantity" | "unit_price" | "discount_percent" | "duration">,
): number {
  const duration = item.duration && item.duration > 0 ? item.duration : 1;
  return round2(item.quantity * duration * item.unit_price * (1 - (item.discount_percent || 0) / 100));
}

export function addonsTotal(items: OfferLine[]): number {
  return round2(
    items.reduce(
      (sum, item) => sum + (item.addons ?? []).filter(countsInTotal).reduce((s, a) => s + (Number(a.amount) || 0), 0),
      0,
    ),
  );
}

export function buildOfferTotals(items: OfferLine[], deliveryCost = 0) {
  const itemsNet = round2(items.reduce((sum, i) => sum + lineTotal(i), 0));
  const addonsNet = addonsTotal(items);
  const netAmount = round2(itemsNet + addonsNet + (deliveryCost || 0));
  const vatAmount = round2(netAmount * (VAT_RATE / 100));
  const grossAmount = round2(netAmount + vatAmount);
  return { itemsNet, addonsNet, netAmount, vatRate: VAT_RATE, vatAmount, grossAmount };
}


/** Abzüge (z. B. Inzahlungnahme) dürfen die Angebotssumme nicht negativ machen. */
export function isValidOfferTotal(netAmount: number): boolean {
  return Number.isFinite(netAmount) && netAmount > 0;
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(value) ? value : 0);
}
