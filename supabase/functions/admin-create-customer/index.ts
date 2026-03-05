import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CreateCustomerRequest {
  email: string;
  password: string;
  company_name: string;
  legal_form?: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_phone: string;
  contact_email: string;
  street: string;
  house_number?: string;
  postal_code: string;
  city: string;
  country?: string;
  tax_id?: string;
  credit_limit?: number;
  assigned_location?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check - only admins
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authUser.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: CreateCustomerRequest = await req.json();
    console.log("Creating customer:", body.email, body.company_name);

    // Validate required fields
    if (!body.email || !body.password || !body.company_name || !body.contact_first_name || 
        !body.contact_last_name || !body.contact_phone || !body.contact_email ||
        !body.street || !body.postal_code || !body.city) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to create auth user
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create auth user with auto-confirm
    const { data: newUser, error: createUserError } = await serviceClient.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    if (createUserError || !newUser?.user) {
      console.error("Error creating user:", createUserError);
      return new Response(JSON.stringify({ error: createUserError?.message || "Failed to create user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Auth user created:", newUser.user.id);

    // Create B2B profile with approved status
    const { data: profile, error: profileError } = await serviceClient
      .from("b2b_profiles")
      .insert({
        user_id: newUser.user.id,
        company_name: body.company_name,
        legal_form: body.legal_form || null,
        contact_first_name: body.contact_first_name,
        contact_last_name: body.contact_last_name,
        contact_phone: body.contact_phone,
        contact_email: body.contact_email,
        street: body.street,
        house_number: body.house_number || null,
        postal_code: body.postal_code,
        city: body.city,
        country: body.country || "Deutschland",
        tax_id: body.tax_id || null,
        credit_limit: body.credit_limit || 0,
        assigned_location: body.assigned_location || null,
        status: "approved",
      })
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Clean up: delete the auth user if profile creation fails
      await serviceClient.auth.admin.deleteUser(newUser.user.id);
      return new Response(JSON.stringify({ error: "Failed to create B2B profile: " + profileError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("B2B profile created:", profile.id);

    // Send welcome email to customer
    let emailSent = false;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        const customerName = `${body.contact_first_name} ${body.contact_last_name}`;
        const emailHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:25px 40px;text-align:center;border-bottom:3px solid #00507d;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:70px;width:auto;" />
    </div>
    <div style="background:#00507d;padding:14px 40px;text-align:center;">
      <p style="color:#ffffff;margin:0;font-size:15px;font-weight:600;">Willkommen im B2B-Portal</p>
    </div>
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;">Guten Tag ${customerName},</p>
      <p style="font-size:14px;color:#555;line-height:1.6;">
        Ihr B2B-Kundenkonto für <strong>${body.company_name}</strong> wurde erfolgreich eingerichtet und freigeschaltet.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="font-size:13px;font-weight:600;margin:0 0 8px;color:#333;">Ihre Zugangsdaten:</p>
        <p style="font-size:14px;color:#555;margin:4px 0;">E-Mail: <strong>${body.email}</strong></p>
        <p style="font-size:14px;color:#555;margin:4px 0;">Passwort: <strong>${body.password}</strong></p>
        <p style="font-size:12px;color:#94a3b8;margin:8px 0 0;">Bitte ändern Sie Ihr Passwort nach dem ersten Login.</p>
      </div>
      <p style="font-size:14px;color:#555;line-height:1.6;">
        Bitte prüfen Sie Ihre hinterlegten Firmendaten im Portal und bestätigen Sie deren Richtigkeit.
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://slt-rent-genius.lovable.app/b2b/login" 
           style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:14px;font-weight:600;">
          Zum B2B-Portal einloggen →
        </a>
      </div>
    </div>
    <div style="background:#f1f5f9;padding:25px 40px;border-top:1px solid #e2e8f0;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600;">SLT Technology Group GmbH & Co. KG</p>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">Tel: +49 (0) 2151 - 417 99 02 · E-Mail: info@slt-rental.de</p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">www.slt-rental.de</p>
    </div>
  </div>
</body></html>`;

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
            to: [body.email],
            subject: `Willkommen bei SLT-Rental – Ihr B2B-Zugang`,
            html: emailHtml,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log("Welcome email sent to:", body.email);
        } else {
          const errBody = await emailRes.text();
          console.error("Resend API error:", emailRes.status, errBody);
        }
      } catch (emailErr: any) {
        console.error("Email sending failed:", emailErr.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUser.user.id,
        profile_id: profile.id,
        company_name: body.company_name,
        email_sent: emailSent,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
