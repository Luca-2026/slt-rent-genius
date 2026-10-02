// Gemeinsame Prüfung für Protokollfotos (Übergabe/Rückgabe).
// Speicherpfade müssen zum Kundenprofil der Reservierung gehören; externe Links
// werden nur aus dem eigenen Speicher akzeptiert.

export function isAllowedPhotoPath(path: unknown, profileId: string): path is string {
  if (typeof path !== "string" || !path || path.length > 500 || path.includes("..")) return false;
  const parts = path.split("/");
  return parts[0] === profileId || parts[1] === profileId;
}

export function isAllowedPhotoUrl(url: unknown): url is string {
  if (typeof url !== "string" || url.length > 2000) return false;
  const base = Deno.env.get("SUPABASE_URL") ?? "";
  try {
    const u = new URL(url);
    return u.protocol === "https:" && !!base && u.origin === new URL(base).origin && u.pathname.startsWith("/storage/v1/");
  } catch {
    return false;
  }
}

export const escAttr = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
