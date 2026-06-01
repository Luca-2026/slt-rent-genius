import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLT_LOGO = "https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    // Verify caller via JWT
    const authedClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authedClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const senderUserId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Check admin role
    const { data: roleData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", senderUserId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { b2b_profile_id, subject, body: messageBody } = body ?? {};
    if (!b2b_profile_id || !subject || !messageBody) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof subject !== "string" || typeof messageBody !== "string") {
      return new Response(JSON.stringify({ error: "Invalid types" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (subject.length > 200 || messageBody.length > 10000) {
      return new Response(JSON.stringify({ error: "Too long" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load recipient profile
    const { data: profile, error: profileErr } = await admin
      .from("b2b_profiles")
      .select("id, company_name, contact_first_name, contact_last_name, contact_email")
      .eq("id", b2b_profile_id)
      .maybeSingle();
    if (profileErr || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load sender name
    const { data: staff } = await admin
      .from("staff_profiles")
      .select("first_name, last_name")
      .eq("user_id", senderUserId)
      .maybeSingle();
    const senderName = staff
      ? `${staff.first_name} ${staff.last_name}`.trim()
      : (userData.user.email ?? "SLT Rental Team");

    // Insert message
    const { data: inserted, error: insertErr } = await admin
      .from("b2b_admin_messages")
      .insert({
        b2b_profile_id,
        sender_user_id: senderUserId,
        sender_name: senderName,
        subject,
        body: messageBody,
      })
      .select("id")
      .single();
    if (insertErr) {
      console.error("Insert error:", insertErr);
      return new Response(JSON.stringify({ error: "DB error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email
    const escapeHtml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const bodyHtml = escapeHtml(messageBody).replace(/\n/g, "<br>");
    const portalUrl = "https://www.slt-rental.de/b2b/dashboard";

    const customerHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <div style="background:#00507d;padding:20px;text-align:center;">
    <img src="${SLT_LOGO}" alt="SLT Rental" style="height:40px;">
  </div>
  <div style="padding:24px;">
    <h2 style="color:#1a1a1a;margin-top:0;font-size:18px;">${escapeHtml(subject)}</h2>
    <p style="color:#374151;line-height:1.6;">Hallo ${escapeHtml(profile.contact_first_name)},</p>
    <div style="color:#374151;line-height:1.6;background:#f9fafb;border-left:4px solid #00507d;padding:14px 16px;margin:16px 0;border-radius:4px;">
      ${bodyHtml}
    </div>
    <p style="color:#374151;line-height:1.6;">
      Diese Nachricht findest du auch in deinem B2B-Portal:
    </p>
    <p style="margin:18px 0;">
      <a href="${portalUrl}" style="background:#ff8e02;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">B2B-Portal öffnen</a>
    </p>
    <p style="color:#374151;line-height:1.6;">
      Mit freundlichen Grüßen,<br>
      <strong>${escapeHtml(senderName)}</strong><br>
      SLT Rental Team
    </p>
    <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="color:#9ca3af;font-size:12px;line-height:1.5;">
      SLT Technology Group GmbH &amp; Co. KG · b2b@slt-rental.de · www.slt-rental.de
    </p>
  </div>
</div>`.trim();

    let emailSent = false;
    if (RESEND_API_KEY && profile.contact_email) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "SLT Rental <b2b@slt-rental.de>",
          to: [profile.contact_email],
          cc: ["b2b@slt-rental.de"],
          reply_to: "b2b@slt-rental.de",
          subject: `${subject} – SLT Rental`,
          html: customerHtml,
        }),
      });
      if (!res.ok) {
        console.error("Resend error:", await res.text());
      } else {
        emailSent = true;
        await admin
          .from("b2b_admin_messages")
          .update({ email_sent: true, email_sent_at: new Date().toISOString() })
          .eq("id", inserted.id);
      }
    } else {
      console.log("RESEND_API_KEY missing or no contact_email — skipping email");
    }

    return new Response(
      JSON.stringify({ success: true, id: inserted.id, email_sent: emailSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-admin-message error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
