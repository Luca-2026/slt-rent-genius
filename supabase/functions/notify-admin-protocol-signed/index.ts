import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user is authenticated
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { type, id } = await req.json();
    if (!type || !id) {
      return new Response(JSON.stringify({ error: "type and id required" }), { status: 400, headers: corsHeaders });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), { status: 500, headers: corsHeaders });
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Get all admin emails
    const { data: adminRoles } = await serviceClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No admins to notify" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get admin emails from auth
    const adminEmails: string[] = [];
    for (const role of adminRoles) {
      const { data: userData } = await serviceClient.auth.admin.getUserById(role.user_id);
      if (userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }

    if (adminEmails.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No admin emails found" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let documentNumber = "";
    let companyName = "";
    let contactName = "";
    let protocolType = "";
    let portalLink = "";

    if (type === "delivery_note") {
      const { data: dn } = await serviceClient.from("b2b_delivery_notes").select("*").eq("id", id).single();
      if (!dn) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: corsHeaders });

      const { data: profile } = await serviceClient.from("b2b_profiles").select("*").eq("id", dn.b2b_profile_id).single();
      documentNumber = dn.delivery_note_number;
      companyName = profile?.company_name || "–";
      contactName = profile ? `${profile.contact_first_name} ${profile.contact_last_name}` : "–";
      protocolType = "Übergabeprotokoll";
      portalLink = "https://www.slt-rental.de/b2b/admin";
    } else if (type === "return_protocol") {
      const { data: rp } = await serviceClient.from("b2b_return_protocols").select("*").eq("id", id).single();
      if (!rp) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: corsHeaders });

      const { data: profile } = await serviceClient.from("b2b_profiles").select("*").eq("id", rp.b2b_profile_id).single();
      documentNumber = rp.return_protocol_number;
      companyName = profile?.company_name || "–";
      contactName = profile ? `${profile.contact_first_name} ${profile.contact_last_name}` : "–";
      protocolType = "Rückgabeprotokoll";
      portalLink = "https://www.slt-rental.de/b2b/admin";
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400, headers: corsHeaders });
    }

    const emailHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:25px 40px;text-align:center;border-bottom:3px solid #00507d;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:70px;width:auto;" />
    </div>
    <div style="background:#16a34a;padding:14px 40px;text-align:center;">
      <p style="color:#ffffff;margin:0;font-size:15px;font-weight:600;">✅ ${escapeHtml(protocolType)} wurde unterschrieben</p>
    </div>
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;">Hallo,</p>
      <p style="font-size:14px;color:#555;line-height:1.6;">das ${escapeHtml(protocolType)} <strong>${escapeHtml(documentNumber)}</strong> wurde soeben vom Kunden digital unterschrieben.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
        <table style="width:100%;font-size:14px;color:#333;">
          <tr><td style="padding:4px 0;font-weight:600;">Firma:</td><td style="padding:4px 0;">${escapeHtml(companyName)}</td></tr>
          <tr><td style="padding:4px 0;font-weight:600;">Ansprechpartner:</td><td style="padding:4px 0;">${escapeHtml(contactName)}</td></tr>
          <tr><td style="padding:4px 0;font-weight:600;">Dokument:</td><td style="padding:4px 0;">${escapeHtml(documentNumber)}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin:30px 0;">
        <a href="${portalLink}" style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:14px;font-weight:600;">Im Admin-Portal ansehen →</a>
      </div>
    </div>
    <div style="background:#f1f5f9;padding:25px 40px;border-top:1px solid #e2e8f0;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600;">SLT-Rental GmbH</p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">Automatische Benachrichtigung – B2B Portal</p>
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
        to: adminEmails,
        subject: `${protocolType} ${documentNumber} wurde unterschrieben – ${companyName}`,
        html: emailHtml,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend error:", emailRes.status, errBody);
      return new Response(JSON.stringify({ error: "Email sending failed" }), { status: 500, headers: corsHeaders });
    }

    await emailRes.text();

    return new Response(
      JSON.stringify({ success: true, notified: adminEmails.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("notify-admin-protocol-signed error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
