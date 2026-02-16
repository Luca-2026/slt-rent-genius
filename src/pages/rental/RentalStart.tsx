import { Layout } from "@/components/layout";
import { LocationSelector } from "@/components/rental/LocationSelector";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export default function RentalStart() {
  const { t } = useTranslation();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 lg:py-24">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                {t("rental.rentNowBadge")}
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {t("rental.rentMadeEasy")}
              </h1>
              <p className="text-lg text-muted-foreground">
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
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t("rental.locationBasedPrices")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("rental.locationBasedPricesDesc")}
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t("rental.deliveryPossible")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("rental.deliveryPossibleDesc")}
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t("rental.weekendRates")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("rental.weekendRatesDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
