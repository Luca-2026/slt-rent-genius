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
const MACHINE_LINK = "/mietartikel#baumaschinen";

function CodeChip({ code }: { code: string }) {
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
      variant="secondary"
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 font-mono text-lg font-bold text-primary"
      aria-label={t("seasonPromo.ariaCopyCode", { code })}
    >
      <span>{code}</span>
      {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 opacity-70" />}
    </Button>
  );
}

export function SeasonPromoBanner() {
  const { t } = useTranslation();
  return (
    <section className="relative z-10 py-6 lg:py-8 bg-background">
      <div className="section-container">
        <div className="relative overflow-hidden rounded-md border-l-4 border-accent bg-primary text-primary-foreground shadow-lg">
          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:p-8 lg:p-10">
            <div>
              <div className="inline-flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-3">
                <HardHat className="h-4 w-4" />
                {t("seasonPromo.badge")}
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-2 text-primary-foreground">
                {t("seasonPromo.headline")}
              </h2>
              <p className="text-primary-foreground/90 md:text-lg max-w-2xl">
                {t("seasonPromo.details")}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-primary-foreground/90">{t("seasonPromo.codeLabel")}</span>
                <CodeChip code={PROMO_CODE} />
              </div>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="font-bold"
              >
                <Link to={MACHINE_LINK}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  {t("seasonPromo.cta")}
                </Link>
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
