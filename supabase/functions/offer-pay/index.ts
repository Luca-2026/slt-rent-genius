import { onlineOfferPaymentAllowed } from "../_shared/sales-offer.ts";
/**
 * Öffentlicher Zahlungslink zum Angebot (/zahlung/<token>).
 * Der unratbare Token ist das Geheimnis; Beträge kommen immer aus der Datenbank.
 *  - action "info": Betragsübersicht für die Zahlungsseite
 *  - action "checkout": frische Stripe-Checkout-Session (Miete + Kaution) und URL
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import {
  ALLOWED_RETURN_ORIGINS,
  PAY_BASE,
  isStripeConfigured,
  isStripeTestMode,
  paymentOptions,
  planPaymentAmounts,
  stripeClient,
  toCents,
} from "../_shared/stripe-pay.ts";
import { SLT_COMPANY } from "../_shared/company.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => null);
    const token = typeof body?.token === "string" ? body.token : "";
    const action = body?.action === "checkout" ? "checkout" : "info";
    if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return json({ error: "Ungültiger Zahlungslink" }, 400);

    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const { data: link } = await service.from("offer_payment_links").select("*").eq("token", token).maybeSingle();
    if (!link) return json({ error: "Zahlungslink nicht gefunden" }, 404);
    if (!onlineOfferPaymentAllowed(link.inquiry_table)) return json({ error: "Verkaufsangebote werden ausschließlich per Banküberweisung bezahlt. Bitte nutze die Bankdaten im Angebot." }, 400);

    const { data: inquiry } = await service
      .from(link.inquiry_table)
      .select("id, offer_number, order_code, customer_email, payments, offer_total_gross, offer_payload")
      .eq("id", link.inquiry_id)
      .maybeSingle();
    if (!inquiry) return json({ error: "Zahlungslink nicht gefunden" }, 404);
    const { data: signBooking } = link.inquiry_table === "rental_inquiries"
      ? await service.from("sign_bookings").select("status,expires_at").eq("inquiry_id", inquiry.id).maybeSingle()
      : { data: null };

    // Aktueller Stand: nur die zuletzt versendete Angebotsfassung ist bezahlbar.
    let status: string = link.status;
    if (signBooking && (signBooking.status !== "reserved" || Date.parse(signBooking.expires_at) <= Date.now())) status = signBooking.status === "paid" ? "paid" : "superseded";
    if (status === "active" && inquiry.offer_number !== link.offer_number) status = "superseded";

    const paidCents = (Array.isArray(inquiry.payments) ? inquiry.payments : []).reduce(
      (s: number, p: { amount?: unknown }) => s + toCents(p?.amount),
      0,
    );
    const payload = (inquiry.offer_payload ?? {}) as { deposit?: unknown; payment_terms?: unknown };
    const deposit = Number(payload.deposit) || 0;
    const terms = typeof payload.payment_terms === "string" ? payload.payment_terms : "vorkasse";
    const plan = planPaymentAmounts({ gross: inquiry.offer_total_gross, deposit, paidCents });
    const options = paymentOptions({ gross: inquiry.offer_total_gross, deposit, paidCents, terms });
    if (status === "active" && plan.openCents <= 0) status = "paid";
    // Nach einer Anzahlung bleibt der Link für den Restbetrag gültig.
    if (!signBooking && status === "paid" && plan.openCents > 0 && inquiry.offer_number === link.offer_number) status = "active";

    const view = {
      status,
      offer_number: link.offer_number,
      order_code: inquiry.order_code ?? null,
      payment_terms: terms,
      paid_cents: paidCents,
      rent_cents: status === "active" ? plan.rentCents : link.rent_cents,
      deposit_cents: status === "active" ? plan.depositCents : link.deposit_cents,
      amount_cents: status === "active" ? plan.openCents : link.amount_cents,
      options: status === "active" ? options : [],
      bank: status === "active"
        ? { holder: SLT_COMPANY.name, iban: SLT_COMPANY.iban, bic: SLT_COMPANY.bic, bank: SLT_COMPANY.bankName, reference: inquiry.order_code ? `${link.offer_number} Auftrag ${inquiry.order_code}` : link.offer_number }
        : null,
    };
    if (action === "info") return json(view);

    if (status !== "active") return json({ error: "Dieser Zahlungslink ist nicht mehr gültig", ...view }, 409);
    if (!isStripeConfigured()) return json({ error: "Online-Zahlung ist derzeit nicht verfügbar" }, 503);
    if (signBooking && !isStripeTestMode()) {
      const { data: product } = await service.from("b2b_managed_products").select("direct_booking_config").eq("slug", "halteverbotsschilder-set").single();
      if (!product?.direct_booking_config?.live_enabled) return json({ error: "Stripe ist live eingerichtet. Echte Zahlungen für die Schilder-Testbuchung sind bis zur Freigabe gesperrt." }, 403);
    }

    const choice = body?.choice === "anzahlung" ? "anzahlung" : "full";
    const option = options.find((o) => o.choice === choice) ?? options.find((o) => o.choice === "full");
    if (!option) return json({ error: "Es ist kein Betrag mehr offen", ...view }, 409);

    const origin = ALLOWED_RETURN_ORIGINS.includes(String(body?.origin)) ? String(body.origin) : PAY_BASE;
    const stripe = stripeClient();
    const sessionExpires = signBooking ? Math.min(Math.floor(Date.parse(signBooking.expires_at) / 1000), Math.floor(Date.now() / 1000) + 23 * 3600) : Math.floor(Date.now() / 1000) + 23 * 3600;
    if (sessionExpires < Math.floor(Date.now() / 1000) + 1800) return json({ error: "Die Reservierung läuft in weniger als 30 Minuten ab. Bitte den Standort kontaktieren." }, 409);

    // frühere, noch offene Session beenden (verhindert Doppelzahlung)
    if (link.stripe_session_id) {
      try {
        await stripe.checkout.sessions.expire(link.stripe_session_id);
      } catch (_e) { /* bereits abgelaufen oder bezahlt */ }
    }

    const lineItems = [
      ...(option.rentCents > 0
        ? [{
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: option.rentCents,
            product_data: option.choice === "anzahlung"
              ? { name: `Anzahlung 30 % laut Angebot ${link.offer_number}${inquiry.order_code ? ` #${inquiry.order_code}` : ""}`, description: "Restbetrag und Kaution vor Mietbeginn" }
              : { name: `Miete laut Angebot ${link.offer_number}${inquiry.order_code ? ` #${inquiry.order_code}` : ""}`, description: "Bruttobetrag inkl. MwSt." },
          },
        }]
        : []),
      ...(option.depositCents > 0
        ? [{
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: option.depositCents,
            product_data: { name: "Kaution", description: "Wird nach Rückgabe des Mietgegenstands erstattet" },
          },
        }]
        : []),
    ];
    const metadata = {
      link_id: link.id,
      inquiry_table: link.inquiry_table,
      inquiry_id: link.inquiry_id,
      offer_number: link.offer_number,
      amount_cents: String(option.amountCents),
      rent_cents: String(option.rentCents),
      deposit_cents: String(option.depositCents),
      choice: option.choice,
      order_code: inquiry.order_code ?? "",
    };
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: inquiry.customer_email || undefined,
      locale: "de",
      client_reference_id: link.id,
      metadata,
      payment_intent_data: {
        description: `Angebot ${link.offer_number}${inquiry.order_code ? ` · Auftrag #${inquiry.order_code}` : ""}`,
        metadata,
      },
      expires_at: sessionExpires,
      success_url: `${origin}/zahlung/${token}?status=success`,
      cancel_url: `${origin}/zahlung/${token}?status=cancelled`,
    });
    await service
      .from("offer_payment_links")
      .update({ stripe_session_id: session.id, updated_at: new Date().toISOString() })
      .eq("id", link.id);
    return json({ url: session.url });
  } catch (err) {
    console.error("offer-pay error:", err);
    return json({ error: "Zahlung konnte nicht gestartet werden" }, 500);
  }
});
