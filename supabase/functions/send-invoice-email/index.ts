import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: authUser }, error: authError } = await userClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Check admin role
    const { data: roleData } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", authUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return new Response(JSON.stringify({ error: "invoice_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch invoice
    const { data: invoice, error: invError } = await serviceClient
      .from("b2b_invoices")
      .select("*")
      .eq("id", invoice_id)
      .single();

    if (invError || !invoice) {
      return new Response(JSON.stringify({ error: "Invoice not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch profile
    const { data: profile } = await serviceClient
      .from("b2b_profiles")
      .select("*")
      .eq("id", invoice.b2b_profile_id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "B2B profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch invoice items for the email body
    const { data: items } = await serviceClient
      .from("b2b_invoice_items")
      .select("*")
      .eq("invoice_id", invoice_id);

    const recipientEmail = profile.billing_email || profile.contact_email;
    const recipientName = `${profile.contact_first_name} ${profile.contact_last_name}`;
    const companyName = profile.company_name;

    // Build items list HTML
    const itemsList = (items || []).map((item: any) =>
      `<li style="padding:4px 0;font-size:14px;">${item.quantity}x ${escapeHtml(item.product_name)}${item.description ? ` – ${escapeHtml(item.description)}` : ""} · ${Number(item.total_price).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</li>`
    ).join("");

    const isProforma = invoice.notes?.includes("PROFORMA") || invoice.notes?.includes("Vorkasse");
    const docLabel = isProforma ? "Proforma-Rechnung" : "Rechnung";
    const invoiceNumber = invoice.invoice_number;
    const grossFormatted = Number(invoice.gross_amount).toLocaleString("de-DE", { style: "currency", currency: "EUR" });

    const emailSubject = `Ihre ${docLabel} ${invoiceNumber} – SLT-Rental`;
    const emailHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:25px 40px;text-align:center;border-bottom:3px solid #00507d;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:70px;width:auto;" />
    </div>
    <div style="background:#00507d;padding:14px 40px;text-align:center;">
      <p style="color:#ffffff;margin:0;font-size:15px;font-weight:600;">Ihre ${escapeHtml(docLabel)}</p>
    </div>
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;">Guten Tag ${escapeHtml(recipientName)},</p>
      <p style="font-size:14px;color:#555;line-height:1.6;">anbei erhalten Sie Ihre ${escapeHtml(docLabel)} <strong>${escapeHtml(invoiceNumber)}</strong> über einen Gesamtbetrag von <strong>${grossFormatted}</strong> (brutto).</p>
      ${itemsList ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="font-size:13px;font-weight:600;margin:0 0 8px;color:#333;">Positionen:</p>
        <ul style="margin:0;padding-left:20px;color:#555;">${itemsList}</ul>
      </div>` : ""}
      ${isProforma ? `<div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="font-size:13px;font-weight:600;margin:0 0 4px;color:#92400e;">Hinweis zur Vorkasse</p>
        <p style="font-size:13px;color:#92400e;margin:0;line-height:1.5;">Bitte überweisen Sie den Rechnungsbetrag vor Mietbeginn auf das in der Rechnung angegebene Bankkonto. Die Mietgeräte werden nach Zahlungseingang bereitgestellt.</p>
      </div>` : `<p style="font-size:14px;color:#555;line-height:1.6;">Bitte beachten Sie das Zahlungsziel gemäß den vereinbarten Konditionen.</p>`}
      ${invoice.due_date ? `<p style="font-size:14px;color:#555;line-height:1.6;">Fälligkeitsdatum: <strong>${new Date(invoice.due_date).toLocaleDateString("de-DE")}</strong></p>` : ""}
      <p style="font-size:14px;color:#555;line-height:1.6;">Die vollständige Rechnung finden Sie als PDF im Anhang sowie in Ihrem B2B-Portal.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://www.slt-rental.de/b2b/rechnungen" style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:14px;font-weight:600;">Zum B2B-Portal →</a>
      </div>
    </div>
    <div style="background:#f1f5f9;padding:25px 40px;border-top:1px solid #e2e8f0;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600;">SLT Technology Group GmbH & Co. KG</p>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">Anrather Straße 291 · 47807 Krefeld</p>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">Tel: +49 2151 417 99 02 · E-Mail: mieten@slt-rental.de</p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">www.slt-rental.de</p>
    </div>
  </div>
</body></html>`;

    // Fetch PDF attachment if available
    const attachments: { filename: string; content: string }[] = [];
    if (invoice.file_url) {
      try {
        let pdfBytes: Uint8Array | null = null;

        // Try downloading directly from the b2b-invoices bucket using the file path
        const pathAfterBucket = invoice.file_url.includes("b2b-invoices/")
          ? invoice.file_url.split("b2b-invoices/").pop()?.split("?")[0]
          : null;

        if (pathAfterBucket) {
          const decodedPath = decodeURIComponent(pathAfterBucket);
          console.info(`Downloading PDF from bucket path: ${decodedPath}`);
          const { data: fileData, error: fileError } = await serviceClient.storage
            .from("b2b-invoices")
            .download(decodedPath);
          if (!fileError && fileData) {
            pdfBytes = new Uint8Array(await fileData.arrayBuffer());
            console.info(`PDF downloaded: ${pdfBytes.length} bytes`);
          } else {
            console.error("Direct download failed:", fileError?.message);
            // Fallback: create a signed URL and fetch
            const { data: signedData } = await serviceClient.storage
              .from("b2b-invoices")
              .createSignedUrl(decodedPath, 120);
            if (signedData?.signedUrl) {
              const resp = await fetch(signedData.signedUrl);
              if (resp.ok) {
                pdfBytes = new Uint8Array(await resp.arrayBuffer());
                console.info(`PDF downloaded via signed URL: ${pdfBytes.length} bytes`);
              }
            }
          }
        }

        if (pdfBytes && pdfBytes.length > 0) {
          const attachFilename = invoice.file_name || `${invoiceNumber}.pdf`;
          attachments.push({
            filename: attachFilename.endsWith(".pdf") ? attachFilename : attachFilename.replace(/\.html$/, ".pdf"),
            content: encodeBase64(pdfBytes),
          });
          console.info(`PDF attached: ${attachments[0].filename}`);
        } else {
          console.error("Could not download PDF for attachment");
        }
      } catch (e) {
        console.error("Failed to attach PDF:", e);
      }
    }

    // CC recipients: debitoren@slt-tg.de + krefeld@slt-rental.de
    const ccRecipients = ["debitoren@slt-tg.de", "krefeld@slt-rental.de"];

    const emailPayload: any = {
      from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
      to: [recipientEmail],
      cc: ccRecipients,
      subject: emailSubject,
      html: emailHtml,
    };

    if (attachments.length > 0) {
      emailPayload.attachments = attachments;
    }

    console.info(`Sending invoice email for ${invoiceNumber} to ${recipientEmail}, CC: ${ccRecipients.join(", ")}`);

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
      return new Response(JSON.stringify({ error: "Email sending failed", details: errBody }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update email_sent status
    await serviceClient
      .from("b2b_invoices")
      .update({ email_sent: true, email_sent_at: new Date().toISOString() })
      .eq("id", invoice_id);

    console.info(`Invoice email sent successfully for ${invoiceNumber}`);

    return new Response(
      JSON.stringify({
        success: true,
        email_sent: true,
        recipient: recipientEmail,
        cc: ccRecipients,
        invoice_number: invoiceNumber,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("send-invoice-email error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
