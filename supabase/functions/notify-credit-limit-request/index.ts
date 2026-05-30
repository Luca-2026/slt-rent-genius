import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const B2B_NOTIFY_EMAIL = "b2b@slt-rental.de";

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const BodySchema = z.object({
  profileId: z.string().uuid(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey || !resendApiKey) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const service = createClient(supabaseUrl, serviceKey);
    const { data: profile, error: profileErr } = await service
      .from("b2b_profiles")
      .select("id, user_id, company_name, contact_first_name, contact_last_name, contact_email, contact_phone, billing_email, assigned_location, credit_limit, used_credit")
      .eq("id", parsed.data.profileId)
      .single();

    if (profileErr || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // AuthZ: caller must own the profile
    if (profile.user_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendDomain = Deno.env.get("RESEND_DOMAIN") || "slt-rental.de";
    const e = {
      company: escapeHtml(profile.company_name),
      contact: escapeHtml(`${profile.contact_first_name} ${profile.contact_last_name}`.trim()),
      email: escapeHtml(profile.contact_email),
      phone: escapeHtml(profile.contact_phone || ""),
      billing: escapeHtml(profile.billing_email || ""),
      location: escapeHtml(profile.assigned_location || "—"),
      currentLimit: escapeHtml(
        new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(profile.credit_limit || 0),
      ),
    };

    const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:24px 32px;text-align:center;border-bottom:3px solid #f97316;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-rental-logo.png" alt="SLT Rental" style="height:48px;" />
    </div>
    <div style="padding:32px;">
      <h1 style="color:#1a1a1a;font-size:20px;margin:0 0 16px;">Neuer Kreditlimit-Antrag</h1>
      <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Ein Kunde hat im B2B-Portal ein Kreditlimit beantragt. Bitte prüfen und im Admin-Dashboard ein Limit vergeben.
      </p>

      <h2 style="color:#1a1a1a;font-size:16px;margin:24px 0 12px;border-bottom:2px solid #f97316;padding-bottom:6px;">Kunde</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;width:170px;">Firma</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;font-weight:600;">${e.company}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Ansprechpartner</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.contact}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">E-Mail</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.email}</td></tr>
        ${e.phone ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Telefon</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.phone}</td></tr>` : ""}
        ${e.billing ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Rechnungs-E-Mail</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.billing}</td></tr>` : ""}
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Standort</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;text-transform:capitalize;">${e.location}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Aktuelles Limit</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.currentLimit}</td></tr>
      </table>

      <div style="margin-top:28px;text-align:center;">
        <a href="https://www.slt-rental.de/b2b/admin" style="display:inline-block;background:#ff8e02;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">Im Admin-Dashboard öffnen</a>
      </div>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;text-align:center;font-size:12px;color:#999;">
      SLT Technology Group GmbH & Co. KG · Anrather Straße 291 · 47807 Krefeld
    </div>
  </div>
</body></html>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `SLT-Rental <noreply@${resendDomain}>`,
        to: [B2B_NOTIFY_EMAIL],
        reply_to: profile.contact_email,
        subject: `Kreditlimit-Antrag: ${profile.company_name}`.slice(0, 200),
        html: htmlBody,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend API error:", emailRes.status, errBody);
      return new Response(JSON.stringify({ error: "Email sending failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Credit limit request notification sent for profile ${profile.id}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("notify-credit-limit-request error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
