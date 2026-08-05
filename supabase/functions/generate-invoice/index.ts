import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { embedProductImages, normalizeImageUrl, resolveImagesByName } from "../_shared/product-images.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// SLT Corporate Design constants
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

type PaymentTerms = 'vorkasse' | 'net_7' | 'net_14' | 'net_30';

interface InvoiceRequest {
  reservation_id?: string;
  b2b_profile_id?: string;
  custom_items?: Array<{
    product_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    discount_percent?: number;
    rental_start?: string;
    rental_end?: string;
    image_url?: string;
    item_type?: 'product' | 'service' | 'surcharge' | 'deposit';
    parent_item_index?: number;
  }>;
  delivery_cost?: number;
  payment_due_days?: number;
  payment_terms?: PaymentTerms;
  source_offer_id?: string;
  finalize_invoice_id?: string;
  notes?: string;
  image_url?: string;
  is_correction?: boolean;
  original_invoice_number?: string;
  send_email?: boolean;
  is_proforma?: boolean;
  save_as_draft?: boolean;
  delivery_address?: { street?: string; postal_code?: string; city?: string };
}

function daysForTerms(t: PaymentTerms | null | undefined): number {
  switch (t) {
    case 'vorkasse': return 0;
    case 'net_7': return 7;
    case 'net_30': return 30;
    case 'net_14':
    default: return 14;
  }
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

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authUser.id;

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: InvoiceRequest = await req.json();
    const { reservation_id, b2b_profile_id: directProfileId, custom_items, delivery_cost = 0, payment_due_days: bodyPaymentDueDays, payment_terms: bodyPaymentTerms, source_offer_id, finalize_invoice_id, notes, image_url: fallbackImageUrl, is_correction = false, original_invoice_number, send_email = true, is_proforma = false, save_as_draft = false, delivery_address: deliveryAddress } = body;

    // ─── FINALIZE MODE: turn an existing draft into a real invoice ───
    if (finalize_invoice_id) {
      const serviceClient2 = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: draft, error: draftErr } = await serviceClient2
        .from("b2b_invoices").select("*").eq("id", finalize_invoice_id).single();
      if (draftErr || !draft) {
        return new Response(JSON.stringify({ error: "Draft not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (draft.status !== 'draft') {
        return new Response(JSON.stringify({ error: "Invoice is not a draft" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: draftItems } = await serviceClient2
        .from("b2b_invoice_items").select("*").eq("invoice_id", draft.id);
      const { data: draftProfile } = await serviceClient2
        .from("b2b_profiles").select("*").eq("id", draft.b2b_profile_id).single();

      if (!draftProfile) {
        return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Assign invoice number
      const { data: numData, error: numErr } = await serviceClient2.rpc("generate_invoice_number");
      if (numErr) {
        console.error("Number gen error:", numErr);
        return new Response(JSON.stringify({ error: "Failed to generate invoice number" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const finalNumber = numData as string;
      const finalDate = new Date().toISOString().split("T")[0];
      const effTerms: PaymentTerms = (bodyPaymentTerms ?? draft.payment_terms ?? 'net_14') as PaymentTerms;
      const dueDays = daysForTerms(effTerms);
      const finalDueDate = new Date(Date.now() + dueDays * 86400000).toISOString().split("T")[0];

      // Build PDF from stored items – respect item_type so services/surcharges render in their own blocks
      const allDraftItems = draftItems || [];
      const draftProducts = allDraftItems.filter((i: any) => (i.item_type || 'product') === 'product');
      const draftServices = allDraftItems.filter((i: any) => i.item_type === 'service');
      const draftSurcharges = allDraftItems.filter((i: any) => i.item_type === 'surcharge');

      const pdfBytes = await generateDocumentPdf({
        title: "Rechnung",
        documentNumber: finalNumber,
        date: finalDate,
        profile: draftProfile,
        productItems: draftProducts.map((it: any, idx: number) => ({
          name: it.product_name,
          description: it.description || undefined,
          quantity: it.quantity,
          unitPrice: it.unit_price,
          totalPrice: it.total_price,
          discount: it.discount_percent,
          rentalStart: it.rental_start,
          rentalEnd: it.rental_end,
          itemIndex: idx,
          imageUrl: it.image_url || null,
        })),
        serviceItems: draftServices.map((it: any) => ({
          name: it.product_name,
          description: it.description || undefined,
          amount: Number(it.total_price),
          parentItemIndex: it.parent_item_index ?? undefined,
        })),
        surchargeItems: draftSurcharges.map((it: any) => ({
          name: it.product_name,
          description: it.description || undefined,
          amount: Number(it.total_price),
        })),
        sections: notes ? [{ label: "Bemerkungen", value: notes }] : (draft.notes ? [{ label: "Bemerkungen", value: draft.notes }] : []),
        totals: {
          net: Number(draft.net_amount),
          vatRate: Number(draft.vat_rate),
          vat: Number(draft.vat_amount),
          gross: Number(draft.gross_amount),
          deliveryCost: Number(draft.delivery_cost || 0),
          isReverseCharge: !!draft.is_reverse_charge,
          paymentDueDays: dueDays,
          dueDate: finalDueDate,
        },
        isProforma: false,
      });


      const safeName = draftProfile.company_name.replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/Ä/g,"Ae").replace(/Ö/g,"Oe").replace(/Ü/g,"Ue").replace(/ß/g,"ss").replace(/[^a-zA-Z0-9_\- ]/g, "_").replace(/\s+/g, "_");
      const fileName = `Rechnung_SLTRental_${finalNumber}_${safeName}.pdf`;
      const filePath = `invoices/${draftProfile.id}/${fileName}`;
      const { error: upErr } = await serviceClient2.storage.from("b2b-invoices").upload(filePath, pdfBytes, { contentType: "application/pdf", upsert: true });
      if (upErr) {
        console.error("Upload err:", upErr);
        return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: signed } = await serviceClient2.storage.from("b2b-invoices").createSignedUrl(filePath, 60 * 60 * 24 * 365);
      const fileUrl = signed?.signedUrl || "";

      // UPDATE draft → open (Trigger compute_invoice_due_date ist alleinige Quelle für due_date)
      const { error: updErr } = await serviceClient2.from("b2b_invoices").update({
        invoice_number: finalNumber,
        invoice_date: finalDate,
        status: 'open',
        payment_terms: effTerms,
        payment_due_days: dueDays,
        file_url: fileUrl,
        file_name: fileName,
        notes: notes ?? draft.notes,
      }).eq("id", draft.id);
      if (updErr) {
        console.error("Finalize update err:", updErr);
        return new Response(JSON.stringify({ error: updErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Optionally send email via existing send-invoice-email
      let emailSent = false;
      if (send_email) {
        try {
          const invokeRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-invoice-email`, {
            method: "POST",
            headers: { Authorization: authHeader, "Content-Type": "application/json" },
            body: JSON.stringify({ invoice_id: draft.id }),
          });
          emailSent = invokeRes.ok;
          if (!invokeRes.ok) console.error("Email send failed:", await invokeRes.text());
        } catch (e) {
          console.error("Email send exception:", e);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        invoice: { id: draft.id, invoice_number: finalNumber, gross_amount: Number(draft.gross_amount), file_url: fileUrl, due_date: finalDueDate },
        email_sent: emailSent,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }


    if (!reservation_id && !directProfileId) {
      return new Response(JSON.stringify({ error: "reservation_id or b2b_profile_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating invoice for", reservation_id ? `reservation: ${reservation_id}` : `profile: ${directProfileId}`);

    let reservation: any = null;
    let profile: any = null;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (reservation_id) {
      // Fetch reservation
      const { data: resData, error: resError } = await supabase
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

      // Fetch B2B profile via reservation
      const { data: profileData, error: profileError } = await supabase
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
      // Direct profile-based invoice (standalone, e.g. proforma from offer)
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

    // Proforma invoices are always prepayment (Vorkasse) with 0 days
    const payment_due_days = is_proforma ? 0 : (bodyPaymentDueDays ?? profile.payment_due_days ?? 14);

    // Determine reverse charge status
    const isReverseCharge = !!(profile.tax_id && profile.vat_id_verified);
    const vatRate = isReverseCharge ? 0 : 19;

    // Build invoice items
    let items;
    if (custom_items && custom_items.length > 0) {
      items = custom_items.map((item) => {
        const discountedPrice = item.unit_price * (1 - (item.discount_percent || 0) / 100);
        const totalPrice = discountedPrice * item.quantity;
        return {
          product_name: item.product_name,
          description: item.description || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent || 0,
          total_price: Math.round(totalPrice * 100) / 100,
          rental_start: item.rental_start || reservation?.start_date || null,
          rental_end: item.rental_end || reservation?.end_date || null,
          image_url: normalizeImageUrl(item.image_url || fallbackImageUrl),
          item_type: item.item_type || 'product',
          parent_item_index: item.parent_item_index,
        };
      });
    } else if (reservation) {
      // Auto-generate items: check for grouped rentals (rental_group_id)
      let allReservations = [reservation];

      if (reservation.rental_group_id) {
        console.log("Fetching grouped reservations for rental_group_id:", reservation.rental_group_id);
        const { data: groupedRes, error: groupError } = await supabase
          .from("b2b_reservations")
          .select("*")
          .eq("rental_group_id", reservation.rental_group_id);

        if (!groupError && groupedRes && groupedRes.length > 0) {
          allReservations = groupedRes;
          console.log(`Found ${allReservations.length} reservations in group`);
        }
      }

      items = allReservations.map((res: any) => {
        const quantity = res.quantity || 1;
        const unitPrice = res.original_price || 0;
        const discountPercent = res.discounted_price != null && res.original_price && res.original_price > 0
          ? Math.round((1 - res.discounted_price / res.original_price) * 100)
          : 0;
        const effectiveUnitPrice = res.discounted_price != null ? res.discounted_price : unitPrice;
        const totalPrice = Math.round(effectiveUnitPrice * quantity * 100) / 100;

        return {
          product_name: res.product_name || res.product_id,
          description: `Mietzeitraum: ${res.start_date}${res.end_date ? " bis " + res.end_date : ""}`,
          quantity: quantity,
          unit_price: unitPrice,
          discount_percent: discountPercent,
          total_price: totalPrice,
          rental_start: res.start_date,
          rental_end: res.end_date,
          image_url: normalizeImageUrl(fallbackImageUrl),
        };
      });
    } else {
      return new Response(JSON.stringify({ error: "custom_items required when no reservation_id is provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Separate deposit items (tax-free) from regular items
    const depositItems = is_proforma ? items.filter(i => i.product_name === "Kaution") : [];
    const taxableItems = is_proforma ? items.filter(i => i.product_name !== "Kaution") : items;
    const depositTotal = depositItems.reduce((sum, item) => sum + item.total_price, 0);
    
    // Calculate totals (only on taxable items)
    const itemsTotal = taxableItems.reduce((sum, item) => sum + item.total_price, 0);
    const netAmount = Math.round((itemsTotal + delivery_cost) * 100) / 100;
    const vatAmount = isReverseCharge ? 0 : Math.round(netAmount * (vatRate / 100) * 100) / 100;
    const grossAmount = Math.round((netAmount + vatAmount + depositTotal) * 100) / 100;

    // serviceClient already created above

    // Generate invoice number (skip for drafts – numbers are only assigned on finalize)
    let invoiceNumber: string | null = null;
    let invoiceDate: string | null = null;
    let dueDate: string | null = null;
    let fileUrl = "";
    let fileName: string | null = null;

    if (!save_as_draft) {
      if (is_proforma) {
        // Proforma verbraucht KEINE Nummer aus dem GoBD-Rechnungskreis SLT-B2B-RNT-YYYY-####.
        // Eigene, nicht fortlaufende Kennung (Zeitstempel), rein informell.
        const now = new Date();
        const y = now.getFullYear();
        const stamp = `${now.getMonth()+1}`.padStart(2,'0') + `${now.getDate()}`.padStart(2,'0') + `${now.getHours()}`.padStart(2,'0') + `${now.getMinutes()}`.padStart(2,'0');
        invoiceNumber = `PRO-${y}-${stamp}`;
      } else {
        const { data: invoiceNumData, error: invoiceNumError } = await serviceClient.rpc("generate_invoice_number");
        if (invoiceNumError) {
          console.error("Error generating invoice number:", invoiceNumError);
          return new Response(JSON.stringify({ error: "Failed to generate invoice number" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        invoiceNumber = invoiceNumData as string;
      }
      invoiceDate = new Date().toISOString().split("T")[0];
      dueDate = new Date(Date.now() + payment_due_days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      console.log("Invoice number generated:", invoiceNumber, "isProforma:", is_proforma);

      // Separate items by type for PDF rendering
      const productItems = items.filter(i => (i.item_type || 'product') === 'product');
      const serviceItems = items.filter(i => i.item_type === 'service');
      const surchargeItems = items.filter(i => i.item_type === 'surcharge');

      // Generate PDF document
      const pdfBytes = await generateDocumentPdf({
        title: is_correction ? "Rechnungskorrektur" : (is_proforma ? "Proforma" : "Rechnung"),
        documentNumber: invoiceNumber,
        date: invoiceDate,
        profile,
        productItems: productItems.map((item: any, idx: number) => ({
          name: item.product_name,
          description: item.description || undefined,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          discount: item.discount_percent,
          rentalStart: item.rental_start,
          rentalEnd: item.rental_end,
          itemIndex: idx,
          imageUrl: item.image_url || null,
        })),
        serviceItems: serviceItems.map((item: any) => ({
          name: item.product_name,
          description: item.description || undefined,
          amount: item.total_price,
          parentItemIndex: item.parent_item_index,
        })),
        surchargeItems: surchargeItems.map((item: any) => ({
          name: item.product_name,
          description: item.description || undefined,
          amount: item.total_price,
        })),
        sections: [
          ...(notes && !is_proforma ? [{ label: "Bemerkungen", value: notes }] : []),
        ],
        totals: {
          net: netAmount,
          vatRate,
          vat: vatAmount,
          gross: grossAmount,
          deliveryCost: delivery_cost,
          isReverseCharge,
          paymentDueDays: payment_due_days,
          dueDate,
          depositTotal,
        },
        isProforma: is_proforma,
        deliveryAddress: deliveryAddress,
      });

      const filePrefix = is_proforma ? "Proforma-Rechnung" : is_correction ? "Rechnungskorrektur" : "Rechnung";
      const safeName = profile.company_name.replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/Ä/g,"Ae").replace(/Ö/g,"Oe").replace(/Ü/g,"Ue").replace(/ß/g,"ss").replace(/[^a-zA-Z0-9_\- ]/g, "_").replace(/\s+/g, "_");
      fileName = `${filePrefix}_SLTRental_${invoiceNumber}_${safeName}.pdf`;
      const filePath = `invoices/${profile.id}/${fileName}`;

      const { error: uploadError } = await serviceClient.storage.from("b2b-invoices").upload(filePath, pdfBytes, { contentType: "application/pdf", upsert: true });
      if (uploadError) {
        console.error("Upload error:", uploadError);
        return new Response(JSON.stringify({ error: "Failed to upload invoice file" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: signedUrlData } = await serviceClient.storage.from("b2b-invoices").createSignedUrl(filePath, 60 * 60 * 24 * 365);
      fileUrl = signedUrlData?.signedUrl || "";
    }

    // Proforma: KEIN DB-Insert in b2b_invoices (kein Rechnungskreis-Verbrauch, GoBD)
    if (is_proforma) {
      return new Response(JSON.stringify({
        success: true,
        proforma: true,
        invoice_number: invoiceNumber,
        file_url: fileUrl,
        file_name: fileName,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }



    // Create invoice record
    const { data: invoice, error: invoiceError } = await serviceClient
      .from("b2b_invoices")
      .insert({
        b2b_profile_id: profile.id,
        reservation_id: reservation_id || null,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        // due_date wird per Trigger compute_invoice_due_date gesetzt (single source of truth)
        amount: grossAmount,
        net_amount: netAmount,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        gross_amount: grossAmount,
        delivery_cost: delivery_cost,
        is_reverse_charge: isReverseCharge,
        vat_id_at_creation: profile.tax_id || null,
        status: save_as_draft ? "draft" : "open",
        file_url: fileUrl || null,
        file_name: fileName,
        notes: notes || null,
        customer_company: profile.company_name,
        customer_address: `${profile.street}${profile.house_number ? " " + profile.house_number : ""}`,
        customer_postal_code: profile.postal_code,
        customer_city: profile.city,
        customer_country: profile.country || "Deutschland",
        payment_due_days: payment_due_days,
        payment_terms: (bodyPaymentTerms ?? profile.default_payment_terms ?? 'net_14'),
        source_offer_id: source_offer_id || null,
        email_sent: false,
      })
      .select()
      .single();


    if (invoiceError) {
      console.error("Invoice creation error:", invoiceError);
      return new Response(JSON.stringify({ error: "Failed to create invoice record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert invoice items
    const itemsToInsert = items.map((item) => ({
      invoice_id: invoice.id,
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
      .from("b2b_invoice_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Invoice items error:", itemsError);
    }

    // Update reservation status to reflect invoicing
    await serviceClient
      .from("b2b_reservations")
      .update({ status: "confirmed" })
      .eq("id", reservation_id);

    console.log("Invoice created successfully:", invoice.id);

    // Send email to customer
    let emailSent = false;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey && send_email && !save_as_draft) {
      try {
        const customerEmail = profile.billing_email || profile.contact_email;
        const customerName = `${profile.contact_first_name} ${profile.contact_last_name}`;
        const isCredit = is_correction && notes?.includes("GUTSCHRIFT");
        const docTitle = is_correction ? (isCredit ? "Gutschrift" : "Rechnungskorrektur") : "Rechnung";

        const LOCATIONS: Record<string, { name: string; address: string; city: string; phone: string; email: string; manager: string }> = {
          krefeld: { name: "SLT Rental Krefeld", address: "Anrather Straße 291", city: "47807 Krefeld", phone: "02151 417 99 04", email: "krefeld@slt-rental.de", manager: "Benedikt Nöchel" },
          bonn: { name: "SLT Rental Bonn", address: "Drachenburgstraße 8", city: "53179 Bonn", phone: "0228 504 660 61", email: "bonn@slt-rental.de", manager: "Ersel Uzun" },
          muelheim: { name: "SLT Rental Mülheim", address: "Ruhrorter Str. 122", city: "45478 Mülheim an der Ruhr", phone: "02151 417 99 04", email: "muelheim@slt-rental.de", manager: "Andreas Mühlenhof" },
        };
        const loc = LOCATIONS[profile.assigned_location || ""] || LOCATIONS["krefeld"];
        
        const itemsList = items.map((item: any) =>
          `<li style="padding:4px 0;font-size:14px;">${item.quantity}x ${escapeHtml(item.product_name)}${item.description ? ` – ${escapeHtml(item.description)}` : ""}: ${item.total_price.toFixed(2).replace(".", ",")} €</li>`
        ).join("");

        // Use the already-generated PDF for email attachment
        const pdfBase64 = encodeBase64(pdfBytes);
        const attachments = [{
          filename: fileName,
          content: pdfBase64,
          content_type: "application/pdf",
        }];

        const emailHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:25px 40px;text-align:center;border-bottom:3px solid #00507d;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:70px;width:auto;" />
    </div>
    <div style="background:#00507d;padding:14px 40px;text-align:center;">
      <p style="color:#ffffff;margin:0;font-size:15px;font-weight:600;">Ihre ${docTitle}</p>
    </div>
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;">Guten Tag ${escapeHtml(customerName)},</p>
      <p style="font-size:14px;color:#555;line-height:1.6;">
        anbei erhalten Sie Ihre ${docTitle} <strong>${invoiceNumber}</strong>.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="font-size:13px;font-weight:600;margin:0 0 8px;color:#333;">Positionen:</p>
        <ul style="margin:0;padding-left:20px;color:#555;">${itemsList}</ul>
        <p style="font-size:14px;font-weight:600;margin:12px 0 0;color:#333;">Bruttobetrag: ${grossAmount.toFixed(2).replace(".", ",")} €</p>
      </div>
      <p style="font-size:14px;color:#555;line-height:1.6;">
        Die vollständige ${docTitle} finden Sie als Anhang dieser E-Mail sowie in Ihrem B2B-Portal.
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://slt-rent-genius.lovable.app/b2b/rechnungen" 
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
</body></html>`;

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
            to: [customerEmail],
            subject: `Ihre ${docTitle} ${invoiceNumber} – SLT-Rental`,
            html: emailHtml,
            attachments,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log("Invoice email sent to:", customerEmail);
          await serviceClient
            .from("b2b_invoices")
            .update({ email_sent: true, email_sent_at: new Date().toISOString() })
            .eq("id", invoice.id);
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
        invoice: {
          id: invoice.id,
          invoice_number: invoiceNumber,
          gross_amount: grossAmount,
          file_url: fileUrl,
          is_reverse_charge: isReverseCharge,
        },
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

// HTML Invoice Generator with SLT Corporate Design
function generateInvoiceHtml(data: {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  profile: any;
  items: any[];
  deliveryCost: number;
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  grossAmount: number;
  isReverseCharge: boolean;
  notes: string | null;
  paymentDueDays: number;
  isCorrection: boolean;
  originalInvoiceNumber: string | null;
  isProforma?: boolean;
  depositTotal?: number;
}): string {
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split(" ");
    const datePart = parts[0];
    const timePart = parts[1] || null;
    const d = new Date(datePart + "T00:00:00");
    const ds = d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    return timePart ? `${ds} ${timePart} Uhr` : ds;
  };

  const isCredit = data.isCorrection && data.notes?.includes("GUTSCHRIFT");

  const itemRows = data.items
    .map(
      (item: any, i: number) => {
        const displayPrice = isCredit ? -Math.abs(item.unit_price) : item.unit_price;
        const displayTotal = isCredit ? -Math.abs(item.total_price) : item.total_price;
        return `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${i + 1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
        <div style="display:flex;align-items:center;gap:10px;">
          ${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.product_name)}" style="width:60px;height:45px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb;flex-shrink:0;" />` : ""}
          <div>
            <strong>${escapeHtml(item.product_name)}</strong>
            ${item.description ? `<br><span style="color:#595959;font-size:12px;">${escapeHtml(item.description)}</span>` : ""}
            ${item.rental_start ? `<br><span style="color:#595959;font-size:11px;">Zeitraum: ${formatDate(item.rental_start)}${item.rental_end ? " – " + formatDate(item.rental_end) : ""}</span>` : ""}
          </div>
        </div>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(displayPrice)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.discount_percent > 0 ? item.discount_percent + "%" : "–"}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:500;">${formatCurrency(displayTotal)}</td>
    </tr>`;
      }
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
  <title>${data.isCorrection ? "Rechnungskorrektur" : "Rechnung"} ${data.invoiceNumber}</title>
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
        <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:160px;width:auto;margin-bottom:6px;" />
        <p style="font-size:11px;color:#595959;">${SLT_COMPANY.name}</p>
        <p style="font-size:11px;color:#595959;">${SLT_COMPANY.street}, ${SLT_COMPANY.city}</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:22px;font-weight:700;color:#393d46;">${data.isProforma ? "PROFORMA-RECHNUNG" : data.isCorrection ? "RECHNUNGSKORREKTUR" : "RECHNUNG"}</p>
        <p style="font-size:13px;color:#595959;margin-top:4px;">Nr. ${data.invoiceNumber}</p>
        ${data.originalInvoiceNumber ? `<p style="font-size:12px;color:#595959;">Bezug: ${data.originalInvoiceNumber}</p>` : ""}
      </div>
    </div>

    <!-- Sender line (small) -->
    <p style="font-size:9px;color:#999;margin-bottom:5mm;border-bottom:1px solid #ccc;padding-bottom:2mm;">
      ${SLT_COMPANY.name} · ${SLT_COMPANY.street} · ${SLT_COMPANY.city}
    </p>

    <!-- Address block + Invoice meta -->
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
          <tr><td style="color:#595959;padding-right:12px;">Rechnungsdatum:</td><td style="font-weight:500;">${formatDate(data.invoiceDate)}</td></tr>
          <tr><td style="color:#595959;padding-right:12px;">Zahlungsziel:</td><td style="font-weight:500;">${data.isProforma ? "Vorkasse" : formatDate(data.dueDate)}</td></tr>
          <tr><td style="color:#595959;padding-right:12px;">Kundennr.:</td><td style="font-weight:500;">${data.profile.id.substring(0, 8).toUpperCase()}</td></tr>
          ${data.isReverseCharge ? `<tr><td style="color:#595959;padding-right:12px;">Verfahren:</td><td style="font-weight:500;color:#00507d;">Reverse-Charge</td></tr>` : ""}
        </table>
      </div>
    </div>

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
          <td style="padding:4px 0;text-align:right;">${formatCurrency(isCredit ? -Math.abs(data.netAmount) : data.netAmount)}</td>
        </tr>
        <tr>
          <td style="padding:4px 16px 4px 0;color:#595959;">
            ${data.isReverseCharge ? "USt. (Reverse-Charge):" : `USt. (${data.vatRate}%):`}
          </td>
          <td style="padding:4px 0;text-align:right;">${formatCurrency(isCredit ? -Math.abs(data.vatAmount) : data.vatAmount)}</td>
        </tr>
        ${(data.depositTotal && data.depositTotal > 0) ? `
        <tr>
          <td style="padding:4px 16px 4px 0;color:#595959;">Kaution (umsatzsteuerfrei):</td>
          <td style="padding:4px 0;text-align:right;">${formatCurrency(data.depositTotal)}</td>
        </tr>` : ""}
        <tr style="border-top:2px solid #00507d;">
          <td style="padding:8px 16px 4px 0;font-weight:700;font-size:16px;color:#00507d;">${isCredit ? "Erstattungsbetrag:" : "Gesamtbetrag:"}</td>
          <td style="padding:8px 0 4px;text-align:right;font-weight:700;font-size:16px;color:#00507d;">${formatCurrency(isCredit ? -Math.abs(data.grossAmount) : data.grossAmount)}</td>
        </tr>
      </table>
    </div>

    ${data.isReverseCharge ? `
    <div style="background:#f0f7fb;border-left:4px solid #00507d;padding:12px 16px;margin-bottom:8mm;font-size:12px;">
      <strong>Hinweis:</strong> Steuerschuldnerschaft des Leistungsempfängers (Reverse-Charge-Verfahren gem. § 13b UStG). 
      Die Umsatzsteuer ist vom Leistungsempfänger zu entrichten.
    </div>` : ""}

    ${data.notes ? `
    <div style="margin-bottom:8mm;">
      <p style="font-weight:600;margin-bottom:4px;">Anmerkungen:</p>
      <p style="color:#595959;font-size:12px;">${escapeHtml(data.notes)}</p>
    </div>` : ""}

    <!-- Payment info -->
    <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin-bottom:10mm;">
      <p style="font-weight:600;margin-bottom:8px;color:#00507d;">Zahlungsinformationen</p>
      <table style="font-size:12px;">
        <tr><td style="color:#595959;padding-right:16px;padding-bottom:4px;">Empfänger:</td><td style="font-weight:500;">${SLT_COMPANY.name}</td></tr>
        <tr><td style="color:#595959;padding-right:16px;padding-bottom:4px;">Bank:</td><td>${SLT_COMPANY.bankName}</td></tr>
        <tr><td style="color:#595959;padding-right:16px;padding-bottom:4px;">IBAN:</td><td style="font-weight:500;">${SLT_COMPANY.iban}</td></tr>
        <tr><td style="color:#595959;padding-right:16px;padding-bottom:4px;">BIC:</td><td>${SLT_COMPANY.bic}</td></tr>
        <tr><td style="color:#595959;padding-right:16px;">Verwendungszweck:</td><td style="font-weight:500;">${data.invoiceNumber}</td></tr>
      </table>
      <p style="font-size:11px;color:#595959;margin-top:8px;">
        ${data.isProforma 
          ? `Bitte überweisen Sie den Betrag <strong>vor Mietbeginn</strong> (Vorkasse). Verwendungszweck: <strong>${data.invoiceNumber}</strong>`
          : `Bitte überweisen Sie den Betrag bis zum <strong>${formatDate(data.dueDate)}</strong> (${data.paymentDueDays} Tage Zahlungsziel).`}
      </p>
    </div>

    <div style="border-top:2px solid #00507d;padding-top:10px;font-size:9px;color:#595959;text-align:center;line-height:1.8;">
      <p>${SLT_COMPANY.name} - Geschäftsführer: ${SLT_COMPANY.managingDirector} - Tel: ${SLT_COMPANY.phone} - FAX: ${SLT_COMPANY.fax} - Mobil: ${SLT_COMPANY.mobil}</p>
      <p>${SLT_COMPANY.street} - ${SLT_COMPANY.city} - Steuer-Nr. ${SLT_COMPANY.steuerNr} - USt-ID ${SLT_COMPANY.ustId} - ${SLT_COMPANY.registry}</p>
      <p>${SLT_COMPANY.bankName} - IBAN: ${SLT_COMPANY.iban} - BIC: ${SLT_COMPANY.bic} - Kontoinhaber: ${SLT_COMPANY.name}</p>
      <p>${SLT_COMPANY.web} - ${SLT_COMPANY.email} - ${SLT_COMPANY.facebook}</p>
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

// ─── PDF Generator for Invoice (DIN 5008 + SLT CI) ─────────────────────
// SINGLE SOURCE OF TRUTH für Firmen- & Steuerdaten ist die Konstante SLT_COMPANY
// oben in dieser Datei (spiegelt die Angaben im Impressum). Keine Hardcodes im
// Template unten – alles wird ausschließlich aus SLT_COMPANY gelesen.
async function generateDocumentPdf(data: {
  title: string;
  documentNumber: string;
  date: string;
  profile: any;
  productItems: Array<{ name: string; description?: string; quantity: number; unit?: string; unitPrice?: number; totalPrice?: number; discount?: number; rentalStart?: string; rentalEnd?: string; itemIndex?: number; imageUrl?: string | null }>;
  serviceItems: Array<{ name: string; description?: string; amount: number; parentItemIndex?: number }>;
  surchargeItems: Array<{ name: string; description?: string; amount: number }>;
  sections: Array<{ label: string; value: string }>;
  signatures?: { customerData?: string; staffData?: string; staffName?: string };
  totals?: { net: number; vatRate: number; vat: number; gross: number; deliveryCost?: number; isReverseCharge?: boolean; paymentDueDays?: number; dueDate?: string; depositTotal?: number };
  isProforma?: boolean;
  deliveryAddress?: { street?: string; postal_code?: string; city?: string };
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  // ── Layout constants (A4, DIN 5008 fensterkuverttauglich) ──
  const W = 595.28, H = 841.89;
  const ML = 57, MR = 57;          // ~20 mm links/rechts
  const MT = 45, MB = 60;          // Ränder oben/unten
  const CW = W - ML - MR;
  const BRAND = rgb(0/255, 80/255, 125/255);   // #00507d
  const ORANGE = rgb(255/255, 142/255, 2/255); // #ff8e02
  const INK = rgb(0.13, 0.13, 0.15);
  const MUTED = rgb(0.48, 0.5, 0.55);
  const LINE = rgb(0.82, 0.84, 0.87);
  const ZEBRA = rgb(0.972, 0.976, 0.982);

  // DIN 5008 Sichtfenster: Adresse links bei ca. 25mm/45mm
  const ADDR_X = ML;
  const ADDR_Y_TOP = H - 105;     // ~37 mm von oben (Fensterbereich)

  let pageIdx = 0;
  const pages: any[] = [];
  const proformaFlag = !!data.isProforma;

  // Load logo (bitmap – niemals als SVG/Text nachbauen)
  let logoImg: any = null;
  try {
    const lr = await fetch("https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png");
    if (lr.ok) {
      const lb = new Uint8Array(await lr.arrayBuffer());
      logoImg = await doc.embedPng(lb);
    }
  } catch {}

  // ── helpers ──
  const fm = (n: number) => n.toFixed(2).replace('.', ',') + ' \u20AC';
  const fd = (d: string) => {
    if (!d) return '';
    const sp = d.split(' '); const p = sp[0].split('-');
    return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : sp[0];
  };
  const wt = (t: string, f: any, s: number, mw: number): string[] => {
    if (!t) return [''];
    const words = String(t).split(/\s+/); const lines: string[] = []; let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (f.widthOfTextAtSize(test, s) <= mw) cur = test;
      else { if (cur) lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  };
  const dt = (pg: any, t: string, x: number, yy: number, f = font, s = 9.5, c = INK) => {
    try { pg.drawText(String(t ?? ''), { x, y: yy, size: s, font: f, color: c }); } catch {}
  };
  const dtr = (pg: any, t: string, xRight: number, yy: number, f = font, s = 9.5, c = INK) => {
    try {
      const tw = f.widthOfTextAtSize(String(t ?? ''), s);
      pg.drawText(String(t ?? ''), { x: xRight - tw, y: yy, size: s, font: f, color: c });
    } catch {}
  };

  const drawProformaWatermark = (pg: any) => {
    if (!proformaFlag) return;
    try {
      pg.drawText("PROFORMA", { x: 90, y: H / 2 - 60, size: 96, font: bold, color: rgb(0.95, 0.9, 0.85), rotate: { type: 'degrees', angle: 30 } as any });
    } catch {}
  };

  // Renders sender line, address block, info block, title. Only on page 1.
  const renderHeader = (pg: any): number => {
    // Absenderzeile (7pt) direkt über Adressfeld
    dt(pg, `${SLT_COMPANY.name} · ${SLT_COMPANY.street} · ${SLT_COMPANY.city}`, ADDR_X, ADDR_Y_TOP + 12, font, 7, MUTED);
    pg.drawRectangle({ x: ADDR_X, y: ADDR_Y_TOP + 10, width: 220, height: 0.4, color: LINE });

    // Empfängeradresse (DIN 5008 Fensterbereich, max ~85mm × 40mm)
    let ay = ADDR_Y_TOP;
    const companyLine = data.profile.legal_form
      ? `${data.profile.company_name} ${data.profile.legal_form}`
      : data.profile.company_name;
    dt(pg, companyLine, ADDR_X, ay, bold, 10.5); ay -= 12;
    const cn = `${data.profile.contact_first_name || ''} ${data.profile.contact_last_name || ''}`.trim();
    if (cn) { dt(pg, cn, ADDR_X, ay, font, 9.5); ay -= 11; }
    dt(pg, `${data.profile.street}${data.profile.house_number ? ' ' + data.profile.house_number : ''}`, ADDR_X, ay, font, 9.5); ay -= 11;
    dt(pg, `${data.profile.postal_code} ${data.profile.city}`, ADDR_X, ay, font, 9.5); ay -= 11;
    dt(pg, data.profile.country || 'Deutschland', ADDR_X, ay, font, 9.5); ay -= 11;
    // USt-IdNr NUR bei Reverse-Charge (innergemeinschaftliche Leistung) im Adressblock
    if (data.totals?.isReverseCharge && data.profile.tax_id) {
      ay -= 2;
      dt(pg, `USt-IdNr.: ${data.profile.tax_id}`, ADDR_X, ay, font, 9, MUTED);
    }

    // Logo oben RECHTS (~60 mm breit ≈ 170 pt), mit Luft zum Seitenrand und zum Inhalt
    let logoBottomY = H - MT;
    if (logoImg) {
      const targetW = 170; // ~60 mm
      const scale = targetW / logoImg.width;
      const drawH = logoImg.height * scale;
      logoBottomY = H - MT - drawH;
      pg.drawImage(logoImg, { x: W - MR - targetW, y: logoBottomY, width: targetW, height: drawH });
    }

    // Info-Block rechts, zweispaltig (Label grau / Wert schwarz) – deutlich UNTER dem Logo
    const infoX = W - MR - 200;
    let iy = Math.min(ADDR_Y_TOP, logoBottomY - 26);
    const infoRow = (label: string, value: string) => {
      dt(pg, label, infoX, iy, font, 8.5, MUTED);
      dt(pg, value, infoX + 95, iy, font, 9, INK);
      iy -= 13;
    };
    infoRow("Rechnungsnummer:", data.documentNumber);
    infoRow("Rechnungsdatum:", fd(data.date));
    infoRow("Kundennummer:", String(data.profile.id).substring(0, 8).toUpperCase());
    // Leistungszeitraum aus productItems (falls einheitlich)
    const periods = data.productItems.filter(i => i.rentalStart).map(i => `${i.rentalStart}|${i.rentalEnd || ''}`);
    if (periods.length && periods.every(p => p === periods[0])) {
      const first = data.productItems.find(i => i.rentalStart)!;
      infoRow("Leistungszeitraum:", `${fd(first.rentalStart!)}${first.rentalEnd ? ' – ' + fd(first.rentalEnd) : ''}`);
    }
    // Zahlungskondition
    const termsLabel = proformaFlag
      ? "Vorkasse"
      : data.totals?.paymentDueDays === 0 ? "Vorkasse"
      : data.totals?.paymentDueDays === 7 ? "7 Tage netto"
      : data.totals?.paymentDueDays === 30 ? "30 Tage netto"
      : "14 Tage netto";
    infoRow("Zahlungskondition:", termsLabel);
    infoRow("Ansprechpartner:", SLT_COMPANY.managingDirector);

    // Titelblock (dominant in linker Spalte, spürbar Luft zwischen Adresse und Titel,
    // sowie zwischen Titel und Nummer)
    const contentTopY = Math.min(ay, iy) - 40;
    let ty = contentTopY;
    dt(pg, data.title, ML, ty, bold, 30, BRAND);
    ty -= 26;
    dt(pg, `Nr. ${data.documentNumber}`, ML, ty, font, 10.5, MUTED);

    return ty - 34; // deutlich mehr Abstand zum nächsten Block (Tabellenkopf)
  };

  const renderTableHeader = (pg: any, startY: number): number => {
    // Weiße Kopfzeile mit 2pt Unterstreichung in BRAND, Titel in BRAND
    const y = startY;
    dt(pg, "Pos.", ML + 2, y, bold, 8.5, BRAND);
    dt(pg, "Bezeichnung", ML + 32, y, bold, 8.5, BRAND);
    dtr(pg, "Menge", ML + CW * 0.60, y, bold, 8.5, BRAND);
    dt(pg, "Einheit", ML + CW * 0.60 + 8, y, bold, 8.5, BRAND);
    dtr(pg, "Einzelpreis", ML + CW * 0.85, y, bold, 8.5, BRAND);
    dtr(pg, "Gesamt", W - MR - 4, y, bold, 8.5, BRAND);
    pg.drawRectangle({ x: ML, y: y - 5, width: CW, height: 2, color: BRAND });
    return y - 16;
  };

  const newPage = (isFirst: boolean): { pg: any; y: number } => {
    const pg = doc.addPage([W, H]);
    pages.push(pg);
    drawProformaWatermark(pg);
    pageIdx = pages.length - 1;
    if (isFirst) {
      const y = renderHeader(pg);
      return { pg, y: renderTableHeader(pg, y) };
    }
    // Folgeseiten: nur schlanker Tabellenkopf (Titel + Nr. dünn)
    let y = H - MT;
    if (logoImg) {
      const targetW = 90;
      const scale = targetW / logoImg.width;
      const drawH = logoImg.height * scale;
      pg.drawImage(logoImg, { x: W - MR - targetW, y: y - drawH, width: targetW, height: drawH });
    }
    dt(pg, `${data.title} · ${data.documentNumber}`, ML, y - 46, bold, 10, BRAND);
    y -= 74;
    return { pg, y: renderTableHeader(pg, y) };
  };

  let { pg, y } = newPage(true);

  // Reserve space at bottom for summary/payment/footer so we don't crash into them
  const RESERVE_BOTTOM = MB + 60;
  const need = (h: number) => {
    if (y - h < RESERVE_BOTTOM) {
      ({ pg, y } = newPage(false));
    }
  };

  // ── Produktbilder auflösen und einbetten ──
  const imgServiceClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  for (const it of data.productItems) {
    it.imageUrl = normalizeImageUrl(it.imageUrl);
  }
  const missingImgNames = data.productItems.filter((i) => !i.imageUrl).map((i) => i.name);
  if (missingImgNames.length) {
    const resolvedImgs = await resolveImagesByName(imgServiceClient, missingImgNames);
    for (const it of data.productItems) {
      if (it.imageUrl) continue;
      it.imageUrl = resolvedImgs.get((it.name || "").trim().toLowerCase()) || null;
    }
  }
  const imageCache = await embedProductImages(doc, data.productItems.map((i) => i.imageUrl));
  console.log(
    `Produktbilder (Rechnung): ${data.productItems.filter((i) => i.imageUrl && imageCache.get(i.imageUrl)).length}/${data.productItems.length} Positionen mit Bild`,
  );

  // ── item rendering ──
  const IMG = 34;
  const hasAnyImage = data.productItems.some((i) => i.imageUrl && imageCache.get(i.imageUrl));
  const nameColX = ML + 32;
  const textColX = hasAnyImage ? nameColX + IMG + 8 : nameColX;
  const nameColW = ML + CW * 0.60 - textColX - 6;
  const qtyColRight = ML + CW * 0.60;
  const unitColX = ML + CW * 0.60 + 8;
  const unitPriceRight = ML + CW * 0.85;
  const totalRight = W - MR - 4;

  // Einheit = NUR das Wort (Tage/Wochen/Stück/Pauschale). Menge steht separat
  // in der Menge-Spalte. Niemals Zahl in die Einheit mischen.
  const deriveUnit = (item: any, fallback = 'Stück'): string => {
    if (item.unit) return item.unit;
    if (item.rentalStart && item.rentalEnd) {
      try {
        const a = new Date(item.rentalStart.split(' ')[0]);
        const b = new Date(item.rentalEnd.split(' ')[0]);
        const days = Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000) + 1);
        return days >= 28 && days % 7 === 0 ? 'Wochen' : 'Tage';
      } catch { return 'Tage'; }
    }
    return fallback;
  };

  let posNum = 1;
  let rowZebra = false;

  const renderRow = (rowH: number, drawer: (rowTop: number) => void) => {
    need(rowH);
    if (rowZebra) pg.drawRectangle({ x: ML, y: y - rowH + 3, width: CW, height: rowH, color: ZEBRA });
    drawer(y);
    y -= rowH;
    rowZebra = !rowZebra;
  };

  data.productItems.forEach((item, productIndex) => {
    let nameText = item.name || '';
    if (item.discount && item.discount > 0) nameText += ` (${item.discount}% Rabatt)`;
    const nameLines = wt(nameText, bold, 9.5, nameColW);
    let subLines: string[] = [];
    if (item.description) subLines.push(...wt(item.description, font, 8, nameColW));
    if (item.rentalStart) {
      const period = `Mietzeitraum: ${fd(item.rentalStart)}${item.rentalEnd ? ' – ' + fd(item.rentalEnd) : ''}`;
      subLines.push(...wt(period, font, 8, nameColW));
    }
    const img = item.imageUrl ? imageCache.get(item.imageUrl) : null;
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
      if (item.unitPrice != null) dtr(pg, fm(item.unitPrice), unitPriceRight, top - 10, font, 9.5);
      dtr(pg, fm(item.totalPrice || 0), totalRight, top - 10, bold, 9.5);
    });
    posNum++;

    // Linked services under a product
    const linked = data.serviceItems.filter(s => s.parentItemIndex === productIndex);
    linked.forEach(svc => {
      const svcLines = wt(`- ${svc.name}`, font, 8.5, nameColW);
      const h = 4 + svcLines.length * 10;
      renderRow(h, (top) => {
        svcLines.forEach((ln, li) => dt(pg, ln, textColX + 8, top - 8 - li * 10, font, 8.5, MUTED));
        dt(pg, 'Pauschale', unitColX, top - 8, font, 8.5, MUTED);
        dtr(pg, fm(svc.amount), totalRight, top - 8, font, 8.5, MUTED);
      });
    });
  });

  // Delivery cost as its own row
  if (data.totals?.deliveryCost && data.totals.deliveryCost > 0) {
    renderRow(26, (top) => {
      dt(pg, `${posNum}`, ML + 2, top - 10, font, 9);
      dt(pg, "Anlieferung / Transport", textColX, top - 10, bold, 9.5);
      dtr(pg, "1", qtyColRight, top - 10, font, 9.5);
      dt(pg, "Pauschale", unitColX, top - 10, font, 9.5, MUTED);
      dtr(pg, fm(data.totals.deliveryCost), unitPriceRight, top - 10, font, 9.5);
      dtr(pg, fm(data.totals.deliveryCost), totalRight, top - 10, bold, 9.5);
    });
    posNum++;
  }

  // Unassigned services
  const unassigned = data.serviceItems.filter(s => s.parentItemIndex == null);
  unassigned.forEach(svc => {
    const svcLines = wt(svc.name, font, 9.5, nameColW);
    const h = 4 + svcLines.length * 11;
    renderRow(h, (top) => {
      dt(pg, `${posNum}`, ML + 2, top - 8, font, 9);
      svcLines.forEach((ln, li) => dt(pg, ln, textColX, top - 8 - li * 11, font, 9.5));
      dtr(pg, "1", qtyColRight, top - 8, font, 9.5);
      dt(pg, "Pauschale", unitColX, top - 8, font, 9.5, MUTED);
      dtr(pg, fm(svc.amount), totalRight, top - 8, bold, 9.5);
    });
    posNum++;
  });

  // Surcharges
  data.surchargeItems.forEach(sc => {
    const scLines = wt(sc.name, font, 9.5, nameColW);
    const h = 4 + scLines.length * 11;
    renderRow(h, (top) => {
      dt(pg, `${posNum}`, ML + 2, top - 8, font, 9);
      scLines.forEach((ln, li) => dt(pg, ln, textColX, top - 8 - li * 11, font, 9.5));
      dtr(pg, "1", qtyColRight, top - 8, font, 9.5);
      dt(pg, "Pauschale", unitColX, top - 8, font, 9.5, MUTED);
      dtr(pg, fm(sc.amount), totalRight, top - 8, bold, 9.5);
    });
    posNum++;
  });

  // Underline table end
  pg.drawRectangle({ x: ML, y, width: CW, height: 0.5, color: LINE });
  y -= 26;

  // ── Totals block (right aligned) ──
  if (data.totals) {
    need(120);
    const tx = ML + CW * (proformaFlag ? 0.38 : 0.55);
    const vx = W - MR - 4;
    const showSubtotals = (data.serviceItems.length > 0) || (data.surchargeItems.length > 0) || ((data.totals.deliveryCost || 0) > 0);

    if (showSubtotals) {
      const itemsSubtotal = data.productItems.reduce((s, i) => s + (i.totalPrice || 0), 0);
      dt(pg, "Zwischensumme Mietartikel", tx, y, font, 9, MUTED);
      dtr(pg, fm(itemsSubtotal), vx, y, font, 9); y -= 13;
    }

    if (proformaFlag) {
      if (data.totals.depositTotal && data.totals.depositTotal > 0) {
        dt(pg, "Kaution (umsatzsteuerfrei)", tx, y, font, 9, MUTED);
        dtr(pg, fm(data.totals.depositTotal), vx, y, font, 9); y -= 13;
      }
      y -= 6;
      // dezenter Hintergrund #00507d @ ~6%
      pg.drawRectangle({ x: tx - 6, y: y - 4, width: vx - tx + 10, height: 22, color: rgb(0.94, 0.96, 0.98) });
      pg.drawRectangle({ x: tx - 6, y: y + 17, width: vx - tx + 10, height: 1, color: BRAND });
      dt(pg, "Zu zahlender Betrag (inkl. gesetzl. MwSt.)", tx, y + 4, bold, 10.5, BRAND);
      dtr(pg, fm(data.totals.gross), vx, y + 4, bold, 12, BRAND);
      y -= 30;
    } else {
      dt(pg, "Nettobetrag", tx, y, font, 9.5); dtr(pg, fm(data.totals.net), vx, y, font, 9.5); y -= 13;
      if (data.totals.isReverseCharge) {
        dt(pg, "USt. (Reverse Charge)", tx, y, font, 9, MUTED); dtr(pg, "0,00 \u20AC", vx, y, font, 9); y -= 13;
      } else {
        dt(pg, `USt. ${data.totals.vatRate}%`, tx, y, font, 9, MUTED); dtr(pg, fm(data.totals.vat), vx, y, font, 9); y -= 13;
      }
      if (data.totals.depositTotal && data.totals.depositTotal > 0) {
        dt(pg, "Kaution (umsatzsteuerfrei)", tx, y, font, 9, MUTED); dtr(pg, fm(data.totals.depositTotal), vx, y, font, 9); y -= 13;
      }
      y -= 6;
      pg.drawRectangle({ x: tx - 6, y: y - 4, width: vx - tx + 10, height: 22, color: rgb(0.94, 0.96, 0.98) });
      pg.drawRectangle({ x: tx - 6, y: y + 17, width: vx - tx + 10, height: 1, color: BRAND });
      dt(pg, "Gesamtbetrag", tx, y + 4, bold, 11, BRAND);
      dtr(pg, fm(data.totals.gross), vx, y + 4, bold, 12, BRAND);
      y -= 30;
    }
  }

  // ── Payment / Proforma-Kasten (mit deutlich mehr Innenpadding und Zeilenabstand) ──
  y -= 8; // Luft vor dem Kasten
  if (proformaFlag) {
    const notice = "Dies ist keine Rechnung im Sinne des \u00A714 UStG und berechtigt nicht zum Vorsteuerabzug. Zahlung vor Mietbeginn (Vorkasse); die Bereitstellung erfolgt nach Zahlungseingang.";
    const lines = wt(notice, font, 9, CW - 32);
    const boxH = 24 + 16 + lines.length * 13 + 14;
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: CW, height: boxH, color: rgb(1, 0.97, 0.88) });
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: 3, height: boxH, color: ORANGE });
    dt(pg, "Proforma – Hinweis nach §14 UStG", ML + 16, y - 4, bold, 10, rgb(0.55, 0.32, 0));
    lines.forEach((ln, i) => dt(pg, ln, ML + 16, y - 22 - i * 13, font, 9, rgb(0.35, 0.25, 0.1)));
    y -= boxH + 10;
  } else if (data.totals?.dueDate) {
    const dueText = data.totals.paymentDueDays === 0
      ? "Zahlungsziel: Vorkasse. Die Bereitstellung erfolgt nach Zahlungseingang."
      : `Zahlbar bis: ${fd(data.totals.dueDate)} (${data.totals.paymentDueDays} Tage netto)`;
    const bankLine = `${SLT_COMPANY.bankName} | IBAN: ${SLT_COMPANY.iban} | BIC: ${SLT_COMPANY.bic}`;
    const ref = `Verwendungszweck: ${data.documentNumber}`;
    const boxH = 84;
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: CW, height: boxH, color: rgb(0.995, 0.97, 0.93) });
    pg.drawRectangle({ x: ML, y: y - boxH + 12, width: 3, height: boxH, color: ORANGE });
    dt(pg, "Zahlungshinweis", ML + 16, y - 2, bold, 10, INK);
    dt(pg, dueText, ML + 16, y - 20, font, 9.5, INK);
    dt(pg, bankLine, ML + 16, y - 38, font, 9.5, INK);
    dt(pg, ref, ML + 16, y - 56, bold, 9.5, INK);
    y -= boxH + 10;
  }

  if (data.totals?.isReverseCharge && !proformaFlag) {
    need(46);
    // Pflichthinweis Reverse-Charge (§13b UStG). USt-IdNr. des Kunden steht bereits im Adressblock.
    pg.drawRectangle({ x: ML, y: y - 30, width: CW, height: 36, color: rgb(0.94, 0.97, 0.98) });
    pg.drawRectangle({ x: ML, y: y - 30, width: 3, height: 36, color: BRAND });
    dt(pg, "Steuerschuldnerschaft des Leistungsempfängers", ML + 12, y - 6, bold, 9, INK);
    dt(pg, "Reverse-Charge-Verfahren gem. §13b UStG – die Umsatzsteuer schuldet der Leistungsempfänger.", ML + 12, y - 20, font, 8.5, INK);
    y -= 46;
  }


  // Sections (notes)
  for (const sec of data.sections) {
    need(30);
    dt(pg, sec.label + ":", ML, y, bold, 9);
    y -= 12;
    const lines = wt(sec.value, font, 8.5, CW);
    for (const line of lines) { need(12); dt(pg, line, ML, y, font, 8.5, INK); y -= 11; }
    y -= 6;
  }

  // Signatures
  if (data.signatures) {
    need(80); y -= 6;
    pg.drawRectangle({ x: ML, y, width: CW, height: 0.5, color: LINE }); y -= 50;
    for (const [sigData, xOff] of [[data.signatures.customerData, 0], [data.signatures.staffData, CW / 2 + 10]] as [string | undefined, number][]) {
      if (sigData) { try {
        const b64 = sigData.split(',')[1]; const sb = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const si = sigData.includes('png') ? await doc.embedPng(sb) : await doc.embedJpg(sb);
        const sc = Math.min(120 / si.width, 45 / si.height);
        pg.drawImage(si, { x: ML + xOff, y, width: si.width * sc, height: si.height * sc });
      } catch {} }
    }
    y -= 6;
    pg.drawRectangle({ x: ML, y, width: CW / 2 - 15, height: 0.5, color: MUTED });
    pg.drawRectangle({ x: ML + CW / 2 + 10, y, width: CW / 2 - 10, height: 0.5, color: MUTED });
    y -= 10; dt(pg, "Kunde", ML, y, font, 8, MUTED);
    dt(pg, `Mitarbeiter: ${data.signatures.staffName || ''}`, ML + CW / 2 + 10, y, font, 8, MUTED);
  }

  // ── Footer auf ALLEN Seiten (3-spaltig, Trenner = Pipe) ──
  const total = doc.getPageCount();
  const colW = CW / 3;
  const footerCol1 = [
    SLT_COMPANY.name,
    `GF ${SLT_COMPANY.managingDirector}`,
    `${SLT_COMPANY.registry}`,
  ];
  const footerCol2 = [
    `${SLT_COMPANY.street} | ${SLT_COMPANY.city}`,
    `Tel: ${SLT_COMPANY.phone}`,
    `${SLT_COMPANY.email} | ${SLT_COMPANY.web}`,
  ];
  const footerCol3 = [
    `Steuer-Nr. ${SLT_COMPANY.steuerNr}`,
    `USt-IdNr. ${SLT_COMPANY.ustId}`,
    `${SLT_COMPANY.bankName} | IBAN ${SLT_COMPANY.iban}`,
  ];
  for (let i = 0; i < total; i++) {
    const p = doc.getPage(i);
    // Trennlinie
    p.drawRectangle({ x: ML, y: MB + 42, width: CW, height: 0.5, color: LINE });
    const drawCol = (lines: string[], x: number) => {
      lines.forEach((ln, li) => {
        try { p.drawText(ln, { x, y: MB + 32 - li * 9, size: 6.8, font, color: MUTED }); } catch {}
      });
    };
    drawCol(footerCol1, ML);
    drawCol(footerCol2, ML + colW);
    drawCol(footerCol3, ML + 2 * colW);
    // Seite X von Y ab Seite 2
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

