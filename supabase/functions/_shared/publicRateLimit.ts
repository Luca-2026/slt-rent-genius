// Per-visitor request cap for intentionally public endpoints that spend paid
// third-party quota (AI gateway, Google Maps). Counter lives in public.public_rate_limits
// and is updated atomically by public.check_public_rate_limit (service_role only).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

export function clientIp(req: Request): string {
  const fwd = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const real = (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip") ?? "").trim();
  return (fwd || real || "unknown").slice(0, 100);
}

/** Returns true when the request is allowed. Fails open if the counter is unreachable. */
export async function allowPublicRequest(
  req: Request,
  bucket: string,
  maxHits: number,
  windowSeconds = 3600,
): Promise<boolean> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return true;
    const admin = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await admin.rpc("check_public_rate_limit", {
      _bucket: bucket,
      _client_key: clientIp(req),
      _max_hits: maxHits,
      _window_seconds: windowSeconds,
    });
    if (error) {
      console.error("rate limit check failed", error.message);
      return true;
    }
    return data === true;
  } catch (e) {
    console.error("rate limit check error", e);
    return true;
  }
}

/**
 * Project-wide spend ceiling for paid public endpoints, shared by all visitors
 * (bounds cost even when attackers rotate IPs). Fails closed: if the counter is
 * unreachable, the paid call is refused instead of spending quota.
 */
export async function allowGlobalBudget(bucket: string, maxHits: number, windowSeconds = 86400): Promise<boolean> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return false;
    const admin = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await admin.rpc("check_public_rate_limit", {
      _bucket: `global:${bucket}`, _client_key: "global", _max_hits: maxHits, _window_seconds: windowSeconds,
    });
    if (error) { console.error("global budget check failed", error.message); return false; }
    return data === true;
  } catch (e) { console.error("global budget check error", e); return false; }
}

/** Per-visitor limit plus project-wide daily ceiling. */
export async function allowPaidPublicRequest(req: Request, bucket: string, perVisitor: number, globalDaily: number): Promise<boolean> {
  if (!(await allowPublicRequest(req, bucket, perVisitor, 3600))) return false;
  return allowGlobalBudget(bucket, globalDaily, 86400);
}
