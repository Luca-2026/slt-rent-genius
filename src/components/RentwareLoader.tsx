import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSigningOverlaysSuppressed } from "@/lib/signingOverlays";
import { isTrailerRoute } from "@/lib/rentalBookingMode";

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
 * Hides the cart on B2B and sales routes.
 */
export function RentwareLoader() {
  const location = useLocation();
  const isB2B = location.pathname.startsWith("/b2b");
  const isSales = location.pathname.startsWith("/verkauf");
  const signing = useSigningOverlaysSuppressed(location.pathname);
  const shouldHideCart = isB2B || isSales || signing || !isTrailerRoute(location.pathname);
  // Homepage hat kein echtes rtr-Element im initialen Render. Wir sparen
  // dort 3s Hauptthread-Blockade, indem wir Rentware NUR bei expliziter
  // Interaktion (Click/Scroll/Touch/Tastatur) oder via rtr:load-Event laden.
  const isHomepage = location.pathname === "/";
  const loadedRef = useRef(false);

  // Lazy script injection
  useEffect(() => {
    if (shouldHideCart) {
      const el = document.querySelector("rtr-checkout") as HTMLElement | null;
      if (el) {
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
        el.setAttribute("aria-hidden", "true");
      }
      return;
    }

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
  }, [isHomepage, shouldHideCart]);

  // Position / hide the cart widget
  useEffect(() => {
    let observer: MutationObserver | null = null;

    const applyStyles = () => {
      const el = document.querySelector("rtr-checkout") as HTMLElement | null;
      if (!el) return;

      if (shouldHideCart) {
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
        el.setAttribute("aria-hidden", "true");
        if (el.shadowRoot) {
          let hideTag = el.shadowRoot.querySelector("#slt-hide-override") as HTMLStyleElement;
          if (!hideTag) {
            hideTag = document.createElement("style");
            hideTag.id = "slt-hide-override";
            el.shadowRoot.appendChild(hideTag);
          }
          hideTag.textContent = `:host, :host > * { display: none !important; visibility: hidden !important; }`;
        }
        return;
      }

      el.style.display = "";
      el.style.visibility = "";
      el.removeAttribute("aria-hidden");
      const slot = document.querySelector("[data-rentware-cart-slot]")?.getBoundingClientRect();
      const top = slot ? `${slot.top}px` : "40px";
      const right = slot ? `${document.documentElement.clientWidth - slot.right}px` : "16px";
      const size = slot ? `${slot.width}px` : "56px";
      document.documentElement.style.setProperty("--rentware-cart-view-position-top", top, "important");
      document.documentElement.style.setProperty("--rentware-cart-view-position-right", right, "important");
      el.style.setProperty("--slt-rentware-cart-size", size);
      el.style.position = "fixed";
      el.style.top = top;
      el.style.right = right;
      el.style.bottom = "unset";
      el.style.left = "unset";
      el.style.zIndex = "51";
      el.style.width = size;
      el.style.height = size;

      if (el.shadowRoot) {
        const hideTag = el.shadowRoot.querySelector("#slt-hide-override");
        if (hideTag) hideTag.remove();

        let styleTag = el.shadowRoot.querySelector("#slt-pos-override") as HTMLStyleElement;
        if (!styleTag) {
          styleTag = document.createElement("style");
          styleTag.id = "slt-pos-override";
          el.shadowRoot.appendChild(styleTag);
        }
        styleTag.textContent = `
          :host {
            position: fixed !important;
            top: var(--rentware-cart-view-position-top) !important;
            right: var(--rentware-cart-view-position-right) !important;
            bottom: unset !important;
            left: unset !important;
            z-index: 51 !important;
            width: var(--slt-rentware-cart-size, 56px) !important;
            height: var(--slt-rentware-cart-size, 56px) !important;
          }
          .cart-button, .rtr-cart-button, [class*="cart"], [class*="toggle"], button {
            position: relative !important;
            top: 0 !important;
            right: 0 !important;
            bottom: unset !important;
            width: var(--slt-rentware-cart-size, 56px) !important;
            height: var(--slt-rentware-cart-size, 56px) !important;
            min-width: var(--slt-rentware-cart-size, 56px) !important;
            min-height: var(--slt-rentware-cart-size, 56px) !important;
          }
        `;
      }

      // Rentware renders its visible control inside several nested shadow roots.
      // Styling the checkout host alone leaves that control at its default 60px.
      const alignControl = (root: Document | ShadowRoot) => {
        for (const child of root.querySelectorAll("*")) {
          if (!child.shadowRoot) continue;
          if (child.tagName === "RENTWARE-CART-CONTROL-BUTTON") {
            let controlStyle = child.shadowRoot.querySelector<HTMLStyleElement>("#slt-cart-control-position");
            if (!controlStyle) {
              controlStyle = document.createElement("style");
              controlStyle.id = "slt-cart-control-position";
              child.shadowRoot.appendChild(controlStyle);
            }
            controlStyle.textContent = `
              .CollapsedButton.GlobalButtonPosition {
                position: fixed !important;
                top: var(--rentware-cart-view-position-top) !important;
                right: var(--rentware-cart-view-position-right) !important;
                bottom: unset !important;
                left: unset !important;
                width: var(--slt-rentware-cart-size) !important;
                height: var(--slt-rentware-cart-size) !important;
                min-width: var(--slt-rentware-cart-size) !important;
                min-height: var(--slt-rentware-cart-size) !important;
                box-sizing: border-box !important;
                margin: 0 !important;
                transform: none !important;
              }
            `;
          } else {
            alignControl(child.shadowRoot);
          }
        }
      };
      if (el.shadowRoot) alignControl(el.shadowRoot);
    };

    applyStyles();

    // Watch ONLY for rtr-checkout being added/removed at the body level
    // (not the entire subtree). The previous subtree:true observer fired on
    // every DOM mutation and read layout properties → forced reflows
    // (~288 ms in Lighthouse profile). Once the cart node exists, we stop
    // observing entirely; styles persist on the element.
    let stopped = false;
    observer = new MutationObserver((mutations) => {
      if (stopped) return;
      for (const m of mutations) {
        for (const n of m.addedNodes) {
          if (
            (n as Element).nodeType === 1 &&
            ((n as Element).tagName === "RTR-CHECKOUT" ||
              (n as Element).querySelector?.("rtr-checkout"))
          ) {
            applyStyles();
            stopped = true;
            observer?.disconnect();
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: false });

    // Debounced resize handler – avoids layout thrash on continuous resize.
    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = 0;
        applyStyles();
      });
    };
    window.addEventListener("resize", onResize);

    // The external widget hydrates its nested controls after the host appears.
    // Keep retries bounded rather than observing every page mutation forever.
    let hydrationTries = 0;
    const hydrationTimer = window.setInterval(() => {
      applyStyles();
      if (++hydrationTries >= 40) window.clearInterval(hydrationTimer);
    }, 250);
    const slotObserver = new ResizeObserver(onResize);
    const slotElement = document.querySelector("[data-rentware-cart-slot]");
    if (slotElement) slotObserver.observe(slotElement);
    slotObserver.observe(document.documentElement);

    return () => {
      observer?.disconnect();
      slotObserver.disconnect();
      window.clearInterval(hydrationTimer);
      window.removeEventListener("resize", onResize);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
    };
  }, [shouldHideCart]);

  return null;
}
