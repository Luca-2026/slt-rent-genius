import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock, Navigation, Truck, CheckCircle2, Mail, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedSection } from "@/components/ui/animated-section";
import { locationData } from "@/data/locationData";
import { useTranslation } from "react-i18next";

// Center of NRW (roughly between the three locations)
const mapCenter = { lat: 51.1, lng: 6.9 };

export default function Locations() {
  const { t } = useTranslation();

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              {t("locations.title")}
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl">
              {t("locations.heroSubtitle")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {locationData.map((location, index) => (
              <AnimatedSection key={location.id} animation="fade-in-up" delay={index * 150}>
                <Card className="h-full overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group">
                  {/* Location Image */}
                  <Link to={`/mieten/${location.id}`} className="block h-40 overflow-hidden bg-muted">
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
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-headline">{location.name}</h2>
                        <span className="text-sm text-accent font-medium">{location.subtitle}</span>
                      </div>
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    {/* Address & Contact */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-headline">{location.address}</p>
                          <p className="text-muted-foreground">{location.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${location.phone.replace(/\s/g, "")}`} className="text-primary hover:text-accent">
                          {location.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${location.email}`} className="text-primary hover:text-accent">
                          {location.email}
                        </a>
                      </div>
                    </div>

                    {/* Manager */}
                    {location.manager && (
                      <a 
                        href={`mailto:${location.manager.email}`}
                        className="flex items-center gap-3 mb-6 p-3 bg-surface-light rounded-lg hover:bg-accent/10 transition-colors cursor-pointer group/mgr"
                      >
                        <Avatar className="h-12 w-12">
                          {location.manager.image ? (
                            <AvatarImage src={location.manager.image} alt={location.manager.name} />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-headline text-sm group-hover/mgr:text-primary transition-colors">{location.manager.name}</p>
                          <p className="text-xs text-muted-foreground">{t(location.manager.role)}</p>
                        </div>
                        <Mail className="h-4 w-4 text-muted-foreground group-hover/mgr:text-primary transition-colors" />
                      </a>
                    )}

                    {/* Hours */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-sm font-medium text-headline mb-2">
                        <Clock className="h-4 w-4" />
                        {t("locations.openingHours")}
                      </div>
                      <div className="space-y-1 min-h-[72px]">
                        {location.hours.map((h) => (
                          <div key={h.day} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{h.day}</span>
                            <span className="text-headline">{h.time}</span>
                          </div>
                        ))}
                      </div>
                      <div className="min-h-[20px]">
                        {"hoursNote" in location && location.hoursNote && (
                          <p className="text-xs text-muted-foreground mt-2">{location.hoursNote}</p>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6 min-h-[60px]">
                      <div className="flex flex-wrap gap-2">
                        {location.features.map((feature) => (
                          <span
                            key={feature}
                            className="inline-flex items-center gap-1 bg-surface-light px-2 py-1 rounded text-xs text-body"
                          >
                            <CheckCircle2 className="h-3 w-3 text-accent" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-auto">
                      <a href={location.mapUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                         <Navigation className="h-4 w-4 mr-2" />
                           {t("locations.route")}
                        </Button>
                      </a>
                      <Link to={`/standorte/${location.id}`} className="flex-1">
                         <Button className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover" size="sm">
                           {t("locations.details")}
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

      {/* Google Maps */}
      <AnimatedSection animation="fade-in">
        <section className="h-96 lg:h-[500px] relative">
          <iframe
            src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${mapCenter.lat},${mapCenter.lng}&zoom=9`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="SLT Rental Standorte"
            className="w-full h-full"
          />
          {/* Custom Markers Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <a href="#krefeld" className="absolute pointer-events-auto" style={{ top: '35%', left: '42%' }}>
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-semibold shadow-lg whitespace-nowrap">
                  Krefeld (Hauptsitz)
                </div>
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary" />
              </div>
            </a>
            <a href="#muelheim" className="absolute pointer-events-auto" style={{ top: '28%', left: '52%' }}>
              <div className="flex flex-col items-center">
                <div className="bg-accent text-accent-foreground px-3 py-1 rounded-lg text-sm font-semibold shadow-lg whitespace-nowrap">
                  Mülheim a.d. Ruhr
                </div>
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-accent" />
              </div>
            </a>
            <a href="#bonn" className="absolute pointer-events-auto" style={{ top: '72%', left: '48%' }}>
              <div className="flex flex-col items-center">
                <div className="bg-accent text-accent-foreground px-3 py-1 rounded-lg text-sm font-semibold shadow-lg whitespace-nowrap">
                  Bonn
                </div>
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-accent" />
              </div>
            </a>
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
