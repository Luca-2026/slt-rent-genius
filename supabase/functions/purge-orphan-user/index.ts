import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Einmalige Wartungsfunktion: löscht genau ein verwaistes Auth-Konto ohne staff_profile. */
const ALLOWED_USER_ID = "4e56f61e-19a8-4f3d-95f0-adad9d91c562";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const service = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: profile } = await service
    .from("staff_profiles")
    .select("id")
    .eq("user_id", ALLOWED_USER_ID)
    .maybeSingle();
  if (profile) {
    return new Response(JSON.stringify({ error: "user still has a staff profile" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { error } = await service.auth.admin.deleteUser(ALLOWED_USER_ID);
  return new Response(JSON.stringify({ success: !error, error: error?.message ?? null }), {
    status: error ? 500 : 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
