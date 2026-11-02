import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { previewPublicCoupon } from "../_shared/public-coupon.ts";
import { publicRequestAllowed } from "../_shared/public-request-limit.ts";

const schema = z.object({ code: z.string().trim().regex(/^[a-f0-9]{20}$/i), email: z.string().trim().email().max(180), slugs: z.array(z.string().min(1).max(200)).min(1).max(30) });
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Ungültige Anfrage" }, 405);
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return json({ valid: false, message: "Bitte vollständigen Gutscheincode, E-Mail und Mietartikel angeben." }, 400);
    const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return json({ error: "Prüfung derzeit nicht möglich" }, 503);
    const service = createClient(url, key, { auth: { persistSession: false } });
    if (!await publicRequestAllowed(service, req, "public-coupon", parsed.data.email, 30)) return json({ error: "Zu viele Prüfungen. Bitte später erneut versuchen." }, 429);
    return json(await previewPublicCoupon(service, parsed.data.code, parsed.data.email, [...new Set(parsed.data.slugs)]));
  } catch { return json({ error: "Gutscheinprüfung derzeit nicht möglich." }, 503); }
});