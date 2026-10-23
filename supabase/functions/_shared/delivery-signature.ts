import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { documentEmailRecipients } from "./test-email-routing.ts";
import { codedSubject } from "./order-code.ts";
import { byForm, resolveAddressForm, salutationLine } from "./salutation.ts";

export async function signatureTokenHash(token: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))), b => b.toString(16).padStart(2, "0")).join("");
}
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));

export async function requestDeliverySignature(svc: any, note: any, inquiry: any, pdf: Uint8Array) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key || !inquiry.customer_email) throw new Error("E-Mail zur Kundenunterschrift konnte nicht gesendet werden: E-Mail-Adresse oder Versandzugang fehlt.");
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
  const { error } = await svc.from("delivery_signature_links").insert({ delivery_note_id: note.id, token_hash: await signatureTokenHash(token), expires_at: new Date(Date.now() + 30 * 86400000).toISOString() });
  if (error) throw error;
  const link = `https://app.slt-rental.de/b2b/protokoll-unterschreiben/${token}`;
  const form = await resolveAddressForm(svc, inquiry);
  const greeting = salutationLine({ address_form: form, salutation: inquiry.customer_salutation, name: inquiry.customer_name });
  const t = (du: string, sie: string) => byForm(form, du, sie);
  const recipients = documentEmailRecipients(inquiry.customer_email);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`, ...recipients,
      reply_to: inquiry.location_email || undefined,
      subject: await codedSubject(svc, `Bitte Übergabeprotokoll ${note.delivery_note_number} unterschreiben`, { table: "rental_inquiries", id: inquiry.id }),
      html: `<p>${esc(greeting)}</p><p>${t("Du warst", "Sie waren")} bei der Übergabe nicht anwesend. Das Übergabeprotokoll ist beigefügt. Bitte ${t("prüfe die Angaben und unterschreibe", "prüfen Sie die Angaben und unterschreiben Sie")} es digital.</p><p><a href="${link}">Übergabeprotokoll prüfen und unterschreiben</a></p><p>Der persönliche Link ist 30 Tage gültig. Nach der Unterschrift ${t("erhältst du", "erhalten Sie")} die unterschriebene Kopie.</p><p>${t("Dein", "Ihr")} SLT-Rental-Team</p>`,
      attachments: [{ filename: note.file_name, content: encodeBase64(pdf), content_type: "application/pdf" }],
    }),
  });
  if (!response.ok) throw new Error(`Unterschriftsanfrage konnte nicht per E-Mail gesendet werden (${response.status}).`);
  const { error: updateError } = await svc.from("b2b_delivery_notes").update({ email_sent: true, email_sent_at: new Date().toISOString() }).eq("id", note.id);
  if (updateError) throw updateError;
  return true;
}