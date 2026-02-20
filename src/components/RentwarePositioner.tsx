import { useEffect } from "react";

/**
 * RentwarePositioner
 *
 * The rtr-checkout Web Component positions its internal button via an
 * internal Shadow DOM that ignores all external CSS overrides.
 * The only reliable way to move it is to set inline styles on the
 * host element itself, which the Shadow DOM inherits for positioning.
 *
 * Strategy:
 * - Mobile  (< 769px): bottom-right at 24px – same side as the widget's
 *   natural default. The SLT chat button moves to bottom-LEFT on mobile.
 * - Desktop (≥ 769px): bottom-right at 96px – lifted above the chat button.
 */
export function RentwarePositioner() {
  useEffect(() => {
    let observer: MutationObserver | null = null;

    const applyStyles = () => {
      const el = document.querySelector("rtr-checkout") as HTMLElement | null;
      if (!el) return;

      const isMobile = window.innerWidth < 769;

      el.style.position = "fixed";
      el.style.bottom = isMobile ? "24px" : "96px";
      el.style.right = "24px";
      el.style.left = "unset";
      el.style.top = "unset";
      el.style.zIndex = "45";
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
