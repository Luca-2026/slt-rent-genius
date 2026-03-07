import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: authUser } } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (!authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await anonClient
      .from("user_roles")
      .select("role")
      .eq("user_id", authUser.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to generate a password recovery link
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await serviceClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: "https://www.slt-rental.de/b2b/passwort-zuruecksetzen",
      },
    });

    if (error) {
      console.error("Generate recovery link error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send the password reset email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendDomain = Deno.env.get("RESEND_DOMAIN") || "slt-rental.de";

    if (resendApiKey && data?.properties?.action_link) {
      const resetUrl = data.properties.action_link;

      const htmlBody = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Montserrat',Arial,sans-serif;background:#ffffff;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:24px 32px;text-align:center;border-bottom:3px solid #ff8e02;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-rental-logo.png" alt="SLT Rental" style="height:48px;" />
    </div>
    <div style="padding:32px;">
      <h1 style="color:#393d46;font-size:22px;font-weight:bold;margin:0 0 20px;">Passwort zurücksetzen</h1>
      <p style="color:#595959;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Ein Administrator hat für dein Konto im SLT Rental B2B-Portal eine Passwort-Zurücksetzung angefordert.
      </p>
      <p style="color:#595959;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Klicke auf den folgenden Button, um ein neues Passwort festzulegen:
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${resetUrl}" 
           style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">
          Neues Passwort festlegen
        </a>
      </div>
      <p style="color:#595959;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Dieser Link ist 24 Stunden gültig. Danach muss ein neuer Link angefordert werden.
      </p>
      <p style="color:#999999;font-size:12px;margin:20px 0 0;">
        Falls du diese Anfrage nicht erwartest, kontaktiere bitte deinen Ansprechpartner.
      </p>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;text-align:center;font-size:12px;color:#999999;">
      SLT Technology Group GmbH & Co. KG · Anrather Straße 291 · 47807 Krefeld
    </div>
  </div>
</body>
</html>`;

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `SLT-Rental <noreply@${resendDomain}>`,
          to: [email],
          subject: "Passwort zurücksetzen – SLT Rental B2B-Portal",
          html: htmlBody,
        }),
      });

      if (!emailRes.ok) {
        const errBody = await emailRes.text();
        console.error("Resend API error:", emailRes.status, errBody);
        return new Response(JSON.stringify({ error: "Email sending failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Password reset email sent to ${email}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("admin-reset-password error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
