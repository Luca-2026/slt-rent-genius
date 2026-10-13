/**
 * Zahlungsablauf nach Online-Annahme (getestet: src/test/paymentFollowup.test.ts).
 *  - Vorkasse/Anzahlung: Kunde wird nach Annahme zur Zahlung geleitet; ist nach 1 Stunde noch nicht
 *    gezahlt, geht einmalig eine Nachfass-E-Mail mit 24-Stunden-Frist raus.
 *  - Nach Fristablauf ohne Zahlung wird die Anfrage im Portal als „Zahlung überfällig" markiert
 *    (keine automatische Stornierung).
 *  - Bei 30-%-Anzahlung genügt die Anzahlung; sonst muss der volle Betrag inkl. Kaution da sein.
 *  - Rechnungszahler bekommen weder Zahlungsaufforderung noch Nachfass-E-Mail.
 */
export const FOLLOWUP_AFTER_MINUTES = 60;
export const PAYMENT_DEADLINE_HOURS = 24;
const INVOICE = new Set(["net_7", "net_14", "net_30", "custom"]);

export const isPrepayTerms = (terms: string | null | undefined) => !INVOICE.has(terms ?? "");

const cents = (v: unknown) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0; };

export interface FollowupCandidate {
  status: string | null;
  offer_number: string | null;
  customer_email: string | null;
  offer_accepted_at: string | null;
  payment_followup_sent_at: string | null;
  order_confirmed_at?: string | null;
  payment_terms: string | null;
  gross: unknown;
  deposit: unknown;
  paid_cents: number;
}

/** Zahlungspflicht erfüllt? Bei Anzahlung reichen 30 % der Bruttomiete. */
export function paymentSatisfied(c: Pick<FollowupCandidate, "payment_terms" | "gross" | "deposit" | "paid_cents">): boolean {
  const gross = cents(c.gross);
  const required = c.payment_terms === "anzahlung_30" ? Math.round(gross * 0.3) : gross + cents(c.deposit);
  return c.paid_cents >= required;
}

export function needsPaymentFollowup(c: FollowupCandidate, now: Date): boolean {
  if (c.status !== "accepted" || c.order_confirmed_at) return false;
  if (!c.offer_accepted_at || c.payment_followup_sent_at || !c.offer_number) return false;
  if (!isPrepayTerms(c.payment_terms)) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((c.customer_email ?? "").trim())) return false;
  if (paymentSatisfied(c)) return false;
  return now.getTime() - new Date(c.offer_accepted_at).getTime() >= FOLLOWUP_AFTER_MINUTES * 60_000;
}

export function paymentDeadline(followupSentAt: string | null | undefined): Date | null {
  return followupSentAt ? new Date(new Date(followupSentAt).getTime() + PAYMENT_DEADLINE_HOURS * 3600_000) : null;
}

export function isPaymentOverdue(c: Omit<FollowupCandidate, "offer_accepted_at" | "customer_email" | "offer_number">, now: Date): boolean {
  if (c.status !== "accepted" || c.order_confirmed_at) return false;
  if (!isPrepayTerms(c.payment_terms)) return false;
  const deadline = paymentDeadline(c.payment_followup_sent_at);
  return !!deadline && now.getTime() > deadline.getTime() && !paymentSatisfied(c);
}
