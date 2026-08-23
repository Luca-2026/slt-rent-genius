/**
 * Frontend mirror of the offer math used by the `send-inquiry-offer`
 * edge function. Kept pure and dependency free so it is unit testable and
 * always shows the exact totals the customer will receive.
 */

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
}

export const VAT_RATE = 19;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function lineTotal(item: Pick<OfferLine, "quantity" | "unit_price" | "discount_percent">): number {
  return round2(item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100));
}

export function buildOfferTotals(items: OfferLine[], deliveryCost = 0) {
  const itemsNet = round2(items.reduce((sum, i) => sum + lineTotal(i), 0));
  const netAmount = round2(itemsNet + (deliveryCost || 0));
  const vatAmount = round2(netAmount * (VAT_RATE / 100));
  const grossAmount = round2(netAmount + vatAmount);
  return { itemsNet, netAmount, vatRate: VAT_RATE, vatAmount, grossAmount };
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(value) ? value : 0);
}
