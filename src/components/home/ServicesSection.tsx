import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useTranslation } from "react-i18next";
import { 
  ArrowRight, 
  Wrench, 
  ClipboardList, 
  Truck, 
  ShieldCheck, 
  Construction,
  Mail
} from "lucide-react";

export function ServicesSection() {
  const { t } = useTranslation();

  const services = [
    {
      icon: ClipboardList,
      title: t("services.planning"),
      description: t("services.planningDesc"),
    },
    {
      icon: ShieldCheck,
      title: t("services.traffic"),
      description: t("services.trafficDesc"),
      externalLink: "https://www.slt-infra.de",
      externalLabel: "slt-infra.de",
    },
    {
      icon: Construction,
      title: t("services.setup"),
      description: t("services.setupDesc"),
    },
    {
      icon: Truck,
      title: t("services.delivery"),
      description: t("services.deliveryDesc"),
      link: "/lieferung",
      linkLabel: t("services.deliveryLink"),
    },
    {
      icon: Wrench,
      title: "Werkstatt & Reparatur",
      description: "Eigene Werkstatt für Wartung & Reparatur an Anhängern, Baumaschinen und Aggregaten – auch für Fremdgeräte.",
      emailLink: "service@slt-rental.de",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-surface-light">
      <div className="section-container">
        <AnimatedSection className="text-center mb-12">
          <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-primary/20">
            {t("services.badge")}
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-3">
            {t("services.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("services.subtitle")}
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                  {service.emailLink && (
                    <a
                      href={`mailto:${service.emailLink}`}
                      className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-3 hover:underline"
                    >
                      <Mail className="h-3 w-3" />
                      Jetzt Kontakt aufnehmen
                    </a>
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
              {t("services.cta")}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
