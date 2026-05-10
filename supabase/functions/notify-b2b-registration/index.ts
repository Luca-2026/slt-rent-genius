import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://esm.sh/zod@3.23.8";

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

const optionalShortStr = z.string().trim().max(200).optional().nullable();

const BodySchema = z.object({
  companyName: z.string().trim().min(1).max(200),
  legalForm: optionalShortStr,
  contactName: z.string().trim().min(1).max(200),
  contactEmail: z.string().trim().email().max(255),
  contactPhone: z.string().trim().min(1).max(50),
  contactPosition: optionalShortStr,
  billingEmail: z.string().trim().email().max(255).optional().nullable().or(z.literal("")),
  street: z.string().trim().min(1).max(200),
  houseNumber: optionalShortStr,
  city: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().min(3).max(15),
  assignedLocation: optionalShortStr,
  taxId: optionalShortStr,
  tradeRegisterNumber: optionalShortStr,
  postalInvoice: z.boolean().optional(),
  documentBase64: z.string().max(MAX_DOCUMENT_BYTES * 2).optional().nullable(),
  documentFilename: z.string().trim().max(255).optional().nullable(),
});

// Magic-byte sniffing for allowed attachment types
function detectAttachmentType(b64: string): "pdf" | "jpg" | "png" | null {
  try {
    // Decode just the first ~16 bytes for the signature check
    const head = atob(b64.slice(0, 32));
    const bytes = new Uint8Array(head.length);
    for (let i = 0; i < head.length; i++) bytes[i] = head.charCodeAt(i);
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return "pdf"; // %PDF
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- AuthN: require Bearer token, identify caller ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !anonKey) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Validate body ---
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const data = parsed.data;

    // --- AuthZ: caller's email must match the submitted contact email ---
    const callerEmail = (userData.user.email || "").trim().toLowerCase();
    if (!callerEmail || callerEmail !== data.contactEmail.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Validate optional attachment ---
    let safeAttachment: { filename: string; content: string } | null = null;
    if (data.documentBase64 && data.documentFilename) {
      // Approx decoded size from base64 length
      const approxSize = Math.floor((data.documentBase64.length * 3) / 4);
      if (approxSize > MAX_DOCUMENT_BYTES) {
        return new Response(JSON.stringify({ error: "Attachment too large" }), {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const kind = detectAttachmentType(data.documentBase64);
      if (!kind) {
        return new Response(JSON.stringify({ error: "Unsupported attachment type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const ext = data.documentFilename.split(".").pop()?.toLowerCase();
      const allowedExt = kind === "jpg" ? ["jpg", "jpeg"] : [kind];
      if (!ext || !allowedExt.includes(ext)) {
        return new Response(JSON.stringify({ error: "Filename does not match content type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Sanitize filename: strip path separators and control chars
      const safeName = data.documentFilename.replace(/[\\/\x00-\x1f]/g, "_").slice(0, 120);
      safeAttachment = { filename: safeName, content: data.documentBase64 };
    }

    // --- Build email (everything escaped) ---
    const resendDomain = Deno.env.get("RESEND_DOMAIN") || "slt-rental.de";

    const locationDisplay = data.assignedLocation
      ? data.assignedLocation.charAt(0).toUpperCase() + data.assignedLocation.slice(1)
      : "Nicht zugewiesen";

    const companyDisplayRaw = data.legalForm
      ? `${data.companyName} ${data.legalForm}`
      : data.companyName;

    const addressRaw = data.houseNumber
      ? `${data.street} ${data.houseNumber}, ${data.postalCode} ${data.city}`
      : `${data.street}, ${data.postalCode} ${data.city}`;

    const e = {
      company: escapeHtml(companyDisplayRaw),
      taxId: escapeHtml(data.taxId),
      trade: escapeHtml(data.tradeRegisterNumber),
      contactName: escapeHtml(data.contactName),
      contactPosition: escapeHtml(data.contactPosition),
      contactEmail: escapeHtml(data.contactEmail),
      contactPhone: escapeHtml(data.contactPhone),
      billingEmail: escapeHtml(data.billingEmail),
      address: escapeHtml(addressRaw),
      location: escapeHtml(locationDisplay),
      docName: safeAttachment ? escapeHtml(safeAttachment.filename) : "",
    };

    const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:24px 32px;text-align:center;border-bottom:3px solid #f97316;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-rental-logo.png" alt="SLT Rental" style="height:48px;" />
    </div>
    <div style="padding:32px;">
      <h1 style="color:#1a1a1a;font-size:20px;margin:0 0 16px;">Neue B2B-Registrierung</h1>
      <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Ein neues Unternehmen hat sich im B2B-Portal registriert und wartet auf Freigabe.
      </p>

      <h2 style="color:#1a1a1a;font-size:16px;margin:24px 0 12px;border-bottom:2px solid #f97316;padding-bottom:6px;">Unternehmensdaten</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;width:160px;">Firma</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;font-weight:600;">${e.company}</td>
        </tr>
        ${e.taxId ? `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">USt-IdNr.</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.taxId}</td>
        </tr>` : ""}
        ${e.trade ? `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Handelsregister-Nr.</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.trade}</td>
        </tr>` : ""}
      </table>

      <h2 style="color:#1a1a1a;font-size:16px;margin:24px 0 12px;border-bottom:2px solid #f97316;padding-bottom:6px;">Ansprechpartner</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;width:160px;">Name</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.contactName}</td>
        </tr>
        ${e.contactPosition ? `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Position</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.contactPosition}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">E-Mail</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.contactEmail}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Telefon</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.contactPhone}</td>
        </tr>
        ${e.billingEmail ? `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Rechnungs-E-Mail</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.billingEmail}</td>
        </tr>` : ""}
      </table>

      <h2 style="color:#1a1a1a;font-size:16px;margin:24px 0 12px;border-bottom:2px solid #f97316;padding-bottom:6px;">Adresse & Standort</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;width:160px;">Adresse</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.address}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Zugewiesener Standort</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${e.location}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Post-Rechnung</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${data.postalInvoice ? "Ja (+2,50€)" : "Nein"}</td>
        </tr>
      </table>

      ${safeAttachment ? `
      <div style="margin-top:24px;padding:16px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;">
        <p style="margin:0;color:#0369a1;font-size:14px;font-weight:600;">Dokument im Anhang: ${e.docName}</p>
      </div>
      ` : ""}

      <div style="margin-top:28px;text-align:center;">
        <p style="color:#555;font-size:13px;">Bitte prüfe die Registrierung im Admin-Dashboard und gib das Konto frei.</p>
      </div>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;text-align:center;font-size:12px;color:#999;">
      SLT Technology Group GmbH & Co. KG · Anrather Straße 291 · 47807 Krefeld
    </div>
  </div>
</body>
</html>`;

    const emailPayload: Record<string, unknown> = {
      from: `SLT-Rental <noreply@${resendDomain}>`,
      to: [B2B_NOTIFY_EMAIL],
      subject: `Neue B2B-Registrierung: ${companyDisplayRaw} (${data.city})`.slice(0, 200),
      html: htmlBody,
    };

    if (safeAttachment) {
      emailPayload.attachments = [safeAttachment];
    }

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
      console.error("Resend API error:", emailRes.status, errBody);
      return new Response(
        JSON.stringify({ error: "Email sending failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`B2B registration notification sent for user ${userData.user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("notify-b2b-registration error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
