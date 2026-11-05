import { buildOfferTotals, lineTotal, type InquiryOfferItem } from "./inquiry-offer-math.ts";

export const BANK_DISCOUNT_RATE = 3;
export const BANK_DISCOUNT_VERSION = "bank-transfer-3-v1";
export const BANK_DISCOUNT_KEY = "bank_transfer_discount_v1";
export const BANK_DISCOUNT_TERMS = "3 % Überweisungsrabatt auf Miete einschließlich vereinbarter Zusatzleistungen nach sonstigen Rabatten, nur bei vollständig per Banküberweisung bezahltem Mietbetrag (auch in Teilzahlungen). Kein Rabatt bei gemischten Zahlungsarten. Kaution, Schadensersatz und städtische Gebühren sind ausgenommen. Online-Zahlung zum regulären Preis ohne Aufschlag. Zahlungswechsel nach Rechnungsstellung nur mit Belegkorrektur durch SLT.";
export type DiscountCostKind = "rental" | "damage" | "municipal" | "deposit";
export type RentalPaymentMethod = "bank" | "regular";
export interface BankDiscountPolicy {
  version: typeof BANK_DISCOUNT_VERSION;
  rate: 3;
  selected: RentalPaymentMethod;
}
export const newBankDiscountPolicy = (): BankDiscountPolicy => ({ version: BANK_DISCOUNT_VERSION, rate: 3, selected: "regular" });
export function hasBankDiscountPolicy(value: unknown): value is BankDiscountPolicy {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<BankDiscountPolicy>;
  return p.version === BANK_DISCOUNT_VERSION && p.rate === 3 && (p.selected === "bank" || p.selected === "regular");
}
const cents = (v: number) => Math.round((v + Number.EPSILON) * 100);
export function isBankTransfer(p: { label?: unknown; reference?: unknown; provider?: unknown }): boolean {
  return p.label === "Banküberweisung" && p.provider !== "stripe" && !/^(cs_|pi_)/.test(String(p.reference ?? ""));
}
export function allPaymentsByBank(payments: unknown): boolean {
  return Array.isArray(payments) && payments.filter(p => Number(p?.amount) > 0).every(isBankTransfer);
}
export function withoutBankDiscount(items: InquiryOfferItem[]): InquiryOfferItem[] {
  return items.map(item => ({ ...item, addons: item.addons?.filter(a => a.key !== BANK_DISCOUNT_KEY) }));
}
/** Discounts a trusted, already priced rental snapshot. Deposit is never in this base. */
export function priceBankTransfer(items: InquiryOfferItem[], costs = 0, method: RentalPaymentMethod = "regular") {
  const clean = withoutBankDiscount(items);
  const regular = buildOfferTotals(clean, costs);
  const eligibleNet = Math.max(0, clean.reduce((sum, item) => {
    if (item.vat_rate === 0 || (item.payment_cost_kind && item.payment_cost_kind !== "rental")) return sum;
    // Negative installment deductions must not reduce the full contract's rebate a second time.
    const itemNet = Math.max(0, lineTotal(item));
    const addons = (item.addons ?? []).filter(a => !a.optional && (!a.payment_cost_kind || a.payment_cost_kind === "rental"))
      .reduce((s, a) => s + a.amount, 0);
    return sum + itemNet + addons;
  }, costs));
  const discountNet = Math.min(cents(eligibleNet), Math.round(cents(eligibleNet) * BANK_DISCOUNT_RATE / 100)) / 100;
  const priced = clean.map((item, index) => index === 0 && method === "bank" && discountNet > 0
    ? { ...item, addons: [...(item.addons ?? []), { key: BANK_DISCOUNT_KEY, label: "3 % Überweisungsrabatt", amount: -discountNet, manual: true, payment_cost_kind: "rental" as const }] }
    : item);
  const bankTotals = buildOfferTotals(clean.map((item, index) => index === 0 && discountNet > 0
    ? { ...item, addons: [...(item.addons ?? []), { key: BANK_DISCOUNT_KEY, label: "3 % Überweisungsrabatt", amount: -discountNet, manual: true }] } : item), costs);
  return { items: priced, totals: method === "bank" ? bankTotals : regular, regularTotals: regular, bankTotals, discountNet, discountGross: (cents(regular.grossAmount) - cents(bankTotals.grossAmount)) / 100 };
}