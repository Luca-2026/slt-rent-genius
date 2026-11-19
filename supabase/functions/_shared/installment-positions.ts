import { buildOfferTotals, normalizeInquiryOfferItems, type InquiryOfferItem } from "./inquiry-offer-math.ts";
import { BANK_DISCOUNT_KEY, hasBankDiscountPolicy, priceBankTransfer } from "./bank-transfer-discount.ts";

export interface InstallmentPosition {
  product_name: string;
  description?: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  discount_percent: number;
  vat_rate?: 0 | 19;
  payment_cost_kind?: InquiryOfferItem["payment_cost_kind"];
}
export interface InstallmentQuantity { index: number; quantity: number }

/** Freeze agreed prices/text; invoice quantities never update the offer or inventory. */
export function offeredInstallmentPositions(payload: unknown): InstallmentPosition[] {
  const offer = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const items = normalizeInquiryOfferItems(offer.items);
  const positions: InstallmentPosition[] = [];
  for (const item of items) {
    positions.push({
      product_name: item.name_override || item.product_name,
      description: item.description_override || item.description,
      quantity: item.quantity, unit: item.unit, unit_price: item.unit_price,
      discount_percent: item.discount_percent, vat_rate: item.vat_rate,
      payment_cost_kind: item.payment_cost_kind,
    });
    for (const addon of item.addons ?? []) {
      if (addon.optional || addon.key === BANK_DISCOUNT_KEY || addon.amount <= 0) continue;
      positions.push({ product_name: `${addon.label} – ${item.name_override || item.product_name}`,
        description: addon.note, quantity: 1, unit: "Pauschal", unit_price: addon.amount,
        discount_percent: 0, vat_rate: 19, payment_cost_kind: addon.payment_cost_kind });
    }
  }
  for (const [key, label] of [
    ["delivery_cost_delivery", "Anlieferung"], ["delivery_cost_return", "Abholung"],
    ["setup_cost", "Aufbau / Montage vor Ort"], ["dismantle_cost", "Abbau / Demontage vor Ort"],
    ["return_location_cost", "Rückgabe an anderem Standort"],
  ]) {
    const amount = Number(offer[key]) || 0;
    if (amount > 0) positions.push({ product_name: label, quantity: 1, unit: "Pauschal",
      unit_price: amount, discount_percent: 0, vat_rate: 19 });
  }
  return positions;
}

/** Accept quantity decisions only; every price and description comes from the stored offer. */
export function buildInstallmentPositions(payload: unknown, decisions: unknown) {
  const source = offeredInstallmentPositions(payload);
  if (!Array.isArray(decisions) || decisions.length !== source.length) throw new Error("Bitte alle Angebotspositionen prüfen und die Abschlagsrechnung erneut öffnen.");
  const seen = new Set<number>();
  const items: InquiryOfferItem[] = [];
  for (const decision of decisions) {
    if (!decision || typeof decision !== "object") throw new Error("Ungültige Positionsmenge.");
    const { index, quantity } = decision as InstallmentQuantity;
    const position = source[index];
    if (!Number.isInteger(index) || !position || seen.has(index)) throw new Error("Ungültige Angebotsposition.");
    seen.add(index);
    if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity < 0 || quantity > 10000 || Math.abs(quantity * 100 - Math.round(quantity * 100)) > 0.000001) throw new Error(`Position ${index + 1}: Menge zwischen 0 und 10.000 mit höchstens zwei Nachkommastellen eingeben.`);
    if (quantity > 0) items.push({ ...position, quantity, period_free: true });
  }
  if (!items.length) throw new Error("Mindestens eine Position muss eine Menge größer als 0 haben.");
  const offer = payload as Record<string, unknown>;
  const policy = offer.bank_transfer_discount;
  const priced = hasBankDiscountPolicy(policy) && policy.selected === "bank"
    ? priceBankTransfer(items, 0, "bank").items : items;
  return { items: priced, totals: buildOfferTotals(priced) };
}