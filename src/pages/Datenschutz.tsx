import { Layout } from "@/components/layout";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Shield, User, Mail, Phone, MapPin, Cookie, Lock, FileText, Clock, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Datenschutz() {
  const { t } = useTranslation();

  const s3Data = t("datenschutz.s3Data", { returnObjects: true }) as string[];
  const s4Items = t("datenschutz.s4Items", { returnObjects: true }) as { basis: string; purpose: string }[];
  const s11Rights = t("datenschutz.s11Rights", { returnObjects: true }) as { article: string; right: string }[];

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="section-container py-16 md:py-24">
          <AnimatedSection animation="fade-in-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">{t("datenschutz.title")}</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mt-4">{t("datenschutz.subtitle")}</p>
          </AnimatedSection>
        </div>
      </div>

      <div className="section-container py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* 1. Verantwortlicher */}
          <AnimatedSection animation="fade-in-up" delay={100}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t("datenschutz.s1Title")}</h2>
              </div>
              <div className="bg-muted/50 rounded-xl p-6">
                <p className="font-semibold text-foreground text-lg mb-4">SLT Technology Group GmbH & Co. KG</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-foreground">Anrather Straße 291</p>
                      <p className="text-muted-foreground">47807 Krefeld</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0" />
                      <a href="tel:+4921514179902" className="text-primary hover:underline">+49 (0) 2151 - 417 99 02</a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary shrink-0" />
                      <a href="mailto:info@slt-rental.de" className="text-primary hover:underline">info@slt-rental.de</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* 2. Datenschutzbeauftragter */}
          <AnimatedSection animation="fade-in-up" delay={150}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t("datenschutz.s2Title")}</h2>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">Benedikt Nöchel</p>
                  <p className="text-muted-foreground">Anrather Straße 291, 47807 Krefeld</p>
                  <a href="mailto:datenschutz@slt-rental.de" className="text-primary hover:underline flex items-center gap-2 mt-2">
                    <Mail className="h-4 w-4" />datenschutz@slt-rental.de
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* 3. Datenverarbeitung */}
          <AnimatedSection animation="fade-in-up" delay={200}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t("datenschutz.s3Title")}</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">{t("datenschutz.s3Intro")}</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>{t("datenschutz.s3Item1")}</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>{t("datenschutz.s3Item2")}</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>{t("datenschutz.s3Item3")}</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>{t("datenschutz.s3Item4")}</li>
                  </ul>
                </div>
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-foreground mb-3">{t("datenschutz.s3DataTitle")}</h3>
                  <div className="grid sm:grid-cols-2 gap-2 text-muted-foreground">
                    {Array.isArray(s3Data) && s3Data.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary shrink-0" /><span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* 4. Zwecke und Rechtsgrundlagen */}
          <AnimatedSection animation="fade-in-up" delay={250}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">4</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t("datenschutz.s4Title")}</h2>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground mb-4">{t("datenschutz.s4Intro")}</p>
                <div className="grid gap-4">
                  {Array.isArray(s4Items) && s4Items.map((item) => (
                    <div key={item.basis} className="flex items-start gap-3 bg-muted/50 rounded-lg p-4">
                      <Scale className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <span className="font-mono text-sm text-primary">{item.basis}</span>
                        <p className="text-muted-foreground">{item.purpose}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* 5. Cookies */}
          <AnimatedSection animation="fade-in-up" delay={300}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">5</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t("datenschutz.s5Title")}</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>{t("datenschutz.s5Desc")}</p>
                <div className="grid sm:grid-cols-2 gap-4 my-6">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Cookie className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">{t("datenschutz.s5TechCookies")}</span>
                    </div>
                    <p className="text-sm">{t("datenschutz.s5TechDesc")}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Cookie className="h-5 w-5 text-accent" />
                      <span className="font-semibold text-foreground">{t("datenschutz.s5AnalyticsCookies")}</span>
                    </div>
                    <p className="text-sm">{t("datenschutz.s5AnalyticsDesc")}</p>
                  </div>
                </div>
                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <p className="text-foreground font-medium"><strong>{t("datenschutz.s5Revoke")}</strong></p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* 6-9 */}
          {[
            { num: "6", title: t("datenschutz.s6Title"), content: t("datenschutz.s6Desc") },
            { num: "7", title: t("datenschutz.s7Title"), content: `${t("datenschutz.s7P1")}\n\n${t("datenschutz.s7P2")}` },
            { num: "8", title: t("datenschutz.s8Title"), content: `${t("datenschutz.s8P1")}\n\n${t("datenschutz.s8P2")}` },
            { num: "9", title: t("datenschutz.s9Title"), content: t("datenschutz.s9Desc") },
          ].map((section, i) => (
            <AnimatedSection key={section.num} animation="fade-in-up" delay={350 + i * 50}>
              <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{section.num}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                </div>
                {section.content.split("\n\n").map((p, pi) => (
                  <p key={pi} className="text-muted-foreground mb-4 last:mb-0">{p}</p>
                ))}
              </div>
            </AnimatedSection>
          ))}

          {/* 10. Speicherdauer */}
          <AnimatedSection animation="fade-in-up" delay={550}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t("datenschutz.s10Title")}</h2>
              </div>
              <p className="text-muted-foreground">{t("datenschutz.s10Desc")}</p>
            </div>
          </AnimatedSection>

          {/* 11. Ihre Rechte */}
          <AnimatedSection animation="fade-in-up" delay={600}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Scale className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t("datenschutz.s11Title")}</h2>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground">{t("datenschutz.s11Intro")}</p>
                <div className="grid gap-3">
                  {Array.isArray(s11Rights) && s11Rights.map((item) => (
                    <div key={item.article} className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
                      <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded shrink-0">{item.article}</span>
                      <span className="text-muted-foreground">{item.right}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 mt-6">
                  <p className="text-foreground">{t("datenschutz.s11Contact")}</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* 12. Sicherheit */}
          <AnimatedSection animation="fade-in-up" delay={650}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t("datenschutz.s12Title")}</h2>
              </div>
              <p className="text-muted-foreground">{t("datenschutz.s12Desc")}</p>
            </div>
          </AnimatedSection>

          {/* 13. Änderungen */}
          <AnimatedSection animation="fade-in-up" delay={700}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t("datenschutz.s13Title")}</h2>
              </div>
              <p className="text-muted-foreground">{t("datenschutz.s13Desc")}</p>
            </div>
          </AnimatedSection>

          {/* Stand */}
          <AnimatedSection animation="fade-in-up" delay={750}>
            <div className="text-center py-8 border-t border-border">
              <p className="text-muted-foreground">
                <strong className="text-foreground">{t("datenschutz.asOf")}</strong> {t("datenschutz.date")}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </Layout>
  );
}