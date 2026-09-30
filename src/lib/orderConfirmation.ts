/**
 * Zahlungsprüfung für die Auftragsbestätigung.
 *
 * Wird 1:1 in `supabase/functions/send-order-confirmation` gespiegelt – das
 * Backend rechnet selbst nach und verlässt sich nicht auf die Anzeige.
 *
 * Regeln:
 * - Zu zahlen ist Angebotssumme brutto + Kaution (die Kaution wird laut
 *   Angebots-E-Mail mit überwiesen).
 * - Ohne Angebotssumme keine Bestätigung.
 * - Ohne Zahlungseingang keine Bestätigung – außer bei Zahlung auf Rechnung
 *   (net_7/14/30), dann nur nach ausdrücklicher Bestätigung.
 * - Teilzahlung: nur nach ausdrücklicher Bestätigung; die E-Mail nennt dann
 *   Teilzahlung und offenen Restbetrag, niemals "vollständig bezahlt".
 */

export type OrderPaymentState = "no_total" | "none" | "partial" | "full";

export interface OrderPaymentInput {
  gross: number | null | undefined;
  deposit?: number | null;
  payments: { amount: number }[];
  paymentTerms?: string | null;
}

export interface OrderPaymentEvaluation {
  state: OrderPaymentState;
  grossCents: number;
  depositCents: number;
  requiredCents: number;
  paidCents: number;
  openCents: number;
  overpaidCents: number;
  /** Zahlung laut Angebot erst nach Rechnungsstellung fällig. */
  paysOnInvoice: boolean;
  /** Versand grundsätzlich möglich (ggf. mit Bestätigung). */
  canSend: boolean;
  /** Versand nur nach ausdrücklicher Bestätigung durch den Mitarbeiter. */
  needsAcknowledgement: boolean;
  /** Grund, falls nicht versendet werden darf. */
  blockReason: string | null;
}

const INVOICE_TERMS = new Set(["net_7", "net_14", "net_30"]);
const toCents = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
};

export function evaluateOrderPayment(input: OrderPaymentInput): OrderPaymentEvaluation {
  const grossCents = toCents(input.gross);
  const depositCents = toCents(input.deposit);
  const requiredCents = grossCents + depositCents;
  const paidCents = input.payments.reduce((s, p) => s + toCents(p.amount), 0);
  const openCents = Math.max(0, requiredCents - paidCents);
  const overpaidCents = Math.max(0, paidCents - requiredCents);
  const paysOnInvoice = INVOICE_TERMS.has(String(input.paymentTerms ?? ""));

  let state: OrderPaymentState;
  if (grossCents <= 0) state = "no_total";
  else if (paidCents <= 0) state = "none";
  else if (openCents > 0) state = "partial";
  else state = "full";

  let blockReason: string | null = null;
  if (state === "no_total") blockReason = "Zu diesem Angebot ist keine Angebotssumme gespeichert.";
  else if (state === "none" && !paysOnInvoice)
    blockReason = "Es ist noch kein Zahlungseingang erfasst. Die Auftragsbestätigung kann erst nach Zahlungseingang versendet werden.";

  return {
    state,
    grossCents,
    depositCents,
    requiredCents,
    paidCents,
    openCents,
    overpaidCents,
    paysOnInvoice,
    canSend: blockReason === null,
    needsAcknowledgement: state === "partial" || (state === "none" && paysOnInvoice),
    blockReason,
  };
}

export const centsToEuro = (cents: number) => cents / 100;
