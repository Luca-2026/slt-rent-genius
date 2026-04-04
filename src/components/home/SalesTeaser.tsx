import { Link } from "react-router-dom";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, PackageSearch } from "lucide-react";
import { useTranslation } from "react-i18next";
import zoomlionLogo from "@/assets/logos/zoomlion.png";
import temaredLogo from "@/assets/logos/temared.webp";
import baumaxLogo from "@/assets/logos/baumax.png";

const brands = [
  { name: "Zoomlion", logo: zoomlionLogo, alt: "Zoomlion – Offizieller Händler NRW" },
  { name: "BAUMAX", logo: baumaxLogo, alt: "BAUMAX Baumaschinen – Fachhändler NRW" },
  { name: "Temared", logo: temaredLogo, alt: "Temared Anhänger – Autorisierter Händler NRW" },
];

export function SalesTeaser() {
  const { t } = useTranslation();

  return (
    <section className="py-14 lg:py-20 bg-muted/20">
      <div className="section-container">
        <AnimatedSection className="text-center mb-8">
          <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-primary/20">
            {t("salesTeaser.badge")}
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-3">
            {t("salesTeaser.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("salesTeaser.subtitle")}
          </p>
        </AnimatedSection>

        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-14 mb-10">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              to="/verkauf"
              className="grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={brand.logo}
                alt={brand.alt}
                className="h-9 lg:h-11 w-auto max-w-[160px] lg:max-w-[200px] object-contain"
              />
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Link to="/verkauf" className="group">
            <div className="border-2 border-border rounded-xl p-6 text-center hover:border-primary/40 hover:shadow-md transition-all h-full flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-headline text-lg mb-1">{t("salesTeaser.newMachines")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("salesTeaser.newMachinesDesc")}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:text-accent transition-colors mt-1">
                {t("salesTeaser.newMachinesCta")}
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          <Link to="/verkauf/gebrauchtmaschinen" className="group">
            <div className="border-2 border-border rounded-xl p-6 text-center hover:border-primary/40 hover:shadow-md transition-all h-full flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <PackageSearch className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-bold text-headline text-lg mb-1">{t("salesTeaser.usedMachines")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("salesTeaser.usedMachinesDesc")}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:text-accent transition-colors mt-1">
                {t("salesTeaser.usedMachinesCta")}
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>
        </div>

        <AnimatedSection className="text-center mt-8" delay={200}>
          <Link to="/kontakt">
            <Button variant="outline" size="lg" className="group">
              {t("salesTeaser.inquiryCta")}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
