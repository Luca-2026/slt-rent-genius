import { corsHeaders } from "@supabase/supabase-js/cors";

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
      nachricht, wieGefunden,
    } = body;

    if (!marke || !produktkategorie || !vorname || !nachname || !email || !telefon) {
      return new Response(JSON.stringify({ error: "Pflichtfelder fehlen" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const now = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
    const subject = `Neue Kaufanfrage: ${marke} – ${produktkategorie} – ${firmenname || `${vorname} ${nachname}`}`;

    const rechnungsBlock = rechnungGleich
      ? "Identisch mit Lieferadresse"
      : `Firma/Name: ${rechnungFirma || "-"}\nStraße: ${rechnungStrasse || "-"}\nPLZ / Ort: ${rechnungPlz || "-"} ${rechnungOrt || "-"}\nLand: ${rechnungLand || "Deutschland"}`;

    const textBody = `────────────────────────────────────────────────
NEUE KAUFANFRAGE über slt-rental.de/verkauf
Eingegangen: ${now}
────────────────────────────────────────────────

PRODUKTWUNSCH
─────────────
Marke:             ${marke}
Produktkategorie:  ${produktkategorie}
Modell/Spezif.:    ${modell || "-"}
Anzahl:            ${anzahl || "1"}
Besondere Anford.: ${anforderungen || "-"}

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
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SLT-Rental Kaufanfrage <noreply@notify.slt-rental.de>",
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

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Interner Fehler" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
