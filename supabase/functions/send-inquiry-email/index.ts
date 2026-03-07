import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLT_LOGO = "https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png";
const COMPANY_NAME = "SLT Technology Group GmbH & Co. KG";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      productName,
      locationName,
      locationEmail,
      locationPhone,
      locationAddress,
      name,
      email,
      phone,
      startDate,
      endDate,
      message,
      deliveryRequested,
      deliveryStreet,
      deliveryPostalCode,
      deliveryCity,
      setupServiceRequested,
    } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const dateRange = startDate
      ? `${startDate}${endDate ? ` bis ${endDate}` : ""}`
      : "Kein Datum angegeben";

    const deliveryHtml = deliveryRequested
      ? `
      <tr><td style="padding: 4px 0; color: #6b7280;">Lieferung:</td><td style="padding: 4px 0; font-weight: 500; color: #16a34a;">✓ Ja, gewünscht</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">Lieferadresse:</td><td style="padding: 4px 0;">${deliveryStreet}<br>${deliveryPostalCode} ${deliveryCity}</td></tr>`
      : `<tr><td style="padding: 4px 0; color: #6b7280;">Lieferung:</td><td style="padding: 4px 0;">Selbstabholung</td></tr>`;

    const setupServiceHtml = setupServiceRequested
      ? `<tr><td style="padding: 4px 0; color: #6b7280;">Betreuung / Auf- & Abbau:</td><td style="padding: 4px 0; font-weight: 500; color: #16a34a;">✓ Ja, gewünscht</td></tr>`
      : '';

    const locEmail = locationEmail || "mieten@slt-rental.de";
    const locPhone = locationPhone || "02151 417 99 04";
    const locAddress = locationAddress || "Anrather Straße 291, 47807 Krefeld";

    const footerHtml = `
    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px; line-height: 1.6;">
      ${COMPANY_NAME}<br>
      Standort ${locationName}: ${locAddress}<br>
      Tel: ${locPhone} · E-Mail: <a href="mailto:${locEmail}" style="color: #f97316;">${locEmail}</a><br>
      <a href="https://www.slt-rental.de" style="color: #f97316;">www.slt-rental.de</a>
    </p>`;

    // ── Internal notification email ──
    const internalHtml = `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="background: #ffffff; padding: 20px; text-align: center; border-bottom: 3px solid #f97316;">
    <img src="${SLT_LOGO}" alt="SLT Rental" style="height: 50px; max-width: 200px;" />
  </div>
  <div style="padding: 24px;">
    <h2 style="color: #1a1a1a; margin-top: 0;">Neue Mietanfrage</h2>
    <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
      <strong style="color: #ea580c;">Artikel:</strong> ${productName}<br>
      <strong style="color: #ea580c;">Standort:</strong> ${locationName}
    </div>
    <h3 style="color: #374151;">Kontaktdaten</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 4px 0; color: #6b7280; width: 100px;">Name:</td><td style="padding: 4px 0; font-weight: 500;">${name}</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">E-Mail:</td><td style="padding: 4px 0;"><a href="mailto:${email}" style="color: #f97316;">${email}</a></td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">Telefon:</td><td style="padding: 4px 0;">${phone || "nicht angegeben"}</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">Zeitraum:</td><td style="padding: 4px 0;">${dateRange}</td></tr>
      ${deliveryHtml}
      ${setupServiceHtml}
    </table>
    ${message ? `<h3 style="color: #374151;">Nachricht</h3><p style="color: #374151; white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 6px;">${message}</p>` : ""}
    ${footerHtml}
  </div>
</div>`.trim();

    // ── Customer confirmation email ──
    const confirmationHtml = `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="background: #ffffff; padding: 20px; text-align: center; border-bottom: 3px solid #f97316;">
    <img src="${SLT_LOGO}" alt="SLT Rental" style="height: 50px; max-width: 200px;" />
  </div>
  <div style="padding: 24px;">
    <h2 style="color: #1a1a1a; margin-top: 0;">Vielen Dank für Ihre Anfrage!</h2>
    <p style="color: #374151; line-height: 1.6;">
      Hallo ${name},<br><br>
      wir haben Ihre Mietanfrage erhalten und werden uns schnellstmöglich bei Ihnen melden – in der Regel innerhalb eines Werktages.
    </p>
    <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
      <strong style="color: #ea580c;">Artikel:</strong> ${productName}<br>
      <strong style="color: #ea580c;">Standort:</strong> ${locationName}<br>
      <strong style="color: #ea580c;">Zeitraum:</strong> ${dateRange}
      ${deliveryRequested ? `<br><strong style="color: #ea580c;">Lieferung an:</strong> ${deliveryStreet}, ${deliveryPostalCode} ${deliveryCity}` : ""}
    </div>
    <p style="color: #374151; line-height: 1.6;">
      Falls Sie in der Zwischenzeit Fragen haben, erreichen Sie uns unter <a href="tel:${locPhone.replace(/\s/g, '')}" style="color: #f97316;">${locPhone}</a> oder per E-Mail an <a href="mailto:${locEmail}" style="color: #f97316;">${locEmail}</a>.
    </p>
    <p style="color: #374151;">
      Mit freundlichen Grüßen,<br>
      <strong>Ihr SLT Rental Team – Standort ${locationName}</strong>
    </p>
    ${footerHtml}
  </div>
</div>`.trim();

    if (RESEND_API_KEY) {
      // Send internal notification
      const res1 = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Anfragen <anfragen@slt-rental.de>",
          to: [locEmail],
          reply_to: email,
          subject: `Mietanfrage: ${productName} – ${locationName}`,
          html: internalHtml,
        }),
      });
      if (!res1.ok) console.error("Resend internal error:", await res1.text());

      // Send customer confirmation
      const res2 = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "SLT Rental <anfragen@slt-rental.de>",
          to: [email],
          subject: `Ihre Mietanfrage: ${productName} – Bestätigung`,
          html: confirmationHtml,
        }),
      });
      if (!res2.ok) console.error("Resend confirmation error:", await res2.text());
    } else {
      console.log("=== INQUIRY (no RESEND_API_KEY) ===");
      console.log({ productName, locationName, name, email });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    console.error("send-inquiry-email error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
