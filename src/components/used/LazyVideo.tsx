import { useEffect, useRef, useState } from "react";

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

/**
 * Lazy-loaded, autoplay-on-visible video.
 * - Source is only attached once the element scrolls into view (IntersectionObserver)
 * - Auto-plays muted in loop when ≥ 50% visible (mobile-friendly)
 * - Pauses when scrolled out of view to save battery & bandwidth
 */
export function LazyVideo({ src, poster, className }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setShouldLoad(true);
            const v = videoRef.current;
            if (v && v.paused) {
              v.play().catch(() => {
                /* autoplay blocked – user can tap controls */
              });
            }
          } else {
            const v = videoRef.current;
            if (v && !v.paused) v.pause();
          }
        });
      },
      { threshold: [0, 0.5, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? src : undefined}
      poster={poster}
      loop
      muted
      playsInline
      controls
      preload="none"
      className={className}
    >
      Ihr Browser unterstützt das Video-Format nicht.
    </video>
  );
}
