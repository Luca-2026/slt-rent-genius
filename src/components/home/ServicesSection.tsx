import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { 
  ArrowRight, 
  Wrench, 
  ClipboardList, 
  Truck, 
  ShieldCheck, 
  PartyPopper, 
  Construction 
} from "lucide-react";

const services = [
  {
    icon: ClipboardList,
    title: "Planung & Koordination",
    description: "Wir übernehmen die komplette Projektplanung – von der Bedarfsermittlung bis zur Abstimmung mit Behörden und Bauämtern.",
  },
  {
    icon: ShieldCheck,
    title: "Verkehrssicherung",
    description: "Absperrplanung, Halteverbotszonen einrichten, Antragsformulare und komplette Koordination mit Straßenverkehrsbehörden.",
    externalLink: "https://www.slt-infra.de",
    externalLabel: "slt-infra.de",
  },
  {
    icon: Construction,
    title: "Auf- & Abbau",
    description: "Professioneller Auf- und Abbau von Zelten, Bühnen, Möbeln, Absperrtechnik und mehr – alles aus einer Hand.",
  },
  {
    icon: Truck,
    title: "Anlieferung & Abholung",
    description: "Flexible Lieferung direkt auf Ihre Baustelle oder zu Ihrem Veranstaltungsort in ganz NRW.",
    link: "/lieferung",
    linkLabel: "Lieferkosten berechnen",
  },
];

export function ServicesSection() {
  return (
    <section className="py-16 lg:py-20 bg-surface-light">
      <div className="section-container">
        <AnimatedSection className="text-center mb-12">
          <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-primary/20">
            Mehr als nur Vermietung
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-3">
            Unsere Dienstleistungen
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Wir bieten Ihnen nicht nur erstklassige Mietgeräte, sondern auch den kompletten Service drumherum – von der Planung bis zum Abbau.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <AnimatedSection key={service.title} delay={index * 100} animation="fade-in-up">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-2">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-headline mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {service.description}
                  </p>
                  {service.externalLink && (
                    <a
                      href={service.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-accent font-medium mt-3 hover:underline"
                    >
                      {service.externalLabel}
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                  {service.link && (
                    <Link
                      to={service.link}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-accent transition-colors mt-3"
                    >
                      {service.linkLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="text-center mt-10" delay={400}>
          <Link to="/kontakt">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all group">
              <Wrench className="mr-2 h-4 w-4" />
              Dienstleistung anfragen
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
