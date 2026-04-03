import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const RTR_ACCESS_TOKEN = "W74e1e543828256d3b730a73f09c72c2d";
const RTR_WIDGET_SRC = "https://cdn.rtr-io.com/widgets.js";

/**
 * RentwareLoader
 *
 * Dynamically injects the Rentware widget script + <rtr-checkout> element
 * AFTER React has mounted. This prevents the external script from blocking
 * the initial React render in embedded previews (e.g. Lovable chat iframe).
 *
 * Also positions the cart widget and hides it on B2B routes.
 */
export function RentwareLoader() {
  const location = useLocation();
  const isB2B = location.pathname.startsWith("/b2b");
  const injectedRef = useRef(false);

  // 1) Inject Rentware script + element once after mount
  useEffect(() => {
    if (injectedRef.current) return;
    injectedRef.current = true;

    // Set global access token
    (window as any).RTR_ACCESS_TOKEN = RTR_ACCESS_TOKEN;

    // Create <rtr-checkout> element
    if (!document.querySelector("rtr-checkout")) {
      const el = document.createElement("rtr-checkout");
      document.body.appendChild(el);
    }

    // Load script
    if (!document.querySelector(`script[src="${RTR_WIDGET_SRC}"]`)) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = RTR_WIDGET_SRC;
      document.body.appendChild(script);
    }
  }, []);

  // 2) Position / hide the cart widget
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

      // Shadow DOM style injection
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
