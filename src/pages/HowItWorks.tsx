import { useState } from "react";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Calendar, Search, ShoppingCart, Mail, Truck, CreditCard, FileText, AlertCircle, CheckCircle2, ArrowRight, Users, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductSearchDialog } from "@/components/home/ProductSearchDialog";
import { LocationSelectDialog } from "@/components/solutions/LocationSelectDialog";
import { MapPin } from "lucide-react";

export default function HowItWorks() {
  const { t } = useTranslation();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"private" | "b2b">("private");

  const steps = [
    { number: "1", icon: MapPin, title: t("howItWorks.step1Title"), description: t("howItWorks.step1Desc"), tips: [t("howItWorks.step1Tip1"), t("howItWorks.step1Tip2")], action: "location" as const, cta: t("howItWorks.step1Cta") },
    { number: "2", icon: Search, title: t("howItWorks.step2Title"), description: t("howItWorks.step2Desc"), tips: [t("howItWorks.step2Tip1"), t("howItWorks.step2Tip2")], action: "search" as const, cta: t("howItWorks.step2Cta") },
    { number: "3", icon: ShoppingCart, title: t("howItWorks.step3Title"), description: t("howItWorks.step3Desc"), tips: [t("howItWorks.step3Tip1"), t("howItWorks.step3Tip2")] },
    { number: "4", icon: Mail, title: t("howItWorks.step4Title"), description: t("howItWorks.step4Desc"), tips: [t("howItWorks.step4Tip1"), t("howItWorks.step4Tip2")] },
    { number: "5", icon: Truck, title: t("howItWorks.step5Title"), description: t("howItWorks.step5Desc"), tips: [t("howItWorks.step5Tip1"), t("howItWorks.step5Tip2")] },
  ];

  const requirements = [
    { icon: CreditCard, title: t("howItWorks.reqDepositTitle"), description: t("howItWorks.reqDepositDesc") },
    { icon: FileText, title: t("howItWorks.reqIdTitle"), description: t("howItWorks.reqIdDesc") },
    { icon: AlertCircle, title: t("howItWorks.reqBusinessTitle"), description: t("howItWorks.reqBusinessDesc") },
  ];

  const b2bSteps = [
    { number: "1", title: t("howItWorks.b2bStep1Title"), description: t("howItWorks.b2bStep1Desc") },
    { number: "2", title: t("howItWorks.b2bStep2Title"), description: t("howItWorks.b2bStep2Desc") },
    { number: "3", title: t("howItWorks.b2bStep3Title"), description: t("howItWorks.b2bStep3Desc") },
    { number: "4", title: t("howItWorks.b2bStep4Title"), description: t("howItWorks.b2bStep4Desc") },
  ];

  const b2bTips = t("howItWorks.b2bTips", { returnObjects: true }) as string[];

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary to-slt-blue-hover py-16 lg:py-24 relative overflow-hidden">
        <div className="section-container relative">
          <AnimatedSection>
            <span className="inline-block bg-accent/20 text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-accent/30">{t("howItWorks.badge")}</span>
            <h1 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-4">{t("howItWorks.heroTitle")}</h1>
            <p className="text-primary-foreground/80 max-w-2xl text-lg">{t("howItWorks.heroDesc")}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Tab Switcher */}
      <section className="py-8 lg:py-10 bg-surface-light border-b border-border">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab("private")}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 border-2 w-full sm:w-auto justify-center ${
                activeTab === "private"
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                  : "bg-background text-body border-border hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <User className="h-5 w-5" />
              {t("howItWorks.tabPrivate")}
            </button>
            <button
              onClick={() => setActiveTab("b2b")}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 border-2 w-full sm:w-auto justify-center ${
                activeTab === "b2b"
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                  : "bg-background text-body border-border hover:border-primary/40 hover:shadow-md"
              }`}
            >
              <Users className="h-5 w-5" />
              {t("howItWorks.tabB2B")}
            </button>
          </div>
        </div>
      </section>

      {/* Private Steps */}
      {activeTab === "private" && (
        <>
          <section className="py-16 lg:py-24">
            <div className="section-container">
              <div className="space-y-16">
                {steps.map((step, index) => (
                  <AnimatedSection key={step.number} delay={index * 100} animation="fade-in-up">
                    <div className="relative">
                      <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="flex items-center gap-6 lg:w-56 shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-accent to-cta-orange-hover text-accent-foreground rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg">{step.number}</div>
                          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center hidden lg:flex"><step.icon className="h-7 w-7 text-primary" /></div>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-surface-light to-background rounded-2xl p-6 lg:p-8 border border-border">
                          <h2 className="text-xl lg:text-2xl font-bold text-headline mb-3">{step.title}</h2>
                          <p className="text-muted-foreground mb-5 max-w-2xl">{step.description}</p>
                          <div className="flex flex-wrap gap-3">
                            {step.tips.map((tip) => (
                              <span key={tip} className="inline-flex items-center gap-2 bg-background px-4 py-2 rounded-full text-sm text-body border border-border hover:border-accent/50 transition-colors">
                                <CheckCircle2 className="h-4 w-4 text-accent" />{tip}
                              </span>
                            ))}
                          </div>
                          {step.action === "location" && step.cta && (
                            <button onClick={() => setLocationDialogOpen(true)} className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-primary hover:text-accent transition-colors group/cta cursor-pointer">
                              {step.cta}
                              <ArrowRight className="h-4 w-4 group-hover/cta:translate-x-1 transition-transform" />
                            </button>
                          )}
                          {step.action === "search" && step.cta && (
                            <button onClick={() => setSearchDialogOpen(true)} className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-primary hover:text-accent transition-colors group/cta cursor-pointer">
                              {step.cta}
                              <ArrowRight className="h-4 w-4 group-hover/cta:translate-x-1 transition-transform" />
                            </button>
                          )}
                        </div>
                      </div>
                      {index < steps.length - 1 && <div className="hidden lg:block absolute left-8 top-24 w-0.5 h-20 bg-gradient-to-b from-accent to-transparent" />}
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>

          {/* Weekend */}
          <section className="py-12 lg:py-16 bg-surface-light">
            <div className="section-container">
              <div className="bg-gradient-to-r from-accent to-cta-orange-hover rounded-2xl p-8 lg:p-12 text-accent-foreground">
                <div className="max-w-2xl">
                  <h2 className="text-2xl lg:text-3xl font-bold mb-4">{t("howItWorks.weekendTitle")}</h2>
                  <p className="text-accent-foreground/90 mb-6">{t("howItWorks.weekendDesc")}<br /><strong>{t("howItWorks.weekendHighlight")}</strong></p>
                  <ul className="space-y-2 mb-6">
                    {[t("howItWorks.weekendItem1"), t("howItWorks.weekendItem2"), t("howItWorks.weekendItem3")].map(item => (
                      <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /><span>{item}</span></li>
                    ))}
                  </ul>
                  <Link to="/produkte"><Button className="bg-white text-accent hover:bg-white/90">{t("howItWorks.weekendCta")}</Button></Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* B2B */}
      {activeTab === "b2b" && (
        <section className="py-16 lg:py-24">
          <div className="section-container">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">{t("howItWorks.b2bTitle")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{t("howItWorks.b2bDesc")}</p>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {b2bSteps.map((step, index) => (
                <AnimatedSection key={step.number} delay={index * 100} animation="fade-in-up">
                  <Card className="h-full border-2 border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 lg:p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-lg shrink-0">{step.number}</div>
                        <h3 className="font-bold text-headline text-lg">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection animation="fade-in-up">
              <div className="bg-gradient-to-br from-surface-light to-background rounded-2xl p-6 lg:p-8 border border-border">
                <h3 className="font-bold text-headline text-lg mb-4">{t("howItWorks.b2bGoodToKnow")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.isArray(b2bTips) && b2bTips.map((tip) => (
                    <span key={tip} className="inline-flex items-center gap-2 bg-background px-4 py-2.5 rounded-xl text-sm text-body border border-border">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />{tip}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link to="/b2b/registrierung"><Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">{t("howItWorks.b2bCreateAccount")}</Button></Link>
                  <Link to="/kontakt"><Button variant="outline" className="border-2 hover:border-primary">{t("howItWorks.b2bRequestAdvice")}</Button></Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Requirements */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">{t("howItWorks.requirementsTitle")}</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {requirements.map((req, index) => (
              <AnimatedSection key={req.title} delay={index * 100} animation="scale-in">
                <Card className="h-full border-2 border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mb-5 group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
                      <req.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-bold text-headline text-lg mb-3">{req.title}</h3>
                    <p className="text-muted-foreground">{req.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 lg:py-20 bg-surface-light">
        <div className="section-container text-center">
          <AnimatedSection>
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">{t("howItWorks.faqTitle")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">{t("howItWorks.faqDesc")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/faq"><Button variant="outline" size="lg" className="group border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground">{t("howItWorks.faqLink")} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Button></Link>
              <Link to="/kontakt"><Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover" size="lg">{t("howItWorks.faqContact")}</Button></Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
      <ProductSearchDialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen} />
      <LocationSelectDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} />
    </Layout>
  );
}
