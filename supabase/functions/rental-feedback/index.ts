import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const schema = z.object({
  action: z.enum(["info", "submit"]), token: z.string().regex(/^[a-f0-9]{64}$/),
  ratings: z.record(z.number().int().min(1).max(5)).default({}),
  answers: z.record(z.string().max(3000)).default({}),
  recommend: z.number().int().min(0).max(10).nullable().default(null),
});
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Ungültige Anfrage" }, 405);
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Ungültiger Feedback-Link oder Angaben" }, 400);
    const body = parsed.data;
    const url = Deno.env.get("SUPABASE_URL"); const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return json({ error: "Dienst nicht verfügbar" }, 500);
    const service = createClient(url, key);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { data: allowed, error: rateError } = await service.rpc("check_public_rate_limit", { _bucket: "rental-feedback", _client_key: ip, _max_hits: 60, _window_seconds: 3600 });
    if (rateError || !allowed) return json({ error: "Zu viele Versuche. Bitte später erneut versuchen." }, 429);
    if (body.action === "info") {
      const { data: invite } = await service.from("rental_feedback_invitations").select("order_ref,location,rented_items,submitted_at,feedback_id,id").eq("token", body.token).maybeSingle();
      if (!invite) return json({ error: "Dieser Feedback-Link ist ungültig." }, 404);
      const { data: coupon } = await service.from("rental_feedback_coupons").select("code,status").eq("invitation_id", invite.id).maybeSingle();
      return json({ order_ref: invite.order_ref, location: invite.location, rented_items: invite.rented_items, submitted: !!invite.feedback_id, coupon_code: coupon?.code ?? null, coupon_status: coupon?.status ?? null });
    }
    const { data, error } = await service.rpc("submit_rental_feedback", { p_token: body.token, p_ratings: body.ratings, p_answers: body.answers, p_recommend: body.recommend });
    if (error) return json({ error: error.message }, 400);
    return json(data);
  } catch { return json({ error: "Feedback konnte nicht verarbeitet werden" }, 400); }
});