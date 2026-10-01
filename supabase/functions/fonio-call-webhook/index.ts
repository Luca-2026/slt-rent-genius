/**
 * Empfang der fonio-Nachverarbeitung ("API Request" nach dem Gespräch).
 * Prüft den gemeinsamen Schlüssel, speichert die Nachricht unverändert
 * (doppelte Zustellung wird erkannt) und startet die KI-Vorauswertung.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { normalizeFonioPayload, providedSecret, safeEqual, sha256Hex } from "../_shared/fonioPayload.ts";
import { analyzePhoneCall } from "../_shared/phoneCallAnalysis.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-fonio-secret, content-type",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const MAX_BYTES = 500_000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const secret = Deno.env.get("FONIO_SHARED_SECRET");
  if (!secret) return json({ error: "Nicht konfiguriert" }, 503);
  const given = providedSecret(req);
  if (!given || !safeEqual(given, secret)) return json({ error: "Nicht berechtigt" }, 401);

  const raw = await req.text();
  if (!raw.trim()) return json({ error: "Leere Nachricht" }, 400);
  if (raw.length > MAX_BYTES) return json({ error: "Nachricht zu groß" }, 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { body = { transcript: raw }; }

  const c = normalizeFonioPayload(body);
  const externalId = c.externalId ?? `hash:${await sha256Hex(raw)}`;
  const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  const { data: existing } = await svc.from("phone_calls").select("id").eq("source", "fonio").eq("external_id", externalId).maybeSingle();
  if (existing) return json({ ok: true, id: existing.id, duplicate: true });

  const a = (new URL(req.url).searchParams.get("assistant") ?? "").toLowerCase();
  const assistant = a === "krefeld" || a === "bonn" ? a : null;

  const { data: row, error } = await svc.from("phone_calls").insert({
    source: "fonio", external_id: externalId, raw_payload: body, assistant,
    caller_phone: c.callerPhone, caller_name: c.callerName, call_started_at: c.startedAt,
    duration_seconds: c.durationSeconds, recording_url: c.recordingUrl,
    transcript: c.transcript, provider_summary: c.providerSummary,
  }).select("id").single();
  if (error) {
    if ((error as { code?: string }).code === "23505") return json({ ok: true, duplicate: true });
    console.error("insert phone_call", error);
    return json({ error: "Speichern fehlgeschlagen" }, 500);
  }

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (apiKey) {
    const job = analyzePhoneCall(svc, row.id, apiKey).catch((e) => console.error("analysis", e));
    // deno-lint-ignore no-explicit-any
    const rt = (globalThis as any).EdgeRuntime;
    if (rt?.waitUntil) rt.waitUntil(job); else await job;
  }
  return json({ ok: true, id: row.id });
});
