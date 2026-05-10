import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLT_LOGO = "https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png";
const COMPANY_NAME = "SLT Technology Group GmbH & Co. KG";

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
      street,
      postalCode,
      city,
      startDate,
      startTime,
      endDate,
      endTime,
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

    const timeRange = (startTime || endTime)
      ? `${startTime ? `Abholung: ${startTime} Uhr` : ""}${startTime && endTime ? " · " : ""}${endTime ? `Rückgabe: ${endTime} Uhr` : ""}`
      : null;

    const customerAddress = (street || postalCode || city)
      ? `${street || ""}${street ? ", " : ""}${postalCode || ""} ${city || ""}`.trim()
      : null;

    const e = {
      productName: escapeHtml(productName),
      locationName: escapeHtml(locationName),
      name: escapeHtml(name),
      email: escapeHtml(email),
      phone: escapeHtml(phone || "nicht angegeben"),
      message: escapeHtml(message),
      customerAddress: escapeHtml(customerAddress),
      dateRange: escapeHtml(dateRange),
      timeRange: escapeHtml(timeRange),
      deliveryStreet: escapeHtml(deliveryStreet),
      deliveryPostalCode: escapeHtml(deliveryPostalCode),
      deliveryCity: escapeHtml(deliveryCity),
      locEmail: escapeHtml(locationEmail || "mieten@slt-rental.de"),
      locPhone: escapeHtml(locationPhone || "02151 417 99 04"),
      locAddress: escapeHtml(locationAddress || "Anrather Straße 291, 47807 Krefeld"),
    };

    const deliveryHtml = deliveryRequested
      ? `
      <tr><td style="padding: 4px 0; color: #6b7280;">Lieferung:</td><td style="padding: 4px 0; font-weight: 500; color: #16a34a;">✓ Ja, gewünscht</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">Lieferadresse:</td><td style="padding: 4px 0;">${e.deliveryStreet}<br>${e.deliveryPostalCode} ${e.deliveryCity}</td></tr>`
      : `<tr><td style="padding: 4px 0; color: #6b7280;">Lieferung:</td><td style="padding: 4px 0;">Selbstabholung</td></tr>`;

    const setupServiceHtml = setupServiceRequested
      ? `<tr><td style="padding: 4px 0; color: #6b7280;">Betreuung / Auf- & Abbau:</td><td style="padding: 4px 0; font-weight: 500; color: #16a34a;">✓ Ja, gewünscht</td></tr>`
      : '';

    // Raw values still needed for non-HTML contexts (mail headers, telephone link)
    const locEmail = locationEmail || "mieten@slt-rental.de";
    const locPhone = locationPhone || "02151 417 99 04";

    const footerHtml = `
    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px; line-height: 1.6;">
      ${COMPANY_NAME}<br>
      Standort ${e.locationName}: ${e.locAddress}<br>
      Tel: ${e.locPhone} · E-Mail: <a href="mailto:${e.locEmail}" style="color: #f97316;">${e.locEmail}</a><br>
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
      <strong style="color: #ea580c;">Artikel:</strong> ${e.productName}<br>
      <strong style="color: #ea580c;">Standort:</strong> ${e.locationName}
    </div>
    <h3 style="color: #374151;">Kontaktdaten</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 4px 0; color: #6b7280; width: 100px;">Name:</td><td style="padding: 4px 0; font-weight: 500;">${e.name}</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">E-Mail:</td><td style="padding: 4px 0;"><a href="mailto:${e.email}" style="color: #f97316;">${e.email}</a></td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">Telefon:</td><td style="padding: 4px 0;">${e.phone}</td></tr>
      ${customerAddress ? `<tr><td style="padding: 4px 0; color: #6b7280;">Adresse:</td><td style="padding: 4px 0;">${e.customerAddress}</td></tr>` : ""}
      <tr><td style="padding: 4px 0; color: #6b7280;">Zeitraum:</td><td style="padding: 4px 0;">${e.dateRange}</td></tr>
      ${timeRange ? `<tr><td style="padding: 4px 0; color: #6b7280;">Uhrzeiten:</td><td style="padding: 4px 0;">${e.timeRange}</td></tr>` : ""}
      ${deliveryHtml}
      ${setupServiceHtml}
    </table>
    ${message ? `<h3 style="color: #374151;">Nachricht</h3><p style="color: #374151; white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 6px;">${e.message}</p>` : ""}
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
      Hallo ${e.name},<br><br>
      wir haben Ihre Mietanfrage erhalten und werden uns schnellstmöglich bei Ihnen melden – in der Regel innerhalb eines Werktages.
    </p>
    <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
      <strong style="color: #ea580c;">Artikel:</strong> ${e.productName}<br>
      <strong style="color: #ea580c;">Standort:</strong> ${e.locationName}<br>
      <strong style="color: #ea580c;">Zeitraum:</strong> ${e.dateRange}
      ${timeRange ? `<br><strong style="color: #ea580c;">Uhrzeiten:</strong> ${e.timeRange}` : ""}
      ${deliveryRequested ? `<br><strong style="color: #ea580c;">Lieferung an:</strong> ${e.deliveryStreet}, ${e.deliveryPostalCode} ${e.deliveryCity}` : ""}
      ${setupServiceRequested ? `<br><strong style="color: #ea580c;">Betreuung / Auf- & Abbau:</strong> Gewünscht` : ""}
    </div>
    <p style="color: #374151; line-height: 1.6;">
      Falls Sie in der Zwischenzeit Fragen haben, erreichen Sie uns unter <a href="tel:${escapeHtml(locPhone.replace(/\s/g, ''))}" style="color: #f97316;">${e.locPhone}</a> oder per E-Mail an <a href="mailto:${e.locEmail}" style="color: #f97316;">${e.locEmail}</a>.
    </p>
    <p style="color: #374151;">
      Mit freundlichen Grüßen,<br>
      <strong>Ihr SLT Rental Team – Standort ${e.locationName}</strong>
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
