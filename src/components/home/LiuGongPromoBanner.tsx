import { Link } from "react-router-dom";
import { ArrowRight, Tag, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import liugongLogo from "@/assets/logos/liugong-sm.webp";

/**
 * Startseiten-Banner: SLT Rental ist LiuGong-Händler (Erdbewegung).
 * Zwei Wege: Kaufanfrage mit vorausgewählter Marke oder im Mietpark testen.
 */
export function LiuGongPromoBanner({ onTestInFleet }: { onTestInFleet: () => void }) {
  const { t } = useTranslation();
  return (
    <section className="relative z-10 pt-4 pb-2 bg-background" aria-label={t("liugongPromo.title")}>
      <div className="section-container">
        <div className="overflow-hidden rounded-md border border-border bg-card shadow-lg md:flex md:flex-row-reverse">
          <div className="relative h-44 overflow-hidden bg-muted sm:h-52 md:h-auto md:w-[38%] md:shrink-0">
            <img
              src="/product-images/erdbewegung/minibagger-2-7t-1.webp"
              alt={t("liugongPromo.imageAlt")}
              loading="lazy"
              className="h-full w-full object-cover object-center"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center rounded-sm bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                {t("liugongPromo.badge")}
              </span>
              <img src={liugongLogo} alt={t("liugongPromo.logoAlt")} className="h-7 w-auto sm:h-9" />
            </div>
            <div>
              <h2 className="text-2xl font-bold leading-tight text-headline sm:text-3xl">
                {t("liugongPromo.title")}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t("liugongPromo.text")}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="bg-accent font-bold text-accent-foreground hover:bg-accent/90">
                <Link to="/verkauf/neumaschinen/?anfrage=LiuGong#kaufanfrage">
                  <Tag className="mr-2 h-4 w-4" />
                  {t("liugongPromo.ctaInquiry")}
                </Link>
              </Button>
              <Button size="lg" variant="outline" onClick={onTestInFleet} className="font-semibold">
                <Wrench className="mr-2 h-4 w-4" />
                {t("liugongPromo.ctaRent")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
