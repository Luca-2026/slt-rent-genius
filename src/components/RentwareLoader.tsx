import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const RTR_ACCESS_TOKEN = "W74e1e543828256d3b730a73f09c72c2d";
const RTR_WIDGET_SRC = "https://cdn.rtr-io.com/widgets.js";
const IDLE_FALLBACK_MS = 3000;

/**
 * RentwareLoader
 *
 * Lazily injects the Rentware widget script + <rtr-checkout> element to keep
 * it off the critical path. The widget bundle (~1 MB across multiple chunks)
 * was previously blocking LCP for ~17s on mobile.
 *
 * Loading triggers (whichever comes first):
 *   1) First user interaction hint (pointerdown / touchstart / keydown / scroll)
 *   2) requestIdleCallback (fallback: setTimeout 3s)
 *   3) A custom "rtr:load" event – fired by components that need the cart now
 *      (e.g. <LazyRentwareWidget> on focus, Booking dialog on open).
 *
 * Hides the cart on B2B routes.
 */
export function RentwareLoader() {
  const location = useLocation();
  const isB2B = location.pathname.startsWith("/b2b");
  // Homepage hat kein echtes rtr-Element im initialen Render. Wir sparen
  // dort 3s Hauptthread-Blockade, indem wir Rentware NUR bei expliziter
  // Interaktion (Click/Scroll/Touch/Tastatur) oder via rtr:load-Event laden.
  const isHomepage = location.pathname === "/";
  const loadedRef = useRef(false);

  // Lazy script injection
  useEffect(() => {
    (window as any).RTR_ACCESS_TOKEN = RTR_ACCESS_TOKEN;

    const inject = () => {
      if (loadedRef.current) return;
      loadedRef.current = true;

      if (!document.querySelector("rtr-checkout")) {
        const el = document.createElement("rtr-checkout");
        document.body.appendChild(el);
      }

      if (!document.querySelector(`script[src="${RTR_WIDGET_SRC}"]`)) {
        const script = document.createElement("script");
        script.type = "module";
        script.src = RTR_WIDGET_SRC;
        script.onerror = (e) => {
          console.warn("[RentwareLoader] Failed to load widget script.", e);
        };
        document.body.appendChild(script);
      }
    };

    const events: (keyof DocumentEventMap)[] = [
      "pointerdown",
      "touchstart",
      "keydown",
      "scroll",
    ];
    const onInteract = () => {
      cleanup();
      inject();
    };
    const onCustom = () => {
      cleanup();
      inject();
    };
    const cleanup = () => {
      events.forEach((ev) =>
        document.removeEventListener(ev, onInteract, { capture: true } as any),
      );
      window.removeEventListener("rtr:load", onCustom);
    };

    events.forEach((ev) =>
      document.addEventListener(ev, onInteract, {
        once: true,
        passive: true,
        capture: true,
      } as AddEventListenerOptions),
    );
    window.addEventListener("rtr:load", onCustom, { once: true });

    // Auf Nicht-Homepage-Routen: prüfen, ob die Seite ein echtes Rentware-
    // Element rendert (Kategorie, Produkt, Buchung). Wenn ja, sofort laden,
    // damit Verfügbarkeit ohne User-Interaktion erscheint. Auf der Homepage
    // wird dieses Polling übersprungen — dort gibt es kein rtr-Element und
    // Rentware soll erst nach Interaktion laden, um TBT zu schonen.
    let pollHandle: number | undefined;
    if (!isHomepage) {
      const checkForRtrEl = () => {
        if (loadedRef.current) return true;
        const found = !!document.querySelector(
          "rtr-search, rtr-article-booking, rtr-availability, rtr-product",
        );
        if (found) {
          cleanup();
          inject();
          return true;
        }
        return false;
      };
      if (!checkForRtrEl()) {
        let tries = 0;
        pollHandle = window.setInterval(() => {
          if (checkForRtrEl() || ++tries > 10) window.clearInterval(pollHandle);
        }, 200);
      }
    }

    // Idle fallback nur auf Nicht-Homepage-Routen, damit Cart auch ohne
    // Interaktion bereitsteht. Auf der Homepage warten wir bewusst auf
    // Interaktion oder rtr:load.
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;
    if (!isHomepage) {
      if (ric) {
        idleHandle = ric(() => {
          cleanup();
          inject();
        }, { timeout: IDLE_FALLBACK_MS });
      } else {
        timeoutHandle = window.setTimeout(() => {
          cleanup();
          inject();
        }, IDLE_FALLBACK_MS);
      }
    }

    return () => {
      cleanup();
      if (pollHandle) window.clearInterval(pollHandle);
      if (idleHandle && (window as any).cancelIdleCallback) {
        (window as any).cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle) window.clearTimeout(timeoutHandle);
    };
  }, [isHomepage]);

  // Position / hide the cart widget
  useEffect(() => {
    let observer: MutationObserver | null = null;

    const applyStyles = () => {
      const el = document.querySelector("rtr-checkout") as HTMLElement | null;
      if (!el) return;

      if (isB2B) {
        el.style.display = "none";
        return;
      }

      el.style.display = "";
      el.style.position = "fixed";
      el.style.top = "40px";
      el.style.right = "16px";
      el.style.bottom = "unset";
      el.style.left = "unset";
      el.style.zIndex = "51";
      el.style.width = "56px";
      el.style.height = "56px";

      if (el.shadowRoot) {
        let styleTag = el.shadowRoot.querySelector("#slt-pos-override") as HTMLStyleElement;
        if (!styleTag) {
          styleTag = document.createElement("style");
          styleTag.id = "slt-pos-override";
          el.shadowRoot.appendChild(styleTag);
        }
        styleTag.textContent = `
          :host {
            position: fixed !important;
            top: 40px !important;
            right: 16px !important;
            bottom: unset !important;
            left: unset !important;
            z-index: 51 !important;
            width: 56px !important;
            height: 56px !important;
          }
          .cart-button, .rtr-cart-button, [class*="cart"], [class*="toggle"], button {
            position: relative !important;
            top: 0 !important;
            right: 0 !important;
            bottom: unset !important;
            width: 56px !important;
            height: 56px !important;
            min-width: 56px !important;
            min-height: 56px !important;
          }
        `;
      }
    };

    applyStyles();

    observer = new MutationObserver(() => applyStyles());
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", applyStyles);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", applyStyles);
    };
  }, [isB2B]);

  return null;
}
