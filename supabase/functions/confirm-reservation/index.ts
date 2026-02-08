import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SLT_COMPANY = {
  name: "SLT Technology Group GmbH & Co. KG",
  brand: "SLT-Rental",
  phone: "+49 (0) 2151 - 417 99 02",
  email: "info@slt-rental.de",
  web: "www.slt-rental.de",
};

interface ConfirmRequest {
  reservation_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
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

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
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

    const body: ConfirmRequest = await req.json();
    const { reservation_id } = body;

    if (!reservation_id) {
      return new Response(JSON.stringify({ error: "reservation_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Confirming reservation:", reservation_id);

    // Use service role for admin operations
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch reservation
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

    const confirmableStatuses = ["pending", "offer_sent"];
    if (!confirmableStatuses.includes(reservation.status)) {
      return new Response(
        JSON.stringify({ error: `Reservation is already '${reservation.status}'` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch B2B profile for email
    const { data: profile, error: profileError } = await serviceClient
      .from("b2b_profiles")
      .select("*")
      .eq("id", reservation.b2b_profile_id)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found:", profileError);
      return new Response(JSON.stringify({ error: "B2B profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update reservation status to confirmed
    const { error: updateError } = await serviceClient
      .from("b2b_reservations")
      .update({ status: "confirmed" })
      .eq("id", reservation_id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to confirm reservation" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Reservation confirmed, status updated to 'confirmed'");

    // Send confirmation email via Resend (if API key is configured)
    let emailSent = false;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey) {
      try {
        const customerEmail = profile.billing_email || profile.contact_email;
        const customerName = `${profile.contact_first_name} ${profile.contact_last_name}`;

        const formatDate = (dateStr: string) => {
          const d = new Date(dateStr + "T00:00:00");
          return d.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        };

        const formatCurrency = (n: number) =>
          n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

        // Extract time info from notes if present
        let timeInfo = "";
        if (reservation.notes) {
          const timeMatch = reservation.notes.match(
            /(?:Abholung: (\d{2}:\d{2}) Uhr)?(?:\s*·\s*)?(?:Rückgabe: (\d{2}:\d{2}) Uhr)?/
          );
          if (timeMatch) {
            const parts = [];
            if (timeMatch[1]) parts.push(`Abholung: ${timeMatch[1]} Uhr`);
            if (timeMatch[2]) parts.push(`Rückgabe: ${timeMatch[2]} Uhr`);
            if (parts.length > 0) timeInfo = parts.join(" · ");
          }
        }

        const priceDisplay =
          reservation.discounted_price != null
            ? formatCurrency(reservation.discounted_price)
            : reservation.original_price != null
            ? formatCurrency(reservation.original_price)
            : "Auf Anfrage";

        const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <!-- Header -->
    <div style="background:#00507d;padding:30px 40px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:600;">SLT-Rental</h1>
      <p style="color:#b3d4e8;margin:6px 0 0;font-size:13px;">Mietbestätigung</p>
    </div>

    <!-- Body -->
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;margin-bottom:20px;">
        Guten Tag ${escapeHtml(customerName)},
      </p>
      <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:25px;">
        Wir freuen uns, Ihnen mitteilen zu können, dass Ihre Mietanfrage <strong>bestätigt</strong> wurde. 
        Nachfolgend finden Sie die Details Ihrer Reservierung:
      </p>

      <!-- Reservation Details Card -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:25px;">
        <table style="width:100%;font-size:14px;color:#333;">
          <tr>
            <td style="padding:6px 0;color:#64748b;width:40%;">Produkt:</td>
            <td style="padding:6px 0;font-weight:600;">${escapeHtml(reservation.product_name || reservation.product_id)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">Standort:</td>
            <td style="padding:6px 0;text-transform:capitalize;">${escapeHtml(reservation.location)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">Zeitraum:</td>
            <td style="padding:6px 0;">${formatDate(reservation.start_date)}${reservation.end_date ? ` – ${formatDate(reservation.end_date)}` : ""}</td>
          </tr>
          ${
            timeInfo
              ? `<tr>
            <td style="padding:6px 0;color:#64748b;">Uhrzeiten:</td>
            <td style="padding:6px 0;">${timeInfo}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding:6px 0;color:#64748b;">Menge:</td>
            <td style="padding:6px 0;">${reservation.quantity}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">Preis:</td>
            <td style="padding:6px 0;font-weight:600;color:#00507d;">${priceDisplay}</td>
          </tr>
        </table>
      </div>

      <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:25px;">
        Bei Fragen oder Änderungswünschen stehen wir Ihnen gerne zur Verfügung.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:30px 0;">
        <a href="https://slt-rent-genius.lovable.app/b2b/dashboard" 
           style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:14px;font-weight:600;">
          Zum B2B-Portal →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9;padding:25px 40px;border-top:1px solid #e2e8f0;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600;">${SLT_COMPANY.name}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">Tel: ${SLT_COMPANY.phone} · E-Mail: ${SLT_COMPANY.email}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">${SLT_COMPANY.web}</p>
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
            to: [customerEmail],
            subject: `Mietbestätigung – ${reservation.product_name || reservation.product_id}`,
            html: emailHtml,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log("Confirmation email sent to:", customerEmail);
        } else {
          const errBody = await emailRes.text();
          console.error("Resend API error:", emailRes.status, errBody);
        }
      } catch (emailErr: any) {
        console.error("Email sending failed:", emailErr.message);
      }
    } else {
      console.log("RESEND_API_KEY not configured, skipping email notification");
    }

    return new Response(
      JSON.stringify({
        success: true,
        reservation_id,
        status: "confirmed",
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
