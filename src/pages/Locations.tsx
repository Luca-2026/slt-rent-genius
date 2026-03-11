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
      <section className="bg-primary py-10 md:py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 md:mb-4">
              {t("locations.title")}
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl text-sm md:text-base">
              {t("locations.heroSubtitle")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-10 md:py-12 lg:py-20">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 lg:gap-8">
            {locationData.map((location, index) => (
              <AnimatedSection key={location.id} animation="fade-in-up" delay={index * 150}>
                <Card className="h-full overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group">
                  {/* Location Image */}
                  <Link to={`/mieten/${location.id}`} className="block h-32 md:h-28 lg:h-40 overflow-hidden bg-muted">
                    {location.image ? (
                      <img 
                        src={location.image} 
                        alt={`Standort ${location.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </Link>
                  <CardContent className="p-4 md:p-3 lg:p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3 md:mb-2 lg:mb-4">
                      <div>
                        <h2 className="text-lg md:text-base lg:text-xl font-bold text-headline">{location.name}</h2>
                        <span className="text-xs md:text-[11px] lg:text-sm text-accent font-medium">{location.subtitle}</span>
                      </div>
                      <div className="w-8 h-8 md:w-7 md:h-7 lg:w-10 lg:h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 md:h-3.5 md:w-3.5 lg:h-5 lg:w-5 text-primary" />
                      </div>
                    </div>

                    {/* Address & Contact */}
                    <div className="space-y-2 md:space-y-1.5 lg:space-y-3 mb-4 md:mb-3 lg:mb-6">
                      <div className="flex items-start gap-2 md:gap-1.5 lg:gap-3 text-sm md:text-xs lg:text-sm">
                        <MapPin className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-headline">{location.address}</p>
                          <p className="text-muted-foreground">{location.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-1.5 lg:gap-3 text-sm md:text-xs lg:text-sm">
                        <Phone className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 text-muted-foreground shrink-0" />
                        <a href={`tel:${location.phone.replace(/\s/g, "")}`} className="text-primary hover:text-accent">
                          {location.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 md:gap-1.5 lg:gap-3 text-sm md:text-xs lg:text-sm">
                        <Mail className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 text-muted-foreground shrink-0" />
                        <a href={`mailto:${location.email}`} className="text-primary hover:text-accent truncate">
                          {location.email}
                        </a>
                      </div>
                    </div>

                    {/* Manager */}
                    {location.manager && (
                      <a 
                        href={`mailto:${location.manager.email}`}
                        className="flex items-center gap-2 md:gap-2 lg:gap-3 mb-4 md:mb-3 lg:mb-6 p-2.5 md:p-2 lg:p-3 bg-surface-light rounded-lg hover:bg-accent/10 transition-colors cursor-pointer group/mgr h-[56px] md:h-[48px] lg:h-auto"
                      >
                        <Avatar className="h-10 w-10 md:h-8 md:w-8 lg:h-12 lg:w-12 shrink-0">
                          {location.manager.image ? (
                            <AvatarImage src={location.manager.image} alt={location.manager.name} />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <User className="h-4 w-4 md:h-3 md:w-3 lg:h-5 lg:w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-headline text-sm md:text-xs lg:text-sm group-hover/mgr:text-primary transition-colors truncate">{location.manager.name}</p>
                          <p className="text-xs md:text-[10px] lg:text-xs text-muted-foreground">{t(location.manager.role)}</p>
                        </div>
                        <Mail className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 text-muted-foreground group-hover/mgr:text-primary transition-colors shrink-0" />
                      </a>
                    )}

                    {/* Hours */}
                    <div className="mb-4 md:mb-3 lg:mb-6">
                      <div className="flex items-center gap-2 md:gap-1.5 text-sm md:text-xs lg:text-sm font-medium text-headline mb-2 md:mb-1 lg:mb-2">
                        <Clock className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4" />
                        {t("locations.openingHours")}
                      </div>
                      <div className="space-y-1 md:space-y-0.5 min-h-[60px] md:min-h-[50px] lg:min-h-[72px]">
                        {location.hours.map((h) => (
                          <div key={h.day} className="flex justify-between gap-2 text-sm md:text-[11px] lg:text-sm">
                            <span className="text-muted-foreground shrink-0">{h.day}</span>
                            <span className="text-headline text-right">{h.time}</span>
                          </div>
                        ))}
                      </div>
                      <div className="min-h-[16px] md:min-h-[14px] lg:min-h-[20px]">
                        {"hoursNote" in location && location.hoursNote && (
                          <p className="text-[10px] md:text-[9px] lg:text-xs text-muted-foreground mt-1.5 md:mt-1 lg:mt-2">{location.hoursNote}</p>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-4 md:mb-3 lg:mb-6 min-h-[48px] md:min-h-[40px] lg:min-h-[60px]">
                      <div className="flex flex-wrap gap-1.5 md:gap-1 lg:gap-2">
                        {location.features.map((feature) => (
                          <span
                            key={feature}
                            className="inline-flex items-center gap-1 bg-surface-light px-2 md:px-1.5 lg:px-2 py-1 md:py-0.5 lg:py-1 rounded text-xs md:text-[10px] lg:text-xs text-body"
                          >
                            <CheckCircle2 className="h-3 w-3 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3 text-accent shrink-0" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 md:gap-1.5 lg:gap-3 mt-auto">
                      <a href={location.mapUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" className="w-full md:text-[10px] md:px-2 lg:text-sm lg:px-4" size="sm">
                         <Navigation className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 mr-1.5 md:mr-1 lg:mr-2 shrink-0" />
                           {t("locations.route")}
                        </Button>
                      </a>
                      <Link to={`/mieten/${location.id}`} className="flex-1">
                         <Button className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover md:text-[10px] md:px-2 lg:text-sm lg:px-4" size="sm">
                           Mietartikel
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

      {/* Google Maps - All 3 Locations */}
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
          {/* Custom Location Markers */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Krefeld - 51.3396, 6.5678 → positioned relative to map center 50.85, 6.95 at zoom 9 */}
            <Link
              to="/mieten/krefeld"
              className="absolute pointer-events-auto hover:scale-110 transition-transform z-10"
              style={{ top: '22%', left: '32%' }}
            >
              <div className="flex flex-col items-center drop-shadow-lg">
                <div className="bg-primary text-primary-foreground px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-bold shadow-lg whitespace-nowrap border-2 border-primary-foreground/20">
                  📍 Krefeld (Hauptsitz)
                </div>
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary" />
              </div>
            </Link>
            {/* Mülheim a.d. Ruhr - 51.4272, 6.8825 */}
            <Link
              to="/mieten/muelheim"
              className="absolute pointer-events-auto hover:scale-110 transition-transform z-10"
              style={{ top: '17%', left: '47%' }}
            >
              <div className="flex flex-col items-center drop-shadow-lg">
                <div className="bg-accent text-accent-foreground px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-bold shadow-lg whitespace-nowrap border-2 border-accent-foreground/20">
                  📍 Mülheim a.d. Ruhr
                </div>
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-accent" />
              </div>
            </Link>
            {/* Bonn - 50.6945, 7.1508 */}
            <Link
              to="/mieten/bonn"
              className="absolute pointer-events-auto hover:scale-110 transition-transform z-10"
              style={{ top: '62%', left: '55%' }}
            >
              <div className="flex flex-col items-center drop-shadow-lg">
                <div className="bg-accent text-accent-foreground px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg whitespace-nowrap border-2 border-accent-foreground/20">
                  📍 Bonn
                </div>
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-accent" />
              </div>
            </Link>
          </div>
        </section>
      </AnimatedSection>

      {/* Delivery Info */}
      <section className="py-12 lg:py-16 bg-surface-light">
        <div className="section-container">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <AnimatedSection animation="slide-in-left" className="flex-1">
              <Truck className="h-12 w-12 text-accent mb-4" />
               <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">
                 {t("locations.deliveryToSite")}
               </h2>
               <p className="text-muted-foreground mb-6">
                 {t("locations.deliveryToSiteDesc")}
               </p>
               <Link to="/lieferung">
                 <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                   {t("locations.moreAboutDelivery")}
                 </Button>
               </Link>
             </AnimatedSection>
             <AnimatedSection animation="slide-in-right" delay={200} className="lg:w-96">
               <div className="bg-background rounded-xl p-6 border border-border">
                 <h3 className="font-semibold text-headline mb-4">{t("locations.deliveryCostsTitle")}</h3>
                 <ul className="space-y-3 text-sm">
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
                 <p className="text-xs text-muted-foreground mt-4">
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
