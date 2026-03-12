import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SLT_COMPANY = {
  name: "SLT Technology Group GmbH & Co. KG",
  brand: "SLT-Rental",
  street: "Anrather Straße 291",
  city: "47807 Krefeld",
  phone: "+49 2151 417 99 02",
  fax: "+49 2151 417 99 04",
  mobil: "+49 1578 915 08 72",
  email: "mieten@slt-rental.de",
  web: "www.slt-rental.de",
  facebook: "www.facebook.com/slt-rental",
  registry: "Registergericht Krefeld HRA7075",
  managingDirector: "Benedikt Nöchel",
  steuerNr: "117/5717/1398",
  ustId: "DE340481717",
  bankName: "Sparkasse Krefeld",
  iban: "DE65 3205 0000 0000 4784 46",
  bic: "SPKRDE33XXX",
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

// ─── PDF Generator (matching generate-delivery-note format) ─────────
async function generateDocumentPdf(data: {
  title: string;
  documentNumber: string;
  date: string;
  profile: any;
  items: Array<{ name: string; description?: string; quantity: number }>;
  sections: Array<{ label: string; value: string }>;
  signatures?: { customerData?: string; staffData?: string; staffName?: string };
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const W = 595.28, H = 841.89, MG = 50, CW = W - 2 * MG;
  let page = doc.addPage([W, H]);
  let y = H - MG;

  const checkPage = (need: number) => { if (y - need < MG + 40) { page = doc.addPage([W, H]); y = H - MG; } };
  const dt = (t: string, x: number, yy: number, f = font, s = 10, c = rgb(0.2, 0.2, 0.2)) => {
    try { page.drawText(t || '', { x, y: yy, size: s, font: f, color: c }); } catch {}
  };
  const wt = (t: string, f: any, s: number, mw: number): string[] => {
    if (!t) return [''];
    const words = t.split(' '); const lines: string[] = []; let cur = '';
    for (const w of words) { const test = cur ? `${cur} ${w}` : w; if (f.widthOfTextAtSize(test, s) <= mw) cur = test; else { if (cur) lines.push(cur); cur = w; } }
    if (cur) lines.push(cur); return lines.length ? lines : [''];
  };
  const fd = (d: string) => { const p = d.split('-'); return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d; };

  // Logo
  try {
    const lr = await fetch("https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png");
    const lb = new Uint8Array(await lr.arrayBuffer()); const li = await doc.embedPng(lb);
    const ls = 45 / li.height; page.drawImage(li, { x: MG, y: y - 45, width: li.width * ls, height: 45 });
  } catch {}

  [SLT_COMPANY.name, `${SLT_COMPANY.street}, ${SLT_COMPANY.city}`].forEach((l, i) => {
    const tw = font.widthOfTextAtSize(l, 7); dt(l, W - MG - tw, y - 10 - i * 10, font, 7, rgb(0.5, 0.5, 0.5));
  });
  y -= 60;
  page.drawRectangle({ x: MG, y, width: CW, height: 2, color: rgb(0, 0.314, 0.49) });
  y -= 30;
  dt(data.title, MG, y, bold, 18, rgb(0, 0.314, 0.49)); y -= 22;
  dt(data.documentNumber, MG, y, bold, 11);
  const ds = `Datum: ${fd(data.date)}`; dt(ds, W - MG - font.widthOfTextAtSize(ds, 10), y, font, 10); y -= 30;

  dt("Kunde:", MG, y, bold, 9, rgb(0.5, 0.5, 0.5)); y -= 14;
  dt(data.profile.company_name, MG, y, bold, 10); y -= 14;
  dt(`${data.profile.contact_first_name} ${data.profile.contact_last_name}`, MG, y, font, 10); y -= 14;
  dt(`${data.profile.street}${data.profile.house_number ? ' ' + data.profile.house_number : ''}`, MG, y, font, 10); y -= 14;
  dt(`${data.profile.postal_code} ${data.profile.city}`, MG, y, font, 10);
  if (data.profile.tax_id) { y -= 14; dt(`USt-IdNr.: ${data.profile.tax_id}`, MG, y, font, 9, rgb(0.4, 0.4, 0.4)); }
  y -= 25;

  // Items table
  page.drawRectangle({ x: MG, y: y + 5, width: CW, height: 18, color: rgb(0.96, 0.97, 0.98) });
  dt("Pos.", MG + 4, y + 8, bold, 8); dt("Bezeichnung", MG + 30, y + 8, bold, 8);
  dt("Menge", MG + CW * 0.8, y + 8, bold, 8);
  y -= 5; page.drawRectangle({ x: MG, y, width: CW, height: 0.5, color: rgb(0.8, 0.8, 0.8) }); y -= 14;

  data.items.forEach((item, i) => {
    checkPage(30); dt(`${i + 1}`, MG + 4, y, font, 9);
    let desc = item.name; if (item.description) desc += ` - ${item.description}`;
    const maxNW = CW * 0.72; const nl = wt(desc, font, 9, maxNW);
    nl.forEach((line, li) => {
      dt(line, MG + 30, y, font, 9);
      if (li === 0) { dt(`${item.quantity}`, MG + CW * 0.82, y, font, 9); }
      y -= 13;
    }); y -= 3;
    page.drawRectangle({ x: MG, y: y + 10, width: CW, height: 0.3, color: rgb(0.92, 0.92, 0.92) });
  });
  y -= 10;

  // Sections
  for (const sec of data.sections) {
    checkPage(30); dt(sec.label + ":", MG, y, bold, 9); y -= 14;
    const lines = wt(sec.value, font, 9, CW);
    for (const line of lines) { checkPage(15); dt(line, MG, y, font, 9); y -= 13; }
    y -= 8;
  }

  // Signatures
  if (data.signatures) {
    checkPage(90); y -= 10;
    page.drawRectangle({ x: MG, y: y + 5, width: CW, height: 0.5, color: rgb(0.8, 0.8, 0.8) }); y -= 55;
    for (const [sigData, xOff] of [[data.signatures.customerData, 0], [data.signatures.staffData, CW / 2 + 10]] as [string | undefined, number][]) {
      if (sigData) { try {
        const b64 = sigData.split(',')[1]; const sb = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const si = sigData.includes('png') ? await doc.embedPng(sb) : await doc.embedJpg(sb);
        const sc = Math.min(120 / si.width, 45 / si.height);
        page.drawImage(si, { x: MG + xOff, y, width: si.width * sc, height: si.height * sc });
      } catch {} }
    }
    y -= 8;
    page.drawRectangle({ x: MG, y, width: CW / 2 - 15, height: 0.5, color: rgb(0.6, 0.6, 0.6) });
    page.drawRectangle({ x: MG + CW / 2 + 10, y, width: CW / 2 - 10, height: 0.5, color: rgb(0.6, 0.6, 0.6) });
    y -= 12; dt("Kunde", MG, y, font, 8, rgb(0.5, 0.5, 0.5));
    dt(`Mitarbeiter: ${data.signatures.staffName || ''}`, MG + CW / 2 + 10, y, font, 8, rgb(0.5, 0.5, 0.5));
  }

  // Footer on all pages
  const footerLines = [
    `${SLT_COMPANY.name} - GF: ${SLT_COMPANY.managingDirector} - Tel: ${SLT_COMPANY.phone} - FAX: ${SLT_COMPANY.fax} - Mobil: ${SLT_COMPANY.mobil}`,
    `${SLT_COMPANY.street} - ${SLT_COMPANY.city} - Steuer-Nr. ${SLT_COMPANY.steuerNr} - USt-ID ${SLT_COMPANY.ustId} - ${SLT_COMPANY.registry}`,
    `${SLT_COMPANY.bankName} - IBAN: ${SLT_COMPANY.iban} - BIC: ${SLT_COMPANY.bic} - Kontoinhaber: ${SLT_COMPANY.name}`,
    `${SLT_COMPANY.web} - ${SLT_COMPANY.email} - ${SLT_COMPANY.facebook}`,
  ];
  for (let i = 0; i < doc.getPageCount(); i++) {
    const p = doc.getPage(i);
    p.drawRectangle({ x: MG, y: MG + 20, width: CW, height: 0.5, color: rgb(0, 0.314, 0.49) });
    footerLines.forEach((line, li) => {
      try {
        const tw = font.widthOfTextAtSize(line, 5.5);
        p.drawText(line, { x: (W - tw) / 2, y: MG + 14 - li * 7, size: 5.5, font, color: rgb(0.5, 0.5, 0.5) });
      } catch {}
    });
  }

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
    let regeneratedPdfBytes: Uint8Array | null = null;

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

      // Regenerate PDF with customer signature if we have staff signature data
      if (dn.signature_data && dn.staff_signature_data && profile) {
        try {
          // Fetch offer items for the PDF
          const { data: offerItems } = dn.offer_id
            ? await serviceClient.from("b2b_offer_items").select("*").eq("offer_id", dn.offer_id)
            : { data: [] };

          // Fetch delivery note items as fallback
          const { data: dnItems } = await serviceClient
            .from("b2b_delivery_note_items")
            .select("*")
            .eq("delivery_note_id", dn.id);

          const items = (offerItems && offerItems.length > 0 ? offerItems : dnItems || []).map((item: any) => ({
            name: item.product_name,
            description: item.description || undefined,
            quantity: item.quantity,
          }));

          // Fetch offer for additional info
          let offerNumber = "";
          if (dn.offer_id) {
            const { data: offer } = await serviceClient.from("b2b_offers").select("offer_number, notes").eq("id", dn.offer_id).single();
            if (offer) offerNumber = offer.offer_number;
          }

          const dateStr = dn.created_at ? dn.created_at.split("T")[0] : new Date().toISOString().split("T")[0];

          regeneratedPdfBytes = await generateDocumentPdf({
            title: "UEBERGABEPROTOKOLL",
            documentNumber: dn.delivery_note_number,
            date: dateStr,
            profile,
            items,
            sections: [
              ...(offerNumber ? [{ label: "Angebot", value: offerNumber }] : []),
              ...(dn.known_defects ? [{ label: "Bekannte Maengel bei Uebergabe", value: dn.known_defects }] : []),
              ...(dn.additional_defects ? [{ label: "Zusaetzliche Maengel", value: dn.additional_defects }] : []),
              ...(dn.notes ? [{ label: "Bemerkungen", value: dn.notes }] : []),
              ...(dn.agb_accepted ? [{ label: "AGB", value: "Wurden akzeptiert" }] : []),
            ],
            signatures: {
              customerData: dn.signature_data,
              staffData: dn.staff_signature_data,
              staffName: dn.staff_name || "",
            },
          });

          // Upload the regenerated PDF to replace the old one
          if (fileUrl) {
            const storagePath = extractStoragePath(fileUrl);
            if (storagePath) {
              const updatedBlob = new Blob([regeneratedPdfBytes], { type: "application/pdf" });
              const pdfFileName = storagePath.path.replace(/\.html$/, ".pdf").replace(/-blanko/, "-signed");
              
              const { error: uploadError } = await serviceClient.storage
                .from(storagePath.bucket)
                .upload(pdfFileName, updatedBlob, { upsert: true, contentType: "application/pdf" });

              if (!uploadError) {
                // Get new signed URL for the uploaded PDF
                const { data: signedUrlData } = await serviceClient.storage
                  .from(storagePath.bucket)
                  .createSignedUrl(pdfFileName, 60 * 60 * 24 * 365);

                const newFileUrl = signedUrlData?.signedUrl || fileUrl;
                const newFileName = pdfFileName.split("/").pop() || fileName;

                // Update delivery note with new file URL
                await serviceClient
                  .from("b2b_delivery_notes")
                  .update({ file_url: newFileUrl, file_name: newFileName })
                  .eq("id", id);

                console.log("PDF regenerated with customer signature and re-uploaded");
              } else {
                console.warn("Failed to upload regenerated PDF:", uploadError.message);
              }
            }
          }
        } catch (regenErr) {
          console.warn("Failed to regenerate PDF with signature:", regenErr);
        }
      }
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
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400, headers: corsHeaders });
    }

    const locationEmail = LOCATION_EMAILS[assignedLocation || ""] || LOCATION_EMAILS["krefeld"];

    // Build PDF attachment: use regenerated PDF if available, otherwise fetch from storage
    let pdfAttachment: { filename: string; content: string } | null = null;

    if (regeneratedPdfBytes) {
      const base64 = encodeBase64(regeneratedPdfBytes);
      pdfAttachment = {
        filename: fileName || `${documentNumber}.pdf`,
        content: base64,
      };
    } else if (fileUrl) {
      try {
        const storagePath = extractStoragePath(fileUrl);
        if (storagePath) {
          const { data: fileData, error: dlError } = await serviceClient.storage
            .from(storagePath.bucket)
            .download(storagePath.path);

          if (!dlError && fileData) {
            const arrayBuffer = await fileData.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            pdfAttachment = {
              filename: fileName || `${documentNumber}.pdf`,
              content: base64,
            };
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
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600;">SLT Technology Group GmbH & Co. KG</p>
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
      JSON.stringify({
        success: true,
        notified: adminEmails.length,
        locationEmail,
        hasPdf: !!pdfAttachment,
        pdfRegenerated: !!regeneratedPdfBytes,
      }),
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
