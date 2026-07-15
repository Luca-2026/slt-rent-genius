import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SLT_LOGO =
  "https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png";

// Source of truth: src/data/locationData.ts (spelled out to avoid inventing data)
const LOCATION_LABEL: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};
const LOCATION_PHONE: Record<string, string> = {
  krefeld: "02151 417 99 04",
  bonn: "0228 504 660 61",
  muelheim: "02151 417 99 04",
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

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

    // Verify admin role
    const { data: roleData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", authUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { profileId } = await req.json();
    if (!profileId) {
      return new Response(JSON.stringify({ error: "profileId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch profile
    const { data: profile, error: profileError } = await admin
      .from("b2b_profiles")
      .select(
        "id, company_name, contact_first_name, contact_last_name, contact_email, assigned_location"
      )
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch approving admin's staff profile for personal contact details
    const { data: staff } = await admin
      .from("staff_profiles")
      .select("first_name, last_name, email, phone, position")
      .eq("user_id", authUser.id)
      .maybeSingle();

    const senderFirstName = staff?.first_name?.trim() || "";
    const senderLastName = staff?.last_name?.trim() || "";
    const senderFullName =
      `${senderFirstName} ${senderLastName}`.trim() ||
      (authUser.email ?? "Dein SLT Rental Ansprechpartner");
    const senderEmail = staff?.email || authUser.email || "b2b@slt-rental.de";
    const senderPosition = staff?.position || "";

    const locKey = (profile.assigned_location || "krefeld").toLowerCase();
    const locationLabel = LOCATION_LABEL[locKey] || "Krefeld";
    const locationPhone = LOCATION_PHONE[locKey] || LOCATION_PHONE.krefeld;

    const customerFirstName = profile.contact_first_name || "";
    const subject = `Willkommen im SLT Rental B2B-Portal, ${profile.company_name}`;

    // Plain-text body — stored in b2b_admin_messages and rendered in dashboard
    const messageBody =
      `Hallo ${customerFirstName},\n\n` +
      `herzlich willkommen im SLT Rental B2B-Portal! Dein Firmenkonto für ${profile.company_name} ist jetzt freigeschaltet – ab sofort kannst du Geräte anfragen und reservieren, deine individuellen B2B-Konditionen einsehen sowie Angebote, Rechnungen und Protokolle verwalten.\n\n` +
      `Als dein persönlicher Ansprechpartner am Standort ${locationLabel} stehe ich dir bei Fragen oder Anmerkungen jederzeit direkt zur Verfügung – melde dich einfach per E-Mail oder telefonisch.\n\n` +
      `Viele Grüße\n${senderFullName}\nSLT Rental – Standort ${locationLabel}\nE-Mail: ${senderEmail}\nTelefon: ${locationPhone}`;

    // Insert into b2b_admin_messages so it appears in the customer's dashboard inbox
    const { data: inserted, error: insertErr } = await admin
      .from("b2b_admin_messages")
      .insert({
        b2b_profile_id: profile.id,
        sender_user_id: authUser.id,
        sender_name: senderFullName,
        subject,
        body: messageBody,
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("Insert admin message error:", insertErr);
    }

    // Build branded HTML email in SLT CI
    const bodyHtml = escapeHtml(messageBody)
      .replace(/\n/g, "<br>")
      // Highlight the signature block a bit
      .replace(
        `Viele Grüße<br>`,
        `<br><span style="color:#00507d;font-weight:600;">Viele Grüße</span><br>`
      );

    const portalUrl = "https://www.slt-rental.de/b2b/login";

    const emailHtml = `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    <div style="background:#ffffff;padding:24px 40px;text-align:center;border-bottom:3px solid #00507d;">
      <img src="${SLT_LOGO}" alt="SLT-Rental" style="height:60px;width:auto;" />
    </div>
    <div style="background:#00507d;padding:14px 40px;text-align:center;">
      <p style="color:#ffffff;margin:0;font-size:15px;font-weight:600;">Dein B2B-Konto wurde freigeschaltet</p>
    </div>
    <div style="padding:32px 40px;">
      <h2 style="color:#1a1a1a;margin:0 0 18px;font-size:20px;">Willkommen bei SLT Rental</h2>
      <div style="color:#374151;line-height:1.7;font-size:14px;background:#f9fafb;border-left:4px solid #ff8e02;padding:16px 18px;border-radius:4px;">
        ${bodyHtml}
      </div>
      <div style="text-align:center;margin:28px 0 8px;">
        <a href="${portalUrl}" style="display:inline-block;background:#ff8e02;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">
          Jetzt zum B2B-Portal →
        </a>
      </div>
      <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;line-height:1.5;text-align:center;">
        Diese Nachricht findest du auch in deinem B2B-Dashboard unter „Nachrichten".
      </p>
    </div>
    <div style="background:#f1f5f9;padding:22px 40px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600;">SLT Technology Group GmbH &amp; Co. KG</p>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">Standort ${escapeHtml(locationLabel)} · Tel: ${escapeHtml(locationPhone)}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">www.slt-rental.de</p>
    </div>
  </div>
</body></html>`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const RESEND_DOMAIN = Deno.env.get("RESEND_DOMAIN") || "slt-rental.de";

    let emailSent = false;
    if (RESEND_API_KEY && profile.contact_email) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `SLT-Rental <noreply@${RESEND_DOMAIN}>`,
          to: [profile.contact_email],
          cc: ["b2b@slt-rental.de"],
          reply_to: senderEmail,
          subject: `Willkommen im SLT Rental B2B-Portal – ${profile.company_name}`,
          html: emailHtml,
        }),
      });

      const emailBody = await emailRes.text();
      if (!emailRes.ok) {
        console.error("Resend error:", emailRes.status, emailBody);
      } else {
        emailSent = true;
        if (inserted?.id) {
          await admin
            .from("b2b_admin_messages")
            .update({
              email_sent: true,
              email_sent_at: new Date().toISOString(),
            })
            .eq("id", inserted.id);
        }
      }
    } else {
      console.log(
        "RESEND_API_KEY missing or no contact_email — email not sent"
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_sent: emailSent,
        email_sent_to: profile.contact_email,
        message_id: inserted?.id ?? null,
        sender: senderFullName,
        location: locationLabel,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("notify-profile-approval error:", error);
    return new Response(JSON.stringify({ error: error?.message ?? "Internal" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
