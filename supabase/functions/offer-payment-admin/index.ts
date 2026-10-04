/**
 * Mitarbeiter-Funktionen zur Online-Zahlung (Bearer-Auth, Rollenprüfung serverseitig):
 *  - create_link:     Zahlungslink zu einem bereits versendeten Angebot erzeugen (alle Mitarbeiter)
 *  - refund_deposit:  Kaution ganz oder teilweise zurück aufs ursprüngliche Zahlungsmittel
 *                     (nur Admin und Niederlassungsleiter; Standortmitarbeiter nicht)
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://esm.sh/zod@3.23.8";
import { LOCATION_CONTACTS, resolveLocationKey } from "../_shared/inquiry-offer-math.ts";
import { documentEmailRecipients } from "../_shared/test-email-routing.ts";
import { creditRefund } from "../_shared/credit-refund.ts";
import {
  ensurePaymentLink,
  isStripeConfigured,
  isStripeTestMode,
  planPaymentAmounts,
  refundableDepositCents,
  stripeClient,
  toCents,
} from "../_shared/stripe-pay.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const money = (cents: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const Body = z.discriminatedUnion("action", [
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
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
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
    if (!isStripeConfigured()) return json({ error: "Stripe ist nicht eingerichtet" }, 503);

    if (body.action === "create_link") {
      const table = body.inquiry_type === "rental" ? "rental_inquiries" : "sales_inquiries";
      const { data: inquiry } = await service
        .from(table)
        .select("id, offer_number, offer_total_gross, offer_payload, payments, customer_email")
        .eq("id", body.inquiry_id)
        .maybeSingle();
      if (!inquiry) return json({ error: "Anfrage nicht gefunden" }, 404);
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
      .in("role", ["admin", "niederlassungsleiter"]);
    if (!roleRows || roleRows.length === 0) return json({ error: "Keine Berechtigung für Kautionserstattungen" }, 403);

    if (body.action === "refund_credit_note" || body.action === "credit_refund_info") {
      try {
        return json(await creditRefund(service, body.credit_note_id, user.id, body.action === "refund_credit_note"));
      } catch (error) {
        console.error("Gutschrifterstattung konnte nicht abgeschlossen werden");
        return json({ error: error instanceof Error ? error.message : "Erstattung nicht möglich." }, 409);
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

    // Reservieren, dann Gesamtgrenze erneut prüfen (verhindert parallele Doppelerstattung)
    const { data: reserved, error: insErr } = await service
      .from("deposit_refunds")
      .insert({
        link_id: link.id,
        amount_cents: body.amount_cents,
        status: "creating",
        reason: body.reason ?? null,
        created_by: user.id,
        created_by_name: user.email ?? null,
      })
      .select("id")
      .single();
    if (insErr || !reserved) return json({ error: "Erstattung konnte nicht vorbereitet werden" }, 500);
    const { data: all } = await service.from("deposit_refunds").select("id, amount_cents, status").eq("link_id", link.id);
    const others = (all ?? []).filter((r: { id: string }) => r.id !== reserved.id);
    const remaining = refundableDepositCents(link.deposit_cents, others);
    if (body.amount_cents > remaining) {
      await service.from("deposit_refunds").delete().eq("id", reserved.id);
      return json({ error: `Es sind höchstens ${money(remaining)} Kaution erstattbar.` }, 409);
    }

    const stripe = stripeClient();
    try {
      const refund = await stripe.refunds.create(
        {
          payment_intent: link.payment_intent_id,
          amount: body.amount_cents,
          reason: "requested_by_customer",
          metadata: { link_id: link.id, offer_number: link.offer_number, kind: "deposit", note: body.reason ?? "" },
        },
        { idempotencyKey: `deposit-refund-${body.request_id}` },
      );
      await service
        .from("deposit_refunds")
        .update({ stripe_refund_id: refund.id, status: refund.status ?? "pending", updated_at: new Date().toISOString() })
        .eq("id", reserved.id);

      // Kundenmail (Testkunde → keine Kopien)
      const resendKey = Deno.env.get("RESEND_API_KEY");
      let mailed = false;
      if (resendKey && link.customer_email) {
        const { data: inq } = await service
          .from(link.inquiry_table)
          .select("location")
          .eq("id", link.inquiry_id)
          .maybeSingle();
        const loc = LOCATION_CONTACTS[resolveLocationKey(inq?.location)];
        const rcpt = documentEmailRecipients(link.customer_email, [loc.email]);
        const partial = body.amount_cents < link.deposit_cents;
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
            to: rcpt.to,
            ...(rcpt.cc.length ? { cc: rcpt.cc } : {}),
            subject: `Ihre Kaution wird erstattet – Angebot ${link.offer_number}`,
            html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#1a1a1a;"><p>Guten Tag,</p><p>wir erstatten Ihnen <strong>${money(body.amount_cents)}</strong> Ihrer Kaution${partial ? ` (von ${money(link.deposit_cents)})` : ""} zu Angebot ${esc(link.offer_number)} auf das Zahlungsmittel, mit dem Sie bezahlt haben.</p>${body.reason ? `<p>Hinweis: ${esc(body.reason)}</p>` : ""}<p>Die Gutschrift erscheint je nach Bank in der Regel innerhalb von 5–10 Werktagen.</p><p>Freundliche Grüße<br>Ihr SLT Rental Team – Standort ${esc(loc.name)}<br>Tel. ${esc(loc.phone)} · ${esc(loc.email)}</p></div>`,
          }),
        });
        mailed = res.ok;
        if (!res.ok) console.error("Erstattungsmail fehlgeschlagen:", res.status);
      }
      return json({ success: true, refund_id: refund.id, status: refund.status, customer_mailed: mailed });
    } catch (err) {
      await service.from("deposit_refunds").delete().eq("id", reserved.id).is("stripe_refund_id", null);
      console.error("Stripe-Erstattung fehlgeschlagen:", (err as Error).message);
      return json({ error: "Stripe konnte die Erstattung nicht ausführen. Bitte später erneut versuchen." }, 502);
    }
  } catch (err) {
    console.error("offer-payment-admin error:", err);
    return json({ error: "Interner Fehler" }, 500);
  }
});
