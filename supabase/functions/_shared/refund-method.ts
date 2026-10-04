/** Refunds always go back via the payment method the customer used. */
export type RefundMethod = "stripe" | "transfer" | "mixed" | "none";

const isStripe = (p: any) =>
  p?.provider === "stripe" || /^(cs|pi)_/.test(String(p?.reference ?? "")) || /stripe/i.test(String(p?.label ?? ""));

export function refundMethod(payments: unknown): RefundMethod {
  const list = Array.isArray(payments) ? payments.filter((p: any) => Number(p?.amount) > 0) : [];
  if (!list.length) return "none";
  const stripe = list.filter(isStripe).length;
  return stripe === list.length ? "stripe" : stripe === 0 ? "transfer" : "mixed";
}

export function refundMethodText(method: RefundMethod): string {
  switch (method) {
    case "stripe": return "über Stripe auf das ursprüngliche Zahlungsmittel (z. B. Karte), mit dem Sie bezahlt haben";
    case "transfer": return "per Überweisung auf das Konto, von dem Ihre Zahlung bei uns eingegangen ist";
    case "mixed": return "jeweils auf dem Zahlungsweg, mit dem Sie bezahlt haben (Stripe bzw. Überweisung)";
    default: return "auf dem Zahlungsweg, mit dem Sie bezahlt haben";
  }
}
