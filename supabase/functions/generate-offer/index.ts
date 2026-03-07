import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

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
  phone: "+49 2151 417 99 02",
  fax: "+49 2151 417 99 04",
  mobil: "+49 1578 915 08 72",
  email: "mieten@slt-rental.de",
  web: "www.slt-rental.de",
  facebook: "www.facebook.com/slt-rental",
  registry: "Registergericht Krefeld HRA7075",
  managingDirector: "Benedikt Nöchel",
  steuerNr: "117/5717/1398",
  ustId: "DE340481717",
  bankName: "Sparkasse Krefeld",
  iban: "DE65 3205 0000 0000 4784 46",
  bic: "SPKRDE33XXX",
};

interface OfferItem {
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  rental_start?: string;
  rental_end?: string;
  image_url?: string;
}

interface OfferRequest {
  reservation_id?: string;
  b2b_profile_id?: string;
  offer_id?: string;
  items: OfferItem[];
  delivery_cost?: number;
  valid_days?: number;
  notes?: string;
  send_email?: boolean;
  save_prices?: boolean;
  skip_status_update?: boolean;
  deposit?: number;
  additional_services?: { id: string; name: string; description?: string }[];
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
      b2b_profile_id: directProfileId,
      offer_id,
      items,
      delivery_cost = 0,
      valid_days = 14,
      notes,
      send_email = true,
      save_prices = true,
      skip_status_update = false,
      deposit = 0,
      additional_services: additionalServices,
    } = body;

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "items are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!reservation_id && !directProfileId) {
      return new Response(
        JSON.stringify({ error: "reservation_id or b2b_profile_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating offer for reservation:", reservation_id || "standalone", "profile:", directProfileId || "from reservation");

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let reservation: any = null;
    let profile: any = null;

    if (reservation_id) {
      const { data: resData, error: resError } = await serviceClient
        .from("b2b_reservations")
        .select("*")
        .eq("id", reservation_id)
        .single();

      if (resError || !resData) {
        console.error("Reservation not found:", resError);
        return new Response(JSON.stringify({ error: "Reservation not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      reservation = resData;

      const { data: profileData, error: profileError } = await serviceClient
        .from("b2b_profiles")
        .select("*")
        .eq("id", reservation.b2b_profile_id)
        .single();

      if (profileError || !profileData) {
        console.error("Profile not found:", profileError);
        return new Response(JSON.stringify({ error: "B2B profile not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      profile = profileData;
    } else {
      const { data: profileData, error: profileError } = await serviceClient
        .from("b2b_profiles")
        .select("*")
        .eq("id", directProfileId)
        .single();

      if (profileError || !profileData) {
        console.error("Profile not found:", profileError);
        return new Response(JSON.stringify({ error: "B2B profile not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      profile = profileData;
    }

    const isReverseCharge = !!(profile.tax_id && profile.vat_id_verified);
    const vatRate = isReverseCharge ? 0 : 19;

    const offerItems = items.map((item) => {
      const discountedPrice = item.unit_price * (1 - (item.discount_percent || 0) / 100);
      const totalPrice = Math.round(discountedPrice * item.quantity * 100) / 100;
      let rentalStart = item.rental_start || reservation?.start_date || null;
      let rentalEnd = item.rental_end || reservation?.end_date || null;
      if (rentalStart && reservation?.start_time && !rentalStart.includes(" ")) {
        rentalStart = `${rentalStart} ${reservation.start_time}`;
      }
      if (rentalEnd && reservation?.end_time && !rentalEnd.includes(" ")) {
        rentalEnd = `${rentalEnd} ${reservation.end_time}`;
      }
      return {
        product_name: item.product_name,
        description: item.description || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        total_price: totalPrice,
        rental_start: rentalStart,
        rental_end: rentalEnd,
        image_url: item.image_url || null,
      };
    });

    const itemsTotal = offerItems.reduce((sum, item) => sum + item.total_price, 0);

    // Calculate additional services surcharges
    let servicesSurcharge = 0;
    const servicesWithPrices: { id: string; name: string; description?: string; pricePercent: number | null; amount: number }[] = [];
    if (additionalServices && additionalServices.length > 0) {
      for (const svc of additionalServices) {
        const pct = svc.pricePercent ?? null;
        const amount = pct !== null ? Math.round(itemsTotal * (pct / 100) * 100) / 100 : 0;
        servicesWithPrices.push({ id: svc.id, name: svc.name, description: svc.description, pricePercent: pct, amount });
        servicesSurcharge += amount;
      }
    }
    servicesSurcharge = Math.round(servicesSurcharge * 100) / 100;

    const netAmount = Math.round((itemsTotal + delivery_cost + servicesSurcharge) * 100) / 100;
    const vatAmount = isReverseCharge ? 0 : Math.round(netAmount * (vatRate / 100) * 100) / 100;
    const grossAmount = Math.round((netAmount + vatAmount) * 100) / 100;

    let offerNumber: string;
    let offerDate: string;
    let validUntil: string;

    if (offer_id) {
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
      validUntil = new Date(Date.now() + valid_days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      console.log("Updating existing offer:", offerNumber);
    } else {
      const { data: offerNumData, error: offerNumError } = await serviceClient.rpc("generate_offer_number");

      if (offerNumError) {
        console.error("Error generating offer number:", offerNumError);
        return new Response(JSON.stringify({ error: "Failed to generate offer number" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      offerNumber = offerNumData as string;
      offerDate = new Date().toISOString().split("T")[0];
      validUntil = new Date(Date.now() + valid_days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      console.log("Offer number generated:", offerNumber);
    }

    // Generate PDF
    const pdfBytes = await generateOfferPdf({
      offerNumber,
      offerDate,
      validUntil,
      profile,
      items: offerItems,
      deliveryCost: delivery_cost,
      servicesSurcharge,
      servicesWithPrices,
      netAmount,
      vatRate,
      vatAmount,
      grossAmount,
      isReverseCharge,
      notes: notes || null,
      validDays: valid_days,
      deposit,
      additionalServices,
    });

    // Store as PDF file
    const fileName = `Angebot_SLTRental_${offerNumber}_${profile.company_name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    const filePath = `offers/${profile.id}/${fileName}`;

    const { error: uploadError } = await serviceClient.storage
      .from("b2b-invoices")
      .upload(filePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload offer file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: signedUrlData } = await serviceClient.storage
      .from("b2b-invoices")
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    const fileUrl = signedUrlData?.signedUrl || "";

    const servicesJson = additionalServices && additionalServices.length > 0
      ? JSON.stringify(additionalServices)
      : null;

    let offer: any;

    if (offer_id) {
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
          deposit: deposit || null,
          additional_services: servicesJson,
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
      await serviceClient.from("b2b_offer_items").delete().eq("offer_id", offer_id);
    } else {
      const { data: newOffer, error: offerError } = await serviceClient
        .from("b2b_offers")
        .insert({
          reservation_id: reservation_id || null,
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
          deposit: deposit || null,
          additional_services: servicesJson,
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

    // Save customer-specific prices
    if (save_prices) {
      for (const item of items) {
        const { error: priceError } = await serviceClient
          .from("b2b_customer_prices")
          .upsert(
            {
              b2b_profile_id: profile.id,
              product_name: item.product_name,
              product_id: reservation?.product_id || null,
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

    // Update reservation status
    if (reservation_id && !skip_status_update) {
      await serviceClient
        .from("b2b_reservations")
        .update({
          status: "offer_sent",
          original_price: offerItems[0]?.unit_price || null,
          discounted_price: offerItems[0]?.total_price || null,
        })
        .eq("id", reservation_id);
    }

    // Send email via Resend
    let emailSent = false;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey && send_email) {
      try {
        const customerEmail = profile.contact_email;
        const customerName = `${profile.contact_first_name} ${profile.contact_last_name}`;

        const LOCATIONS: Record<string, { name: string; address: string; city: string; phone: string; email: string; manager: string }> = {
          krefeld: { name: "SLT Rental Krefeld", address: "Anrather Straße 291", city: "47807 Krefeld", phone: "02151 417 99 04", email: "krefeld@slt-rental.de", manager: "Benedikt Nöchel" },
          bonn: { name: "SLT Rental Bonn", address: "Drachenburgstraße 8", city: "53179 Bonn", phone: "0228 504 660 61", email: "bonn@slt-rental.de", manager: "Ersel Uzun" },
          muelheim: { name: "SLT Rental Mülheim", address: "Ruhrorter Str. 122", city: "45478 Mülheim an der Ruhr", phone: "02151 417 99 04", email: "muelheim@slt-rental.de", manager: "Andreas Scherzow" },
        };
        const loc = LOCATIONS[profile.assigned_location || ""] || LOCATIONS["krefeld"];

        const formatDate = (dateStr: string) => {
          const parts = dateStr.split(" ");
          const datePart = parts[0];
          const timePart = parts[1] || null;
          const d = new Date(datePart + "T00:00:00");
          const ds = d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
          return timePart ? `${ds} ${timePart} Uhr` : ds;
        };

        const formatCurrency = (n: number) =>
          n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

        const itemsHtml = offerItems.map(item => {
          const rentalInfo = item.rental_start && item.rental_end
            ? ` <span style="font-size:12px;color:#94a3b8;">(${formatDate(item.rental_start)} – ${formatDate(item.rental_end)})</span>`
            : "";
          return `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;">${escapeHtml(item.product_name)}${rentalInfo}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:14px;">${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:14px;">${formatCurrency(item.unit_price)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:14px;font-weight:600;">${formatCurrency(item.total_price)}</td>
          </tr>`;
        }).join("");

        const allStarts = offerItems.map(i => i.rental_start).filter(Boolean);
        const allEnds = offerItems.map(i => i.rental_end).filter(Boolean);
        const rentalPeriodHtml = allStarts.length > 0 && allEnds.length > 0
          ? `<div style="background:#eef6fc;border:1px solid #b3d4e8;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
              <p style="font-size:13px;color:#00507d;margin:0;">
                📅 Mietzeitraum: <strong>${formatDate(allStarts.sort()[0]!)}</strong> bis <strong>${formatDate(allEnds.sort().reverse()[0]!)}</strong>
              </p>
            </div>`
          : "";

        const depositHtml = deposit && deposit > 0
          ? `<tr><td style="font-size:13px;color:#555;">zzgl. Kaution:</td><td style="text-align:right;font-size:13px;font-weight:600;">${formatCurrency(deposit)}</td></tr>`
          : "";

        // Build services HTML for email
        const servicesEmailHtml = servicesWithPrices.length > 0
          ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
              <p style="font-size:13px;font-weight:600;color:#166534;margin:0 0 8px;">Zusatzleistungen:</p>
              ${servicesWithPrices.map(s => `<p style="font-size:13px;color:#555;margin:0 0 4px;">• ${escapeHtml(s.name)}${s.amount > 0 ? ` – <strong>${formatCurrency(s.amount)}</strong> (${s.pricePercent}%)` : ' – inklusive'}</p>`).join("")}
            </div>`
          : "";

        const logoUrl = "https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png";

        const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:25px 40px;text-align:center;border-bottom:3px solid #00507d;">
      <img src="${logoUrl}" alt="SLT-Rental Logo" style="height:70px;width:auto;" />
    </div>
    <div style="background:#00507d;padding:14px 40px;text-align:center;">
      <p style="color:#ffffff;margin:0;font-size:15px;font-weight:600;">Ihr individuelles Angebot – ${offerNumber}</p>
    </div>
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;margin-bottom:20px;">
        Guten Tag ${escapeHtml(customerName)},
      </p>
      <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:25px;">
        vielen Dank für Ihre Anfrage. Wir haben ein individuelles Angebot für Sie erstellt:
      </p>
      ${rentalPeriodHtml}
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
      ${servicesEmailHtml}
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:25px;">
        <table style="width:100%;font-size:14px;color:#555;">
          <tr><td>Zwischensumme Mietgeräte:</td><td style="text-align:right;font-weight:600;">${formatCurrency(itemsTotal)}</td></tr>
          ${delivery_cost > 0 ? `<tr><td>Transportkosten:</td><td style="text-align:right;">${formatCurrency(delivery_cost)}</td></tr>` : ""}
          ${servicesSurcharge > 0 ? `<tr><td>Zusatzleistungen:</td><td style="text-align:right;">${formatCurrency(servicesSurcharge)}</td></tr>` : ""}
          <tr><td style="font-weight:600;">Nettobetrag:</td><td style="text-align:right;font-weight:600;">${formatCurrency(netAmount)}</td></tr>
          ${isReverseCharge
            ? `<tr><td style="font-size:12px;color:#64748b;">USt. (Reverse-Charge):</td><td style="text-align:right;font-size:12px;color:#64748b;">${formatCurrency(0)}</td></tr>`
            : `<tr><td>zzgl. ${vatRate}% USt.:</td><td style="text-align:right;">${formatCurrency(vatAmount)}</td></tr>`}
          <tr style="border-top:2px solid #00507d;"><td style="padding-top:8px;font-size:18px;color:#00507d;font-weight:700;">Gesamtbetrag (Brutto):</td><td style="text-align:right;padding-top:8px;font-size:18px;color:#00507d;font-weight:700;">${formatCurrency(grossAmount)}</td></tr>
          ${depositHtml}
        </table>
      </div>
      <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:12px 16px;margin-bottom:25px;">
        <p style="font-size:13px;color:#92400e;margin:0;">
          ⏰ Dieses Angebot ist gültig bis zum <strong>${formatDate(validUntil)}</strong>.
        </p>
      </div>
      <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:25px;">
        Das vollständige Angebotsdokument (Nr. <strong>${offerNumber}</strong>) finden Sie als PDF im Anhang dieser E-Mail sowie in Ihrem B2B-Portal.
      </p>
      <div style="background:#eef6fc;border:1px solid #b3d4e8;border-radius:8px;padding:14px 18px;margin-bottom:25px;">
        <p style="font-size:14px;color:#00507d;margin:0;line-height:1.6;">
          Es würde uns freuen, wenn Ihnen unser Angebot zusagt. Wir bitten Sie, das Angebot direkt in Ihrem <strong>B2B-Portal</strong> zu bestätigen.
        </p>
      </div>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://www.slt-rental.de/b2b/reservations"
           style="display:inline-block;background:#00507d;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:14px;font-weight:600;">
          Zum B2B-Portal →
        </a>
      </div>
    </div>
    <div style="background:#f1f5f9;padding:25px 40px;border-top:1px solid #e2e8f0;">
      <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600;">${loc.name}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">${loc.address}, ${loc.city}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">Tel: ${loc.phone} · E-Mail: ${loc.email}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;">Ihr Ansprechpartner: ${loc.manager}</p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">www.slt-rental.de</p>
    </div>
  </div>
</body>
</html>`;

        // Attach PDF
        const base64Content = encodeBase64(pdfBytes);
        const attachments = [{
          filename: fileName,
          content: base64Content,
          content_type: "application/pdf",
        }];

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
            to: [customerEmail],
            subject: `Ihr Angebot von SLT Rental - ${offerNumber} ${offerItems.map((i: any) => i.product_name).join(", ")}`,
            html: emailHtml,
            attachments,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log("Offer email sent to:", customerEmail);

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

// ─── PDF Offer Generator ───────────────────────────────────
async function generateOfferPdf(data: {
  offerNumber: string;
  offerDate: string;
  validUntil: string;
  profile: any;
  items: any[];
  deliveryCost: number;
  servicesSurcharge: number;
  servicesWithPrices: { id: string; name: string; description?: string; pricePercent: number | null; amount: number }[];
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  grossAmount: number;
  isReverseCharge: boolean;
  notes: string | null;
  validDays: number;
  deposit: number;
  additionalServices?: any[];
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;
  const blue = rgb(0, 0.314, 0.49);
  const gray = rgb(0.35, 0.35, 0.35);
  const lightGray = rgb(0.6, 0.6, 0.6);
  const black = rgb(0.22, 0.24, 0.27);
  const white = rgb(1, 1, 1);

  const fmtCurrency = (n: number) => {
    const abs = Math.abs(n);
    const parts = abs.toFixed(2).split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (n < 0 ? "-" : "") + intPart + "," + parts[1] + " EUR";
  };

  const fmtDate = (d: string) => {
    // Handle "YYYY-MM-DD HH:MM" or "YYYY-MM-DD"
    const parts = d.split(" ");
    const datePart = parts[0];
    const timePart = parts[1] || null;
    const dt = new Date(datePart + "T00:00:00");
    const dateStr = dt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    return timePart ? `${dateStr} ${timePart} Uhr` : dateStr;
  };

  const safe = (str: string) => str.replace(/[^\x20-\x7E\xA0-\xFF]/g, "");

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - 50;

  const drawText = (str: string, x: number, yPos: number, opts: { f?: any; s?: number; c?: any } = {}) => {
    page.drawText(safe(str), { x, y: yPos, font: opts.f || font, size: opts.s || 10, color: opts.c || black });
  };

  const drawTextRight = (str: string, rightX: number, yPos: number, opts: { f?: any; s?: number; c?: any } = {}) => {
    const f = opts.f || font;
    const s = opts.s || 10;
    const t = safe(str);
    const w = f.widthOfTextAtSize(t, s);
    page.drawText(t, { x: rightX - w, y: yPos, font: f, size: s, color: opts.c || black });
  };

  const ensureSpace = (needed: number) => {
    if (y < needed) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - 50;
    }
  };

  // ── HEADER ──
  drawText("SLT Technology Group GmbH & Co. KG", margin, y, { f: fontBold, s: 12, c: blue });
  y -= 14;
  drawText("SLT-Rental", margin, y, { f: fontBold, s: 9, c: gray });
  drawTextRight("ANGEBOT", pageWidth - margin, pageHeight - 50, { f: fontBold, s: 22, c: black });
  drawTextRight("Nr. " + data.offerNumber, pageWidth - margin, pageHeight - 68, { s: 11, c: gray });
  y -= 8;
  page.drawRectangle({ x: margin, y, width: contentWidth, height: 2.5, color: blue });
  y -= 20;

  // ── SENDER LINE ──
  drawText(safe(SLT_COMPANY.name) + " | " + safe(SLT_COMPANY.street) + " | " + safe(SLT_COMPANY.city), margin, y, { s: 7, c: lightGray });
  y -= 4;
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  y -= 20;

  // ── ADDRESS BLOCK ──
  const addrY = y;
  drawText(safe(data.profile.company_name), margin, y, { f: fontBold, s: 11 });
  y -= 14;
  if (data.profile.legal_form) {
    drawText(safe(data.profile.legal_form), margin, y, { s: 9, c: gray });
    y -= 13;
  }
  const street = (data.profile.street || "") + (data.profile.house_number ? " " + data.profile.house_number : "");
  drawText(safe(street), margin, y, { s: 10 });
  y -= 13;
  drawText(safe((data.profile.postal_code || "") + " " + (data.profile.city || "")), margin, y, { s: 10 });
  y -= 13;
  drawText(safe(data.profile.country || "Deutschland"), margin, y, { s: 10 });
  y -= 13;
  if (data.profile.tax_id) {
    drawText("USt-IdNr.: " + safe(data.profile.tax_id) + (data.isReverseCharge ? " (verifiziert)" : ""), margin, y, { s: 9, c: gray });
    y -= 13;
  }

  // ── METADATA (right side) ──
  let metaY = addrY;
  const metaLabelX = 380;
  const metaValX = pageWidth - margin;
  drawText("Angebotsdatum:", metaLabelX, metaY, { s: 9, c: gray });
  drawTextRight(fmtDate(data.offerDate), metaValX, metaY, { s: 9 });
  metaY -= 14;
  drawText("Gueltig bis:", metaLabelX, metaY, { s: 9, c: gray });
  drawTextRight(fmtDate(data.validUntil), metaValX, metaY, { s: 9, c: rgb(0.7, 0.26, 0.04) });
  metaY -= 14;
  drawText("Kundennr.:", metaLabelX, metaY, { s: 9, c: gray });
  drawTextRight(data.profile.id.substring(0, 8).toUpperCase(), metaValX, metaY, { s: 9 });
  if (data.isReverseCharge) {
    metaY -= 14;
    drawText("Verfahren:", metaLabelX, metaY, { s: 9, c: gray });
    drawTextRight("Reverse-Charge", metaValX, metaY, { s: 9, c: blue });
  }

  y -= 20;

  // ── INTRO TEXT ──
  drawText("Sehr geehrte Damen und Herren,", margin, y, { s: 10 });
  y -= 14;
  drawText("vielen Dank fuer Ihre Anfrage. Gerne unterbreiten wir Ihnen folgendes Angebot:", margin, y, { s: 10 });
  y -= 25;

  // ── ITEMS TABLE HEADER ──
  page.drawRectangle({ x: margin, y: y - 4, width: contentWidth, height: 20, color: blue });
  const hdrY = y;
  drawText("Pos.", margin + 4, hdrY, { f: fontBold, s: 8, c: white });
  drawText("Bezeichnung", margin + 34, hdrY, { f: fontBold, s: 8, c: white });
  drawText("Menge", margin + 265, hdrY, { f: fontBold, s: 8, c: white });
  drawTextRight("Einzelpreis", margin + 380, hdrY, { f: fontBold, s: 8, c: white });
  drawText("Rabatt", margin + 390, hdrY, { f: fontBold, s: 8, c: white });
  drawTextRight("Gesamt", pageWidth - margin - 4, hdrY, { f: fontBold, s: 8, c: white });
  y -= 22;

  // ── ITEM ROWS ──
  for (let i = 0; i < data.items.length; i++) {
    ensureSpace(60);
    const item = data.items[i];
    const rowY = y;

    drawText(String(i + 1), margin + 4, rowY, { s: 9 });

    const pName = safe(item.product_name).substring(0, 45);
    drawText(pName, margin + 34, rowY, { f: fontBold, s: 9 });

    let subY = rowY;
    if (item.rental_start) {
      subY -= 11;
      const period = fmtDate(item.rental_start) + (item.rental_end ? " - " + fmtDate(item.rental_end) : "");
      drawText(period, margin + 34, subY, { s: 7, c: lightGray });
    }
    if (item.description) {
      subY -= 11;
      drawText(safe(item.description).substring(0, 55), margin + 34, subY, { s: 7, c: gray });
    }

    drawText(String(item.quantity), margin + 275, rowY, { s: 9 });
    drawTextRight(fmtCurrency(item.unit_price), margin + 380, rowY, { s: 9 });
    drawText(item.discount_percent > 0 ? item.discount_percent + "%" : "-", margin + 400, rowY, { s: 9 });
    drawTextRight(fmtCurrency(item.total_price), pageWidth - margin - 4, rowY, { s: 9 });

    y = subY - 8;
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
    y -= 12;
  }

  // ── DELIVERY ROW ──
  if (data.deliveryCost > 0) {
    ensureSpace(40);
    drawText("Lieferung / Transport", margin + 34, y, { f: fontBold, s: 9 });
    drawText("1", margin + 275, y, { s: 9 });
    drawTextRight(fmtCurrency(data.deliveryCost), margin + 380, y, { s: 9 });
    drawTextRight(fmtCurrency(data.deliveryCost), pageWidth - margin - 4, y, { s: 9 });
    y -= 8;
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
    y -= 15;
  }

  y -= 10;
  ensureSpace(120);

  // ── TOTALS ──
  const totX = 380;
  drawText("Nettobetrag:", totX, y, { s: 10, c: gray });
  drawTextRight(fmtCurrency(data.netAmount), pageWidth - margin, y, { s: 10 });
  y -= 16;

  if (data.isReverseCharge) {
    drawText("USt. (Reverse-Charge):", totX, y, { s: 10, c: gray });
    drawTextRight(fmtCurrency(0), pageWidth - margin, y, { s: 10 });
  } else {
    drawText("USt. (" + data.vatRate + "%):", totX, y, { s: 10, c: gray });
    drawTextRight(fmtCurrency(data.vatAmount), pageWidth - margin, y, { s: 10 });
  }
  y -= 5;
  page.drawLine({ start: { x: totX, y }, end: { x: pageWidth - margin, y }, thickness: 1.5, color: blue });
  y -= 16;

  drawText("Bruttobetrag:", totX, y, { f: fontBold, s: 14, c: blue });
  drawTextRight(fmtCurrency(data.grossAmount), pageWidth - margin, y, { f: fontBold, s: 14, c: blue });
  y -= 20;

  // ── DEPOSIT ──
  if (data.deposit && data.deposit > 0) {
    drawText("zzgl. Kaution:", totX, y, { s: 10, c: gray });
    drawTextRight(fmtCurrency(data.deposit), pageWidth - margin, y, { s: 10 });
    y -= 20;
  }

  y -= 10;

  // ── REVERSE CHARGE NOTE ──
  if (data.isReverseCharge) {
    ensureSpace(50);
    page.drawRectangle({ x: margin, y: y - 8, width: contentWidth, height: 32, color: rgb(0.94, 0.97, 0.98) });
    page.drawRectangle({ x: margin, y: y - 8, width: 3, height: 32, color: blue });
    drawText("Hinweis: Steuerschuldnerschaft des Leistungsempfaengers (Reverse-Charge-Verfahren", margin + 10, y + 10, { s: 8 });
    drawText("gem. 13b UStG). Die Umsatzsteuer ist vom Leistungsempfaenger zu entrichten.", margin + 10, y, { s: 8 });
    y -= 45;
  }

  // ── VALIDITY ──
  ensureSpace(40);
  page.drawRectangle({ x: margin, y: y - 6, width: contentWidth, height: 22, color: rgb(1, 0.98, 0.92) });
  page.drawRectangle({ x: margin, y: y - 6, width: 3, height: 22, color: rgb(0.96, 0.62, 0.04) });
  drawText("Gueltigkeit: Dieses Angebot ist gueltig bis zum " + fmtDate(data.validUntil) + " (" + data.validDays + " Tage).", margin + 10, y + 2, { s: 8 });
  y -= 35;

  // ── ADDITIONAL SERVICES ──
  if (data.additionalServices && data.additionalServices.length > 0) {
    ensureSpace(50);
    drawText("Zusatzleistungen:", margin, y, { f: fontBold, s: 10 });
    y -= 14;
    for (const svc of data.additionalServices) {
      ensureSpace(20);
      drawText("- " + safe(svc.name), margin + 8, y, { s: 9, c: gray });
      y -= 12;
    }
    y -= 8;
  }

  // ── NOTES ──
  if (data.notes) {
    ensureSpace(40);
    drawText("Anmerkungen:", margin, y, { f: fontBold, s: 10 });
    y -= 14;
    const words = safe(data.notes).split(" ");
    let line = "";
    for (const word of words) {
      const test = line + (line ? " " : "") + word;
      if (font.widthOfTextAtSize(test, 9) > contentWidth) {
        drawText(line, margin, y, { s: 9, c: gray });
        y -= 12;
        ensureSpace(30);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      drawText(line, margin, y, { s: 9, c: gray });
      y -= 18;
    }
  }

  // ── CLOSING ──
  ensureSpace(60);
  drawText("Wir freuen uns auf Ihre Rueckmeldung und stehen Ihnen", margin, y, { s: 9 });
  y -= 12;
  drawText("fuer Rueckfragen gerne zur Verfuegung.", margin, y, { s: 9 });
  y -= 20;
  drawText("Mit freundlichen Gruessen", margin, y, { s: 9 });
  y -= 14;
  drawText("SLT-Rental", margin, y, { f: fontBold, s: 9 });

  // ── FOOTER on every page ──
  const pages = doc.getPages();
  for (const p of pages) {
    const fy = 42;
    p.drawLine({ start: { x: margin, y: fy + 14 }, end: { x: pageWidth - margin, y: fy + 14 }, thickness: 1.5, color: blue });
    const footerLines = [
      safe(`${SLT_COMPANY.name} - GF: ${SLT_COMPANY.managingDirector} - Tel: ${SLT_COMPANY.phone} - FAX: ${SLT_COMPANY.fax} - Mobil: ${SLT_COMPANY.mobil}`),
      safe(`${SLT_COMPANY.street} - ${SLT_COMPANY.city} - Steuer-Nr. ${SLT_COMPANY.steuerNr} - USt-ID ${SLT_COMPANY.ustId} - ${SLT_COMPANY.registry}`),
      safe(`${SLT_COMPANY.bankName} - IBAN: ${SLT_COMPANY.iban} - BIC: ${SLT_COMPANY.bic} - Kontoinhaber: ${SLT_COMPANY.name}`),
      safe(`${SLT_COMPANY.web} - ${SLT_COMPANY.email} - ${SLT_COMPANY.facebook}`),
    ];
    footerLines.forEach((line, i) => {
      const tw = font.widthOfTextAtSize(line, 6);
      p.drawText(line, { x: (pageWidth - tw) / 2, y: fy - i * 8, font, size: 6, color: lightGray });
    });
  }

  return await doc.save();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
