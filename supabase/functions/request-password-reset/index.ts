// Public "Passwort vergessen": creates the recovery link server-side and sends it
// directly via Resend, so self-service resets never depend on the provider mailer.
// Always answers with success to avoid revealing which addresses have an account.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PASSWORD_RESET_URL, recoveryLink } from "../_shared/auth-links.ts";
import { allowPublicRequest } from "../_shared/publicRateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailHtml(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Montserrat',Arial,sans-serif;background:#ffffff;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:24px 32px;text-align:center;border-bottom:3px solid #ff8e02;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-rental-logo.png" alt="SLT Rental" style="height:48px;" />
    </div>
    <div style="padding:32px;">
      <h1 style="color:#393d46;font-size:22px;font-weight:bold;margin:0 0 20px;">Passwort zurücksetzen</h1>
      <p style="color:#595959;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Für Ihr Konto im SLT Rental B2B-Portal wurde ein neues Passwort angefordert.
        Klicken Sie auf den folgenden Button, um ein neues Passwort festzulegen:
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">Neues Passwort festlegen</a>
      </div>
      <p style="color:#595959;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Der Link ist nur einmal und für begrenzte Zeit gültig. Ist er abgelaufen, fordern Sie über „Passwort vergessen" einfach einen neuen an. Es gilt immer nur der zuletzt angeforderte Link.
      </p>
      <p style="color:#999999;font-size:12px;margin:20px 0 0;">
        Falls Sie kein neues Passwort angefordert haben, können Sie diese E-Mail ignorieren. Ihr bisheriges Passwort bleibt gültig.
      </p>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;text-align:center;font-size:12px;color:#999999;">
      SLT Technology Group GmbH & Co. KG · Anrather Straße 291 · 47807 Krefeld
    </div>
  </div>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return json({ error: "Ungültige E-Mail-Adresse" }, 400);

  if (!(await allowPublicRequest(req, "password-reset", 10, 3600))) {
    return json({ error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }, 429);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return json({ error: "E-Mail-Versand nicht verfügbar" }, 500);
  }

  const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  const { data, error } = await service.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: PASSWORD_RESET_URL },
  });

  if (error || !data?.properties?.hashed_token) {
    // Unknown address or provider refusal: same answer to the visitor, details only in logs.
    console.log("Password reset not sent", { reason: error?.message ?? "no token" });
    return json({ success: true });
  }

  const resendDomain = Deno.env.get("RESEND_DOMAIN") || "slt-rental.de";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `SLT-Rental <noreply@${resendDomain}>`,
      to: [email],
      subject: "Passwort zurücksetzen – SLT Rental B2B-Portal",
      html: emailHtml(recoveryLink(data.properties)),
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`Resend error [${res.status}]: ${errBody}`);
    return json({ error: "E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut." }, 502);
  }

  console.log("Password reset email sent via Resend");
  return json({ success: true });
});
