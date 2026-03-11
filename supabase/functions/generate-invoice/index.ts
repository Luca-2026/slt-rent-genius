import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

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
  }>;
  delivery_cost?: number;
  payment_due_days?: number;
  notes?: string;
  image_url?: string;
  is_correction?: boolean;
  original_invoice_number?: string;
  send_email?: boolean;
  is_proforma?: boolean;
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
    const { reservation_id, b2b_profile_id: directProfileId, custom_items, delivery_cost = 0, payment_due_days: bodyPaymentDueDays, notes, image_url: fallbackImageUrl, is_correction = false, original_invoice_number, send_email = true, is_proforma = false } = body;

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
          image_url: item.image_url || fallbackImageUrl || null,
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
          image_url: fallbackImageUrl || null,
        };
      });
    } else {
      return new Response(JSON.stringify({ error: "custom_items required when no reservation_id is provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate totals
    const itemsTotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const netAmount = Math.round((itemsTotal + delivery_cost) * 100) / 100;
    const vatAmount = isReverseCharge ? 0 : Math.round(netAmount * (vatRate / 100) * 100) / 100;
    const grossAmount = Math.round((netAmount + vatAmount) * 100) / 100;

    // serviceClient already created above

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
      isProforma: is_proforma,
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
        reservation_id: reservation_id || null,
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

    // Send email to customer
    let emailSent = false;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey && send_email) {
      try {
        const customerEmail = profile.billing_email || profile.contact_email;
        const customerName = `${profile.contact_first_name} ${profile.contact_last_name}`;
        const isCredit = is_correction && notes?.includes("GUTSCHRIFT");
        const docTitle = is_correction ? (isCredit ? "Gutschrift" : "Rechnungskorrektur") : "Rechnung";

        const LOCATIONS: Record<string, { name: string; address: string; city: string; phone: string; email: string; manager: string }> = {
          krefeld: { name: "SLT Rental Krefeld", address: "Anrather Straße 291", city: "47807 Krefeld", phone: "02151 417 99 04", email: "krefeld@slt-rental.de", manager: "Benedikt Nöchel" },
          bonn: { name: "SLT Rental Bonn", address: "Drachenburgstraße 8", city: "53179 Bonn", phone: "0228 504 660 61", email: "bonn@slt-rental.de", manager: "Ersel Uzun" },
          muelheim: { name: "SLT Rental Mülheim", address: "Ruhrorter Str. 122", city: "45478 Mülheim an der Ruhr", phone: "02151 417 99 04", email: "muelheim@slt-rental.de", manager: "Andreas Scherzow" },
        };
        const loc = LOCATIONS[profile.assigned_location || ""] || LOCATIONS["krefeld"];
        
        const itemsList = items.map((item: any) =>
          `<li style="padding:4px 0;font-size:14px;">${item.quantity}x ${escapeHtml(item.product_name)}${item.description ? ` – ${escapeHtml(item.description)}` : ""}: ${item.total_price.toFixed(2).replace(".", ",")} €</li>`
        ).join("");

        // Generate PDF for email attachment
        const pdfBytes = await generateDocumentPdf({
          title: is_correction ? "RECHNUNGSKORREKTUR" : "RECHNUNG",
          documentNumber: invoiceNumber,
          date: invoiceDate,
          profile,
          items: items.map((item: any) => ({
            name: item.product_name,
            description: item.description || undefined,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.total_price,
            discount: item.discount_percent,
          })),
          sections: [
            ...(notes ? [{ label: "Bemerkungen", value: notes }] : []),
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
          },
        });
        const pdfBase64 = encodeBase64(pdfBytes);
        const pdfFileName = fileName.replace(".html", ".pdf");
        const attachments = [{
          filename: pdfFileName,
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
        <tr style="border-top:2px solid #00507d;">
          <td style="padding:8px 16px 4px 0;font-weight:700;font-size:16px;color:#00507d;">${isCredit ? "Erstattungsbetrag:" : "Bruttobetrag:"}</td>
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

// ─── PDF Generator for Email Attachment ─────────────────────
async function generateDocumentPdf(data: {
  title: string;
  documentNumber: string;
  date: string;
  profile: any;
  items: Array<{ name: string; description?: string; quantity: number; unitPrice?: number; totalPrice?: number; discount?: number }>;
  sections: Array<{ label: string; value: string }>;
  signatures?: { customerData?: string; staffData?: string; staffName?: string };
  totals?: { net: number; vatRate: number; vat: number; gross: number; deliveryCost?: number; isReverseCharge?: boolean; paymentDueDays?: number; dueDate?: string };
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const W = 595.28, H = 841.89, MG = 50, CW = W - 2 * MG;
  let page = doc.addPage([W, H]);
  let y = H - MG;

  const checkPage = (need: number) => { if (y - need < MG + 40) { page = doc.addPage([W, H]); y = H - MG; } };
  const dt = (t: string, x: number, yy: number, f = font, s = 10, c = rgb(0.2, 0.2, 0.2)) => {
    try { page.drawText(t || '', { x, y: yy, size: s, font: f, color: c }); } catch {}
  };
  const wt = (t: string, f: any, s: number, mw: number): string[] => {
    if (!t) return [''];
    const words = t.split(' '); const lines: string[] = []; let cur = '';
    for (const w of words) { const test = cur ? `${cur} ${w}` : w; if (f.widthOfTextAtSize(test, s) <= mw) cur = test; else { if (cur) lines.push(cur); cur = w; } }
    if (cur) lines.push(cur); return lines.length ? lines : [''];
  };
  const fd = (d: string) => { const sp = d.split(' '); const p = sp[0].split('-'); const dateStr = p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : sp[0]; return sp[1] ? `${dateStr} ${sp[1]} Uhr` : dateStr; };
  const fm = (n: number) => n.toFixed(2).replace('.', ',') + ' EUR';

  try {
    const lr = await fetch("https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png");
    const lb = new Uint8Array(await lr.arrayBuffer()); const li = await doc.embedPng(lb);
    const ls = 45 / li.height; page.drawImage(li, { x: MG, y: y - 45, width: li.width * ls, height: 45 });
  } catch {}

  [SLT_COMPANY.name, `${SLT_COMPANY.street}, ${SLT_COMPANY.city}`].forEach((l, i) => {
    const tw = font.widthOfTextAtSize(l, 7); dt(l, W - MG - tw, y - 10 - i * 10, font, 7, rgb(0.5, 0.5, 0.5));
  });
  y -= 60;
  page.drawRectangle({ x: MG, y, width: CW, height: 2, color: rgb(0, 0.314, 0.49) });
  y -= 30;
  dt(data.title, MG, y, bold, 18, rgb(0, 0.314, 0.49)); y -= 22;
  dt(data.documentNumber, MG, y, bold, 11);
  const ds = `Datum: ${fd(data.date)}`; dt(ds, W - MG - font.widthOfTextAtSize(ds, 10), y, font, 10); y -= 30;

  dt("Kunde:", MG, y, bold, 9, rgb(0.5, 0.5, 0.5)); y -= 14;
  dt(data.profile.company_name, MG, y, bold, 10); y -= 14;
  dt(`${data.profile.contact_first_name} ${data.profile.contact_last_name}`, MG, y, font, 10); y -= 14;
  dt(`${data.profile.street}${data.profile.house_number ? ' ' + data.profile.house_number : ''}`, MG, y, font, 10); y -= 14;
  dt(`${data.profile.postal_code} ${data.profile.city}`, MG, y, font, 10);
  if (data.profile.tax_id) { y -= 14; dt(`USt-IdNr.: ${data.profile.tax_id}`, MG, y, font, 9, rgb(0.4, 0.4, 0.4)); }
  y -= 25;

  const hp = data.items.some(i => i.unitPrice != null);
  page.drawRectangle({ x: MG, y: y + 5, width: CW, height: 18, color: rgb(0.96, 0.97, 0.98) });
  dt("Pos.", MG + 4, y + 8, bold, 8); dt("Bezeichnung", MG + 30, y + 8, bold, 8);
  dt("Menge", MG + CW * (hp ? 0.55 : 0.8), y + 8, bold, 8);
  if (hp) { dt("Einzelpreis", MG + CW * 0.67, y + 8, bold, 8); dt("Gesamt", MG + CW * 0.87, y + 8, bold, 8); }
  y -= 5; page.drawRectangle({ x: MG, y, width: CW, height: 0.5, color: rgb(0.8, 0.8, 0.8) }); y -= 14;

  data.items.forEach((item, i) => {
    checkPage(30); dt(`${i + 1}`, MG + 4, y, font, 9);
    let desc = item.name; if (item.description) desc += ` - ${item.description}`;
    if (item.discount && item.discount > 0) desc += ` (${item.discount}% Rabatt)`;
    const maxNW = CW * (hp ? 0.5 : 0.72); const nl = wt(desc, font, 9, maxNW);
    nl.forEach((line, li) => {
      dt(line, MG + 30, y, font, 9);
      if (li === 0) { dt(`${item.quantity}`, MG + CW * (hp ? 0.57 : 0.82), y, font, 9);
        if (hp && item.unitPrice != null) { dt(fm(item.unitPrice), MG + CW * 0.67, y, font, 9); dt(fm(item.totalPrice || 0), MG + CW * 0.87, y, font, 9); }
      } y -= 13;
    }); y -= 3;
    page.drawRectangle({ x: MG, y: y + 10, width: CW, height: 0.3, color: rgb(0.92, 0.92, 0.92) });
  });
  y -= 10;

  if (data.totals) {
    checkPage(100); const tx = MG + CW * 0.6; const vx = W - MG - 5;
    if (data.totals.deliveryCost && data.totals.deliveryCost > 0) {
      dt("Transportkosten:", tx, y, font, 9); const dcT = fm(data.totals.deliveryCost); dt(dcT, vx - font.widthOfTextAtSize(dcT, 9), y, font, 9); y -= 16;
    }
    page.drawRectangle({ x: tx, y: y + 12, width: CW * 0.4, height: 0.5, color: rgb(0.7, 0.7, 0.7) });
    dt("Nettobetrag:", tx, y, font, 9); const ntT = fm(data.totals.net); dt(ntT, vx - font.widthOfTextAtSize(ntT, 9), y, font, 9); y -= 16;
    if (data.totals.isReverseCharge) { dt("USt. (Reverse Charge):", tx, y, font, 9); dt("0,00 EUR", vx - font.widthOfTextAtSize("0,00 EUR", 9), y, font, 9); }
    else { dt(`USt. ${data.totals.vatRate}%:`, tx, y, font, 9); const vT = fm(data.totals.vat); dt(vT, vx - font.widthOfTextAtSize(vT, 9), y, font, 9); }
    y -= 16; page.drawRectangle({ x: tx, y: y + 12, width: CW * 0.4, height: 1, color: rgb(0, 0.314, 0.49) });
    dt("Bruttobetrag:", tx, y, bold, 10); const gT = fm(data.totals.gross); dt(gT, vx - bold.widthOfTextAtSize(gT, 10), y, bold, 10); y -= 22;
    if (data.totals.dueDate) { 
      const paymentText = data.totals.paymentDueDays === 0 
        ? "Zahlungsziel: Vorkasse" 
        : `Zahlbar bis: ${fd(data.totals.dueDate)} (${data.totals.paymentDueDays} Tage netto)`;
      dt(paymentText, MG, y, font, 9); y -= 16; 
    }
    if (data.totals.isReverseCharge) { dt("Steuerschuldnerschaft des Leistungsempfaengers (Reverse Charge)", MG, y, font, 8, rgb(0.5, 0.5, 0.5)); y -= 16; }
    y -= 5; dt("Bankverbindung:", MG, y, bold, 9); y -= 13;
    dt(`${SLT_COMPANY.bankName} | IBAN: ${SLT_COMPANY.iban} | BIC: ${SLT_COMPANY.bic}`, MG, y, font, 8, rgb(0.4, 0.4, 0.4)); y -= 20;
  }

  for (const sec of data.sections) {
    checkPage(30); dt(sec.label + ":", MG, y, bold, 9); y -= 14;
    const lines = wt(sec.value, font, 9, CW);
    for (const line of lines) { checkPage(15); dt(line, MG, y, font, 9); y -= 13; }
    y -= 8;
  }

  if (data.signatures) {
    checkPage(90); y -= 10;
    page.drawRectangle({ x: MG, y: y + 5, width: CW, height: 0.5, color: rgb(0.8, 0.8, 0.8) }); y -= 55;
    for (const [sigData, xOff] of [[data.signatures.customerData, 0], [data.signatures.staffData, CW / 2 + 10]] as [string | undefined, number][]) {
      if (sigData) { try {
        const b64 = sigData.split(',')[1]; const sb = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const si = sigData.includes('png') ? await doc.embedPng(sb) : await doc.embedJpg(sb);
        const sc = Math.min(120 / si.width, 45 / si.height);
        page.drawImage(si, { x: MG + xOff, y, width: si.width * sc, height: si.height * sc });
      } catch {} }
    }
    y -= 8;
    page.drawRectangle({ x: MG, y, width: CW / 2 - 15, height: 0.5, color: rgb(0.6, 0.6, 0.6) });
    page.drawRectangle({ x: MG + CW / 2 + 10, y, width: CW / 2 - 10, height: 0.5, color: rgb(0.6, 0.6, 0.6) });
    y -= 12; dt("Kunde", MG, y, font, 8, rgb(0.5, 0.5, 0.5));
    dt(`Mitarbeiter: ${data.signatures.staffName || ''}`, MG + CW / 2 + 10, y, font, 8, rgb(0.5, 0.5, 0.5));
  }

  const footerLines = [
    `${SLT_COMPANY.name} - GF: ${SLT_COMPANY.managingDirector} - Tel: ${SLT_COMPANY.phone} - FAX: ${SLT_COMPANY.fax} - Mobil: ${SLT_COMPANY.mobil}`,
    `${SLT_COMPANY.street} - ${SLT_COMPANY.city} - Steuer-Nr. ${SLT_COMPANY.steuerNr} - USt-ID ${SLT_COMPANY.ustId} - ${SLT_COMPANY.registry}`,
    `${SLT_COMPANY.bankName} - IBAN: ${SLT_COMPANY.iban} - BIC: ${SLT_COMPANY.bic} - Kontoinhaber: ${SLT_COMPANY.name}`,
    `${SLT_COMPANY.web} - ${SLT_COMPANY.email} - ${SLT_COMPANY.facebook}`,
  ];
  for (let i = 0; i < doc.getPageCount(); i++) {
    const p = doc.getPage(i);
    p.drawRectangle({ x: MG, y: MG + 20, width: CW, height: 0.5, color: rgb(0, 0.314, 0.49) });
    footerLines.forEach((line, li) => {
      try {
        const tw = font.widthOfTextAtSize(line, 5.5);
        p.drawText(line, { x: (W - tw) / 2, y: MG + 14 - li * 7, size: 5.5, font, color: rgb(0.5, 0.5, 0.5) });
      } catch {}
    });
  }

  return await doc.save();
}
