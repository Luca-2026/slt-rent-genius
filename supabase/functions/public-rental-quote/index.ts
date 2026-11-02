import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { publicRentalQuote } from "../_shared/public-rental-quote.ts";
const item = z.object({ id: z.string().max(100), product_slug: z.string().min(1).max(200), location: z.enum(["krefeld", "bonn", "muelheim"]), quantity: z.number().int().min(1).max(9999), start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), selected_addons: z.array(z.string().max(60)).max(10), use_saturday: z.boolean(), use_sunday: z.boolean() }).refine(row => `${row.end_date}T${row.end_time}` > `${row.start_date}T${row.start_time}`, "Rückgabe muss nach Abholung liegen");
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Ungültige Anfrage" }, 405);
  try {
    const parsed = z.object({ items: z.array(item).min(1).max(30) }).safeParse(await req.json());
    if (!parsed.success) return json({ error: "Bitte gültige Artikel, Mengen und Zeiträume auswählen." }, 400);
    const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return json({ error: "Preise derzeit nicht verfügbar" }, 503);
    const service = createClient(url, key);
    const { data, error } = await service.rpc("check_public_rate_limit", { _bucket: "public-rental-quote", _client_key: req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown", _max_hits: 120, _window_seconds: 3600 });
    if (error || !data) return json({ error: "Bitte später erneut versuchen" }, 429);
    return json({ lines: await publicRentalQuote(service, parsed.data.items) });
  } catch { return json({ error: "Preisprüfung nicht möglich. Bitte erneut versuchen." }, 503); }
});