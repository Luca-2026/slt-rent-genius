import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { 
  MapPin, 
  Phone, 
  ArrowRight, 
  Truck, 
  Clock, 
  CheckCircle2,
  Package,
  Calendar,
  Mail,
  User,
  Building2
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAreaBySlug, type LocalArea } from "@/data/localSeoData";
import { getLocationInfoById } from "@/data/locationData";
import { useTranslation } from "react-i18next";

export default function LocalAreaPage() {
  const { areaSlug } = useParams<{ areaSlug: string }>();
  const { t } = useTranslation();
  
  const area = areaSlug ? getAreaBySlug(areaSlug) : undefined;
  
  if (!area) {
    return <Navigate to="/standorte" replace />;
  }

  const location = getLocationInfoById(area.locationId);
  const isBonn = area.locationId === "bonn";
  const isMuelheim = area.locationId === "muelheim";

  // Location-specific rental categories
  const categoriesByLocation: Record<string, { id: string; nameKey: string; descKey: string }[]> = {
    krefeld: [
      { id: "anhaenger", nameKey: "localArea.cat.anhaenger", descKey: "localArea.catDesc.anhaenger" },
      { id: "erdbewegung", nameKey: "localArea.cat.erdbewegung", descKey: "localArea.catDesc.erdbewegung" },
      { id: "werkzeuge", nameKey: "localArea.cat.werkzeuge", descKey: "localArea.catDesc.werkzeuge" },
      { id: "gartenpflege", nameKey: "localArea.cat.gartenpflege", descKey: "localArea.catDesc.gartenpflege" },
    ],
    bonn: [
      { id: "anhaenger", nameKey: "localArea.cat.anhaenger", descKey: "localArea.catDesc.anhaenger" },
      { id: "erdbewegung", nameKey: "localArea.cat.erdbewegung", descKey: "localArea.catDesc.erdbewegung" },
      { id: "werkzeuge", nameKey: "localArea.cat.werkzeuge", descKey: "localArea.catDesc.werkzeuge" },
      { id: "gartenpflege", nameKey: "localArea.cat.gartenpflege", descKey: "localArea.catDesc.gartenpflege" },
      { id: "buehne", nameKey: "localArea.cat.buehne", descKey: "localArea.catDesc.buehne" },
      { id: "traversen-rigging", nameKey: "localArea.cat.traversen", descKey: "localArea.catDesc.traversen" },
    ],
    muelheim: [
      { id: "anhaenger", nameKey: "localArea.cat.anhaenger", descKey: "localArea.catDesc.anhaenger" },
      { id: "erdbewegung", nameKey: "localArea.cat.erdbewegung", descKey: "localArea.catDesc.erdbewegung" },
      { id: "werkzeuge", nameKey: "localArea.cat.werkzeuge", descKey: "localArea.catDesc.werkzeuge" },
      { id: "gartenpflege", nameKey: "localArea.cat.gartenpflege", descKey: "localArea.catDesc.gartenpflege" },
    ],
  };

  const rentalCategories = categoriesByLocation[area.locationId] || categoriesByLocation.krefeld;

  const benefits = [
    { icon: Truck, title: t("localArea.benefit1Title"), text: t("localArea.benefit1Text") },
    { icon: Clock, title: t("localArea.benefit2Title"), text: t("localArea.benefit2Text") },
    { icon: CheckCircle2, title: t("localArea.benefit3Title"), text: t("localArea.benefit3Text") },
    { icon: Package, title: t("localArea.benefit4Title"), text: t("localArea.benefit4Text") },
  ];

  const heroTitle = isBonn
    ? t("localArea.heroTitleBonn", { area: area.name })
    : t("localArea.heroTitle", { area: area.name });

  const seoHeadline = isBonn
    ? t("localArea.seoHeadlineBonn", { area: area.name })
    : t("localArea.seoHeadline", { area: area.name });

  const equipmentList = isBonn
    ? t("localArea.equipmentListBonn")
    : t("localArea.equipmentList");

  const exampleList = isBonn
    ? t("localArea.exampleListBonn")
    : isMuelheim
    ? t("localArea.exampleListMuelheim")
    : t("localArea.exampleListKrefeld");

  const specialNote = isBonn ? " " + t("localArea.specialNoteBonn") : "";

  const managerRole = t("rental.locationManager");

  return (
    <Layout>
      <SEO
        title={`${heroTitle} | SLT Rental`}
        description={area.description}
        canonical={`/mieten-in/${area.slug}`}
        keywords={area.keywords.join(", ")}
        jsonLd={SLT_BREADCRUMB_JSONLD([
          { name: "Home", url: "/" },
          { name: "Standorte", url: "/standorte" },
          { name: area.name, url: `/mieten-in/${area.slug}` },
        ])}
      />
      {/* Hero */}
      <section className="bg-primary py-12 lg:py-20">
        <div className="section-container">
          <AnimatedSection>
            <nav className="flex items-center gap-2 text-sm text-primary-foreground/60 mb-6">
              <Link to="/" className="hover:text-accent transition-colors">Home</Link>
              <span>/</span>
              <Link to="/standorte" className="hover:text-accent transition-colors">{t("localArea.locations")}</Link>
              <span>/</span>
              <span className="text-primary-foreground">{area.name}</span>
            </nav>

            <h1 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-4">
              {heroTitle}
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-3xl mb-6">
              {area.description}
            </p>

            {location && (
              <div className="flex flex-wrap items-center gap-4 text-primary-foreground/80">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span>{t("localArea.nearestLocation")}: <strong className="text-primary-foreground">{location.name}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-accent" />
                  <span>{t("localArea.onlyXkm", { km: area.distance })}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-8">
              <Link to={`/mieten/${area.locationId}`}>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Calendar className="h-5 w-5 mr-2" />
                  {t("localArea.rentNow")}
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button size="lg" variant="outline" className="border-primary text-primary bg-primary-foreground hover:border-accent hover:bg-primary-foreground hover:text-primary">
                  <Phone className="h-5 w-5 mr-2" />
                  {t("localArea.requestAdvice")}
                </Button>
              </Link>
              <Link to="/b2b/login">
                <Button size="lg" variant="outline" className="border-primary text-primary bg-primary-foreground hover:border-accent hover:bg-primary-foreground hover:text-primary">
                  <Building2 className="h-5 w-5 mr-2" />
                  {t("cta.b2bInquiry")}
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 bg-surface-light border-b border-border">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={benefit.title} delay={index * 100} animation="fade-in-up">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <benefit.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-headline text-sm">{benefit.title}</h3>
                    <p className="text-xs text-muted-foreground">{benefit.text}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Rental Categories */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-3">
              {t("localArea.categoriesTitle", { area: area.name })}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("localArea.categoriesDesc", { location: location?.name || area.name, area: area.name })}
            </p>
          </AnimatedSection>

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${rentalCategories.length > 4 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
            {rentalCategories.map((category, index) => (
              <AnimatedSection key={category.id} delay={index * 100} animation="fade-in-up">
                <Link to={`/mieten/${area.locationId}/${category.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-2 border-transparent hover:border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-headline text-lg mb-2 group-hover:text-primary transition-colors">
                        {t(category.nameKey)}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t(category.descKey)}
                      </p>
                      <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:text-accent transition-colors">
                        {t("localArea.viewProducts")}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center mt-10" delay={400}>
            <Link to={`/mieten/${area.locationId}`}>
              <Button variant="outline" size="lg" className="group">
                {t("localArea.allCategories")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Location Info Card */}
      {location && (
        <section className="py-16 lg:py-20 bg-surface-light">
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <AnimatedSection>
                <Card className="overflow-hidden">
                  {location.image && (
                    <div className="w-full h-48 overflow-hidden">
                      <img 
                        src={location.image} 
                        alt={`SLT Rental ${location.name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h2 className="text-xl font-bold text-headline mb-6">
                      {t("localArea.yourLocation", { area: area.name })}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-headline mb-3">SLT Rental {location.name}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            <span>{location.address}, {location.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary shrink-0" />
                            <a href={`tel:${location.phone.replace(/\s/g, "")}`} className="hover:text-primary transition-colors">
                              {location.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary shrink-0" />
                            <a href={`mailto:${location.email}`} className="hover:text-primary transition-colors">
                              {location.email}
                            </a>
                          </div>
                        </div>

                        {/* Manager */}
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                          <Avatar className="h-12 w-12">
                            {location.manager.image ? (
                              <AvatarImage src={location.manager.image} alt={location.manager.name} />
                            ) : null}
                            <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-headline text-sm">{location.manager.name}</p>
                            <p className="text-xs text-muted-foreground">{managerRole}</p>
                            <a href={`mailto:${location.manager.email}`} className="text-xs text-primary hover:text-accent transition-colors">
                              {location.manager.email}
                            </a>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-headline mb-3">{t("locations.openingHours")}</h3>
                        <div className="space-y-1 text-sm">
                          {location.hours.map((h, idx) => (
                            <div key={idx} className="flex justify-between text-muted-foreground">
                              <span>{h.day}</span>
                              <span className="font-medium">{h.time}</span>
                            </div>
                          ))}
                        </div>
                        {location.hoursNote && (
                          <p className="text-xs text-muted-foreground mt-2">{location.hoursNote}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
                      <Link to={`/mieten/${location.id}`}>
                        <Button className="bg-primary hover:bg-primary/90">
                          {t("localArea.viewProducts")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <a href={location.mapUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                          <MapPin className="mr-2 h-4 w-4" />
                          {t("rental.planRoute")}
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </section>
      )}

      {/* SEO Content */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto prose prose-sm">
            <AnimatedSection>
              <h2 className="text-xl font-bold text-headline mb-4">
                {seoHeadline}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t("localArea.seoP1", { area: area.name, equipmentList, location: location?.name || area.name, distance: area.distance })}
              </p>
              <p className="text-muted-foreground mb-4">
                {exampleList} – {t("localArea.seoP2")}{specialNote}
              </p>
              <p className="text-muted-foreground">
                {t("localArea.seoP3", { area: area.name })}
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-primary">
        <div className="section-container text-center">
          <AnimatedSection>
            <h2 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-4">
              {t("localArea.ctaTitle", { area: area.name })}
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              {t("localArea.ctaDesc")}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={`/mieten/${area.locationId}`}>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {t("localArea.rentNow")}
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button size="lg" variant="outline" className="border-primary text-primary bg-primary-foreground hover:border-accent hover:bg-primary-foreground hover:text-primary">
                  {t("localArea.contact")}
                </Button>
              </Link>
              <Link to="/b2b/login">
                <Button size="lg" variant="outline" className="border-primary text-primary bg-primary-foreground hover:border-accent hover:bg-primary-foreground hover:text-primary">
                  <Building2 className="h-5 w-5 mr-2" />
                  {t("cta.b2bInquiry")}
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
