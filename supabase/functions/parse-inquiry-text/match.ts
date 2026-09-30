/**
 * Schritt 2: Zuordnung der ausgelesenen Positionen zu echten CMS-Artikeln.
 * Die KI sieht nur den echten Katalog (Kurz-IDs) und darf ausschließlich
 * daraus wählen. Jede zurückgegebene ID wird serverseitig geprüft; alles
 * Unbekannte wird verworfen. Preise liefert die KI nie.
 */
import { GatewayError, MODEL, type Extraction } from "./extract.ts";

export interface CatalogRow {
  id: string;
  slug: string;
  name: string;
  model_name: string | null;
  category: string | null;
  subcategory: string | null;
  rentware_code: Record<string, string> | null;
  on_request: boolean | null;
  price_per_day: string | null;
  price_weekend: string | null;
  price_per_month: string | null;
  price_unit_label: string | null;
  images: string[] | null;
  addon_options: unknown;
}

export type Confidence = "high" | "medium" | "low" | "none";

export interface MatchedProduct {
  slug: string;
  name: string;
  model_name: string | null;
  category: string | null;
  bookable_locations: string[];
  bookable_here: boolean | null; // null = kein Standort bekannt
  price_per_day: string | null;
  price_weekend: string | null;
  price_per_month: string | null;
  price_unit_label: string | null;
  image: string | null;
}

export interface ItemMatch {
  index: number;
  original_text: string;
  quantity: number;
  confidence: Confidence;
  reason: string | null;
  product: MatchedProduct | null;
  alternatives: MatchedProduct[];
}

const MATCH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["matches"],
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["index", "best", "alternatives", "confidence", "reason"],
        properties: {
          index: { type: "integer" },
          best: { type: ["string", "null"] },
          alternatives: { type: "array", items: { type: "string" } },
          confidence: { type: "string", enum: ["high", "medium", "low", "none"] },
          reason: { type: ["string", "null"] },
        },
      },
    },
  },
} as const;

const LOC_LABEL: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr" };

export function bookableLocations(row: Pick<CatalogRow, "rentware_code">): string[] {
  const rc = row.rentware_code ?? {};
  return Object.keys(rc).filter((k) => typeof rc[k] === "string" && rc[k].trim() !== "");
}

export function toMatchedProduct(row: CatalogRow, location: string | null): MatchedProduct {
  const locs = bookableLocations(row);
  return {
    slug: row.slug,
    name: row.name,
    model_name: row.model_name,
    category: row.category,
    bookable_locations: locs,
    bookable_here: location ? locs.includes(location) : null,
    price_per_day: row.price_per_day,
    price_weekend: row.price_weekend,
    price_per_month: row.price_per_month,
    price_unit_label: row.price_unit_label,
    image: Array.isArray(row.images) && row.images[0] ? row.images[0] : null,
  };
}

/** Kompakte Katalogliste für die KI: "K12 | Name (Modell) | Kategorie | buchbar: Bonn". */
export function buildCatalogText(rows: CatalogRow[]): { text: string; byKey: Map<string, CatalogRow> } {
  const byKey = new Map<string, CatalogRow>();
  const lines = rows.map((r, i) => {
    const key = `K${i + 1}`;
    byKey.set(key, r);
    const locs = bookableLocations(r).map((l) => LOC_LABEL[l] ?? l).join(", ") || "nur auf Anfrage";
    const model = r.model_name ? ` (${r.model_name})` : "";
    const cat = [r.category, r.subcategory].filter(Boolean).join("/");
    return `${key} | ${r.name}${model} | ${cat} | buchbar: ${locs}`;
  });
  return { text: lines.join("\n"), byKey };
}

function instructions(location: string | null) {
  return `Du ordnest Positionen einer Mietanfrage Artikeln aus dem Mietkatalog von SLT Rental zu.
${location ? `Gewünschter Standort: ${LOC_LABEL[location]}.` : "Standort noch unbekannt."}

Regeln – strikt einhalten:
- Wähle ausschließlich Schlüssel (K…) aus der Katalogliste. Niemals Schlüssel erfinden.
- best = der Artikel, der den Wunsch am genauesten trifft (Gerätetyp zuerst, dann Größe/Gewicht/Leistung/Länge).
- Passt kein Artikel zum Gerätetyp, best = null und confidence "none". Kein "ähnlicher" Ersatz aus einer anderen Geräteart.
- confidence: "high" = Typ und genannte Größe/Variante passen eindeutig; "medium" = Typ passt, Variante nicht genannt oder mehrere gleichwertige Varianten; "low" = nur ungefähr passend.
- alternatives = bis zu 3 weitere sinnvolle Varianten desselben Gerätetyps (ohne best), sonst leer.
- Bei bekanntem Standort Artikel bevorzugen, die dort buchbar sind, wenn sie gleich gut passen.
- reason: ein kurzer deutscher Satz, warum (oder was unklar ist).
- Gib für jede Position genau einen Eintrag mit ihrem index zurück.`;
}

export async function matchItems(
  extraction: Extraction,
  catalog: CatalogRow[],
  opts: { apiKey: string; signal?: AbortSignal; runId?: string },
): Promise<{ matches: ItemMatch[]; runId: string | null }> {
  const items = extraction.items;
  if (items.length === 0) return { matches: [], runId: opts.runId ?? null };
  const location = extraction.location;
  const { text: catalogText, byKey } = buildCatalogText(catalog);

  const positions = items
    .map((it, i) => `${i}: "${it.original_text}" (Menge ${it.quantity}; Suchbegriffe: ${it.search_terms.join(", ")})`)
    .join("\n");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Lovable-API-Key": opts.apiKey,
    "X-Lovable-AIG-SDK": "fetch",
  };
  if (opts.runId) headers["X-Lovable-AIG-Run-ID"] = opts.runId;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    signal: opts.signal,
    headers,
    body: JSON.stringify({
      model: MODEL,
      instructions: instructions(location),
      input: [{ role: "user", content: `Katalog:\n${catalogText}\n\nPositionen:\n${positions}` }],
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      text: { format: { type: "json_schema", name: "catalog_match", strict: true, schema: MATCH_SCHEMA } },
    }),
  });
  const runId = res.headers.get("X-Lovable-AIG-Run-ID") ?? opts.runId ?? null;
  if (!res.ok || !res.body) {
    let msg = `KI-Dienst antwortete mit ${res.status}`;
    try { const j = await res.json(); msg = j?.error?.message || j?.message || msg; } catch { /* ignore */ }
    throw new GatewayError(res.status, msg);
  }
  const out = await readSse(res.body);
  let parsed: { matches: { index: number; best: string | null; alternatives: string[]; confidence: Confidence; reason: string | null }[] };
  try { parsed = JSON.parse(out); } catch { throw new GatewayError(502, "Die Artikelzuordnung war ungültig."); }

  const result: ItemMatch[] = items.map((it, index) => {
    const m = parsed.matches?.find((x) => x.index === index);
    const bestRow = m?.best ? byKey.get(m.best) ?? null : null; // unbekannte Schlüssel verworfen
    const alts: MatchedProduct[] = [];
    for (const k of m?.alternatives ?? []) {
      const row = byKey.get(k);
      if (row && row !== bestRow && !alts.some((a) => a.slug === row.slug)) alts.push(toMatchedProduct(row, location));
      if (alts.length >= 3) break;
    }
    let confidence: Confidence = bestRow ? (m?.confidence ?? "low") : "none";
    if (bestRow && confidence === "none") confidence = "low";
    return {
      index,
      original_text: it.original_text,
      quantity: it.quantity,
      confidence,
      reason: typeof m?.reason === "string" ? m.reason.slice(0, 300) : null,
      product: bestRow ? toMatchedProduct(bestRow, location) : null,
      alternatives: alts,
    };
  });
  return { matches: result, runId };
}

export async function readSse(body: ReadableStream<Uint8Array>): Promise<string> {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "", out = "", refusal = "";
  let failure: string | null = null;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      let ev: any;
      try { ev = JSON.parse(payload); } catch { continue; }
      if (ev.type === "response.output_text.delta") out += ev.delta ?? "";
      else if (ev.type === "response.refusal.delta") refusal += ev.delta ?? "";
      else if (ev.type === "response.failed" || ev.type === "error") {
        failure = ev.response?.error?.message || ev.error?.message || ev.message || "KI-Auswertung fehlgeschlagen";
      }
    }
  }
  if (failure) throw new GatewayError(502, failure);
  if (refusal) throw new GatewayError(422, "Die KI hat die Auswertung abgelehnt.");
  if (!out.trim()) throw new GatewayError(502, "Die KI hat kein Ergebnis geliefert.");
  return out;
}
