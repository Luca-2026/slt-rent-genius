import { codedSubject } from "../_shared/order-code.ts";
/**
 * Öffentliche Online-Annahme eines Angebots (/angebot/<token>).
 * Der unratbare Token ist das Geheimnis; Angebotsdaten kommen immer aus der Datenbank.
 *  - action "info":   Angebotsübersicht für die Annahmeseite
 *  - action "accept": verbindliche Annahme mit Name, Unterschrift und AGB-Bestätigung
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://esm.sh/zod@3.23.8";
import { SLT_COMPANY } from "../_shared/company.ts";
import { LOCATION_CONTACTS, resolveLocationKey } from "../_shared/inquiry-offer-math.ts";
import { isPrepayTerms } from "../_shared/payment-followup.ts";
import { ensurePaymentLink, isStripeTestMode, planPaymentAmounts, shouldOfferPaymentLink, toCents } from "../_shared/stripe-pay.ts";
import { documentEmailRecipients, operationalEmailRecipient } from "../_shared/test-email-routing.ts";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const money = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(Number(n) || 0);
const berlinNow = () => new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" });
const todayBerlin = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("info"), token: z.string().regex(/^[A-Za-z0-9_-]{20,64}$/) }),
  z.object({
    action: z.literal("accept"),
    token: z.string().regex(/^[A-Za-z0-9_-]{20,64}$/),
    signer_name: z.string().trim().min(2).max(120),
    signature_data: z.string().max(400_000).regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/),
    agb_accepted: z.literal(true),
    binding_accepted: z.literal(true),
  }),
  // Vor-Ort-Annahme: Kunde unterschreibt auf dem Gerät eines Mitarbeiters (Staff-JWT Pflicht).
  z.object({
    action: z.literal("accept_onsite"),
    inquiry_table: z.enum(["rental_inquiries", "sales_inquiries"]),
    inquiry_id: z.string().uuid(),
    offer_number: z.string().trim().min(3).max(40),
    signer_name: z.string().trim().min(2).max(120),
    signature_data: z.string().max(400_000).regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/),
    agb_accepted: z.literal(true),
    binding_accepted: z.literal(true),
  }),
]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Ungültige Angaben. Bitte Name, Unterschrift und beide Bestätigungen prüfen." }, 400);
    const body = parsed.data;
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    const { data: allowed } = await service.rpc("check_public_rate_limit", { _bucket: `offer-accept-${body.action}`, _client_key: ip, _max_hits: body.action === "accept" ? 10 : 60, _window_seconds: 3600 });
    if (allowed === false) return json({ error: "Zu viele Versuche. Bitte später erneut versuchen." }, 429);

    // Vor-Ort-Annahme: nur eingeloggte Mitarbeiter mit Bearbeitungsrecht.
    let onsiteStaff: { id: string } | null = null;
    if (body.action === "accept_onsite") {
      const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
      if (!jwt) return json({ error: "Nicht angemeldet." }, 401);
      const { data: userData } = await service.auth.getUser(jwt);
      const userId = userData?.user?.id;
      if (!userId) return json({ error: "Nicht angemeldet." }, 401);
      const { data: canEdit } = await service.rpc("can_edit_operations", { _user_id: userId });
      if (!canEdit) return json({ error: "Keine Berechtigung für die Vor-Ort-Annahme." }, 403);
      onsiteStaff = { id: userId };
    }

    const linkRes = body.action === "accept_onsite"
      ? await service.from("offer_acceptance_links").select("*")
          .eq("inquiry_table", body.inquiry_table).eq("inquiry_id", body.inquiry_id)
          .eq("offer_number", body.offer_number).eq("status", "active")
          .order("created_at", { ascending: false }).limit(1).maybeSingle()
      : await service.from("offer_acceptance_links").select("*").eq("token", body.token).maybeSingle();
    if (linkRes.error) return json({ error: `Datenbankfehler: ${linkRes.error.message}` }, 500);
    const link = linkRes.data;
    if (!link) return json({ error: body.action === "accept_onsite" ? "Kein aktives Angebot zu dieser Anfrage gefunden." : "Dieser Link ist nicht gültig." }, 404);
    const { data: inquiry } = await service.from(link.inquiry_table)
      .select("id, status, offer_number, offer_file_url, offer_payload, customer_name, company_name, customer_email, customer_kind, location, location_email, offer_total_gross, payments")
      .eq("id", link.inquiry_id).maybeSingle();
    if (!inquiry) return json({ error: "Dieser Link ist nicht gültig." }, 404);

    let status: string = link.status;
    if (status === "active" && inquiry.offer_number !== link.offer_number) status = "superseded";
    if (status === "active" && ["rejected", "done"].includes(inquiry.status)) status = "closed";
    if (status === "active" && link.valid_until && link.valid_until < todayBerlin()) status = "expired";
    if (status === "void") status = "superseded";

    const payload = (inquiry.offer_payload ?? {}) as { items?: Array<{ product_name?: string; quantity?: number; unit?: string }>; totals?: { netAmount?: number; grossAmount?: number }; deposit?: number };
    const loc = LOCATION_CONTACTS[resolveLocationKey(inquiry.location)];
    const isBusiness = inquiry.customer_kind === "business";

    if (body.action === "info") {
      return json({
        status,
        offer_number: link.offer_number,
        customer_name: inquiry.company_name || inquiry.customer_name || "",
        gross_amount: Number(link.gross_amount),
        net_amount: payload.totals?.netAmount ?? null,
        deposit: Number(payload.deposit) || 0,
        valid_until: link.valid_until,
        items: (payload.items ?? []).slice(0, 30).map((i) => ({ name: String(i.product_name ?? ""), quantity: i.quantity ?? 1, unit: i.unit ?? "" })),
        agb_kind: isBusiness ? "business" : "private",
        accepted_at: link.accepted_at,
        signer_name: status === "accepted" ? link.signer_name : null,
        location: { name: loc.name, email: loc.email, phone: loc.phone },
        prepay: isPrepayTerms(typeof (payload as { payment_terms?: unknown }).payment_terms === "string" ? String((payload as { payment_terms?: string }).payment_terms) : "vorkasse"),
      });
    }

    if (status !== "active") {
      const msg: Record<string, string> = {
        accepted: "Dieses Angebot wurde bereits angenommen.",
        superseded: "Zu diesem Angebot gibt es eine neuere Fassung. Bitte nutze den Link aus der aktuellen E-Mail.",
        expired: "Dieses Angebot ist abgelaufen. Bitte melde dich bei uns für ein neues Angebot.",
        closed: "Diese Anfrage ist bereits abgeschlossen.",
      };
      return json({ error: msg[status] ?? "Annahme nicht möglich.", status }, 409);
    }

    // Atomar: nur ein einziger erfolgreicher Annahmevorgang pro Link.
    const acceptedAt = new Date().toISOString();
    const { data: updated, error: updErr } = await service.from("offer_acceptance_links").update({
      status: "accepted",
      accepted_at: acceptedAt,
      signer_name: body.signer_name,
      signature_data: body.signature_data,
      agb_accepted: true,
      accepted_channel: onsiteStaff ? "onsite" : "online",
      accepted_ip: onsiteStaff ? null : ip,
      accepted_user_agent: onsiteStaff ? `onsite-staff:${onsiteStaff.id}` : (req.headers.get("user-agent") ?? "").slice(0, 300),
    }).eq("id", link.id).eq("status", "active").select("id").maybeSingle();
    if (updErr || !updated) return json({ error: updErr?.message?.includes("Gutschein") ? updErr.message : "Dieses Angebot wurde bereits angenommen oder ist nicht mehr gültig.", status: "unavailable" }, 409);

    const statusPatch = ["new", "in_progress", "offer_sent"].includes(inquiry.status) ? { status: "accepted" } : {};
    {
      const { error } = await service.from(link.inquiry_table).update({ ...statusPatch, offer_accepted_at: acceptedAt, payment_followup_sent_at: null }).eq("id", inquiry.id).eq("offer_number", link.offer_number);
      if (error) console.error("Anfragestatus konnte nicht gesetzt werden:", error.message);
    }

    // Vorkasse/Anzahlung: direkt zur Zahlungsseite weiterleiten. Rechnungszahler: keine Zahlungsaufforderung.
    const terms = typeof (payload as { payment_terms?: unknown }).payment_terms === "string" ? String((payload as { payment_terms?: string }).payment_terms) : "vorkasse";
    const prepay = isPrepayTerms(terms);
    let payUrl: string | null = null;
    if (prepay) {
      const paidCents = (Array.isArray(inquiry.payments) ? inquiry.payments : []).reduce((s: number, p: { amount?: unknown }) => s + toCents(p?.amount), 0);
      const plan = planPaymentAmounts({ gross: inquiry.offer_total_gross, deposit: Number(payload.deposit) || 0, paidCents });
      const email = inquiry.customer_email || link.customer_email;
      if (shouldOfferPaymentLink({ paymentTerms: terms, customerEmail: email, testMode: isStripeTestMode(), openCents: plan.openCents })) {
        const { data: existing } = await service.from("offer_payment_links").select("token")
          .eq("inquiry_table", link.inquiry_table).eq("inquiry_id", inquiry.id).eq("status", "active")
          .eq("offer_number", link.offer_number).order("created_at", { ascending: false }).limit(1).maybeSingle();
        payUrl = existing?.token ? `https://www.slt-rental.de/zahlung/${existing.token}` : (await ensurePaymentLink(service, {
          table: link.inquiry_table, inquiryId: inquiry.id, customerEmail: email, offerNumber: link.offer_number, plan,
        }))?.url ?? null;
      }
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`;
    const when = berlinNow();
    const who = esc(inquiry.company_name ? `${body.signer_name} (${inquiry.company_name})` : body.signer_name);
    if (resendKey) {
      const portalUrl = `https://app.slt-rental.de/b2b/${link.inquiry_table === "rental_inquiries" ? "mietanfragen" : "verkaufsanfragen"}?anfrage=${inquiry.id}`;
      const channelLabel = onsiteStaff ? "vor Ort unterschrieben" : "online angenommen";
      // Kundenkopie: unterschriebenes Angebot als PDF-Anhang statt Download-Link.
      let pdfAttachment: { filename: string; content: string } | null = null;
      if (inquiry.offer_file_url) {
        try {
          const pdfRes = await fetch(String(inquiry.offer_file_url));
          if (pdfRes.ok) {
            const bytes = new Uint8Array(await pdfRes.arrayBuffer());
            if (bytes.byteLength > 0 && bytes.byteLength <= 8 * 1024 * 1024) {
              pdfAttachment = { filename: `Angebot-${link.offer_number}.pdf`, content: encodeBase64(bytes) };
            }
          } else {
            console.error("Angebots-PDF nicht ladbar:", pdfRes.status);
          }
        } catch (e) { console.error("Angebots-PDF Anhang Fehler:", (e as Error).message); }
      }
      const pdfBlock = pdfAttachment
        ? `<p style="font-size:13px;color:#4b5563;">Deine Kopie des unterschriebenen Angebots findest du als PDF im Anhang dieser E-Mail.</p>`
        : "";
      const mails = [
        {
          from,
          to: [operationalEmailRecipient(inquiry.customer_email, loc.email)],
          subject: await codedSubject(service, `Angebot ${link.offer_number} ${channelLabel} – ${String(inquiry.company_name || inquiry.customer_name || "Kunde").replace(/[\r\n]+/g, " ").slice(0, 80)}`, { table: link.inquiry_table, id: link.inquiry_id }),
          html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#1a1a1a;"><h2 style="color:#00507d;">Angebot ${esc(channelLabel)}</h2><p>Das Angebot <strong>${esc(link.offer_number)}</strong> über <strong>${money(Number(link.gross_amount))}</strong> brutto wurde am ${esc(when)} Uhr von ${who} ${onsiteStaff ? "vor Ort" : "digital"} unterschrieben und angenommen. Die AGB wurden bestätigt.</p><p>Nächster Schritt: Auftragsbestätigung senden.</p><p><a href="${esc(portalUrl)}" style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:4px;">Im Portal öffnen</a></p></div>`,
        },
        {
          from,
          ...(() => { const r = documentEmailRecipients(inquiry.customer_email || link.customer_email || "", []); return { to: r.to }; })(),
          reply_to: loc.email,
          subject: await codedSubject(service, prepay ? `Danke für deine Annahme – bitte jetzt bezahlen (Angebot ${link.offer_number})` : `Danke für deine Annahme von Angebot ${link.offer_number}`, { table: link.inquiry_table, id: link.inquiry_id }),
          ...(pdfAttachment ? { attachments: [pdfAttachment] } : {}),
          html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#1a1a1a;"><p>Hallo ${esc(inquiry.customer_name || "")},</p><p><strong>Vielen Dank für das angenommene Angebot.</strong> ${prepay ? "Bitte leiste nun die Zahlung." : "Du erhältst in Kürze die Auftragsbestätigung, damit deine Miete bestätigt wird."}</p><p>Angebot <strong>${esc(link.offer_number)}</strong> über <strong>${money(Number(link.gross_amount))}</strong> brutto${Number(payload.deposit) > 0 ? ` zzgl. Kaution ${money(Number(payload.deposit))}` : ""}, angenommen am ${esc(when)} Uhr von ${esc(body.signer_name)}. Du hast dabei unsere ${isBusiness ? "AGB für Unternehmer" : "AGB für Verbraucher"} bestätigt.</p>${pdfBlock}${prepay && payUrl ? `<p style="text-align:center;margin:24px 0;"><a href="${esc(payUrl)}" style="background:#ff8e02;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;display:inline-block;">Jetzt bezahlen</a></p>` : ""}${prepay ? `<p style="font-size:13px;color:#4b5563;">Überweisung möglich an ${esc(SLT_COMPANY.name)}, IBAN ${esc(SLT_COMPANY.iban)}, BIC ${esc(SLT_COMPANY.bic)}, Verwendungszweck ${esc(link.offer_number)}.</p>` : ""}<p>Viele Grüße<br>Dein SLT Rental Team – Standort ${esc(loc.name)}<br>Tel. ${esc(loc.phone)} · ${esc(loc.email)}</p></div>`,
        },
      ];
      for (const mail of mails) {
        if (!mail.to?.[0]) continue;
        try {
          const res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" }, body: JSON.stringify(mail) });
          if (!res.ok) console.error("Annahme-Mail fehlgeschlagen:", res.status);
        } catch (e) { console.error("Annahme-Mail Fehler:", (e as Error).message); }
      }
    }
    return json({ success: true, status: "accepted", accepted_at: acceptedAt, offer_number: link.offer_number, prepay, pay_url: payUrl });
  } catch (err) {
    console.error("offer-accept error:", (err as Error).message);
    return json({ error: "Unerwarteter Fehler. Bitte später erneut versuchen." }, 500);
  }
});
