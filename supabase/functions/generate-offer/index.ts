import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SLT_COMPANY = {
  name: "SLT Technology Group GmbH & Co. KG",
  brand: "SLT-Rental",
  street: "Anrather Straße 291",
  city: "47807 Krefeld",
  country: "Deutschland",
  phone: "+49 (0) 2151 - 417 99 02",
  fax: "+49 (0) 2151 - 417 99 04",
  email: "info@slt-rental.de",
  web: "www.slt-rental.de",
  registry: "HRA 7075 Amtsgericht Krefeld",
  managingDirector: "Benedikt Nöchel",
  bankName: "Sparkasse Krefeld",
  iban: "DE65 3205 0000 0000 4784 46",
  bic: "SPKRDE33",
};

interface OfferItem {
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  rental_start?: string;
  rental_end?: string;
}

interface OfferRequest {
  reservation_id: string;
  offer_id?: string; // If provided, update existing offer
  items: OfferItem[];
  delivery_cost?: number;
  valid_days?: number;
  notes?: string;
  send_email?: boolean;
  save_prices?: boolean;
}

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

    const body: OfferRequest = await req.json();
    const {
      reservation_id,
      offer_id,
      items,
      delivery_cost = 0,
      valid_days = 14,
      notes,
      send_email = true,
      save_prices = true,
    } = body;

    if (!reservation_id || !items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "reservation_id and items are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating offer for reservation:", reservation_id);

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

    // Fetch B2B profile
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

    // Determine reverse charge
    const isReverseCharge = !!(profile.tax_id && profile.vat_id_verified);
    const vatRate = isReverseCharge ? 0 : 19;

    // Build offer items with calculations
    const offerItems = items.map((item) => {
      const discountedPrice = item.unit_price * (1 - (item.discount_percent || 0) / 100);
      const totalPrice = Math.round(discountedPrice * item.quantity * 100) / 100;
      return {
        product_name: item.product_name,
        description: item.description || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        total_price: totalPrice,
        rental_start: item.rental_start || reservation.start_date,
        rental_end: item.rental_end || reservation.end_date,
      };
    });

    const itemsTotal = offerItems.reduce((sum, item) => sum + item.total_price, 0);
    const netAmount = Math.round((itemsTotal + delivery_cost) * 100) / 100;
    const vatAmount = isReverseCharge ? 0 : Math.round(netAmount * (vatRate / 100) * 100) / 100;
    const grossAmount = Math.round((netAmount + vatAmount) * 100) / 100;

    let offerNumber: string;
    let offerDate: string;
    let validUntil: string;

    if (offer_id) {
      // Update existing offer: reuse offer number
      const { data: existingOffer, error: existingError } = await serviceClient
        .from("b2b_offers")
        .select("offer_number")
        .eq("id", offer_id)
        .single();

      if (existingError || !existingOffer) {
        return new Response(JSON.stringify({ error: "Existing offer not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      offerNumber = existingOffer.offer_number;
      offerDate = new Date().toISOString().split("T")[0];
      validUntil = new Date(Date.now() + valid_days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      console.log("Updating existing offer:", offerNumber);
    } else {
      // Generate new offer number
      const { data: offerNumData, error: offerNumError } = await serviceClient
        .rpc("generate_offer_number");

      if (offerNumError) {
        console.error("Error generating offer number:", offerNumError);
        return new Response(JSON.stringify({ error: "Failed to generate offer number" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      offerNumber = offerNumData as string;
      offerDate = new Date().toISOString().split("T")[0];
      validUntil = new Date(Date.now() + valid_days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      console.log("Offer number generated:", offerNumber);
    }

    // Generate offer HTML
    const offerHtml = generateOfferHtml({
      offerNumber,
      offerDate,
      validUntil,
      profile,
      items: offerItems,
      deliveryCost: delivery_cost,
      netAmount,
      vatRate,
      vatAmount,
      grossAmount,
      isReverseCharge,
      notes: notes || null,
      validDays: valid_days,
    });

    // Store as HTML file
    const fileName = `Angebot_SLTRental_${offerNumber}_${profile.company_name.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "_")}.html`;
    const filePath = `offers/${profile.id}/${fileName}`;

    const htmlBytes = new TextEncoder().encode(offerHtml);
    const { error: uploadError } = await serviceClient.storage
      .from("b2b-invoices")
      .upload(filePath, htmlBytes, {
        contentType: "text/html; charset=utf-8",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload offer file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get signed URL (valid for 1 year)
    const { data: signedUrlData } = await serviceClient.storage
      .from("b2b-invoices")
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    const fileUrl = signedUrlData?.signedUrl || "";

    let offer: any;

    if (offer_id) {
      // Update existing offer
      const { data: updatedOffer, error: offerError } = await serviceClient
        .from("b2b_offers")
        .update({
          offer_date: offerDate,
          valid_until: validUntil,
          status: "sent",
          net_amount: netAmount,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          gross_amount: grossAmount,
          delivery_cost,
          is_reverse_charge: isReverseCharge,
          notes: notes || null,
          file_url: fileUrl,
          file_name: fileName,
          email_sent: false,
        })
        .eq("id", offer_id)
        .select()
        .single();

      if (offerError) {
        console.error("Offer update error:", offerError);
        return new Response(JSON.stringify({ error: "Failed to update offer record" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      offer = updatedOffer;

      // Delete old items and insert new ones
      await serviceClient.from("b2b_offer_items").delete().eq("offer_id", offer_id);
    } else {
      // Create new offer record
      const { data: newOffer, error: offerError } = await serviceClient
        .from("b2b_offers")
        .insert({
          reservation_id,
          b2b_profile_id: profile.id,
          offer_number: offerNumber,
          offer_date: offerDate,
          valid_until: validUntil,
          status: "sent",
          net_amount: netAmount,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          gross_amount: grossAmount,
          delivery_cost,
          is_reverse_charge: isReverseCharge,
          notes: notes || null,
          file_url: fileUrl,
          file_name: fileName,
          email_sent: false,
        })
        .select()
        .single();

      if (offerError) {
        console.error("Offer creation error:", offerError);
        return new Response(JSON.stringify({ error: "Failed to create offer record" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      offer = newOffer;
    }

    // Insert offer items
    const itemsToInsert = offerItems.map((item) => ({
      offer_id: offer.id,
      product_name: item.product_name,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent,
      total_price: item.total_price,
      rental_start: item.rental_start,
      rental_end: item.rental_end,
    }));

    const { error: itemsError } = await serviceClient
      .from("b2b_offer_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Offer items error:", itemsError);
    }

    // Save customer-specific prices permanently
    if (save_prices) {
      for (const item of items) {
        const { error: priceError } = await serviceClient
          .from("b2b_customer_prices")
          .upsert(
            {
              b2b_profile_id: profile.id,
              product_name: item.product_name,
              product_id: reservation.product_id || null,
              unit_price: item.unit_price,
            },
            { onConflict: "b2b_profile_id,product_name" }
          );

        if (priceError) {
          console.error("Price save error:", priceError);
        }
      }
      console.log("Customer prices saved permanently for", profile.company_name);
    }

    // Update reservation status to offer_sent
    await serviceClient
      .from("b2b_reservations")
      .update({ 
        status: "offer_sent",
        original_price: offerItems[0]?.unit_price || null,
        discounted_price: offerItems[0]?.total_price || null,
      })
      .eq("id", reservation_id);

    // Send email via Resend
    let emailSent = false;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey && send_email) {
      try {
        const customerEmail = profile.billing_email || profile.contact_email;
        const customerName = `${profile.contact_first_name} ${profile.contact_last_name}`;

        const formatDate = (dateStr: string) => {
          const d = new Date(dateStr + "T00:00:00");
          return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
        };

        const formatCurrency = (n: number) =>
          n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

        const itemsHtml = offerItems.map(item => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;">${escapeHtml(item.product_name)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:14px;">${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:14px;">${formatCurrency(item.unit_price)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:14px;font-weight:600;">${formatCurrency(item.total_price)}</td>
          </tr>
        `).join("");

        const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#00507d;padding:30px 40px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:600;">SLT-Rental</h1>
      <p style="color:#b3d4e8;margin:6px 0 0;font-size:13px;">Ihr individuelles Angebot</p>
    </div>
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;margin-bottom:20px;">
        Guten Tag ${escapeHtml(customerName)},
      </p>
      <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:25px;">
        vielen Dank für Ihre Anfrage. Wir haben ein individuelles Angebot für Sie erstellt:
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:4px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#00507d;">
              <th style="padding:10px 12px;text-align:left;color:white;font-size:13px;font-weight:600;">Produkt</th>
              <th style="padding:10px 12px;text-align:center;color:white;font-size:13px;font-weight:600;">Menge</th>
              <th style="padding:10px 12px;text-align:right;color:white;font-size:13px;font-weight:600;">Einzelpreis</th>
              <th style="padding:10px 12px;text-align:right;color:white;font-size:13px;font-weight:600;">Gesamt</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
      </div>
      <div style="text-align:right;margin-bottom:25px;">
        <p style="font-size:14px;color:#555;">Netto: <strong>${formatCurrency(netAmount)}</strong></p>
        ${isReverseCharge 
          ? `<p style="font-size:12px;color:#64748b;">USt. (Reverse-Charge): ${formatCurrency(0)}</p>` 
          : `<p style="font-size:14px;color:#555;">zzgl. ${vatRate}% USt.: ${formatCurrency(vatAmount)}</p>`}
        <p style="font-size:18px;color:#00507d;font-weight:700;">Brutto: ${formatCurrency(grossAmount)}</p>
      </div>
      <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:12px 16px;margin-bottom:25px;">
        <p style="font-size:13px;color:#92400e;margin:0;">
          ⏰ Dieses Angebot ist gültig bis zum <strong>${formatDate(validUntil)}</strong>.
        </p>
      </div>
      <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:25px;">
        Das vollständige Angebotsdokument (Nr. <strong>${offerNumber}</strong>) finden Sie auch in Ihrem B2B-Portal zum Download.
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://slt-rent-genius.lovable.app/b2b/reservations" 
           style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:14px;font-weight:600;">
          Zum B2B-Portal →
        </a>
      </div>
    </div>
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
            subject: `Ihr Angebot ${offerNumber} – ${reservation.product_name || reservation.product_id}`,
            html: emailHtml,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log("Offer email sent to:", customerEmail);

          // Update offer email status
          await serviceClient
            .from("b2b_offers")
            .update({ email_sent: true, email_sent_at: new Date().toISOString() })
            .eq("id", offer.id);
        } else {
          const errBody = await emailRes.text();
          console.error("Resend API error:", emailRes.status, errBody);
        }
      } catch (emailErr: any) {
        console.error("Email sending failed:", emailErr.message);
      }
    } else {
      console.log("Email not sent (RESEND_API_KEY not configured or send_email=false)");
    }

    return new Response(
      JSON.stringify({
        success: true,
        offer: {
          id: offer.id,
          offer_number: offerNumber,
          gross_amount: grossAmount,
          file_url: fileUrl,
          is_reverse_charge: isReverseCharge,
        },
        email_sent: emailSent,
        prices_saved: save_prices,
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

// ─── HTML Offer Generator ───────────────────────────────────
function generateOfferHtml(data: {
  offerNumber: string;
  offerDate: string;
  validUntil: string;
  profile: any;
  items: any[];
  deliveryCost: number;
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  grossAmount: number;
  isReverseCharge: boolean;
  notes: string | null;
  validDays: number;
}): string {
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const itemRows = data.items
    .map(
      (item, i) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${i + 1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
        <strong>${escapeHtml(item.product_name)}</strong>
        ${item.description ? `<br><span style="color:#595959;font-size:12px;">${escapeHtml(item.description)}</span>` : ""}
        ${item.rental_start ? `<br><span style="color:#595959;font-size:11px;">Zeitraum: ${formatDate(item.rental_start)}${item.rental_end ? " – " + formatDate(item.rental_end) : ""}</span>` : ""}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.unit_price)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.discount_percent > 0 ? item.discount_percent + "%" : "–"}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:500;">${formatCurrency(item.total_price)}</td>
    </tr>`
    )
    .join("");

  const vatIdLine = data.profile.tax_id
    ? `<p style="margin:2px 0;font-size:13px;">USt-IdNr.: ${escapeHtml(data.profile.tax_id)}${data.isReverseCharge ? " ✓ geprüft" : ""}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Angebot ${data.offerNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Montserrat', Arial, sans-serif; color: #393d46; font-size: 13px; line-height: 1.5; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      @page { margin: 15mm; size: A4; }
    }
    .print-btn { position: fixed; top: 20px; right: 20px; background: #00507d; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .print-btn:hover { background: #003d5f; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">📄 Als PDF drucken / speichern</button>

  <div style="max-width:210mm;margin:0 auto;padding:20mm 15mm;">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10mm;padding-bottom:8mm;border-bottom:3px solid #00507d;">
      <div>
        <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:120px;width:auto;margin-bottom:6px;" />
        <p style="font-size:11px;color:#595959;">${SLT_COMPANY.name}</p>
        <p style="font-size:11px;color:#595959;">${SLT_COMPANY.street}, ${SLT_COMPANY.city}</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:22px;font-weight:700;color:#393d46;">ANGEBOT</p>
        <p style="font-size:13px;color:#595959;margin-top:4px;">Nr. ${data.offerNumber}</p>
      </div>
    </div>

    <!-- Sender line -->
    <p style="font-size:9px;color:#999;margin-bottom:5mm;border-bottom:1px solid #ccc;padding-bottom:2mm;">
      ${SLT_COMPANY.name} · ${SLT_COMPANY.street} · ${SLT_COMPANY.city}
    </p>

    <!-- Address block + Offer meta -->
    <div style="display:flex;justify-content:space-between;margin-bottom:12mm;">
      <div style="max-width:55%;">
        <p style="font-weight:600;font-size:14px;margin-bottom:4px;">${escapeHtml(data.profile.company_name)}</p>
        ${data.profile.legal_form ? `<p style="font-size:12px;color:#595959;">${escapeHtml(data.profile.legal_form)}</p>` : ""}
        <p style="font-size:13px;">${escapeHtml(data.profile.street)}${data.profile.house_number ? " " + escapeHtml(data.profile.house_number) : ""}</p>
        <p style="font-size:13px;">${escapeHtml(data.profile.postal_code)} ${escapeHtml(data.profile.city)}</p>
        <p style="font-size:13px;">${escapeHtml(data.profile.country || "Deutschland")}</p>
        ${vatIdLine}
      </div>
      <div style="text-align:right;">
        <table style="font-size:13px;margin-left:auto;">
          <tr><td style="color:#595959;padding-right:12px;">Angebotsdatum:</td><td style="font-weight:500;">${formatDate(data.offerDate)}</td></tr>
          <tr><td style="color:#595959;padding-right:12px;">Gültig bis:</td><td style="font-weight:500;color:#b45309;">${formatDate(data.validUntil)}</td></tr>
          <tr><td style="color:#595959;padding-right:12px;">Kundennr.:</td><td style="font-weight:500;">${data.profile.id.substring(0, 8).toUpperCase()}</td></tr>
          ${data.isReverseCharge ? `<tr><td style="color:#595959;padding-right:12px;">Verfahren:</td><td style="font-weight:500;color:#00507d;">Reverse-Charge</td></tr>` : ""}
        </table>
      </div>
    </div>

    <!-- Intro text -->
    <p style="font-size:13px;margin-bottom:8mm;line-height:1.6;">
      Sehr geehrte Damen und Herren,<br>
      vielen Dank für Ihre Anfrage. Gerne unterbreiten wir Ihnen folgendes Angebot:
    </p>

    <!-- Items table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:8mm;">
      <thead>
        <tr style="background:#00507d;color:white;">
          <th style="padding:10px 12px;text-align:left;font-weight:600;width:5%;">Pos.</th>
          <th style="padding:10px 12px;text-align:left;font-weight:600;width:40%;">Bezeichnung</th>
          <th style="padding:10px 12px;text-align:center;font-weight:600;width:8%;">Menge</th>
          <th style="padding:10px 12px;text-align:right;font-weight:600;width:15%;">Einzelpreis</th>
          <th style="padding:10px 12px;text-align:center;font-weight:600;width:10%;">Rabatt</th>
          <th style="padding:10px 12px;text-align:right;font-weight:600;width:15%;">Gesamt</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        ${data.deliveryCost > 0 ? `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;"></td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;"><strong>Lieferung / Transport</strong></td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">1</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(data.deliveryCost)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">–</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:500;">${formatCurrency(data.deliveryCost)}</td>
        </tr>` : ""}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;justify-content:flex-end;margin-bottom:10mm;">
      <table style="font-size:14px;min-width:280px;">
        <tr>
          <td style="padding:4px 16px 4px 0;color:#595959;">Nettobetrag:</td>
          <td style="padding:4px 0;text-align:right;">${formatCurrency(data.netAmount)}</td>
        </tr>
        <tr>
          <td style="padding:4px 16px 4px 0;color:#595959;">
            ${data.isReverseCharge ? "USt. (Reverse-Charge):" : `USt. (${data.vatRate}%):`}
          </td>
          <td style="padding:4px 0;text-align:right;">${formatCurrency(data.vatAmount)}</td>
        </tr>
        <tr style="border-top:2px solid #00507d;">
          <td style="padding:8px 16px 4px 0;font-weight:700;font-size:16px;color:#00507d;">Bruttobetrag:</td>
          <td style="padding:8px 0 4px;text-align:right;font-weight:700;font-size:16px;color:#00507d;">${formatCurrency(data.grossAmount)}</td>
        </tr>
      </table>
    </div>

    ${data.isReverseCharge ? `
    <div style="background:#f0f7fb;border-left:4px solid #00507d;padding:12px 16px;margin-bottom:8mm;font-size:12px;">
      <strong>Hinweis:</strong> Steuerschuldnerschaft des Leistungsempfängers (Reverse-Charge-Verfahren gem. § 13b UStG). 
      Die Umsatzsteuer ist vom Leistungsempfänger zu entrichten.
    </div>` : ""}

    <!-- Validity notice -->
    <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;margin-bottom:8mm;font-size:12px;">
      <strong>Gültigkeit:</strong> Dieses Angebot ist gültig bis zum <strong>${formatDate(data.validUntil)}</strong> (${data.validDays} Tage).
      Preisänderungen und Zwischenverkauf vorbehalten.
    </div>

    ${data.notes ? `
    <div style="margin-bottom:8mm;">
      <p style="font-weight:600;margin-bottom:4px;">Anmerkungen:</p>
      <p style="color:#595959;font-size:12px;">${escapeHtml(data.notes)}</p>
    </div>` : ""}

    <!-- Closing text -->
    <p style="font-size:13px;margin-bottom:10mm;line-height:1.6;">
      Wir freuen uns auf Ihre Rückmeldung und stehen Ihnen für Rückfragen gerne zur Verfügung.<br><br>
      Mit freundlichen Grüßen<br>
      <strong>${SLT_COMPANY.brand}</strong>
    </p>

    <!-- Footer -->
    <div style="border-top:2px solid #00507d;padding-top:10px;font-size:10px;color:#595959;">
      <div style="display:flex;justify-content:space-between;">
        <div>
          <p style="font-weight:600;color:#00507d;">${SLT_COMPANY.name}</p>
          <p>${SLT_COMPANY.street}, ${SLT_COMPANY.city}</p>
          <p>Tel: ${SLT_COMPANY.phone}</p>
        </div>
        <div style="text-align:center;">
          <p>E-Mail: ${SLT_COMPANY.email}</p>
          <p>Web: ${SLT_COMPANY.web}</p>
          <p>${SLT_COMPANY.registry}</p>
        </div>
        <div style="text-align:right;">
          <p>${SLT_COMPANY.bankName}</p>
          <p>IBAN: ${SLT_COMPANY.iban}</p>
          <p>BIC: ${SLT_COMPANY.bic}</p>
        </div>
      </div>
      <p style="text-align:center;margin-top:6px;font-size:9px;">${SLT_COMPANY.registry} · GF: ${SLT_COMPANY.managingDirector}</p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
