import { Layout } from "@/components/layout/Layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/ui/animated-section";
import {
  Clock, Laptop, Coffee, GraduationCap, PartyPopper,
  Shirt, Award, MessageSquare, PiggyBank, Flame, Zap, Users
} from "lucide-react";
import { JobCard } from "@/components/karriere/JobCard";
import { jobListings } from "@/components/karriere/jobData";
import { useTranslation } from "react-i18next";

const BASE_URL = "https://www.slt-rental.de";

export default function Karriere() {
  const { t } = useTranslation();

  // ItemList JSON-LD so Google understands the list of open positions
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: jobListings.map((j, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/karriere/${j.slug}`,
      name: j.title,
    })),
  };

  const breadcrumb = SLT_BREADCRUMB_JSONLD([
    { name: "Home", url: "/" },
    { name: "Karriere", url: "/karriere" },
  ]);

  const benefits = [
    { icon: Clock, label: t("karriere.benefitFlexTime") },
    { icon: PiggyBank, label: t("karriere.benefitPension") },
    { icon: Laptop, label: t("karriere.benefitLaptop") },
    { icon: Coffee, label: t("karriere.benefitKitchen") },
    { icon: Flame, label: t("karriere.benefitGrill") },
    { icon: GraduationCap, label: t("karriere.benefitTraining") },
    { icon: PartyPopper, label: t("karriere.benefitXmas") },
    { icon: Shirt, label: t("karriere.benefitClothes") },
    { icon: Award, label: t("karriere.benefitBonus") },
    { icon: MessageSquare, label: t("karriere.benefitFeedback") },
  ];

  return (
    <Layout>
      <SEO
        title="Karriere bei SLT Rental – Jobs in Krefeld, Bonn & Mülheim"
        description="Aktuelle Stellenangebote bei SLT Rental in NRW: Lieferfahrer, Servicetechniker, Vertrieb, Disposition und Ausbildung. In 30 Sekunden bewerben – Antwort in 5 Werktagen."
        canonical="/karriere"
        keywords="Jobs SLT Rental, Karriere Baumaschinen, Stellenangebote NRW, Krefeld Jobs, Bonn Jobs, Ausbildung Büromanagement"
        jsonLd={[itemListJsonLd, breadcrumb]}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 lg:py-24">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">{t("karriere.badge")}</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">{t("karriere.heroTitle")}</h1>
              <p className="text-lg text-muted-foreground mb-6">{t("karriere.heroDesc")}</p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 bg-background/80 border border-border rounded-full px-3 py-1.5">
                  <Zap className="h-4 w-4 text-accent" /> In 30 Sek. bewerben
                </span>
                <span className="inline-flex items-center gap-1.5 bg-background/80 border border-border rounded-full px-3 py-1.5">
                  <Clock className="h-4 w-4 text-primary" /> Antwort in 5 Werktagen
                </span>
                <span className="inline-flex items-center gap-1.5 bg-background/80 border border-border rounded-full px-3 py-1.5">
                  <Users className="h-4 w-4 text-primary" /> Familiäres Team in NRW
                </span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-16 bg-background">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-3xl font-bold text-foreground mb-2 text-center">{t("karriere.jobsTitle")}</h2>
            <p className="text-center text-muted-foreground mb-8">
              {jobListings.length} offene Stellen – wähle deine Position und bewirb dich direkt.
            </p>
          </AnimatedSection>
          <div className="grid gap-6 max-w-4xl mx-auto">
            {jobListings.map((job, index) => (
              <AnimatedSection key={job.id} animation="fade-in-up" delay={index * 100}>
                <JobCard job={job} index={index} />
              </AnimatedSection>
            ))}
          </div>
          <div className="max-w-4xl mx-auto mt-8 p-6 rounded-lg bg-muted/40 border border-border text-center">
            <h3 className="font-semibold text-foreground mb-2">Keine passende Stelle dabei?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Wir wachsen kontinuierlich. Schick uns deine Initiativbewerbung – wir melden uns,
              sobald eine passende Position frei wird.
            </p>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
              <a href="mailto:karriere@slt-rental.de?subject=Initiativbewerbung">
                Initiativbewerbung senden
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-center">{t("karriere.benefitsTitle")}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">{t("karriere.benefitsDesc")}</p>
          </AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={benefit.label} animation="fade-in-up" delay={index * 50}>
                <Card className="text-center p-6 hover:shadow-md transition-shadow border-border hover:border-primary/30 h-full flex flex-col items-center justify-center">
                  <CardContent className="p-0 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 min-w-[3.5rem] min-h-[3.5rem] bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 shrink-0">
                      <benefit.icon className="h-7 w-7 text-primary shrink-0" strokeWidth={1.5} />
                    </div>
                    <p className="font-medium text-foreground text-sm leading-tight">{benefit.label}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="section-container text-center">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-3xl font-bold mb-4 text-primary-foreground">{t("karriere.ctaTitle")}</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">{t("karriere.ctaDesc")}</p>
            <a href="mailto:karriere@slt-rental.de">
              <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">{t("karriere.ctaCta")}</Button>
            </a>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}