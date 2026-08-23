// Edge Function: KI-generierter Content für den Verkaufsartikel-CMS-Editor
// (Neu- und Gebrauchtartikel). Nutzt das Lovable AI Gateway.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Field = "short_description" | "description" | "seo_title" | "seo_description" | "faqs" | "highlights";

interface Body {
  field: Field;
  kind: "new" | "used";
  product: {
    name: string;
    brand?: string;
    model?: string;
    category: string;
    description?: string;
    specifications?: Record<string, string>;
    price?: string;
    year?: number;
    hours?: number;
    locations?: string[];
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function getUserIdFromAuthHeader(authHeader: string): Promise<string | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) throw new Error("Backend auth configuration missing");

  const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authHeader, apikey: anonKey, "Content-Type": "application/json" },
  });
  if (!resp.ok) {
    console.error("Auth validation failed", resp.status);
    return null;
  }
  const user = await resp.json();
  return typeof user?.id === "string" ? user.id : null;
}

function buildContext(p: Body["product"], kind: Body["kind"]) {
  const specs = p.specifications
    ? Object.entries(p.specifications).map(([k, v]) => `- ${k}: ${v}`).join("\n")
    : "";
  return [
    `Artikel: ${[p.brand, p.model].filter(Boolean).join(" ") || p.name}`,
    `Art: ${kind === "used" ? "Gebrauchtartikel (gebraucht, geprüft)" : "Neuartikel (fabrikneu)"}`,
    `Kategorie: ${p.category}`,
    p.description ? `Vorhandene Beschreibung: ${p.description}` : "",
    p.price ? `Preis: ${p.price}` : "",
    p.year ? `Baujahr: ${p.year}` : "",
    p.hours != null ? `Betriebsstunden: ${p.hours}` : "",
    p.locations?.length ? `Standorte: ${p.locations.join(", ")}` : "",
    specs ? `Technische Daten:\n${specs}` : "",
  ].filter(Boolean).join("\n");
}

function promptForField(field: Field, ctx: string, kind: Body["kind"]) {
  const brandRules = `
Du bist SEO-Redakteur für SLT Rental (SLT Technology Group), Händler und Vermieter von Maschinen und Event-Ausstattung in NRW.
Ton: professionell, direkt, "Du"-Ansprache. Erfinde niemals technische Daten, Preise, Garantien oder Zahlen.
Nutze ausschließlich Fakten aus dem Kontext. Keine Emojis, keine Superlative.
Es geht um den ${kind === "used" ? "Verkauf eines Gebrauchtartikels" : "Verkauf eines Neuartikels"}, nicht um Vermietung.`;

  switch (field) {
    case "short_description":
      return `${brandRules}
Schreibe eine Kurzbeschreibung (max. 200 Zeichen) für die Verkaufsartikel-Karte.
Kontext:
${ctx}

Nur den Text ausgeben.`;
    case "description":
      return `${brandRules}
Schreibe einen Verkaufstext (2–4 Absätze, 200–350 Wörter) für die Produktdetailseite:
1. Was ist der Artikel und für wen eignet er sich.
2. Wichtigste Eigenschaften und Nutzen (nur aus Kontext).
3. Kaufabwicklung bei SLT: Beratung, Besichtigung am Standort, Lieferung oder Abholung.
Kontext:
${ctx}

Nur Fließtext, kein Markdown.`;
    case "seo_title":
      return `${brandRules}
Schreibe einen SEO-Title (max. 60 Zeichen) für die Kaufseite, inklusive Marke, Modell und dem Wort "kaufen".
Kontext:
${ctx}

Nur den Titel ausgeben.`;
    case "seo_description":
      return `${brandRules}
Schreibe eine SEO-Meta-Description (max. 155 Zeichen) für die Kaufseite.
Kontext:
${ctx}

Nur den Text ausgeben.`;
    case "highlights":
      return `${brandRules}
Erstelle 4–6 kurze Highlights (je max. 60 Zeichen) als JSON-Array aus Strings.
Nur Fakten aus dem Kontext.
Kontext:
${ctx}

Nur das JSON-Array ausgeben.`;
    case "faqs":
      return `${brandRules}
Erstelle 4 FAQ-Einträge zum Kauf als JSON-Array: [{"q":"...","a":"..."}].
Themen: Eignung, Lieferung/Abholung, Einweisung, ${kind === "used" ? "Zustand und Gewährleistung beim Gebrauchtkauf" : "Garantie und Verfügbarkeit"}.
Keine erfundenen Fristen oder Preise.
Kontext:
${ctx}

Nur das JSON-Array ausgeben.`;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const userId = await getUserIdFromAuthHeader(authHeader);
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) return json({ error: "Forbidden" }, 403);

    const body = (await req.json()) as Body;
    const allowed: Field[] = ["short_description", "description", "seo_title", "seo_description", "faqs", "highlights"];
    if (!body?.field || !allowed.includes(body.field)) return json({ error: "Ungültiges Feld" }, 400);
    if (!body?.product?.name && !body?.product?.model) return json({ error: "Artikeldaten fehlen" }, 400);
    const kind = body.kind === "used" ? "used" : "new";

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const prompt = promptForField(body.field, buildContext(body.product, kind), kind);

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Du bist ein präziser SEO-Redakteur. Halte dich strikt an das Format." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (aiResp.status === 429) return json({ error: "Rate limit erreicht. Bitte kurz warten." }, 429);
    if (aiResp.status === 402) return json({ error: "KI-Guthaben aufgebraucht." }, 402);
    if (!aiResp.ok) {
      const details = await aiResp.text();
      console.error("AI Gateway error", aiResp.status, details);
      return json({ error: `AI Gateway ${aiResp.status}` }, aiResp.status);
    }

    const aiJson = await aiResp.json();
    const text: string = aiJson.choices?.[0]?.message?.content ?? "";
    let result: unknown = text.trim();

    if (body.field === "faqs" || body.field === "highlights") {
      const cleaned = text.replace(/^```(?:json)?/im, "").replace(/```$/m, "").trim();
      try {
        const parsed = JSON.parse(cleaned);
        result = Array.isArray(parsed) ? parsed.slice(0, 8) : [];
      } catch {
        result = [];
      }
    }

    return json({ field: body.field, value: result });
  } catch (err) {
    console.error("admin-generate-sales-content error", err);
    return json({ error: err instanceof Error ? err.message : "Internal error" }, 500);
  }
});
