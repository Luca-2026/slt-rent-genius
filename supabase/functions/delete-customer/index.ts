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

interface DeleteRequest {
  profile_id: string;
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

    const body: DeleteRequest = await req.json();
    const { profile_id } = body;

    if (!profile_id) {
      return new Response(JSON.stringify({ error: "profile_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Deleting customer profile:", profile_id);

    // Use service role for admin operations
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the profile before deletion (for email)
    const { data: profile, error: profileError } = await serviceClient
      .from("b2b_profiles")
      .select("*")
      .eq("id", profile_id)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found:", profileError);
      return new Response(JSON.stringify({ error: "B2B profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerEmail = profile.billing_email || profile.contact_email;
    const customerName = `${profile.contact_first_name} ${profile.contact_last_name}`;
    const companyName = profile.company_name;
    const userId = profile.user_id;

    // Check for open/overdue invoices — block deletion if any
    const { data: openInvoices } = await serviceClient
      .from("b2b_invoices")
      .select("id, invoice_number, status")
      .eq("b2b_profile_id", profile_id)
      .in("status", ["open", "overdue"]);

    if (openInvoices && openInvoices.length > 0) {
      console.log("Cannot delete: open invoices exist:", openInvoices.length);
      return new Response(
        JSON.stringify({
          error: `Löschung nicht möglich: ${openInvoices.length} offene/überfällige Rechnung(en) vorhanden. Bitte zuerst alle Rechnungen abschließen.`,
          open_invoices: openInvoices.map((i: any) => i.invoice_number),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Delete associated data in correct order ──

    // 1. Delete category discounts
    const { error: discountErr } = await serviceClient
      .from("b2b_category_discounts")
      .delete()
      .eq("b2b_profile_id", profile_id);
    if (discountErr) console.error("Error deleting discounts:", discountErr);

    // 2. Delete customer prices
    const { error: pricesErr } = await serviceClient
      .from("b2b_customer_prices")
      .delete()
      .eq("b2b_profile_id", profile_id);
    if (pricesErr) console.error("Error deleting prices:", pricesErr);

    // 3. Delete offer items (via offers)
    const { data: customerOffers } = await serviceClient
      .from("b2b_offers")
      .select("id")
      .eq("b2b_profile_id", profile_id);

    if (customerOffers && customerOffers.length > 0) {
      const offerIds = customerOffers.map((o: any) => o.id);
      const { error: offerItemsErr } = await serviceClient
        .from("b2b_offer_items")
        .delete()
        .in("offer_id", offerIds);
      if (offerItemsErr) console.error("Error deleting offer items:", offerItemsErr);
    }

    // 4. Delete offers
    const { error: offersErr } = await serviceClient
      .from("b2b_offers")
      .delete()
      .eq("b2b_profile_id", profile_id);
    if (offersErr) console.error("Error deleting offers:", offersErr);

    // 5. Delete invoice items (via invoices)
    const { data: customerInvoices } = await serviceClient
      .from("b2b_invoices")
      .select("id")
      .eq("b2b_profile_id", profile_id);

    if (customerInvoices && customerInvoices.length > 0) {
      const invoiceIds = customerInvoices.map((i: any) => i.id);
      const { error: invoiceItemsErr } = await serviceClient
        .from("b2b_invoice_items")
        .delete()
        .in("invoice_id", invoiceIds);
      if (invoiceItemsErr) console.error("Error deleting invoice items:", invoiceItemsErr);
    }

    // 6. Delete invoices
    const { error: invoicesErr } = await serviceClient
      .from("b2b_invoices")
      .delete()
      .eq("b2b_profile_id", profile_id);
    if (invoicesErr) console.error("Error deleting invoices:", invoicesErr);

    // 7. Delete reservations
    const { error: resErr } = await serviceClient
      .from("b2b_reservations")
      .delete()
      .eq("b2b_profile_id", profile_id);
    if (resErr) console.error("Error deleting reservations:", resErr);

    // 8. Delete project requests
    const { error: projErr } = await serviceClient
      .from("project_requests")
      .delete()
      .eq("user_id", userId);
    if (projErr) console.error("Error deleting project requests:", projErr);

    // 9. Delete the b2b profile
    const { error: profileDelErr } = await serviceClient
      .from("b2b_profiles")
      .delete()
      .eq("id", profile_id);
    if (profileDelErr) {
      console.error("Error deleting profile:", profileDelErr);
      return new Response(
        JSON.stringify({ error: "Failed to delete customer profile" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 10. Delete auth user
    const { error: authDelErr } = await serviceClient.auth.admin.deleteUser(userId);
    if (authDelErr) {
      console.error("Error deleting auth user:", authDelErr);
      // Non-critical: profile is already gone
    }

    console.log("Customer deleted successfully:", companyName);

    // ── Send confirmation email ──
    let emailSent = false;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey) {
      try {
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
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:60px;width:auto;margin-bottom:8px;" />
      <p style="color:#b3d4e8;margin:6px 0 0;font-size:13px;">Kontolöschung bestätigt</p>
    </div>

    <!-- Body -->
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;margin-bottom:20px;">
        Guten Tag ${escapeHtml(customerName)},
      </p>
      <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:25px;">
        hiermit bestätigen wir, dass Ihr B2B-Kundenkonto für <strong>${escapeHtml(companyName)}</strong> 
        bei SLT-Rental vollständig gelöscht wurde.
      </p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:25px;">
        <p style="font-size:14px;color:#333;margin:0 0 10px;font-weight:600;">Was wurde gelöscht:</p>
        <ul style="font-size:13px;color:#555;margin:0;padding-left:20px;line-height:1.8;">
          <li>Ihr B2B-Kundenprofil und Stammdaten</li>
          <li>Alle gespeicherten Reservierungen und Anfragen</li>
          <li>Alle Rechnungen und Angebote</li>
          <li>Individuelle Rabattvereinbarungen</li>
          <li>Ihr Benutzerkonto</li>
        </ul>
      </div>

      <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:25px;">
        Falls Sie in Zukunft erneut unsere B2B-Services nutzen möchten, können Sie sich jederzeit 
        neu registrieren. Bei Fragen stehen wir Ihnen gerne zur Verfügung.
      </p>

      <p style="font-size:14px;color:#555;line-height:1.6;">
        Mit freundlichen Grüßen,<br>
        <strong>Ihr SLT-Rental Team</strong>
      </p>
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
            subject: `Ihr B2B-Konto bei SLT-Rental wurde gelöscht`,
            html: emailHtml,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log("Deletion confirmation email sent to:", customerEmail);
        } else {
          const errBody = await emailRes.text();
          console.error("Resend API error:", emailRes.status, errBody);
        }
      } catch (emailErr: any) {
        console.error("Email sending failed:", emailErr.message);
      }
    } else {
      console.log("RESEND_API_KEY not configured, skipping confirmation email");
    }

    return new Response(
      JSON.stringify({
        success: true,
        profile_id,
        company_name: companyName,
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
