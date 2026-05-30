import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const BodySchema = z.object({
  email: z.string().trim().email().max(255),
  firstName: z.string().trim().min(1).max(100),
  companyName: z.string().trim().min(1).max(200),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
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
    const { email, firstName, companyName } = parsed.data;
    const resendDomain = Deno.env.get("RESEND_DOMAIN") || "slt-rental.de";

    const e = {
      firstName: escapeHtml(firstName),
      companyName: escapeHtml(companyName),
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
      <h1 style="color:#1a1a1a;font-size:22px;margin:0 0 16px;">Willkommen bei SLT Rental, ${e.firstName}!</h1>

      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
        vielen Dank für deine Registrierung im B2B-Portal mit <strong>${e.companyName}</strong>. Schön, dass du dabei bist!
      </p>

      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Wir haben deine Unterlagen (Handelsregister/Gewerbeschein und SEPA-Mandat) erhalten und prüfen sie jetzt manuell.
        In der Regel ist dein Konto innerhalb von <strong>1–2 Werktagen</strong> freigeschaltet.
      </p>

      <h2 style="color:#1a1a1a;font-size:16px;margin:28px 0 12px;border-bottom:2px solid #f97316;padding-bottom:6px;">Wie es jetzt weitergeht</h2>
      <ol style="color:#333;font-size:14px;line-height:1.7;padding-left:20px;margin:0 0 24px;">
        <li>Unser Team prüft deine Unterlagen.</li>
        <li>Sobald freigeschaltet, bekommst du eine separate E-Mail mit deinem persönlichen Kreditrahmen.</li>
        <li>Du kannst dich dann jederzeit im B2B-Portal einloggen und Maschinen, Anhänger & Fahrzeuge auf Rechnung mieten.</li>
      </ol>

      <div style="margin:28px 0;text-align:center;">
        <a href="https://www.slt-rental.de/b2b/dashboard"
           style="display:inline-block;background:#ff8e02;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:15px;font-weight:600;">
          Zum B2B-Dashboard
        </a>
      </div>

      <p style="color:#555;font-size:14px;line-height:1.6;margin:24px 0 0;">
        Falls du Fragen hast oder direkt etwas reservieren möchtest, antworte einfach auf diese E-Mail
        oder ruf uns an: <strong>+49 2151 6244400</strong>.
      </p>

      <p style="color:#333;font-size:14px;line-height:1.6;margin:24px 0 0;">
        Beste Grüße<br>
        dein SLT-Rental-Team
      </p>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;text-align:center;font-size:12px;color:#999;">
      SLT Technology Group GmbH & Co. KG · Anrather Straße 291 · 47807 Krefeld<br>
      <a href="https://www.slt-rental.de" style="color:#999;text-decoration:underline;">www.slt-rental.de</a>
    </div>
  </div>
</body>
</html>`;

    const textBody =
      `Willkommen bei SLT Rental, ${firstName}!\n\n` +
      `Vielen Dank für deine Registrierung im B2B-Portal mit ${companyName}.\n\n` +
      `Wir haben deine Unterlagen (Handelsregister/Gewerbeschein und SEPA-Mandat) erhalten und prüfen sie jetzt manuell. ` +
      `In der Regel ist dein Konto innerhalb von 1–2 Werktagen freigeschaltet.\n\n` +
      `Sobald freigeschaltet, bekommst du eine separate E-Mail mit deinem persönlichen Kreditrahmen ` +
      `und kannst dich im B2B-Portal einloggen: https://www.slt-rental.de/b2b/dashboard\n\n` +
      `Fragen? Antworte einfach auf diese E-Mail oder ruf uns an: +49 2151 6244400\n\n` +
      `Beste Grüße\ndein SLT-Rental-Team`;

    const emailPayload = {
      from: `SLT Rental <noreply@${resendDomain}>`,
      to: [email],
      reply_to: "b2b@slt-rental.de",
      subject: "Willkommen bei SLT Rental – wir prüfen deine Registrierung",
      html: htmlBody,
      text: textBody,
    };

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const resendData = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      console.error("Resend error:", resendRes.status, resendData);
      return new Response(
        JSON.stringify({ error: "Email send failed", status: resendRes.status, details: resendData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true, id: resendData?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-b2b-welcome error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
