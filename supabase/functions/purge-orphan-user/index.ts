import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Einmalige Wartungsfunktion: löscht ein verwaistes Auth-Konto ohne staff_profile. */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const service = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { user_id, maintenance_token } = await req.json().catch(() => ({} as any));
  if (maintenance_token !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { data: profile } = await service
    .from("staff_profiles")
    .select("id")
    .eq("user_id", user_id)
    .maybeSingle();
  if (profile) {
    return new Response(JSON.stringify({ error: "user still has a staff profile" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { error } = await service.auth.admin.deleteUser(user_id);
  return new Response(JSON.stringify({ success: !error, error: error?.message ?? null }), {
    status: error ? 500 : 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
