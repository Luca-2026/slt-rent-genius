import { stripeClient, isStripeTestMode } from "./stripe-pay.ts";
import { reconcileStripeRefund, reconcileRefundsBeforeExecution } from "./refund-reconciliation.ts";
import { allocateOrderRefund } from "./order-refund-math.ts";
import { assertFinanceLocation, loadFinanceActor } from "./finance-scope.ts";

/** Original payment method of a rental order: stripe links, else uniform bank or cash receipts, else null (mixed/unknown). */
export function manualPayoutMethod(payments: any[]): "transfer" | "cash" | null {
  if (!payments.length || payments.some((p: any) => /^(pi_|cs_)/.test(String(p?.reference ?? "")))) return null;
  if (payments.every((p: any) => /überweisung|ueberweisung|bank/i.test(p?.label ?? ""))) return "transfer";
  if (payments.every((p: any) => /^bar/i.test(p?.label ?? ""))) return "cash";
  return null;
}

export async function orderRefund(service: any, actor: string, body: any) {
  const { data: inquiry, error } = await service.from("rental_inquiries").select("id,location,payments,cancelled_at,cancellation_payload").eq("id", body.inquiry_id).single();
  if (error || !inquiry) throw new Error("Auftrag nicht gefunden");
  const scope = await loadFinanceActor(service, actor);
  try { assertFinanceLocation(scope, inquiry.location); } catch (e) { throw new Error(`Keine Standortberechtigung: ${(e as Error).message}`); }
  const admin = scope.admin, manager = scope.manager;
  const { data: links, error: linkError } = await service.from("offer_payment_links").select("id,payment_intent_id,livemode,paid_cents").eq("inquiry_id", inquiry.id).eq("inquiry_table", "rental_inquiries").eq("status", "paid");
  if (linkError) throw new Error("Originalzahlungen nicht lesbar");
  const stripe = links?.length ? stripeClient() : null;
  if (body.action === "order_refund_sync") {
    for (const link of links ?? []) {
      if (link.livemode !== !isStripeTestMode()) throw new Error("Zahlungsmodus nicht zuordenbar");
      for await (const refund of stripe.refunds.list({ payment_intent: link.payment_intent_id, limit: 100 })) await reconcileStripeRefund(service, refund, link.livemode);
    }
  }
  const { data: totals, error: totalError } = await service.rpc("order_refund_totals", { _inquiry: inquiry.id });
  if (totalError) throw new Error(totalError.message);
  const { data: requests, error: requestError } = await service.from("order_refund_requests").select("*").eq("inquiry_id", inquiry.id).order("created_at", { ascending: false });
  if (requestError) throw new Error("Erstattungsstatus nicht lesbar");
  // Cancelled orders paid only by cash or bank: a manual payout is reserved, then confirmed with evidence.
  // No provider call happens on this path, so it is not covered by the live gate for combined Stripe execution.
  const manualMethod = links?.length ? null : manualPayoutMethod(inquiry.payments ?? []);
  const manualCancelled = Boolean(inquiry.cancelled_at) && manualMethod !== null;
  if (body.action === "order_refund_confirm_manual") {
    const target = requests?.find((r: any) => r.id === body.request_id);
    if (!target) throw new Error("Erstattungsauftrag gehört nicht zu diesem Auftrag");
    if (target.payout_method === "stripe") throw new Error("Stripe-Erstattungen werden nur über den Providerbeleg bestätigt.");
    const { error } = await service.rpc("confirm_manual_order_refund", { _id: body.request_id, _actor: actor, _reference: body.reference, _paid_on: body.paid_on });
    if (error) throw new Error(/PGRST202|Could not find the function/i.test(`${error.code} ${error.message}`) ? "Bestätigung mit Auszahlungsdatum ist noch nicht freigeschaltet (Datenbankfreigabe ausstehend). Nichts wurde bestätigt." : error.message);
  }
  if (body.action === "order_refund_execute") {
    let request = requests?.find((r: any) => r.id === body.request_id);
    if (!request && inquiry.cancelled_at && !links?.length && !manualMethod) throw new Error("Gemischte oder nicht eindeutige Zahlungswege: Rückzahlung bitte durch einen Admin zuordnen lassen. Nichts wurde ausgezahlt.");
    const manualOnly = request ? request.payout_method !== "stripe" && manualCancelled : manualCancelled && body.rent_cents === 0;
    if (!isStripeTestMode() && !manualOnly) throw new Error("Gemeinsame Live-Erstattung noch nicht freigegeben: isolierte Zahlungsprüfung ausstehend. Historische Auszahlungen bleiben erhalten.");
    if (!request) {
      if (totals.pending || totals.blocked_reason) throw new Error(totals.blocked_reason ?? "Erstattung bereits in Bearbeitung");
      if (body.deposit_cents > totals.deposit_available || body.rent_cents > totals.rent_available) throw new Error("Betrag übersteigt verbleibenden Anspruch");
      if (body.rent_cents > 0 && !admin && !manager) throw new Error("Keine Berechtigung für Mieterstattungen");
      const method = links?.length ? "stripe" : manualMethod;
      if (!method) throw new Error("Gemischte Zahlungswege benötigen eine eindeutige Zuordnung");
      const receipts = [];
      for (const link of links ?? []) {
        if (link.livemode !== !isStripeTestMode()) throw new Error("Zahlungsmodus nicht zuordenbar");
        await reconcileRefundsBeforeExecution(service, stripe, link.payment_intent_id, link.livemode);
        const intent = await stripe.paymentIntents.retrieve(link.payment_intent_id, { expand: ["latest_charge"] });
        if (intent.status !== "succeeded" || intent.currency !== "eur" || typeof intent.latest_charge === "string" || !intent.latest_charge) throw new Error("Originalzahlung nicht bestätigt");
        let used = 0;
        for await (const refund of stripe.refunds.list({ payment_intent: link.payment_intent_id, limit: 100 })) if (!["failed", "canceled"].includes(refund.status ?? "pending")) used += refund.amount;
        receipts.push({ payment_intent: link.payment_intent_id, link_id: link.id, available: Math.max(0, Math.min(link.paid_cents, intent.latest_charge.amount) - used) });
      }
      const allocations = method === "stripe" ? allocateOrderRefund(body.deposit_cents, body.rent_cents, receipts) : [];
      const { data, error } = await service.rpc("reserve_order_refund", { _id: body.request_id, _inquiry: inquiry.id, _actor: actor, _deposit: body.deposit_cents, _rent: body.rent_cents, _method: method, _allocations: allocations });
      if (error) throw new Error(error.message);
      request = data;
    }
    if (request.inquiry_id !== inquiry.id || request.deposit_cents !== body.deposit_cents || request.rent_cents !== body.rent_cents) throw new Error("Gespeicherter Erstattungsauftrag darf nicht geändert werden");
    if (request.rent_cents > 0 && !admin && !manager) throw new Error("Keine Berechtigung für Mieterstattungen");
    if (request.payout_method === "stripe" && request.status !== "succeeded") {
      if (!stripe) throw new Error("Originalzahlung nicht lesbar");
      for (const allocation of request.allocations) {
        if (allocation.refund_id) continue;
        let known;
        for await (const r of stripe.refunds.list({ payment_intent: allocation.payment_intent, limit: 100 })) if (r.metadata?.order_refund_request === request.id) { known = r; break; }
        if (known && known.amount !== allocation.amount_cents) throw new Error("Providerbetrag weicht ab");
        if (!known && Date.now() - new Date(request.created_at).getTime() > 23 * 3600000) throw new Error("Älterer Versuch ungeklärt. Nur Status prüfen.");
        if (!known) await reconcileRefundsBeforeExecution(service, stripe, allocation.payment_intent, !isStripeTestMode());
        const refund = known ?? await stripe.refunds.create({ payment_intent: allocation.payment_intent, amount: allocation.amount_cents, reason: "requested_by_customer", metadata: { order_refund_request: request.id, kind: "combined", deposit_cents: String(allocation.deposit_cents), rent_cents: String(allocation.rent_cents) } }, { idempotencyKey: `order-refund-${request.id}-${allocation.payment_intent}` });
        await reconcileStripeRefund(service, refund, !isStripeTestMode());
      }
    }
  }
  const { data: finalTotals, error: finalError } = await service.rpc("order_refund_totals", { _inquiry: inquiry.id });
  const { data: finalRequests, error: finalRequestError } = await service.from("order_refund_requests").select("*").eq("inquiry_id", inquiry.id).order("created_at", { ascending: false });
  if (finalError || finalRequestError) throw new Error("Erstattungsstatus ungeklärt; nicht zusätzlich auszahlen");
  return { success: true, ...finalTotals, execution_available: isStripeTestMode(), manual_cancel_refund_available: manualCancelled, manual_method: manualMethod, can_refund_rent: Boolean(admin || manager), requests: finalRequests };
}