import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { embedProductImages, normalizeImageUrl, resolveImagesByName } from "../_shared/product-images.ts";

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
        image_url: normalizeImageUrl(item.image_url),
      };
    });

    // Produktbilder serverseitig ergänzen: Positionen ohne (nutzbares) Bild
    // werden über den Produktnamen im CMS nachgeschlagen.
    const missingImageNames = offerItems.filter((i) => !i.image_url).map((i) => i.product_name);
    if (missingImageNames.length) {
      const resolved = await resolveImagesByName(serviceClient, missingImageNames);
      for (const item of offerItems) {
        if (item.image_url) continue;
        item.image_url = resolved.get((item.product_name || "").trim().toLowerCase()) || null;
      }
    }
    console.log(
      `Produktbilder: ${offerItems.filter((i) => i.image_url).length}/${offerItems.length} Positionen mit Bild`,
    );

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
        Ebenfalls im Anhang: unsere <strong>Allgemeinen Geschäfts- und Vermietbedingungen für Geschäftskunden (AGB B2B)</strong>, die diesem Angebot zugrunde liegen.
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

        // Anhang 1: Angebots-PDF
        const base64Content = encodeBase64(pdfBytes);
        const attachments: { filename: string; content: string; content_type: string }[] = [{
          filename: fileName,
          content: base64Content,
          content_type: "application/pdf",
        }];

        // Anhang 2: B2B-AGB (verpflichtend jedem Angebot beilegen)
        try {
          const { data: agbFile, error: agbError } = await serviceClient.storage
            .from("brand-assets")
            .download("legal/agb-b2b.pdf");
          let agbBytes: Uint8Array | null = null;
          if (!agbError && agbFile) {
            agbBytes = new Uint8Array(await agbFile.arrayBuffer());
          } else {
            console.error("AGB-Download aus Storage fehlgeschlagen:", agbError?.message);
            const agbResp = await fetch("https://www.slt-rental.de/b2b-documents/agb-b2b.pdf");
            if (agbResp.ok) agbBytes = new Uint8Array(await agbResp.arrayBuffer());
          }
          if (agbBytes && agbBytes.length > 0) {
            attachments.push({
              filename: "AGB-B2B-SLT-Rental.pdf",
              content: encodeBase64(agbBytes),
              content_type: "application/pdf",
            });
            console.log(`AGB angehängt (${agbBytes.length} Bytes)`);
          } else {
            console.error("AGB konnten nicht angehängt werden – Angebot wird trotzdem versendet");
          }
        } catch (agbErr: any) {
          console.error("AGB-Anhang fehlgeschlagen:", agbErr?.message);
        }


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


function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
