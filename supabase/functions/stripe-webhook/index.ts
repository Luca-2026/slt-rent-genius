/**
 * Stripe-Zahlungsmeldung. Öffentlicher Endpunkt – abgesichert über die Stripe-Signatur
 * (STRIPE_WEBHOOK_SECRET). Verarbeitet:
 *  - checkout.session.completed / async_payment_succeeded: Zahlung centgenau prüfen und
 *    in die Zahlungsliste der Anfrage buchen (idempotent)
 *  - checkout.session.expired: keine Aktion nötig (Link erzeugt bei Klick eine neue Session)
 *  - refund.created / refund.updated / charge.refunded: Status der Kautionserstattung nachziehen
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { LOCATION_CONTACTS, resolveLocationKey } from "../_shared/inquiry-offer-math.ts";
import { operationalEmailRecipient } from "../_shared/test-email-routing.ts";
import { appendPayment, paymentMatches, stripeClient, toCents } from "../_shared/stripe-pay.ts";

const money = (cents: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Unauthorized", { status: 401 });

  const raw = await req.text();
  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, signature, secret, undefined, Stripe.createSubtleCryptoProvider());
  } catch (err) {
    console.error("Ungültige Stripe-Signatur:", (err as Error).message);
    return new Response("Invalid signature", { status: 400 });
  }

  const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  // Idempotenz: jedes Ereignis nur einmal verarbeiten
  const { error: dupErr } = await service.from("stripe_webhook_events").insert({ event_id: event.id, type: event.type });
  if (dupErr) {
    if ((dupErr as { code?: string }).code === "23505") return new Response(JSON.stringify({ duplicate: true }), { status: 200 });
    console.error("Ereignis konnte nicht gespeichert werden:", dupErr.message);
    return new Response("Error", { status: 500 });
  }
  const finish = (result: string) =>
    service.from("stripe_webhook_events").update({ result }).eq("event_id", event.id);

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") {
        await finish("not_paid_yet");
        return new Response("ok");
      }
      const linkId = session.metadata?.link_id ?? session.client_reference_id;
      const { data: link } = linkId
        ? await service.from("offer_payment_links").select("*").eq("id", linkId).maybeSingle()
        : { data: null };
      if (!link) {
        await finish("link_not_found");
        return new Response("ok");
      }
      const metaCents = Number(session.metadata?.amount_cents);
      const expected = Number.isFinite(metaCents) && metaCents > 0 ? metaCents : link.amount_cents;
      const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

      if (link.status === "paid" && link.stripe_session_id !== session.id) {
        await service.from("offer_payment_links").update({
          warning: `Zweite Zahlung (${session.id}, ${money(session.amount_total ?? 0)}) eingegangen – bitte prüfen und ggf. in Stripe erstatten.`,
          updated_at: new Date().toISOString(),
        }).eq("id", link.id);
        await finish("duplicate_payment");
        return new Response("ok");
      }
      if (!paymentMatches(session.amount_total, expected) || session.currency !== "eur") {
        await service.from("offer_payment_links").update({
          status: "amount_mismatch",
          stripe_session_id: session.id,
          payment_intent_id: piId,
          warning: `Betrag weicht ab: erwartet ${money(expected)}, erhalten ${money(session.amount_total ?? 0)}. Nicht gebucht.`,
          updated_at: new Date().toISOString(),
        }).eq("id", link.id);
        await finish("amount_mismatch");
        return new Response("ok");
      }

      const { data: inquiry } = await service
        .from(link.inquiry_table)
        .select("id, payments, customer_email, location, offer_number, offer_total_gross, offer_payload")
        .eq("id", link.inquiry_id)
        .maybeSingle();
      if (!inquiry) {
        await finish("inquiry_not_found");
        return new Response("ok");
      }
      const { payments, paidAmount, added } = appendPayment(inquiry.payments, {
        date: new Date().toISOString().slice(0, 10),
        amount: expected / 100,
        label: "Online-Zahlung (Stripe)",
        reference: session.id,
      });
      if (added) {
        const { error } = await service.from(link.inquiry_table).update({ payments, paid_amount: paidAmount }).eq("id", inquiry.id);
        if (error) throw new Error(`Zahlung konnte nicht gebucht werden: ${error.message}`);
      }
      // Rest offen (z. B. nach 30 % Anzahlung)? Dann bleibt der Link für den Restbetrag aktiv.
      const depositEuro = Number((inquiry.offer_payload as { deposit?: unknown } | null)?.deposit) || 0;
      const remainingCents = Math.max(0, toCents(inquiry.offer_total_gross) + toCents(depositEuro) - Math.round(paidAmount * 100));
      const metaDeposit = Number(session.metadata?.deposit_cents);
      const isAnzahlung = session.metadata?.choice === "anzahlung";
      await service.from("offer_payment_links").update({
        status: remainingCents > 0 ? "active" : "paid",
        stripe_session_id: session.id,
        payment_intent_id: piId,
        ...(Number.isFinite(metaDeposit) ? { deposit_cents: metaDeposit } : {}),
        paid_cents: (added ? (link.paid_cents ?? 0) + expected : (link.paid_cents ?? expected)),
        paid_at: new Date().toISOString(),
        warning: null,
        updated_at: new Date().toISOString(),
      }).eq("id", link.id);

      // interne Benachrichtigung ans Standortpostfach (Testkunde → nur Testpostfach)
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey && added) {
        const loc = LOCATION_CONTACTS[resolveLocationKey(inquiry.location)];
        const to = operationalEmailRecipient(inquiry.customer_email ?? undefined, loc.email);
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
              to: [to],
              subject: `Zahlung eingegangen – Angebot ${link.offer_number}`,
              html: `<p>Online-Zahlung per Stripe eingegangen: <strong>${money(expected)}</strong> ${isAnzahlung ? "(30 % Anzahlung)" : `(davon Kaution ${money(Number.isFinite(metaDeposit) ? metaDeposit : link.deposit_cents)})`} zu Angebot <strong>${esc(link.offer_number)}</strong>.</p><p>Die Zahlung ist in der Mietanfrage unter „Zahlungseingänge“ gebucht.${remainingCents > 0 ? ` Noch offen: <strong>${money(remainingCents)}</strong> (Restbetrag inkl. Kaution vor Mietbeginn).` : ""} Die Auftragsbestätigung kann jetzt versendet werden.</p>`,
            }),
          });
        } catch (e) {
          console.error("Benachrichtigung fehlgeschlagen:", (e as Error).message);
        }
      }
      await finish(added ? "booked" : "already_booked");
      return new Response("ok");
    }

    if (event.type === "refund.created" || event.type === "refund.updated") {
      const refund = event.data.object as Stripe.Refund;
      await service.from("deposit_refunds").update({ status: refund.status ?? "pending", updated_at: new Date().toISOString() })
        .eq("stripe_refund_id", refund.id);
      await finish(`refund_${refund.status}`);
      return new Response("ok");
    }

    await finish("ignored");
    return new Response("ok");
  } catch (err) {
    console.error("stripe-webhook error:", err);
    // Ereignis wieder freigeben, damit Stripe es erneut zustellen kann
    await service.from("stripe_webhook_events").delete().eq("event_id", event.id);
    return new Response("Error", { status: 500 });
  }
});
