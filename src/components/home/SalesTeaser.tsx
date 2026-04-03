import { Link } from "react-router-dom";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ArrowRight } from "lucide-react";
import zoomlionLogo from "@/assets/logos/zoomlion.png";
import temaredLogo from "@/assets/logos/temared.webp";
import baumaxLogo from "@/assets/logos/baumax.png";

const brands = [
  { name: "Zoomlion", logo: zoomlionLogo, alt: "Zoomlion – Offizieller Händler NRW" },
  { name: "BAUMAX", logo: baumaxLogo, alt: "BAUMAX Baumaschinen – Fachhändler NRW" },
  { name: "Temared", logo: temaredLogo, alt: "Temared Anhänger – Autorisierter Händler NRW" },
];

export function SalesTeaser() {
  return (
    <section className="py-10 lg:py-12 bg-muted/20">
      <div className="section-container">
        <AnimatedSection className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-1">
            Autorisierter Fachhändler & Servicestützpunkt
          </p>
          <h2 className="text-lg lg:text-xl font-semibold text-foreground">
            Baumaschinen & Anhänger auch zum Kauf verfügbar
          </h2>
        </AnimatedSection>

        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-14 mb-6">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              to="/verkauf"
              className="grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={brand.logo}
                alt={brand.alt}
                className="h-8 lg:h-10 w-auto max-w-[160px] lg:max-w-[200px] object-contain"
              />
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/verkauf"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Kaufangebote & Beratung
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
