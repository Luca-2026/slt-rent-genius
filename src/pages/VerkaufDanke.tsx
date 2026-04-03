import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function VerkaufDanke() {
  return (
    <Layout>
      <SEO
        title="Danke für Ihre Kaufanfrage – SLT Rental"
        description="Wir haben Ihre Kaufanfrage erhalten und melden uns innerhalb von 24 Stunden."
        noIndex
      />
      <section className="py-24 lg:py-32 bg-background">
        <div className="section-container text-center max-w-xl mx-auto">
          <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-6" />
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Danke für Ihre Kaufanfrage!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Wir haben Ihre Anfrage erhalten und melden uns innerhalb von 24 Stunden (Mo–Fr) persönlich bei Ihnen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/mieten">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Zum Mietangebot <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline">
                Zur Startseite
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
