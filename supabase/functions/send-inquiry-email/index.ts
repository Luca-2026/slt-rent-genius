import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      productName,
      locationName,
      locationEmail,
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
    } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const dateRange = startDate
      ? `${startDate}${endDate ? ` bis ${endDate}` : ""}`
      : "Kein Datum angegeben";

    const deliveryText = deliveryRequested
      ? `\nLieferung gewünscht:\n- Straße: ${deliveryStreet}\n- PLZ / Ort: ${deliveryPostalCode} ${deliveryCity}`
      : "\nLieferung: Nein (Selbstabholung)";

    const emailBody = `
Neue Mietanfrage über die Website

Artikel: ${productName}
Standort: ${locationName}

Kontaktdaten:
- Name: ${name}
- E-Mail: ${email}
- Telefon: ${phone || "nicht angegeben"}

Zeitraum: ${dateRange}
${deliveryText}

Nachricht:
${message || "keine weiteren Angaben"}

---
Diese Anfrage wurde über das Kontaktformular auf slt-rental.de gesendet.
    `.trim();

    const deliveryHtml = deliveryRequested
      ? `
      <tr><td style="padding: 4px 0; color: #6b7280;">Lieferung:</td><td style="padding: 4px 0; font-weight: 500; color: #16a34a;">✓ Ja, gewünscht</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">Lieferadresse:</td><td style="padding: 4px 0;">${deliveryStreet}<br>${deliveryPostalCode} ${deliveryCity}</td></tr>`
      : `<tr><td style="padding: 4px 0; color: #6b7280;">Lieferung:</td><td style="padding: 4px 0;">Selbstabholung</td></tr>`;

    const htmlBody = `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="background: #ffffff; padding: 20px; text-align: center; border-bottom: 3px solid #f97316;">
    <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT Rental" style="height: 50px; max-width: 200px;" />
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
    </table>

    ${message ? `<h3 style="color: #374151;">Nachricht</h3><p style="color: #374151; white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 6px;">${message}</p>` : ""}

    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
      Diese Anfrage wurde über slt-rental.de gesendet.
    </p>
  </div>
</div>
    `.trim();

    if (RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Anfragen <anfragen@slt-rental.de>",
          to: [locationEmail || "mieten@slt-rental.de"],
          reply_to: email,
          subject: `Mietanfrage: ${productName} – ${locationName}`,
          text: emailBody,
          html: htmlBody,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Resend error:", errBody);
      }
    } else {
      console.log("=== INQUIRY (no RESEND_API_KEY set) ===");
      console.log(emailBody);
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
