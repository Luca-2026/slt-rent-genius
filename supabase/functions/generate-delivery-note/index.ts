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

const DE_TIMEZONE = "Europe/Berlin";

/** Get current date string in German timezone (YYYY-MM-DD) */
function getGermanDateString(): string {
  const now = new Date();
  const year = now.toLocaleString("en-US", { timeZone: DE_TIMEZONE, year: "numeric" });
  const month = now.toLocaleString("en-US", { timeZone: DE_TIMEZONE, month: "2-digit" });
  const day = now.toLocaleString("en-US", { timeZone: DE_TIMEZONE, day: "2-digit" });
  return `${year}-${month}-${day}`;
}

/** Get current datetime string in German timezone (dd.MM.yyyy, HH:mm Uhr) */
function getGermanDateTimeString(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("de-DE", {
    timeZone: DE_TIMEZONE,
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("de-DE", {
    timeZone: DE_TIMEZONE,
    hour: "2-digit", minute: "2-digit",
  });
  return `${dateStr}, ${timeStr} Uhr`;
}

/** Format a YYYY-MM-DD date string to dd.MM.yyyy */
function formatDateStr(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface DeliveryNoteRequest {
  offer_id: string;
  signature_data: string;
  staff_signature_data: string;
  staff_name: string;
  notes?: string;
  known_defects?: string;
  additional_defects?: string;
  photo_urls?: string[];
  send_email?: boolean;
  agb_accepted?: boolean;
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

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: DeliveryNoteRequest = await req.json();
    const { offer_id, signature_data, staff_signature_data, staff_name, notes, known_defects, additional_defects, photo_urls, send_email = true, agb_accepted = false } = body;

    if (!offer_id || !signature_data || !staff_signature_data || !staff_name) {
      return new Response(
        JSON.stringify({ error: "offer_id, signature_data, staff_signature_data and staff_name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating delivery note (Übergabeprotokoll) for offer:", offer_id);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch offer with items
    const { data: offer, error: offerError } = await serviceClient
      .from("b2b_offers")
      .select("*")
      .eq("id", offer_id)
      .single();

    if (offerError || !offer) {
      console.error("Offer not found:", offerError);
      return new Response(JSON.stringify({ error: "Offer not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: offerItems, error: itemsError } = await serviceClient
      .from("b2b_offer_items")
      .select("*")
      .eq("offer_id", offer_id);

    if (itemsError) {
      console.error("Error fetching offer items:", itemsError);
    }

    const { data: profile, error: profileError } = await serviceClient
      .from("b2b_profiles")
      .select("*")
      .eq("id", offer.b2b_profile_id)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found:", profileError);
      return new Response(JSON.stringify({ error: "B2B profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let reservation: any = null;
    if (offer.reservation_id) {
      const { data: resData } = await serviceClient
        .from("b2b_reservations")
        .select("*")
        .eq("id", offer.reservation_id)
        .single();
      reservation = resData;
    }

    const { data: noteNumber, error: numError } = await serviceClient
      .rpc("generate_delivery_note_number");

    if (numError) {
      console.error("Error generating delivery note number:", numError);
      return new Response(JSON.stringify({ error: "Failed to generate delivery note number" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const deliveryNoteNumber = noteNumber as string;
    console.log("Delivery note number:", deliveryNoteNumber);

    // Use German timezone for date
    const germanDate = getGermanDateString();
    const germanDateTime = getGermanDateTimeString();

    const html = generateDeliveryNoteHtml({
      deliveryNoteNumber,
      date: germanDate,
      dateTime: germanDateTime,
      profile,
      items: offerItems || [],
      offerNumber: offer.offer_number,
      reservation,
      signatureData: signature_data,
      staffSignatureData: staff_signature_data,
      staffName: staff_name,
      notes: notes || offer.notes || null,
      knownDefects: known_defects || null,
      additionalDefects: additional_defects || null,
      agbAccepted: agb_accepted,
      photoUrls: photo_urls || [],
    });

    // File name updated to Übergabeprotokoll
    const fileName = `Uebergabeprotokoll_SLTRental_${deliveryNoteNumber}_${profile.company_name.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "_")}.html`;
    const filePath = `delivery-notes/${profile.id}/${fileName}`;

    const htmlBytes = new TextEncoder().encode(html);
    const { error: uploadError } = await serviceClient.storage
      .from("b2b-invoices")
      .upload(filePath, htmlBytes, {
        contentType: "text/html; charset=utf-8",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload delivery note" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: signedUrlData } = await serviceClient.storage
      .from("b2b-invoices")
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    const fileUrl = signedUrlData?.signedUrl || "";

    const now = new Date().toISOString();
    const { data: deliveryNote, error: dnError } = await serviceClient
      .from("b2b_delivery_notes")
      .insert({
        offer_id,
        reservation_id: offer.reservation_id || null,
        b2b_profile_id: profile.id,
        delivery_note_number: deliveryNoteNumber,
        status: "signed",
        signature_data,
        file_url: fileUrl,
        file_name: fileName,
        notes: notes || null,
        known_defects: known_defects || null,
        additional_defects: additional_defects || null,
        photo_urls: photo_urls || [],
        signed_at: now,
        agb_accepted: agb_accepted,
        agb_accepted_at: agb_accepted ? now : null,
      })
      .select()
      .single();

    if (dnError) {
      console.error("Delivery note insert error:", dnError);
      return new Response(JSON.stringify({ error: "Failed to create delivery note record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (offerItems && offerItems.length > 0) {
      const dnItems = offerItems.map((item: any) => ({
        delivery_note_id: deliveryNote.id,
        product_name: item.product_name,
        description: item.description || null,
        quantity: item.quantity,
      }));

      const { error: dnItemsError } = await serviceClient
        .from("b2b_delivery_note_items")
        .insert(dnItems);

      if (dnItemsError) {
        console.error("Delivery note items error:", dnItemsError);
      }
    }

    // Send email
    let emailSent = false;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey && send_email) {
      try {
        const customerEmail = profile.billing_email || profile.contact_email;
        const customerName = `${profile.contact_first_name} ${profile.contact_last_name}`;

        const itemsList = (offerItems || []).map((item: any) =>
          `<li style="padding:4px 0;font-size:14px;">${item.quantity}x ${escapeHtml(item.product_name)}${item.description ? ` – ${escapeHtml(item.description)}` : ""}</li>`
        ).join("");

        const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#00507d;padding:30px 40px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:600;">SLT-Rental</h1>
      <p style="color:#b3d4e8;margin:6px 0 0;font-size:13px;">Ihr Übergabeprotokoll</p>
    </div>
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;margin-bottom:20px;">
        Guten Tag ${escapeHtml(customerName)},
      </p>
      <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:25px;">
        anbei erhalten Sie Ihr unterschriebenes Übergabeprotokoll <strong>${deliveryNoteNumber}</strong>
        ${offer.offer_number ? ` (zu Angebot ${offer.offer_number})` : ""}.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="font-size:13px;font-weight:600;margin:0 0 8px;color:#333;">Übergebene Artikel:</p>
        <ul style="margin:0;padding-left:20px;color:#555;">
          ${itemsList}
        </ul>
      </div>
      <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:25px;">
        Das vollständige Übergabeprotokoll mit Unterschrift finden Sie auch in Ihrem B2B-Portal.
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://slt-rent-genius.lovable.app/b2b/uebergabeprotokolle" 
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
            subject: `Ihr Übergabeprotokoll ${deliveryNoteNumber} – SLT-Rental`,
            html: emailHtml,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log("Übergabeprotokoll email sent to:", customerEmail);

          await serviceClient
            .from("b2b_delivery_notes")
            .update({ email_sent: true, email_sent_at: new Date().toISOString() })
            .eq("id", deliveryNote.id);
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
        delivery_note: {
          id: deliveryNote.id,
          delivery_note_number: deliveryNoteNumber,
          file_url: fileUrl,
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

// ─── HTML Generator ─────────────────────────────────────────
function generateDeliveryNoteHtml(data: {
  deliveryNoteNumber: string;
  date: string;
  dateTime: string;
  profile: any;
  items: any[];
  offerNumber: string;
  reservation: any;
  signatureData: string;
  staffSignatureData: string;
  staffName: string;
  notes: string | null;
  knownDefects: string | null;
  additionalDefects: string | null;
  agbAccepted: boolean;
  photoUrls: string[];
}): string {
  const itemRows = data.items
    .map(
      (item: any, i: number) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${i + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">
        <strong>${escapeHtml(item.product_name)}</strong>
        ${item.description ? `<br><span style="color:#595959;font-size:12px;">${escapeHtml(item.description)}</span>` : ""}
        ${item.rental_start ? `<br><span style="color:#595959;font-size:11px;">Zeitraum: ${formatDateStr(item.rental_start)}${item.rental_end ? " – " + formatDateStr(item.rental_end) : ""}</span>` : ""}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:500;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">
        <span style="display:inline-block;width:16px;height:16px;border:2px solid #00507d;border-radius:3px;background:#00507d;color:white;font-size:12px;line-height:16px;text-align:center;">✓</span>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Übergabeprotokoll ${data.deliveryNoteNumber}</title>
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
  <button class="print-btn no-print" onclick="window.print()">🖨️ Drucken / PDF</button>

  <div style="max-width:210mm;margin:0 auto;padding:20mm 15mm;">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10mm;padding-bottom:8mm;border-bottom:3px solid #00507d;">
      <div>
        <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:120px;width:auto;margin-bottom:6px;" />
        <p style="font-size:11px;color:#595959;">${SLT_COMPANY.name}</p>
        <p style="font-size:11px;color:#595959;">${SLT_COMPANY.street}, ${SLT_COMPANY.city}</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:22px;font-weight:700;color:#393d46;">ÜBERGABEPROTOKOLL</p>
        <p style="font-size:13px;color:#595959;margin-top:4px;">Nr. ${data.deliveryNoteNumber}</p>
      </div>
    </div>

    <!-- Sender line -->
    <p style="font-size:9px;color:#999;margin-bottom:5mm;border-bottom:1px solid #ccc;padding-bottom:2mm;">
      ${SLT_COMPANY.name} · ${SLT_COMPANY.street} · ${SLT_COMPANY.city}
    </p>

    <!-- Address block + Meta -->
    <div style="display:flex;justify-content:space-between;margin-bottom:12mm;">
      <div style="max-width:55%;">
        <p style="font-weight:600;font-size:14px;margin-bottom:4px;">${escapeHtml(data.profile.company_name)}</p>
        ${data.profile.legal_form ? `<p style="font-size:12px;color:#595959;">${escapeHtml(data.profile.legal_form)}</p>` : ""}
        <p style="font-size:13px;">${escapeHtml(data.profile.street)}${data.profile.house_number ? " " + escapeHtml(data.profile.house_number) : ""}</p>
        <p style="font-size:13px;">${escapeHtml(data.profile.postal_code)} ${escapeHtml(data.profile.city)}</p>
        <p style="font-size:13px;">${escapeHtml(data.profile.country || "Deutschland")}</p>
      </div>
      <div style="text-align:right;">
        <table style="font-size:13px;margin-left:auto;">
          <tr><td style="color:#595959;padding-right:12px;">Datum:</td><td style="font-weight:500;">${formatDateStr(data.date)}</td></tr>
          <tr><td style="color:#595959;padding-right:12px;">Angebotsnr.:</td><td style="font-weight:500;">${data.offerNumber}</td></tr>
          <tr><td style="color:#595959;padding-right:12px;">Kundennr.:</td><td style="font-weight:500;">${data.profile.id.substring(0, 8).toUpperCase()}</td></tr>
          ${data.reservation ? `<tr><td style="color:#595959;padding-right:12px;">Standort:</td><td style="font-weight:500;text-transform:capitalize;">${data.reservation.location}</td></tr>` : ""}
        </table>
      </div>
    </div>

    <!-- Intro -->
    <p style="font-size:13px;margin-bottom:8mm;line-height:1.6;">
      Hiermit bestätigen wir die Übergabe folgender Mietgegenstände:
    </p>

    <!-- Items table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:8mm;">
      <thead>
        <tr style="background:#00507d;color:white;">
          <th style="padding:10px 12px;text-align:left;font-weight:600;width:5%;">Pos.</th>
          <th style="padding:10px 12px;text-align:left;font-weight:600;width:65%;">Bezeichnung / Beschreibung</th>
          <th style="padding:10px 12px;text-align:center;font-weight:600;width:15%;">Menge</th>
          <th style="padding:10px 12px;text-align:center;font-weight:600;width:15%;">Erhalten ✓</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    ${(data.knownDefects || data.additionalDefects) ? `
    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:6px;padding:14px;margin-bottom:8mm;">
      <p style="font-weight:600;color:#854d0e;margin-bottom:8px;">⚠ Mängeldokumentation</p>
      ${data.knownDefects ? `
      <p style="font-size:12px;color:#713f12;margin-bottom:6px;">
        <strong>Bekannte Mängel (vor Übergabe):</strong><br>
        ${escapeHtml(data.knownDefects)}
      </p>` : ""}
      ${data.additionalDefects ? `
      <p style="font-size:12px;color:#713f12;">
        <strong>Weitere Mängel bei Übergabe:</strong><br>
        ${escapeHtml(data.additionalDefects)}
      </p>` : ""}
    </div>` : ""}

    ${data.photoUrls && data.photoUrls.length > 0 ? `
    <div style="margin-bottom:8mm;">
      <p style="font-weight:600;margin-bottom:8px;">📷 Fotodokumentation (${data.photoUrls.length} ${data.photoUrls.length === 1 ? "Foto" : "Fotos"})</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${data.photoUrls.map((url: string, i: number) => `
        <div style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
          <img src="${url}" alt="Schadensfoto ${i + 1}" style="width:180px;height:135px;object-fit:cover;display:block;" />
          <p style="font-size:10px;color:#595959;text-align:center;padding:4px;">Foto ${i + 1}</p>
        </div>`).join("")}
      </div>
    </div>` : ""}

    ${data.notes ? `
    <div style="margin-bottom:8mm;">
      <p style="font-weight:600;margin-bottom:4px;">Anmerkungen:</p>
      <p style="color:#595959;font-size:12px;">${escapeHtml(data.notes)}</p>
    </div>` : ""}

    <!-- Legal Declarations -->
    <div style="background:#f0f7fb;border-left:4px solid #00507d;padding:14px 18px;margin-bottom:8mm;font-size:12px;line-height:1.7;">
      <strong style="font-size:13px;">Rechtliche Erklärungen:</strong><br><br>
      <strong>1. Empfangsbestätigung</strong><br>
      Der Mieter bestätigt hiermit den vollständigen und ordnungsgemäßen Empfang der oben aufgeführten Mietgegenstände. 
      Etwaige Mängel oder Beschädigungen sind unverzüglich bei Übergabe schriftlich zu dokumentieren. 
      Nicht gemeldete Mängel gelten als bei Übergabe nicht vorhanden (§ 536b BGB analog).<br><br>
      <strong>2. Angebotsannahme</strong><br>
      Der Mieter bestätigt, dass das Angebot Nr. <strong>${data.offerNumber}</strong> der ${SLT_COMPANY.name} 
      angenommen wurde und die darin enthaltenen Konditionen, Preise und Mietbedingungen 
      Vertragsbestandteil sind (§§ 145 ff. BGB).<br><br>
      <strong>3. Allgemeine Geschäftsbedingungen</strong><br>
      ${data.agbAccepted 
        ? `<span style="color:#00507d;">✓</span> Der Mieter erklärt hiermit, die <strong>Allgemeinen Geschäftsbedingungen (AGB)</strong> 
           der ${SLT_COMPANY.name} (Marke: ${SLT_COMPANY.brand}), einsehbar unter 
           <a href="https://slt-rent-genius.lovable.app/agb" style="color:#00507d;">www.slt-rental.de/agb</a>, 
           vor Vertragsschluss zur Kenntnis genommen und deren Geltung ausdrücklich anerkannt zu haben. 
           Die AGB wurden am <strong>${data.dateTime}</strong> akzeptiert.` 
        : `Die Allgemeinen Geschäftsbedingungen der ${SLT_COMPANY.name} sind Vertragsbestandteil. 
           Der Mieter bestätigt, diese vor Vertragsschluss zur Kenntnis genommen zu haben.`}<br><br>
      <strong>4. Haftung & Sorgfaltspflicht</strong><br>
      Der Mieter verpflichtet sich, die Mietgegenstände pfleglich zu behandeln und sachgemäß zu verwenden. 
      Für Schäden, die über die normale Abnutzung hinausgehen, haftet der Mieter gemäß den vertraglichen 
      und gesetzlichen Bestimmungen (§§ 535 ff. BGB).<br><br>
      <strong>5. Rückgabe</strong><br>
      Die Mietgegenstände sind in dem Zustand zurückzugeben, in dem sie übergeben wurden (unter Berücksichtigung 
      normaler Gebrauchsspuren). Der Rückgabezustand wird in einem separaten Rückgabeprotokoll dokumentiert.
    </div>

    <!-- Signature section -->
    <div style="display:flex;justify-content:space-between;margin-bottom:10mm;gap:15mm;">
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:6px;padding:12px;">
        <p style="font-weight:600;font-size:12px;margin-bottom:4px;color:#00507d;">Übergabe durch ${SLT_COMPANY.brand}:</p>
        <div style="height:100px;margin-bottom:4px;">
          <img src="${data.staffSignatureData}" alt="Unterschrift SLT-Mitarbeiter" style="max-height:90px;max-width:100%;" />
        </div>
        <div style="border-bottom:1px solid #393d46;margin-bottom:4px;"></div>
        <p style="font-size:11px;color:#595959;">${data.dateTime} · ${escapeHtml(data.staffName)}</p>
        <p style="font-size:10px;color:#999;">Bevollmächtigter Mitarbeiter, ${SLT_COMPANY.name}</p>
      </div>
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:6px;padding:12px;">
        <p style="font-weight:600;font-size:12px;margin-bottom:4px;color:#00507d;">Empfang bestätigt durch Mieter:</p>
        <div style="height:100px;margin-bottom:4px;">
          <img src="${data.signatureData}" alt="Unterschrift Mieter" style="max-height:90px;max-width:100%;" />
        </div>
        <div style="border-bottom:1px solid #393d46;margin-bottom:4px;"></div>
        <p style="font-size:11px;color:#595959;">${data.dateTime} · ${escapeHtml(data.profile.contact_first_name)} ${escapeHtml(data.profile.contact_last_name)}</p>
        <p style="font-size:10px;color:#999;">Vertretungsberechtigte Person, ${escapeHtml(data.profile.company_name)}</p>
      </div>
    </div>

    <!-- Legal notice -->
    <div style="background:#fefce8;border:1px solid #fbbf24;border-radius:4px;padding:10px 14px;margin-bottom:8mm;font-size:10px;color:#92400e;line-height:1.5;">
      <strong>Hinweis gem. § 309 Nr. 12 BGB:</strong> Dieses Übergabeprotokoll dient als Nachweis der Übergabe der Mietgegenstände. 
      Beide Parteien erhalten eine Ausfertigung. Dieses Dokument wurde elektronisch erstellt und ist ohne handschriftliche 
      Unterschrift im Original gültig, sofern die digitale Signatur korrekt erfasst wurde (vgl. § 126a BGB, elektronische Form).
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
