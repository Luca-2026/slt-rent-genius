// Edge Function: KI-generierter Content für den Mietartikel-CMS-Editor.
// Der Admin klickt "KI generieren" in einem Feld; wir rufen das Lovable AI Gateway.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Field =
  | "meta_description"
  | "detailed_description"
  | "faqs"
  | "local_content";

interface Body {
  field: Field;
  location?: "krefeld" | "bonn" | "muelheim";
  product: {
    name: string;
    model_name?: string;
    category: string;
    description?: string;
    specifications?: Record<string, string>;
    features?: string[];
    price_per_day?: string;
    weight_kg?: number;
    drive_type?: string;
    rentware_code?: Record<string, string>;
  };
}

const LOCATION_LABELS = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
} as const;

async function getUserIdFromAuthHeader(authHeader: string): Promise<string | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) throw new Error("Backend auth configuration missing");

  const authResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      Authorization: authHeader,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
  });

  if (!authResp.ok) {
    console.error("Auth validation failed", authResp.status, await authResp.text());
    return null;
  }

  const user = await authResp.json();
  return typeof user?.id === "string" ? user.id : null;
}

function buildContext(product: Body["product"], location?: Body["location"]) {
  const specs = product.specifications
    ? Object.entries(product.specifications)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n")
    : "";
  const features = product.features?.length
    ? product.features.map((f) => `- ${f}`).join("\n")
    : "";
  const locText = location ? `Standort: ${LOCATION_LABELS[location]}` : "";
  const bookable =
    location && product.rentware_code?.[location]
      ? "Am Standort direkt online buchbar."
      : "";
  return [
    `Artikel: ${product.name}${product.model_name ? " (" + product.model_name + ")" : ""}`,
    `Kategorie: ${product.category}`,
    product.description ? `Kurzbeschreibung: ${product.description}` : "",
    product.drive_type ? `Antrieb: ${product.drive_type}` : "",
    product.weight_kg ? `Gewicht: ${product.weight_kg} kg` : "",
    product.price_per_day ? `Tagespreis: ${product.price_per_day}` : "",
    specs ? `Technische Daten:\n${specs}` : "",
    features ? `Features:\n${features}` : "",
    locText,
    bookable,
  ]
    .filter(Boolean)
    .join("\n");
}

function promptForField(field: Field, ctx: string, location?: Body["location"]) {
  const brandRules = `
Du bist SEO-Redakteur für SLT Sanitär- und Lüftungstechnik (SLT Rental), einem Vermieter von Maschinen und Event-Ausstattung in NRW.
Ton: professionell, direkt, "Du"-Ansprache. Keine erfundenen technischen Daten oder Zahlen. Nur Fakten aus dem Kontext verwenden.
Kein Marketing-Blabla, keine Emojis, keine Superlative wie "beste" oder "günstigste".`;

  switch (field) {
    case "meta_description":
      return `${brandRules}
Schreibe eine SEO-Meta-Description (max 155 Zeichen) für die Produktdetail-Seite.
Kontext:
${ctx}

Nur den Text ausgeben, keine Anführungszeichen.`;

    case "detailed_description":
      return `${brandRules}
Schreibe einen ausführlichen, einzigartigen Beschreibungstext (2–4 Absätze, insgesamt 200–350 Wörter) für die Produktdetail-Seite.
Struktur:
1. Absatz: Was ist das Gerät, für welche Einsätze eignet es sich.
2. Absatz: Wichtigste Eigenschaften und Nutzen (nur aus Kontext).
3. Absatz: Praktische Hinweise zur Miete bei SLT Rental${location ? " am Standort " + LOCATION_LABELS[location] : ""}.
Kontext:
${ctx}

Nur Fließtext ausgeben, keine Überschriften, kein Markdown.`;

    case "faqs":
      return `${brandRules}
Erstelle 4 FAQ-Einträge zum Artikel. Ausgabe als JSON-Array: [{"question":"...","answer":"..."}, ...].
Fragen aus Sicht eines potenziellen Mieters (Anwendung, Voraussetzungen, Lieferung, Buchung).
Antworten nur mit Fakten aus dem Kontext oder allgemeinen SLT-Standards${location ? " (Standort " + LOCATION_LABELS[location] + ")" : ""}. Keine erfundenen Details.
Kontext:
${ctx}

Nur das JSON-Array ausgeben, keine Erklärung.`;

    case "local_content":
      if (!location) throw new Error("location required for local_content");
      return `${brandRules}
Schreibe einen kurzen (80–120 Wörter) lokalen SEO-Absatz für die Standortseite ${LOCATION_LABELS[location]}.
Bezug: Verfügbarkeit, Abholung/Lieferung im Raum ${LOCATION_LABELS[location]}, Ansprechpartner vor Ort.
Nur Fakten aus dem Kontext; keine Straßennamen oder Nachbargemeinden erfinden.
Kontext:
${ctx}

Nur Fließtext ausgeben.`;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

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
      { global: { headers: { Authorization: authHeader } } },
    );

    const userId = await getUserIdFromAuthHeader(authHeader);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleError) console.error("Admin role check failed", roleError);
    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body?.field || !body?.product?.name || !body?.product?.category) {
      return new Response(JSON.stringify({ error: "Missing field or product data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (body.field === "local_content" && !body.location) {
      return new Response(JSON.stringify({ error: "location required for local_content" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ctx = buildContext(body.product, body.location);
    const prompt = promptForField(body.field, ctx, body.location);

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Du bist ein präziser SEO-Redakteur. Halte dich strikt an das Format." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit erreicht. Bitte kurz warten." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "KI-Guthaben aufgebraucht. Bitte im Workspace nachladen." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI Gateway error", aiResp.status, errText);
      return new Response(JSON.stringify({ error: `AI Gateway ${aiResp.status}`, details: errText }), {
        status: aiResp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const text: string = aiJson.choices?.[0]?.message?.content ?? "";

    let result: unknown = text.trim();
    if (body.field === "faqs") {
      // Try to parse JSON array from response (strip markdown fences if any)
      const cleaned = text.replace(/^```(?:json)?/im, "").replace(/```$/m, "").trim();
      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          result = parsed
            .filter((f) => f && typeof f.question === "string" && typeof f.answer === "string")
            .slice(0, 6);
        } else {
          result = [];
        }
      } catch {
        result = [];
      }
    }

    return new Response(JSON.stringify({ field: body.field, value: result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("admin-generate-product-content error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
