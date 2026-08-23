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
}

export interface OfferLine {
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  rental_start?: string;
  rental_end?: string;
  /** Bild-URL aus dem CMS – wird im Angebots-PDF eingebettet. */
  image_url?: string;
  /** Zusatzoptionen (Versicherungen etc.) dieser Position */
  addons?: OfferLineAddon[];
}

export const VAT_RATE = 19;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function lineTotal(item: Pick<OfferLine, "quantity" | "unit_price" | "discount_percent">): number {
  return round2(item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100));
}

export function addonsTotal(items: OfferLine[]): number {
  return round2(
    items.reduce(
      (sum, item) => sum + (item.addons ?? []).reduce((s, a) => s + (Number(a.amount) || 0), 0),
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
