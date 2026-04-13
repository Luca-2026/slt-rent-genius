import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { blogArticles } from "@/data/blogArticles";
import { Calendar } from "lucide-react";

const Ratgeber = () => {
  const breadcrumbJsonLd = SLT_BREADCRUMB_JSONLD([
    { name: "Startseite", url: "/" },
    { name: "Ratgeber", url: "/ratgeber" },
  ]);

  return (
    <Layout>
      <SEO
        title="Ratgeber & Magazin – Tipps rund ums Mieten | SLT Rental"
        description="Alle Mietkategorien von SLT Rental auf einen Blick: Bagger, Anhänger, Arbeitsbühnen, PA-Anlagen, Geschirr & mehr. Über 1.700 Mietprodukte an 3 Standorten in NRW."
        canonical="/ratgeber"
        jsonLd={breadcrumbJsonLd}
      />

      <section className="bg-accent/30 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ratgeber & Magazin
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Praxis-Tipps, Checklisten und Wissenswertes rund ums Mieten von
            Baumaschinen, Anhängern und Event-Equipment in NRW.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogArticles.map((article) => (
              <Link
                key={article.slug}
                to={`/ratgeber/${article.slug}`}
                className="group block rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[16/9] bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {article.category}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {article.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {article.teaser}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <time dateTime={article.date}>
                      {new Date(article.date).toLocaleDateString("de-DE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Ratgeber;
