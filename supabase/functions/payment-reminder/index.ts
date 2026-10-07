/**
 * Automatische Zahlungserinnerung an Kunden, spätestens 48 h vor Mietbeginn (stündlich per pg_cron).
 * Dank für die Annahme, Hinweis auf Rechtsverbindlichkeit, Stripe-Zahlungslink + Bankverbindung.
 * Je Anfrage höchstens einmal (payment_reminder_sent_at wird vor dem Versand atomar gesetzt).
 * Testlauf: POST { "dry_run": true } mit Mitarbeiter-Anmeldung.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { isCronCall, staffUserId } from "../_shared/cronAuth.ts";
import { LOCATION_CONTACTS, resolveLocationKey } from "../_shared/inquiry-offer-math.ts";
import { SLT_COMPANY } from "../_shared/company.ts";
import {
  ensurePaymentLink, isStripeTestMode, paymentPageUrl, planPaymentAmounts, shouldOfferPaymentLink, toCents,
} from "../_shared/stripe-pay.ts";
import { needsPaymentReminder } from "../_shared/payment-reminder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const money = (c: number) =>
  new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(c / 100) + " €";
const BATCH = 25;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const dryRun = body?.dry_run === true;
    if (!(await isCronCall(req, service)) && !(await staffUserId(req, service))) return json({ error: "Unauthorized" }, 401);

    const now = new Date();
    const horizon = new Date(now.getTime() + 3 * 86400000).toISOString().slice(0, 10);
    const today = now.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
    const { data, error } = await service.from("rental_inquiries")
      .select("id, status, start_date, start_time, end_date, customer_email, customer_name, company_name, location, product_name, offer_number, offer_total_gross, offer_payload, payments, payment_reminder_sent_at")
      .eq("status", "accepted").is("payment_reminder_sent_at", null)
      .gte("start_date", today).lte("start_date", horizon).limit(200);
    if (error) throw new Error(error.message);

    const due = (data ?? []).map((r: any) => {
      const paidCents = (Array.isArray(r.payments) ? r.payments : []).reduce((s: number, p: any) => s + toCents(p?.amount), 0);
      const payload = (r.offer_payload ?? {}) as { deposit?: unknown; payment_terms?: unknown };
      const terms = typeof payload.payment_terms === "string" ? payload.payment_terms : "vorkasse";
      const plan = planPaymentAmounts({ gross: r.offer_total_gross, deposit: Number(payload.deposit) || 0, paidCents });
      return { r, terms, plan };
    }).filter(({ r, terms, plan }) => needsPaymentReminder({ ...r, payment_terms: terms, open_cents: plan.openCents }, now))
      .slice(0, BATCH);

    if (dryRun) return json({ due: due.map(({ r, plan }) => ({ id: r.id, offer: r.offer_number, start: r.start_date, open: plan.openCents / 100 })) });

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return json({ error: "E-Mail-Versand ist nicht konfiguriert" }, 500);
    const testMode = isStripeTestMode();
    let sent = 0;

    for (const { r, terms, plan } of due) {
      // atomar beanspruchen – verhindert Doppelversand bei parallelen Läufen
      const { data: claimed } = await service.from("rental_inquiries")
        .update({ payment_reminder_sent_at: new Date().toISOString() })
        .eq("id", r.id).is("payment_reminder_sent_at", null).select("id");
      if (!claimed?.length) continue;

      let payUrl: string | null = null;
      if (shouldOfferPaymentLink({ paymentTerms: terms, customerEmail: r.customer_email, testMode, openCents: plan.openCents })) {
        const { data: link } = await service.from("offer_payment_links").select("token")
          .eq("inquiry_table", "rental_inquiries").eq("inquiry_id", r.id).eq("status", "active")
          .eq("offer_number", r.offer_number).order("created_at", { ascending: false }).limit(1).maybeSingle();
        payUrl = link?.token ? paymentPageUrl(link.token) : (await ensurePaymentLink(service, {
          table: "rental_inquiries", inquiryId: r.id, customerEmail: r.customer_email, offerNumber: r.offer_number, plan,
        }))?.url ?? null;
      }

      const loc = LOCATION_CONTACTS[resolveLocationKey(r.location)];
      const name = r.customer_name || r.company_name || "";
      const start = new Date(r.start_date + "T12:00:00Z").toLocaleDateString("de-DE");
      const subject = `Zahlung für deine Miete ab ${start} – Angebot ${r.offer_number}`;
      const html = `<!DOCTYPE html><html lang="de"><body style="margin:0;background:#ffffff;font-family:Arial,sans-serif;color:#1f2937;">
<div style="max-width:600px;margin:0 auto;padding:24px;">
<h2 style="color:#00507d;margin:0 0 16px;">Danke für deine Auftragsannahme</h2>
<p>Hallo${name ? " " + esc(name) : ""},</p>
<p>vielen Dank, dass du unser Angebot <strong>${esc(r.offer_number)}</strong> angenommen hast. Wir freuen uns auf deine Miete${r.product_name ? ` (<strong>${esc(r.product_name)}</strong>)` : ""} ab <strong>${esc(start)}</strong> am Standort ${esc(loc.name)}.</p>
<p>Bitte beachte: Mit der Annahme ist das Angebot <strong>rechtsverbindlich</strong> zustande gekommen. Damit wir deinen Mietgegenstand pünktlich bereitstellen können, bitten wir dich, den offenen Betrag vor Mietbeginn zu begleichen.</p>
<p style="font-size:18px;margin:20px 0;">Offener Betrag: <strong>${money(plan.openCents)}</strong>${plan.depositCents > 0 ? `<br><span style="font-size:13px;color:#6b7280;">inkl. Kaution ${money(plan.depositCents)} (wird nach Rückgabe erstattet)</span>` : ""}</p>
${payUrl ? `<p style="text-align:center;margin:24px 0;"><a href="${esc(payUrl)}" style="background:#ff8e02;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;display:inline-block;">Jetzt online bezahlen</a></p>` : ""}
<p>${payUrl ? "Alternativ per Überweisung:" : "Bitte überweise den Betrag auf folgendes Konto:"}</p>
<table style="font-size:14px;border-collapse:collapse;">
<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">Empfänger</td><td>${esc(SLT_COMPANY.name)}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">IBAN</td><td>${esc(SLT_COMPANY.iban)}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">BIC</td><td>${esc(SLT_COMPANY.bic)} (${esc(SLT_COMPANY.bankName)})</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">Verwendungszweck</td><td>${esc(r.offer_number)}</td></tr>
</table>
<p style="margin-top:20px;">Falls du bereits bezahlt hast, betrachte diese E-Mail bitte als gegenstandslos. Bei Fragen erreichst du uns unter ${esc(loc.phone)} oder ${esc(loc.email)}.</p>
<p>Viele Grüße<br>Dein Team von SLT-Rental ${esc(loc.name)}</p>
</div></body></html>`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
          to: [r.customer_email.trim()], reply_to: loc.email, subject, html,
        }),
      });
      if (!res.ok) {
        console.error("payment-reminder Resend", res.status, await res.text());
        await service.from("rental_inquiries").update({ payment_reminder_sent_at: null }).eq("id", r.id);
        continue;
      }
      sent++;
    }
    return json({ due: due.length, sent });
  } catch (err) {
    console.error("payment-reminder error:", err);
    return json({ error: "Unerwarteter Fehler" }, 500);
  }
});
