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

// ----- Standort-Konfiguration (Single Source of Truth) -----
type LocationKey = "krefeld" | "bonn";

interface LocationConfig {
  name: string;
  address: string;
  phoneDisplay: string;
  phoneTel: string;
  hours: string; // mehrzeilig mit \n
  managerName: string;
}

const LOCATIONS: Record<LocationKey, LocationConfig> = {
  krefeld: {
    name: "SLT Rental Krefeld",
    address: "Anrather Straße 291, 47807 Krefeld",
    phoneDisplay: "+49 2151 417 9904",
    phoneTel: "+4921514179904",
    hours: "Mo.–Fr. 08:00–18:00 Uhr\nSa. 10:00–14:30 Uhr (nach vorheriger Buchung)\nSo. geschlossen",
    managerName: "Benedikt Nöchel",
  },
  bonn: {
    name: "SLT Rental Bonn",
    address: "Drachenburgstraße 8, 53179 Bonn",
    phoneDisplay: "+49 228 504 660 61",
    phoneTel: "+4922850466061",
    hours: "Mo.–Fr. 07:00–18:00 Uhr\nSa. 08:00–17:30 Uhr\nSo. geschlossen",
    managerName: "Ihr SLT-Team Bonn",
  },
};

// PLZ-Mapping: Bonn/Köln/südliches NRW (50–56) -> Bonn, Rest -> Krefeld
function resolveLocation(postalCode?: string): LocationKey {
  if (!postalCode) return "krefeld";
  const prefix = postalCode.trim().substring(0, 2);
  const bonnPrefixes = new Set(["50", "51", "52", "53", "54", "55", "56"]);
  return bonnPrefixes.has(prefix) ? "bonn" : "krefeld";
}

const BodySchema = z.object({
  email: z.string().trim().email().max(255),
  firstName: z.string().trim().min(1).max(100),
  companyName: z.string().trim().min(1).max(200),
  postalCode: z.string().trim().max(10).optional(),
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
    const { email, firstName, companyName, postalCode } = parsed.data;
    const resendDomain = Deno.env.get("RESEND_DOMAIN") || "slt-rental.de";

    const loc = LOCATIONS[resolveLocation(postalCode)];

    const e = {
      firstName: escapeHtml(firstName),
      companyName: escapeHtml(companyName),
      locName: escapeHtml(loc.name),
      locAddress: escapeHtml(loc.address),
      locPhoneDisplay: escapeHtml(loc.phoneDisplay),
      locPhoneTel: escapeHtml(loc.phoneTel),
      locHoursHtml: escapeHtml(loc.hours).replace(/\n/g, "<br>"),
      managerName: escapeHtml(loc.managerName),
    };

    const subject = `Willkommen bei SLT Rental, ${firstName}!`;

    // Tabellenbasiertes, Outlook-/Gmail-kompatibles Layout
    const htmlBody = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:24px 32px;background:#ffffff;border-bottom:3px solid #ff8e02;">
            <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-rental-logo.png" alt="SLT Rental" height="48" style="display:block;height:48px;border:0;outline:none;text-decoration:none;">
          </td>
        </tr>
        <tr>
          <td style="padding:32px;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
            <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#00507d;">Willkommen bei SLT Rental, ${e.firstName}!</h1>

            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333;">
              Hallo ${e.firstName},
            </p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333;">
              vielen Dank für deine Registrierung im B2B-Portal mit <strong>${e.companyName}</strong>. Schön, dass du dabei bist!
            </p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333;">
              Wir haben deine Unterlagen (Handelsregisterauszug/Gewerbeschein und SEPA-Mandat) erhalten und prüfen sie aktuell manuell.
              In der Regel ist dein Konto innerhalb von <strong>1–2 Werktagen</strong> freigeschaltet.
            </p>

            <h2 style="margin:28px 0 12px;font-size:16px;color:#00507d;border-bottom:2px solid #ff8e02;padding-bottom:6px;">So geht es weiter</h2>
            <ol style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.7;color:#333;">
              <li>Unser Team prüft deine Unterlagen.</li>
              <li>Sobald dein Konto freigeschaltet ist, erhältst du eine separate E-Mail mit deinem persönlichen Kreditrahmen.</li>
              <li>Danach kannst du dich jederzeit im B2B-Portal einloggen und Maschinen, Anhänger &amp; Fahrzeuge bequem auf Rechnung mieten.</li>
            </ol>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto;">
              <tr><td align="center" bgcolor="#ff8e02" style="border-radius:6px;">
                <a href="https://www.slt-rental.de/b2b/dashboard"
                   style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;">
                  Zum B2B-Dashboard
                </a>
              </td></tr>
            </table>

            <p style="margin:24px 0 12px;font-size:14px;line-height:1.6;color:#333;">
              Du hast Fragen oder möchtest direkt etwas reservieren? Antworte einfach auf diese E-Mail oder ruf uns an deinem zuständigen Standort an:
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;background:#f9fafb;border-left:3px solid #00507d;">
              <tr><td style="padding:16px 18px;font-size:14px;line-height:1.6;color:#1a1a1a;">
                <strong>${e.locName}</strong><br>
                ${e.locAddress}<br>
                Tel.: <a href="tel:${e.locPhoneTel}" style="color:#00507d;text-decoration:underline;">${e.locPhoneDisplay}</a><br>
                <span style="display:inline-block;margin-top:8px;"><strong>Öffnungszeiten:</strong><br>${e.locHoursHtml}</span>
              </td></tr>
            </table>

            <p style="margin:24px 0 4px;font-size:14px;line-height:1.6;color:#333;">Viele Grüße</p>
            <p style="margin:0;font-size:14px;line-height:1.5;color:#1a1a1a;">
              <strong>${e.managerName}</strong><br>
              ${e.locName} – SLT Rental
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f9f9f9;text-align:center;font-size:12px;line-height:1.5;color:#999;">
            SLT Technology Group GmbH &amp; Co. KG · Anrather Straße 291 · 47807 Krefeld<br>
            <a href="https://www.slt-rental.de" style="color:#999;text-decoration:underline;">www.slt-rental.de</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const textBody =
      `Willkommen bei SLT Rental, ${firstName}!\n\n` +
      `Hallo ${firstName},\n\n` +
      `vielen Dank für deine Registrierung im B2B-Portal mit ${companyName}. Schön, dass du dabei bist!\n\n` +
      `Wir haben deine Unterlagen (Handelsregisterauszug/Gewerbeschein und SEPA-Mandat) erhalten und prüfen sie aktuell manuell. ` +
      `In der Regel ist dein Konto innerhalb von 1–2 Werktagen freigeschaltet.\n\n` +
      `So geht es weiter:\n` +
      `1. Unser Team prüft deine Unterlagen.\n` +
      `2. Sobald dein Konto freigeschaltet ist, erhältst du eine separate E-Mail mit deinem persönlichen Kreditrahmen.\n` +
      `3. Danach kannst du dich jederzeit im B2B-Portal einloggen und Maschinen, Anhänger & Fahrzeuge bequem auf Rechnung mieten.\n\n` +
      `Zum B2B-Dashboard: https://www.slt-rental.de/b2b/dashboard\n\n` +
      `Du hast Fragen oder möchtest direkt etwas reservieren? Antworte einfach auf diese E-Mail oder ruf uns an deinem zuständigen Standort an:\n\n` +
      `${loc.name}\n${loc.address}\nTel.: ${loc.phoneDisplay}\nÖffnungszeiten:\n${loc.hours}\n\n` +
      `Viele Grüße\n${loc.managerName}\n${loc.name} – SLT Rental\n\n` +
      `--\nSLT Technology Group GmbH & Co. KG · Anrather Straße 291 · 47807 Krefeld\nwww.slt-rental.de`;

    const emailPayload = {
      from: `SLT Rental <noreply@${resendDomain}>`,
      to: [email],
      reply_to: "b2b@slt-rental.de",
      subject,
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

    return new Response(JSON.stringify({ success: true, id: resendData?.id, location: loc.name }), {
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
