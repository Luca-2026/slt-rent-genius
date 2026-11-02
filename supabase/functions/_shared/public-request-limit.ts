/** A hashed secondary identity bounds attempts even if callers rotate IP headers. */
export async function publicRequestAllowed(service: any, req: Request, bucket: string, identity: string, max: number): Promise<boolean> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(identity.trim().toLowerCase()));
  const identityKey = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  for (const [suffix, key] of [["ip", ip], ["identity", identityKey]]) {
    const { data, error } = await service.rpc("check_public_rate_limit", { _bucket: `${bucket}-${suffix}`, _client_key: key, _max_hits: max, _window_seconds: 3600 });
    if (error || data !== true) return false;
  }
  return true;
}