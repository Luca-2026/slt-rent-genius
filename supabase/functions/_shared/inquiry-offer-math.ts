/**
 * Pure helpers for inquiry offers — kept dependency free so they can be unit
 * tested both from Deno and from the frontend test suite.
 */

import { computeAddonAmount, daysPerUnit, describeAddon, type AddonBasis, type AddonPriceType } from "./addon-calc.ts";

export interface InquiryOfferAddon {
  key: string;
  label: string;
  amount: number;
  note?: string;
  price_type?: AddonPriceType;
  rate?: number;
  basis?: AddonBasis;
  days?: number | null;
  period_start?: string | null;
  period_end?: string | null;
  manual?: boolean;
  /** Paket 3b: Kalendertage von Hand geändert + interner Grund (nicht im PDF). */
  days_manual?: boolean;
  days_reason?: string;
  /** Paket 3b: optionale Versicherungsstufe – zählt nicht in die Summe. */
  optional?: boolean;
  per_day?: number;
  of_key?: string;
  surcharge_percent?: number;
}

/** Paket 3b: optionale Zusatzoptionen zählen nicht in Positions-/Angebotssumme. */
export function countsInTotal(a: Pick<InquiryOfferAddon, "optional">): boolean {
  return a.optional !== true;
}

/** Kundenverständliche Erläuterung einer Zusatzoption (für PDF/E-Mail/Rechnung). */
export function addonExplanation(addon: InquiryOfferAddon, item: Pick<InquiryOfferItem, "unit">): string {
  const unit = (item.unit ?? "").replace(/e$|en$/i, "");
  return describeAddon({ ...addon, line_unit: singularUnit(item.unit) || unit });
}

function singularUnit(unit?: string): string {
  const u = (unit ?? "").toLowerCase();
  if (u.startsWith("arbeitstag")) return "Arbeitstag";
  if (u.startsWith("kalendertag")) return "Kalendertag";
  if (u.startsWith("woche")) return "Woche";
  if (u.startsWith("monat")) return "Monat";
  return "";
}

export interface InquiryOfferItem {
  product_name: string;
  /** CMS-Slug des Artikels – Grundlage der Bestandsprüfung. */
  product_slug?: string;
  /** Tatsächliche Stückzahl (quantity = Stückzahl × Dauer). */
  articles?: number;
  description?: string;
  quantity: number;
  /** Mengeneinheit (z. B. "Kalendertage", "Monat") – wird im PDF angezeigt. */
  unit?: string;
  unit_price: number;
  discount_percent: number;
  rental_start?: string;
  rental_end?: string;
  /** Paket 2: Uhrzeiten, Einheitenschlüssel und Preisherkunft (für Plausibilitätsprüfung) */
  rental_start_time?: string;
  rental_end_time?: string;
  unit_code?: string;
  price_manual?: boolean;
  price_basis?: "tier" | "weekend" | "customer";
  /** Öffentliche Bild-URL des CMS-Artikels (wird im PDF eingebettet). */
  image_url?: string;
  /** Zusatzoptionen (Versicherungen etc.) dieser Position */
  addons?: InquiryOfferAddon[];
  /** Paket 3b: Gruppe, Mengeneinheit, Dauer und Overrides (nur dieses Angebot). */
  group_id?: string;
  quantity_unit?: "stk" | "m2" | "lfm";
  duration?: number;
  name_override?: string | null;
  description_override?: string | null;
}

export const VAT_RATE = 19;

export const LOCATION_CONTACTS: Record<string, { name: string; email: string; phone: string }> = {
  krefeld: { name: "Krefeld", email: "krefeld@slt-rental.de", phone: "02151 417 99 04" },
  bonn: { name: "Bonn", email: "bonn@slt-rental.de", phone: "0228 504 660 61" },
  muelheim: { name: "Mülheim an der Ruhr", email: "muelheim@slt-rental.de", phone: "02151 417 99 04" },
};

export function resolveLocationKey(raw: string | null | undefined): string {
  const value = (raw ?? "").toLowerCase();
  if (!value) return "krefeld";
  if (value.includes("bonn")) return "bonn";
  if (value.includes("mülheim") || value.includes("muelheim") || value.includes("mulheim")) return "muelheim";
  if (value.includes("krefeld")) return "krefeld";
  return LOCATION_CONTACTS[value] ? value : "krefeld";
}

/**
 * Rückgabe an einem anderen Standort als der Abholung (One-Way-Miete).
 * Gibt null zurück, wenn keine abweichende Rückgabe gewählt oder der Standort
 * ungültig bzw. identisch mit dem Abholstandort ist. Der Aufpreis (netto)
 * gilt nur zusammen mit einem gültigen abweichenden Rückgabestandort.
 */
export function resolveReturnLocation(
  rawReturn: unknown,
  pickup: string | null | undefined,
  rawCost: unknown,
): { key: string; name: string; cost: number } | null {
  if (typeof rawReturn !== "string" || !rawReturn.trim()) return null;
  const value = rawReturn.trim().toLowerCase();
  const known = LOCATION_CONTACTS[value] ? value : null;
  if (!known) return null;
  if (known === resolveLocationKey(pickup)) return null;
  const cost = Math.max(0, Math.round((Number(rawCost) || 0) * 100) / 100);
  return { key: known, name: LOCATION_CONTACTS[known].name, cost };
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function lineTotal(item: Pick<InquiryOfferItem, "quantity" | "unit_price" | "discount_percent">): number {
  const gross = item.quantity * item.unit_price;
  const discounted = gross * (1 - (item.discount_percent || 0) / 100);
  return round2(discounted);
}

export function addonsTotal(items: InquiryOfferItem[]): number {
  return round2(
    items.reduce((sum, i) => sum + (i.addons ?? []).filter(countsInTotal).reduce((s, a) => s + (Number(a.amount) || 0), 0), 0),
  );
}

export function buildOfferTotals(items: InquiryOfferItem[], deliveryCost = 0) {
  const itemsNet = round2(items.reduce((sum, i) => sum + lineTotal(i), 0));
  const addonsNet = addonsTotal(items);
  const netAmount = round2(itemsNet + addonsNet + (deliveryCost || 0));
  const vatAmount = round2(netAmount * (VAT_RATE / 100));
  const grossAmount = round2(netAmount + vatAmount);
  return { itemsNet, addonsNet, netAmount, vatRate: VAT_RATE, vatAmount, grossAmount };
}

/** Abzüge (z. B. Inzahlungnahme) dürfen die Angebotssumme nicht negativ machen. */
export function assertPositiveTotal(netAmount: number) {
  if (!(netAmount > 0)) {
    throw new Error("Angebotssumme muss größer als 0 € sein – bitte Abzüge prüfen.");
  }
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

function normalizeAddons(
  raw: unknown,
  itemIndex: number,
  line?: { articles: number; quantity: number; unit?: string; unit_price: number; discount_percent: number },
): InquiryOfferAddon[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  if (raw.length > 10) throw new Error(`Position ${itemIndex + 1}: zu viele Zusatzoptionen (max. 10)`);
  const list = raw.map((entry) => {
    const a = (entry ?? {}) as Record<string, unknown>;
    const label = String(a.label ?? "").trim();
    if (!label) throw new Error(`Position ${itemIndex + 1}: Zusatzoption ohne Bezeichnung`);
    // Negative Beträge sind erlaubt (z. B. Inzahlungnahme eines Altgeräts).
    const amount = Number(a.amount);
    if (!Number.isFinite(amount) || amount < -1_000_000 || amount > 1_000_000) {
      throw new Error(`Position ${itemIndex + 1}: ungültiger Betrag bei "${label}"`);
    }
    const out: InquiryOfferAddon = {
      key: String(a.key ?? label).slice(0, 60),
      label: label.slice(0, 120),
      amount: round2(amount),
      note: a.note ? String(a.note).slice(0, 200) : undefined,
    };
    if (a.optional === true) {
      out.optional = true;
      const perDay = Number(a.per_day);
      if (Number.isFinite(perDay) && perDay >= 0 && perDay <= 1_000_000) out.per_day = round2(perDay);
      if (typeof a.of_key === "string") out.of_key = a.of_key.slice(0, 60);
      const sp = Number(a.surcharge_percent);
      if (Number.isFinite(sp) && sp > 0 && sp <= 1000) out.surcharge_percent = sp;
    }
    const priceType = a.price_type as AddonPriceType;
    const basis = a.basis as AddonBasis;
    const rate = Number(a.rate);
    if (
      ["flat", "per_unit", "percent"].includes(priceType) &&
      ["line", "full_period", "once"].includes(basis) &&
      Number.isFinite(rate) && rate >= 0 && rate <= 1_000_000
    ) {
      out.price_type = priceType;
      out.basis = basis;
      out.rate = round2(rate);
      out.manual = a.manual === true;
      if (a.days_manual === true) out.days_manual = true;
      if (typeof a.days_reason === "string" && a.days_reason.trim()) out.days_reason = a.days_reason.trim().slice(0, 200);
      if (basis === "full_period") {
        const days = Math.round(Number(a.days));
        if (!Number.isFinite(days) || days < 1 || days > 3660) {
          throw new Error(`Position ${itemIndex + 1}: "${label}" – Kalendertage der Mietdauer fehlen`);
        }
        out.days = days;
        out.period_start = typeof a.period_start === "string" && ISO.test(a.period_start) ? a.period_start : null;
        out.period_end = typeof a.period_end === "string" && ISO.test(a.period_end) ? a.period_end : null;
      }
      // Serverprüfung: automatisch berechnete Beträge müssen zur Angabe passen.
      if (!out.manual && line) {
        const articles = Math.max(1, line.articles || 1);
        const expected = computeAddonAmount(
          { price_type: priceType, rate: out.rate, basis, days: out.days },
          {
            articles,
            duration: Math.max(1, line.quantity / articles),
            days_per_unit: daysPerUnit(line.unit),
            unit_price: line.unit_price,
            discount_percent: line.discount_percent,
          },
        );
        if (expected !== null && Math.abs(Math.abs(expected) - Math.abs(out.amount)) > 0.011) {
          throw new Error(
            `Position ${itemIndex + 1}: Betrag bei "${label}" passt nicht zur Berechnung (erwartet ${expected.toFixed(2)} €) – bitte „Neu berechnen“`,
          );
        }
      }
    }
    return out;
  });
  return list;
}

/** Validates + normalizes untrusted item input coming from the portal UI. */
export function normalizeInquiryOfferItems(raw: unknown): InquiryOfferItem[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("Mindestens eine Position mit Preis wird benötigt");
  }
  if (raw.length > 50) throw new Error("Zu viele Positionen (max. 50)");

  return raw.map((entry, index) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    const name = String(item.product_name ?? "").trim();
    if (!name) throw new Error(`Position ${index + 1}: Bezeichnung fehlt`);

    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 10000) {
      throw new Error(`Position ${index + 1}: ungültige Menge`);
    }

    const unitPrice = Number(item.unit_price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 1_000_000) {
      throw new Error(`Position ${index + 1}: ungültiger Preis`);
    }

    const discount = Number(item.discount_percent ?? 0);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      throw new Error(`Position ${index + 1}: ungültiger Rabatt`);
    }

    const articles =
      Number.isFinite(Number(item.articles)) && Number(item.articles) > 0 ? Math.round(Number(item.articles)) : 1;
    const unitStr = item.unit ? String(item.unit).slice(0, 40) : undefined;
    return {
      product_name: name.slice(0, 200),
      product_slug: item.product_slug ? String(item.product_slug).slice(0, 200) : undefined,
      articles:
        Number.isFinite(Number(item.articles)) && Number(item.articles) > 0
          ? Math.round(Number(item.articles))
          : undefined,
      description: item.description ? String(item.description).slice(0, 500) : undefined,
      quantity: Math.round(quantity),
      unit: item.unit ? String(item.unit).slice(0, 40) : undefined,
      unit_price: round2(unitPrice),
      discount_percent: round2(discount),
      rental_start: item.rental_start ? String(item.rental_start).slice(0, 40) : undefined,
      rental_end: item.rental_end ? String(item.rental_end).slice(0, 40) : undefined,
      rental_start_time: item.rental_start_time ? String(item.rental_start_time).slice(0, 5) : undefined,
      rental_end_time: item.rental_end_time ? String(item.rental_end_time).slice(0, 5) : undefined,
      unit_code: item.unit_code ? String(item.unit_code).slice(0, 20) : undefined,
      price_manual: item.price_manual === true ? true : undefined,
      price_basis: item.price_basis === "tier" || item.price_basis === "weekend" || item.price_basis === "customer" ? item.price_basis : undefined,
      image_url: item.image_url ? String(item.image_url).slice(0, 500) : undefined,
      group_id: item.group_id ? String(item.group_id).slice(0, 60) : undefined,
      quantity_unit: item.quantity_unit === "m2" || item.quantity_unit === "lfm" || item.quantity_unit === "stk" ? item.quantity_unit : undefined,
      duration: Number(item.duration) > 0 && Number(item.duration) <= 10000 ? Math.round(Number(item.duration) * 100) / 100 : undefined,
      name_override: typeof item.name_override === "string" && item.name_override.trim() ? item.name_override.trim().slice(0, 200) : undefined,
      description_override: typeof item.description_override === "string" && item.description_override.trim() ? item.description_override.trim().slice(0, 500) : undefined,
      addons: normalizeAddons(item.addons, index, {
        articles,
        quantity: Math.round(quantity),
        unit: unitStr,
        unit_price: round2(unitPrice),
        discount_percent: round2(discount),
      }),
    };
  });
}

// ---------------------------------------------------------------- Paket 3b: Kopf-Felder im offer_payload

export interface OfferPayloadGroup { id: string; name: string; sort_order: number; source: "category" | "manual" }

/** Validiert offer_payload.groups (fehlt bei alten Angeboten → undefined). */
export function normalizeOfferGroups(raw: unknown): OfferPayloadGroup[] | undefined {
  if (!Array.isArray(raw) || !raw.length) return undefined;
  const list = raw.slice(0, 50).map((g, i) => {
    const o = (g ?? {}) as Record<string, unknown>;
    const id = String(o.id ?? "").trim().slice(0, 60);
    const name = String(o.name ?? "").trim().slice(0, 120);
    if (!id || !name) return null;
    return { id, name, sort_order: Number.isFinite(Number(o.sort_order)) ? Number(o.sort_order) : i, source: o.source === "category" ? "category" : "manual" } as OfferPayloadGroup;
  }).filter((g): g is OfferPayloadGroup => g !== null).sort((a, b) => a.sort_order - b.sort_order);
  return list.length ? list : undefined;
}

/** Nur ausgefüllte Zusatzfelder; leer → undefined. */
export function normalizeExtraFields(raw: unknown): { orderer?: string; cost_center?: string; project?: string } | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out: Record<string, string> = {};
  for (const k of ["orderer", "cost_center", "project"]) {
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, 200);
  }
  return Object.keys(out).length ? out : undefined;
}

/** Positionen in Gruppenreihenfolge; ohne/unbekannte Gruppe zuerst (Sammelgruppe „Positionen“). */
export function orderItemsByGroups<T extends { group_id?: string }>(groups: OfferPayloadGroup[] | undefined, items: T[]): T[] {
  if (!groups?.length) return items;
  const known = new Set(groups.map((g) => g.id));
  const loose = items.filter((i) => !i.group_id || !known.has(i.group_id));
  return [...loose, ...groups.flatMap((g) => items.filter((i) => i.group_id === g.id))];
}
