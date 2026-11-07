import { saveSalesInquiry, salesInquiryLink } from "../_shared/inquiry-store.ts";

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
      financingDesired, financingTerm, financingDownPayment,
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

    const inquiryId = await saveSalesInquiry({
      kind: "used_machine",
      source: isSpecific ? "slt_used_artikel" : "slt_used_suchanfrage",
      location: location ?? null,
      brand: preferredManufacturer ?? null,
      model: manufacturerModel ?? null,
      article_number: articleNumber ?? null,
      year: typeof year === "number" ? year : (year ? Number(year) || null : null),
      listed_price: price ? String(price) : null,
      searched_machine: searchedMachine ?? null,
      interest: interest ?? null,
      wish_date: wishDate ?? null,
      delivery_option: deliveryOption ?? null,
      delivery_street: deliveryStreet ?? null,
      delivery_postal_code: deliveryPlz ?? null,
      delivery_city: deliveryCity ?? null,
      customer_type: customerType ?? null,
      company_name: companyName ?? null,
      vat_id: vatId ?? null,
      salutation: salutation ?? null,
      first_name: firstName ?? null,
      last_name: lastName ?? null,
      customer_email: email ?? null,
      customer_phone: phone ?? null,
      billing_identical: billingIdentical ?? null,
      billing_company: billingCompany ?? null,
      billing_street: billingStreet ?? null,
      billing_postal_code: billingPlz ?? null,
      billing_city: billingCity ?? null,
      financing_desired: financingDesired ?? null,
      financing_term: financingTerm ? String(financingTerm) : null,
      financing_down_payment: financingDownPayment ? String(financingDownPayment) : null,
      message: message ?? null,
      raw_payload: body,
    });
    const portalLink = salesInquiryLink(inquiryId);

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
Im Portal bearbeiten: ${portalLink}
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

FINANZIERUNG
${financingDesired
  ? `Gewünscht:          Ja\nLaufzeit:           ${financingTerm ? `${financingTerm} Monate` : "-"}\nAnzahlung:          ${financingDownPayment ? `${financingDownPayment} €` : "-"}`
  : "Gewünscht:          Nein"}

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

    // Submission is acknowledged in the website; only staff receive the inquiry email.

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
