import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SLT_COMPANY = {
  name: "SLT-Rental GmbH",
  phone: "+49 (0) 123 456 789",
  email: "info@slt-rental.de",
  web: "www.slt-rental.de",
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

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const userId = claimsData.claims.sub;
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Check admin role
    const { data: roleData } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const { type, id, pdf_storage_path } = await req.json();

    if (!type || !id) {
      return new Response(JSON.stringify({ error: "type and id required" }), { status: 400, headers: corsHeaders });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), { status: 500, headers: corsHeaders });
    }

    let emailSubject = "";
    let emailHtml = "";
    let recipientEmail = "";
    let recipientName = "";
    let documentNumber = "";
    let documentId = "";
    let tableName = "";
    let attachments: { filename: string; content: string }[] = [];

    if (type === "delivery_note") {
      tableName = "b2b_delivery_notes";
      const { data: dn } = await serviceClient.from("b2b_delivery_notes").select("*").eq("id", id).single();
      if (!dn) return new Response(JSON.stringify({ error: "Delivery note not found" }), { status: 404, headers: corsHeaders });

      const { data: profile } = await serviceClient.from("b2b_profiles").select("*").eq("id", dn.b2b_profile_id).single();
      if (!profile) return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: corsHeaders });

      documentNumber = dn.delivery_note_number;
      documentId = dn.id;
      recipientEmail = profile.contact_email;
      recipientName = `${profile.contact_first_name} ${profile.contact_last_name}`;

      const { data: items } = await serviceClient.from("b2b_delivery_note_items").select("*").eq("delivery_note_id", dn.id);
      const itemsList = (items || []).map((item: any) =>
        `<li style="padding:4px 0;font-size:14px;">${item.quantity}x ${escapeHtml(item.product_name)}${item.description ? ` – ${escapeHtml(item.description)}` : ""}</li>`
      ).join("");

      emailSubject = `Ihr Übergabeprotokoll ${documentNumber} – SLT-Rental`;
      emailHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:25px 40px;text-align:center;border-bottom:3px solid #00507d;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:70px;width:auto;" />
    </div>
    <div style="background:#00507d;padding:14px 40px;text-align:center;">
      <p style="color:#ffffff;margin:0;font-size:15px;font-weight:600;">Ihr Übergabeprotokoll</p>
    </div>
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;">Guten Tag ${escapeHtml(recipientName)},</p>
      <p style="font-size:14px;color:#555;line-height:1.6;">anbei erhalten Sie Ihr unterschriebenes Übergabeprotokoll <strong>${documentNumber}</strong>.</p>
      ${itemsList ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="font-size:13px;font-weight:600;margin:0 0 8px;color:#333;">Übergebene Artikel:</p>
        <ul style="margin:0;padding-left:20px;color:#555;">${itemsList}</ul>
      </div>` : ""}
      <p style="font-size:14px;color:#555;line-height:1.6;">Das vollständige Übergabeprotokoll finden Sie auch in Ihrem B2B-Portal.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://www.slt-rental.de/b2b/uebergabeprotokolle" style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:14px;font-weight:600;">Zum B2B-Portal →</a>
      </div>
    </div>
    <div style="background:#f1f5f9;padding:25px 40px;border-top:1px solid #e2e8f0;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600;">${SLT_COMPANY.name}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">Tel: ${SLT_COMPANY.phone} · E-Mail: ${SLT_COMPANY.email}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">${SLT_COMPANY.web}</p>
    </div>
  </div>
</body></html>`;

    } else if (type === "delivery_note_signature_request") {
      // New type: send blank PDF for customer signature
      tableName = "b2b_delivery_notes";
      const { data: dn } = await serviceClient.from("b2b_delivery_notes").select("*").eq("id", id).single();
      if (!dn) return new Response(JSON.stringify({ error: "Delivery note not found" }), { status: 404, headers: corsHeaders });

      const { data: profile } = await serviceClient.from("b2b_profiles").select("*").eq("id", dn.b2b_profile_id).single();
      if (!profile) return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: corsHeaders });

      documentNumber = dn.delivery_note_number;
      documentId = dn.id;
      recipientEmail = profile.contact_email;
      recipientName = `${profile.contact_first_name} ${profile.contact_last_name}`;

      // Fetch PDF from storage
      if (pdf_storage_path) {
        const { data: fileData, error: dlError } = await serviceClient.storage
          .from("b2b-documents")
          .download(pdf_storage_path);

        if (!dlError && fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          const base64Content = base64Encode(new Uint8Array(arrayBuffer));
          attachments.push({
            filename: `${documentNumber}-Uebergabeprotokoll.pdf`,
            content: base64Content,
          });
        }
      }

      emailSubject = `Übergabeprotokoll ${documentNumber} – Bitte digital unterschreiben`;
      emailHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:25px 40px;text-align:center;border-bottom:3px solid #00507d;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:70px;width:auto;" />
    </div>
    <div style="background:#00507d;padding:14px 40px;text-align:center;">
      <p style="color:#ffffff;margin:0;font-size:15px;font-weight:600;">Übergabeprotokoll zur Unterschrift</p>
    </div>
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;">Sehr geehrte/r ${escapeHtml(recipientName)},</p>
      <p style="font-size:14px;color:#555;line-height:1.6;">für Ihre Mietgeräte wurde das Übergabeprotokoll <strong>${documentNumber}</strong> erstellt.</p>
      <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="font-size:14px;font-weight:600;margin:0 0 8px;color:#854d0e;">Bitte unterschreiben Sie digital:</p>
        <p style="font-size:13px;color:#713f12;margin:0;line-height:1.6;">Loggen Sie sich in Ihr B2B-Portal ein und unterschreiben Sie das Protokoll direkt online. Alternativ finden Sie das Dokument auch als PDF im Anhang.</p>
      </div>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://www.slt-rental.de/b2b/uebergabeprotokolle" style="display:inline-block;background:#ff8e02;color:#ffffff;text-decoration:none;padding:14px 35px;border-radius:6px;font-size:15px;font-weight:600;">Jetzt im Portal unterschreiben →</a>
      </div>
      <p style="font-size:14px;color:#555;line-height:1.6;">Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
      <p style="font-size:14px;color:#555;line-height:1.6;margin-top:25px;">Mit freundlichen Grüßen<br/><strong>Ihr SLT-Rental Team</strong></p>
    </div>
    <div style="background:#f1f5f9;padding:25px 40px;border-top:1px solid #e2e8f0;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600;">${SLT_COMPANY.name}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">Tel: ${SLT_COMPANY.phone} · E-Mail: ${SLT_COMPANY.email}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">${SLT_COMPANY.web}</p>
    </div>
  </div>
</body></html>`;

    } else if (type === "return_protocol") {
      tableName = "b2b_return_protocols";
      const { data: rp } = await serviceClient.from("b2b_return_protocols").select("*").eq("id", id).single();
      if (!rp) return new Response(JSON.stringify({ error: "Return protocol not found" }), { status: 404, headers: corsHeaders });

      const { data: profile } = await serviceClient.from("b2b_profiles").select("*").eq("id", rp.b2b_profile_id).single();
      if (!profile) return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: corsHeaders });

      documentNumber = rp.return_protocol_number;
      documentId = rp.id;
      recipientEmail = profile.contact_email;
      recipientName = `${profile.contact_first_name} ${profile.contact_last_name}`;

      const { data: items } = await serviceClient.from("b2b_return_protocol_items").select("*").eq("return_protocol_id", rp.id);
      const itemsList = (items || []).map((item: any) =>
        `<li style="padding:4px 0;font-size:14px;">${item.quantity}x ${escapeHtml(item.product_name)} – Zustand: ${item.condition === "good" ? "Gut" : item.condition === "minor_damage" ? "Leichte Mängel" : "Erhebliche Schäden"}${item.condition_notes ? ` (${escapeHtml(item.condition_notes)})` : ""}</li>`
      ).join("");

      emailSubject = `Ihr Rückgabeprotokoll ${documentNumber} – SLT-Rental`;
      emailHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:25px 40px;text-align:center;border-bottom:3px solid #00507d;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:70px;width:auto;" />
    </div>
    <div style="background:#00507d;padding:14px 40px;text-align:center;">
      <p style="color:#ffffff;margin:0;font-size:15px;font-weight:600;">Ihr Rückgabeprotokoll</p>
    </div>
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;">Guten Tag ${escapeHtml(recipientName)},</p>
      <p style="font-size:14px;color:#555;line-height:1.6;">anbei erhalten Sie Ihr unterschriebenes Rückgabeprotokoll <strong>${documentNumber}</strong>.</p>
      ${itemsList ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="font-size:13px;font-weight:600;margin:0 0 8px;color:#333;">Zurückgegebene Artikel:</p>
        <ul style="margin:0;padding-left:20px;color:#555;">${itemsList}</ul>
      </div>` : ""}
      <p style="font-size:14px;color:#555;line-height:1.6;">Das vollständige Rückgabeprotokoll finden Sie auch in Ihrem B2B-Portal.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://www.slt-rental.de/b2b/rueckgabeprotokolle" style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:14px;font-weight:600;">Zum B2B-Portal →</a>
      </div>
    </div>
    <div style="background:#f1f5f9;padding:25px 40px;border-top:1px solid #e2e8f0;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600;">${SLT_COMPANY.name}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">Tel: ${SLT_COMPANY.phone} · E-Mail: ${SLT_COMPANY.email}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">${SLT_COMPANY.web}</p>
    </div>
  </div>
</body></html>`;

    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400, headers: corsHeaders });
    }

    // Build email payload
    const emailPayload: any = {
      from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
      to: [recipientEmail],
      subject: emailSubject,
      html: emailHtml,
    };

    if (attachments.length > 0) {
      emailPayload.attachments = attachments;
    }

    // Send email
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend error:", emailRes.status, errBody);
      return new Response(JSON.stringify({ error: "Email sending failed", details: errBody }), { status: 500, headers: corsHeaders });
    }

    // Update email_sent status (skip for signature requests to not confuse with regular sends)
    if (type !== "delivery_note_signature_request") {
      await serviceClient
        .from(tableName)
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq("id", documentId);
    }

    return new Response(
      JSON.stringify({ success: true, email_sent: true, recipient: recipientEmail }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("resend-protocol-email error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
