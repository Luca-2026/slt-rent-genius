import { stripeClient, isStripeTestMode } from "./stripe-pay.ts";
import { reconcileStripeRefund, reconcileRefundsBeforeExecution } from "./refund-reconciliation.ts";
import { allocateOrderRefund } from "./order-refund-math.ts";

export async function orderRefund(service: any, actor: string, body: any) {
  const { data: inquiry, error } = await service.from("rental_inquiries").select("id,location,payments,cancelled_at,cancellation_payload").eq("id", body.inquiry_id).single();
  if (error || !inquiry) throw new Error("Auftrag nicht gefunden");
  const { data: admin } = await service.rpc("has_role", { _user_id: actor, _role: "admin" });
  const { data: canEdit } = await service.rpc("can_edit_operations", { _user_id: actor });
  const { data: staff } = await service.from("staff_profiles").select("location").eq("user_id", actor).eq("is_active", true).maybeSingle();
  const normalize = (s: string) => /bonn/i.test(s) ? "bonn" : /krefeld|mülheim|muelheim/i.test(s) ? "krefeld" : s;
  if (!canEdit || (!admin && (!staff || normalize(staff.location) !== normalize(inquiry.location)))) throw new Error("Keine Standortberechtigung");
  const { data: manager } = await service.rpc("has_role", { _user_id: actor, _role: "niederlassungsleiter" });
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
  if (body.action === "order_refund_confirm_manual") {
    const { error } = await service.rpc("confirm_order_refund_manual", { _id: body.request_id, _actor: actor, _reference: body.reference });
    if (error) throw new Error(error.message);
  }
  if (body.action === "order_refund_execute") {
    let request = requests?.find((r: any) => r.id === body.request_id);
    if (!request) {
      if (totals.pending || totals.blocked_reason) throw new Error(totals.blocked_reason ?? "Erstattung bereits in Bearbeitung");
      if (body.deposit_cents > totals.deposit_available || body.rent_cents > totals.rent_available) throw new Error("Betrag übersteigt verbleibenden Anspruch");
      if (body.rent_cents > 0 && !admin && !manager) throw new Error("Keine Berechtigung für Mieterstattungen");
      const payments = inquiry.payments ?? [];
      const method = links?.length ? "stripe" : payments.length && payments.every((p: any) => /überweisung|ueberweisung|bank/i.test(p.label ?? "")) ? "transfer" : payments.length && payments.every((p: any) => /^bar/i.test(p.label ?? "")) ? "cash" : null;
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
  return { success: true, ...finalTotals, can_refund_rent: Boolean(admin || manager), requests: finalRequests };
}