import { useEffect } from "react";

/**
 * RentwarePositioner
 *
 * The rtr-checkout Web Component uses Shadow DOM for its internal button.
 * We use CSS custom properties (which DO penetrate Shadow DOM) plus
 * inline styles on the host element, plus direct Shadow DOM style injection.
 */
export function RentwarePositioner() {
  useEffect(() => {
    let observer: MutationObserver | null = null;

    const applyStyles = () => {
      const el = document.querySelector("rtr-checkout") as HTMLElement | null;
      if (!el) return;

      // 1. Inline styles on host element
      el.style.position = "fixed";
      el.style.top = "56px"; // below marquee, centered with header buttons
      el.style.right = "16px";
      el.style.bottom = "unset";
      el.style.left = "unset";
      el.style.zIndex = "51";

      // 2. Try to reach into Shadow DOM and style the internal button
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
            top: 56px !important;
            right: 16px !important;
            bottom: unset !important;
            left: unset !important;
            z-index: 51 !important;
          }
          /* Target common internal button wrappers */
          .cart-button, .rtr-cart-button, [class*="cart"], [class*="toggle"], button {
            position: relative !important;
            top: 0 !important;
            right: 0 !important;
            bottom: unset !important;
          }
        `;
      }
    };

    // Apply once DOM is ready
    applyStyles();

    // Watch for the widget being added to DOM (it loads async)
    observer = new MutationObserver(() => applyStyles());
    observer.observe(document.body, { childList: true, subtree: true });

    // Re-apply on resize
    window.addEventListener("resize", applyStyles);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", applyStyles);
    };
  }, []);

  return null;
}
