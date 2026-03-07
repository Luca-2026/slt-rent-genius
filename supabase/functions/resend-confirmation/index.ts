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
    const { email, type } = await req.json();

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

    // Use service role to generate a new signup confirmation link
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await serviceClient.auth.admin.generateLink({
      type: "signup",
      email,
      options: {
        redirectTo: `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovableproject.com') || 'https://slt-rent-genius.lovable.app'}/`,
      },
    });

    if (error) {
      console.error("Generate link error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send the confirmation email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendDomain = Deno.env.get("RESEND_DOMAIN") || "slt-rental.de";

    if (resendApiKey && data?.properties?.action_link) {
      const confirmationUrl = data.properties.action_link;

      const htmlBody = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Montserrat',Arial,sans-serif;background:#ffffff;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:24px 32px;text-align:center;border-bottom:3px solid #ff8e02;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-rental-logo.png" alt="SLT Rental" style="height:48px;" />
    </div>
    <div style="padding:32px;">
      <h1 style="color:#393d46;font-size:22px;font-weight:bold;margin:0 0 20px;">E-Mail-Adresse bestätigen</h1>
      <p style="color:#595959;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Vielen Dank für deine Registrierung im SLT Rental B2B-Portal!
      </p>
      <p style="color:#595959;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Button klickst:
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${confirmationUrl}" 
           style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">
          E-Mail bestätigen
        </a>
      </div>
      <p style="color:#595959;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Nach der Bestätigung wird dein Konto geprüft und du erhältst eine weitere E-Mail, sobald es freigeschaltet wurde.
      </p>
      <p style="color:#999999;font-size:12px;margin:20px 0 0;">
        Falls du kein Konto erstellt hast, kannst du diese E-Mail ignorieren.
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
          subject: "E-Mail-Adresse bestätigen – SLT Rental B2B-Portal",
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

      console.log(`Confirmation email resent to ${email}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("resend-confirmation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
