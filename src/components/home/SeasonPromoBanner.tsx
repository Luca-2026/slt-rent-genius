import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, HardHat, Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  isBookingRoute,
  isAnyOverlayOpen,
  notifyOverlayOpen,
  notifyOverlayClosed,
  waitForCookieDecision,
} from "@/lib/overlayManager";

const PROMO_CODE = "BAUMASCHINE10";
const POPUP_STORAGE_KEY = "slt_season_promo_popup_seen_v1";
const POPUP_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 Tage
const POPUP_DELAY_MS = 4500;
const MACHINE_LINK = "/mietartikel?promo=erdbewegung";

function CodeChip({ code, onDark = false }: { code: string; onDark?: boolean }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(t("seasonPromo.toastCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("seasonPromo.toastError"));
    }
  };
  return (
    <Button
      variant={onDark ? "outline" : "secondary"}
      type="button"
      onClick={copy}
      className={onDark
        ? "inline-flex h-auto min-h-12 items-center gap-2 border-dashed border-promo-border bg-promo-code px-4 py-2 font-mono text-sm sm:text-base font-bold text-accent hover:bg-promo-border hover:text-accent break-all"
        : "inline-flex items-center gap-2 font-mono text-lg font-bold text-primary"}
      aria-label={t("seasonPromo.ariaCopyCode", { code })}
    >
      <span>{code}</span>
      {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 opacity-70" />}
    </Button>
  );
}

export function SeasonPromoBanner({ onExplore }: { onExplore: () => void }) {
  const { t } = useTranslation();
  return (
    <section className="relative z-10 pt-6 pb-2 lg:pt-8 lg:pb-2 bg-background" aria-label={t("seasonPromo.headline")}>
      <div className="section-container">
        <div className="overflow-hidden rounded-md border border-promo-border bg-promo text-promo-foreground shadow-lg md:flex">
          <div className="flex flex-col bg-accent text-promo-accent-foreground md:w-[34%] md:shrink-0">
            <div className="relative h-40 overflow-hidden bg-background sm:h-48 md:h-full md:min-h-[290px]">
              <img
                src="/product-images/erdbewegung/minibagger-6t-2.webp"
                alt={t("seasonPromo.imageAlt")}
                loading="lazy"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute bottom-0 left-0 bg-accent px-5 py-2 text-xs font-bold uppercase sm:px-7">
                {t("seasonPromo.badge")}
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
            <div>
              <div className="mb-2 flex items-baseline gap-3 text-accent">
                <span className="text-5xl font-black leading-none sm:text-6xl">10 %</span>
                <span className="text-sm font-bold uppercase">{t("seasonPromo.discount")}</span>
              </div>
              <h2 className="text-2xl font-bold leading-tight text-promo-foreground sm:text-3xl">
                {t("seasonPromo.bannerTitle")}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-promo-muted sm:text-base">
                {t("seasonPromo.details")}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-4 sm:gap-6">
              <div className="flex flex-col items-start gap-1">
                <span className="text-xs font-semibold uppercase text-promo-muted">{t("seasonPromo.yourCode")}</span>
                <CodeChip code={PROMO_CODE} onDark />
              </div>
              <Button size="lg" onClick={onExplore} className="bg-accent font-bold text-promo-accent-foreground hover:bg-cta-orange-hover hover:text-promo-accent-foreground">
                  {t("seasonPromo.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SeasonPromoDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isBookingRoute(location.pathname)) return;

    try {
      const raw = localStorage.getItem(POPUP_STORAGE_KEY);
      if (raw) {
        const ts = parseInt(raw, 10);
        if (!Number.isNaN(ts) && Date.now() - ts < POPUP_TTL_MS) return;
      }
    } catch {}

    let cancelled = false;
    let timer: number | undefined;

    const schedule = () => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        if (isAnyOverlayOpen() || document.querySelector('[role="dialog"][data-state="open"]')) {
          timer = window.setTimeout(schedule, 2000);
          return;
        }
        setOpen(true);
        notifyOverlayOpen();
      }, POPUP_DELAY_MS);
    };

    waitForCookieDecision().then((decided) => {
      if (cancelled || !decided) return;
      schedule();
    });

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [location.pathname]);

  const close = () => {
    setOpen(false);
    notifyOverlayClosed();
    try {
      localStorage.setItem(POPUP_STORAGE_KEY, String(Date.now()));
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
      <DialogContent
        className="w-[calc(100vw-2rem)] max-w-lg p-0 overflow-hidden border-0 bg-transparent shadow-2xl"
      >
        <div className="relative bg-primary text-primary-foreground p-5 sm:p-6 md:p-8 rounded-md">
          <div className="inline-flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-3 max-w-[calc(100%-3rem)]">
            <HardHat className="h-4 w-4 shrink-0" />
            <span>{t("seasonPromo.badge")}</span>
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-3 pr-2">
            {t("seasonPromo.headline")}
          </h3>
          <p className="text-sm sm:text-base text-primary-foreground/90 mb-5">
            {t("seasonPromo.details")}
          </p>

          <div className="flex flex-col gap-3 bg-primary-foreground/10 rounded-md p-4 mb-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
              {t("seasonPromo.yourCode")}
            </div>
            <CodeChip code={PROMO_CODE} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="font-bold w-full sm:flex-1"
              onClick={close}
            >
              <Link to={MACHINE_LINK}>
                <ArrowRight className="mr-2 h-4 w-4" />
                {t("seasonPromo.ctaDialog")}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={close}
              className="w-full sm:flex-1 border-primary-foreground/70 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              {t("seasonPromo.later")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
