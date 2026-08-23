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

    // Bestätigungs-E-Mail an den Kunden (non-blocking)
    const escapeHtml = (s: unknown): string =>
      s === null || s === undefined ? "" : String(s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#039;");

    const greeting = anrede === "Herr"
      ? `Sehr geehrter Herr ${escapeHtml(nachname)}`
      : anrede === "Frau"
        ? `Sehr geehrte Frau ${escapeHtml(nachname)}`
        : `Hallo ${escapeHtml(vorname)} ${escapeHtml(nachname)}`;

    const produktLine = escapeHtml(`${marke} – ${produktkategorie}${modell ? ` (${modell})` : ""}${anzahl ? `, Anzahl: ${anzahl}` : ""}`);
    const lieferSafe = escapeHtml(lieferOption);
    const terminSafe = escapeHtml(wunschtermin);
    const addonsSafe = Array.isArray(addons) && addons.length > 0 ? escapeHtml(addons.join(", ")) : "";

    const confirmHtml = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#ffffff;margin:0;padding:24px;">
<div style="max-width:600px;margin:0 auto;">
  <h2 style="color:#00507d;margin:0 0 16px;">Vielen Dank für Deine Kaufanfrage!</h2>
  <p>${greeting},</p>
  <p>wir haben Deine Anfrage erhalten und melden uns innerhalb von <strong>1 Werktag</strong> persönlich bei Dir mit einem individuellen Angebot.</p>
  <div style="background:#f5f7fa;border-left:4px solid #ff8e02;padding:12px 16px;margin:20px 0;border-radius:4px;">
    <p style="margin:0 0 6px;"><strong>Deine Anfrage im Überblick:</strong></p>
    <p style="margin:4px 0;">Produkt: ${produktLine}</p>
    ${addonsSafe ? `<p style="margin:4px 0;">Zubehör: ${addonsSafe}</p>` : ""}
    ${lieferOption ? `<p style="margin:4px 0;">Lieferung/Abholung: ${lieferSafe}</p>` : ""}
    ${wunschtermin ? `<p style="margin:4px 0;">Wunschtermin: ${terminSafe}</p>` : ""}
  </div>
  <p>Bei dringenden Rückfragen erreichst Du uns telefonisch unter <a href="tel:+4921514179904" style="color:#00507d;">02151 417 99 04</a> oder per E-Mail an <a href="mailto:kaufanfrage@slt-rental.de" style="color:#00507d;">kaufanfrage@slt-rental.de</a>.</p>
  <p style="margin-top:24px;">Beste Grüße<br/>Dein SLT-Rental Team</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
  <p style="font-size:12px;color:#6b7280;margin:0;">SLT-Rental GmbH · Krefeld · Bonn · Mülheim an der Ruhr<br/>www.slt-rental.de</p>
</div></body></html>`;

    try {
      const confirmRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "SLT-Rental <kaufanfrage@slt-rental.de>",
          to: [email],
          reply_to: "kaufanfrage@slt-rental.de",
          subject: `Bestätigung Deiner Kaufanfrage – ${marke}${modell ? ` ${modell}` : ""}`,
          html: confirmHtml,
        }),
      });
      if (!confirmRes.ok) {
        console.error("Confirmation email failed:", await confirmRes.text());
      }
    } catch (e) {
      console.error("Confirmation email exception:", e);
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Interner Fehler" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
