import { isStripeTestMode, stripeClient, toCents } from "./stripe-pay.ts";
import { reconcileRefundsBeforeExecution } from "./refund-reconciliation.ts";

/** Refunds never alter the invoice or its original received-payment snapshot. */
export async function creditRefund(service: any, creditId: string, userId: string, execute: boolean, rentalCredit = false) {
  const { data: credit, error: creditError } = await service.from("inquiry_invoices").select("*").eq("id", creditId).maybeSingle();
  if (creditError || !credit || credit.status === "draft" || credit.status === "cancelled" || (rentalCredit ? !["invoice", "final"].includes(credit.invoice_kind) || !credit.rental_inquiry_id || credit.parent_invoice_id || credit.deducted_installments?.length : credit.invoice_kind !== "credit_note" || !credit.parent_invoice_id)) {
    throw new Error("Keine ausgestellte Gutschrift gefunden.");
  }
  const { data: parent, error: parentError } = rentalCredit ? { data: credit, error: null } : await service.from("inquiry_invoices").select("*").eq("id", credit.parent_invoice_id).single();
  if (parentError || !parent) throw new Error("Ursprungsrechnung nicht gefunden.");
  const { data: previous, error: previousError } = await service.from("inquiry_invoices").select("gross_amount, created_at, id").eq("parent_invoice_id", parent.id).eq("invoice_kind", "credit_note").neq("status", "draft").neq("status", "cancelled");
  if (previousError) throw new Error("Gutschriften konnten nicht geprüft werden.");
  const before = (previous ?? []).filter((c: any) => c.created_at < credit.created_at || (c.created_at === credit.created_at && c.id < credit.id)).reduce((sum: number, c: any) => sum + Math.abs(toCents(Math.abs(Number(c.gross_amount)))), 0);
  const creditCents = toCents(Math.abs(Number(credit.gross_amount)));
  const outstandingBefore = Math.max(0, toCents(parent.gross_amount) - before);
  const paid = toCents(parent.paid_amount);
  const calculated = Math.min(creditCents, Math.max(0, paid - Math.max(0, outstandingBefore - creditCents)) - Math.max(0, paid - outstandingBefore));
  const eligible = rentalCredit ? Math.max(0, toCents(credit.paid_amount) - toCents(credit.gross_amount)) : credit.credit_refund_amount == null ? calculated : Math.min(calculated, toCents(credit.credit_refund_amount));
  if (rentalCredit) {
    const { data: siblings, error } = await service.from("inquiry_invoices").select("id").eq("rental_inquiry_id", credit.rental_inquiry_id).neq("id", creditId).neq("status", "draft").neq("status", "cancelled");
    if (error || siblings?.length) throw new Error("Weitere Rechnungen oder Korrekturen erfordern gesonderte Abrechnung.");
  }
  const { data: existing, error: existingError } = await service.from("credit_note_refunds").select("*").eq("credit_note_id", creditId).maybeSingle();
  if (existingError) throw new Error("Erstattungsstatus konnte nicht geprüft werden.");
  const stripe = stripeClient();
  if (existing) {
    for (const allocation of existing.allocations) {
      const intent = await stripe.paymentIntents.retrieve(allocation.payment_intent);
      if (intent.livemode !== !isStripeTestMode()) throw new Error("Die Zahlung stammt aus einem anderen Stripe-Modus (Test/Live).");
    }
    if (["succeeded", "pending", "partial_failed", "failed"].includes(existing.status) && existing.allocations.every((a: any) => a.refund_id)) return { success: true, amount_cents: existing.amount_cents, status: existing.status, already_requested: true };
  }
  let allocations = existing?.allocations;
  if (!existing) {
    let remaining = eligible;
    allocations = [];
    const seen = new Set<string>();
    for (const p of Array.isArray(parent.payments) ? parent.payments : []) {
      if (remaining <= 0) break;
      const ref = String(p.reference ?? "");
      if (!ref.startsWith("cs_") && !ref.startsWith("pi_")) continue;
      let intentId = ref;
      if (ref.startsWith("cs_")) {
        const session = await stripe.checkout.sessions.retrieve(ref);
        if (session.payment_status !== "paid") continue;
        intentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? "";
      }
      if (!intentId || seen.has(intentId)) continue;
      seen.add(intentId);
      const intent = await stripe.paymentIntents.retrieve(intentId, { expand: ["latest_charge"] });
      if (intent.livemode !== !isStripeTestMode()) throw new Error("Die Zahlung stammt aus einem anderen Stripe-Modus (Test/Live).");
      const charge = intent.latest_charge;
      if (intent.status !== "succeeded" || intent.currency !== "eur" || !charge || typeof charge === "string") continue;
      let used = 0;
      let rentRefunded = 0;
      for await (const refund of stripe.refunds.list({ payment_intent: intentId, limit: 100 })) {
        if (!["failed", "canceled"].includes(refund.status ?? "pending")) {
          used += refund.amount;
          // Known deposit refunds consume charge balance, not the rent allocation.
          // Unknown/manual refunds are conservatively attributed to rent.
          if (refund.metadata?.kind !== "deposit") rentRefunded += refund.amount;
        }
      }
      // Invoice payment snapshot caps the amount attributable to this invoice (not deposit).
      const available = Math.max(0, Math.min(toCents(p.amount) - rentRefunded, charge.amount - used));
      const amount = Math.min(remaining, available);
      if (amount > 0) {
        allocations.push({ payment_intent: intentId, amount_cents: amount, status: "creating" });
        remaining -= amount;
      }
    }
    if (remaining > 0 || eligible <= 0) throw new Error("Kein vollständig zuordenbarer Stripe-Erstattungsbetrag verfügbar. Bereits erfolgte Erstattungen und Verrechnungen werden berücksichtigt.");
  }
  if (!execute) return { success: true, amount_cents: existing?.amount_cents ?? eligible, status: existing && allocations.some((a: any) => !a.refund_id) ? "creating" : existing?.status ?? "available" };
  if (!existing) {
    const { error } = await service.from("credit_note_refunds").insert({ credit_note_id: creditId, amount_cents: eligible, allocations, created_by: userId, ...(rentalCredit ? { refund_kind: "rental_credit", receipt_snapshot: { invoice_number: credit.invoice_number, customer_name: credit.customer_name, company_name: credit.company_name, location: credit.location, paid_amount: credit.paid_amount, gross_amount: credit.gross_amount, amount_cents: eligible } } : {}) });
    if (error) throw new Error("Die Erstattung wird bereits vorbereitet. Bitte Status neu laden.");
  }
  for (const allocation of allocations) {
    if (allocation.refund_id) continue;
    // Persisted plan + stable keys survive double clicks, timeouts and browser restarts.
    let knownRefund;
    for await (const candidate of stripe.refunds.list({ payment_intent: allocation.payment_intent, limit: 100 })) {
      if (candidate.metadata?.credit_note_id === creditId) {
        if (candidate.amount !== allocation.amount_cents) throw new Error("Erstattung stimmt nicht mit dem gespeicherten Anspruch überein.");
        knownRefund = candidate; break;
      }
    }
    if (!knownRefund && existing && new Date(existing.created_at).getTime() < Date.now() - 23 * 60 * 60 * 1000) throw new Error("Älterer Erstattungsversuch ist ungeklärt. Erst den Zahlungsstatus abgleichen; keine neue Erstattung auslösen.");
    if (!knownRefund) await reconcileRefundsBeforeExecution(service, stripe, allocation.payment_intent, !isStripeTestMode());
    const refund = knownRefund ?? await stripe.refunds.create({ payment_intent: allocation.payment_intent, amount: allocation.amount_cents, reason: "requested_by_customer", metadata: { credit_note_id: creditId, invoice_number: credit.invoice_number, kind: "credit_note" } }, { idempotencyKey: `credit-${creditId}-${allocation.payment_intent}` });
    const { error } = await service.rpc("sync_credit_note_refund_v2", { _credit_id: creditId, _intent: allocation.payment_intent, _refund_id: refund.id, _status: refund.status ?? "pending", _amount: refund.amount });
    if (error) throw new Error("Stripe hat die Erstattung angenommen; der Status muss erneut abgefragt werden. Nicht manuell erneut erstatten.");
  }
  const { data: result } = await service.from("credit_note_refunds").select("status, amount_cents").eq("credit_note_id", creditId).single();
  return { success: true, ...result };
}