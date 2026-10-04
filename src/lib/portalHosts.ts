/** Shared by browser routing and the build-time first-paint guard. */
export const PORTAL_HOST = "app.slt-rental.de";
export const PUBLIC_HOST = "www.slt-rental.de";
export const LEGACY_PUBLISHED_HOST = "slt-rent-genius.lovable.app";

/** Exact host only: editor previews must never be redirected. */
export function customDomainDestination(url: URL): string | null {
  if (url.hostname.toLowerCase() !== LEGACY_PUBLISHED_HOST) return null;
  const portal = url.pathname === "/b2b" || url.pathname.startsWith("/b2b/") || url.hash.includes("type=recovery");
  const target = new URL(url.pathname + url.search + url.hash, `https://${portal ? PORTAL_HOST : PUBLIC_HOST}`);
  if (url.hash.includes("type=recovery") && !url.pathname.startsWith("/b2b/")) {
    target.pathname = "/b2b/passwort-zuruecksetzen/";
  }
  return target.href;
}