import { useEffect } from "react";

/**
 * RentwarePositioner
 *
 * Positions the rtr-checkout Web Component in the header area.
 * Marquee bar: 0-40px, Header row: 40-120px, center = 80px.
 * Target: vertically centered in header, same size as chat button (56px).
 */
export function RentwarePositioner() {
  useEffect(() => {
    let observer: MutationObserver | null = null;

    const applyStyles = () => {
      const el = document.querySelector("rtr-checkout") as HTMLElement | null;
      if (!el) return;

      // Position: centered in header row (40-120px, center=80px)
      // With 56px height: top = 80 - 28 = 52px
      el.style.position = "fixed";
      el.style.top = "52px";
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
            top: 52px !important;
            right: 16px !important;
            bottom: unset !important;
            left: unset !important;
            z-index: 51 !important;
            width: 56px !important;
            height: 56px !important;
          }
          /* Scale internal button to match 56px */
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
  }, []);

  return null;
}
