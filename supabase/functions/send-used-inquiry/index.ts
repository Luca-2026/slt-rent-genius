const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      articleNumber, manufacturerModel, year, price, location,
      searchedMachine, preferredManufacturer,
      interest, wishDate, deliveryOption,
      deliveryStreet, deliveryPlz, deliveryCity,
      customerType, companyName, vatId,
      salutation, firstName, lastName, email, phone,
      billingIdentical, billingCompany, billingStreet, billingPlz, billingCity,
      message,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !interest) {
      return new Response(
        JSON.stringify({ error: "Pflichtfelder fehlen" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Ungültige E-Mail-Adresse" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
    const isSpecific = !!articleNumber;

    const subject = isSpecific
      ? `Gebrauchtmaschinen-Anfrage: ${articleNumber} – ${manufacturerModel} – ${lastName}`
      : `Gebrauchtmaschinen-Suchanfrage: ${searchedMachine || "Allgemein"} – ${lastName}`;

    const interestLabels: Record<string, string> = {
      kauf: "Kauf zum genannten Preis",
      verhandlung: "Preisverhandlung gewünscht",
      besichtigung: "Erst besichtigen, dann entscheiden",
      info: "Nur Informationen anfordern",
    };

    const billingBlock = billingIdentical
      ? "Identisch mit Liefer-/Abholadresse"
      : `Firma/Name:  ${billingCompany || "-"}\nStraße:      ${billingStreet || "-"}\nPLZ / Ort:   ${billingPlz || "-"} ${billingCity || "-"}`;

    const deliveryAddrBlock = deliveryOption?.includes("Lieferung")
      ? `\nLieferadresse:      ${deliveryStreet || "-"}, ${deliveryPlz || "-"} ${deliveryCity || "-"}`
      : "";

    const textBody = `SLT USED — NEUE ANFRAGE
Eingegangen: ${now}
─────────────────────────────────────

ANGEFRAGTE MASCHINE
Artikel-Nr.:        ${articleNumber || "Allgemeine Suchanfrage"}
Hersteller/Modell:  ${manufacturerModel || "-"}
Baujahr:            ${year || "-"}
Preis:              ${price || "-"}
Standort:           ${location || "-"}${!isSpecific ? `\nGesuchte Maschine:  ${searchedMachine || "-"}\nGew. Hersteller:    ${preferredManufacturer || "-"}` : ""}

KAUFABSICHT
Interesse:          ${interestLabels[interest] || interest}
Wunschtermin:       ${wishDate || "-"}
Lieferung/Abholung: ${deliveryOption || "-"}${deliveryAddrBlock}

KONTAKT
Kundentyp:          ${customerType || "-"}
Firma:              ${companyName || "-"}
USt-IdNr.:          ${vatId || "-"}
Name:               ${salutation || ""} ${firstName} ${lastName}
E-Mail:             ${email}
Telefon:            ${phone}

RECHNUNGSADRESSE
${billingBlock}

NACHRICHT
${message || "-"}
─────────────────────────────────────
Gesendet über slt-rental.de/verkauf/gebrauchtmaschinen`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SLT-Rental Kaufanfrage <kaufanfrage@slt-rental.de>",
        to: ["krefeld@slt-rental.de"],
        reply_to: email,
        subject,
        text: textBody,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      return new Response(
        JSON.stringify({ error: "E-Mail konnte nicht gesendet werden" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Confirmation email to customer
    const greeting = salutation === "Herr"
      ? `Sehr geehrter Herr ${lastName}`
      : salutation === "Frau"
        ? `Sehr geehrte Frau ${lastName}`
        : `Hallo ${firstName} ${lastName}`;

    const machineLine = isSpecific
      ? `${manufacturerModel}${articleNumber ? ` (Art.-Nr. ${articleNumber})` : ""}${year ? `, Bj. ${year}` : ""}${price ? ` – ${price}` : ""}`
      : `${searchedMachine || "Allgemeine Suchanfrage"}${preferredManufacturer ? ` (Wunschhersteller: ${preferredManufacturer})` : ""}`;

    const confirmHtml = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#ffffff;margin:0;padding:24px;">
<div style="max-width:600px;margin:0 auto;">
  <h2 style="color:#00507d;margin:0 0 16px;">Vielen Dank für Deine Anfrage!</h2>
  <p>${greeting},</p>
  <p>wir haben Deine Kaufanfrage erhalten und melden uns innerhalb von <strong>1 Werktag</strong> persönlich bei Dir.</p>
  <div style="background:#f5f7fa;border-left:4px solid #ff8e02;padding:12px 16px;margin:20px 0;border-radius:4px;">
    <p style="margin:0 0 6px;"><strong>Deine Anfrage im Überblick:</strong></p>
    <p style="margin:4px 0;">Maschine: ${machineLine}</p>
    <p style="margin:4px 0;">Interesse: ${interestLabels[interest] || interest}</p>
    ${wishDate ? `<p style="margin:4px 0;">Wunschtermin: ${wishDate}</p>` : ""}
    ${deliveryOption ? `<p style="margin:4px 0;">Lieferung/Abholung: ${deliveryOption}</p>` : ""}
  </div>
  <p>Bei dringenden Rückfragen erreichst Du uns telefonisch unter <a href="tel:+4921514179904" style="color:#00507d;">02151 417 99 04</a> oder per E-Mail an <a href="mailto:kaufanfrage@slt-rental.de" style="color:#00507d;">kaufanfrage@slt-rental.de</a>.</p>
  <p style="margin-top:24px;">Beste Grüße<br/>Dein SLT-Rental Team</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
  <p style="font-size:12px;color:#6b7280;margin:0;">SLT-Rental GmbH · Krefeld · Bonn · Mülheim an der Ruhr<br/>www.slt-rental.de</p>
</div></body></html>`;

    // Send confirmation (non-blocking — log if it fails but don't fail the request)
    try {
      const confirmRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "SLT-Rental <kaufanfrage@slt-rental.de>",
          to: [email],
          reply_to: "kaufanfrage@slt-rental.de",
          subject: `Bestätigung Deiner Kaufanfrage${isSpecific && manufacturerModel ? ` – ${manufacturerModel}` : ""}`,
          html: confirmHtml,
        }),
      });
      if (!confirmRes.ok) {
        console.error("Confirmation email failed:", await confirmRes.text());
      }
    } catch (e) {
      console.error("Confirmation email exception:", e);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Interner Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
