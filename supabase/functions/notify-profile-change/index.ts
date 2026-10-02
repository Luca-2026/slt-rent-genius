import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: u } = token ? await supabase.auth.getUser(token) : { data: null };
    if (!u?.user) return json({ error: "Unauthorized" }, 401);

    // Nur das eigene Profil darf eine Änderungsmeldung auslösen.
    const { data: profile } = await supabase
      .from("b2b_profiles")
      .select("id, company_name")
      .eq("user_id", u.user.id)
      .maybeSingle();
    if (!profile) return json({ error: "Forbidden" }, 403);

    const { count } = await supabase
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "admin");

    console.log(`Profile change notification for profile ${profile.id}; admins: ${count ?? 0}`);

    return json({ success: true });
  } catch (error) {
    console.error("notify-profile-change error:", error);
    return json({ error: "Interner Fehler" }, 500);
  }
});
