import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ShieldCheck, BadgePercent, MapPin, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Tiefpreisgarantie – SLT Rental",
  description:
    "Günstigeren Preis gefunden? SLT Rental bietet 10 % Rabatt auf den Nettomietpreis, wenn ein identisches Produkt im Umkreis von 10 km günstiger angeboten wird.",
  url: "https://www.slt-rental.de/tiefpreisgarantie",
  publisher: {
    "@type": "Organization",
    name: "SLT Technology Group GmbH & Co. KG",
    url: "https://www.slt-rental.de",
  },
};

export default function Tiefpreisgarantie() {
  return (
    <Layout>
      <SEO
        title="Tiefpreisgarantie – 10 % Rabatt bei günstigerem Angebot | SLT Rental"
        description="Günstigeren Preis gefunden? SLT Rental garantiert 10 % Rabatt auf den Nettomietpreis ✓ Identisches Produkt im Umkreis 10 km ✓ Für Gewerbekunden ✓ Einfach per E-Mail einreichen"
        canonical="/tiefpreisgarantie"
        keywords="Tiefpreisgarantie Baumaschinen mieten, günstig mieten NRW, Mietpreis Garantie, Bestpreisgarantie Equipment"
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background pt-20 pb-12">
        <div className="section-container">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                Bestpreis-Versprechen
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                SLT Rental Tiefpreisgarantie
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Sie haben ein identisches Mietprodukt bei einem anderen gewerblichen Anbieter
                günstiger gefunden? Wir unterbieten den Preis –{" "}
                <span className="font-semibold text-primary">garantiert 10 % unter dem Nettomietpreis</span>.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <div className="section-container">
          <AnimatedSection>
            <h2 className="text-2xl font-bold text-center mb-8">So funktioniert's</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                icon: MapPin,
                title: "Günstigeres Angebot finden",
                text: "Finden Sie ein identisches Mietprodukt bei einem gewerblichen Anbieter im Umkreis von 10 km zu einem unserer Standorte.",
              },
              {
                step: "2",
                icon: Mail,
                title: "Per E-Mail einreichen",
                text: "Senden Sie uns das Vergleichsangebot per E-Mail an Preisgarantie@slt-rental.de – inklusive Link oder Nachweis des günstigeren Preises.",
              },
              {
                step: "3",
                icon: BadgePercent,
                title: "10 % Rabatt erhalten",
                text: "Nach Prüfung erhalten Sie das Mietprodukt bei uns für 10 % unter dem Nettomietpreis des günstigeren Angebots.",
              },
            ].map((item) => (
              <AnimatedSection key={item.step}>
                <Card className="h-full text-center">
                  <CardContent className="pt-6 pb-5 px-5">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                      {item.step}
                    </div>
                    <item.icon className="h-6 w-6 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-12 bg-muted/30">
        <div className="section-container max-w-3xl">
          <AnimatedSection>
            <h2 className="text-2xl font-bold mb-6">Teilnahmebedingungen</h2>
          </AnimatedSection>

          <div className="space-y-4">
            <AnimatedSection>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Identisches Produkt</h3>
                      <p className="text-sm text-muted-foreground">
                        Das Vergleichsangebot muss sich auf ein identisches oder vergleichbares Mietprodukt
                        beziehen (gleicher Hersteller, gleiche Leistungsklasse, gleicher Mietzeitraum).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Gewerblicher Anbieter</h3>
                      <p className="text-sm text-muted-foreground">
                        Der Vergleichsanbieter muss ein gewerblicher Vermieter mit Mehrwertsteuerausweis sein.
                        Angebote von Privatpersonen oder Kleingewerbetreibenden sind ausgeschlossen.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Umkreis 10 km</h3>
                      <p className="text-sm text-muted-foreground">
                        Der günstigere Anbieter muss sich innerhalb eines Radius von 10 km
                        zu einem unserer{" "}
                        <Link to="/standorte" className="text-primary hover:underline">
                          Standorte
                        </Link>{" "}
                        (Krefeld, Bonn oder Mülheim) befinden.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Nachweis erforderlich</h3>
                      <p className="text-sm text-muted-foreground">
                        Das günstigere Angebot muss durch einen Link, Screenshot oder ein schriftliches
                        Angebot nachgewiesen werden. Es muss zum Zeitpunkt der Anfrage aktuell und
                        verfügbar sein.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          <AnimatedSection>
            <div className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Hinweis:</strong> Die Tiefpreisgarantie gilt für den
                reinen Nettomietpreis. Lieferkosten, Versicherungen und Zusatzleistungen sind von der
                Garantie ausgenommen. SLT Rental behält sich die abschließende Prüfung vor.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="section-container max-w-2xl text-center">
          <AnimatedSection>
            <h2 className="text-2xl font-bold mb-3">Jetzt Tiefpreisgarantie nutzen</h2>
            <p className="text-muted-foreground mb-6">
              Senden Sie uns Ihr Vergleichsangebot und profitieren Sie von unserer Bestpreisgarantie.
            </p>
            <a
              href="mailto:Preisgarantie@slt-rental.de?subject=Tiefpreisgarantie%20-%20G%C3%BCnstigeres%20Angebot%20gefunden"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Mail className="h-4 w-4" />
              Preisgarantie@slt-rental.de
            </a>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
