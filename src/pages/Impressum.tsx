import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Phone, Mail, MapPin, Building2, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Impressum() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="section-container py-16 md:py-24">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t("impressum.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{t("impressum.subtitle")}</p>
          </AnimatedSection>
        </div>
      </div>

      <div className="section-container py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Company Information */}
          <AnimatedSection animation="fade-in-up" delay={100}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{t("impressum.companyInfoTitle")}</h2>
                  <p className="text-muted-foreground">{t("impressum.companyInfoSub")}</p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground">{t("impressum.registeredBrand")}</p>
                <p className="text-xl font-semibold text-foreground">{t("impressum.companyName")}</p>
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Anrather Straße 291</p>
                        <p className="text-muted-foreground">DE-47807 Krefeld</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-foreground">Fon: +49 (0) 2151 - 417 99 02</p>
                        <p className="text-muted-foreground">Fax: +49 (0) 2151 - 417 99 04</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary shrink-0" />
                      <a href="mailto:info@slt-rental.de" className="text-primary hover:underline">info@slt-rental.de</a>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground pt-4">HRA 7075 Amtsgericht Krefeld</p>
              </div>
            </div>
          </AnimatedSection>

          {/* Geschäftsführer */}
          <AnimatedSection animation="fade-in-up" delay={200}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t("impressum.ceoTitle")}</h2>
              <p className="text-lg text-foreground">Benedikt Nöchel</p>
            </div>
          </AnimatedSection>

          {/* Persönlich haftende Gesellschafterin */}
          <AnimatedSection animation="fade-in-up" delay={300}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">{t("impressum.liabilityPartnerTitle")}</h2>
              <div className="space-y-4">
                <p className="text-lg font-semibold text-foreground">SLT Management GmbH</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Anrather Straße 291</p>
                        <p className="text-muted-foreground">DE-47807 Krefeld</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-foreground">Fon: +49 (0) 2151 - 417 99 03</p>
                        <p className="text-muted-foreground">Fax: +49 (0) 2151 - 417 99 04</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary shrink-0" />
                      <a href="mailto:info@slt-m.de" className="text-primary hover:underline">info@slt-m.de</a>
                    </div>
                  </div>
                </div>
                <div className="pt-4 space-y-1">
                  <p className="text-muted-foreground">HRB 18191 Amtsgericht Krefeld</p>
                  <p className="text-muted-foreground">{t("impressum.courtOf")}</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Haftungsausschluss */}
          <AnimatedSection animation="fade-in-up" delay={400}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">{t("impressum.disclaimerTitle")}</h2>
              <div className="prose prose-gray max-w-none space-y-4 text-muted-foreground">
                <p>{t("impressum.disclaimerP1")}</p>
                <p>{t("impressum.disclaimerP2")}</p>
                <p>{t("impressum.disclaimerP3")}</p>
                <p>{t("impressum.disclaimerP4")}</p>
                <p>{t("impressum.disclaimerP5")}</p>
                <p>{t("impressum.disclaimerP6")}</p>
              </div>
            </div>
          </AnimatedSection>

          {/* Versicherung */}
          <AnimatedSection animation="fade-in-up" delay={500}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{t("impressum.insuranceTitle")}</h2>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">{t("impressum.insuranceCompany")}</p>
                <p className="text-muted-foreground">
                  <span className="font-medium">{t("impressum.insuranceScope")}</span> {t("impressum.insuranceCountry")}
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </Layout>
  );
}