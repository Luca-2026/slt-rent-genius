import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isPortalHost, isPortalPath, PUBLIC_HOST, PORTAL_ORIGIN, PUBLIC_ORIGIN } from "@/lib/portalDomain";

/**
 * Hostname-Weiche für app.slt-rental.de:
 *  - "/" → /b2b/login (bzw. Portal-Einstieg)
 *  - alle öffentlichen Marketing-Routen → www.slt-rental.de (Client-Fallback,
 *    primär erledigt das bereits die .htaccess auf dem Server)
 *  - noindex/nofollow für die gesamte Subdomain
 */
export function PortalHostRouting() {
  const location = useLocation();

  useEffect(() => {
    if (!isPortalHost()) return;

    let meta = document.querySelector('meta[name="robots"][data-portal-host]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex, nofollow";
      meta.setAttribute("data-portal-host", "true");
      document.head.appendChild(meta);
    }
  }, []);

  // Öffentliche Domain: Portal-Routen gehören auf die Subdomain (Server-301
  // greift nur bei echten Requests, nicht bei SPA-Navigation).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname.toLowerCase();
    if (host !== PUBLIC_HOST && host !== "slt-rental.de") return;
    const { pathname, search, hash } = location;
    if (isPortalPath(pathname)) {
      window.location.replace(`${PORTAL_ORIGIN}${pathname}${search}${hash}`);
    }
  }, [location]);

  useEffect(() => {
    if (!isPortalHost()) return;
    const { pathname, search, hash } = location;

    if (pathname === "/" || pathname === "") {
      window.location.replace("/b2b/login/");
      return;
    }

    if (!isPortalPath(pathname)) {
      window.location.replace(`${PUBLIC_ORIGIN}${pathname}${search}${hash}`);
    }
  }, [location]);

  return null;
}
