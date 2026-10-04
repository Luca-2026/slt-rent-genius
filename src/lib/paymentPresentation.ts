/** Stripe references identify provider-confirmed payments, including legacy records. */
export function isStripePayment(payment: { reference?: string; label?: string; provider?: string }): boolean {
  return payment.provider === "stripe" || /^cs_(live_|test_)?/.test(payment.reference ?? "") || /^pi_/.test(payment.reference ?? "") || /stripe/i.test(payment.label ?? "");
}

export function shortPaymentReference(reference?: string): string {
  if (!reference) return "";
  return reference.length > 24 ? `${reference.slice(0, 12)}…${reference.slice(-8)}` : reference;
}