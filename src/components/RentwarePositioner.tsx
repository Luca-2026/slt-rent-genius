import { useEffect } from "react";

/**
 * RentwarePositioner
 *
 * Positions the rtr-checkout Web Component in the top-right corner
 * of the viewport, aligned with the header area.
 * Uses inline styles on the host element to override Shadow DOM defaults.
 */
export function RentwarePositioner() {
  useEffect(() => {
    let observer: MutationObserver | null = null;

    const applyStyles = () => {
      const el = document.querySelector("rtr-checkout") as HTMLElement | null;
      if (!el) return;

      // Position in top-right, vertically centered with header
      el.style.position = "fixed";
      el.style.top = "62px"; // below marquee bar, not covering scroller
      el.style.right = "16px";
      el.style.bottom = "unset";
      el.style.left = "unset";
      el.style.zIndex = "51"; // above header z-50
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
