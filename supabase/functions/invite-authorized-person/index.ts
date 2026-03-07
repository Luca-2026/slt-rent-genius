import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Nicht autorisiert");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
    if (!caller) throw new Error("Nicht autorisiert");

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .single();
    if (!roleData) throw new Error("Nur Administratoren können Einladungen versenden");

    const { person_id, email, first_name, last_name, company_name, b2b_profile_id } = await req.json();

    if (!person_id || !email || !first_name || !last_name || !b2b_profile_id) {
      throw new Error("Fehlende Pflichtfelder");
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email.toLowerCase());

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user with a random password (they will set their own via reset link)
      const tempPassword = crypto.randomUUID() + "Aa1!";
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          first_name,
          last_name,
          is_authorized_person: true,
          company_name,
        },
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Link user_id to authorized person record
    const { error: updateError } = await supabaseAdmin
      .from("b2b_authorized_persons")
      .update({ user_id: userId, invited_at: new Date().toISOString() })
      .eq("id", person_id);
    if (updateError) throw updateError;

    // Send password reset email so the person can set their password
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email.toLowerCase(),
      options: {
        redirectTo: "https://www.slt-rental.de/",
      },
    });

    // Also send a branded welcome/invitation email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendDomain = Deno.env.get("RESEND_DOMAIN") || "slt-rental.de";

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      // Generate a proper recovery link
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: email.toLowerCase(),
        options: {
          redirectTo: "https://www.slt-rental.de/",
        },
      });

      const recoveryLink = linkData?.properties?.action_link || "https://www.slt-rental.de/";

      await resend.emails.send({
        from: `SLT Rental <noreply@${resendDomain}>`,
        to: email.toLowerCase(),
        subject: `Einladung zum SLT Rental B2B-Portal – ${company_name}`,
        html: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Montserrat',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
  <tr>
    <td style="padding:24px 32px;text-align:center;border-bottom:3px solid #ff8e02;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-rental-logo.png" alt="SLT Rental" height="48" />
    </td>
  </tr>
  <tr>
    <td style="padding:32px;">
      <h1 style="font-size:22px;font-weight:bold;color:#393d46;margin:0 0 20px;">
        Willkommen im SLT Rental B2B-Portal
      </h1>
      <p style="font-size:14px;color:#595959;line-height:1.6;margin:0 0 20px;">
        Hallo ${first_name},
      </p>
      <p style="font-size:14px;color:#595959;line-height:1.6;margin:0 0 20px;">
        Du wurdest als autorisierte Person für <strong>${company_name}</strong> im SLT Rental B2B-Portal hinterlegt. 
        Du kannst ab sofort Mietgeräte im Namen deines Unternehmens reservieren und abholen.
      </p>
      <p style="font-size:14px;color:#595959;line-height:1.6;margin:0 0 20px;">
        Bitte klicke auf den folgenden Button, um dein Passwort festzulegen und dein Konto zu aktivieren:
      </p>
      <a href="${recoveryLink}" style="background-color:#00507d;color:#ffffff;font-size:14px;border-radius:6px;padding:12px 24px;text-decoration:none;display:inline-block;margin:0 0 24px;">
        Passwort festlegen
      </a>
      <p style="font-size:14px;color:#595959;line-height:1.6;margin:0 0 20px;">
        Nach der Aktivierung kannst du dich unter <a href="https://www.slt-rental.de/b2b/login" style="color:#00507d;">www.slt-rental.de/b2b/login</a> anmelden.
      </p>
      <p style="font-size:12px;color:#999999;margin:20px 0 0;">
        Falls du diese E-Mail nicht erwartet hast, wende dich bitte an deinen Arbeitgeber.
      </p>
    </td>
  </tr>
  <tr>
    <td style="background-color:#f9f9f9;padding:16px 32px;text-align:center;font-size:12px;color:#999999;">
      SLT Technology Group GmbH & Co. KG · Anrather Straße 291 · 47807 Krefeld
    </td>
  </tr>
</table>
</body>
</html>`,
      });
    }

    return new Response(
      JSON.stringify({ success: true, user_id: userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
