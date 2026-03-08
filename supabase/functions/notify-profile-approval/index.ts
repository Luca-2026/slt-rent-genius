import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify caller is admin
    const { data: { user: authUser } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
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

    const { profileId } = await req.json();
    if (!profileId) {
      return new Response(JSON.stringify({ error: "profileId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch profile
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile, error: profileError } = await serviceClient
      .from("b2b_profiles")
      .select("company_name, contact_first_name, contact_last_name, contact_email, assigned_location")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerName = `${profile.contact_first_name} ${profile.contact_last_name}`;
    const portalUrl = "https://www.slt-rental.de/b2b/login";

    const emailHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:25px 40px;text-align:center;border-bottom:3px solid #00507d;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:70px;width:auto;" />
    </div>
    <div style="background:#00507d;padding:14px 40px;text-align:center;">
      <p style="color:#ffffff;margin:0;font-size:15px;font-weight:600;">Ihr B2B-Konto wurde freigeschaltet</p>
    </div>
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;">Guten Tag ${customerName},</p>
      <p style="font-size:14px;color:#555;line-height:1.6;">
        wir freuen uns, Ihnen mitteilen zu können, dass Ihr B2B-Kundenkonto für <strong>${profile.company_name}</strong> erfolgreich geprüft und freigeschaltet wurde.
      </p>
      <p style="font-size:14px;color:#555;line-height:1.6;">
        Sie können ab sofort alle Funktionen des B2B-Portals nutzen:
      </p>
      <ul style="font-size:14px;color:#555;line-height:1.8;padding-left:20px;">
        <li>Geräte anfragen und reservieren</li>
        <li>Individuelle B2B-Konditionen einsehen</li>
        <li>Angebote, Rechnungen und Protokolle verwalten</li>
        <li>Autorisierte Mitarbeiter hinzufügen</li>
      </ul>
      <div style="text-align:center;margin:30px 0;">
        <a href="${portalUrl}"
           style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:14px;font-weight:600;">
          Jetzt zum B2B-Portal →
        </a>
      </div>
      <p style="font-size:14px;color:#555;line-height:1.6;">
        Bei Fragen stehen wir Ihnen gerne zur Verfügung.
      </p>
      <p style="font-size:14px;color:#555;margin-top:20px;">
        Mit freundlichen Grüßen<br/>
        <strong>Ihr SLT-Rental Team</strong>
      </p>
    </div>
    <div style="background:#f1f5f9;padding:25px 40px;border-top:1px solid #e2e8f0;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600;">SLT Technology Group GmbH & Co. KG</p>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">Tel: +49 (0) 2151 - 417 99 04 · E-Mail: mieten@slt-rental.de</p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">www.slt-rental.de</p>
    </div>
  </div>
</body></html>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
        to: [profile.contact_email],
        subject: "Ihr B2B-Konto bei SLT-Rental wurde freigeschaltet",
        html: emailHtml,
      }),
    });

    const emailBody = await emailRes.text();

    if (!emailRes.ok) {
      console.error("Resend error:", emailRes.status, emailBody);
      return new Response(JSON.stringify({ error: "Email sending failed", details: emailBody }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Approval email sent to:", profile.contact_email);

    return new Response(JSON.stringify({ success: true, email_sent_to: profile.contact_email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
