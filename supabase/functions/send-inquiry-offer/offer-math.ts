/**
 * Pure helpers for inquiry offers — kept dependency free so they can be unit
 * tested both from Deno and from the frontend test suite.
 */

export interface InquiryOfferItem {
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  rental_start?: string;
  rental_end?: string;
  /** Öffentliche Bild-URL des CMS-Artikels (wird im PDF eingebettet). */
  image_url?: string;
}

export const VAT_RATE = 19;

export const LOCATION_CONTACTS: Record<string, { name: string; email: string; phone: string }> = {
  krefeld: { name: "Krefeld", email: "krefeld@slt-rental.de", phone: "02151 417 99 04" },
  bonn: { name: "Bonn", email: "bonn@slt-rental.de", phone: "0228 92 68 92 20" },
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

export function buildOfferTotals(items: InquiryOfferItem[], deliveryCost = 0) {
  const itemsNet = round2(items.reduce((sum, i) => sum + lineTotal(i), 0));
  const netAmount = round2(itemsNet + (deliveryCost || 0));
  const vatAmount = round2(netAmount * (VAT_RATE / 100));
  const grossAmount = round2(netAmount + vatAmount);
  return { itemsNet, netAmount, vatRate: VAT_RATE, vatAmount, grossAmount };
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

    return {
      product_name: name.slice(0, 200),
      description: item.description ? String(item.description).slice(0, 500) : undefined,
      quantity: Math.round(quantity),
      unit_price: round2(unitPrice),
      discount_percent: round2(discount),
      rental_start: item.rental_start ? String(item.rental_start).slice(0, 40) : undefined,
      rental_end: item.rental_end ? String(item.rental_end).slice(0, 40) : undefined,
      image_url: item.image_url ? String(item.image_url).slice(0, 500) : undefined,
    };
  });
}
