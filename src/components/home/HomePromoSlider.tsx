import { useEffect, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 8000;

/**
 * Wechselt Aktions-Banner automatisch (Überblendung). Pausiert per Knopf,
 * bei Maus-Hover/Fokus und startet pausiert bei "reduzierter Bewegung".
 */
export function HomePromoSlider({ slides, labels }: { slides: ReactNode[]; labels: string[] }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (paused || hovered || slides.length < 2) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, hovered, slides.length]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={t("promoSlider.label")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      className="bg-background"
    >
      <div className="grid">
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${slides.length}: ${labels[i]}`}
            aria-hidden={i !== index}
            inert={i !== index ? true : undefined}
            className={cn(
              "[grid-area:1/1] transition-opacity duration-700 ease-in-out",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {slide}
          </div>
        ))}
      </div>

      <div className="section-container flex items-center justify-center gap-3 pt-3">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? t("promoSlider.play") : t("promoSlider.pause")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={labels[i]}
            aria-current={i === index}
            className="flex h-8 items-center px-1"
          >
            <span
              className={cn(
                "block h-2 rounded-full transition-all",
                i === index ? "w-8 bg-accent" : "w-2 bg-muted-foreground/40",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
