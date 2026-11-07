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
      marke, produktkategorie, modell, anzahl, anforderungen,
      lieferOption, strasse, plz, ort, lieferhinweis,
      kundentyp, firmenname, ustIdNr,
      anrede, titel, vorname, nachname, email, telefon, wunschtermin,
      rechnungGleich, rechnungFirma, rechnungStrasse, rechnungPlz, rechnungOrt, rechnungLand,
      nachricht, wieGefunden, addons,
    } = body;

    if (!marke || !produktkategorie || !vorname || !nachname || !email || !telefon) {
      return new Response(JSON.stringify({ error: "Pflichtfelder fehlen" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const inquiryId = await saveSalesInquiry({
      kind: "new_machine",
      source: "verkauf_formular",
      brand: marke ?? null,
      product_category: produktkategorie ?? null,
      model: modell ?? null,
      quantity: anzahl ? String(anzahl) : null,
      requirements: anforderungen ?? null,
      addons: Array.isArray(addons) ? addons : [],
      wish_date: wunschtermin ?? null,
      delivery_option: lieferOption ?? null,
      delivery_street: strasse ?? null,
      delivery_postal_code: plz ?? null,
      delivery_city: ort ?? null,
      delivery_note: lieferhinweis ?? null,
      customer_type: kundentyp ?? null,
      company_name: firmenname ?? null,
      vat_id: ustIdNr ?? null,
      salutation: anrede ?? null,
      first_name: vorname ?? null,
      last_name: nachname ?? null,
      customer_email: email ?? null,
      customer_phone: telefon ?? null,
      billing_identical: rechnungGleich ?? null,
      billing_company: rechnungFirma ?? null,
      billing_street: rechnungStrasse ?? null,
      billing_postal_code: rechnungPlz ?? null,
      billing_city: rechnungOrt ?? null,
      billing_country: rechnungLand ?? null,
      message: nachricht ?? null,
      found_via: wieGefunden ?? null,
      raw_payload: body,
    });
    const portalLink = salesInquiryLink(inquiryId);

    const now = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
    const subject = `Neue Kaufanfrage: ${marke} – ${produktkategorie} – ${firmenname || `${vorname} ${nachname}`}`;

    const rechnungsBlock = rechnungGleich
      ? "Identisch mit Lieferadresse"
      : `Firma/Name: ${rechnungFirma || "-"}\nStraße: ${rechnungStrasse || "-"}\nPLZ / Ort: ${rechnungPlz || "-"} ${rechnungOrt || "-"}\nLand: ${rechnungLand || "Deutschland"}`;

    const textBody = `────────────────────────────────────────────────
NEUE KAUFANFRAGE über slt-rental.de/verkauf
Eingegangen: ${now}
Im Portal bearbeiten: ${portalLink}
────────────────────────────────────────────────

PRODUKTWUNSCH
─────────────
Marke:             ${marke}
Produktkategorie:  ${produktkategorie}
Modell/Spezif.:    ${modell || "-"}
Anzahl:            ${anzahl || "1"}
Besondere Anford.: ${anforderungen || "-"}
Zusätzliches Zubehör: ${Array.isArray(addons) && addons.length > 0 ? addons.join(", ") : "-"}
${Array.isArray(addons) && addons.includes("Anhängerkupplung") ? "Anhängerkupplung Preis: 115 € brutto (103,50 € mit 10 % Vorbestellerrabatt)" : ""}

LIEFERUNG / ABHOLUNG
─────────────────────
Option:            ${lieferOption || "-"}
Lieferadresse:     ${strasse || "-"}, ${plz || "-"} ${ort || "-"}
Lieferhinweis:     ${lieferhinweis || "-"}
Wunschtermin:      ${wunschtermin || "-"}

KONTAKTDATEN
─────────────
Kundentyp:         ${kundentyp || "-"}
Firma:             ${firmenname || "-"}
USt-IdNr.:         ${ustIdNr || "-"}
Name:              ${anrede || ""} ${titel || ""} ${vorname} ${nachname}
E-Mail:            ${email}
Telefon:           ${telefon}

RECHNUNGSADRESSE
─────────────────
${rechnungsBlock}

NACHRICHT
──────────
${nachricht || "-"}

Wie gefunden: ${wieGefunden || "-"}
────────────────────────────────────────────────
Diese Anfrage wurde automatisch über das Kaufanfrageformular
auf www.slt-rental.de/verkauf gesendet.
────────────────────────────────────────────────`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SLT-Rental Kaufanfrage <kaufanfrage@slt-rental.de>",
        to: ["kaufanfrage@slt-rental.de"],
        reply_to: email,
        subject,
        text: textBody,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: "E-Mail konnte nicht gesendet werden" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Submission is acknowledged in the website; only staff receive the inquiry email.

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Interner Fehler" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
