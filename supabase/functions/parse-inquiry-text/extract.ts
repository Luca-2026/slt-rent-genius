/**
 * Kern der KI-Auswertung: liest eine frei eingefügte Kunden-E-Mail oder ein
 * Telefon-Transkript und gibt strikt strukturierte Anfragedaten zurück.
 * Die KI erfindet nichts: fehlende Angaben sind null. Preise werden NIE
 * von der KI geliefert (kommen in Schritt 2 aus dem CMS).
 */

export const MODEL = "openai/gpt-6-astra";
export const MAX_INPUT_CHARS = 20000;

const nStr = { type: ["string", "null"] } as const;

export const EXTRACTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["customer", "location", "rental", "delivery", "items", "notes", "open_questions"],
  properties: {
    customer: {
      type: "object",
      additionalProperties: false,
      required: [
        "first_name", "last_name", "company", "email", "phone",
        "street", "postal_code", "city", "customer_type",
      ],
      properties: {
        first_name: nStr,
        last_name: nStr,
        company: nStr,
        email: nStr,
        phone: nStr,
        street: nStr,
        postal_code: nStr,
        city: nStr,
        customer_type: { type: ["string", "null"], enum: ["private", "business", null] },
      },
    },
    location: { type: ["string", "null"], enum: ["krefeld", "bonn", "muelheim", null] },
    rental: {
      type: "object",
      additionalProperties: false,
      required: ["start_date", "end_date", "duration_days", "date_text"],
      properties: {
        start_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
        end_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
        duration_days: { type: ["integer", "null"] },
        date_text: { type: ["string", "null"], description: "Originalwortlaut der Zeitangabe" },
      },
    },
    delivery: {
      type: "object",
      additionalProperties: false,
      required: ["requested", "street", "postal_code", "city"],
      properties: {
        requested: { type: ["boolean", "null"] },
        street: nStr,
        postal_code: nStr,
        city: nStr,
      },
    },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["original_text", "search_terms", "quantity"],
        properties: {
          original_text: { type: "string" },
          search_terms: { type: "array", items: { type: "string" } },
          quantity: { type: "integer" },
        },
      },
    },
    notes: nStr,
    open_questions: { type: "array", items: { type: "string" } },
  },
} as const;

export interface Extraction {
  customer: {
    first_name: string | null; last_name: string | null; company: string | null;
    email: string | null; phone: string | null; street: string | null;
    postal_code: string | null; city: string | null;
    customer_type: "private" | "business" | null;
  };
  location: "krefeld" | "bonn" | "muelheim" | null;
  rental: { start_date: string | null; end_date: string | null; duration_days: number | null; date_text: string | null };
  delivery: { requested: boolean | null; street: string | null; postal_code: string | null; city: string | null };
  items: { original_text: string; search_terms: string[]; quantity: number }[];
  notes: string | null;
  open_questions: string[];
}

export function buildInstructions(today: string): string {
  return `Du wertest Mietanfragen für SLT Rental aus (Vermietung von Baumaschinen, Anhängern, Werkzeug, Event- und Veranstaltungstechnik). Standorte: Krefeld, Bonn, Mülheim an der Ruhr.
Heute ist ${today} (Zeitzone Europe/Berlin).

Regeln – strikt einhalten:
- Erfinde NICHTS. Jede Angabe, die nicht eindeutig im Text steht, ist null. Keine Platzhalter, keine Vermutungen.
- Signaturen von SLT Rental selbst (z. B. zitierte Antworten von SLT, Lena als Assistentin) sind KEINE Kundendaten.
- customer_type "business" nur bei Firmenname/Gewerbe-Hinweis, "private" nur bei klarem Privat-Hinweis, sonst null.
- location nur, wenn Standort oder eine eindeutig zuordenbare Abholung genannt wird; Ort der Baustelle allein reicht nicht.
- Datumsangaben: relative Angaben ("nächsten Freitag", "übers Wochenende") anhand des heutigen Datums in YYYY-MM-DD umrechnen und den Originalwortlaut in date_text übernehmen. Ist das Datum unklar, null und eine offene Frage stellen. duration_days = Anzahl Kalendertage inkl. Start- und Endtag, nur wenn bestimmbar.
- delivery.requested true nur bei ausdrücklichem Liefer-/Transportwunsch, false bei ausdrücklicher Selbstabholung, sonst null.
- items: jeder gewünschte Artikel einzeln. original_text = Wortlaut aus dem Text. search_terms = 1–4 kurze deutsche Suchbegriffe für einen Produktkatalog (z. B. "Minibagger", "1,8 t"). quantity = genannte Menge, sonst 1. Zubehör, das ausdrücklich gewünscht wird, als eigene Position.
- KEINE Preise ausgeben.
- notes: kurze sachliche Zusammenfassung sonstiger relevanter Wünsche (z. B. Einsatzzweck, Führerschein, Rückruf), nur was wörtlich so im Text steht – nichts hineindeuten. Umgangssprache wörtlich nehmen ("Wann ist offen" = Zeitpunkt noch offen). Sonst null.
- open_questions: was für ein Angebot noch fehlt oder unklar ist (auf Deutsch, knapp).
- E-Mail und Telefon exakt wie im Text, Telefon ohne Umformatierung außer Leerzeichen-Bereinigung.`;
}

export class GatewayError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Ruft das Gateway gestreamt auf und liefert das validierte Ergebnis. */
export async function extractInquiry(
  text: string,
  opts: { apiKey: string; today: string; signal?: AbortSignal; runId?: string },
): Promise<{ data: Extraction; runId: string | null }> {
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
      instructions: buildInstructions(opts.today),
      input: [{ role: "user", content: `Anfragetext:\n"""\n${text}\n"""` }],
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      text: {
        format: { type: "json_schema", name: "inquiry_extraction", strict: true, schema: EXTRACTION_SCHEMA },
      },
    }),
  });
  const runId = res.headers.get("X-Lovable-AIG-Run-ID");

  if (!res.ok || !res.body) {
    let msg = `KI-Dienst antwortete mit ${res.status}`;
    try {
      const j = await res.json();
      msg = j?.error?.message || j?.message || msg;
    } catch { /* ignore */ }
    throw new GatewayError(res.status, msg);
  }

  // SSE lesen
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let out = "";
  let refusal = "";
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

  let parsed: Extraction;
  try { parsed = JSON.parse(out); } catch {
    throw new GatewayError(502, "Die KI-Antwort war kein gültiges Ergebnis.");
  }
  return { data: sanitize(parsed, text), runId };
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const trimOrNull = (v: unknown) => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, 300) : null;
};

/** Absicherung nach der KI: Formate prüfen, Erfundenes verwerfen. */
export function sanitize(d: Extraction, source: string): Extraction {
  const src = source.toLowerCase();
  const srcDigits = source.replace(/\D/g, "");
  const c = d.customer ?? ({} as Extraction["customer"]);

  let email = trimOrNull(c.email)?.toLowerCase() ?? null;
  // E-Mail muss wörtlich im Text stehen und plausibel sein
  if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !src.includes(email))) email = null;

  let phone = trimOrNull(c.phone);
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 6 || !srcDigits.includes(digits.replace(/^49/, "").replace(/^0/, ""))) phone = null;
  }

  let start = trimOrNull(d.rental?.start_date);
  let end = trimOrNull(d.rental?.end_date);
  if (start && !ISO.test(start)) start = null;
  if (end && !ISO.test(end)) end = null;
  if (start && end && end < start) end = null;
  let duration = typeof d.rental?.duration_days === "number" && d.rental.duration_days > 0 && d.rental.duration_days <= 730
    ? Math.round(d.rental.duration_days) : null;
  if (start && end) {
    duration = Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;
  }

  const items = (Array.isArray(d.items) ? d.items : [])
    .map((it) => ({
      original_text: String(it?.original_text ?? "").trim().slice(0, 300),
      search_terms: (Array.isArray(it?.search_terms) ? it.search_terms : [])
        .map((s) => String(s).trim()).filter(Boolean).slice(0, 6),
      quantity: Number.isInteger(it?.quantity) && it.quantity > 0 && it.quantity <= 999 ? it.quantity : 1,
    }))
    .filter((it) => it.original_text || it.search_terms.length)
    .slice(0, 40);

  const loc = d.location;
  const ct = c.customer_type;
  return {
    customer: {
      first_name: trimOrNull(c.first_name),
      last_name: trimOrNull(c.last_name),
      company: trimOrNull(c.company),
      email,
      phone,
      street: trimOrNull(c.street),
      postal_code: trimOrNull(c.postal_code),
      city: trimOrNull(c.city),
      customer_type: ct === "private" || ct === "business" ? ct : null,
    },
    location: loc === "krefeld" || loc === "bonn" || loc === "muelheim" ? loc : null,
    rental: { start_date: start, end_date: end, duration_days: duration, date_text: trimOrNull(d.rental?.date_text) },
    delivery: {
      requested: typeof d.delivery?.requested === "boolean" ? d.delivery.requested : null,
      street: trimOrNull(d.delivery?.street),
      postal_code: trimOrNull(d.delivery?.postal_code),
      city: trimOrNull(d.delivery?.city),
    },
    items,
    notes: typeof d.notes === "string" && d.notes.trim() ? d.notes.trim().slice(0, 2000) : null,
    open_questions: (Array.isArray(d.open_questions) ? d.open_questions : [])
      .map((q) => String(q).trim()).filter(Boolean).slice(0, 15),
  };
}
