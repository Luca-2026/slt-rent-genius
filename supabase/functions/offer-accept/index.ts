/**
 * Öffentliche Online-Annahme eines Angebots (/angebot/<token>).
 * Der unratbare Token ist das Geheimnis; Angebotsdaten kommen immer aus der Datenbank.
 *  - action "info":   Angebotsübersicht für die Annahmeseite
 *  - action "accept": verbindliche Annahme mit Name, Unterschrift und AGB-Bestätigung
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://esm.sh/zod@3.23.8";
import { LOCATION_CONTACTS, resolveLocationKey } from "../_shared/inquiry-offer-math.ts";
import { documentEmailRecipients, operationalEmailRecipient } from "../_shared/test-email-routing.ts";

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

    const { data: link } = await service.from("offer_acceptance_links").select("*").eq("token", body.token).maybeSingle();
    if (!link) return json({ error: "Dieser Link ist nicht gültig." }, 404);
    const { data: inquiry } = await service.from(link.inquiry_table)
      .select("id, status, offer_number, offer_file_url, offer_payload, customer_name, company_name, customer_email, customer_kind, location, location_email")
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
      accepted_ip: ip,
      accepted_user_agent: (req.headers.get("user-agent") ?? "").slice(0, 300),
    }).eq("id", link.id).eq("status", "active").select("id").maybeSingle();
    if (updErr || !updated) return json({ error: "Dieses Angebot wurde bereits angenommen.", status: "accepted" }, 409);

    if (["new", "in_progress", "offer_sent"].includes(inquiry.status)) {
      const { error } = await service.from(link.inquiry_table).update({ status: "accepted" }).eq("id", inquiry.id).eq("offer_number", link.offer_number);
      if (error) console.error("Anfragestatus konnte nicht gesetzt werden:", error.message);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`;
    const when = berlinNow();
    const who = esc(inquiry.company_name ? `${body.signer_name} (${inquiry.company_name})` : body.signer_name);
    if (resendKey) {
      const portalUrl = `https://app.slt-rental.de/b2b/${link.inquiry_table === "rental_inquiries" ? "mietanfragen" : "verkaufsanfragen"}?anfrage=${inquiry.id}`;
      const mails = [
        {
          from,
          to: [operationalEmailRecipient(inquiry.customer_email, loc.email)],
          subject: `Angebot ${link.offer_number} online angenommen – ${String(inquiry.company_name || inquiry.customer_name || "Kunde").replace(/[\r\n]+/g, " ").slice(0, 80)}`,
          html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#1a1a1a;"><h2 style="color:#00507d;">Angebot online angenommen</h2><p>Das Angebot <strong>${esc(link.offer_number)}</strong> über <strong>${money(Number(link.gross_amount))}</strong> brutto wurde am ${esc(when)} Uhr von ${who} digital unterschrieben und angenommen. Die AGB wurden bestätigt.</p><p>Nächster Schritt: Auftragsbestätigung senden.</p><p><a href="${esc(portalUrl)}" style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:4px;">Im Portal öffnen</a></p></div>`,
        },
        {
          from,
          ...(() => { const r = documentEmailRecipients(inquiry.customer_email || link.customer_email || "", []); return { to: r.to }; })(),
          reply_to: loc.email,
          subject: `Ihre Annahme von Angebot ${link.offer_number} ist eingegangen`,
          html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#1a1a1a;"><p>Hallo ${esc(inquiry.customer_name || "")},</p><p>vielen Dank! Ihre Annahme unseres Angebots <strong>${esc(link.offer_number)}</strong> über <strong>${money(Number(link.gross_amount))}</strong> brutto ist am ${esc(when)} Uhr bei uns eingegangen (unterschrieben von ${esc(body.signer_name)}). Sie haben dabei unsere ${isBusiness ? "AGB für Unternehmer" : "AGB für Verbraucher"} bestätigt.</p><p>Wir prüfen Ihren Auftrag und senden Ihnen in Kürze die Auftragsbestätigung.</p><p>Freundliche Grüße<br>Ihr SLT Rental Team – Standort ${esc(loc.name)}<br>Tel. ${esc(loc.phone)} · ${esc(loc.email)}</p></div>`,
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
    return json({ success: true, status: "accepted", accepted_at: acceptedAt, offer_number: link.offer_number });
  } catch (err) {
    console.error("offer-accept error:", (err as Error).message);
    return json({ error: "Unerwarteter Fehler. Bitte später erneut versuchen." }, 500);
  }
});
