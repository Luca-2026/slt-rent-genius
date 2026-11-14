import { onlineOfferPaymentAllowed } from "../_shared/sales-offer.ts";
import { reconcileRefundsBeforeExecution, reconcileStripeRefund } from "../_shared/refund-reconciliation.ts";
import { selectStaffRentalPayment } from "../_shared/staff-payment-decision.ts";
import { recordRentalPayments } from "../_shared/record-rental-payments.ts";
/**
 * Mitarbeiter-Funktionen zur Online-Zahlung (Bearer-Auth, Rollenprüfung serverseitig):
 *  - create_link:     Zahlungslink zu einem bereits versendeten Angebot erzeugen (alle Mitarbeiter)
 *  - refund_deposit:  Kaution ganz oder teilweise zurück aufs ursprüngliche Zahlungsmittel
 *                     (Admin, Niederlassungsleitung und Standortmitarbeiter; Gutschrift-Erstattungen nur Admin/Niederlassungsleitung)
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { creditRefund } from "../_shared/credit-refund.ts";
import { rentalCreditRefund } from "../_shared/rental-credit-refund.ts";
import { preInvoiceRefund } from "../_shared/pre-invoice-refund.ts";
import {
  ensurePaymentLink,
  isStripeConfigured,
  isStripeTestMode,
  planPaymentAmounts,
  stripeClient,
  toCents,
} from "../_shared/stripe-pay.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("order_credit_info"), inquiry_id: z.string().uuid() }),
  z.object({ action: z.literal("refund_order_credit"), inquiry_id: z.string().uuid() }),
  z.object({ action: z.literal("confirm_order_credit_transfer"), inquiry_id: z.string().uuid(), bank_reference: z.string().trim().min(3).max(200) }),
  z.object({ action: z.literal("sync_deposit_refunds"), inquiry_id: z.string().uuid() }),
  z.object({ action: z.literal("rental_credit_info"), invoice_id: z.string().uuid() }),
  z.object({ action: z.literal("refund_rental_credit"), invoice_id: z.string().uuid() }),
  z.object({ action: z.literal("confirm_rental_credit_transfer"), invoice_id: z.string().uuid(), bank_reference: z.string().trim().min(3).max(200) }),
  z.object({ action: z.literal("record_payments"), inquiry_id: z.string().uuid(), expected_payments: z.array(z.record(z.unknown())), payments: z.array(z.record(z.unknown())) }),
  z.object({ action: z.literal("select_method"), inquiry_id: z.string().uuid(), method: z.enum(["bank", "regular"]) }),
  z.object({ action: z.literal("credit_refund_info"), credit_note_id: z.string().uuid() }),
  z.object({ action: z.literal("refund_credit_note"), credit_note_id: z.string().uuid() }),
  z.object({
    action: z.literal("create_link"),
    inquiry_type: z.enum(["rental", "sales"]),
    inquiry_id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("refund_deposit"),
    link_id: z.string().uuid(),
    amount_cents: z.number().int().positive().max(10_000_000),
    reason: z.string().trim().max(300).optional(),
    request_id: z.string().uuid(),
  }),
]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const service = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
      auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await service.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const { data: isStaff } = await service.rpc("is_staff_member", { _user_id: user.id });
    if (!isStaff) return json({ error: "Keine Berechtigung" }, 403);

    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Ungültige Anfrage" }, 400);
    const body = parsed.data;
    if (["order_credit_info", "refund_order_credit", "confirm_order_credit_transfer"].includes(body.action) && "inquiry_id" in body) {
      const { data: roles, error: roleError } = await service.from("user_roles").select("role").eq("user_id", user.id).in("role", ["admin", "niederlassungsleiter"]);
      if (roleError || !roles?.length) return json({ error: "Keine Berechtigung für Mietguthabenerstattungen" }, 403);
      try { return json(await preInvoiceRefund(service, body.inquiry_id, user.id, body.action, "bank_reference" in body ? body.bank_reference : undefined)); }
      catch (error) { return json({ success: false, error: error instanceof Error ? error.message : "Erstattungsstatus ungeklärt" }, 409); }
    }
    if (body.action === "record_payments") {
      try { return json(await recordRentalPayments(service, body.inquiry_id, user.id, body.expected_payments, body.payments)); }
      catch (error) { return json({ error: error instanceof Error ? error.message : "Zahlungen nicht gespeichert" }, 409); }
    }
    if (body.action === "select_method") {
      const { data: canEdit } = await service.rpc("can_edit_operations", { _user_id: user.id });
      if (!canEdit) return json({ error: "Keine Berechtigung für Zahlungsänderungen" }, 403);
      try { return json(await selectStaffRentalPayment(service, body.inquiry_id, body.method)); }
      catch (error) { return json({ error: error instanceof Error ? error.message : "Zahlungsänderung nicht möglich" }, 409); }
    }
    if (body.action === "rental_credit_info" || body.action === "refund_rental_credit" || body.action === "confirm_rental_credit_transfer") {
      const { data: roles, error: roleError } = await service.from("user_roles").select("role").eq("user_id", user.id).in("role", ["admin", "niederlassungsleiter"]);
      if (roleError || !roles?.length) return json({ error: "Keine Berechtigung für Mietguthabenerstattungen" }, 403);
      try { return json(await rentalCreditRefund(service, body.invoice_id, user.id, body.action, body.action === "confirm_rental_credit_transfer" ? body.bank_reference : undefined)); }
      catch (error) { const message = error instanceof Error ? error.message : "Erstattungsstatus ungeklärt"; return json({ success: false, error: /[rs]k_(live|test)_/.test(message) ? "Erstattungsstatus ungeklärt. Nicht zusätzlich auszahlen." : message }, 409); }
    }
    if (!isStripeConfigured()) return json({ error: "Stripe ist nicht eingerichtet" }, 503);

    if (body.action === "create_link") {
      if (!onlineOfferPaymentAllowed(body.inquiry_type === "sales" ? "sales_inquiries" : "rental_inquiries")) return json({ error: "Verkaufsangebote werden ausschließlich per Banküberweisung bezahlt." }, 400);
      const table = body.inquiry_type === "rental" ? "rental_inquiries" : "sales_inquiries";
      const { data: inquiry } = await service
        .from(table)
        .select("id, offer_number, offer_total_gross, offer_payload, payments, customer_email, status")
        .eq("id", body.inquiry_id)
        .maybeSingle();
      if (!inquiry) return json({ error: "Anfrage nicht gefunden" }, 404);
      if (inquiry.status === "cancelled") return json({ error: "Stornierter Auftrag: keinen Zahlungslink zum Originalangebot anlegen." }, 409);
      if (!inquiry.offer_number || !(Number(inquiry.offer_total_gross) > 0)) {
        return json({ error: "Zu dieser Anfrage wurde noch kein Angebot versendet." }, 409);
      }
      const paidCents = (Array.isArray(inquiry.payments) ? inquiry.payments : []).reduce(
        (s: number, p: { amount?: unknown }) => s + toCents(p?.amount),
        0,
      );
      const deposit = Number((inquiry.offer_payload as { deposit?: unknown } | null)?.deposit) || 0;
      const plan = planPaymentAmounts({ gross: inquiry.offer_total_gross, deposit, paidCents });
      if (plan.openCents <= 0) return json({ error: "Das Angebot ist bereits vollständig bezahlt." }, 409);
      const link = await ensurePaymentLink(service, {
        table,
        inquiryId: inquiry.id,
        customerEmail: inquiry.customer_email,
        offerNumber: inquiry.offer_number,
        plan,
        createdBy: user.id,
      });
      if (!link) return json({ error: "Zahlungslink konnte nicht erstellt werden" }, 500);
      return json({ success: true, url: link.url, amount_cents: plan.openCents, test_mode: isStripeTestMode() });
    }

    // ── Kautionserstattung ──
    const { data: roleRows } = await service
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "niederlassungsleiter", "standort_mitarbeiter"]);
    const roles = (roleRows ?? []).map((row: { role: string }) => row.role);
    if (!roles.length) return json({ error: "Keine Berechtigung für Kautionserstattungen" }, 403);
    const isCreditAction = body.action === "refund_credit_note" || body.action === "credit_refund_info";
    if (isCreditAction && !roles.some(role => role === "admin" || role === "niederlassungsleiter")) return json({ error: "Keine Berechtigung für Gutschrift-Erstattungen" }, 403);

    if (body.action === "refund_credit_note" || body.action === "credit_refund_info") {
      try {
        const execute = body.action === "refund_credit_note";
        const result: any = await creditRefund(service, body.credit_note_id, user.id, execute);
        // Refund evidence is provided by the invoice, not a separate customer email.
        result.customer_mailed = false;
        return json(result);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "";
        console.error("Gutschrifterstattung konnte nicht abgeschlossen werden");
        // Fachliche Ablehnung als 200 + success:false, damit die Oberfläche eine Meldung zeigt statt abzubrechen.
        const permission = /permission|does not have the required permissions|charge_write|rak_/i.test(msg);
        return json({
          success: false,
          error: permission
            ? "Erstattungsberechtigung fehlt. Der Status kann teilweise offen sein; bitte abgleichen und nicht manuell zusätzlich erstatten."
            : (msg && !/rk_(live|test)_|sk_(live|test)_/.test(msg) ? msg : "Erstattungsstatus ungeklärt. Bitte abgleichen und nicht manuell zusätzlich erstatten."),
        });
      }
    }

    if (body.action === "sync_deposit_refunds") {
      const { data: links, error } = await service.from("offer_payment_links").select("payment_intent_id,livemode").eq("inquiry_table", "rental_inquiries").eq("inquiry_id", body.inquiry_id).eq("status", "paid");
      if (error) return json({ success: false, error: "Originalzahlungen konnten nicht geprüft werden." }, 409);
      try {
        const stripe = stripeClient();
        for (const link of links ?? []) {
          if (!link.payment_intent_id || link.livemode !== !isStripeTestMode()) throw new Error("Zahlungsmodus nicht zuordenbar.");
          for await (const refund of stripe.refunds.list({ payment_intent: link.payment_intent_id, limit: 100 })) await reconcileStripeRefund(service, refund, link.livemode);
        }
        return json({ success: true, status: "synced" });
      } catch {
        return json({ success: false, error: "Erstattungsstatus nicht bestätigt. Es wurde keine neue Auszahlung ausgelöst; nicht zusätzlich erstatten." }, 409);
      }
    }

    const { data: link } = await service.from("offer_payment_links").select("*").eq("id", body.link_id).maybeSingle();
    if (!link || link.status !== "paid" || !link.payment_intent_id) {
      return json({ error: "Zu diesem Angebot liegt keine bezahlte Online-Zahlung vor." }, 409);
    }
    if (link.deposit_cents <= 0) return json({ error: "Mit dieser Zahlung wurde keine Kaution bezahlt." }, 409);
    if (link.livemode !== !isStripeTestMode()) {
      return json({ error: "Die Zahlung stammt aus einem anderen Stripe-Modus (Test/Live)." }, 409);
    }

    // Stable database request + shared trigger serialize deposit/credit capacity.
    const { data: prior, error: priorErr } = await service.from("deposit_refunds").select("*").eq("request_id", body.request_id).maybeSingle();
    if (priorErr) return json({ error: "Erstattungsstatus konnte nicht sicher geprüft werden." }, 409);
    if (prior && (prior.link_id !== link.id || prior.amount_cents !== body.amount_cents)) return json({ error: "Der gespeicherte Erstattungsauftrag darf nicht geändert werden." }, 409);
    if (prior?.stripe_refund_id) return json({ success: !["failed", "canceled"].includes(prior.status), refund_id: prior.stripe_refund_id, status: prior.status, already_requested: true });
    const reservation = prior ? { data: prior, error: null } : await service.from("deposit_refunds").insert({
        id: body.request_id,
        request_id: body.request_id,
        link_id: link.id,
        amount_cents: body.amount_cents,
        status: "creating",
        reason: body.reason ?? null,
        created_by: user.id,
        created_by_name: user.email ?? null,
      })
      .select("*")
      .single();
    const reserved = reservation.data;
    if (reservation.error || !reserved) return json({ error: "Erstattung nicht reserviert: Betrag oder Erstattungsstatus prüfen und neu laden." }, 409);

    const stripe = stripeClient();
    try {
      let knownRefund;
      for await (const candidate of stripe.refunds.list({ payment_intent: link.payment_intent_id, limit: 100 })) {
        if (candidate.metadata?.deposit_refund_id === reserved.id) { knownRefund = candidate; break; }
      }
      if (!knownRefund && prior && new Date(prior.created_at).getTime() < Date.now() - 23 * 60 * 60 * 1000) return json({ error: "Älterer Erstattungsversuch ist ungeklärt. Erst den Zahlungsstatus abgleichen; keine neue Erstattung auslösen." }, 409);
      if (!knownRefund) await reconcileRefundsBeforeExecution(service, stripe, link.payment_intent_id, !isStripeTestMode());
      const refund = knownRefund ?? await stripe.refunds.create(
        {
          payment_intent: link.payment_intent_id,
          amount: body.amount_cents,
          reason: "requested_by_customer",
          metadata: { link_id: link.id, deposit_refund_id: reserved.id, offer_number: link.offer_number, kind: "deposit", note: body.reason ?? "" },
        },
        { idempotencyKey: `deposit-refund-${body.request_id}` },
      );
      await reconcileStripeRefund(service, refund, !isStripeTestMode());

      // Keep the persisted refund result independent of email delivery.
      return json({ success: true, refund_id: refund.id, status: refund.status, customer_mailed: false });
    } catch (err) {
      console.error("Stripe-Erstattungsstatus ungeklärt; Reservierung bleibt erhalten.");
      return json({ error: "Erstattungsstatus ist ungeklärt. Derselbe Erstattungsauftrag bleibt reserviert; nicht manuell zusätzlich erstatten." }, 502);
    }
  } catch (err) {
    console.error("offer-payment-admin error:", err);
    return json({ error: "Interner Fehler" }, 500);
  }
});
