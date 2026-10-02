// Prüft, ob ein Aufruf vom internen Zeitplan (pg_cron) stammt.
// Der Schlüssel liegt in public.internal_cron_secret (nur service_role lesbar).
// deno-lint-ignore no-explicit-any
export async function isCronCall(req: Request, service: any): Promise<boolean> {
  const given = req.headers.get("x-cron-secret");
  if (!given) return false;
  const { data } = await service.from("internal_cron_secret").select("secret").eq("id", 1).maybeSingle();
  return !!data?.secret && data.secret === given;
}

// Liefert die User-ID, wenn der Bearer-Token gültig ist und der Nutzer Mitarbeiter ist.
// deno-lint-ignore no-explicit-any
export async function staffUserId(req: Request, service: any, requireAdmin = false): Promise<string | null> {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data: u } = await service.auth.getUser(token);
  if (!u?.user) return null;
  const { data: ok } = requireAdmin
    ? await service.rpc("is_super_admin", { _user_id: u.user.id })
    : await service.rpc("is_staff_member", { _user_id: u.user.id });
  return ok ? u.user.id : null;
}
