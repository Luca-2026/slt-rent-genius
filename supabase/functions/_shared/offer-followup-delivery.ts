import { codedSubject } from "./order-code.ts";
import { LOCATION_CONTACTS, resolveLocationKey } from "./inquiry-offer-math.ts";
import { operationalEmailRecipient } from "./test-email-routing.ts";
import { byForm, resolveAddressForm, salutationLine } from "./salutation.ts";
import { DECLINE_REASONS, escapeOfferText as esc, followupSequence } from "./offer-followup.ts";

// Initial activation is test-only until production mail is explicitly released.
const maySend = (email: string) => email.trim().toLowerCase() === "luca@sandhoff.org" || Deno.env.get("OFFER_FOLLOWUPS_LIVE") === "true";

export async function processOfferFollowups(service: any, onlyLinkId?: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("E-Mail-Versand ist nicht konfiguriert");
  // Never expire unrelated production offers during the test-only rollout.
  if (!onlyLinkId && Deno.env.get("OFFER_FOLLOWUPS_LIVE") === "true") await service.rpc("expire_open_offer_links");
  let query = service.from("offer_acceptance_links").select("*").in("status", ["active", "declined"]).order("created_at").limit(200);
  if (onlyLinkId) query = query.eq("id", onlyLinkId);
  const { data: links, error } = await query;
  if (error) throw error;
  let sent = 0;
  for (const link of links ?? []) {
    if (!maySend(link.customer_email ?? "")) continue;
    const { data: inquiry } = await service.from(link.inquiry_table).select("*").eq("id", link.inquiry_id).maybeSingle();
    if (!inquiry || inquiry.offer_number !== link.offer_number) continue;
    const { data: deadline, error: deadlineError } = await service.rpc("offer_link_deadline_by_id", { p_id: link.id });
    if (deadlineError) throw deadlineError;
    const { data: previous, error: historyError } = await service.from("offer_followup_deliveries").select("*").eq("link_id", link.id).order("created_at", { ascending: false });
    if (historyError) throw historyError;
    const kind = link.status === "declined" ? "decline" : "followup";
    if (kind === "followup" && (link.inquiry_table !== "rental_inquiries" || inquiry.status !== "offer_sent")) continue;
    const prior = (previous ?? []).filter((p: any) => p.kind === kind);
    if (kind === "decline" && prior.some((p: any) => p.status === "sent")) continue;
    const pending = prior.find((p: any) => p.status === "pending");
    const last = prior.find((p: any) => p.status === "sent");
    const seq = kind === "decline" ? 0 : pending?.sequence ?? followupSequence(link.dispatched_at, last?.sent_at ?? null, deadline);
    if (seq === null || (kind === "followup" && (!deadline || Date.now() >= Date.parse(deadline)))) continue;
    const loc = LOCATION_CONTACTS[resolveLocationKey(inquiry.location)];
    const recipient = kind === "decline" ? operationalEmailRecipient(link.customer_email, loc.email) : link.customer_email;
    const { error: insertError } = await service.from("offer_followup_deliveries").upsert({ link_id: link.id, kind, sequence: seq, recipient }, { onConflict: "link_id,kind,sequence", ignoreDuplicates: true });
    if (insertError) throw insertError;
    const { data: delivery } = await service.from("offer_followup_deliveries").select("*").eq("link_id", link.id).eq("kind", kind).eq("sequence", seq).maybeSingle();
    if (!delivery || delivery.status === "sent") continue;
    // Re-read before dispatch: stop reminders on a concurrent decision or revision.
    const { data: current } = await service.from("offer_acceptance_links").select("status").eq("id", link.id).maybeSingle();
    if (current?.status !== link.status) continue;
    const form = await resolveAddressForm(service, inquiry);
    const t = (du: string, sie: string) => byForm(form, du, sie);
    const greeting = salutationLine({ address_form: form, salutation: inquiry.customer_salutation, name: inquiry.customer_name });
    const url = `https://www.slt-rental.de/angebot/${link.token}`;
    const reason = DECLINE_REASONS[link.decline_reason as keyof typeof DECLINE_REASONS] ?? "Sonstiger Grund";
    const html = kind === "decline"
      ? `<h2>Angebot abgelehnt</h2><p>${esc(inquiry.company_name || inquiry.customer_name)} hat Angebot ${esc(link.offer_number)} abgelehnt.</p><p><strong>Grund: ${esc(reason)}</strong></p><p style="white-space:pre-wrap">${esc(link.decline_note)}</p><p><a href="https://app.slt-rental.de/b2b/${link.inquiry_table === "rental_inquiries" ? `mietanfragen/${inquiry.id}` : `verkaufsanfragen?anfrage=${inquiry.id}`}">Auftrag öffnen</a></p>`
      : `<p>${esc(greeting)}</p><p>${t("Ist dein Mietangebot noch interessant?", "Ist Ihr Mietangebot noch interessant?")} Zu Angebot <strong>${esc(link.offer_number)}</strong> liegt uns noch keine Annahme vor.</p><p>${t("Du kannst das Angebot hier prüfen und digital unterschreiben oder uns mitteilen, wenn du es nicht benötigst.", "Sie können das Angebot hier prüfen und digital unterschreiben oder uns mitteilen, wenn Sie es nicht benötigen.")}</p><p><a href="${url}">Angebot öffnen und annehmen</a></p><p><a href="${url}?aktion=ablehnen">Angebot ablehnen</a></p><p>Gültig bis ${esc(new Date(deadline).toLocaleString("de-DE", { timeZone: "Europe/Berlin" }))} Uhr, spätestens bis Mietbeginn.</p><p>${t("Viele Grüße", "Freundliche Grüße")}<br>SLT Rental · ${esc(loc.name)}<br>${esc(loc.phone)} · ${esc(loc.email)}</p>`;
    const subject = await codedSubject(service, kind === "decline" ? `Angebot ${link.offer_number} abgelehnt – ${reason}` : `Nachfrage zu Angebot ${link.offer_number}`, { table: link.inquiry_table, id: inquiry.id });
    const res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `offer-${delivery.id}` }, body: JSON.stringify({ from: `SLT Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`, to: [recipient], reply_to: loc.email, subject, html: `<div style="font-family:Arial,sans-serif;max-width:600px">${html}</div>` }) });
    if (!res.ok) continue;
    const response = await res.json();
    const { error: savedError } = await service.from("offer_followup_deliveries").update({ status: "sent", provider_id: response.id, sent_at: new Date().toISOString() }).eq("id", delivery.id);
    if (savedError) throw savedError;
    sent++;
  }
  return { sent };
}