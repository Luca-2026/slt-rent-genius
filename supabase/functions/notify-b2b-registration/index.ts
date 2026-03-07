const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const B2B_NOTIFY_EMAIL = "b2b@slt-rental.de";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      companyName,
      legalForm,
      contactName,
      contactEmail,
      contactPhone,
      contactPosition,
      billingEmail,
      street,
      houseNumber,
      city,
      postalCode,
      assignedLocation,
      taxId,
      tradeRegisterNumber,
      postalInvoice,
      documentBase64,
      documentFilename,
    } = await req.json();

    const resendDomain = Deno.env.get("RESEND_DOMAIN") || "slt-rental.de";

    const locationDisplay = assignedLocation
      ? assignedLocation.charAt(0).toUpperCase() + assignedLocation.slice(1)
      : "Nicht zugewiesen";

    const companyDisplay = legalForm
      ? `${companyName} ${legalForm}`
      : companyName;

    const address = houseNumber
      ? `${street} ${houseNumber}, ${postalCode} ${city}`
      : `${street}, ${postalCode} ${city}`;

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
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;font-weight:600;">${companyDisplay}</td>
        </tr>
        ${taxId ? `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">USt-IdNr.</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${taxId}</td>
        </tr>` : ""}
        ${tradeRegisterNumber ? `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Handelsregister-Nr.</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${tradeRegisterNumber}</td>
        </tr>` : ""}
      </table>

      <h2 style="color:#1a1a1a;font-size:16px;margin:24px 0 12px;border-bottom:2px solid #f97316;padding-bottom:6px;">Ansprechpartner</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;width:160px;">Name</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${contactName}</td>
        </tr>
        ${contactPosition ? `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Position</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${contactPosition}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">E-Mail</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${contactEmail}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Telefon</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${contactPhone}</td>
        </tr>
        ${billingEmail ? `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Rechnungs-E-Mail</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${billingEmail}</td>
        </tr>` : ""}
      </table>

      <h2 style="color:#1a1a1a;font-size:16px;margin:24px 0 12px;border-bottom:2px solid #f97316;padding-bottom:6px;">Adresse & Standort</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;width:160px;">Adresse</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${address}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Zugewiesener Standort</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${locationDisplay}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;">Post-Rechnung</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1a1a1a;">${postalInvoice ? "Ja (+2,50€)" : "Nein"}</td>
        </tr>
      </table>

      ${documentFilename ? `
      <div style="margin-top:24px;padding:16px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;">
        <p style="margin:0;color:#0369a1;font-size:14px;font-weight:600;">📎 Dokument im Anhang: ${documentFilename}</p>
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

    // Build email payload with optional attachment
    const emailPayload: Record<string, unknown> = {
      from: `SLT-Rental <noreply@${resendDomain}>`,
      to: [B2B_NOTIFY_EMAIL],
      subject: `Neue B2B-Registrierung: ${companyDisplay} (${city})`,
      html: htmlBody,
    };

    if (documentBase64 && documentFilename) {
      emailPayload.attachments = [
        {
          filename: documentFilename,
          content: documentBase64,
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
      console.error("Resend API error:", emailRes.status, errBody);
      return new Response(
        JSON.stringify({ error: "Email sending failed", details: errBody }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`B2B registration notification sent to ${B2B_NOTIFY_EMAIL} for ${companyDisplay}`);

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("notify-b2b-registration error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
