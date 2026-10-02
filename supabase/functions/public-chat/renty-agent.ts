/**
 * Renty-Agent: OpenAI Responses (Lovable AI Gateway) mit zwei Werkzeugen –
 * Produktsuche im CMS-Katalog und Absenden einer Mietanfrage. Text wird im
 * Chat-Completions-SSE-Format an das bestehende Frontend gestreamt.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { submitInquiry, type InquiryArgs } from "./renty-inquiry.ts";

const MODEL = "openai/gpt-6-astra";
const SITE = "https://www.slt-rental.de";

type ChatMessage = { role: "user" | "assistant"; content: string };

const nullableString = { type: ["string", "null"] };
const TOOLS = [
  {
    type: "function",
    name: "search_products",
    strict: true,
    description: "Durchsucht den echten Mietkatalog von SLT Rental (Name, Modell, Kategorie, technische Daten, Standorte, Artikel-Link). Immer nutzen, bevor du konkrete Geräte, Daten oder Links nennst.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["query", "location"],
      properties: {
        query: { type: "string", description: "Suchbegriffe, z. B. 'Minibagger 2 t' oder 'Bautrockner'" },
        location: { type: ["string", "null"], enum: ["krefeld", "bonn", "muelheim", null] },
      },
    },
  },
  {
    type: "function",
    name: "submit_rental_inquiry",
    strict: true,
    description: "Sendet die Mietanfrage an das SLT-Team (erscheint im Portal, Standort wird per E-Mail informiert). NUR aufrufen, wenn alle Pflichtangaben vorliegen UND der Kunde die Zusammenfassung ausdrücklich bestätigt hat. Gibt fehlende Angaben zurück, falls etwas fehlt.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["location", "items", "start_date", "start_time", "end_date", "end_time", "open_ended", "delivery", "delivery_street", "delivery_postal_code", "delivery_city", "customer_kind", "company_name", "customer_name", "customer_email", "customer_phone", "customer_street", "customer_postal_code", "customer_city", "project_description", "customer_confirmed_summary"],
      properties: {
        location: { type: "string", enum: ["krefeld", "bonn", "muelheim"] },
        items: {
          type: "array",
          items: {
            type: "object", additionalProperties: false, required: ["product_name", "quantity", "product_url"],
            properties: { product_name: { type: "string" }, quantity: { type: "integer" }, product_url: nullableString },
          },
        },
        start_date: { type: "string", description: "YYYY-MM-DD" },
        start_time: { ...nullableString, description: "HH:MM oder null" },
        end_date: { ...nullableString, description: "YYYY-MM-DD, null nur bei open_ended" },
        end_time: nullableString,
        open_ended: { type: "boolean" },
        delivery: { type: "boolean" },
        delivery_street: nullableString,
        delivery_postal_code: nullableString,
        delivery_city: nullableString,
        customer_kind: { type: "string", enum: ["private", "business"] },
        company_name: nullableString,
        customer_name: { type: "string" },
        customer_email: { type: "string" },
        customer_phone: { type: "string" },
        customer_street: nullableString,
        customer_postal_code: nullableString,
        customer_city: nullableString,
        project_description: nullableString,
        customer_confirmed_summary: { type: "boolean" },
      },
    },
  },
];

function db() {
  const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

const norm = (s: string) => s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
const STOP = new Set(["ich", "brauche", "suche", "einen", "eine", "ein", "der", "die", "das", "fuer", "mit", "und", "mieten", "miete", "in", "am", "von", "bis", "zum", "zur", "bitte"]);

let catalogCache: { at: number; rows: any[] } | null = null;
async function catalog() {
  if (catalogCache && Date.now() - catalogCache.at < 10 * 60 * 1000) return catalogCache.rows;
  const client = db();
  if (!client) return [];
  const { data, error } = await client.from("managed_products_public")
    .select("slug,name,model_name,category,subcategory,available_locations,description,specifications,tags,on_request,rentware_code,weight_kg");
  if (error) { console.error("[renty] catalog", error.message); return catalogCache?.rows ?? []; }
  catalogCache = { at: Date.now(), rows: data ?? [] };
  return catalogCache.rows;
}

export async function catalogPaths(): Promise<string[]> {
  const rows = await catalog();
  return rows.flatMap((r) => (r.available_locations ?? []).map((l: string) => `/mieten/${l}/${r.category}/${r.slug}/`));
}

export async function searchProducts(query: string, location: string | null) {
  const tokens = norm(query).match(/[a-z0-9]+/g)?.filter((t) => t.length > 1 && !STOP.has(t)) ?? [];
  const rows = await catalog();
  const scored = rows
    .filter((r) => !location || (r.available_locations ?? []).includes(location))
    .map((r) => {
      const hayRaw = norm([r.name, r.model_name, r.slug, r.category, r.subcategory, (r.tags ?? []).join(" ")].join(" "));
      const hay = `${hayRaw} ${hayRaw.replace(/[^a-z0-9]/g, "")}`;
      const words = new Set(hayRaw.split(/[^a-z0-9]+/).filter((w) => w.length >= 4));
      const body = norm(`${r.description ?? ""} ${JSON.stringify(r.specifications ?? {})}`);
      let score = 0;
      for (const t of tokens) {
        const stem = t.length > 5 ? t.replace(/(en|er|n|e|s)$/, "") : t;
        if (hay.includes(stem)) score += 3 + stem.length / 4;
        else if ([...words].some((w) => t.includes(w))) score += 3; // Komposita: "Vibrationsstampfer" → "Stampfer"
        else if (body.includes(stem)) score += 1;
      }
      return { r, score };
    })
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  return scored.map(({ r }) => {
    const locs: string[] = r.available_locations ?? [];
    const linkLoc = location && locs.includes(location) ? location : locs[0];
    const specs = Object.entries(r.specifications ?? {}).slice(0, 8).map(([k, v]) => `${k}: ${v}`);
    return {
      name: r.name, model: r.model_name, category: r.category,
      locations: locs,
      specs, weight_kg: r.weight_kg ?? null,
      short_description: String(r.description ?? "").slice(0, 220),
      online_bookable: Boolean(r.rentware_code) && !r.on_request,
      url: linkLoc ? `${SITE}/mieten/${linkLoc}/${r.category}/${r.slug}/` : null,
    };
  });
}

function sse(text: string) {
  return `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`;
}

async function* readSse(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const data = chunk.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("");
      if (!data || data === "[DONE]") continue;
      try { yield JSON.parse(data); } catch { /* ignore */ }
    }
  }
}

export class GatewayError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Erste Gateway-Antwort wird vor dem Stream geprüft, damit 402/429 sauber zurückgehen. */
async function callGateway(apiKey: string, input: unknown[], instructions: string, runId?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "Lovable-API-Key": apiKey,
    "X-Lovable-AIG-SDK": "fetch",
  };
  if (runId) headers["X-Lovable-AIG-Run-ID"] = runId;
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: MODEL,
      instructions,
      input,
      tools: TOOLS,
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      include: ["reasoning.encrypted_content"],
    }),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    console.error("[renty] gateway", res.status, text.slice(0, 500));
    throw new GatewayError(res.status, text);
  }
  return { res, runId: runId ?? res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined };
}

export async function runRenty(opts: {
  apiKey: string; instructions: string; messages: ChatMessage[]; ip: string;
  sanitize: (text: string) => string;
}): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();
  const input: any[] = opts.messages.map((m) => ({ role: m.role, content: m.content }));
  const transcript = opts.messages.map((m) => `${m.role === "user" ? "Kunde" : "Renty"}: ${m.content}`).join("\n\n");
  let first = await callGateway(opts.apiKey, input, opts.instructions);

  return new ReadableStream({
    async start(controller) {
      let runId = first.runId;
      let res: Response | null = first.res;
      try {
        for (let step = 0; step < 6 && res; step++) {
          const calls: any[] = [];
          let pending = "";
          for await (const ev of readSse(res.body!)) {
            if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") {
              pending += ev.delta;
              // Zeilenweise bereinigen (Links verifizieren), ohne Markdown-Links zu zerreißen.
              const cut = pending.lastIndexOf("\n");
              if (cut >= 0) {
                controller.enqueue(encoder.encode(sse(opts.sanitize(pending.slice(0, cut + 1)))));
                pending = pending.slice(cut + 1);
              }
            } else if (ev.type === "response.output_item.done" && ev.item) {
              input.push(ev.item);
              if (ev.item.type === "function_call") calls.push(ev.item);
            } else if (ev.type === "response.failed" || ev.type === "error") {
              console.error("[renty] stream failure", JSON.stringify(ev).slice(0, 500));
            }
          }
          if (pending) controller.enqueue(encoder.encode(sse(opts.sanitize(pending))));
          if (calls.length === 0) break;
          for (const call of calls) {
            let output: unknown;
            try {
              const args = JSON.parse(call.arguments || "{}");
              if (call.name === "search_products") output = { results: await searchProducts(String(args.query ?? ""), args.location ?? null) };
              else if (call.name === "submit_rental_inquiry") output = await submitInquiry(args as InquiryArgs, { ip: opts.ip, transcript });
              else output = { error: "unknown tool" };
            } catch (e) {
              console.error("[renty] tool", call.name, e);
              output = { error: "Werkzeug fehlgeschlagen" };
            }
            input.push({ type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) });
          }
          const next = await callGateway(opts.apiKey, input, opts.instructions, runId);
          runId = next.runId;
          res = next.res;
        }
      } catch (e) {
        console.error("[renty] run", e);
        controller.enqueue(encoder.encode(sse("\n\nEntschuldige, da ist gerade etwas schiefgelaufen. Bitte versuche es gleich noch einmal oder ruf uns an: 📞 02151 417 990 4.")));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}
