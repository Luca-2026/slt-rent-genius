import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLT_LOGO = "https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png";
const COMPANY_NAME = "SLT Technology Group GmbH & Co. KG";

const locationEmails: Record<string, string> = {
  krefeld: "krefeld@slt-rental.de",
  bonn: "bonn@slt-rental.de",
  muelheim: "muelheim@slt-rental.de",
};

const locationNames: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

const locationPhones: Record<string, string> = {
  krefeld: "02151 417 99 04",
  bonn: "0228 504 660 61",
  muelheim: "02151 417 99 04",
};

const locationAddresses: Record<string, string> = {
  krefeld: "Anrather Straße 291, 47807 Krefeld",
  bonn: "Drachenburgstraße 8, 53179 Bonn",
  muelheim: "Ruhrorter Str. 122, 45478 Mülheim an der Ruhr",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      locationId,
      items, // Array of { productName, quantity, startDate, endDate, startTime, endTime }
      deliveryRequested,
      deliveryStreet,
      deliveryPostalCode,
      deliveryCity,
      additionalServices, // Array of { name }
      notes,
      isBatch, // true for Sammelanfrage
    } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const locEmail = locationEmails[locationId] || "mieten@slt-rental.de";
    const locName = locationNames[locationId] || locationId;
    const locPhone = locationPhones[locationId] || "02151 417 99 04";
    const locAddress = locationAddresses[locationId] || "Anrather Straße 291, 47807 Krefeld";

    const itemsHtml = (items || []).map((item: any) => {
      const dateRange = item.startDate
        ? `${item.startDate}${item.endDate ? ` – ${item.endDate}` : ""}`
        : "–";
      const timeRange = [
        item.startTime ? `Abholung: ${item.startTime} Uhr` : "",
        item.endTime ? `Rückgabe: ${item.endTime} Uhr` : "",
      ].filter(Boolean).join(" · ") || "";
      return `
        <tr>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${dateRange}${timeRange ? `<br><span style="font-size:12px;color:#6b7280;">${timeRange}</span>` : ""}</td>
        </tr>`;
    }).join("");

    const deliveryHtml = deliveryRequested
      ? `<tr><td style="padding:4px 0;color:#6b7280;">Lieferung:</td><td style="padding:4px 0;font-weight:500;color:#16a34a;">✓ Ja, gewünscht</td></tr>
         <tr><td style="padding:4px 0;color:#6b7280;">Lieferadresse:</td><td style="padding:4px 0;">${deliveryStreet}, ${deliveryPostalCode} ${deliveryCity}</td></tr>`
      : `<tr><td style="padding:4px 0;color:#6b7280;">Lieferung:</td><td style="padding:4px 0;">Selbstabholung</td></tr>`;

    const servicesHtml = additionalServices && additionalServices.length > 0
      ? `<tr><td style="padding:4px 0;color:#6b7280;">Zusatzoptionen:</td><td style="padding:4px 0;">${additionalServices.map((s: any) => s.name).join(", ")}</td></tr>`
      : "";

    const requestType = isBatch ? "Neue B2B-Sammelanfrage" : "Neue B2B-Anfrage";
    const itemCount = items?.length || 1;

    const footerHtml = `
    <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:12px;line-height:1.6;">
      ${COMPANY_NAME}<br>
      Standort ${locName}: ${locAddress}<br>
      Tel: ${locPhone} · E-Mail: <a href="mailto:${locEmail}" style="color:#f97316;">${locEmail}</a><br>
      <a href="https://www.slt-rental.de" style="color:#f97316;">www.slt-rental.de</a>
    </p>`;

    // ── Internal notification ──
    const internalHtml = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:#ffffff;padding:20px;text-align:center;border-bottom:3px solid #f97316;">
    <img src="${SLT_LOGO}" alt="SLT Rental" style="height:50px;max-width:200px;" />
  </div>
  <div style="padding:24px;">
    <h2 style="color:#1a1a1a;margin-top:0;">${requestType}</h2>
    <div style="background:#fff7ed;border-left:4px solid #f97316;padding:12px 16px;margin:16px 0;border-radius:4px;">
      <strong style="color:#ea580c;">Firma:</strong> ${companyName}<br>
      <strong style="color:#ea580c;">Standort:</strong> ${locName}<br>
      <strong style="color:#ea580c;">Artikel:</strong> ${itemCount} Position${itemCount > 1 ? "en" : ""}
    </div>
    <h3 style="color:#374151;">Kontaktdaten</h3>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:4px 0;color:#6b7280;width:120px;">Ansprechpartner:</td><td style="padding:4px 0;font-weight:500;">${contactName}</td></tr>
      <tr><td style="padding:4px 0;color:#6b7280;">E-Mail:</td><td style="padding:4px 0;"><a href="mailto:${contactEmail}" style="color:#f97316;">${contactEmail}</a></td></tr>
      ${contactPhone ? `<tr><td style="padding:4px 0;color:#6b7280;">Telefon:</td><td style="padding:4px 0;">${contactPhone}</td></tr>` : ""}
      ${deliveryHtml}
      ${servicesHtml}
    </table>
    <h3 style="color:#374151;">Angefragte Artikel</h3>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e5e7eb;color:#374151;">Artikel</th>
          <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #e5e7eb;color:#374151;">Menge</th>
          <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e5e7eb;color:#374151;">Zeitraum</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    ${notes ? `<h3 style="color:#374151;">Anmerkungen</h3><p style="color:#374151;white-space:pre-wrap;background:#f9fafb;padding:12px;border-radius:6px;">${notes}</p>` : ""}
    ${footerHtml}
  </div>
</div>`.trim();

    // ── Customer confirmation ──
    const itemsSummaryHtml = (items || []).map((item: any) => {
      const dateRange = item.startDate
        ? `${item.startDate}${item.endDate ? ` – ${item.endDate}` : ""}`
        : "";
      return `<li style="margin-bottom:4px;"><strong>${item.productName}</strong> (${item.quantity || 1}x) – ${dateRange}</li>`;
    }).join("");

    const confirmationHtml = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:#ffffff;padding:20px;text-align:center;border-bottom:3px solid #f97316;">
    <img src="${SLT_LOGO}" alt="SLT Rental" style="height:50px;max-width:200px;" />
  </div>
  <div style="padding:24px;">
    <h2 style="color:#1a1a1a;margin-top:0;">Vielen Dank für Ihre Anfrage!</h2>
    <p style="color:#374151;line-height:1.6;">
      Hallo ${contactName},<br><br>
      wir haben Ihre ${isBatch ? "Sammelanfrage" : "Anfrage"} erhalten und werden Ihnen schnellstmöglich ein Angebot erstellen – in der Regel innerhalb von <strong>1 Stunde</strong> während unserer Geschäftszeiten.
    </p>
    <div style="background:#fff7ed;border-left:4px solid #f97316;padding:12px 16px;margin:16px 0;border-radius:4px;">
      <strong style="color:#ea580c;">Ihre angefragten Artikel:</strong>
      <ul style="margin:8px 0 0 0;padding-left:20px;color:#374151;">${itemsSummaryHtml}</ul>
      ${deliveryRequested ? `<br><strong style="color:#ea580c;">Lieferung an:</strong> ${deliveryStreet}, ${deliveryPostalCode} ${deliveryCity}` : ""}
      ${additionalServices && additionalServices.length > 0 ? `<br><strong style="color:#ea580c;">Zusatzoptionen:</strong> ${additionalServices.map((s: any) => s.name).join(", ")}` : ""}
    </div>
    <p style="color:#374151;line-height:1.6;">
      Falls Sie in der Zwischenzeit Fragen haben, erreichen Sie uns unter <a href="tel:${locPhone.replace(/\s/g, '')}" style="color:#f97316;">${locPhone}</a> oder per E-Mail an <a href="mailto:${locEmail}" style="color:#f97316;">${locEmail}</a>.
    </p>
    <p style="color:#374151;">
      Mit freundlichen Grüßen,<br>
      <strong>Ihr SLT Rental Team – Standort ${locName}</strong>
    </p>
    ${footerHtml}
  </div>
</div>`.trim();

    if (RESEND_API_KEY) {
      const subjectInternal = isBatch
        ? `B2B-Sammelanfrage: ${companyName} – ${itemCount} Artikel`
        : `B2B-Anfrage: ${companyName} – ${items?.[0]?.productName || "Produkt"}`;

      // Send internal notification to location
      const res1 = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "B2B-Anfragen <anfragen@slt-rental.de>",
          to: [locEmail],
          reply_to: contactEmail,
          subject: subjectInternal,
          html: internalHtml,
        }),
      });
      if (!res1.ok) console.error("Resend internal error:", await res1.text());

      // Send customer confirmation
      const res2 = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "SLT Rental <anfragen@slt-rental.de>",
          to: [contactEmail],
          subject: `Ihre B2B-Anfrage – Bestätigung`,
          html: confirmationHtml,
        }),
      });
      if (!res2.ok) console.error("Resend confirmation error:", await res2.text());
    } else {
      console.log("=== B2B RESERVATION NOTIFICATION (no RESEND_API_KEY) ===");
      console.log({ companyName, contactName, contactEmail, locationId, items });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    console.error("notify-b2b-reservation error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
