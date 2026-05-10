import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const B2B_NOTIFY_EMAIL = "b2b@slt-rental.de";
const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024; // 8 MB

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function detectAttachmentType(b64: string): "pdf" | "jpg" | "png" | null {
  try {
    const head = atob(b64.slice(0, 32));
    const bytes = new Uint8Array(head.length);
    for (let i = 0; i < head.length; i++) bytes[i] = head.charCodeAt(i);
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return "pdf";
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
    if (
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
    ) return "png";
    return null;
  } catch {
    return null;
  }
}

async function sendAdminNotification(params: {
  companyName: string;
  legalForm?: string | null;
  taxId?: string | null;
  tradeRegisterNumber?: string | null;
  contactName: string;
  contactPosition?: string | null;
  contactEmail: string;
  contactPhone: string;
  billingEmail?: string | null;
  street: string;
  houseNumber?: string | null;
  postalCode: string;
  city: string;
  assignedLocation?: string | null;
  postalInvoice?: boolean;
  attachment: { filename: string; content: string } | null;
}): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured – skipping admin email");
    return;
  }
  const resendDomain = Deno.env.get("RESEND_DOMAIN") || "slt-rental.de";

  const locationDisplay = params.assignedLocation
    ? params.assignedLocation.charAt(0).toUpperCase() + params.assignedLocation.slice(1)
    : "Nicht zugewiesen";

  const companyDisplayRaw = params.legalForm
    ? `${params.companyName} ${params.legalForm}`
    : params.companyName;

  const addressRaw = params.houseNumber
    ? `${params.street} ${params.houseNumber}, ${params.postalCode} ${params.city}`
    : `${params.street}, ${params.postalCode} ${params.city}`;

  const e = {
    company: escapeHtml(companyDisplayRaw),
    taxId: escapeHtml(params.taxId),
    trade: escapeHtml(params.tradeRegisterNumber),
    contactName: escapeHtml(params.contactName),
    contactPosition: escapeHtml(params.contactPosition),
    contactEmail: escapeHtml(params.contactEmail),
    contactPhone: escapeHtml(params.contactPhone),
    billingEmail: escapeHtml(params.billingEmail),
    address: escapeHtml(addressRaw),
    location: escapeHtml(locationDisplay),
    docName: params.attachment ? escapeHtml(params.attachment.filename) : "",
  };

  const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:24px 32px;text-align:center;border-bottom:3px solid #f97316;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-rental-logo.png" alt="SLT Rental" style="height:48px;" />
    </div>
    <div style="padding:32px;">
      <h1 style="color:#1a1a1a;font-size:20px;margin:0 0 16px;">Neue B2B-Registrierung</h1>
      <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;">Ein neues Unternehmen hat sich im B2B-Portal registriert und wartet auf Freigabe.</p>
      <h2 style="color:#1a1a1a;font-size:16px;margin:24px 0 12px;border-bottom:2px solid #f97316;padding-bottom:6px;">Unternehmensdaten</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;width:160px;">Firma</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;font-weight:600;">${e.company}</td></tr>
        ${e.taxId ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">USt-IdNr.</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.taxId}</td></tr>` : ""}
        ${e.trade ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Handelsregister-Nr.</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.trade}</td></tr>` : ""}
      </table>
      <h2 style="color:#1a1a1a;font-size:16px;margin:24px 0 12px;border-bottom:2px solid #f97316;padding-bottom:6px;">Ansprechpartner</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;width:160px;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.contactName}</td></tr>
        ${e.contactPosition ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Position</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.contactPosition}</td></tr>` : ""}
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">E-Mail</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.contactEmail}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Telefon</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.contactPhone}</td></tr>
        ${e.billingEmail ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Rechnungs-E-Mail</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.billingEmail}</td></tr>` : ""}
      </table>
      <h2 style="color:#1a1a1a;font-size:16px;margin:24px 0 12px;border-bottom:2px solid #f97316;padding-bottom:6px;">Adresse & Standort</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;width:160px;">Adresse</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.address}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Zugewiesener Standort</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.location}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Post-Rechnung</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${params.postalInvoice ? "Ja (+2,50€)" : "Nein"}</td></tr>
      </table>
      ${params.attachment ? `<div style="margin-top:24px;padding:16px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;"><p style="margin:0;color:#0369a1;font-size:14px;font-weight:600;">Dokument im Anhang: ${e.docName}</p></div>` : ""}
      <div style="margin-top:28px;text-align:center;"><p style="color:#555;font-size:13px;">Bitte prüfe die Registrierung im Admin-Dashboard und gib das Konto frei.</p></div>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;text-align:center;font-size:12px;color:#999;">SLT Technology Group GmbH & Co. KG · Anrather Straße 291 · 47807 Krefeld</div>
  </div>
</body></html>`;

  const emailPayload: Record<string, unknown> = {
    from: `SLT-Rental <noreply@${resendDomain}>`,
    to: [B2B_NOTIFY_EMAIL],
    subject: `Neue B2B-Registrierung: ${companyDisplayRaw} (${params.city})`.slice(0, 200),
    html: htmlBody,
  };
  if (params.attachment) emailPayload.attachments = [params.attachment];

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(emailPayload),
  });
  if (!res.ok) {
    const errBody = await res.text();
    console.error("Resend API error:", res.status, errBody);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userId,
      companyName,
      legalForm,
      taxId,
      tradeRegisterNumber,
      firstName,
      lastName,
      position,
      phone,
      email,
      billingEmail,
      street,
      houseNumber,
      postalCode,
      city,
      assignedLocation,
      postalInvoice,
      documentBase64,
      documentFilename,
    } = await req.json();

    if (!userId || !companyName || !firstName || !lastName || !phone || !email || !street || !postalCode || !city) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if profile already exists
    const { data: existing } = await serviceClient
      .from("b2b_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, profile_id: existing.id, already_exists: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate + upload document if provided
    let documentUrl: string | null = null;
    let safeAttachment: { filename: string; content: string } | null = null;
    let safeDocFilename: string | null = null;

    if (documentBase64 && documentFilename) {
      const approxSize = Math.floor((String(documentBase64).length * 3) / 4);
      if (approxSize > MAX_DOCUMENT_BYTES) {
        return new Response(JSON.stringify({ error: "Attachment too large" }), {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const kind = detectAttachmentType(documentBase64);
      if (!kind) {
        return new Response(JSON.stringify({ error: "Unsupported attachment type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const ext = String(documentFilename).split(".").pop()?.toLowerCase();
      const allowedExt = kind === "jpg" ? ["jpg", "jpeg"] : [kind];
      if (!ext || !allowedExt.includes(ext)) {
        return new Response(JSON.stringify({ error: "Filename does not match content type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      safeDocFilename = String(documentFilename).replace(/[\\/\x00-\x1f]/g, "_").slice(0, 120);

      const binaryStr = atob(documentBase64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

      const filePath = `${userId}/${Date.now()}.${ext}`;
      const contentType =
        kind === "pdf" ? "application/pdf" : kind === "png" ? "image/png" : "image/jpeg";

      const { error: uploadError } = await serviceClient.storage
        .from("b2b-documents")
        .upload(filePath, bytes, { contentType });

      if (!uploadError) {
        const { data: urlData } = serviceClient.storage.from("b2b-documents").getPublicUrl(filePath);
        documentUrl = urlData.publicUrl;
        safeAttachment = { filename: safeDocFilename, content: documentBase64 };
      } else {
        console.error("Document upload error:", uploadError);
      }
    }

    // Create b2b_profile
    const { data: profile, error: profileError } = await serviceClient
      .from("b2b_profiles")
      .insert({
        user_id: userId,
        company_name: companyName,
        legal_form: legalForm || null,
        tax_id: taxId || null,
        trade_register_number: tradeRegisterNumber || null,
        contact_first_name: firstName,
        contact_last_name: lastName,
        contact_position: position || null,
        contact_phone: phone,
        contact_email: email,
        billing_email: billingEmail || null,
        street,
        house_number: houseNumber || null,
        postal_code: postalCode,
        city,
        assigned_location: assignedLocation || null,
        postal_invoice: postalInvoice || false,
        document_url: documentUrl,
        document_filename: safeDocFilename,
        status: "pending",
        email_confirmed: false,
      })
      .select("id")
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`B2B profile created for ${companyName} (user: ${userId}, profile: ${profile.id})`);

    // Send admin notification (non-blocking on failure)
    try {
      await sendAdminNotification({
        companyName,
        legalForm,
        taxId,
        tradeRegisterNumber,
        contactName: `${firstName} ${lastName}`,
        contactPosition: position,
        contactEmail: email,
        contactPhone: phone,
        billingEmail,
        street,
        houseNumber,
        postalCode,
        city,
        assignedLocation,
        postalInvoice: !!postalInvoice,
        attachment: safeAttachment,
      });
    } catch (notifyErr) {
      console.error("Admin notification failed (non-blocking):", notifyErr);
    }

    return new Response(JSON.stringify({ success: true, profile_id: profile.id, notified: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("create-b2b-profile error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
