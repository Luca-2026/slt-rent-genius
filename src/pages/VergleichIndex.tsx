import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ArrowRight, Scale } from "lucide-react";

const VERGLEICHE = [
  {
    slug: "slt-vs-hkl",
    competitorShort: "HKL",
    competitor: "HKL Baumaschinen",
    teaser:
      "Regionaler Mietpark in NRW mit drei Standorten vs. bundesweiter Vermieter mit Schwerpunkt Baumaschinen.",
  },
  {
    slug: "slt-vs-boels",
    competitorShort: "Boels",
    competitor: "Boels Rental",
    teaser:
      "Lokal verwurzelt in Krefeld, Bonn und Mülheim vs. international aufgestellter Vermieter mit dichtem Filialnetz.",
  },
  {
    slug: "slt-vs-beyer",
    competitorShort: "Beyer",
    competitor: "Beyer-Mietservice",
    teaser:
      "Breites Sortiment inkl. Event-Equipment vs. Spezialist für Bau- und Industriegeräte.",
  },
];

export default function VergleichIndex() {
  return (
    <Layout>
      <SEO
        title="Anbietervergleich: SLT Rental im Vergleich zu HKL, Boels und Beyer"
        description="Sachlicher Vergleich von SLT Rental mit HKL, Boels Rental und Beyer-Mietservice. Standorte, Online-Buchung, Tiefpreisgarantie, Lieferung und Sortiment im Überblick."
        canonical="/vergleich"
        keywords="SLT Rental Vergleich, Baumaschinen mieten NRW, HKL Alternative, Boels Alternative, Beyer Alternative"
        jsonLd={SLT_BREADCRUMB_JSONLD([
          { name: "Start", url: "/" },
          { name: "Anbietervergleich", url: "/vergleich" },
        ])}
      />

      {/* Hero */}
      <section className="bg-primary py-8 md:py-10 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <p className="text-primary-foreground/70 text-xs md:text-sm uppercase tracking-wide mb-2">
              Anbietervergleich
            </p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 md:mb-4">
              SLT Rental im Vergleich zu anderen Vermietern in NRW
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl text-sm md:text-base">
              Sachlicher Anbietervergleich nach objektiven, nachprüfbaren Kriterien: Standorte, Online-Buchung, Tiefpreisgarantie, Lieferung und Sortiment. Keine Wertung über Mitbewerber, nur Fakten.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Intro */}
      <section className="py-8 md:py-12 bg-background">
        <div className="section-container max-w-4xl">
          <AnimatedSection animation="fade-in-up">
            <p className="text-sm md:text-base text-body leading-relaxed mb-4">
              In Nordrhein-Westfalen gibt es mehrere Vermieter für Baumaschinen, Anhänger und Eventtechnik. Welcher zu Ihrem Projekt passt, hängt von Standortnähe, Sortiment, Buchbarkeit und Preis ab.
            </p>
            <p className="text-sm md:text-base text-body leading-relaxed">
              Diese Übersichtsseite verweist auf detaillierte Vergleiche von SLT Rental mit drei bekannten Anbietern. Die Gegenüberstellungen sind sachlich gehalten und stützen sich auf allgemein verfügbare Informationen.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Cards */}
      <section className="py-8 md:py-12 bg-surface-light/30 border-y border-border">
        <div className="section-container max-w-5xl">
          <div className="grid gap-4 md:gap-6 md:grid-cols-3">
            {VERGLEICHE.map((v) => (
              <AnimatedSection key={v.slug} animation="fade-in-up">
                <Card className="h-full flex flex-col">
                  <CardContent className="p-5 md:p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 text-accent mb-3">
                      <Scale className="h-5 w-5" />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Vergleich
                      </span>
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-headline mb-2">
                      SLT Rental vs. {v.competitorShort}
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground mb-4">
                      Gegenüberstellung mit {v.competitor}.
                    </p>
                    <p className="text-sm text-body leading-relaxed mb-5 flex-grow">
                      {v.teaser}
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/vergleich/${v.slug}`}>
                        Zum Vergleich
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Hinweis: Aussagen über Wettbewerber stützen sich ausschließlich auf allgemein verfügbare Informationen. SLT-Werte stammen aus der eigenen Website.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 md:py-14 bg-primary">
        <div className="section-container max-w-4xl text-center">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground mb-4">
              Lieber direkt zum Mietkatalog?
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto text-sm md:text-base">
              Drei Standorte in NRW, breites Sortiment, 24/7-Online-Buchung für Anhänger und persönliche Ansprechpartner vor Ort.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/mieten">Mietkatalog ansehen</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link to="/tiefpreisgarantie">Zur Tiefpreisgarantie</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
