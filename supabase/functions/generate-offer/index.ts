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
  street: "Anrather Stra\u00DFe 291",
  city: "47807 Krefeld",
  country: "Deutschland",
  phone: "02151 417 990 4",
  email: "mieten@slt-rental.de",
  web: "www.slt-rental.de",
  registry: "Registergericht Krefeld HRA7075",
  managingDirector: "Benedikt N\u00F6chel",
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
  category_slug?: string;
}

interface OfferRequest {
  reservation_id?: string;
  b2b_profile_id?: string;
  offer_id?: string;
  items: OfferItem[];
  delivery_cost?: number;
  delivery_cost_delivery?: number;
  delivery_cost_return?: number;
  valid_days?: number;
  notes?: string;
  send_email?: boolean;
  save_as_draft?: boolean;
  save_prices?: boolean;
  skip_status_update?: boolean;
  deposit?: number;
  additional_services?: { id: string; name: string; description?: string; pricePercent?: number; customPrice?: number; applicableCategories?: string[] | null }[];
  issuing_location?: string;
  return_location?: string;
  delivery_address?: { street?: string; postal_code?: string; city?: string };
  payment_terms?: string;
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
      delivery_cost_delivery = 0,
      delivery_cost_return = 0,
      valid_days = 14,
      notes,
      send_email = true,
      save_as_draft = false,
      save_prices = true,
      skip_status_update = false,
      deposit = 0,
      additional_services: additionalServices,
      issuing_location: issuingLocation,
      return_location: returnLocation,
      delivery_address: deliveryAddress,
      payment_terms: paymentTerms,
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

    // Look up staff profile for Sachbearbeiter
    const { data: staffProfile } = await serviceClient
      .from("staff_profiles")
      .select("first_name, last_name")
      .eq("user_id", authUser.id)
      .single();
    const staffName = staffProfile
      ? `${staffProfile.first_name} ${staffProfile.last_name}`
      : authUser.email || "Admin";

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
      const startTime = item.start_time || reservation?.start_time || null;
      const endTime = item.end_time || reservation?.end_time || null;
      if (rentalStart && startTime && !rentalStart.includes(" ")) {
        rentalStart = `${rentalStart} ${startTime}`;
      }
      if (rentalEnd && endTime && !rentalEnd.includes(" ")) {
        rentalEnd = `${rentalEnd} ${endTime}`;
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

    // Calculate additional services surcharges and allocate them to matching items
    const sanitizeServiceDescription = (description?: string | null) => {
      if (!description) return undefined;
      return description
        .replace(/\s*\d+\s*%\s*des\s*Netto[^.]*\.?/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim() || undefined;
    };

    let servicesSurcharge = 0;
    const servicesWithPrices: {
      id: string;
      name: string;
      description?: string;
      pricePercent: number | null;
      amount: number;
      customPrice?: number;
      allocations: { itemIndex: number; amount: number }[];
    }[] = [];

    if (additionalServices && additionalServices.length > 0) {
      const mbvCategories = new Set(["erdbewegung", "aggregate", "arbeitsbuehnen", "verdichtung"]);
      const trailerCategories = new Set(["anhaenger"]);

      const getApplicableIndexes = (svc: { id: string; applicableCategories?: string[] | null; calculationBase?: string }) => {
        const allIndexes = offerItems.map((_, idx) => idx);
        const base = svc.calculationBase;

        if (base === "all_items" || svc.id === "kostenfreie-stornierung") return allIndexes;
        if (base === "mbv_items" || svc.id.startsWith("mbv-")) {
          return allIndexes.filter((idx) => mbvCategories.has(items[idx]?.category_slug || ""));
        }
        if (base === "trailer_items" || svc.id === "vollkasko-500" || svc.id === "vollkasko-300" || svc.id === "auslandsfahrt") {
          return allIndexes.filter((idx) => trailerCategories.has(items[idx]?.category_slug || ""));
        }

        return allIndexes.filter((idx) => {
          if (!svc.applicableCategories || svc.applicableCategories.length === 0) return true;
          const itemCategory = items[idx]?.category_slug;
          return !!(itemCategory && svc.applicableCategories.includes(itemCategory));
        });
      };

      // If NO item carries a category, category-based filtering would zero out
      // every percentage service (MBV etc.). In that case fall back to all items.
      const hasAnyCategory = items.some((it: any) => !!it?.category_slug);

      for (const svc of additionalServices) {
        let applicableIndexes = getApplicableIndexes(svc as any);
        if (applicableIndexes.length === 0 && !hasAnyCategory) {
          applicableIndexes = offerItems.map((_, idx) => idx);
        }
        const baseForService = applicableIndexes.reduce((sum, idx) => sum + (offerItems[idx]?.total_price || 0), 0);

        let amount = 0;
        if (svc.customPrice && svc.customPrice > 0) {
          amount = Math.round(svc.customPrice * 100) / 100;
        } else {
          const pct = svc.pricePercent ?? null;
          if (pct !== null && baseForService > 0) {
            amount = Math.round(baseForService * (pct / 100) * 100) / 100;
          }
        }

        const allocations: { itemIndex: number; amount: number }[] = [];
        if (amount > 0 && applicableIndexes.length > 0 && baseForService > 0) {
          let allocated = 0;
          applicableIndexes.forEach((idx, pos) => {
            const isLast = pos === applicableIndexes.length - 1;
            const rawShare = amount * ((offerItems[idx]?.total_price || 0) / baseForService);
            const share = isLast
              ? Math.round((amount - allocated) * 100) / 100
              : Math.round(rawShare * 100) / 100;
            if (share > 0) {
              allocations.push({ itemIndex: idx, amount: share });
              allocated += share;
            }
          });
        }

        // Never persist a 0 € service line — it would show up as "0,00 €" in
        // PDF/e-mail and get dropped silently when converting to an invoice.
        if (amount <= 0) continue;

        servicesWithPrices.push({
          id: svc.id,
          name: svc.name,
          description: sanitizeServiceDescription(svc.description),
          pricePercent: svc.pricePercent ?? null,
          amount,
          customPrice: svc.customPrice,
          allocations,
        });

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
      deliveryCostDelivery: delivery_cost_delivery,
      deliveryCostReturn: delivery_cost_return,
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
      staffName,
      issuingLocation: issuingLocation || reservation?.location || profile.assigned_location || "krefeld",
      returnLocation: returnLocation || undefined,
      deliveryAddress: deliveryAddress || undefined,
      paymentTerms: paymentTerms || undefined,
    });

    // Store as PDF file
    const safeName = profile.company_name.replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/Ä/g,"Ae").replace(/Ö/g,"Oe").replace(/Ü/g,"Ue").replace(/ß/g,"ss").replace(/[^a-zA-Z0-9_\- ]/g, "_").replace(/\s+/g, "_");
    const fileName = `Angebot_SLTRental_${offerNumber}_${safeName}.pdf`;
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

    const servicesData = servicesWithPrices && servicesWithPrices.length > 0
      ? servicesWithPrices
      : null;

    // Encode structured metadata into notes so edit/resend can restore exact values
    let finalNotes = notes || "";
    finalNotes = finalNotes.replace(/\[DELIVERY:[^\]]*\]/g, "").replace(/\[DELADDR:[^\]]*\]/g, "").replace(/\[PAYMENT:[^\]]*\]/g, "");
    finalNotes += `[DELIVERY:${delivery_cost_delivery || 0}|RETURN:${delivery_cost_return || 0}]`;
    if (deliveryAddress && (deliveryAddress.street || deliveryAddress.city)) {
      finalNotes += `[DELADDR:${deliveryAddress.street || ""}|${deliveryAddress.postal_code || ""}|${deliveryAddress.city || ""}]`;
    }
    if (paymentTerms) {
      finalNotes += `[PAYMENT:${paymentTerms}]`;
    }

    let offer: any;

    if (offer_id) {
      const updateStatus = save_as_draft ? "draft" : (send_email ? "sent" : "sent");
      const { data: updatedOffer, error: offerError } = await serviceClient
        .from("b2b_offers")
        .update({
          offer_date: offerDate,
          valid_until: validUntil,
          status: updateStatus,
          net_amount: netAmount,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          gross_amount: grossAmount,
          delivery_cost,
          is_reverse_charge: isReverseCharge,
          notes: finalNotes || null,
          file_url: fileUrl,
          file_name: fileName,
          email_sent: false,
          deposit: deposit || null,
          additional_services: servicesData,
          issuing_location: issuingLocation || null,
          return_location: returnLocation || null,
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
      const offerStatus = save_as_draft ? "draft" : (send_email ? "sent" : "sent");
      const { data: newOffer, error: offerError } = await serviceClient
        .from("b2b_offers")
        .insert({
          reservation_id: reservation_id || null,
          b2b_profile_id: profile.id,
          offer_number: offerNumber,
          offer_date: offerDate,
          valid_until: validUntil,
          status: offerStatus,
          net_amount: netAmount,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          gross_amount: grossAmount,
          delivery_cost,
          is_reverse_charge: isReverseCharge,
          notes: finalNotes || null,
          file_url: fileUrl,
          file_name: fileName,
          email_sent: false,
          deposit: deposit || null,
          additional_services: servicesData,
          created_by_user_id: authUser.id,
          created_by_staff_name: staffName,
          issuing_location: issuingLocation || null,
          return_location: returnLocation || null,
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

    // Update reservation status (only when finalizing, not for drafts)
    if (reservation_id && !skip_status_update && !save_as_draft) {
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
          muelheim: { name: "SLT Rental Mülheim", address: "Ruhrorter Str. 122", city: "45478 Mülheim an der Ruhr", phone: "02151 417 99 04", email: "muelheim@slt-rental.de", manager: "Andreas Mühlenhof" },
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
              ${servicesWithPrices.map(s => `<p style="font-size:13px;color:#555;margin:0 0 4px;">• ${escapeHtml(s.name)} – <strong>${formatCurrency(s.amount)}</strong></p>`).join("")}
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
          ${delivery_cost_delivery > 0 ? `<tr><td>Anlieferung:</td><td style="text-align:right;">${formatCurrency(delivery_cost_delivery)}</td></tr>` : ""}
          ${delivery_cost_return > 0 ? `<tr><td>Rücklieferung:</td><td style="text-align:right;">${formatCurrency(delivery_cost_return)}</td></tr>` : ""}
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
      ${paymentTerms === "vorkasse" ? `
      <div style="background:#f0f6fa;border:1px solid #b3d4e8;border-left:4px solid #00507d;border-radius:8px;padding:16px 18px;margin-bottom:25px;">
        <p style="font-size:14px;font-weight:700;color:#00507d;margin:0 0 8px;">Zahlung per Vorkasse</p>
        <p style="font-size:13px;color:#555;margin:0 0 10px;line-height:1.6;">
          Für dieses Angebot gilt <strong>Vorkasse</strong>. Bitte überweisen Sie den Gesamtbetrag von
          <strong>${formatCurrency(grossAmount)}</strong>${deposit && deposit > 0 ? ` (zzgl. Kaution ${formatCurrency(deposit)})` : ""}
          bis spätestens <strong>${formatDate(validUntil)}</strong> – also innerhalb der Angebotsgültigkeit – auf das unten genannte Konto.
        </p>
        <table style="width:100%;font-size:13px;color:#333;margin-bottom:10px;">
          <tr><td style="color:#64748b;padding:2px 0;">Kontoinhaber:</td><td style="padding:2px 0;font-weight:600;">${escapeHtml(SLT_COMPANY.name)}</td></tr>
          <tr><td style="color:#64748b;padding:2px 0;">Bank:</td><td style="padding:2px 0;font-weight:600;">${escapeHtml(SLT_COMPANY.bankName)}</td></tr>
          <tr><td style="color:#64748b;padding:2px 0;">IBAN:</td><td style="padding:2px 0;font-weight:600;">${escapeHtml(SLT_COMPANY.iban)}</td></tr>
          <tr><td style="color:#64748b;padding:2px 0;">BIC:</td><td style="padding:2px 0;font-weight:600;">${escapeHtml(SLT_COMPANY.bic)}</td></tr>
          <tr><td style="color:#64748b;padding:2px 0;">Verwendungszweck:</td><td style="padding:2px 0;font-weight:600;">${escapeHtml(offerNumber)}</td></tr>
        </table>
        <p style="font-size:13px;color:#555;margin:0;line-height:1.6;">
          Mit Zahlungseingang ist Ihre Buchung <strong>verbindlich bestätigt</strong> und die Mietgeräte werden für den vereinbarten Zeitraum reserviert.
          Nach Abschluss der Miete erhalten Sie die offizielle Rechnung per E-Mail.
        </p>
      </div>` : ""}
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
            cc: [loc.email],
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
  deliveryCostDelivery: number;
  deliveryCostReturn: number;
  servicesSurcharge: number;
  servicesWithPrices: { id: string; name: string; description?: string; pricePercent: number | null; amount: number; allocations?: { itemIndex: number; amount: number }[] }[];
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  grossAmount: number;
  isReverseCharge: boolean;
  notes: string | null;
  validDays: number;
  deposit: number;
  additionalServices?: any[];
  staffName: string;
  issuingLocation: string;
  returnLocation?: string;
  deliveryAddress?: { street?: string; postal_code?: string; city?: string };
  paymentTerms?: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // ── Layout-Konstanten: identisch zum Rechnungs-PDF (DIN 5008) ──
  const W = 595.28, H = 841.89;
  const ML = 57, MR = 57;
  const MT = 45, MB = 60;
  const CW = W - ML - MR;
  const BRAND = rgb(0 / 255, 80 / 255, 125 / 255);
  const ORANGE = rgb(255 / 255, 142 / 255, 2 / 255);
  const INK = rgb(0.13, 0.13, 0.15);
  const MUTED = rgb(0.48, 0.5, 0.55);
  const LINE = rgb(0.82, 0.84, 0.87);
  const ZEBRA = rgb(0.972, 0.976, 0.982);

  const ADDR_X = ML;
  const ADDR_Y_TOP = H - 105;

  const TITLE = "ANGEBOT";

  // WinAnsi-sichere Normalisierung: typografische Zeichen auf darstellbare mappen,
  // Euro-Zeichen bleibt erhalten (WinAnsi kann 0x20AC).
  const safe = (str: any) =>
    String(str ?? "")
      .replace(/[\u2010-\u2015]/g, "-")
      .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
      .replace(/[\u201C\u201D\u201E]/g, '"')
      .replace(/\u2026/g, "...")
      .replace(/\u00A0/g, " ")
      .replace(/[^\x20-\x7E\xA0-\xFF\u20AC]/g, "");

  const fm = (n: number) => {
    const abs = Math.abs(n || 0);
    const parts = abs.toFixed(2).split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (n < 0 ? "-" : "") + intPart + "," + parts[1] + " \u20AC";
  };
  const fmtDate = (d: string) => {
    if (!d) return "";
    const parts = String(d).split(" ");
    const p = parts[0].split("-");
    const dateStr = p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : parts[0];
    return parts[1] ? `${dateStr} \u00B7 ${parts[1]} Uhr` : dateStr;
  };
  const fd = fmtDate;

  const wt = (t: string, f: any, s: number, mw: number): string[] => {
    if (!t) return [""];
    const words = safe(t).split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (f.widthOfTextAtSize(test, s) <= mw) cur = test;
      else { if (cur) lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  };
  const dt = (pg: any, t: string, x: number, yy: number, f = font, s = 9.5, c = INK) => {
    try { pg.drawText(safe(t), { x, y: yy, size: s, font: f, color: c }); } catch {}
  };
  const dtr = (pg: any, t: string, xRight: number, yy: number, f = font, s = 9.5, c = INK) => {
    try {
      const txt = safe(t);
      const tw = f.widthOfTextAtSize(txt, s);
      pg.drawText(txt, { x: xRight - tw, y: yy, size: s, font: f, color: c });
    } catch {}
  };

  // Standortdaten
  const LOCATIONS: Record<string, { name: string; address: string; city: string; phone: string; email: string }> = {
    krefeld: { name: "SLT Rental Krefeld", address: "Anrather Str. 291", city: "47807 Krefeld", phone: "02151 417 990 4", email: "krefeld@slt-rental.de" },
    bonn: { name: "SLT Rental Bonn", address: "Drachenburgstr. 8", city: "53179 Bonn", phone: "0228 504 660 61", email: "bonn@slt-rental.de" },
    muelheim: { name: "SLT Rental M\u00FClheim", address: "Ruhrorter Str. 122", city: "45478 M\u00FClheim a. d. Ruhr", phone: "02151 417 990 4", email: "muelheim@slt-rental.de" },
  };
  const issuingLoc = LOCATIONS[data.issuingLocation] || LOCATIONS["krefeld"];
  const returnLoc = data.returnLocation ? LOCATIONS[data.returnLocation] : null;

  // Logo laden (Bitmap, identisch zur Rechnung)
  let logoImg: any = null;
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 3000);
    const lr = await fetch("https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png", { signal: ctrl.signal });
    clearTimeout(to);
    if (lr.ok) logoImg = await doc.embedPng(new Uint8Array(await lr.arrayBuffer()));
  } catch {}

  const pages: any[] = [];

  // ── Kopf Seite 1: Absenderzeile, Empfängeradresse, Logo rechts, Infoblock, Titel ──
  const renderHeader = (pg: any): number => {
    dt(pg, `${SLT_COMPANY.name} \u00B7 ${SLT_COMPANY.street} \u00B7 ${SLT_COMPANY.city}`, ADDR_X, ADDR_Y_TOP + 12, font, 7, MUTED);
    pg.drawRectangle({ x: ADDR_X, y: ADDR_Y_TOP + 10, width: 220, height: 0.4, color: LINE });

    let ay = ADDR_Y_TOP;
    const companyLine = data.profile.legal_form
      ? `${data.profile.company_name} ${data.profile.legal_form}`
      : data.profile.company_name;
    dt(pg, companyLine, ADDR_X, ay, bold, 10.5); ay -= 12;
    const cn = `${data.profile.contact_first_name || ""} ${data.profile.contact_last_name || ""}`.trim();
    if (cn) { dt(pg, cn, ADDR_X, ay, font, 9.5); ay -= 11; }
    dt(pg, `${data.profile.street || ""}${data.profile.house_number ? " " + data.profile.house_number : ""}`, ADDR_X, ay, font, 9.5); ay -= 11;
    dt(pg, `${data.profile.postal_code || ""} ${data.profile.city || ""}`, ADDR_X, ay, font, 9.5); ay -= 11;
    dt(pg, data.profile.country || "Deutschland", ADDR_X, ay, font, 9.5); ay -= 11;
    // USt-IdNr. nur bei Reverse Charge (wie in der Rechnung)
    if (data.isReverseCharge && data.profile.tax_id) {
      ay -= 2;
      dt(pg, `USt-IdNr.: ${data.profile.tax_id}`, ADDR_X, ay, font, 9, MUTED);
      ay -= 11;
    }

    // Logo oben rechts (~60 mm)
    let logoBottomY = H - MT;
    if (logoImg) {
      const targetW = 170;
      const scale = targetW / logoImg.width;
      const drawH = logoImg.height * scale;
      logoBottomY = H - MT - drawH;
      pg.drawImage(logoImg, { x: W - MR - targetW, y: logoBottomY, width: targetW, height: drawH });
    }

    // Infoblock rechts, zweispaltig
    const infoX = W - MR - 200;
    let iy = Math.min(ADDR_Y_TOP, logoBottomY - 26);
    const infoRow = (label: string, value: string, c = INK) => {
      dt(pg, label, infoX, iy, font, 8.5, MUTED);
      dt(pg, value, infoX + 95, iy, font, 9, c);
      iy -= 13;
    };
    const infoSub = (value: string) => {
      dt(pg, value, infoX + 95, iy + 3, font, 7, MUTED);
      iy -= 10;
    };
    infoRow("Angebotsnummer:", data.offerNumber);
    infoRow("Angebotsdatum:", fd(data.offerDate));
    infoRow("G\u00FCltig bis:", fd(data.validUntil), rgb(0.7, 0.26, 0.04));
    infoRow("Kundennummer:", String(data.profile.id).substring(0, 8).toUpperCase());
    infoRow("Ansprechpartner:", data.staffName || SLT_COMPANY.managingDirector);
    infoRow("Ausgabestandort:", issuingLoc.name);
    infoSub(`${issuingLoc.address}, ${issuingLoc.city}`);
    if (returnLoc && data.returnLocation !== data.issuingLocation) {
      infoRow("R\u00FCckgabestandort:", returnLoc.name);
      infoSub(`${returnLoc.address}, ${returnLoc.city}`);
    }
    if (data.isReverseCharge) infoRow("Verfahren:", "Reverse-Charge", BRAND);

    // Titelblock
    const contentTopY = Math.min(ay, iy) - 40;
    let ty = contentTopY;
    dt(pg, TITLE, ML, ty, bold, 30, BRAND);
    ty -= 26;
    dt(pg, `Nr. ${data.offerNumber}`, ML, ty, font, 10.5, MUTED);
    ty -= 26;

    // Lieferadresse (angebotsspezifisch)
    if (data.deliveryAddress && (data.deliveryAddress.street || data.deliveryAddress.city)) {
      dt(pg, "Lieferadresse:", ML, ty, bold, 9);
      const parts = [data.deliveryAddress.street, [data.deliveryAddress.postal_code, data.deliveryAddress.city].filter(Boolean).join(" ")].filter(Boolean) as string[];
      dt(pg, parts.join(", "), ML + 78, ty, font, 9, INK);
      ty -= 20;
    }

    // Anschreiben
    dt(pg, "Sehr geehrte Damen und Herren,", ML, ty, font, 9.5); ty -= 13;
    dt(pg, "vielen Dank f\u00FCr Ihre Anfrage. Gerne unterbreiten wir Ihnen folgendes Angebot:", ML, ty, font, 9.5);

    return ty - 30;
  };

  const renderTableHeader = (pg: any, startY: number): number => {
    const yy = startY;
    dt(pg, "Pos.", ML + 2, yy, bold, 8.5, BRAND);
    dt(pg, "Bezeichnung", ML + 32, yy, bold, 8.5, BRAND);
    dtr(pg, "Menge", ML + CW * 0.60, yy, bold, 8.5, BRAND);
    dt(pg, "Einheit", ML + CW * 0.60 + 8, yy, bold, 8.5, BRAND);
    dtr(pg, "Einzelpreis", ML + CW * 0.85, yy, bold, 8.5, BRAND);
    dtr(pg, "Gesamt", W - MR - 4, yy, bold, 8.5, BRAND);
    pg.drawRectangle({ x: ML, y: yy - 5, width: CW, height: 2, color: BRAND });
    return yy - 16;
  };

  const newPage = (isFirst: boolean): { pg: any; y: number } => {
    const pg = doc.addPage([W, H]);
    pages.push(pg);
    if (isFirst) {
      const yy = renderHeader(pg);
      return { pg, y: renderTableHeader(pg, yy) };
    }
    let yy = H - MT;
    if (logoImg) {
      const targetW = 90;
      const scale = targetW / logoImg.width;
      const drawH = logoImg.height * scale;
      pg.drawImage(logoImg, { x: W - MR - targetW, y: yy - drawH, width: targetW, height: drawH });
    }
    dt(pg, `${TITLE} \u00B7 ${data.offerNumber}`, ML, yy - 46, bold, 10, BRAND);
    yy -= 74;
    return { pg, y: renderTableHeader(pg, yy) };
  };

  let { pg, y } = newPage(true);

  const RESERVE_BOTTOM = MB + 60;
  const need = (h: number) => {
    if (y - h < RESERVE_BOTTOM) ({ pg, y } = newPage(false));
  };

  // Spalten (identisch zur Rechnung)
  const nameColX = ML + 32;
  const qtyColRight = ML + CW * 0.60;
  const unitColX = ML + CW * 0.60 + 8;
  const unitPriceRight = ML + CW * 0.85;
  const totalRight = W - MR - 4;

  const deriveUnit = (item: any, fallback = "St\u00FCck"): string => {
    if (item.unit) return item.unit;
    if (item.rental_start && item.rental_end) {
      try {
        const a = new Date(String(item.rental_start).split(" ")[0]);
        const b = new Date(String(item.rental_end).split(" ")[0]);
        const days = Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000) + 1);
        return days >= 28 && days % 7 === 0 ? "Wochen" : "Tage";
      } catch { return "Tage"; }
    }
    return fallback;
  };

  // Produktbilder vorladen
  const imageCache = new Map<string, any>();
  await Promise.all(
    data.items
      .filter((item: any) => item.image_url)
      .map(async (item: any) => {
        const url = item.image_url as string;
        if (imageCache.has(url)) return;
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 2000);
          const imgResp = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);
          if (!imgResp.ok) return;
          const contentType = imgResp.headers.get("content-type") || "";
          if (!contentType.includes("image/")) return;
          const imgBytes = new Uint8Array(await imgResp.arrayBuffer());
          imageCache.set(url, contentType.includes("png") ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes));
        } catch {}
      })
  );

  const IMG = 34;
  const hasAnyImage = data.items.some((i: any) => i.image_url && imageCache.get(i.image_url));
  const textColX = hasAnyImage ? nameColX + IMG + 8 : nameColX;
  const nameColW = qtyColRight - textColX - 12;

  const servicesByItem = new Map<number, { name: string; description?: string; amount: number }[]>();
  for (const svc of data.servicesWithPrices || []) {
    for (const alloc of svc.allocations || []) {
      const current = servicesByItem.get(alloc.itemIndex) || [];
      current.push({ name: svc.name, description: svc.description, amount: alloc.amount });
      servicesByItem.set(alloc.itemIndex, current);
    }
  }

  let posNum = 1;
  let rowZebra = false;
  const renderRow = (rowH: number, drawer: (rowTop: number) => void) => {
    need(rowH);
    if (rowZebra) pg.drawRectangle({ x: ML, y: y - rowH + 3, width: CW, height: rowH, color: ZEBRA });
    drawer(y);
    y -= rowH;
    rowZebra = !rowZebra;
  };

  // ── Positionen ──
  data.items.forEach((item: any, idx: number) => {
    const img = item.image_url ? imageCache.get(item.image_url) : null;
    let nameText = safe(item.product_name);
    if (item.discount_percent > 0) nameText += ` (${item.discount_percent}% Rabatt)`;
    const nameLines = wt(nameText, bold, 9.5, nameColW);
    const subLines: string[] = [];
    if (item.description) subLines.push(...wt(item.description, font, 8, nameColW));
    if (item.rental_start) {
      subLines.push(...wt(`Mietzeitraum: ${fd(item.rental_start)}${item.rental_end ? " - " + fd(item.rental_end) : ""}`, font, 8, nameColW));
    }
    let rowH = 10 + nameLines.length * 12 + (subLines.length ? 4 + subLines.length * 10 : 0);
    if (img) rowH = Math.max(rowH, IMG + 14);

    renderRow(rowH, (top) => {
      dt(pg, `${posNum}`, ML + 2, top - 10, font, 9);
      if (img) {
        const sc = Math.min(IMG / img.width, IMG / img.height);
        pg.drawImage(img, { x: nameColX, y: top - 8 - img.height * sc, width: img.width * sc, height: img.height * sc });
      }
      nameLines.forEach((ln, li) => dt(pg, ln, textColX, top - 10 - li * 12, bold, 9.5));
      subLines.forEach((ln, li) => dt(pg, ln, textColX, top - 10 - nameLines.length * 12 - 4 - li * 10, font, 8, MUTED));
      dtr(pg, String(item.quantity), qtyColRight, top - 10, font, 9.5);
      dt(pg, deriveUnit(item), unitColX, top - 10, font, 9.5, MUTED);
      dtr(pg, fm(item.unit_price), unitPriceRight, top - 10, font, 9.5);
      dtr(pg, fm(item.total_price), totalRight, top - 10, bold, 9.5);
    });
    posNum++;

    // Zusatzoptionen direkt unter der Position
    for (const svc of servicesByItem.get(idx) || []) {
      if (!svc.amount || svc.amount <= 0) continue;
      const svcLines = wt(`- ${svc.name}`, font, 8.5, nameColW);
      renderRow(4 + svcLines.length * 10, (top) => {
        svcLines.forEach((ln, li) => dt(pg, ln, textColX + 8, top - 8 - li * 10, font, 8.5, MUTED));
        dt(pg, "Pauschale", unitColX, top - 8, font, 8.5, MUTED);
        dtr(pg, fm(svc.amount), totalRight, top - 8, font, 8.5, MUTED);
      });
    }
  });

  // ── Logistik-Positionen ──
  const deliveryRow = (label: string, amount: number) => {
    renderRow(26, (top) => {
      dt(pg, `${posNum}`, ML + 2, top - 10, font, 9);
      dt(pg, label, textColX, top - 10, bold, 9.5);
      dtr(pg, "1", qtyColRight, top - 10, font, 9.5);
      dt(pg, "Pauschale", unitColX, top - 10, font, 9.5, MUTED);
      dtr(pg, fm(amount), unitPriceRight, top - 10, font, 9.5);
      dtr(pg, fm(amount), totalRight, top - 10, bold, 9.5);
    });
    posNum++;
  };
  if (data.deliveryCostDelivery > 0) deliveryRow("Anlieferung / Transport", data.deliveryCostDelivery);
  if (data.deliveryCostReturn > 0) deliveryRow("R\u00FCcklieferung / Abholung", data.deliveryCostReturn);
  if (data.deliveryCost > 0 && data.deliveryCostDelivery <= 0 && data.deliveryCostReturn <= 0) {
    deliveryRow("Lieferkosten", data.deliveryCost);
  }

  // ── Nicht zugeordnete Zusatzoptionen ──
  for (const svc of data.servicesWithPrices || []) {
    const allocated = (svc.allocations || []).length > 0;
    if (allocated || !svc.amount || svc.amount <= 0) continue;
    const scLines = wt(svc.name, font, 9.5, nameColW);
    renderRow(4 + scLines.length * 11, (top) => {
      dt(pg, `${posNum}`, ML + 2, top - 8, font, 9);
      scLines.forEach((ln, li) => dt(pg, ln, textColX, top - 8 - li * 11, font, 9.5));
      dtr(pg, "1", qtyColRight, top - 8, font, 9.5);
      dt(pg, "Pauschale", unitColX, top - 8, font, 9.5, MUTED);
      dtr(pg, fm(svc.amount), totalRight, top - 8, bold, 9.5);
    });
    posNum++;
  }

  pg.drawRectangle({ x: ML, y, width: CW, height: 0.5, color: LINE });
  y -= 26;

  // ── Summenblock (rechtsbündig, wie Rechnung) ──
  need(130);
  const tx = ML + CW * 0.55;
  const vx = W - MR - 4;
  const itemsTotal = data.items.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0);
  const servicesSubtotal = (data.servicesWithPrices || []).reduce((sum, svc) => sum + (svc.amount || 0), 0);
  const deliverySubtotal = (data.deliveryCostDelivery || 0) + (data.deliveryCostReturn || 0) ||
    ((data.deliveryCost > 0) ? data.deliveryCost : 0);

  if (servicesSubtotal > 0 || deliverySubtotal > 0) {
    dt(pg, "Zwischensumme Mietartikel", tx, y, font, 9, MUTED);
    dtr(pg, fm(itemsTotal), vx, y, font, 9); y -= 13;
  }
  if (servicesSubtotal > 0) {
    dt(pg, "Zwischensumme Zusatzoptionen", tx, y, font, 9, MUTED);
    dtr(pg, fm(servicesSubtotal), vx, y, font, 9); y -= 13;
  }
  if (deliverySubtotal > 0) {
    dt(pg, "Zwischensumme Logistik", tx, y, font, 9, MUTED);
    dtr(pg, fm(deliverySubtotal), vx, y, font, 9); y -= 13;
  }

  dt(pg, "Nettobetrag", tx, y, font, 9.5); dtr(pg, fm(data.netAmount), vx, y, font, 9.5); y -= 13;
  if (data.isReverseCharge) {
    dt(pg, "USt. (Reverse Charge)", tx, y, font, 9, MUTED); dtr(pg, "0,00 \u20AC", vx, y, font, 9); y -= 13;
  } else {
    dt(pg, `USt. ${data.vatRate}%`, tx, y, font, 9, MUTED); dtr(pg, fm(data.vatAmount), vx, y, font, 9); y -= 13;
  }
  if (data.deposit && data.deposit > 0) {
    dt(pg, "Kaution (umsatzsteuerfrei)", tx, y, font, 9, MUTED); dtr(pg, fm(data.deposit), vx, y, font, 9); y -= 13;
  }
  y -= 6;
  pg.drawRectangle({ x: tx - 6, y: y - 4, width: vx - tx + 10, height: 22, color: rgb(0.94, 0.96, 0.98) });
  pg.drawRectangle({ x: tx - 6, y: y + 17, width: vx - tx + 10, height: 1, color: BRAND });
  dt(pg, "Gesamtbetrag", tx, y + 4, bold, 11, BRAND);
  dtr(pg, fm(data.grossAmount), vx, y + 4, bold, 12, BRAND);
  y -= 38;

  // ── Zahlungsbedingungen ──
  const hasCreditLimit = data.profile.credit_limit && data.profile.credit_limit > 0;
  const paymentDueDays = data.profile.payment_due_days || 14;
  const PAYMENT_TEXTS: Record<string, string> = {
    vorkasse: "Zahlungsbedingungen: Vorkasse. Der Rechnungsbetrag ist vor Mietbeginn zu entrichten.",
    net_7: "Zahlungsbedingungen: Zahlung innerhalb von 7 Tagen nach Rechnungsstellung (netto).",
    net_14: "Zahlungsbedingungen: Zahlung innerhalb von 14 Tagen nach Rechnungsstellung (netto).",
    net_30: "Zahlungsbedingungen: Zahlung innerhalb von 30 Tagen nach Rechnungsstellung (netto).",
    net_60: "Zahlungsbedingungen: Zahlung innerhalb von 60 Tagen nach Rechnungsstellung (netto).",
    "50_50_14": "Zahlungsbedingungen: 50 % Vorkasse vor Mietbeginn, 50 % Restzahlung innerhalb von 14 Tagen nach Rechnungsstellung.",
  };
  const paymentText = (data.paymentTerms && PAYMENT_TEXTS[data.paymentTerms])
    ? PAYMENT_TEXTS[data.paymentTerms]
    : (hasCreditLimit
        ? `Zahlungsbedingungen: Zahlung innerhalb von ${paymentDueDays} Tagen nach Rechnungsstellung (Kreditlimit: ${fm(data.profile.credit_limit)}).`
        : "Zahlungsbedingungen: Vorkasse. Der Rechnungsbetrag ist vor Mietbeginn zu entrichten.");

  if (data.paymentTerms === "vorkasse") {
    // Zahlungskasten mit Bankdaten – Stil identisch zum Rechnungs-Zahlungshinweis
    need(120);
    const boxH = 106;
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: CW, height: boxH, color: rgb(0.995, 0.97, 0.93) });
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: 3, height: boxH, color: ORANGE });
    let by = y - 2;
    dt(pg, "Zahlungshinweis \u2013 Vorkasse", ML + 16, by, bold, 10, INK); by -= 16;
    dt(pg, `Bitte \u00FCberweisen Sie ${fm(data.grossAmount)}${data.deposit && data.deposit > 0 ? ` (zzgl. Kaution ${fm(data.deposit)})` : ""} bis sp\u00E4testens ${fd(data.validUntil)}`, ML + 16, by, font, 9, INK); by -= 12;
    dt(pg, "\u2013 innerhalb der Angebotsg\u00FCltigkeit \u2013 auf folgendes Konto:", ML + 16, by, font, 9, INK); by -= 14;
    const rows: [string, string][] = [
      ["Kontoinhaber:", SLT_COMPANY.name],
      ["Bank:", SLT_COMPANY.bankName],
      ["IBAN / BIC:", `${SLT_COMPANY.iban} | ${SLT_COMPANY.bic}`],
      ["Verwendungszweck:", data.offerNumber],
    ];
    for (const [label, value] of rows) {
      dt(pg, label, ML + 16, by, font, 8.5, MUTED);
      dt(pg, value, ML + 120, by, bold, 8.5, INK);
      by -= 11;
    }
    by -= 2;
    dt(pg, "Mit Zahlungseingang ist Ihre Buchung verbindlich best\u00E4tigt; nach Mietende erhalten Sie die Rechnung per E-Mail.", ML + 16, by, font, 8, MUTED);
    y -= boxH + 12;
  } else {
    need(50);
    const boxH = 34;
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: CW, height: boxH, color: rgb(0.995, 0.97, 0.93) });
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: 3, height: boxH, color: ORANGE });
    dt(pg, "Zahlungshinweis", ML + 16, y - 2, bold, 10, INK);
    dt(pg, paymentText.replace("Zahlungsbedingungen: ", ""), ML + 16, y - 18, font, 9, INK);
    y -= boxH + 12;
  }

  // ── Reverse-Charge-Hinweis ──
  if (data.isReverseCharge) {
    need(46);
    pg.drawRectangle({ x: ML, y: y - 30, width: CW, height: 36, color: rgb(0.94, 0.97, 0.98) });
    pg.drawRectangle({ x: ML, y: y - 30, width: 3, height: 36, color: BRAND });
    dt(pg, "Steuerschuldnerschaft des Leistungsempf\u00E4ngers", ML + 12, y - 6, bold, 9, INK);
    dt(pg, "Reverse-Charge-Verfahren gem. \u00A713b UStG \u2013 die Umsatzsteuer schuldet der Leistungsempf\u00E4nger.", ML + 12, y - 20, font, 8.5, INK);
    y -= 46;
  }

  // ── Gültigkeit ──
  need(40);
  dt(pg, "G\u00FCltigkeit:", ML, y, bold, 9);
  dt(pg, `Dieses Angebot ist g\u00FCltig bis zum ${fd(data.validUntil)} (${data.validDays} Tage).`, ML + 58, y, font, 9, INK);
  y -= 22;

  // ── Anmerkungen ──
  const visibleNotes = data.notes
    ? data.notes.replace(/\[DELIVERY:[^\]]*\]/g, "").replace(/\[DELADDR:[^\]]*\]/g, "").replace(/\[PAYMENT:[^\]]*\]/g, "").trim()
    : null;
  if (visibleNotes) {
    need(34);
    dt(pg, "Anmerkungen:", ML, y, bold, 9);
    y -= 12;
    for (const line of wt(visibleNotes, font, 8.5, CW)) {
      need(12); dt(pg, line, ML, y, font, 8.5, INK); y -= 11;
    }
    y -= 6;
  }

  // ── Grußformel ──
  need(70);
  dt(pg, "Wir freuen uns auf Ihre R\u00FCckmeldung und stehen Ihnen f\u00FCr R\u00FCckfragen gerne zur Verf\u00FCgung.", ML, y, font, 9); y -= 22;
  dt(pg, "Mit freundlichen Gr\u00FC\u00DFen", ML, y, font, 9); y -= 15;
  dt(pg, data.staffName || SLT_COMPANY.managingDirector, ML, y, bold, 9); y -= 11;
  dt(pg, SLT_COMPANY.brand, ML, y, font, 8, MUTED);

  // ── Footer auf allen Seiten (3-spaltig, identisch zur Rechnung) ──
  const total = doc.getPageCount();
  const colW = CW / 3;
  const footerCol1 = [SLT_COMPANY.name, `GF ${SLT_COMPANY.managingDirector}`, `${SLT_COMPANY.registry}`];
  const footerCol2 = [`${SLT_COMPANY.street} | ${SLT_COMPANY.city}`, `Tel: ${SLT_COMPANY.phone}`, `${SLT_COMPANY.email} | ${SLT_COMPANY.web}`];
  const footerCol3 = [`Steuer-Nr. ${SLT_COMPANY.steuerNr}`, `USt-IdNr. ${SLT_COMPANY.ustId}`, `${SLT_COMPANY.bankName} | IBAN ${SLT_COMPANY.iban}`];
  for (let i = 0; i < total; i++) {
    const p = doc.getPage(i);
    p.drawRectangle({ x: ML, y: MB + 42, width: CW, height: 0.5, color: LINE });
    const drawCol = (lines: string[], x: number) => {
      lines.forEach((ln, li) => {
        try { p.drawText(safe(ln), { x, y: MB + 32 - li * 9, size: 6.8, font, color: MUTED }); } catch {}
      });
    };
    drawCol(footerCol1, ML);
    drawCol(footerCol2, ML + colW);
    drawCol(footerCol3, ML + 2 * colW);
    if (total > 1 && i >= 1) {
      try {
        const t = `Seite ${i + 1} von ${total}`;
        const tw = font.widthOfTextAtSize(t, 7.5);
        p.drawText(t, { x: W - MR - tw, y: MB + 55, size: 7.5, font, color: MUTED });
      } catch {}
    }
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
