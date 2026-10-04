// Gemeinsame Begrenzung für öffentliche, kostenpflichtige Endpunkte (pro IP und Zeitfenster).
// Zählt über public.hit_rate_limit (nur service_role). Bei DB-Fehler wird der Aufruf abgelehnt.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function clientIp(req: Request): string {
  return (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "")
    .split(",")[0].trim() || "unknown";
}

export async function allowRequest(
  req: Request,
  bucket: string,
  limits: { limit: number; windowSeconds: number }[],
): Promise<boolean> {
  const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const ip = clientIp(req);
  for (const l of limits) {
    const { data, error } = await service.rpc("hit_rate_limit", {
      _bucket: `${bucket}:${l.windowSeconds}`,
      _key: ip,
      _limit: l.limit,
      _window_seconds: l.windowSeconds,
    });
    if (error || data !== true) return false;
  }
  return true;
}

export function isOwnSiteRequest(req: Request): boolean {
  const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
  let host = "";
  try { host = new URL(origin).hostname; } catch { host = ""; }
  return host === "slt-rental.de" || host.endsWith(".slt-rental.de") ||
    host.endsWith(".lovable.app") || host.endsWith(".lovableproject.com") || host === "localhost";
}
