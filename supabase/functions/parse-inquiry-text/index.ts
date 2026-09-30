/**
 * KI-Anfrage-Import, Schritt 1: Auswertung eines eingefügten Textes
 * (Kunden-E-Mail oder Telefon-Transkript) in strukturierte Anfragedaten.
 * Nur für Admins / aktive Mitarbeiter. Erstellt nichts, sendet nichts.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { extractInquiry, GatewayError, MAX_INPUT_CHARS } from "./extract.ts";
import { matchItems, type CatalogRow } from "./match.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });

function berlinToday(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Nicht angemeldet" }, 401);
    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const { data: userData, error: userErr } = await service.auth.getUser(authHeader.slice(7));
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Nicht angemeldet" }, 401);
    const { data: isStaff } = await service.rpc("is_staff_member", { _user_id: user.id });
    if (!isStaff) return json({ error: "Keine Berechtigung" }, 403);

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (text.length < 10) return json({ error: "Bitte einen Anfragetext einfügen (mind. 10 Zeichen)." }, 400);
    if (text.length > MAX_INPUT_CHARS) {
      return json({ error: `Text zu lang (${text.length} Zeichen, max. ${MAX_INPUT_CHARS}). Bitte auf die eigentliche Anfrage kürzen.` }, 400);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "KI-Dienst ist nicht konfiguriert." }, 500);

    const { data, runId } = await extractInquiry(text, {
      apiKey,
      today: berlinToday(),
      signal: req.signal,
      runId: req.headers.get("X-Lovable-AIG-Run-ID") ?? undefined,
    });

    // Schritt 2: echten, veröffentlichten CMS-Katalog laden und zuordnen
    const { data: catalog, error: catErr } = await service
      .from("b2b_managed_products")
      .select("id,slug,name,model_name,category,subcategory,rentware_code,on_request,price_per_day,price_weekend,price_per_month,price_unit_label,images,addon_options")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (catErr) throw catErr;
    const { matches, runId: runId2 } = await matchItems(data, (catalog ?? []) as CatalogRow[], {
      apiKey,
      signal: req.signal,
      runId: runId ?? undefined,
    });
    const rid = runId2 ?? runId;
    return json({ result: data, matches }, 200, rid ? { "X-Lovable-AIG-Run-ID": rid } : {});
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: corsHeaders });
    if (e instanceof GatewayError) {
      const map: Record<number, string> = {
        402: "KI-Guthaben aufgebraucht. Bitte Guthaben im Workspace aufladen.",
        429: "Der KI-Dienst ist gerade ausgelastet. Bitte in einer Minute erneut versuchen.",
      };
      const status = [400, 401, 402, 403, 404, 422, 429].includes(e.status) ? e.status : 502;
      return json({ error: map[e.status] ?? e.message }, status);
    }
    console.error("parse-inquiry-text error", e);
    return json({ error: "Auswertung fehlgeschlagen. Bitte erneut versuchen." }, 500);
  }
});
