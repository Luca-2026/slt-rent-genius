// "Erneut auswerten" für einen gespeicherten Anruf – nur für Mitarbeiter.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { analyzePhoneCall, AiError } from "../_shared/phoneCallAnalysis.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return json({ error: "Nicht angemeldet" }, 401);
  const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: u } = await svc.auth.getUser(auth.slice(7));
  if (!u?.user) return json({ error: "Nicht angemeldet" }, 401);
  const { data: isStaff } = await svc.rpc("is_staff_member", { _user_id: u.user.id });
  if (!isStaff) return json({ error: "Keine Berechtigung" }, 403);
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" && /^[0-9a-f-]{36}$/i.test(body.id) ? body.id : null;
  if (!id) return json({ error: "Ungültige Anruf-ID" }, 400);
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "KI-Dienst ist nicht konfiguriert." }, 500);
  try {
    await analyzePhoneCall(svc, id, apiKey);
    return json({ ok: true });
  } catch (e) {
    if (e instanceof AiError) return json({ error: e.message }, [402, 403, 422, 429].includes(e.status) ? e.status : 502);
    return json({ error: (e as Error).message || "Auswertung fehlgeschlagen" }, 500);
  }
});
