// One-shot admin-only function to migrate seo_use_case_* from static JSON payload.
// Deploy → invoke once → delete. RLS bypassed via service role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import data from "./uc-data.json" with { type: "json" };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const SECRET = Deno.env.get("UC_MIGRATION_SECRET")!;

  const provided = req.headers.get("x-migration-secret") ?? "";
  if (!SECRET || provided !== SECRET) {
    return new Response("unauthorized", { status: 401, headers: corsHeaders });
  }

  const admin = createClient(SUPABASE_URL, SERVICE);

  const rows = data as [string, string, string, string][];
  const stats = { total: rows.length, updated: 0, skipped: 0, missing: 0, errors: [] as string[] };

  for (const [slug, bau, ev, pv] of rows) {
    const { data: existing, error: selErr } = await admin
      .from("b2b_managed_products")
      .select("slug, seo_use_case_bau, seo_use_case_event, seo_use_case_privat")
      .eq("slug", slug)
      .maybeSingle();
    if (selErr) { stats.errors.push(`${slug}: ${selErr.message}`); continue; }
    if (!existing) { stats.missing++; continue; }

    const patch: Record<string, string> = {};
    const norm = (s: string | null) => (s ?? "").trim();
    if (!norm(existing.seo_use_case_bau) && bau && bau.trim()) patch.seo_use_case_bau = bau.trim();
    if (!norm(existing.seo_use_case_event) && ev && ev.trim()) patch.seo_use_case_event = ev.trim();
    if (!norm(existing.seo_use_case_privat) && pv && pv.trim()) patch.seo_use_case_privat = pv.trim();

    if (Object.keys(patch).length === 0) { stats.skipped++; continue; }

    const { error: updErr } = await admin
      .from("b2b_managed_products")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("slug", slug);
    if (updErr) { stats.errors.push(`${slug}: ${updErr.message}`); continue; }
    stats.updated++;
  }

  return new Response(JSON.stringify(stats, null, 2), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
