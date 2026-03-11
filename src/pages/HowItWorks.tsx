import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animated-section";
import {
  Calendar, Search, ShoppingCart, Mail, Truck, CreditCard, FileText,
  AlertCircle, CheckCircle2, ArrowRight, Users, User, MapPin, Building2
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductSearchDialog } from "@/components/home/ProductSearchDialog";
import { LocationSelectDialog } from "@/components/solutions/LocationSelectDialog";

interface Step {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  tips: string[];
  action?: "location" | "search";
  cta?: string;
}

function TimelineSteps({
  steps,
  onLocationClick,
  onSearchClick,
}: {
  steps: Step[];
  onLocationClick: () => void;
  onSearchClick: () => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = stepRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveStep(idx);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-10% 0px -30% 0px" }
    );
    stepRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [steps]);

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Vertical line */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-px" />
      {/* Progress fill */}
      <div
        className="absolute left-6 md:left-1/2 top-0 w-0.5 bg-primary md:-translate-x-px transition-all duration-700 ease-out"
        style={{ height: `${((activeStep + 1) / steps.length) * 100}%` }}
      />

      <div className="space-y-10 md:space-y-16">
        {steps.map((step, index) => {
          const isActive = index <= activeStep;
          const isRight = index % 2 !== 0;
          const Icon = step.icon;
          const isClickable = !!step.action;

          return (
            <div
              key={step.number}
              ref={(el) => { stepRefs.current[index] = el; }}
              className={`relative flex items-start gap-4 md:gap-0 ${isRight ? "md:flex-row-reverse" : "md:flex-row"}`}
            >
              {/* Node */}
              <div className="relative z-10 shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 shadow-md ${
                    isActive
                      ? "bg-primary border-primary text-primary-foreground scale-110 shadow-primary/30"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all duration-500 ${
                    isActive ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.number}
                </span>
              </div>

              {/* Card */}
              <div className={`flex-1 md:w-[calc(50%-3.5rem)] ${isRight ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"}`}>
                <AnimatedSection delay={index * 120} animation="fade-in-up">
                  <div
                    onClick={isClickable ? () => (step.action === "location" ? onLocationClick() : onSearchClick()) : undefined}
                    className={`bg-card rounded-2xl p-5 md:p-6 border-2 transition-all duration-500 group ${
                      isActive ? "border-primary/30 shadow-lg shadow-primary/5" : "border-transparent shadow-sm"
                    } ${isClickable ? "cursor-pointer hover:border-primary/50 hover:shadow-xl hover:-translate-y-1" : "hover:shadow-md"}`}
                  >
                    <span className="text-xs font-bold text-accent uppercase tracking-wider mb-1 block">
                      Schritt {step.number}
                    </span>
                    <h3 className="font-bold text-headline text-lg md:text-xl mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.description}</p>

                    {/* Tips */}
                    <div className={`flex flex-wrap gap-2 ${isRight ? "md:justify-end" : ""}`}>
                      {step.tips.map((tip) => (
                        <span
                          key={tip}
                          className="inline-flex items-center gap-1.5 bg-surface-light px-3 py-1.5 rounded-full text-xs text-body border border-border"
                        >
                          <CheckCircle2 className="h-3 w-3 text-accent shrink-0" />
                          {tip}
                        </span>
                      ))}
                    </div>

                    {step.cta && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:text-accent transition-colors mt-4">
                        {step.cta}
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </div>
                </AnimatedSection>
              </div>

              {/* Spacer */}
              <div className="hidden md:block md:w-[calc(50%-3.5rem)]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const { t } = useTranslation();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"private" | "b2b">("private");

  const steps: Step[] = [
    { number: "1", icon: MapPin, title: t("howItWorks.step1Title"), description: t("howItWorks.step1Desc"), tips: [t("howItWorks.step1Tip1"), t("howItWorks.step1Tip2")], action: "location", cta: t("howItWorks.step1Cta") },
    { number: "2", icon: Search, title: t("howItWorks.step2Title"), description: t("howItWorks.step2Desc"), tips: [t("howItWorks.step2Tip1"), t("howItWorks.step2Tip2")], action: "search", cta: t("howItWorks.step2Cta") },
    { number: "3", icon: ShoppingCart, title: t("howItWorks.step3Title"), description: t("howItWorks.step3Desc"), tips: [t("howItWorks.step3Tip1"), t("howItWorks.step3Tip2")] },
    { number: "4", icon: Mail, title: t("howItWorks.step4Title"), description: t("howItWorks.step4Desc"), tips: [t("howItWorks.step4Tip1"), t("howItWorks.step4Tip2")] },
    { number: "5", icon: Truck, title: t("howItWorks.step5Title"), description: t("howItWorks.step5Desc"), tips: [t("howItWorks.step5Tip1"), t("howItWorks.step5Tip2")] },
  ];

  const b2bSteps: Step[] = [
    { number: "1", icon: Building2, title: t("howItWorks.b2bStep1Title"), description: t("howItWorks.b2bStep1Desc"), tips: [] },
    { number: "2", icon: Search, title: t("howItWorks.b2bStep2Title"), description: t("howItWorks.b2bStep2Desc"), tips: [] },
    { number: "3", icon: Calendar, title: t("howItWorks.b2bStep3Title"), description: t("howItWorks.b2bStep3Desc"), tips: [] },
    { number: "4", icon: CreditCard, title: t("howItWorks.b2bStep4Title"), description: t("howItWorks.b2bStep4Desc"), tips: [] },
  ];

  const requirements = [
    { icon: CreditCard, title: t("howItWorks.reqDepositTitle"), description: t("howItWorks.reqDepositDesc") },
    { icon: FileText, title: t("howItWorks.reqIdTitle"), description: t("howItWorks.reqIdDesc") },
    { icon: AlertCircle, title: t("howItWorks.reqBusinessTitle"), description: t("howItWorks.reqBusinessDesc") },
  ];

  const b2bTips = t("howItWorks.b2bTips", { returnObjects: true }) as string[];

  return (
    <Layout>
      <SEO
        title="So funktioniert's – Equipment mieten | SLT Rental"
        description="In 5 einfachen Schritten Baumaschinen, Anhänger und Event-Equipment mieten. Standort wählen, Artikel suchen, buchen und abholen – so einfach geht's bei SLT Rental."
        canonical="/so-funktionierts"
        keywords="Baumaschinen mieten Anleitung, Equipment mieten NRW, Mietprozess"
        jsonLd={SLT_BREADCRUMB_JSONLD([{ name: "Home", url: "/" }, { name: "So funktioniert's", url: "/so-funktionierts" }])}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary to-slt-blue-hover py-16 lg:py-24 relative overflow-hidden">
        <div className="section-container relative">
          <AnimatedSection>
            <span className="inline-block bg-accent/20 text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-accent/30">
              {t("howItWorks.badge")}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              {t("howItWorks.heroTitle")}
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl text-base md:text-lg">
              {t("howItWorks.heroDesc")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Tab Switcher */}
      <section className="py-6 md:py-8 bg-surface-light border-b border-border">
        <div className="section-container">
          <div className="flex items-stretch justify-center gap-3">
            <button
              onClick={() => setActiveTab("private")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
                activeTab === "private"
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-background text-body border-border hover:border-primary/40"
              }`}
            >
              <User className="h-4 w-4" />
              {t("howItWorks.tabPrivate")}
            </button>
            <button
              onClick={() => setActiveTab("b2b")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
                activeTab === "b2b"
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-background text-body border-border hover:border-primary/40"
              }`}
            >
              <Users className="h-4 w-4" />
              {t("howItWorks.tabB2B")}
            </button>
          </div>
        </div>
      </section>

      {/* Private Steps Timeline */}
      {activeTab === "private" && (
        <>
          <section className="py-12 md:py-16 lg:py-24">
            <div className="section-container">
              <AnimatedSection className="text-center mb-10 md:mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-headline mb-3">
                  {t("howItWorks.heroTitle")}
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  {t("howItWorks.heroDesc")}
                </p>
              </AnimatedSection>

              <TimelineSteps
                steps={steps}
                onLocationClick={() => setLocationDialogOpen(true)}
                onSearchClick={() => setSearchDialogOpen(true)}
              />
            </div>
          </section>

          {/* Weekend */}
          <section className="py-12 lg:py-16 bg-surface-light">
            <div className="section-container">
              <div className="bg-gradient-to-r from-accent to-cta-orange-hover rounded-2xl p-6 md:p-8 lg:p-12 text-accent-foreground">
                <div className="max-w-2xl">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">{t("howItWorks.weekendTitle")}</h2>
                  <p className="text-accent-foreground/90 mb-6 text-sm md:text-base">
                    {t("howItWorks.weekendDesc")}<br />
                    <strong>{t("howItWorks.weekendHighlight")}</strong>
                  </p>
                  <ul className="space-y-2 mb-6">
                    {[t("howItWorks.weekendItem1"), t("howItWorks.weekendItem2"), t("howItWorks.weekendItem3")].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm md:text-base">
                        <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/produkte">
                    <Button className="bg-white text-accent hover:bg-white/90">{t("howItWorks.weekendCta")}</Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* B2B Timeline */}
      {activeTab === "b2b" && (
        <section className="py-12 md:py-16 lg:py-24">
          <div className="section-container">
            <AnimatedSection className="text-center mb-10 md:mb-14">
              <h2 className="text-2xl md:text-3xl font-bold text-headline mb-4">{t("howItWorks.b2bTitle")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{t("howItWorks.b2bDesc")}</p>
            </AnimatedSection>

            <TimelineSteps
              steps={b2bSteps}
              onLocationClick={() => setLocationDialogOpen(true)}
              onSearchClick={() => setSearchDialogOpen(true)}
            />

            {/* Good to know */}
            <AnimatedSection animation="fade-in-up" className="mt-12 md:mt-16 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-surface-light to-background rounded-2xl p-5 md:p-6 lg:p-8 border border-border">
                <h3 className="font-bold text-headline text-lg mb-4">{t("howItWorks.b2bGoodToKnow")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.isArray(b2bTips) && b2bTips.map((tip) => (
                    <span key={tip} className="inline-flex items-center gap-2 bg-background px-3 md:px-4 py-2.5 rounded-xl text-xs md:text-sm text-body border border-border">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />{tip}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link to="/b2b/registrierung">
                    <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover w-full sm:w-auto">
                      {t("howItWorks.b2bCreateAccount")}
                    </Button>
                  </Link>
                  <Link to="/kontakt">
                    <Button variant="outline" className="border-2 hover:border-primary w-full sm:w-auto">
                      {t("howItWorks.b2bRequestAdvice")}
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Requirements */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="section-container">
          <AnimatedSection className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-headline mb-4">{t("howItWorks.requirementsTitle")}</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 lg:gap-8">
            {requirements.map((req, index) => (
              <AnimatedSection key={req.title} delay={index * 100} animation="scale-in">
                <Card className="h-full border-2 border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-5 md:p-6 lg:p-8">
                    <div className="w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mb-4 md:mb-4 lg:mb-5 group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
                      <req.icon className="h-6 w-6 md:h-6 md:w-6 lg:h-7 lg:w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-bold text-headline text-base md:text-base lg:text-lg mb-2 md:mb-2 lg:mb-3">{req.title}</h3>
                    <p className="text-muted-foreground text-sm">{req.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-12 md:py-16 lg:py-20 bg-surface-light">
        <div className="section-container text-center">
          <AnimatedSection>
            <h2 className="text-2xl md:text-3xl font-bold text-headline mb-4">{t("howItWorks.faqTitle")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-sm md:text-base">{t("howItWorks.faqDesc")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/faq">
                <Button variant="outline" size="lg" className="group border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto">
                  {t("howItWorks.faqLink")}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover w-full sm:w-auto" size="lg">
                  {t("howItWorks.faqContact")}
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <ProductSearchDialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen} />
      <LocationSelectDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} />
    </Layout>
  );
}
