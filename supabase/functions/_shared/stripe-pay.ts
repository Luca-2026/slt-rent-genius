/**
 * Gemeinsame Bausteine für Online-Zahlung per Stripe (Zahlungslink zum Angebot,
 * Zahlungsmeldung, Kautionserstattung). Reine Funktionen sind getestet (stripe-pay_test.ts).
 *
 * Regeln:
 *  - Betrag = Angebotssumme brutto + Kaution − bereits erfasste Zahlungen (centgenau).
 *  - Gebuchte Zahlung landet in inquiry.payments (Reference = Checkout-Session-ID); die
 *    Auftragsbestätigung bleibt dadurch an die volle, centgenaue Zahlung gebunden.
 *  - Im Stripe-Testmodus bekommen nur Testadressen einen Link – echte Kunden nie.
 */
import Stripe from "https://esm.sh/stripe@18.5.0";

export const PAY_BASE = "https://www.slt-rental.de";
export const TEST_CUSTOMER = "luca@sandhoff.org";
export const ALLOWED_RETURN_ORIGINS = [
  "https://www.slt-rental.de",
  "https://app.slt-rental.de",
  "https://id-preview--c9a26e89-cf04-49b4-979b-2963f0a95cb1.lovable.app",
  "http://localhost:8080",
];
export const INVOICE_TERMS = new Set(["net_7", "net_14", "net_30"]);

export const toCents = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
};

export interface PaymentPlan {
  openCents: number;
  rentCents: number;
  depositCents: number;
}

/** Offener Betrag, aufgeteilt in Miete und Kaution (Miete wird zuerst durch Vorzahlungen gedeckt). */
export function planPaymentAmounts(input: { gross: unknown; deposit?: unknown; paidCents?: number }): PaymentPlan {
  const gross = toCents(input.gross);
  const deposit = toCents(input.deposit);
  const paid = Math.max(0, Math.round(input.paidCents ?? 0));
  const openCents = Math.max(0, gross + deposit - paid);
  const rentCents = Math.max(0, gross - paid);
  const depositCents = Math.max(0, openCents - rentCents);
  return { openCents, rentCents, depositCents };
}

/** Link nur für Vorkasse-Konditionen; im Testmodus nur für die Testadresse. */
export function shouldOfferPaymentLink(input: {
  paymentTerms: string;
  customerEmail: string | null | undefined;
  testMode: boolean;
  openCents: number;
}): boolean {
  if (input.openCents <= 0) return false;
  if (INVOICE_TERMS.has(input.paymentTerms)) return false;
  if (input.testMode && (input.customerEmail ?? "").trim().toLowerCase() !== TEST_CUSTOMER) return false;
  return true;
}

/** Centgenauer Abgleich Stripe-Betrag ↔ erwarteter Linkbetrag. */
export function paymentMatches(amountTotal: number | null | undefined, expectedCents: number): boolean {
  return Number.isInteger(amountTotal) && amountTotal === expectedCents;
}

/** Noch erstattbare Kaution (laufende und erfolgreiche Erstattungen zählen). */
export function refundableDepositCents(depositCents: number, refunds: { amount_cents: number; status: string }[]): number {
  const used = refunds
    .filter((r) => !["failed", "canceled"].includes(r.status))
    .reduce((s, r) => s + r.amount_cents, 0);
  return Math.max(0, depositCents - used);
}

/** Zahlung idempotent in die Zahlungsliste der Anfrage einfügen. */
export function appendPayment(
  existing: unknown,
  payment: { date: string; amount: number; label: string; reference: string },
): { payments: Record<string, unknown>[]; paidAmount: number; added: boolean } {
  const list = (Array.isArray(existing) ? existing : []).filter((p) => p && typeof p === "object") as Record<string, unknown>[];
  const added = !list.some((p) => p.reference === payment.reference);
  const payments = added ? [...list, payment] : list;
  const paidCents = payments.reduce((s, p) => s + toCents(p.amount), 0);
  return { payments, paidAmount: paidCents / 100, added };
}

export function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const paymentPageUrl = (token: string, base = PAY_BASE) => `${base}/zahlung/${token}`;

export function stripeKey(): string {
  return Deno.env.get("STRIPE_SECRET_KEY") ?? "";
}
export const isStripeConfigured = () => stripeKey().length > 0;
export const isStripeTestMode = () => !/^(sk|rk)_live_/.test(stripeKey());

export function stripeClient(): Stripe {
  return new Stripe(stripeKey(), {
    apiVersion: "2025-08-27.basil" as never,
    httpClient: Stripe.createFetchHttpClient(),
  });
}

// deno-lint-ignore no-explicit-any
type Svc = any;

/** Neuen Zahlungslink anlegen; vorherigen aktiven Link ersetzen. */
export async function ensurePaymentLink(
  service: Svc,
  args: {
    table: "rental_inquiries" | "sales_inquiries";
    inquiryId: string;
    customerEmail: string | null;
    offerNumber: string;
    plan: PaymentPlan;
    createdBy?: string | null;
  },
): Promise<{ id: string; token: string; url: string } | null> {
  if (args.plan.openCents <= 0) return null;
  await service
    .from("offer_payment_links")
    .update({ status: "superseded", updated_at: new Date().toISOString() })
    .eq("inquiry_table", args.table)
    .eq("inquiry_id", args.inquiryId)
    .eq("status", "active");
  const token = newToken();
  const { data, error } = await service
    .from("offer_payment_links")
    .insert({
      token,
      inquiry_table: args.table,
      inquiry_id: args.inquiryId,
      offer_number: args.offerNumber,
      customer_email: args.customerEmail,
      rent_cents: args.plan.rentCents,
      deposit_cents: args.plan.depositCents,
      amount_cents: args.plan.openCents,
      livemode: !isStripeTestMode(),
      created_by: args.createdBy ?? null,
    })
    .select("id, token")
    .single();
  if (error || !data) {
    console.error("Zahlungslink konnte nicht angelegt werden:", error?.message);
    return null;
  }
  return { id: data.id, token: data.token, url: paymentPageUrl(data.token) };
}
