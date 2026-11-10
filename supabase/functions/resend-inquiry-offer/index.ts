import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { originalOfferDispatch } from "./offer.ts";
import { documentEmailRecipients } from "../_shared/test-email-routing.ts";
import { codedSubject } from "../_shared/order-code.ts";
import { resolveAddressForm, salutationLine, byForm } from "../_shared/salutation.ts";
import { LOCATION_CONTACTS, resolveLocationKey } from "../_shared/inquiry-offer-math.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const esc = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c] ?? c));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Methode nicht erlaubt" }, 405);
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Bitte anmelden" }, 401);
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user }, error: authError } = await service.auth.getUser(auth.slice(7));
    if (authError || !user) return json({ error: "Bitte erneut anmelden" }, 401);
    const { data: staff, error: staffError } = await service.rpc("is_staff_member", { _user_id: user.id });
    if (staffError || !staff) return json({ error: "Nur Mitarbeiter dürfen Angebote versenden." }, 403);
    const body = await req.json();
    if (!["rental", "sales"].includes(body.inquiry_type) || typeof body.inquiry_id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.inquiry_id) || (body.preview !== true && (typeof body.expected_email !== "string" || typeof body.request_id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.request_id)))) return json({ error: "Ungültige Versandanforderung" }, 400);
    const table = body.inquiry_type === "rental" ? "rental_inquiries" : "sales_inquiries";
    const { data: inquiry, error } = await service.from(table).select("*").eq("id", body.inquiry_id).maybeSingle();
    if (error || !inquiry) return json({ error: "Vorgang nicht gefunden" }, 404);
    const dispatch = originalOfferDispatch(inquiry, body.inquiry_type, body.preview === true ? undefined : body.expected_email);
    const { data: pdf, error: pdfError } = await service.storage.from("b2b-invoices").download(dispatch.path);
    if (pdfError || !pdf) return json({ error: "Das vorhandene Angebots-PDF konnte nicht geladen werden. Es wurde nichts versendet." }, 409);
    // Reuse the original acceptance link; never create a revision or extend validity.
    const { data: links, error: linkError } = await service.from("offer_acceptance_links").select("id,token,status").eq("inquiry_table", table).eq("inquiry_id", inquiry.id).eq("offer_number", dispatch.number).order("created_at", { ascending: false }).limit(1);
    if (linkError) return json({ error: "Annahmelink konnte nicht geprüft werden." }, 409);
    const link = links?.[0];
    const pending = !inquiry.offer_accepted_at && !inquiry.order_confirmed_at && inquiry.status !== "accepted";
    let acceptUrl = "";
    if (pending && link) {
      const { data: deadline, error: deadlineError } = await service.rpc("offer_link_deadline_by_id", { p_id: link.id });
      if (deadlineError) return json({ error: "Angebotsgültigkeit konnte nicht geprüft werden." }, 409);
      if (link.status !== "active" || !deadline || Date.now() >= Date.parse(deadline)) return json({ error: "Dieses Angebot ist nicht mehr zur Annahme gültig. Bitte das Angebot ausdrücklich überarbeiten statt unverändert erneut senden." }, 409);
      acceptUrl = `https://www.slt-rental.de/angebot/${link.token}`;
    }
    if (body.preview === true) return json({ success: true, recipient: dispatch.email, offer_number: dispatch.number });
    const key = Deno.env.get("RESEND_API_KEY");
    if (!key) return json({ error: "E-Mail-Versand nicht verfügbar. Es wurde nichts versendet." }, 503);
    const form = await resolveAddressForm(service, inquiry);
    const greeting = salutationLine({ address_form: form, salutation: inquiry.customer_salutation, name: inquiry.customer_name || [inquiry.first_name, inquiry.last_name].filter(Boolean).join(" ") });
    const loc = LOCATION_CONTACTS[resolveLocationKey(inquiry.location)];
    const agbPath = inquiry.customer_kind === "business" ? "legal/agb-b2b.pdf" : "legal/agb-b2c.pdf";
    const { data: agb, error: agbError } = await service.storage.from("brand-assets").download(agbPath);
    if (agbError || !agb) return json({ error: "Die AGB konnten nicht geladen werden. Es wurde nichts versendet." }, 409);
    const subject = await codedSubject(service, `${byForm(form, "Dein Angebot", "Ihr Angebot")} von SLT Rental – ${dispatch.number}`, { table, id: inquiry.id });
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `offer-resend-${inquiry.id}-${body.request_id}` }, body: JSON.stringify({
      from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
      ...documentEmailRecipients(dispatch.email, [loc.email]), reply_to: loc.email, subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px"><h2>${esc(byForm(form, "Dein Angebot", "Ihr Angebot"))} ${esc(dispatch.number)}</h2><p>${esc(greeting)}</p><p>${byForm(form, "Anbei erhältst du unser Angebot als PDF.", "Anbei erhalten Sie unser Angebot als PDF.")}</p>${acceptUrl ? `<p><a href="${esc(acceptUrl)}">Angebot online annehmen</a></p>` : ""}<p>${byForm(form, "Viele Grüße", "Freundliche Grüße")}<br>SLT Rental · ${esc(loc.name)}<br>${esc(loc.phone)} · ${esc(loc.email)}</p></div>`,
      attachments: [{ filename: `${dispatch.number}.pdf`, content: encodeBase64(new Uint8Array(await pdf.arrayBuffer())) }, { filename: "AGB_SLT-Rental.pdf", content: encodeBase64(new Uint8Array(await agb.arrayBuffer())) }],
    }) });
    if (!response.ok) return json({ error: "Der E-Mail-Dienst hat den Versand nicht bestätigt. Bitte später erneut versuchen." }, 502);
    // Only recipient/delivery evidence changes; the offer, PDF, status and numbers stay immutable.
    let warning: string | undefined;
    if (link?.status === "active") {
      const { error: savedError } = await service.from("offer_acceptance_links").update({ customer_email: dispatch.email, dispatched_at: new Date().toISOString() }).eq("id", link.id).eq("status", "active");
      if (savedError) warning = "E-Mail versendet; die Versandhistorie konnte nicht aktualisiert werden.";
    }
    return json({ success: true, email_sent: true, recipient: dispatch.email, offer_number: dispatch.number, warning });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Versand konnte nicht ausgeführt werden." }, 400);
  }
});