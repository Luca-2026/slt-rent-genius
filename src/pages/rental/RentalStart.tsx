import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { LocationSelector } from "@/components/rental/LocationSelector";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export default function RentalStart() {
  const { t } = useTranslation();

  return (
    <Layout>
      <SEO
        title="Equipment mieten – Standort wählen | SLT Rental"
        description="Wählen Sie Ihren SLT Rental Standort: Krefeld, Bonn oder Mülheim. Über 1.700 Mietartikel – Baumaschinen, Anhänger, Event-Equipment und mehr."
        canonical="/mieten"
        keywords="Baumaschinen mieten NRW, Anhänger mieten, Equipment Vermietung"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-8 md:py-12 lg:py-24">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <div className="text-center max-w-3xl mx-auto mb-6 md:mb-8 lg:mb-12">
              <Badge className="mb-3 md:mb-4 bg-primary/10 text-primary border-primary/20 text-xs">
                {t("rental.rentNowBadge")}
              </Badge>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4 lg:mb-6">
                {t("rental.rentMadeEasy")}
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
                {t("rental.rentMadeEasyDesc")}
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-in-up" delay={100}>
            <LocationSelector />
          </AnimatedSection>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-8 md:py-10 lg:py-16 bg-muted/30">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8 text-center">
            <div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1.5 md:mb-2 text-sm md:text-base">{t("rental.locationBasedPrices")}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {t("rental.locationBasedPricesDesc")}
              </p>
            </div>
            <div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">🚚</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1.5 md:mb-2 text-sm md:text-base">{t("rental.deliveryPossible")}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {t("rental.deliveryPossibleDesc")}
              </p>
            </div>
            <div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1.5 md:mb-2 text-sm md:text-base">{t("rental.weekendRates")}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {t("rental.weekendRatesDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
