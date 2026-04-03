import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function VerkaufDanke() {
  const { t } = useTranslation();

  return (
    <Layout>
      <SEO
        title={t("verkauf.thanks.title") + " – SLT Rental"}
        description={t("verkauf.thanks.message")}
        noIndex
      />
      <section className="py-24 lg:py-32 bg-background">
        <div className="section-container text-center max-w-xl mx-auto">
          <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-6" />
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t("verkauf.thanks.title")}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t("verkauf.thanks.message")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/mieten">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                {t("verkauf.thanks.toRentals")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline">
                {t("verkauf.thanks.toHome")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
