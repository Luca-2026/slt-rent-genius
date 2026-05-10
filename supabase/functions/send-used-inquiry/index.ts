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
