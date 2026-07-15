/**
 * Lightweight coordination for floating overlays (promo dialog, chat teaser,
 * Rentware cart) so they don't stack on top of each other on mobile.
 *
 * - Cookie decision gate: no promotional overlay before the user has decided.
 * - Booking-route gate: suppress promotional overlays on flows where the user
 *   is trying to book/checkout.
 * - Global "an overlay is open" flag on <html data-slt-overlay="1"> that the
 *   Rentware cart can react to via CSS.
 */

const COOKIE_KEY = "slt_cookie_consent";

/** True once the user has accepted / rejected / configured cookies. */
export function hasCookieDecision(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem(COOKIE_KEY);
  } catch {
    return false;
  }
}

/** Routes where we must NOT interrupt the user with promo/chat popups. */
export function isBookingRoute(pathname: string): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/mieten") ||
    pathname.startsWith("/mietartikel") ||
    pathname.startsWith("/produkte") ||
    pathname.startsWith("/warenkorb") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/b2b") ||
    pathname.startsWith("/verkauf") ||
    pathname.startsWith("/hochzeit")
  );
}

let openCount = 0;

function syncAttr() {
  if (typeof document === "undefined") return;
  if (openCount > 0) {
    document.documentElement.setAttribute("data-slt-overlay", "1");
  } else {
    document.documentElement.removeAttribute("data-slt-overlay");
  }
}

export function notifyOverlayOpen() {
  openCount++;
  syncAttr();
}

export function notifyOverlayClosed() {
  openCount = Math.max(0, openCount - 1);
  syncAttr();
}

export function isAnyOverlayOpen(): boolean {
  return openCount > 0;
}

/** Wait for cookie decision (polls up to `timeoutMs`). Resolves true if decided. */
export function waitForCookieDecision(timeoutMs = 15000): Promise<boolean> {
  return new Promise((resolve) => {
    if (hasCookieDecision()) return resolve(true);
    const start = Date.now();
    const int = window.setInterval(() => {
      if (hasCookieDecision()) {
        window.clearInterval(int);
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        window.clearInterval(int);
        resolve(false);
      }
    }, 300);
  });
}
