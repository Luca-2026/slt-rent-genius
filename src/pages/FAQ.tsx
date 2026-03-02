import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, MessageCircle } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useTranslation } from "react-i18next";

export default function FAQ() {
  const { t } = useTranslation();

  const faqCategories = [
    {
      id: "miete",
      title: t("faq.cat1Title"),
      questions: [
        { q: t("faq.cat1Q1"), a: t("faq.cat1A1") },
        { q: t("faq.cat1Q2"), a: t("faq.cat1A2") },
        { q: t("faq.cat1Q3"), a: t("faq.cat1A3") },
        { q: t("faq.cat1Q4"), a: t("faq.cat1A4") },
      ],
    },
    {
      id: "buchung",
      title: t("faq.cat2Title"),
      questions: [
        { q: t("faq.cat2Q1"), a: t("faq.cat2A1") },
        { q: t("faq.cat2Q2"), a: t("faq.cat2A2") },
        { q: t("faq.cat2Q3"), a: t("faq.cat2A3") },
        { q: t("faq.cat2Q4"), a: t("faq.cat2A4") },
      ],
    },
    {
      id: "abholung",
      title: t("faq.cat3Title"),
      questions: [
        { q: t("faq.cat3Q1"), a: t("faq.cat3A1") },
        { q: t("faq.cat3Q2"), a: t("faq.cat3A2") },
        { q: t("faq.cat3Q3"), a: t("faq.cat3A3") },
        { q: t("faq.cat3Q4"), a: t("faq.cat3A4") },
      ],
    },
    {
      id: "b2b",
      title: t("faq.cat4Title"),
      questions: [
        { q: t("faq.cat4Q1"), a: t("faq.cat4A1") },
        { q: t("faq.cat4Q2"), a: t("faq.cat4A2") },
        { q: t("faq.cat4Q3"), a: t("faq.cat4A3") },
      ],
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">{t("faq.heroTitle")}</h1>
            <p className="text-primary-foreground/80 max-w-2xl mb-6">{t("faq.heroDesc")}</p>
          </AnimatedSection>
          <AnimatedSection animation="fade-in-up" delay={200}>
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input type="text" placeholder={t("faq.searchPlaceholder")} className="w-full pl-10 pr-4 py-3 rounded-lg bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            {faqCategories.map((category, catIndex) => (
              <AnimatedSection key={category.id} animation="fade-in-up" delay={catIndex * 100}>
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-headline mb-4 pb-2 border-b border-border">{category.title}</h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((item, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-left text-headline hover:text-primary py-4">{item.q}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">{item.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Still Questions */}
      <section className="py-12 lg:py-16 bg-surface-light">
        <div className="section-container text-center">
          <AnimatedSection animation="scale-in">
            <MessageCircle className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">{t("faq.ctaTitle")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">{t("faq.ctaDesc")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/kontakt">
                <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">{t("faq.ctaContact")}</Button>
              </Link>
              <a href="tel:+4921514179904">
                <Button variant="outline">{t("faq.ctaCall")}</Button>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}