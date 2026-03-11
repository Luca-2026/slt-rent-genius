import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock, Navigation, Truck, CheckCircle2, Mail, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedSection } from "@/components/ui/animated-section";
import { locationData } from "@/data/locationData";
import { useTranslation } from "react-i18next";

export default function Locations() {
  const { t } = useTranslation();

  return (
    <Layout>
      <SEO
        title="Standorte – Krefeld, Bonn & Mülheim | SLT Rental"
        description="3 SLT Rental Standorte in NRW: Krefeld, Bonn und Mülheim an der Ruhr. Öffnungszeiten, Anfahrt und Kontakt. Equipment direkt vor Ort abholen."
        canonical="/standorte"
        keywords="SLT Rental Standorte, Krefeld, Bonn, Mülheim, Baumaschinen Vermietung NRW"
        jsonLd={SLT_BREADCRUMB_JSONLD([{ name: "Home", url: "/" }, { name: "Standorte", url: "/standorte" }])}
      />

      {/* Hero */}
      <section className="bg-primary py-8 md:py-10 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-2 md:mb-3 lg:mb-4">
              {t("locations.title")}
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl text-sm md:text-base">
              {t("locations.heroSubtitle")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Locations Grid – always 3 side by side */}
      <section className="py-6 md:py-10 lg:py-20">
        <div className="section-container">
          {/* Mobile: horizontal scroll snap, Tablet+Desktop: grid */}
          <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 lg:gap-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-3 md:pb-0 -mx-4 px-[calc((100vw-75vw)/2)] md:mx-0 md:px-0 scrollbar-hide scroll-smooth">
            {locationData.map((location, index) => (
              <AnimatedSection key={location.id} animation="fade-in-up" delay={index * 150} className="min-w-[75vw] md:min-w-0 snap-center">
                <Card className="h-full overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group">
                  {/* Location Image */}
                  <Link to={`/mieten/${location.id}`} className="block h-28 md:h-32 lg:h-40 overflow-hidden bg-muted">
                    {location.image ? (
                      <img
                        src={location.image}
                        alt={`Standort ${location.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-8 w-8 lg:h-12 lg:w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </Link>

                  <CardContent className="p-3.5 md:p-4 lg:p-6 flex flex-col flex-1">
                    {/* Header */}
                    <div className="mb-2 md:mb-3 lg:mb-4">
                      <h2 className="text-sm md:text-base lg:text-xl font-bold text-headline leading-tight">{location.name}</h2>
                      <span className="text-[11px] md:text-xs lg:text-sm text-accent font-medium">{location.subtitle}</span>
                    </div>

                    {/* Address & Contact */}
                    <div className="space-y-1.5 md:space-y-1.5 lg:space-y-3 mb-3 md:mb-3 lg:mb-6">
                      <div className="flex items-start gap-1.5 md:gap-2 lg:gap-3">
                        <MapPin className="h-3.5 w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="text-xs md:text-xs lg:text-sm">
                          <p className="text-headline leading-tight">{location.address}</p>
                          <p className="text-muted-foreground leading-tight">{location.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
                        <Phone className="h-3.5 w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-muted-foreground shrink-0" />
                        <a href={`tel:${location.phone.replace(/\s/g, "")}`} className="text-xs md:text-xs lg:text-sm text-primary hover:text-accent">
                          {location.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
                        <Mail className="h-3.5 w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-muted-foreground shrink-0" />
                        <a href={`mailto:${location.email}`} className="text-xs md:text-xs lg:text-sm text-primary hover:text-accent truncate">
                          {location.email}
                        </a>
                      </div>
                    </div>

                    {/* Manager */}
                    {location.manager && (
                      <a
                        href={`mailto:${location.manager.email}`}
                        className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-6 p-2 lg:p-3 bg-surface-light rounded-lg hover:bg-accent/10 transition-colors cursor-pointer group/mgr"
                      >
                        <Avatar className="h-8 w-8 lg:h-12 lg:w-12 shrink-0">
                          {location.manager.image ? (
                            <AvatarImage src={location.manager.image} alt={location.manager.name} />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <User className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-headline text-xs lg:text-sm group-hover/mgr:text-primary transition-colors truncate">{location.manager.name}</p>
                          <p className="text-[10px] lg:text-xs text-muted-foreground">{t(location.manager.role)}</p>
                        </div>
                        <Mail className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-muted-foreground group-hover/mgr:text-primary transition-colors shrink-0" />
                      </a>
                    )}

                    {/* Hours */}
                    <div className="mb-3 md:mb-3 lg:mb-6">
                      <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-xs lg:text-sm font-medium text-headline mb-1.5 md:mb-2">
                        <Clock className="h-3.5 w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />
                        {t("locations.openingHours")}
                      </div>
                      <div className="space-y-0.5 md:space-y-1">
                        {location.hours.map((h) => (
                          <div key={h.day} className="flex justify-between gap-1 text-[11px] md:text-xs lg:text-sm">
                            <span className="text-muted-foreground shrink-0">{h.day}</span>
                            <span className="text-headline text-right">{h.time}</span>
                          </div>
                        ))}
                      </div>
                      {"hoursNote" in location && location.hoursNote && (
                        <p className="text-[9px] md:text-[10px] lg:text-xs text-muted-foreground mt-1 lg:mt-2">{location.hoursNote}</p>
                      )}
                    </div>

                    {/* Features – hidden on mobile */}
                    <div className="hidden md:block mb-3 lg:mb-6">
                      <div className="flex flex-wrap gap-1 lg:gap-2">
                        {location.features.map((feature) => (
                          <span
                            key={feature}
                            className="inline-flex items-center gap-0.5 lg:gap-1 bg-surface-light px-1.5 lg:px-2 py-0.5 lg:py-1 rounded text-[10px] lg:text-xs text-body"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-accent shrink-0" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 lg:gap-3 mt-auto">
                      <a href={location.mapUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" className="w-full text-[11px] md:text-xs lg:text-sm h-8 md:h-8 lg:h-9 px-2 md:px-3" size="sm">
                          <Navigation className="h-3.5 w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 mr-1 shrink-0" />
                          {t("locations.route")}
                        </Button>
                      </a>
                      <Link to={`/mieten/${location.id}`} className="flex-1">
                        <Button className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover text-[11px] md:text-xs lg:text-sm h-8 md:h-8 lg:h-9 px-2 md:px-3" size="sm">
                          {t("locations.rentalArticles")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Google Maps - All 3 Locations with markers on ALL viewports */}
      <AnimatedSection animation="fade-in">
        <section className="h-64 md:h-80 lg:h-[500px] relative">
          <iframe
            src="https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=50.85,6.95&zoom=9&maptype=roadmap"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="SLT Rental Standorte"
            className="w-full h-full"
          />
          {/* Markers on ALL viewports */}
          <div className="absolute inset-0 pointer-events-none">
            <Link
              to="/mieten/krefeld"
              className="absolute pointer-events-auto hover:scale-110 transition-transform z-10"
              style={{ top: '22%', left: '32%' }}
            >
              <div className="flex flex-col items-center drop-shadow-lg">
                <div className="bg-primary text-primary-foreground px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 lg:py-1.5 rounded-md lg:rounded-lg text-[9px] md:text-xs lg:text-sm font-bold shadow-lg whitespace-nowrap border border-primary-foreground/20 lg:border-2">
                  📍 Krefeld
                  <span className="hidden lg:inline"> (Hauptsitz)</span>
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 lg:border-l-8 lg:border-r-8 lg:border-t-8 border-l-transparent border-r-transparent border-t-primary" />
              </div>
            </Link>
            <Link
              to="/mieten/muelheim"
              className="absolute pointer-events-auto hover:scale-110 transition-transform z-10"
              style={{ top: '17%', left: '47%' }}
            >
              <div className="flex flex-col items-center drop-shadow-lg">
                <div className="bg-accent text-accent-foreground px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 lg:py-1.5 rounded-md lg:rounded-lg text-[9px] md:text-xs lg:text-sm font-bold shadow-lg whitespace-nowrap border border-accent-foreground/20 lg:border-2">
                  📍 Mülheim
                  <span className="hidden md:inline"> a.d. Ruhr</span>
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 lg:border-l-8 lg:border-r-8 lg:border-t-8 border-l-transparent border-r-transparent border-t-accent" />
              </div>
            </Link>
            <Link
              to="/mieten/bonn"
              className="absolute pointer-events-auto hover:scale-110 transition-transform z-10"
              style={{ top: '62%', left: '55%' }}
            >
              <div className="flex flex-col items-center drop-shadow-lg">
                <div className="bg-accent text-accent-foreground px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 lg:py-1.5 rounded-md lg:rounded-lg text-[9px] md:text-xs lg:text-sm font-bold shadow-lg whitespace-nowrap border border-accent-foreground/20 lg:border-2">
                  📍 Bonn
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 lg:border-l-8 lg:border-r-8 lg:border-t-8 border-l-transparent border-r-transparent border-t-accent" />
              </div>
            </Link>
          </div>
        </section>
      </AnimatedSection>

      {/* Delivery Info */}
      <section className="py-8 md:py-10 lg:py-16 bg-surface-light">
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-16">
            <AnimatedSection animation="slide-in-left" className="flex-1">
              <Truck className="h-10 w-10 lg:h-12 lg:w-12 text-accent mb-3 lg:mb-4" />
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-headline mb-3 lg:mb-4">
                {t("locations.deliveryToSite")}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-4 lg:mb-6">
                {t("locations.deliveryToSiteDesc")}
              </p>
              <Link to="/lieferung">
                <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                  {t("locations.moreAboutDelivery")}
                </Button>
              </Link>
            </AnimatedSection>
            <AnimatedSection animation="slide-in-right" delay={200} className="md:w-64 lg:w-96 w-full">
              <div className="bg-background rounded-xl p-4 lg:p-6 border border-border">
                <h3 className="font-semibold text-headline mb-3 lg:mb-4 text-sm lg:text-base">{t("locations.deliveryCostsTitle")}</h3>
                <ul className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">{t("locations.upTo25km")}</span>
                    <span className="font-medium text-headline">ab 49€</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">{t("locations.range25to50")}</span>
                    <span className="font-medium text-headline">ab 79€</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">{t("locations.range50to100")}</span>
                    <span className="font-medium text-headline">ab 129€</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">{t("locations.over100km")}</span>
                    <span className="font-medium text-headline">{t("locations.onRequest")}</span>
                  </li>
                </ul>
                <p className="text-[10px] lg:text-xs text-muted-foreground mt-3 lg:mt-4">
                  {t("locations.deliveryNote")}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </Layout>
  );
}
