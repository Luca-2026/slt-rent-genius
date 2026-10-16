/**
 * Nachfass-E-Mail zur Zahlung (ersetzt die frühere 48-h-Erinnerung; läuft per pg_cron).
 * Regel: _shared/payment-followup.ts – online angenommen, Vorkasse/Anzahlung, 1 Stunde nach Annahme
 * noch nicht gezahlt → einmalig E-Mail mit 24-Stunden-Frist. Danach nur Portalmarkierung, keine Stornierung.
 * Testlauf: POST { "dry_run": true } mit Mitarbeiter-Anmeldung.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { isCronCall, staffUserId } from "../_shared/cronAuth.ts";
import { LOCATION_CONTACTS, resolveLocationKey } from "../_shared/inquiry-offer-math.ts";
import { SLT_COMPANY } from "../_shared/company.ts";
import { documentEmailRecipients } from "../_shared/test-email-routing.ts";
import {
  ensurePaymentLink, isStripeTestMode, paymentOptions, paymentPageUrl, planPaymentAmounts, shouldOfferPaymentLink, toCents,
} from "../_shared/stripe-pay.ts";
import { byForm, resolveAddressForm, salutationLine } from "../_shared/salutation.ts";
import { needsPaymentFollowup, paymentDeadline } from "../_shared/payment-followup.ts";

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
const TABLES = ["rental_inquiries", "sales_inquiries"] as const;

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
    const due: any[] = [];
    // Manuelle Erinnerung aus der Anfrage (nur Mitarbeiter): eine Anfrage, ohne 24-h-/Storno-Text, jederzeit wiederholbar.
    const manual = body?.manual as { table?: string; inquiry_id?: string } | undefined;
    if (manual) {
      if (!(await staffUserId(req, service))) return json({ error: "Unauthorized" }, 401);
      const table = TABLES.find((t) => t === manual.table);
      if (!table || typeof manual.inquiry_id !== "string" || !/^[0-9a-f-]{36}$/i.test(manual.inquiry_id)) return json({ error: "Ungültige Anfrage" }, 400);
      const cols = table === "rental_inquiries"
        ? "id, status, customer_email, customer_name, customer_salutation, address_form, crm_customer_id, company_name, location, offer_number, offer_total_gross, offer_payload, payments"
        : "id, status, customer_email, first_name, last_name, salutation, crm_customer_id, company_name, location, offer_number, offer_total_gross, offer_payload, payments";
      const { data: r, error } = await service.from(table).select(cols).eq("id", manual.inquiry_id).maybeSingle();
      if (error || !r) return json({ error: "Anfrage nicht gefunden" }, 404);
      const row = r as any;
      if (!row.offer_number || !row.customer_email) return json({ error: "Kein versendetes Angebot oder keine Kunden-E-Mail" }, 409);
      const paidCents = (Array.isArray(row.payments) ? row.payments : []).reduce((s: number, p: any) => s + toCents(p?.amount), 0);
      const payload = (row.offer_payload ?? {}) as { deposit?: unknown; payment_terms?: unknown };
      const terms = typeof payload.payment_terms === "string" ? payload.payment_terms : "vorkasse";
      const deposit = Number(payload.deposit) || 0;
      const plan = planPaymentAmounts({ gross: row.offer_total_gross, deposit, paidCents });
      if (plan.openCents <= 0) return json({ error: "Kein offener Betrag – keine Erinnerung nötig" }, 409);
      due.push({ table, r: row, terms, deposit, paidCents, plan, manual: true });
    }
    for (const table of manual ? [] : TABLES) {
      const cols = table === "rental_inquiries"
        ? "id, status, customer_email, customer_name, customer_salutation, address_form, crm_customer_id, company_name, location, offer_number, offer_total_gross, offer_payload, payments, offer_accepted_at, payment_followup_sent_at, order_confirmed_at"
        : "id, status, customer_email, first_name, last_name, salutation, crm_customer_id, company_name, location, offer_number, offer_total_gross, offer_payload, payments, offer_accepted_at, payment_followup_sent_at, order_confirmed_at";
      const { data, error } = await service.from(table).select(cols)
        .eq("status", "accepted").is("payment_followup_sent_at", null).not("offer_accepted_at", "is", null)
        .is("order_confirmed_at", null).limit(200);
      if (error) throw new Error(error.message);
      for (const r of (data ?? []) as any[]) {
        const paidCents = (Array.isArray(r.payments) ? r.payments : []).reduce((s: number, p: any) => s + toCents(p?.amount), 0);
        const payload = (r.offer_payload ?? {}) as { deposit?: unknown; payment_terms?: unknown };
        const terms = typeof payload.payment_terms === "string" ? payload.payment_terms : "vorkasse";
        const deposit = Number(payload.deposit) || 0;
        if (!needsPaymentFollowup({ ...r, payment_terms: terms, gross: r.offer_total_gross, deposit, paid_cents: paidCents }, now)) continue;
        due.push({ table, r, terms, deposit, paidCents, plan: planPaymentAmounts({ gross: r.offer_total_gross, deposit, paidCents }) });
      }
    }

    if (dryRun) return json({ due: due.map(({ table, r, plan }) => ({ table, id: r.id, offer: r.offer_number, open: plan.openCents / 100 })) });

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return json({ error: "E-Mail-Versand ist nicht konfiguriert" }, 500);
    const testMode = isStripeTestMode();
    let sent = 0;

    for (const { table, r, terms, deposit, paidCents, plan, manual: isManual } of due.slice(0, 25)) {
      const sentAt = new Date().toISOString();
      if (!isManual) {
        const { data: claimed } = await service.from(table).update({ payment_followup_sent_at: sentAt })
          .eq("id", r.id).is("payment_followup_sent_at", null).select("id");
        if (!claimed?.length) continue;
      }

      let payUrl: string | null = null;
      if (shouldOfferPaymentLink({ paymentTerms: terms, customerEmail: r.customer_email, testMode, openCents: plan.openCents })) {
        const { data: link } = await service.from("offer_payment_links").select("token")
          .eq("inquiry_table", table).eq("inquiry_id", r.id).eq("status", "active")
          .eq("offer_number", r.offer_number).order("created_at", { ascending: false }).limit(1).maybeSingle();
        payUrl = link?.token ? paymentPageUrl(link.token) : (await ensurePaymentLink(service, {
          table, inquiryId: r.id, customerEmail: r.customer_email, offerNumber: r.offer_number, plan,
        }))?.url ?? null;
      }
      const opts = paymentOptions({ gross: r.offer_total_gross, deposit, paidCents, terms });
      const minCents = opts.find((o) => o.choice === "anzahlung")?.amountCents ?? plan.openCents;
      const deadline = paymentDeadline(sentAt)!.toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" });
      const loc = LOCATION_CONTACTS[resolveLocationKey(r.location)];
      const name = r.customer_name || [r.first_name, r.last_name].filter(Boolean).join(" ") || r.company_name || "";
      const form = await resolveAddressForm(service, r);
      const t = (du: string, sie: string) => byForm(form, du, sie);
      const greeting = salutationLine({ address_form: form, salutation: r.customer_salutation ?? r.salutation, name });
      const subject = isManual
        ? `Zahlungserinnerung – Angebot ${r.offer_number}`
        : `Bitte Zahlung innerhalb von 24 Stunden leisten – Angebot ${r.offer_number}`;
      const intro = isManual
        ? `<p>vielen Dank für ${t("deinen", "Ihren")} Auftrag zu unserem Angebot <strong>${esc(r.offer_number)}</strong>. Bei uns ist bisher noch nicht der vollständige Betrag eingegangen.</p>
<p><strong>${t("Bitte leiste die Zahlung zeitnah, damit wir deine Miete bestätigen können.", "Bitte leisten Sie die Zahlung zeitnah, damit wir Ihre Miete bestätigen können.")}</strong></p>`
        : `<p>vielen Dank, dass ${t("du", "Sie")} unser Angebot <strong>${esc(r.offer_number)}</strong> angenommen ${t("hast", "haben")}. Bei uns ist bisher noch keine Zahlung eingegangen.</p>
<p><strong>${t("Bitte leiste", "Bitte leisten Sie")} die Zahlung innerhalb der nächsten 24 Stunden (bis ${esc(deadline)} Uhr).</strong> Geht die Zahlung bis dahin nicht ein, wird der Auftrag systemseitig storniert.</p>`;
      const html = `<!DOCTYPE html><html lang="de"><body style="margin:0;background:#ffffff;font-family:Arial,sans-serif;color:#1f2937;">
<div style="max-width:600px;margin:0 auto;padding:24px;">
<h2 style="color:#00507d;margin:0 0 16px;">${t("Deine", "Ihre")} Zahlung steht noch aus</h2>
<p>${esc(greeting)}</p>
${intro}
<p style="font-size:18px;margin:20px 0;">${minCents < plan.openCents ? `Fällige Anzahlung: <strong>${money(minCents)}</strong><br><span style="font-size:13px;color:#6b7280;">Gesamt offen: ${money(plan.openCents)}</span>` : `Offener Betrag: <strong>${money(plan.openCents)}</strong>`}${plan.depositCents > 0 ? `<br><span style="font-size:13px;color:#6b7280;">inkl. Kaution ${money(plan.depositCents)} (wird nach Rückgabe erstattet)</span>` : ""}</p>
${payUrl ? `<p style="text-align:center;margin:24px 0;"><a href="${esc(payUrl)}" style="background:#ff8e02;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;display:inline-block;">Jetzt online bezahlen</a></p>` : ""}
<p>${payUrl ? "Alternativ per Überweisung:" : t("Bitte überweise den Betrag auf folgendes Konto:", "Bitte überweisen Sie den Betrag auf folgendes Konto:")}</p>
<table style="font-size:14px;border-collapse:collapse;">
<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">Empfänger</td><td>${esc(SLT_COMPANY.name)}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">IBAN</td><td>${esc(SLT_COMPANY.iban)}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">BIC</td><td>${esc(SLT_COMPANY.bic)} (${esc(SLT_COMPANY.bankName)})</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">Verwendungszweck</td><td>${esc(r.offer_number)}</td></tr>
</table>
<p style="margin-top:20px;">${t("Falls du gerade bezahlt hast, betrachte diese E-Mail bitte als gegenstandslos. Bei Fragen erreichst du uns unter", "Falls Sie gerade bezahlt haben, betrachten Sie diese E-Mail bitte als gegenstandslos. Bei Fragen erreichen Sie uns unter")} ${esc(loc.phone)} oder ${esc(loc.email)}.</p>
<p>${t("Viele Grüße", "Freundliche Grüße")}<br>${t("Dein", "Ihr")} Team von SLT-Rental ${esc(loc.name)}</p>
</div></body></html>`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
          to: documentEmailRecipients(r.customer_email, []).to, reply_to: loc.email, subject, html,
        }),
      });
      if (!res.ok) {
        console.error("payment-followup Resend", res.status, await res.text());
        if (!isManual) await service.from(table).update({ payment_followup_sent_at: null }).eq("id", r.id);
        if (isManual) return json({ error: "E-Mail konnte nicht gesendet werden" }, 502);
        continue;
      }
      if (isManual) await service.from(table).update({ payment_reminder_manual_at: sentAt }).eq("id", r.id);
      sent++;
    }
    return json({ due: due.length, sent });
  } catch (err) {
    console.error("payment-reminder error:", err);
    return json({ error: "Unerwarteter Fehler" }, 500);
  }
});
