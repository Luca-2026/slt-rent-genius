import { useState, lazy, Suspense, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO, SLT_ORGANIZATION_JSONLD } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { CountUpBadge } from "@/components/ui/count-up-badge";
import { ServicesSection } from "@/components/home/ServicesSection";
const ProductInspirationSlider = lazy(() => import("@/components/home/ProductInspirationSlider").then(m => ({ default: m.ProductInspirationSlider })));
import { Loader2 } from "lucide-react";

// Lazy load components that pull in rentalData (~100 product images)
const HeroSearch = lazy(() => import("@/components/home/HeroSearch").then(m => ({ default: m.HeroSearch })));
const ProductSearchDialog = lazy(() => import("@/components/home/ProductSearchDialog").then(m => ({ default: m.ProductSearchDialog })));
const LocationSelectDialog = lazy(() => import("@/components/solutions/LocationSelectDialog").then(m => ({ default: m.LocationSelectDialog })));
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { 
  Search, 
  Truck, 
  CheckCircle2,
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  Calendar,
  ShoppingCart,
  CreditCard,
  Package,
  User,
  Mail,
  Building2
} from "lucide-react";

// Shared location data
import { locationData } from "@/data/locationData";

import { HeroBackgroundSlider } from "@/components/home/HeroBackgroundSlider";
import { GoogleReviews as GoogleReviewsComponent } from "@/components/reviews/GoogleReviews";

export default function Index() {
  const { t } = useTranslation();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [howItWorksTab, setHowItWorksTab] = useState<"private" | "b2b">("private");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const steps = [
    { number: "1", icon: MapPin, title: t("steps.step1Title"), description: t("steps.step1Desc"), action: "location" as const, cta: t("steps.step1Cta") },
    { number: "2", icon: Search, title: t("steps.step2Title"), description: t("steps.step2Desc"), action: "search" as const, cta: t("steps.step2Cta") },
    { number: "3", icon: Calendar, title: t("steps.step3Title"), description: t("steps.step3Desc") },
    { number: "4", icon: CreditCard, title: t("steps.step4Title"), description: t("steps.step4Desc") },
    { number: "5", icon: Package, title: t("steps.step5Title"), description: t("steps.step5Desc") },
  ];

  const b2bSteps = [
    { number: "1", icon: Building2, title: t("howItWorks.b2bStep1Title"), description: t("howItWorks.b2bStep1Desc") },
    { number: "2", icon: Search, title: t("howItWorks.b2bStep2Title"), description: t("howItWorks.b2bStep2Desc") },
    { number: "3", icon: Calendar, title: t("howItWorks.b2bStep3Title"), description: t("howItWorks.b2bStep3Desc") },
    { number: "4", icon: CreditCard, title: t("howItWorks.b2bStep4Title"), description: t("howItWorks.b2bStep4Desc") },
  ];

  const trustItems = [
    { value: 3500, label: t("trust.satisfiedCustomers"), prefix: "+", isCounter: true },
    { value: 1700, label: t("trust.rentalProducts"), prefix: "+", isCounter: true },
    { value: 3, label: t("trust.locationsNRW"), prefix: "", isCounter: true },
    { value: 2016, label: t("trust.yourPartner"), prefix: "seit ", isCounter: false },
  ];

  const benefits = [
    { icon: CheckCircle2, title: t("benefits.fairPrices"), text: t("benefits.fairPricesDesc") },
    { icon: Truck, title: t("benefits.delivery"), text: t("benefits.deliveryDesc") },
    { icon: Clock, title: t("benefits.flexibleTimes"), text: t("benefits.flexibleTimesDesc") },
    { icon: Phone, title: t("benefits.personalAdvice"), text: t("benefits.personalAdviceDesc") },
  ];

  return (
    <Layout>
      <SEO
        title="Baumaschinen & Equipment mieten | SLT Rental"
        description="SLT Rental: Baumaschinen, Anhänger, Event-Equipment und mehr mieten in Krefeld, Bonn und Mülheim. Über 1.700 Produkte. Faire Preise, flexible Mietzeiten."
        canonical="/"
        keywords="Baumaschinen mieten, Anhänger mieten, Minibagger mieten, Event-Equipment mieten, NRW, Krefeld, Bonn, Mülheim"
        jsonLd={SLT_ORGANIZATION_JSONLD}
      />
      <section className="relative z-20 bg-primary py-16 lg:py-0 lg:min-h-[calc(100svh-17rem)] lg:flex lg:items-center">
        {/* Background Image Slider */}
        <HeroBackgroundSlider />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="absolute inset-0 bg-primary/20" />
        <div className="section-container relative z-10">
          <div className="max-w-3xl">
            {/* Claim Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-2 mb-6">
              <span className="text-accent font-bold text-lg">{t("hero.claim")}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
              {t("hero.title")}
              <span className="text-accent"> {t("hero.titleHighlight")}</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl">
              {t("hero.subtitle")}
            </p>

            {/* Interactive Search with Article Search - lazy loaded */}
            <Suspense fallback={<div className="bg-background rounded-xl p-4 shadow-xl max-w-2xl h-[88px] flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}>
              <HeroSearch />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Trust Badges with CountUp */}
      <section className="relative z-10 py-10 bg-background border-b border-border">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustItems.map((item, index) => (
              <AnimatedSection key={item.label} delay={index * 100} animation="fade-in-up">
                {item.isCounter ? (
                  <CountUpBadge
                    value={item.value}
                    label={item.label}
                    prefix={item.prefix}
                  />
                ) : (
                  <div className="text-center">
                    <span className="block text-3xl lg:text-4xl font-bold text-primary tabular-nums">
                      {item.prefix}{item.value}
                    </span>
                    <span className="text-sm text-muted-foreground mt-1 block">{item.label}</span>
                  </div>
                )}
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Locations / Standorte */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-3">
              {t("locations.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("locations.subtitle")}
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locationData.map((loc, index) => (
              <AnimatedSection key={loc.id} delay={index * 100} animation="fade-in-up">
                <Card className="h-full group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/30 overflow-hidden flex flex-col">
                  {/* Location Image */}
                  <Link to={`/mieten/${loc.id}`} className="aspect-[16/9] relative overflow-hidden block cursor-pointer">
                    {loc.image ? (
                      <img
                        src={loc.image}
                        alt={loc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Building2 className="h-16 w-16 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-xs text-accent font-medium uppercase tracking-wide">
                        {loc.subtitle}
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        {loc.name}
                      </h3>
                    </div>
                  </Link>
                  
                  <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
                    {/* Address */}
                    <div className="flex items-start gap-2 text-sm mb-1">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="block text-body break-words">{loc.address}</span>
                        <span className="block text-body break-words">{loc.city}</span>
                      </div>
                    </div>

                    {/* Phone */}
                    <a 
                      href={`tel:${loc.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground mb-1 hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="h-4 w-4 shrink-0 text-primary" />
                      <span>{loc.phone}</span>
                    </a>

                    {/* Email */}
                    <a 
                      href={`mailto:${loc.email}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground mb-3 hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="h-4 w-4 shrink-0 text-primary" />
                      <span>{loc.email}</span>
                    </a>

                    {/* Hours - fixed height */}
                    <div className="mb-3 p-3 bg-surface-light rounded-lg min-h-[108px]">
                      <div className="flex items-center gap-2 text-sm font-medium text-headline mb-2">
                        <Clock className="h-4 w-4 text-primary" />
                        {t("locations.openingHours")}
                      </div>
                      <div className="space-y-1">
                        {loc.hours.map((h, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                            <span>{h.day}</span>
                            <span className="font-medium">{h.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Manager - fixed height */}
                    <a 
                      href={`mailto:${loc.manager.email}`}
                      className="flex items-center gap-3 mb-4 p-3 bg-surface-light rounded-lg hover:bg-accent/10 transition-colors cursor-pointer min-h-[72px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Avatar className="h-10 w-10">
                        {loc.manager.image ? (
                          <AvatarImage src={loc.manager.image} alt={loc.manager.name} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-headline text-sm truncate">{loc.manager.name}</p>
                        <p className="text-xs text-muted-foreground">{t(loc.manager.role)}</p>
                      </div>
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    </a>

                    {/* CTA - pushed to bottom */}
                    <Link to={`/mieten/${loc.id}`} className="mt-auto">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        {t("locations.viewCategories")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center mt-10" delay={300}>
            <Link to="/standorte">
              <Button variant="outline" size="lg" className="group border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground">
                {t("locations.viewAll")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* How it Works - Redesigned */}
      <section className="py-20 lg:py-28 bg-surface-light overflow-hidden">
        <div className="section-container">
          <AnimatedSection className="text-center mb-8">
            <span className="inline-block bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-accent/20">
              {t("steps.badge")}
            </span>
            <h2 className="text-2xl lg:text-4xl font-bold text-headline mb-3">
              {t("steps.title")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("steps.subtitle")}
            </p>
          </AnimatedSection>

          {/* Privat / B2B Toggle */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <button
              onClick={() => setHowItWorksTab("private")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
                howItWorksTab === "private"
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-background text-body border-border hover:border-primary/40"
              }`}
            >
              <User className="h-4 w-4" />
              {t("howItWorks.tabPrivate", "Privatkunden")}
            </button>
            <button
              onClick={() => setHowItWorksTab("b2b")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
                howItWorksTab === "b2b"
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-background text-body border-border hover:border-primary/40"
              }`}
            >
              <Building2 className="h-4 w-4" />
              {t("howItWorks.tabB2B", "Geschäftskunden")}
            </button>
          </div>

          {howItWorksTab === "private" && (
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-border rounded-full" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 relative">
              {steps.map((step, index) => {
                const cardContent = (
                  <>
                    {/* Step Card */}
                    <div className="bg-card rounded-2xl p-5 h-full border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                      {/* Step Number Badge + Icon Row */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-accent transition-all duration-300 shrink-0">
                          <step.icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-accent uppercase tracking-wider">
                          {t("steps.step")} {step.number}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-headline text-base mb-2 min-h-[24px]">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed min-h-[60px] flex-1">{step.description}</p>

                      {step.cta && (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:text-accent transition-colors mt-3">
                          {step.cta}
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className="hidden lg:flex absolute top-[52px] -right-2.5 w-5 h-5 bg-card border border-border rounded-full items-center justify-center z-10 shadow-sm">
                        <ArrowRight className="h-3 w-3 text-accent" />
                      </div>
                    )}
                  </>
                );

                return (
                  <AnimatedSection key={step.number} delay={index * 100} animation="fade-in-up">
                    {step.action === "location" ? (
                      <button onClick={() => setLocationDialogOpen(true)} className="relative group h-full block w-full text-left cursor-pointer">
                        {cardContent}
                      </button>
                    ) : step.action === "search" ? (
                      <button onClick={() => setSearchDialogOpen(true)} className="relative group h-full block w-full text-left cursor-pointer">
                        {cardContent}
                      </button>
                    ) : (
                      <div className="relative group h-full">
                        {cardContent}
                      </div>
                    )}
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
          )}

          {howItWorksTab === "b2b" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {b2bSteps.map((step, index) => (
              <AnimatedSection key={step.number} delay={index * 100} animation="fade-in-up">
                <div className="bg-card rounded-2xl p-5 h-full border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-accent transition-all duration-300 shrink-0">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">
                      {t("steps.step")} {step.number}
                    </span>
                  </div>
                  <h3 className="font-bold text-headline text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
          )}

          <AnimatedSection className="text-center mt-12" delay={500}>
            <Link to="/so-funktionierts">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group">
                {t("steps.learnMore")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Product Inspiration Slider */}
      <Suspense fallback={null}>
        <ProductInspirationSlider />
      </Suspense>

      {/* Google Reviews Section */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {t("reviews.title", "Das sagen unsere Kunden")}
              </h2>
              <p className="text-muted-foreground">
                {t("reviews.subtitle", "Echte Bewertungen von Google")}
              </p>
            </div>
            <div className="space-y-12">
              {locationData
                .filter((loc) => ["krefeld", "bonn"].includes(loc.id))
                .map((loc) => {
                  const placeId = loc.id === "krefeld" ? "ChIJRyajcmSxuEcRAHvlWgXfF5c" : "ChIJf2ituEblvkcRUGua8HYhHCA";
                  return (
                    <div key={loc.id}>
                      <h3 className="text-lg font-semibold text-foreground mb-4">📍 {loc.name}</h3>
                      <GoogleReviewsComponent placeId={placeId} locationName={loc.name} variant="full" maxReviews={isMobile ? 2 : undefined} />
                    </div>
                  );
                })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-card border-y border-border relative overflow-hidden">
        
        <div className="section-container text-center relative">
          <AnimatedSection>
            <h2 className="text-3xl lg:text-4xl font-bold text-headline mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/mieten">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {t("cta.rentEquipment")}
                </Button>
              </Link>
              <Link to="/b2b">
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-10 py-6 text-lg transition-all duration-300 hover:-translate-y-1">
                  {t("cta.b2bInquiry")}
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={benefit.title} delay={index * 100} animation="fade-in-up">
                <div className="flex items-start gap-4 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center shrink-0 group-hover:from-accent group-hover:to-accent/80 transition-all duration-300">
                    <benefit.icon className="h-7 w-7 text-accent group-hover:text-accent-foreground transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-headline mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.text}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
      <Suspense fallback={null}>
        <ProductSearchDialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen} />
      </Suspense>
      <Suspense fallback={null}>
        <LocationSelectDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} />
      </Suspense>
    </Layout>
  );
}
