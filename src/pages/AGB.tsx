import { Layout } from "@/components/layout";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useTranslation } from "react-i18next";

export default function AGB() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="bg-muted/30 py-12 md:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {t("agb.title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("agb.subtitle")}
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="prose prose-slate max-w-none">
          {/* Section I */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("agbPage.i.title")}</h2>
            <p className="text-body mb-4">{t("agbPage.i.p1")}</p>
            <p className="text-body mb-4">{t("agbPage.i.p2")}</p>
            <p className="text-body">{t("agbPage.i.p3")}</p>
          </section>

          {/* Section II */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("agbPage.ii.title")}</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ii.2_1_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.ii.2_1")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ii.2_2_title")}</h3>
            <p className="text-body mb-4">{t("agbPage.ii.2_2a")}</p>
            <p className="text-body mb-6">{t("agbPage.ii.2_2b")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ii.2_3_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.ii.2_3")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ii.2_4_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.ii.2_4")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ii.2_5_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.ii.2_5")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ii.2_6_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.ii.2_6")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ii.2_7_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.ii.2_7")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ii.2_8_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.ii.2_8")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ii.2_9_title")}</h3>
            <p className="text-body mb-4">{t("agbPage.ii.2_9a")}</p>
            <p className="text-body mb-6">{t("agbPage.ii.2_9b")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ii.2_10_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.ii.2_10")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ii.2_11_title")}</h3>
            <p className="text-body">{t("agbPage.ii.2_11")}</p>
          </section>

          {/* Section III */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("agbPage.iii.title")}</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iii.3_1_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.iii.3_1")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iii.3_1a_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.iii.3_1a")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iii.3_2_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.iii.3_2")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iii.3_3_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.iii.3_3")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iii.3_4_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.iii.3_4")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iii.3_5_title")}</h3>
            <p className="text-body mb-4">{t("agbPage.iii.3_5a")}</p>
            <p className="text-body mb-6">{t("agbPage.iii.3_5b")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iii.3_6_title")}</h3>
            <p className="text-body mb-4">{t("agbPage.iii.3_6_intro")}</p>
            <ul className="list-disc list-inside text-body mb-6 space-y-2 ml-4">
              {(t("agbPage.iii.3_6_items", { returnObjects: true }) as string[]).map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <p className="text-body mb-4">{t("agbPage.iii.3_6b")}</p>
            <p className="text-body mb-6">{t("agbPage.iii.3_6c")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iii.3_7_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.iii.3_7")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iii.3_8_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.iii.3_8")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iii.3_9_title")}</h3>
            <p className="text-body">{t("agbPage.iii.3_9")}</p>
          </section>

          {/* Section IV */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("agbPage.iv.title")}</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iv.4_1_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.iv.4_1")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iv.4_2_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.iv.4_2")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iv.4_3_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.iv.4_3")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iv.4_4_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.iv.4_4")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.iv.4_5_title")}</h3>
            <p className="text-body mb-4">{t("agbPage.iv.4_5_intro")}</p>
            <ul className="list-disc list-inside text-body mb-4 space-y-2 ml-4">
              {(t("agbPage.iv.4_5_items", { returnObjects: true }) as string[]).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-body">{t("agbPage.iv.4_5_outro")}</p>
          </section>

          {/* Section V */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("agbPage.v.title")}</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.v.5_1_title")}</h3>
            <p className="text-body mb-4">{t("agbPage.v.5_1a")}</p>
            <p className="text-body mb-4">{t("agbPage.v.5_1b")}</p>
            <p className="text-body mb-4">{t("agbPage.v.5_1c")}</p>
            <p className="text-body mb-6">{t("agbPage.v.5_1d")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.v.5_2_title")}</h3>
            <p className="text-body">{t("agbPage.v.5_2")}</p>
          </section>

          {/* Section VI */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("agbPage.vi.title")}</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.vi.6_1_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.vi.6_1")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.vi.6_2_title")}</h3>
            <p className="text-body mb-4">{t("agbPage.vi.6_2_intro")}</p>
            <ul className="list-disc list-inside text-body mb-6 space-y-2 ml-4">
              {(t("agbPage.vi.6_2_items", { returnObjects: true }) as string[]).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.vi.6_3_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.vi.6_3")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.vi.6_4_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.vi.6_4")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.vi.6_5_title")}</h3>
            <p className="text-body">{t("agbPage.vi.6_5")}</p>
          </section>

          {/* Section VII */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("agbPage.vii.title")}</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.vii.7_1_title")}</h3>
            <p className="text-body mb-4">{t("agbPage.vii.7_1a")}</p>
            <p className="text-body mb-6">{t("agbPage.vii.7_1b")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.vii.7_2_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.vii.7_2")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.vii.7_3_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.vii.7_3")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.vii.7_4_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.vii.7_4")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.vii.7_5_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.vii.7_5")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.vii.7_6_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.vii.7_6")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.vii.7_7_title")}</h3>
            <p className="text-body mb-4">{t("agbPage.vii.7_7a")}</p>
            <p className="text-body mb-6">{t("agbPage.vii.7_7b")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.vii.7_8_title")}</h3>
            <p className="text-body">{t("agbPage.vii.7_8")}</p>
          </section>

          {/* Section VIII */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("agbPage.viii.title")}</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.viii.8_1_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.viii.8_1")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.viii.8_2_title")}</h3>
            <p className="text-body mb-4">{t("agbPage.viii.8_2a")}</p>
            <p className="text-body mb-6">{t("agbPage.viii.8_2b")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.viii.8_3_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.viii.8_3")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.viii.8_4_title")}</h3>
            <p className="text-body">{t("agbPage.viii.8_4")}</p>
          </section>

          {/* Section IX */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("agbPage.ix.title")}</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ix.9_1_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.ix.9_1")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ix.9_2_title")}</h3>
            <p className="text-body mb-4">{t("agbPage.ix.9_2a")}</p>
            <p className="text-body mb-6">{t("agbPage.ix.9_2b")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ix.9_3_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.ix.9_3")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ix.9_4_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.ix.9_4")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ix.9_5_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.ix.9_5")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ix.9_6_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.ix.9_6")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.ix.9_7_title")}</h3>
            <p className="text-body">{t("agbPage.ix.9_7")}</p>
          </section>

          {/* Section X */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("agbPage.x.title")}</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.x.10_1_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.x.10_1")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.x.10_2_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.x.10_2")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.x.10_3_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.x.10_3")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.x.10_4_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.x.10_4")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.x.10_5_title")}</h3>
            <p className="text-body">{t("agbPage.x.10_5")}</p>
          </section>

          {/* Section XI */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("agbPage.xi.title")}</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.xi.11_1_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.xi.11_1")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.xi.11_2_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.xi.11_2")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.xi.11_3_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.xi.11_3")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.xi.11_4_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.xi.11_4")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.xi.11_5_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.xi.11_5")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.xi.11_6_title")}</h3>
            <p className="text-body mb-6">{t("agbPage.xi.11_6")}</p>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("agbPage.xi.11_7_title")}</h3>
            <p className="text-body">{t("agbPage.xi.11_7")}</p>
          </section>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-body font-semibold mb-2">{t("agb.validFrom")}</p>
            <p className="text-body mb-4">{t("agb.location")}</p>
            <p className="text-body font-semibold">{t("agb.companyFooter")}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
