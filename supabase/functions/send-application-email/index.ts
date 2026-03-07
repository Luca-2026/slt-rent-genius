import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLT_LOGO = "https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png";
const COMPANY_NAME = "SLT Technology Group GmbH & Co. KG";
const HQ_ADDRESS = "Anrather Straße 291, 47807 Krefeld";
const HQ_PHONE = "02151 417 99 04";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      jobTitle, firstName, lastName, email, phone,
      street, postalCode, city,
      earliestStartDate, salaryExpectation, motivation,
      resumeFilename, coverLetterFilename,
    } = await req.json();

    if (!jobTitle || !firstName || !lastName || !email) {
      return new Response(
        JSON.stringify({ error: "Pflichtfelder fehlen" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const address = [street, postalCode, city].filter(Boolean).join(", ") || "nicht angegeben";

    const footerHtml = `
    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px; line-height: 1.6;">
      ${COMPANY_NAME}<br>
      ${HQ_ADDRESS}<br>
      Tel: ${HQ_PHONE} · E-Mail: <a href="mailto:karriere@slt-rental.de" style="color: #f97316;">karriere@slt-rental.de</a><br>
      <a href="https://www.slt-rental.de" style="color: #f97316;">www.slt-rental.de</a>
    </p>`;

    // ── Internal notification email ──
    const internalHtml = `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="background: #ffffff; padding: 20px; text-align: center; border-bottom: 3px solid #f97316;">
    <img src="${SLT_LOGO}" alt="SLT Rental" style="height: 50px; max-width: 200px;" />
  </div>
  <div style="padding: 24px;">
    <h2 style="color: #1a1a1a; margin-top: 0;">Neue Bewerbung eingegangen</h2>
    <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
      <strong style="color: #ea580c;">Stelle:</strong> ${jobTitle}
    </div>
    <h3 style="color: #374151;">Persönliche Daten</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 4px 0; color: #6b7280; width: 140px;">Name:</td><td style="padding: 4px 0; font-weight: 500;">${firstName} ${lastName}</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">E-Mail:</td><td style="padding: 4px 0;"><a href="mailto:${email}" style="color: #f97316;">${email}</a></td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">Telefon:</td><td style="padding: 4px 0;">${phone || "nicht angegeben"}</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">Adresse:</td><td style="padding: 4px 0;">${address}</td></tr>
      ${earliestStartDate ? `<tr><td style="padding: 4px 0; color: #6b7280;">Frühester Eintritt:</td><td style="padding: 4px 0;">${earliestStartDate}</td></tr>` : ""}
      ${salaryExpectation ? `<tr><td style="padding: 4px 0; color: #6b7280;">Gehaltsvorstellung:</td><td style="padding: 4px 0;">${salaryExpectation}</td></tr>` : ""}
    </table>
    ${motivation ? `<h3 style="color: #374151;">Motivation</h3><p style="color: #374151; white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 6px;">${motivation}</p>` : ""}
    <h3 style="color: #374151;">Unterlagen</h3>
    <ul style="color: #374151;">
      <li>Lebenslauf: ${resumeFilename || "nicht hochgeladen"}</li>
      ${coverLetterFilename ? `<li>Anschreiben: ${coverLetterFilename}</li>` : ""}
    </ul>
    <p style="color: #6b7280; font-size: 13px; margin-top: 16px;">
      📌 Die vollständigen Bewerbungsunterlagen können im Admin-Bereich unter <strong>Karriere → Bewerbungen</strong> eingesehen und heruntergeladen werden.
    </p>
    ${footerHtml}
  </div>
</div>`.trim();

    // ── Applicant confirmation email ──
    const confirmationHtml = `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="background: #ffffff; padding: 20px; text-align: center; border-bottom: 3px solid #f97316;">
    <img src="${SLT_LOGO}" alt="SLT Rental" style="height: 50px; max-width: 200px;" />
  </div>
  <div style="padding: 24px;">
    <h2 style="color: #1a1a1a; margin-top: 0;">Vielen Dank für Ihre Bewerbung!</h2>
    <p style="color: #374151; line-height: 1.6;">
      Hallo ${firstName},<br><br>
      wir haben Ihre Bewerbung als <strong>${jobTitle}</strong> erhalten und freuen uns über Ihr Interesse an SLT Rental.
    </p>
    <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
      <strong style="color: #ea580c;">Nächste Schritte:</strong><br>
      Unser Team wird Ihre Unterlagen sorgfältig prüfen. Wir melden uns in der Regel innerhalb von 5–10 Werktagen bei Ihnen.
    </div>
    <p style="color: #374151; line-height: 1.6;">
      Falls Sie in der Zwischenzeit Fragen haben, erreichen Sie uns unter <a href="tel:${HQ_PHONE.replace(/\s/g, '')}" style="color: #f97316;">${HQ_PHONE}</a> oder per E-Mail an <a href="mailto:karriere@slt-rental.de" style="color: #f97316;">karriere@slt-rental.de</a>.
    </p>
    <p style="color: #374151;">
      Mit freundlichen Grüßen,<br>
      <strong>Ihr SLT Rental Team</strong>
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
          from: "Karriere <karriere@slt-rental.de>",
          to: ["karriere@slt-rental.de"],
          reply_to: email,
          subject: `Neue Bewerbung: ${jobTitle} – ${firstName} ${lastName}`,
          html: internalHtml,
        }),
      });
      if (!res1.ok) console.error("Resend internal error:", await res1.text());

      // Send applicant confirmation
      const res2 = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "SLT Rental Karriere <karriere@slt-rental.de>",
          to: [email],
          subject: `Ihre Bewerbung bei SLT Rental – ${jobTitle}`,
          html: confirmationHtml,
        }),
      });
      if (!res2.ok) console.error("Resend confirmation error:", await res2.text());
    } else {
      console.log("=== APPLICATION (no RESEND_API_KEY) ===");
      console.log({ jobTitle, firstName, lastName, email });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    console.error("send-application-email error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
