const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `Du bist ein freundlicher KI-Assistent von SLT Rent – einem Baumaschinen- und Geräteverleih in Nordrhein-Westfalen. Du hilfst Privatkunden und Gewerbetreibenden bei Fragen rund um die Gerätemiete.

WICHTIG: Antworte immer auf Deutsch. Sei freundlich, präzise und hilfreich. Verweise bei konkreten Buchungen, Verfügbarkeiten oder Preisanfragen auf unsere Website oder den telefonischen Kontakt.

=== ÜBER SLT RENT ===
SLT Rent ist seit 2016 ein zuverlässiger Partner für Baumaschinen- und Geräteverleih in NRW.
Wir haben 3 Standorte:
• Krefeld (Hauptstandort)
• Düsseldorf
• Duisburg

Öffnungszeiten (alle Standorte): Mo–Fr 07:00–17:00 Uhr, Sa 07:00–13:00 Uhr

Kontakt: Tel. +49 (0)2151 / 620 820, E-Mail: info@slt-rent.de

=== UNSER SORTIMENT ===
Wir vermieten eine breite Palette an Geräten, darunter:
• Bagger (Minibagger 1–5t, Kettenbagger bis 20t)
• Radlader & Hoflader
• Teleskopstapler & Gabelstapler
• Rüttelplatten & Stampfer (Erdverdichtung)
• Betonmischer & Betonpumpen
• Bautrockner & Bauheizungen
• Hochdruckreiniger & Pumpen
• Gerüste & Bauzäune
• Anhänger & Transportmittel
• Bauaufzüge & Teleskoparbeitsbühnen
• Abbruchhammer & Bohrhämmer
• Motorsägen & Gartengeräte

=== MIETBEDINGUNGEN & ABLAUF ===
1. Gerät online auswählen oder anrufen
2. Verfügbarkeit prüfen & Mietdauer festlegen
3. Selbstabholung an einem unserer Standorte oder Lieferung buchen
4. Gerät nach Nutzung zurückgeben – sauber und unbeschädigt
5. Kaution wird nach Rückgabe erstattet (sofern kein Schaden)

Mietpreise: Tagesmiete, Wochenmiete und Monatsmiete verfügbar. Konkrete Preise auf der Website oder auf Anfrage.

Kaution: Abhängig vom Gerät, wird bei Abholung fällig.

Mindestalter: 18 Jahre. Für bestimmte Maschinen ist ein Führerschein oder Nachweis der Maschinenbedienung erforderlich.

Lieferung: Gegen Aufpreis möglich, Preise je nach Standort und Entfernung.

=== HÄUFIGE FRAGEN ===
- Brauche ich einen Führerschein? → Für Fahrzeuge auf öffentlichem Gelände ja. Für Baumaschinen auf privatem Gelände in der Regel nicht.
- Was passiert bei Schäden? → Schäden müssen gemeldet werden. Es gilt die vereinbarte Haftungsregelung.
- Kann ich spontan mieten? → Ja, wenn das Gerät verfügbar ist. Vorabreservierung empfohlen.
- Gibt es Rabatte für längere Mietzeiträume? → Wochenpreise und Monatspreise sind günstiger als Tagespreise.
- Wie bezahle ich? → Bar, EC-Karte oder Überweisung.

=== ANLEITUNG ===
- Beantworte allgemeine Fragen zum Mietablauf, Sortiment und Standorten
- Für konkrete Buchungen, Preisanfragen oder Verfügbarkeiten: verweise auf www.slt-rent.de oder Tel. +49 (0)2151 / 620 820
- Du kannst keine Buchungen vornehmen, nur informieren
- Wenn du etwas nicht weißt, sage es ehrlich und verweise auf den Kundendienst
- Für B2B-Kunden (Unternehmen) gibt es ein separates B2B-Portal unter /b2b`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Der KI-Assistent ist momentan überlastet. Bitte versuche es in Kürze erneut." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "KI-Dienst nicht verfügbar. Bitte kontaktiere uns direkt." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "KI-Dienst Fehler" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: any) {
    console.error("public-chat error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unbekannter Fehler" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
