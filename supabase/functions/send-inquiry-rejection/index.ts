/**
 * Sendet eine freundliche Absage zu einer Miet- oder Verkaufsanfrage und setzt
 * den Vorgang im Portal auf "Abgelehnt".
 *
 * - Aufrufer muss Admin oder aktiver Mitarbeiter sein (JWT-Prüfung).
 * - Standort-Postfach immer in Kopie.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { byForm, resolveAddressForm, salutationLine } from "../_shared/salutation.ts";
import {
  normalizeRejectionDecisions,
  rejectionItemsHtml,
  rejectionItemsOf,
  rejectionNoteSummary,
  rejectionSubjectSuffix,
  rejectionTexts,
} from "../_shared/inquiry-rejection.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const LOCATION_CONTACTS: Record<string, { name: string; email: string; phone: string }> = {
  krefeld: { name: "Krefeld", email: "krefeld@slt-rental.de", phone: "02151 417 99 04" },
  bonn: { name: "Bonn", email: "bonn@slt-rental.de", phone: "0228 504 660 61" },
  muelheim: { name: "Mülheim an der Ruhr", email: "muelheim@slt-rental.de", phone: "02151 417 99 04" },
};

function resolveLocationKey(raw: string | null | undefined): string {
  const value = (raw ?? "").toLowerCase();
  if (!value) return "krefeld";
  if (value.includes("bonn")) return "bonn";
  if (value.includes("mülheim") || value.includes("muelheim") || value.includes("mulheim")) return "muelheim";
  return "krefeld";
}

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: userData, error: userErr } = await service.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const { data: isStaff } = await service.rpc("is_staff_member", { _user_id: user.id });
    if (!isStaff) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return json({ error: "Ungültige Anfrage" }, 400);

    const inquiryType = body.inquiry_type;
    const inquiryId = body.inquiry_id;
    if (inquiryType !== "rental" && inquiryType !== "sales") {
      return json({ error: "inquiry_type muss 'rental' oder 'sales' sein" }, 400);
    }
    if (typeof inquiryId !== "string" || inquiryId.length < 10) {
      return json({ error: "inquiry_id fehlt" }, 400);
    }
    const extraNote = typeof body.note === "string" ? body.note.trim().slice(0, 800) : "";
    const notifyCustomer = body.notify_customer !== false;

    // Begründung: Standardtext ("nicht verfügbar") oder eigene Formulierung.
    const reasonMode = body.reason_mode === "custom" ? "custom" : "unavailable";
    const customReason = typeof body.custom_reason === "string" ? body.custom_reason.trim().slice(0, 800) : "";
    if (reasonMode === "custom" && customReason.length < 10) {
      return json({ error: "Bitte eine Begründung mit mindestens 10 Zeichen angeben." }, 400);
    }

    const table = inquiryType === "rental" ? "rental_inquiries" : "sales_inquiries";
    const { data: inquiry, error: inqErr } = await service
      .from(table)
      .select("*")
      .eq("id", inquiryId)
      .maybeSingle();
    if (inqErr || !inquiry) return json({ error: "Anfrage nicht gefunden" }, 404);

    // Artikel immer aus der gespeicherten Anfrage; Browser liefert nur Entscheidungen je Index.
    const items = rejectionItemsOf(inquiryType, inquiry);
    let rawDecisions: unknown = body.items;
    if (!Array.isArray(rawDecisions)) {
      // Altaufrufe ohne Einzelentscheidung: alles nicht verfügbar, Alternative am ersten Artikel.
      rawDecisions = items.map((i) => ({ index: i.index, available: false, alternative: i.index === 0 ? body.alternative : null }));
    }
    const decided = normalizeRejectionDecisions(items, rawDecisions);
    if (!decided.ok) return json({ error: decided.error }, 400);
    const decisions = decided.decisions;

    const customerName = inquiryType === "rental"
      ? (inquiry.customer_name || "")
      : [inquiry.first_name, inquiry.last_name].filter(Boolean).join(" ");

    const locationKey = resolveLocationKey(inquiry.location);
    const loc = LOCATION_CONTACTS[locationKey];
    const customerEmail: string | null = inquiry.customer_email;
    const form = await resolveAddressForm(service, {
      crm_customer_id: inquiry.crm_customer_id ?? null,
      b2b_profile_id: inquiry.b2b_profile_id ?? null,
      address_form: inquiry.address_form ?? null,
    });

    let emailSent = false;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (notifyCustomer && customerEmail && resendKey) {
      const fmtDate = (raw: unknown) => {
        const value = typeof raw === "string" ? raw.slice(0, 10) : "";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
        const [y, m, d] = value.split("-");
        return `${d}.${m}.${y}`;
      };
      const startDe = inquiryType === "rental" ? fmtDate(inquiry.start_date) : "";
      const endDe = inquiryType === "rental" ? fmtDate(inquiry.end_date) : "";
      const period = startDe ? `${startDe}${endDe ? ` bis ${endDe}` : ""}` : "";

      const texts = rejectionTexts(form, inquiryType, decisions);
      const rejectionText = reasonMode === "custom" ? escapeHtml(customReason) : texts.standard;
      const itemsBlock = rejectionItemsHtml(decisions, form, {
        inquiryPeriod: period,
        locationKey,
        resolveLocationKey,
      });
      const subjectProduct = decisions.length === 1 ? decisions[0].name : "";
      const greeting = salutationLine({
        address_form: form,
        salutation: inquiryType === "rental" ? inquiry.customer_salutation : inquiry.salutation,
        name: customerName,
      });
      const title = byForm(form, "Deine Anfrage bei SLT Rental", "Ihre Anfrage bei SLT Rental");
      const thanks = byForm(form, "vielen Dank für deine Anfrage", "vielen Dank für Ihre Anfrage");
      const interest = byForm(form, "dein Interesse", "Ihr Interesse");
      const contactLabel = byForm(form, "Dein Kontakt", "Ihr Kontakt");

      const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:16px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
<div style="max-width:600px;margin:0 auto;">
  <h2 style="color:#00507d;margin:0 0 16px;">${title}</h2>
  <p>${escapeHtml(greeting)}</p>
  <p>${thanks}${subjectProduct ? ` zu <strong>${escapeHtml(subjectProduct)}</strong>` : ""}${period ? ` für den Zeitraum ${escapeHtml(period)}` : ""} und ${interest} an SLT&nbsp;Rental.</p>
  <p style="white-space:pre-wrap;">${rejectionText}</p>
  ${itemsBlock}
  ${extraNote ? `<p style="white-space:pre-wrap;background:#f1f5f9;border-left:4px solid #00507d;padding:12px 16px;border-radius:4px;">${escapeHtml(extraNote)}</p>` : ""}
  <p>${texts.closing}</p>
  <div style="background:#fff7ed;border-left:4px solid #ff8e02;padding:12px 16px;margin:20px 0;border-radius:4px;">
    <strong>${contactLabel} am Standort ${escapeHtml(loc.name)}:</strong><br>
    Tel. ${escapeHtml(loc.phone)} · <a href="mailto:${escapeHtml(loc.email)}" style="color:#00507d;">${escapeHtml(loc.email)}</a>
  </div>
  <p style="margin-top:24px;">Viele Grüße<br>Dein SLT Rental Team – Standort ${escapeHtml(loc.name)}</p>
</div></body></html>`.replace(
        "Viele Grüße<br>Dein SLT Rental Team",
        byForm(form, "Viele Grüße<br>Dein SLT Rental Team", "Freundliche Grüße<br>Ihr SLT Rental Team"),
      );

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
            to: [customerEmail],
            cc: Array.from(
              new Set(
                [loc.email, typeof inquiry.location_email === "string" ? inquiry.location_email : ""]
                  .filter((e) => e && e !== customerEmail),
              ),
            ),
            reply_to: loc.email,
            subject: `${title}${rejectionSubjectSuffix(decisions)}`,
            html,
          }),
        });
        if (!res.ok) {
          console.error("Resend error:", res.status, await res.text());
        } else {
          emailSent = true;
        }
      } catch (err) {
        console.error("Absage-Mail fehlgeschlagen:", err);
      }
    }

    const reasonLabel = reasonMode === "custom" ? `Grund: ${customReason}` : "Grund: Artikel nicht verfügbar (Standardtext)";
    const altLabel = ` | Artikel: ${rejectionNoteSummary(decisions)}`;
    const noteLine = `[${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}] Absage versendet${emailSent ? "" : " (ohne E-Mail)"} – ${reasonLabel}${altLabel}${extraNote ? ` | Zusatz: ${extraNote}` : ""}`;
    const internalNotes = [inquiry.internal_notes, noteLine].filter(Boolean).join("\n");

    const { error: updErr } = await service
      .from(table)
      .update({ status: "rejected", internal_notes: internalNotes })
      .eq("id", inquiryId);
    if (updErr) {
      console.error("Statusupdate fehlgeschlagen:", updErr.message);
      return json({ error: "Status konnte nicht gesetzt werden" }, 500);
    }

    return json({ success: true, email_sent: emailSent });
  } catch (err) {
    console.error("send-inquiry-rejection error:", err);
    return json({ error: err instanceof Error ? err.message : "Unbekannter Fehler" }, 500);
  }
});
