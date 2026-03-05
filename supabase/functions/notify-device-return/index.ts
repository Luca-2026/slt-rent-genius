import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { reservation_id } = await req.json();

    if (!reservation_id) {
      return new Response(JSON.stringify({ error: "reservation_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch reservation and verify ownership
    const { data: reservation, error: resError } = await serviceClient
      .from("b2b_reservations")
      .select("*")
      .eq("id", reservation_id)
      .single();

    if (resError || !reservation) {
      console.error("Reservation not found:", resError);
      return new Response(JSON.stringify({ error: "Reservation not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user owns this reservation
    if (reservation.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only confirmed reservations can be returned
    if (reservation.status !== "confirmed") {
      return new Response(
        JSON.stringify({ error: `Gerät kann im Status '${reservation.status}' nicht freigemeldet werden` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Customer returning device for reservation:", reservation_id);

    // Update reservation status to completed
    const { error: updateError } = await serviceClient
      .from("b2b_reservations")
      .update({ status: "completed" })
      .eq("id", reservation_id);

    if (updateError) {
      console.error("Failed to update reservation:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update reservation" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch customer profile for email context
    const { data: profile } = await serviceClient
      .from("b2b_profiles")
      .select("company_name, contact_first_name, contact_last_name, contact_email, assigned_location")
      .eq("id", reservation.b2b_profile_id)
      .single();

    const customerName = profile
      ? `${profile.contact_first_name} ${profile.contact_last_name}`
      : "Unbekannt";
    const companyName = profile?.company_name || "Unbekannt";

    // Send notification email to admin
    let emailSent = false;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "info@slt-rental.de";

    if (resendApiKey) {
      try {
        const formatDate = (dateStr: string) => {
          const d = new Date(dateStr + "T00:00:00");
          return d.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        };

        const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:25px 40px;text-align:center;border-bottom:3px solid #00507d;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:70px;width:auto;" />
    </div>
    <div style="background:#00507d;padding:14px 40px;text-align:center;">
      <p style="color:#ffffff;margin:0;font-size:15px;font-weight:600;">Gerät freigemeldet</p>
    </div>
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;margin-bottom:20px;">
        Ein Kunde hat ein Mietgerät freigemeldet:
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:25px;">
        <table style="width:100%;font-size:14px;color:#333;">
          <tr>
            <td style="padding:6px 0;color:#64748b;width:40%;">Kunde:</td>
            <td style="padding:6px 0;font-weight:600;">${escapeHtml(companyName)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">Ansprechpartner:</td>
            <td style="padding:6px 0;">${escapeHtml(customerName)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">Produkt:</td>
            <td style="padding:6px 0;font-weight:600;">${escapeHtml(reservation.product_name || reservation.product_id)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">Standort:</td>
            <td style="padding:6px 0;text-transform:capitalize;">${escapeHtml(reservation.location)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">Mietzeitraum:</td>
            <td style="padding:6px 0;">${formatDate(reservation.start_date)}${reservation.end_date ? ` – ${formatDate(reservation.end_date)}` : ""}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">Menge:</td>
            <td style="padding:6px 0;">${reservation.quantity}</td>
          </tr>
        </table>
      </div>
      <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:25px;">
        Der Mietvorgang wurde automatisch auf <strong>„Abgeschlossen"</strong> gesetzt. 
        Bitte prüfen Sie die Rückgabe und erstellen Sie ggf. die Schlussrechnung.
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://slt-rent-genius.lovable.app/b2b/admin" 
           style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:14px;font-weight:600;">
          Zum Admin-Dashboard →
        </a>
      </div>
    </div>
    <div style="background:#f1f5f9;padding:25px 40px;border-top:1px solid #e2e8f0;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600;">SLT Technology Group GmbH & Co. KG</p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">Automatische Benachrichtigung – Bitte nicht antworten</p>
    </div>
  </div>
</body>
</html>`;

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
            to: [adminEmail],
            subject: `Gerät freigemeldet: ${reservation.product_name || reservation.product_id} – ${companyName}`,
            html: emailHtml,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log("Admin notification email sent to:", adminEmail);
        } else {
          const errBody = await emailRes.text();
          console.error("Resend API error:", emailRes.status, errBody);
        }
      } catch (emailErr: any) {
        console.error("Email sending failed:", emailErr.message);
      }
    } else {
      console.log("RESEND_API_KEY not configured, skipping admin email notification");
    }

    console.log("Device return completed for reservation:", reservation_id);

    return new Response(
      JSON.stringify({
        success: true,
        reservation_id,
        status: "completed",
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
