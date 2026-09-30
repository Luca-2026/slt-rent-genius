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
  /** Öffentliche Bild-URL des CMS-Artikels (wird im PDF eingebettet). */
  image_url?: string;
  /** Zusatzoptionen (Versicherungen etc.) dieser Position */
  addons?: InquiryOfferAddon[];
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

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function lineTotal(item: Pick<InquiryOfferItem, "quantity" | "unit_price" | "discount_percent">): number {
  const gross = item.quantity * item.unit_price;
  const discounted = gross * (1 - (item.discount_percent || 0) / 100);
  return round2(discounted);
}

export function addonsTotal(items: InquiryOfferItem[]): number {
  return round2(
    items.reduce((sum, i) => sum + (i.addons ?? []).reduce((s, a) => s + (Number(a.amount) || 0), 0), 0),
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
      image_url: item.image_url ? String(item.image_url).slice(0, 500) : undefined,
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
