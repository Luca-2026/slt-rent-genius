/**
 * Portal-Subdomain (app.slt-rental.de)
 * ------------------------------------
 * Das B2B-Portal soll unter einer eigenen Subdomain erreichbar sein.
 * Ausgeliefert wird derselbe Build – die Weiche läuft über den Hostnamen.
 */

export const PORTAL_HOST = "app.slt-rental.de";
export const PUBLIC_HOST = "www.slt-rental.de";

export const PORTAL_ORIGIN = `https://${PORTAL_HOST}`;
export const PUBLIC_ORIGIN = `https://${PUBLIC_HOST}`;

/** Läuft die App gerade unter der Portal-Subdomain? */
export function isPortalHost(hostname: string = typeof window !== "undefined" ? window.location.hostname : ""): boolean {
  return hostname.toLowerCase() === PORTAL_HOST;
}

/** Gehört ein Pfad zum B2B-Portal? */
export function isPortalPath(pathname: string): boolean {
  return pathname === "/b2b" || pathname.startsWith("/b2b/");
}

/**
 * Basis-URL für Auth-Redirects (Passwort-Reset, Einladungen, OAuth).
 * Nutzt immer den aktuellen Origin, damit Links nicht die Domain wechseln.
 */
export function authRedirectOrigin(): string {
  if (typeof window === "undefined") return PUBLIC_ORIGIN;
  return window.location.origin;
}

/**
 * Ziel-URL für Auth-Mails (Passwort-Reset, Bestätigung).
 * Auf der Portal-Subdomain bleibt der Nutzer dort, sonst www.
 * Wichtig: beide Origins müssen in der Redirect-Allow-List des Backends stehen.
 */
export function authRedirectUrl(path = "/"): string {
  if (typeof window !== "undefined" && window.location.hostname.toLowerCase() === PORTAL_HOST) {
    return `${PORTAL_ORIGIN}${path}`;
  }
  return `${PUBLIC_ORIGIN}${path}`;
}


/**
 * Absolute URL für einen Portal-Link. In Produktion zeigt sie auf die
 * Subdomain, lokal/Preview bleibt sie relativ zum aktuellen Origin.
 */
export function portalUrl(path = "/b2b/dashboard"): string {
  if (typeof window === "undefined") return `${PORTAL_ORIGIN}${path}`;
  const host = window.location.hostname.toLowerCase();
  if (host === PUBLIC_HOST || host === "slt-rental.de") return `${PORTAL_ORIGIN}${path}`;
  return path;
}
