import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { documentEmailRecipients } from "../_shared/test-email-routing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SLT_LOGO =
  "https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png";

// Quelle: src/data/locationData.ts (keine erfundenen Daten)
const LOCATION_INFO: Record<string, { label: string; address: string; city: string; phone: string; email: string }> = {
  krefeld: { label: "Krefeld", address: "Anrather Straße 291", city: "47807 Krefeld-Fichtenhain", phone: "02151 417 99 04", email: "krefeld@slt-rental.de" },
  bonn: { label: "Bonn", address: "Drachenburgstraße 8", city: "53179 Bonn", phone: "0228 504 660 61", email: "bonn@slt-rental.de" },
  muelheim: { label: "Mülheim an der Ruhr", address: "Ruhrorter Str. 122", city: "45478 Mülheim an der Ruhr", phone: "02151 417 99 04", email: "muelheim@slt-rental.de" },
};

const escapeHtml = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const dateDe = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" });
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authed = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user: authUser },
    } = await authed.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Gleiche Rechte wie der Standortwechsel selbst (can_edit_operations).
    const { data: roleRows } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", authUser.id)
      .in("role", ["admin", "niederlassungsleiter", "standort_mitarbeiter"]);
    if (!roleRows || roleRows.length === 0) {
      return new Response(JSON.stringify({ error: "Keine Berechtigung" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const inquiryId = String(body?.inquiry_id ?? "");
    const fromKey = String(body?.from_location ?? "").toLowerCase();
    const toKey = String(body?.to_location ?? "").toLowerCase();
    const availability = body?.availability === "available" ? "available" : "unknown";
    const offerSent = body?.offer_sent === true;
    const customMessage = String(body?.custom_message ?? "").trim().slice(0, 500);

    if (!/^[0-9a-f-]{36}$/i.test(inquiryId)) {
      return new Response(JSON.stringify({ error: "inquiry_id ungültig" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!LOCATION_INFO[fromKey] || !LOCATION_INFO[toKey] || fromKey === toKey) {
      return new Response(JSON.stringify({ error: "Standorte ungültig" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: inquiry, error: inquiryError } = await admin
      .from("rental_inquiries")
      .select("id, customer_name, customer_email, product_name, requested_items, start_date, end_date, location, internal_notes")
      .eq("id", inquiryId)
      .single();
    if (inquiryError || !inquiry) {
      return new Response(JSON.stringify({ error: "Anfrage nicht gefunden" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Konsistenz: Die Info darf nur zum aktuell hinterlegten Standort rausgehen.
    const currentKey = String(inquiry.location ?? "").toLowerCase();
    if (currentKey !== toKey) {
      return new Response(
        JSON.stringify({ error: "Der Standort der Anfrage wurde zwischenzeitlich geändert – bitte neu laden." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const customerEmail = String(inquiry.customer_email ?? "").trim();
    if (!/.+@.+\..+/.test(customerEmail)) {
      return new Response(JSON.stringify({ error: "Keine gültige Kunden-E-Mail hinterlegt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: staff } = await admin
      .from("staff_profiles")
      .select("first_name, last_name, email")
      .eq("user_id", authUser.id)
      .maybeSingle();
    const senderName =
      `${staff?.first_name ?? ""} ${staff?.last_name ?? ""}`.trim() ||
      authUser.email ||
      "Dein SLT Rental Team";

    const from = LOCATION_INFO[fromKey];
    const to = LOCATION_INFO[toKey];

    const items: { product_name?: string; quantity?: number; set_size?: number | null }[] =
      Array.isArray(inquiry.requested_items) ? inquiry.requested_items : [];
    const itemNames = items.length
      ? items.map((it) => String(it?.product_name ?? "").trim()).filter(Boolean)
      : [String(inquiry.product_name ?? "").trim()].filter(Boolean);
    const qtyText = (it: { quantity?: number; set_size?: number | null }) =>
      it.set_size && it.set_size > 1
        ? `${it.quantity ?? 1} ${(it.quantity ?? 1) === 1 ? "Set" : "Sets"} (= ${(it.quantity ?? 1) * it.set_size} Stück)`
        : `${it.quantity ?? 1} Stück`;

    const start = dateDe(inquiry.start_date);
    const end = dateDe(inquiry.end_date);
    const period = start ? (end && end !== start ? `${start} bis ${end}` : start) : null;

    const firstName = String(inquiry.customer_name ?? "").trim().split(/\s+/)[0] || "";
    const greeting = firstName ? `Hallo ${escapeHtml(firstName)},` : "Hallo,";

    const articleLine =
      itemNames.length === 1
        ? `den Artikel <strong>${escapeHtml(itemNames[0])}</strong>`
        : `deine angefragten Artikel`;

    const mainMessage =
      availability === "available"
        ? `gute Nachricht: An unserem Standort ${escapeHtml(from.label)} können wir dir ${articleLine}${period ? ` im Zeitraum ${escapeHtml(period)}` : ""} leider nicht anbieten – an unserem Standort <strong>${escapeHtml(to.label)}</strong> dagegen schon. Wir haben deine Anfrage daher an unseren Standort ${escapeHtml(to.label)} übergeben.`
        : `wir haben deine Anfrage an unseren Standort <strong>${escapeHtml(to.label)}</strong> übergeben – von dort aus kümmern wir uns um ${articleLine}${period ? ` im Zeitraum ${escapeHtml(period)}` : ""}. Die genaue Verfügbarkeit prüfen wir gerade und melden uns umgehend bei dir.`;

    const itemsTableHtml =
      items.length > 0
        ? `<table style="width:100%;border-collapse:collapse;margin:8px 0 0;font-size:14px;">
            ${items
              .map(
                (it) =>
                  `<tr><td style="padding:5px 4px;border-bottom:1px solid #f3f4f6;">${escapeHtml(it.product_name)}</td><td style="padding:5px 4px;border-bottom:1px solid #f3f4f6;text-align:right;white-space:nowrap;color:#6b7280;">${escapeHtml(qtyText(it))}</td></tr>`,
              )
              .join("")}
          </table>`
        : "";

    const customHtml = customMessage
      ? `<div style="background:#f9fafb;border-left:4px solid #00507d;padding:12px 16px;margin:16px 0;border-radius:4px;color:#374151;line-height:1.6;">${escapeHtml(customMessage).replace(/\n/g, "<br>")}</div>`
      : "";

    const offerHint = offerSent
      ? `<p style="color:#374151;line-height:1.6;">Dein Angebot erhältst du in Kürze in einer aktualisierten Fassung mit dem Abholstandort ${escapeHtml(to.label)}.</p>`
      : "";

    const subject = `Deine Mietanfrage: Abholung in ${to.label} möglich`;

    const emailHtml = `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    <div style="background:#ffffff;padding:24px 40px;text-align:center;border-bottom:3px solid #00507d;">
      <img src="${SLT_LOGO}" alt="SLT-Rental" style="height:60px;width:auto;" />
    </div>
    <div style="background:#00507d;padding:14px 40px;text-align:center;">
      <p style="color:#ffffff;margin:0;font-size:15px;font-weight:600;">Deine Mietanfrage – Standort ${escapeHtml(to.label)}</p>
    </div>
    <div style="padding:32px 40px;">
      <p style="color:#374151;line-height:1.7;font-size:14px;margin:0 0 6px;">${greeting}</p>
      <p style="color:#374151;line-height:1.7;font-size:14px;margin:0 0 16px;">${mainMessage}</p>
      <div style="background:#fff7ed;border-left:4px solid #ff8e02;padding:12px 16px;margin:16px 0;border-radius:4px;">
        <strong style="color:#ea580c;">Neuer Abholstandort:</strong> ${escapeHtml(to.label)}<br>
        <span style="color:#374151;">${escapeHtml(to.address)}, ${escapeHtml(to.city)}</span><br>
        <span style="color:#374151;">Tel: ${escapeHtml(to.phone)} · <a href="mailto:${to.email}" style="color:#f97316;">${escapeHtml(to.email)}</a></span>
        ${period ? `<br><strong style="color:#ea580c;">Zeitraum:</strong> <span style="color:#374151;">${escapeHtml(period)}</span>` : ""}
        ${itemsTableHtml}
      </div>
      ${customHtml}
      ${offerHint}
      <p style="color:#374151;line-height:1.7;font-size:14px;">Wenn ${escapeHtml(to.label)} für dich nicht passt, sag uns einfach kurz Bescheid – wir finden gemeinsam eine Lösung.</p>
      <p style="color:#374151;line-height:1.7;font-size:14px;">
        <span style="color:#00507d;font-weight:600;">Viele Grüße</span><br>
        ${escapeHtml(senderName)}<br>
        SLT Rental – Standort ${escapeHtml(to.label)}
      </p>
    </div>
    <div style="background:#f1f5f9;padding:22px 40px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600;">SLT Technology Group GmbH &amp; Co. KG</p>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">Standort ${escapeHtml(to.label)} · ${escapeHtml(to.address)}, ${escapeHtml(to.city)} · Tel: ${escapeHtml(to.phone)}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">www.slt-rental.de</p>
    </div>
  </div>
</body></html>`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const RESEND_DOMAIN = Deno.env.get("RESEND_DOMAIN") || "slt-rental.de";

    let emailSent = false;
    if (RESEND_API_KEY) {
      // Testkunde (luca@sandhoff.org) bekommt die Mail ohne Kopie an ein Standort-Postfach.
      const recipients = documentEmailRecipients(customerEmail, [to.email]);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `SLT-Rental <noreply@${RESEND_DOMAIN}>`,
          to: recipients.to,
          ...(recipients.cc.length ? { cc: recipients.cc } : {}),
          reply_to: to.email,
          subject,
          html: emailHtml,
        }),
      });
      if (!res.ok) {
        console.error("Resend error:", res.status);
      } else {
        emailSent = true;
      }
    } else {
      console.log("RESEND_API_KEY missing – Standort-Info nicht versendet");
    }

    // Nachweis in den internen Notizen der Anfrage.
    const stamp = new Date().toLocaleString("de-DE", {
      timeZone: "Europe/Berlin",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const noteLine = `[${stamp} Uhr] Kunde per E-Mail über Standortwechsel ${from.label} → ${to.label} informiert (durch ${senderName})${emailSent ? "" : " – Versand fehlgeschlagen"}.`;
    const newNotes = inquiry.internal_notes
      ? `${inquiry.internal_notes}\n${noteLine}`
      : noteLine;
    await admin
      .from("rental_inquiries")
      .update({ internal_notes: newNotes })
      .eq("id", inquiryId);

    return new Response(
      JSON.stringify({ success: true, email_sent: emailSent, email_sent_to: customerEmail }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("send-location-notice error:", error);
    return new Response(JSON.stringify({ error: error?.message ?? "Internal" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
