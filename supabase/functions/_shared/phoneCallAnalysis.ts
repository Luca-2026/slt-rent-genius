/**
 * KI-Vorauswertung eines Telefonats: Zusammenfassung, Anliegen, Priorität,
 * Standort, Artikel, offene Punkte. Die KI erfindet nichts (fehlend = null),
 * feste Regeln aus callPriority.ts heben die Priorität ggf. an.
 */
import { finalPriority, normalizePhone, type CallIntent, type CallPriority } from "./callPriority.ts";

export const CALL_MODEL = "openai/gpt-6-astra";

export class AiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const n = (t: string) => ({ type: [t, "null"] });
const SCHEMA = {
  type: "object", additionalProperties: false,
  required: ["summary", "intent", "priority", "priority_reason", "location", "customer_name", "company_name", "email", "callback_phone", "rental_start", "mentioned_items", "open_points"],
  properties: {
    summary: { type: "string" },
    intent: { type: "string", enum: ["rental_inquiry", "offer_change", "complaint_damage", "callback", "info", "other"] },
    priority: { type: "string", enum: ["sofort", "heute", "woche", "info"] },
    priority_reason: { type: "string" },
    location: { type: ["string", "null"], enum: ["krefeld", "bonn", "muelheim", null] },
    customer_name: n("string"), company_name: n("string"), email: n("string"), callback_phone: n("string"),
    rental_start: { type: ["string", "null"], description: "YYYY-MM-DD" },
    mentioned_items: { type: "array", items: { type: "string" } },
    open_points: { type: "array", items: { type: "string" } },
  },
} as const;

function instructions(today: string) {
  return `Du wertest Telefonate der Telefonassistenz von SLT Rental aus (Vermietung von Baumaschinen, Anhängern, Werkzeug, Event-Technik; Standorte Krefeld, Bonn, Mülheim an der Ruhr). Heute ist ${today} (Europe/Berlin).
Regeln – strikt:
- Erfinde NICHTS. Was nicht eindeutig im Transkript steht, ist null bzw. leer.
- Aussagen der Assistenz (Lena/SLT) sind keine Kundendaten.
- summary: 1–3 sachliche deutsche Sätze, was der Anrufer will.
- intent: rental_inquiry (neue Miete), offer_change (bestehendes Angebot/Auftrag ändern), complaint_damage (Reklamation, Defekt, Schaden, Unfall), callback (bittet nur um Rückruf), info (allgemeine Frage, z. B. Öffnungszeiten), other.
- priority: sofort = Notfall, Gerät defekt im Einsatz, Mietbeginn heute/morgen oder Kunde wartet dringend; heute = konkrete Mietanfrage, Angebotsänderung, Reklamation, Rückrufwunsch; woche = unverbindliche Anfrage mit fernem Termin; info = kein Handlungsbedarf.
- priority_reason: ein kurzer Satz.
- location nur bei ausdrücklicher Nennung eines Standorts.
- rental_start nur bei eindeutigem Datum, relative Angaben anhand von heute umrechnen.
- mentioned_items: genannte Geräte im Wortlaut. open_points: was für die Bearbeitung noch fehlt.
- E-Mail und Telefon exakt wie genannt.`;
}

async function readSse(body: ReadableStream<Uint8Array>): Promise<string> {
  const reader = body.getReader(); const dec = new TextDecoder();
  let buf = "", out = "", refusal = ""; let failure: string | null = null;
  for (;;) {
    const { value, done } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith("data:")) continue;
      const p = line.slice(5).trim(); if (!p || p === "[DONE]") continue;
      let ev: any; try { ev = JSON.parse(p); } catch { continue; }
      if (ev.type === "response.output_text.delta") out += ev.delta ?? "";
      else if (ev.type === "response.refusal.delta") refusal += ev.delta ?? "";
      else if (ev.type === "response.failed" || ev.type === "error") failure = ev.response?.error?.message || ev.error?.message || "KI-Auswertung fehlgeschlagen";
    }
  }
  if (failure) throw new AiError(502, failure);
  if (refusal) throw new AiError(422, "Die KI hat die Auswertung abgelehnt.");
  if (!out.trim()) throw new AiError(502, "Die KI hat kein Ergebnis geliefert.");
  return out;
}

const berlinDate = (d = new Date()) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(d);
const t = (v: unknown, max = 300) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

// deno-lint-ignore no-explicit-any
export async function analyzePhoneCall(svc: any, callId: string, apiKey: string): Promise<void> {
  const { data: call, error } = await svc.from("phone_calls").select("*").eq("id", callId).maybeSingle();
  if (error || !call) throw new Error("Anruf nicht gefunden");
  const text = [call.provider_summary ? `Zusammenfassung von fonio: ${call.provider_summary}` : null, call.transcript ? `Transkript:\n${call.transcript}` : null].filter(Boolean).join("\n\n");
  if (!text) {
    await svc.from("phone_calls").update({ analysis_status: "failed", analysis_error: "Kein Transkript in der Nachricht enthalten." }).eq("id", callId);
    return;
  }
  const callDate = berlinDate(call.call_started_at ? new Date(call.call_started_at) : new Date(call.created_at));
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: CALL_MODEL,
        instructions: instructions(callDate),
        input: [{ role: "user", content: `Anrufernummer: ${call.caller_phone ?? "unbekannt"}\n\n${text.slice(0, 40000)}` }],
        stream: true, store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
        text: { format: { type: "json_schema", name: "call_analysis", strict: true, schema: SCHEMA } },
      }),
    });
    if (!res.ok || !res.body) {
      let msg = `KI-Dienst antwortete mit ${res.status}`;
      try { const j = await res.json(); msg = j?.error?.message || j?.message || msg; } catch { /* */ }
      if (res.status === 402) msg = "KI-Guthaben aufgebraucht. Bitte Guthaben aufladen und erneut auswerten.";
      if (res.status === 429) msg = "KI-Dienst ausgelastet. Bitte später erneut auswerten.";
      throw new AiError(res.status, msg);
    }
    const r = JSON.parse(await readSse(res.body));
    const src = text.toLowerCase();
    let email = t(r.email)?.toLowerCase() ?? null;
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) email = null;
    const rentalStart = t(r.rental_start, 10);
    const intent = r.intent as CallIntent;
    const ai = r.priority as CallPriority;
    const fp = finalPriority({ aiPriority: ai, intent, rentalStart: rentalStart && /^\d{4}-\d{2}-\d{2}$/.test(rentalStart) ? rentalStart : null, callDate });
    const callback = t(r.callback_phone, 60);
    const phoneNorm = normalizePhone(callback) ?? normalizePhone(call.caller_phone);

    // Kundenkartei-Abgleich (E-Mail, sonst Telefon)
    let crmId: string | null = null;
    if (email) {
      const { data } = await svc.from("crm_customers").select("id").ilike("email", email).limit(1);
      crmId = data?.[0]?.id ?? null;
    }
    if (!crmId && phoneNorm) {
      const { data } = await svc.from("crm_customers").select("id,phone").not("phone", "is", null).limit(5000);
      crmId = (data ?? []).find((c: { phone: string }) => normalizePhone(c.phone) === phoneNorm)?.id ?? null;
    }

    const update: Record<string, unknown> = {
      summary: t(r.summary, 1500), intent, ai_priority: ai,
      priority_reason: fp.ruleReason ? `${t(r.priority_reason, 300) ?? ""} ${fp.ruleReason}`.trim() : t(r.priority_reason, 300),
      location: ["krefeld", "bonn", "muelheim"].includes(r.location) ? r.location : null,
      customer_name: t(r.customer_name, 200), company_name: t(r.company_name, 200),
      email: email && src.includes(email) ? email : null,
      rental_start: rentalStart && /^\d{4}-\d{2}-\d{2}$/.test(rentalStart) ? rentalStart : null,
      mentioned_items: (Array.isArray(r.mentioned_items) ? r.mentioned_items : []).map((s: unknown) => t(s, 200)).filter(Boolean).slice(0, 20),
      open_points: (Array.isArray(r.open_points) ? r.open_points : []).map((s: unknown) => t(s, 300)).filter(Boolean).slice(0, 15),
      crm_customer_id: crmId,
      analysis_status: "done", analysis_error: null,
    };
    if (!call.priority_overridden) update.priority = fp.priority;
    if (!call.caller_phone && callback) update.caller_phone = callback;
    await svc.from("phone_calls").update(update).eq("id", callId);
  } catch (e) {
    const msg = e instanceof AiError ? e.message : "Auswertung fehlgeschlagen.";
    console.error("analyzePhoneCall", e);
    await svc.from("phone_calls").update({ analysis_status: "failed", analysis_error: msg }).eq("id", callId);
    if (e instanceof AiError) throw e;
  }
}
