/**
 * Liest eine fonio-Nachverarbeitungs-Nachricht flexibel aus. Die genauen
 * Feldnamen legt man bei fonio selbst fest, daher werden gängige Varianten
 * akzeptiert. Das Original wird immer unverändert gespeichert.
 */
type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);

function flatten(o: Obj, prefix = "", out: Map<string, unknown> = new Map(), depth = 0): Map<string, unknown> {
  for (const [k, v] of Object.entries(o)) {
    const key = (prefix ? `${prefix}.${k}` : k).toLowerCase().replace(/[_\-\s]/g, "");
    if (!out.has(key)) out.set(key, v);
    const short = k.toLowerCase().replace(/[_\-\s]/g, "");
    if (!out.has(short)) out.set(short, v);
    if (isObj(v) && depth < 3) flatten(v, key, out, depth + 1);
  }
  return out;
}

function pick(m: Map<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    const v = m.get(k);
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
}

const str = (v: unknown, max = 500) => {
  if (v === null || v === undefined) return null;
  const s = typeof v === "string" ? v : typeof v === "number" ? String(v) : null;
  const t = s?.trim();
  return t ? t.slice(0, max) : null;
};

function transcriptFrom(v: unknown): string | null {
  if (typeof v === "string") return v.trim().slice(0, 60000) || null;
  if (Array.isArray(v)) {
    const lines = v.map((e) => {
      if (typeof e === "string") return e;
      if (isObj(e)) {
        const role = str(e.role ?? e.speaker ?? e.from, 40);
        const text = str(e.text ?? e.content ?? e.message ?? e.transcript, 5000);
        return text ? (role ? `${role}: ${text}` : text) : null;
      }
      return null;
    }).filter(Boolean);
    return lines.length ? lines.join("\n").slice(0, 60000) : null;
  }
  return null;
}

export interface NormalizedCall {
  externalId: string | null;
  callerPhone: string | null;
  callerName: string | null;
  startedAt: string | null;
  durationSeconds: number | null;
  recordingUrl: string | null;
  transcript: string | null;
  providerSummary: string | null;
}

export function normalizeFonioPayload(body: unknown): NormalizedCall {
  const o: Obj = isObj(body) ? body : { value: body };
  const m = flatten(o);
  const dur = pick(m, ["duration", "durationseconds", "callduration", "durationsec"]);
  const durN = typeof dur === "number" ? dur : typeof dur === "string" ? Number(dur.replace(",", ".")) : NaN;
  const started = str(pick(m, ["startedat", "starttime", "callstartedat", "createdat", "timestamp", "date"]), 60);
  return {
    externalId: str(pick(m, ["callid", "contextid", "context.id", "conversationid", "id", "sessionid"]), 200),
    callerPhone: str(pick(m, ["caller", "callernumber", "callerphone", "from", "fromnumber", "phone", "phonenumber", "customerphone", "number"]), 60),
    callerName: str(pick(m, ["callername", "customername", "name"]), 200),
    startedAt: started && !Number.isNaN(Date.parse(started)) ? new Date(started).toISOString() : null,
    durationSeconds: Number.isFinite(durN) && durN >= 0 && durN < 86400 ? Math.round(durN) : null,
    recordingUrl: (() => {
      const u = str(pick(m, ["audiolink", "recordingurl", "recording", "audiourl", "audio"]), 2000);
      return u && /^https:\/\//i.test(u) ? u : null;
    })(),
    transcript: transcriptFrom(pick(m, ["transcript", "transcription", "conversation", "messages", "dialog", "text"])),
    providerSummary: str(pick(m, ["summary", "zusammenfassung", "callsummary"]), 5000),
  };
}

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Konstantzeit-Vergleich für den gemeinsamen Schlüssel. */
export function safeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a), eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

/** Schlüssel aus Header (Bearber / x-fonio-secret) oder ?key= lesen. */
export function providedSecret(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  const h = req.headers.get("x-fonio-secret");
  if (h) return h.trim();
  const k = new URL(req.url).searchParams.get("key");
  return k ? k.trim() : null;
}
