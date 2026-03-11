import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, MapPin, Search, Calendar, CreditCard, Package, Building2, User } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Step {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  action?: "location" | "search";
  cta?: string;
}

interface HowItWorksTimelineProps {
  onLocationClick: () => void;
  onSearchClick: () => void;
}

export function HowItWorksTimeline({ onLocationClick, onSearchClick }: HowItWorksTimelineProps) {
  const { t } = useTranslation();
  const [howItWorksTab, setHowItWorksTab] = useState<"private" | "b2b">("private");
  const [activeStep, setActiveStep] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps: Step[] = [
    { number: "1", icon: MapPin, title: t("steps.step1Title"), description: t("steps.step1Desc"), action: "location", cta: t("steps.step1Cta") },
    { number: "2", icon: Search, title: t("steps.step2Title"), description: t("steps.step2Desc"), action: "search", cta: t("steps.step2Cta") },
    { number: "3", icon: Calendar, title: t("steps.step3Title"), description: t("steps.step3Desc") },
    { number: "4", icon: CreditCard, title: t("steps.step4Title"), description: t("steps.step4Desc") },
    { number: "5", icon: Package, title: t("steps.step5Title"), description: t("steps.step5Desc") },
  ];

  const b2bSteps: Step[] = [
    { number: "1", icon: Building2, title: t("howItWorks.b2bStep1Title"), description: t("howItWorks.b2bStep1Desc") },
    { number: "2", icon: Search, title: t("howItWorks.b2bStep2Title"), description: t("howItWorks.b2bStep2Desc") },
    { number: "3", icon: Calendar, title: t("howItWorks.b2bStep3Title"), description: t("howItWorks.b2bStep3Desc") },
    { number: "4", icon: CreditCard, title: t("howItWorks.b2bStep4Title"), description: t("howItWorks.b2bStep4Desc") },
  ];

  const currentSteps = howItWorksTab === "private" ? steps : b2bSteps;

  // Scroll-based active step detection
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
      { threshold: 0.6, rootMargin: "-10% 0px -30% 0px" }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [howItWorksTab]);

  const handleStepClick = (step: Step) => {
    if (step.action === "location") onLocationClick();
    else if (step.action === "search") onSearchClick();
  };

  return (
    <section className="py-20 lg:py-28 bg-surface-light overflow-hidden">
      <div className="section-container">
        {/* Header */}
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

        {/* Toggle */}
        <div className="flex items-stretch justify-center gap-3 mb-12">
          <button
            onClick={() => { setHowItWorksTab("private"); setActiveStep(0); }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
              howItWorksTab === "private"
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-background text-body border-border hover:border-primary/40"
            }`}
          >
            <User className="h-4 w-4" />
            {t("howItWorks.tabPrivate", "Privatkunden")}
          </button>
          <button
            onClick={() => { setHowItWorksTab("b2b"); setActiveStep(0); }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
              howItWorksTab === "b2b"
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-background text-body border-border hover:border-primary/40"
            }`}
          >
            <Building2 className="h-4 w-4" />
            {t("howItWorks.tabB2B", "Geschäftskunden")}
          </button>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-px" />

          {/* Progress fill */}
          <div
            className="absolute left-6 md:left-1/2 top-0 w-0.5 bg-primary md:-translate-x-px transition-all duration-700 ease-out"
            style={{
              height: `${((activeStep + 1) / currentSteps.length) * 100}%`,
            }}
          />

          {/* Steps */}
          <div className="space-y-8 md:space-y-12">
            {currentSteps.map((step, index) => {
              const isActive = index <= activeStep;
              const isRight = index % 2 !== 0;
              const Icon = step.icon;
              const isClickable = !!step.action;

              return (
                <div
                  key={`${howItWorksTab}-${step.number}`}
                  ref={(el) => { stepRefs.current[index] = el; }}
                  className={`relative flex items-start gap-4 md:gap-0 ${
                    isRight ? "md:flex-row-reverse" : "md:flex-row"
                  }`}
                >
                  {/* Timeline node - centered on md */}
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
                    {/* Step number badge */}
                    <span
                      className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all duration-500 ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Content card */}
                  <div
                    className={`flex-1 md:w-[calc(50%-3rem)] ${
                      isRight ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"
                    }`}
                  >
                    <AnimatedSection delay={index * 120} animation="fade-in-up">
                      <div
                        onClick={isClickable ? () => handleStepClick(step) : undefined}
                        className={`bg-card rounded-2xl p-5 border-2 transition-all duration-500 group ${
                          isActive
                            ? "border-primary/30 shadow-lg shadow-primary/5"
                            : "border-transparent shadow-sm"
                        } ${isClickable ? "cursor-pointer hover:border-primary/50 hover:shadow-xl hover:-translate-y-1" : "hover:shadow-md"}`}
                      >
                        <span className="text-xs font-bold text-accent uppercase tracking-wider mb-2 block">
                          {t("steps.step")} {step.number}
                        </span>
                        <h3 className="font-bold text-headline text-lg mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                        {step.cta && (
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:text-accent transition-colors mt-3">
                            {step.cta}
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        )}
                      </div>
                    </AnimatedSection>
                  </div>

                  {/* Spacer for the other side on md+ */}
                  <div className="hidden md:block md:w-[calc(50%-3rem)]" />
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
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
  );
}
