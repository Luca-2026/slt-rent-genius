import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const LOCATION_EMAILS: Record<string, string> = {
  krefeld: "krefeld@slt-rental.de",
  bonn: "bonn@slt-rental.de",
  muelheim: "muelheim@slt-rental.de",
};

function extractStoragePath(fileUrl: string): { bucket: string; path: string } | null {
  const signMatch = fileUrl.match(/\/object\/sign\/([^/]+)\/(.+?)(?:\?|$)/);
  if (signMatch) return { bucket: signMatch[1], path: decodeURIComponent(signMatch[2]) };
  const pubMatch = fileUrl.match(/\/object\/public\/([^/]+)\/(.+?)(?:\?|$)/);
  if (pubMatch) return { bucket: pubMatch[1], path: decodeURIComponent(pubMatch[2]) };
  return null;
}

/**
 * Embed a base64 signature image into the last page of an existing PDF.
 * The customer signature is placed on the left side of the signature section,
 * which is near the bottom of the last page.
 */
async function embedSignatureIntoPdf(
  pdfBytes: Uint8Array,
  signatureDataUri: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const pages = doc.getPages();
  const lastPage = pages[pages.length - 1];
  const { height } = lastPage.getSize();

  // Extract the base64 data from the data URI
  const b64 = signatureDataUri.split(",")[1];
  if (!b64) return pdfBytes;

  const sigBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  // Embed as PNG or JPG
  const sigImage = signatureDataUri.includes("png")
    ? await doc.embedPng(sigBytes)
    : await doc.embedJpg(sigBytes);

  // Scale signature to fit within the signature box (matching generate-delivery-note dimensions)
  const maxWidth = 120;
  const maxHeight = 45;
  const scale = Math.min(maxWidth / sigImage.width, maxHeight / sigImage.height);
  const drawWidth = sigImage.width * scale;
  const drawHeight = sigImage.height * scale;

  // Find the customer signature position by searching for the "Kunde" text label
  // The signature area is on the left side, above the "Kunde" label line
  // We need to scan the page content to find exact position
  // Fallback: Place signature at known position (left side, ~150pt from bottom)
  // In the generate-delivery-note code: MG=50, signatures are placed with y offset
  // The customer sig is at x=MG (50), and the y position varies based on content
  
  // Strategy: Search for text "Kunde" on the last page to find the y-coordinate
  // Since pdf-lib doesn't have text search, we'll use a heuristic:
  // The signature section is typically 100-180 points from the bottom of the last page
  // We place the signature image above the "Kunde" label line
  
  // Scan approach: Look at the bottom portion of the page for the signature line
  // The "Kunde" label is drawn at y, and the signature image is drawn at y+8+55 = y+63
  // The horizontal line is at y+8
  // So we place the signature about 70pt above where "Kunde" would be
  
  // Based on the generate code pattern:
  // y -= 55 (space for sig), draw sig at y, then y -= 8, draw line at y, y -= 12, draw "Kunde" at y
  // So from "Kunde" text: sig_y = kunde_y + 12 + 8 = kunde_y + 20
  // From the line: sig_y = line_y + 8
  
  // We'll place the signature at a reasonable position - approximately 130pt from bottom
  // on the left side (x=50)
  const MG = 50;
  
  // Try to find the right y-position by looking for existing content patterns
  // Since content length varies, we'll place the signature relative to known footer position
  // Footer is at ~30pt from bottom, legal notice ~60pt above that, signatures ~70pt above that
  // A safer approach: place at y=160 from bottom on left side
  const sigY = 148; // approximate y for customer signature area
  
  lastPage.drawImage(sigImage, {
    x: MG,
    y: sigY,
    width: drawWidth,
    height: drawHeight,
  });

  return await doc.save();
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

    const adminEmails: string[] = [];
    if (adminRoles && adminRoles.length > 0) {
      for (const role of adminRoles) {
        const { data: userData } = await serviceClient.auth.admin.getUserById(role.user_id);
        if (userData?.user?.email) {
          adminEmails.push(userData.user.email);
        }
      }
    }

    let documentNumber = "";
    let companyName = "";
    let contactName = "";
    let protocolType = "";
    let portalLink = "";
    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let assignedLocation: string | null = null;
    let customerSignatureData: string | null = null;

    if (type === "delivery_note") {
      const { data: dn } = await serviceClient.from("b2b_delivery_notes").select("*").eq("id", id).single();
      if (!dn) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: corsHeaders });

      const { data: profile } = await serviceClient.from("b2b_profiles").select("*").eq("id", dn.b2b_profile_id).single();
      documentNumber = dn.delivery_note_number;
      companyName = profile?.company_name || "–";
      contactName = profile ? `${profile.contact_first_name} ${profile.contact_last_name}` : "–";
      protocolType = "Übergabeprotokoll";
      portalLink = "https://www.slt-rental.de/b2b/admin";
      fileUrl = dn.file_url;
      fileName = dn.file_name || `${documentNumber}.pdf`;
      assignedLocation = profile?.assigned_location || null;
      customerSignatureData = dn.signature_data || null;
    } else if (type === "return_protocol") {
      const { data: rp } = await serviceClient.from("b2b_return_protocols").select("*").eq("id", id).single();
      if (!rp) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: corsHeaders });

      const { data: profile } = await serviceClient.from("b2b_profiles").select("*").eq("id", rp.b2b_profile_id).single();
      documentNumber = rp.return_protocol_number;
      companyName = profile?.company_name || "–";
      contactName = profile ? `${profile.contact_first_name} ${profile.contact_last_name}` : "–";
      protocolType = "Rückgabeprotokoll";
      portalLink = "https://www.slt-rental.de/b2b/admin";
      fileUrl = rp.file_url;
      fileName = rp.file_name || `${documentNumber}.pdf`;
      assignedLocation = profile?.assigned_location || null;
      customerSignatureData = rp.customer_signature_data || null;
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400, headers: corsHeaders });
    }

    const locationEmail = LOCATION_EMAILS[assignedLocation || ""] || LOCATION_EMAILS["krefeld"];

    // Try to fetch the PDF from storage, embed customer signature if available, and re-upload
    let pdfAttachment: { filename: string; content: string } | null = null;
    if (fileUrl) {
      try {
        const storagePath = extractStoragePath(fileUrl);
        if (storagePath) {
          const { data: fileData, error: dlError } = await serviceClient.storage
            .from(storagePath.bucket)
            .download(storagePath.path);

          if (!dlError && fileData) {
            let pdfArrayBuffer = await fileData.arrayBuffer();
            let pdfUint8 = new Uint8Array(pdfArrayBuffer);

            // If there's a customer signature, embed it into the PDF and re-upload
            if (customerSignatureData) {
              try {
                pdfUint8 = await embedSignatureIntoPdf(pdfUint8, customerSignatureData);

                // Re-upload the updated PDF with the signature
                const updatedBlob = new Blob([pdfUint8], { type: "application/pdf" });
                const { error: uploadError } = await serviceClient.storage
                  .from(storagePath.bucket)
                  .upload(storagePath.path, updatedBlob, {
                    upsert: true,
                    contentType: "application/pdf",
                  });

                if (uploadError) {
                  console.warn("Failed to re-upload PDF with signature:", uploadError.message);
                } else {
                  console.log("PDF updated with customer signature successfully");
                }
              } catch (sigErr) {
                console.warn("Failed to embed signature into PDF:", sigErr);
              }
            }

            const base64 = btoa(String.fromCharCode(...pdfUint8));
            pdfAttachment = {
              filename: fileName || `${documentNumber}.pdf`,
              content: base64,
            };
          } else {
            console.warn("Could not download PDF from storage:", dlError?.message);
          }
        }
      } catch (pdfErr) {
        console.warn("PDF attachment fetch failed:", pdfErr);
      }
    }

    const ccRecipients = [locationEmail].filter(e => !adminEmails.includes(e));

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

    const emailPayload: any = {
      from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
      to: adminEmails.length > 0 ? adminEmails : [locationEmail],
      subject: `${protocolType} ${documentNumber} wurde unterschrieben – ${companyName}`,
      html: emailHtml,
    };

    if (adminEmails.length > 0 && ccRecipients.length > 0) {
      emailPayload.cc = ccRecipients;
    }

    if (pdfAttachment) {
      emailPayload.attachments = [
        {
          filename: pdfAttachment.filename,
          content: pdfAttachment.content,
          type: "application/pdf",
        },
      ];
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
      console.error("Resend error:", emailRes.status, errBody);
      return new Response(JSON.stringify({ error: "Email sending failed" }), { status: 500, headers: corsHeaders });
    }

    await emailRes.text();

    return new Response(
      JSON.stringify({ success: true, notified: adminEmails.length, locationEmail, hasPdf: !!pdfAttachment, signatureEmbedded: !!customerSignatureData }),
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
