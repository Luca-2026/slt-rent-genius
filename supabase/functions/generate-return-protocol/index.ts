import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

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

interface ReturnProtocolRequest {
  reservation_id: string;
  customer_signature_data: string;
  staff_signature_data: string;
  staff_name: string;
  overall_condition: "good" | "minor_damage" | "major_damage";
  condition_notes?: string;
  damage_description?: string;
  cleaning_required?: boolean;
  all_items_returned?: boolean;
  missing_items_notes?: string;
  meter_reading_start?: string;
  meter_reading_end?: string;
  fuel_level_start?: string;
  fuel_level_end?: string;
  cleanliness_rating?: number;
  known_defects_from_delivery?: string;
  additional_defects_at_return?: string;
  photo_urls?: string[];
  items: {
    product_name: string;
    description?: string;
    quantity: number;
    condition: "good" | "minor_damage" | "major_damage" | "missing";
    condition_notes?: string;
  }[];
  notes?: string;
  send_email?: boolean;
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

    // Check admin or staff role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "standort_mitarbeiter"]);

    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: "Admin or staff access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ReturnProtocolRequest = await req.json();
    const {
      reservation_id,
      customer_signature_data,
      staff_signature_data,
      staff_name,
      overall_condition,
      condition_notes,
      damage_description,
      cleaning_required = false,
      all_items_returned = true,
      missing_items_notes,
      meter_reading_start,
      meter_reading_end,
      fuel_level_start,
      fuel_level_end,
      cleanliness_rating,
      known_defects_from_delivery,
      additional_defects_at_return,
      photo_urls,
      items,
      notes,
      send_email = true,
    } = body;

    if (!reservation_id || !customer_signature_data || !staff_signature_data || !staff_name) {
      return new Response(
        JSON.stringify({ error: "reservation_id, customer_signature_data, staff_signature_data and staff_name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating return protocol for reservation:", reservation_id);

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

    // Fetch profile
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

    // Find linked delivery note (if any)
    const { data: deliveryNote } = await serviceClient
      .from("b2b_delivery_notes")
      .select("id, delivery_note_number")
      .eq("reservation_id", reservation_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Generate return protocol number
    const { data: rpNumber, error: numError } = await serviceClient
      .rpc("generate_return_protocol_number");

    if (numError) {
      console.error("Error generating return protocol number:", numError);
      return new Response(JSON.stringify({ error: "Failed to generate return protocol number" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const returnProtocolNumber = rpNumber as string;
    console.log("Return protocol number:", returnProtocolNumber);

    // Generate HTML document
    const html = generateReturnProtocolHtml({
      returnProtocolNumber,
      date: new Date().toISOString().split("T")[0],
      profile,
      reservation,
      items: items || [],
      customerSignatureData: customer_signature_data,
      staffSignatureData: staff_signature_data,
      staffName: staff_name,
      overallCondition: overall_condition,
      conditionNotes: condition_notes || null,
      damageDescription: damage_description || null,
      cleaningRequired: cleaning_required,
      allItemsReturned: all_items_returned,
      missingItemsNotes: missing_items_notes || null,
      meterReadingStart: meter_reading_start || null,
      meterReadingEnd: meter_reading_end || null,
      fuelLevelStart: fuel_level_start || null,
      fuelLevelEnd: fuel_level_end || null,
      cleanlinessRating: cleanliness_rating || null,
      knownDefectsFromDelivery: known_defects_from_delivery || null,
      additionalDefectsAtReturn: additional_defects_at_return || null,
      photoUrls: photo_urls || [],
      notes: notes || null,
      deliveryNoteNumber: deliveryNote?.delivery_note_number || null,
    });

    // Upload HTML to storage
    const fileName = `Rueckgabeprotokoll_SLTRental_${returnProtocolNumber}_${profile.company_name.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "_")}.html`;
    const filePath = `return-protocols/${profile.id}/${fileName}`;

    const htmlBytes = new TextEncoder().encode(html);
    const { error: uploadError } = await serviceClient.storage
      .from("b2b-invoices")
      .upload(filePath, htmlBytes, {
        contentType: "text/html; charset=utf-8",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload return protocol" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get signed URL (1 year)
    const { data: signedUrlData } = await serviceClient.storage
      .from("b2b-invoices")
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    const fileUrl = signedUrlData?.signedUrl || "";
    const now = new Date().toISOString();

    // Create return protocol record
    const { data: returnProtocol, error: rpError } = await serviceClient
      .from("b2b_return_protocols")
      .insert({
        reservation_id,
        b2b_profile_id: profile.id,
        delivery_note_id: deliveryNote?.id || null,
        return_protocol_number: returnProtocolNumber,
        status: "signed",
        overall_condition,
        condition_notes: condition_notes || null,
        damage_description: damage_description || null,
        cleaning_required,
        all_items_returned,
        missing_items_notes: missing_items_notes || null,
        meter_reading_start: meter_reading_start || null,
        meter_reading_end: meter_reading_end || null,
        known_defects_from_delivery: known_defects_from_delivery || null,
        additional_defects_at_return: additional_defects_at_return || null,
        photo_urls: photo_urls || [],
        customer_signature_data,
        staff_signature_data,
        staff_name,
        signed_at: now,
        file_url: fileUrl,
        file_name: fileName,
        notes: notes || null,
      })
      .select()
      .single();

    if (rpError) {
      console.error("Return protocol insert error:", rpError);
      return new Response(JSON.stringify({ error: "Failed to create return protocol record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert return protocol items
    if (items && items.length > 0) {
      const rpItems = items.map((item) => ({
        return_protocol_id: returnProtocol.id,
        product_name: item.product_name,
        description: item.description || null,
        quantity: item.quantity,
        condition: item.condition,
        condition_notes: item.condition_notes || null,
      }));

      const { error: rpItemsError } = await serviceClient
        .from("b2b_return_protocol_items")
        .insert(rpItems);

      if (rpItemsError) {
        console.error("Return protocol items error:", rpItemsError);
      }
    }

    // Update reservation status to completed (including grouped reservations)
    if (reservation.rental_group_id) {
      const { error: groupUpdateErr } = await serviceClient
        .from("b2b_reservations")
        .update({ status: "completed" })
        .eq("rental_group_id", reservation.rental_group_id);
      if (groupUpdateErr) {
        console.error("Error updating grouped reservations to completed:", groupUpdateErr);
      } else {
        console.log("All grouped reservations set to completed for group:", reservation.rental_group_id);
      }
    } else {
      await serviceClient
        .from("b2b_reservations")
        .update({ status: "completed" })
        .eq("id", reservation_id);
      console.log("Reservation status set to completed:", reservation_id);
    }

    // Send email notification
    let emailSent = false;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey && send_email) {
      try {
        const customerEmail = profile.contact_email;
        const customerName = `${profile.contact_first_name} ${profile.contact_last_name}`;
        const conditionLabel = overall_condition === "good" ? "Gut – Keine Beanstandungen"
          : overall_condition === "minor_damage" ? "Leichte Gebrauchsspuren / kleine Mängel"
          : "Erhebliche Schäden dokumentiert";

        const LOCATIONS: Record<string, { name: string; address: string; city: string; phone: string; email: string; manager: string }> = {
          krefeld: { name: "SLT Rental Krefeld", address: "Anrather Straße 291", city: "47807 Krefeld", phone: "02151 417 99 04", email: "krefeld@slt-rental.de", manager: "Benedikt Nöchel" },
          bonn: { name: "SLT Rental Bonn", address: "Drachenburgstraße 8", city: "53179 Bonn", phone: "0228 504 660 61", email: "bonn@slt-rental.de", manager: "Ersel Uzun" },
          muelheim: { name: "SLT Rental Mülheim", address: "Ruhrorter Str. 122", city: "45478 Mülheim an der Ruhr", phone: "02151 417 99 04", email: "muelheim@slt-rental.de", manager: "Andreas Scherzow" },
        };
        const loc = LOCATIONS[profile.assigned_location || ""] || LOCATIONS["krefeld"];

        // Generate PDF for email attachment
        const pdfBytes = await generateDocumentPdf({
          title: "RUECKGABEPROTOKOLL",
          documentNumber: returnProtocolNumber,
          date: new Date().toISOString().split("T")[0],
          profile,
          items: (items || []).map((item) => ({
            name: item.product_name,
            description: `Zustand: ${item.condition === "good" ? "Gut" : item.condition === "minor_damage" ? "Leichte Maengel" : item.condition === "major_damage" ? "Erhebliche Schaeden" : "Fehlend"}${item.condition_notes ? ' - ' + item.condition_notes : ''}`,
            quantity: item.quantity,
          })),
          sections: [
            { label: "Gesamtzustand", value: conditionLabel },
            ...(condition_notes ? [{ label: "Zustandsnotizen", value: condition_notes }] : []),
            ...(damage_description ? [{ label: "Schadensbeschreibung", value: damage_description }] : []),
            ...(cleaning_required ? [{ label: "Reinigung erforderlich", value: "Ja" }] : []),
            ...(!all_items_returned ? [{ label: "Fehlende Gegenstaende", value: missing_items_notes || "Nicht alle Artikel zurueckgegeben" }] : []),
            ...(meter_reading_start || meter_reading_end ? [{ label: "Betriebsstunden", value: `Start: ${meter_reading_start || '-'} / Ende: ${meter_reading_end || '-'}` }] : []),
            ...(fuel_level_start || fuel_level_end ? [{ label: "Tankfuellstand", value: `Start: ${fuel_level_start || '-'} / Ende: ${fuel_level_end || '-'}` }] : []),
            ...(cleanliness_rating ? [{ label: "Sauberkeit (1-5)", value: String(cleanliness_rating) }] : []),
            ...(known_defects_from_delivery ? [{ label: "Bekannte Maengel aus Uebergabe", value: known_defects_from_delivery }] : []),
            ...(additional_defects_at_return ? [{ label: "Neue Maengel bei Rueckgabe", value: additional_defects_at_return }] : []),
            ...(notes ? [{ label: "Bemerkungen", value: notes }] : []),
          ],
          signatures: { customerData: customer_signature_data, staffData: staff_signature_data, staffName: staff_name },
        });
        const pdfBase64 = encodeBase64(pdfBytes);
        const pdfFileName = fileName.replace(".html", ".pdf");
        const attachments = [{
          filename: pdfFileName,
          content: pdfBase64,
          content_type: "application/pdf",
        }];

        const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f8;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#ffffff;padding:25px 40px;text-align:center;border-bottom:3px solid #00507d;">
      <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:70px;width:auto;" />
    </div>
    <div style="background:#00507d;padding:14px 40px;text-align:center;">
      <p style="color:#ffffff;margin:0;font-size:15px;font-weight:600;">Rückgabeprotokoll</p>
    </div>
    <div style="padding:35px 40px;">
      <p style="font-size:15px;color:#333;margin-bottom:20px;">Guten Tag ${escapeHtml(customerName)},</p>
      <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:25px;">
        die Rückgabe wurde dokumentiert. Anbei finden Sie Ihr Rückgabeprotokoll <strong>${returnProtocolNumber}</strong>.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="font-size:13px;font-weight:600;margin:0 0 8px;color:#333;">Zustand bei Rückgabe:</p>
        <p style="font-size:14px;color:#555;margin:0;">${conditionLabel}</p>
      </div>
      <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:25px;">
        Das vollständige Rückgabeprotokoll mit Unterschriften finden Sie als Anhang dieser E-Mail sowie in Ihrem B2B-Portal.
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://slt-rent-genius.lovable.app/b2b/dashboard" 
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

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
            to: [customerEmail],
            subject: `Rückgabeprotokoll ${returnProtocolNumber} – SLT-Rental`,
            html: emailHtml,
            attachments,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log("Return protocol email sent to:", customerEmail);
          await serviceClient
            .from("b2b_return_protocols")
            .update({ email_sent: true, email_sent_at: new Date().toISOString() })
            .eq("id", returnProtocol.id);
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
        return_protocol: {
          id: returnProtocol.id,
          return_protocol_number: returnProtocolNumber,
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
function generateReturnProtocolHtml(data: {
  returnProtocolNumber: string;
  date: string;
  profile: any;
  reservation: any;
  items: any[];
  customerSignatureData: string;
  staffSignatureData: string;
  staffName: string;
  overallCondition: string;
  conditionNotes: string | null;
  damageDescription: string | null;
  cleaningRequired: boolean;
  allItemsReturned: boolean;
  missingItemsNotes: string | null;
  meterReadingStart: string | null;
  meterReadingEnd: string | null;
  fuelLevelStart: string | null;
  fuelLevelEnd: string | null;
  cleanlinessRating: number | null;
  knownDefectsFromDelivery: string | null;
  additionalDefectsAtReturn: string | null;
  photoUrls: string[];
  notes: string | null;
  deliveryNoteNumber: string | null;
}): string {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const now = new Date();
  const dateTimeStr = now.toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }) + ", " + now.toLocaleTimeString("de-DE", {
    hour: "2-digit", minute: "2-digit",
  }) + " Uhr";

  const conditionLabels: Record<string, string> = {
    good: "Gut – Keine Beanstandungen",
    minor_damage: "Leichte Gebrauchsspuren / kleine Mängel",
    major_damage: "Erhebliche Schäden",
  };

  const itemConditionLabels: Record<string, string> = {
    good: "✓ Gut",
    minor_damage: "⚠ Leichte Mängel",
    major_damage: "✗ Erhebliche Schäden",
    missing: "✗ Fehlend",
  };

  const conditionColors: Record<string, string> = {
    good: "#16a34a",
    minor_damage: "#d97706",
    major_damage: "#dc2626",
    missing: "#dc2626",
  };

  const itemRows = data.items
    .map(
      (item: any, i: number) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${i + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">
        <strong>${escapeHtml(item.product_name)}</strong>
        ${item.description ? `<br><span style="color:#595959;font-size:12px;">${escapeHtml(item.description)}</span>` : ""}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">
        <span style="color:${conditionColors[item.condition] || "#333"};font-weight:600;font-size:12px;">
          ${itemConditionLabels[item.condition] || item.condition}
        </span>
        ${item.condition_notes ? `<br><span style="font-size:11px;color:#595959;">${escapeHtml(item.condition_notes)}</span>` : ""}
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rückgabeprotokoll ${data.returnProtocolNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Montserrat', Arial, sans-serif; color: #393d46; font-size: 13px; line-height: 1.5; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      @page { margin: 15mm; size: A4; }
    }
    @media screen and (max-width: 768px) {
      body { font-size: 12px; }
      .doc-container { padding: 4mm 3mm !important; max-width: 100% !important; }
      .flex-row { display: block !important; }
      .flex-row > div { text-align: left !important; margin-bottom: 12px; width: 100% !important; max-width: 100% !important; }
      .sig-row { display: block !important; }
      .sig-row > div { margin-bottom: 16px; }
      table { font-size: 11px; }
      td, th { padding: 6px 8px !important; }
      img.photo-img { width: 100px !important; height: 75px !important; }
    }
    .print-btn { position: fixed; top: 20px; right: 20px; background: #00507d; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .print-btn:hover { background: #003d5f; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Drucken / PDF</button>

  <div class="doc-container" style="max-width:210mm;margin:0 auto;padding:20mm 15mm;">
    <!-- Header -->
    <div class="flex-row" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10mm;padding-bottom:8mm;border-bottom:3px solid #00507d;">
      <div>
        <img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental Logo" style="height:160px;width:auto;margin-bottom:6px;" />
        <p style="font-size:11px;color:#595959;">${SLT_COMPANY.name}</p>
        <p style="font-size:11px;color:#595959;">${SLT_COMPANY.street}, ${SLT_COMPANY.city}</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:22px;font-weight:700;color:#393d46;">RÜCKGABEPROTOKOLL</p>
        <p style="font-size:13px;color:#595959;margin-top:4px;">Nr. ${data.returnProtocolNumber}</p>
      </div>
    </div>

    <!-- Sender line -->
    <p style="font-size:9px;color:#999;margin-bottom:5mm;border-bottom:1px solid #ccc;padding-bottom:2mm;">
      ${SLT_COMPANY.name} · ${SLT_COMPANY.street} · ${SLT_COMPANY.city}
    </p>

    <!-- Address block + Meta -->
    <div class="flex-row" style="display:flex;justify-content:space-between;margin-bottom:12mm;">
      <div style="max-width:55%;">
        <p style="font-weight:600;font-size:14px;margin-bottom:4px;">${escapeHtml(data.profile.company_name)}</p>
        ${data.profile.legal_form ? `<p style="font-size:12px;color:#595959;">${escapeHtml(data.profile.legal_form)}</p>` : ""}
        <p style="font-size:13px;">${escapeHtml(data.profile.street)}${data.profile.house_number ? " " + escapeHtml(data.profile.house_number) : ""}</p>
        <p style="font-size:13px;">${escapeHtml(data.profile.postal_code)} ${escapeHtml(data.profile.city)}</p>
        <p style="font-size:13px;">${escapeHtml(data.profile.country || "Deutschland")}</p>
      </div>
      <div style="text-align:right;">
        <table style="font-size:13px;margin-left:auto;">
          <tr><td style="color:#595959;padding-right:12px;">Datum:</td><td style="font-weight:500;">${formatDate(data.date)}</td></tr>
          <tr><td style="color:#595959;padding-right:12px;">Kundennr.:</td><td style="font-weight:500;">${data.profile.id.substring(0, 8).toUpperCase()}</td></tr>
          ${data.deliveryNoteNumber ? `<tr><td style="color:#595959;padding-right:12px;">Lieferschein:</td><td style="font-weight:500;">${data.deliveryNoteNumber}</td></tr>` : ""}
          <tr><td style="color:#595959;padding-right:12px;">Standort:</td><td style="font-weight:500;text-transform:capitalize;">${escapeHtml(data.reservation.location)}</td></tr>
          <tr><td style="color:#595959;padding-right:12px;">Mietzeitraum:</td><td style="font-weight:500;">${formatDate(data.reservation.start_date)}${data.reservation.end_date ? " – " + formatDate(data.reservation.end_date) : ""}</td></tr>
        </table>
      </div>
    </div>

    <!-- Intro -->
    <p style="font-size:13px;margin-bottom:8mm;line-height:1.6;">
      Hiermit wird die ordnungsgemäße Rückgabe folgender Mietgegenstände dokumentiert:
    </p>

    <!-- Items table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:8mm;">
      <thead>
        <tr style="background:#00507d;color:white;">
          <th style="padding:10px 12px;text-align:left;font-weight:600;width:5%;">Pos.</th>
          <th style="padding:10px 12px;text-align:left;font-weight:600;width:50%;">Bezeichnung</th>
          <th style="padding:10px 12px;text-align:center;font-weight:600;width:15%;">Menge</th>
          <th style="padding:10px 12px;text-align:center;font-weight:600;width:30%;">Zustand</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Condition Summary -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:8mm;">
      <p style="font-weight:600;font-size:14px;margin-bottom:10px;">Zustandsbewertung bei Rückgabe</p>
      <table style="width:100%;font-size:13px;">
        <tr>
          <td style="padding:6px 0;color:#595959;width:40%;">Gesamtzustand:</td>
          <td style="padding:6px 0;font-weight:600;color:${conditionColors[data.overallCondition] || "#333"};">
            ${conditionLabels[data.overallCondition] || data.overallCondition}
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#595959;">Reinigung erforderlich:</td>
          <td style="padding:6px 0;font-weight:500;">${data.cleaningRequired ? "Ja" : "Nein"}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#595959;">Alle Artikel vollständig:</td>
          <td style="padding:6px 0;font-weight:500;color:${data.allItemsReturned ? "#16a34a" : "#dc2626"};">
            ${data.allItemsReturned ? "Ja – Vollständig" : "Nein – Unvollständig"}
          </td>
        </tr>
        ${data.meterReadingStart || data.meterReadingEnd ? `
        <tr>
          <td style="padding:6px 0;color:#595959;">Betriebsstunden (Übergabe):</td>
          <td style="padding:6px 0;font-weight:600;">${data.meterReadingStart || "–"}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#595959;">Betriebsstunden (Rückgabe):</td>
          <td style="padding:6px 0;font-weight:600;">${data.meterReadingEnd || "–"}</td>
        </tr>` : ""}
        ${data.fuelLevelStart || data.fuelLevelEnd ? `
        <tr>
          <td style="padding:6px 0;color:#595959;">Tankfüllstand (Übergabe):</td>
          <td style="padding:6px 0;font-weight:500;">${data.fuelLevelStart || "–"}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#595959;">Tankfüllstand (Rückgabe):</td>
          <td style="padding:6px 0;font-weight:500;">${data.fuelLevelEnd || "–"}</td>
        </tr>` : ""}
        ${data.cleanlinessRating ? `
        <tr>
          <td style="padding:6px 0;color:#595959;">Sauberkeit (1-5):</td>
          <td style="padding:6px 0;font-weight:600;">${data.cleanlinessRating} / 5</td>
        </tr>` : ""}
      </table>
    </div>

    ${data.conditionNotes ? `
    <div style="margin-bottom:6mm;">
      <p style="font-weight:600;margin-bottom:4px;">Zustandsbemerkungen:</p>
      <p style="color:#595959;font-size:12px;line-height:1.6;">${escapeHtml(data.conditionNotes)}</p>
    </div>` : ""}

    ${data.damageDescription ? `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:14px;margin-bottom:6mm;">
      <p style="font-weight:600;color:#991b1b;margin-bottom:4px;">Schadensbeschreibung:</p>
      <p style="color:#7f1d1d;font-size:12px;line-height:1.6;">${escapeHtml(data.damageDescription)}</p>
    </div>` : ""}

    ${!data.allItemsReturned && data.missingItemsNotes ? `
    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:6px;padding:14px;margin-bottom:6mm;">
      <p style="font-weight:600;color:#854d0e;margin-bottom:4px;">Fehlende Artikel:</p>
      <p style="color:#713f12;font-size:12px;line-height:1.6;">${escapeHtml(data.missingItemsNotes)}</p>
    </div>` : ""}

    ${(data.knownDefectsFromDelivery || data.additionalDefectsAtReturn) ? `
    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:6px;padding:14px;margin-bottom:6mm;">
      <p style="font-weight:600;color:#854d0e;margin-bottom:8px;">⚠ Mängeldokumentation</p>
      ${data.knownDefectsFromDelivery ? `
      <p style="font-size:12px;color:#713f12;margin-bottom:6px;">
        <strong>Bekannte Mängel (aus Übergabeprotokoll):</strong><br>
        ${escapeHtml(data.knownDefectsFromDelivery)}
      </p>` : ""}
      ${data.additionalDefectsAtReturn ? `
      <p style="font-size:12px;color:#713f12;">
        <strong>Neue / zusätzliche Mängel bei Rückgabe:</strong><br>
        ${escapeHtml(data.additionalDefectsAtReturn)}
      </p>` : ""}
    </div>` : ""}

    ${data.photoUrls && data.photoUrls.length > 0 ? `
    <div style="margin-bottom:8mm;">
      <p style="font-weight:600;margin-bottom:8px;">📷 Fotodokumentation (${data.photoUrls.length} ${data.photoUrls.length === 1 ? 'Foto' : 'Fotos'}):</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${data.photoUrls.map((url: string, i: number) => `
          <a href="${url}" target="_blank" style="display:inline-block;">
            <img class="photo-img" src="${url}" alt="Mangel-Foto ${i + 1}" style="max-height:120px;max-width:180px;border:1px solid #e5e7eb;border-radius:4px;object-fit:cover;" loading="eager" />
          </a>
        `).join("")}
      </div>
    </div>` : ""}

    ${data.notes ? `
    <div style="margin-bottom:8mm;">
      <p style="font-weight:600;margin-bottom:4px;">Anmerkungen:</p>
      <p style="color:#595959;font-size:12px;">${escapeHtml(data.notes)}</p>
    </div>` : ""}

    <!-- Legal Declarations -->
    <div style="background:#f0f7fb;border-left:4px solid #00507d;padding:14px 18px;margin-bottom:8mm;font-size:12px;line-height:1.7;">
      <strong style="font-size:13px;">Rechtliche Erklärungen zur Rückgabe:</strong><br><br>
      <strong>1. Rückgabebestätigung</strong><br>
      Der Vermieter bestätigt hiermit den vollständigen Empfang der oben aufgeführten Mietgegenstände 
      am ${dateTimeStr}. Die Rückgabe erfolgte am Standort 
      <span style="text-transform:capitalize;">${escapeHtml(data.reservation.location)}</span>.<br><br>
      <strong>2. Zustandsdokumentation</strong><br>
      Der Zustand der zurückgegebenen Mietgegenstände wurde bei Rückgabe gemeinsam durch Mieter 
      und Vermieter inspiziert und in diesem Protokoll dokumentiert. Beide Parteien bestätigen die 
      Richtigkeit der Zustandsbeschreibung (§§ 535, 546 BGB).<br><br>
      <strong>3. Haftung bei Schäden</strong><br>
      Für festgestellte Schäden, die über die vertragsgemäße Abnutzung hinausgehen, haftet der Mieter 
      gemäß den vertraglichen Vereinbarungen und den gesetzlichen Bestimmungen (§ 280 Abs. 1 BGB). 
      Der Vermieter ist berechtigt, die Kosten für Reparatur oder Ersatz in Rechnung zu stellen.<br><br>
      <strong>4. Reinigung</strong><br>
      ${data.cleaningRequired 
        ? "Eine Reinigung der Mietgegenstände ist erforderlich. Die Reinigungskosten werden dem Mieter gemäß den AGB in Rechnung gestellt." 
        : "Eine über die normale Nutzung hinausgehende Reinigung ist nicht erforderlich."}<br><br>
      <strong>5. Schlussrechnung</strong><br>
      Die abschließende Mietabrechnung erfolgt separat auf Basis der tatsächlichen Mietdauer und 
      der im Rückgabeprotokoll dokumentierten Zustandsbewertung. Etwaige Kosten für Schäden, 
      Reinigung oder fehlende Teile werden in der Schlussrechnung berücksichtigt.
    </div>

    <!-- Signature section -->
    <div class="sig-row" style="display:flex;justify-content:space-between;margin-bottom:10mm;gap:15mm;">
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:6px;padding:12px;">
        <p style="font-weight:600;font-size:12px;margin-bottom:4px;color:#00507d;">Rücknahme durch ${SLT_COMPANY.brand}:</p>
        <div style="height:100px;margin-bottom:4px;">
          <img src="${data.staffSignatureData}" alt="Unterschrift SLT-Mitarbeiter" style="max-height:90px;max-width:100%;" />
        </div>
        <div style="border-bottom:1px solid #393d46;margin-bottom:4px;"></div>
        <p style="font-size:11px;color:#595959;">${dateTimeStr} · ${escapeHtml(data.staffName)}</p>
        <p style="font-size:10px;color:#999;">Bevollmächtigter Mitarbeiter, ${SLT_COMPANY.name}</p>
      </div>
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:6px;padding:12px;">
        <p style="font-weight:600;font-size:12px;margin-bottom:4px;color:#00507d;">Rückgabe bestätigt durch Mieter:</p>
        <div style="height:100px;margin-bottom:4px;">
          <img src="${data.customerSignatureData}" alt="Unterschrift Mieter" style="max-height:90px;max-width:100%;" />
        </div>
        <div style="border-bottom:1px solid #393d46;margin-bottom:4px;"></div>
        <p style="font-size:11px;color:#595959;">${dateTimeStr} · ${escapeHtml(data.profile.contact_first_name)} ${escapeHtml(data.profile.contact_last_name)}</p>
        <p style="font-size:10px;color:#999;">Vertretungsberechtigte Person, ${escapeHtml(data.profile.company_name)}</p>
      </div>
    </div>

    <!-- Legal notice -->
    <div style="background:#fefce8;border:1px solid #fbbf24;border-radius:4px;padding:10px 14px;margin-bottom:8mm;font-size:10px;color:#92400e;line-height:1.5;">
      <strong>Hinweis gem. § 309 Nr. 12 BGB:</strong> Dieses Rückgabeprotokoll dient als Nachweis der ordnungsgemäßen 
      Rückgabe der Mietgegenstände und dokumentiert deren Zustand. Beide Parteien erhalten eine Ausfertigung. 
      Dieses Dokument wurde elektronisch erstellt und ist ohne handschriftliche Unterschrift im Original gültig, 
      sofern die digitale Signatur korrekt erfasst wurde (vgl. § 126a BGB, elektronische Form).
    </div>

    <!-- Footer -->
    <div style="border-top:2px solid #00507d;padding-top:10px;font-size:10px;color:#595959;">
      <div class="flex-row" style="display:flex;justify-content:space-between;">
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
  const fd = (d: string) => { const p = d.split('-'); return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d; };
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
    if (data.totals.dueDate) { dt(`Zahlbar bis: ${fd(data.totals.dueDate)} (${data.totals.paymentDueDays} Tage netto)`, MG, y, font, 9); y -= 16; }
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

  for (let i = 0; i < doc.getPageCount(); i++) {
    const p = doc.getPage(i);
    p.drawRectangle({ x: MG, y: MG - 5, width: CW, height: 0.5, color: rgb(0, 0.314, 0.49) });
    const ft = `${SLT_COMPANY.name} | ${SLT_COMPANY.street}, ${SLT_COMPANY.city} | ${SLT_COMPANY.web}`;
    try { p.drawText(ft, { x: MG, y: MG - 17, size: 6, font, color: rgb(0.5, 0.5, 0.5) }); } catch {}
  }

  return await doc.save();
}
