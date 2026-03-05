import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
  phone: "+49 (0) 2151 - 417 99 02",
  fax: "+49 (0) 2151 - 417 99 04",
  email: "info@slt-rental.de",
  web: "www.slt-rental.de",
  registry: "HRA 7075 Amtsgericht Krefeld",
  managingDirector: "Benedikt Nöchel",
  bankName: "Sparkasse Krefeld",
  iban: "DE65 3205 0000 0000 4784 46",
  bic: "SPKRDE33",
  taxNote: "Steuerlich vertreten durch SLT Management GmbH, HRB 18191 AG Krefeld",
};

interface InvoiceRequest {
  reservation_id: string;
  custom_items?: Array<{
    product_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    discount_percent?: number;
    rental_start?: string;
    rental_end?: string;
    image_url?: string;
  }>;
  delivery_cost?: number;
  payment_due_days?: number;
  notes?: string;
  image_url?: string; // Fallback image for auto-generated items
  is_correction?: boolean;
  original_invoice_number?: string;
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
    const { reservation_id, custom_items, delivery_cost = 0, payment_due_days: bodyPaymentDueDays, notes, image_url: fallbackImageUrl, is_correction = false, original_invoice_number } = body;

    console.log("Generating invoice for reservation:", reservation_id);

    // Fetch reservation with profile
    const { data: reservation, error: resError } = await supabase
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
    const { data: profile, error: profileError } = await supabase
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

    // Use profile's payment terms, fallback to body override, then default 14
    const payment_due_days = bodyPaymentDueDays ?? profile.payment_due_days ?? 14;

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
          rental_start: item.rental_start || reservation.start_date,
          rental_end: item.rental_end || reservation.end_date,
          image_url: item.image_url || fallbackImageUrl || null,
        };
      });
    } else {
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
          image_url: fallbackImageUrl || null,
        };
      });
    }

    // Calculate totals
    const itemsTotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const netAmount = Math.round((itemsTotal + delivery_cost) * 100) / 100;
    const vatAmount = isReverseCharge ? 0 : Math.round(netAmount * (vatRate / 100) * 100) / 100;
    const grossAmount = Math.round((netAmount + vatAmount) * 100) / 100;

    // Use service role client for admin operations
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate invoice number
    const { data: invoiceNumData, error: invoiceNumError } = await serviceClient
      .rpc("generate_invoice_number");

    if (invoiceNumError) {
      console.error("Error generating invoice number:", invoiceNumError);
      return new Response(JSON.stringify({ error: "Failed to generate invoice number" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const invoiceNumber = invoiceNumData as string;
    const invoiceDate = new Date().toISOString().split("T")[0];
    const dueDate = new Date(Date.now() + payment_due_days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    console.log("Invoice number generated:", invoiceNumber);

    // Generate PDF HTML
    const docTitle = is_correction ? "RECHNUNGSKORREKTUR" : "RECHNUNG";
    const pdfHtml = generateInvoiceHtml({
      invoiceNumber,
      invoiceDate,
      dueDate,
      profile,
      items,
      deliveryCost: delivery_cost,
      netAmount,
      vatRate,
      vatAmount,
      grossAmount,
      isReverseCharge,
      notes: notes || null,
      paymentDueDays: payment_due_days,
      isCorrection: is_correction,
      originalInvoiceNumber: original_invoice_number || null,
    });

    // Store as HTML file (can be rendered/printed as PDF by browser)
    const filePrefix = is_correction ? "Rechnungskorrektur" : "Rechnung";
    const fileName = `${filePrefix}_SLTRental_${invoiceNumber}_${profile.company_name.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "_")}.html`;
    const filePath = `invoices/${profile.id}/${fileName}`;

    const htmlBytes = new TextEncoder().encode(pdfHtml);
    const { error: uploadError } = await serviceClient.storage
      .from("b2b-invoices")
      .upload(filePath, htmlBytes, {
        contentType: "text/html; charset=utf-8",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload invoice file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get signed URL (valid for 1 year)
    const { data: signedUrlData } = await serviceClient.storage
      .from("b2b-invoices")
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    const fileUrl = signedUrlData?.signedUrl || "";

    // Create invoice record
    const { data: invoice, error: invoiceError } = await serviceClient
      .from("b2b_invoices")
      .insert({
        b2b_profile_id: profile.id,
        reservation_id: reservation_id,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        amount: grossAmount,
        net_amount: netAmount,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        gross_amount: grossAmount,
        delivery_cost: delivery_cost,
        is_reverse_charge: isReverseCharge,
        vat_id_at_creation: profile.tax_id || null,
        status: "open",
        file_url: fileUrl,
        file_name: fileName,
        notes: notes || null,
        customer_company: profile.company_name,
        customer_address: `${profile.street}${profile.house_number ? " " + profile.house_number : ""}`,
        customer_postal_code: profile.postal_code,
        customer_city: profile.city,
        customer_country: profile.country || "Deutschland",
        payment_due_days: payment_due_days,
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
}): string {
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
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
  <title>Rechnung ${data.invoiceNumber}</title>
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
        <p style="font-size:22px;font-weight:700;color:#393d46;">RECHNUNG</p>
        <p style="font-size:13px;color:#595959;margin-top:4px;">Nr. ${data.invoiceNumber}</p>
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
          <tr><td style="color:#595959;padding-right:12px;">Zahlungsziel:</td><td style="font-weight:500;">${formatDate(data.dueDate)}</td></tr>
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
        Bitte überweisen Sie den Betrag bis zum <strong>${formatDate(data.dueDate)}</strong> (${data.paymentDueDays} Tage Zahlungsziel).
      </p>
    </div>

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
