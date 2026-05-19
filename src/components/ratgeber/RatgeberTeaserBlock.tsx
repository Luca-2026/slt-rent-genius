import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import type { BlogArticle } from "@/data/blogArticles";

interface RatgeberTeaserBlockProps {
  articles: BlogArticle[];
  /** Überschrift über dem Block. */
  heading?: string;
  /** Kurzer Untertitel/Lead. */
  subheading?: string;
}

/**
 * Wiederverwendbarer Teaserblock mit 1–3 Ratgeber-Karten.
 * Wird auf Kategorie- und Startseite eingesetzt, um interne Verlinkung
 * der Ratgeber-Artikel zu stärken (SEO: PageRank-Verteilung).
 */
export function RatgeberTeaserBlock({
  articles,
  heading = "Aus unserem Ratgeber",
  subheading,
}: RatgeberTeaserBlockProps) {
  if (!articles?.length) return null;

  return (
    <section className="py-10 sm:py-14 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
              {heading}
            </h2>
            {subheading && (
              <p className="text-sm text-muted-foreground mt-1">{subheading}</p>
            )}
          </div>
          <Link
            to="/ratgeber"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
          >
            Alle Ratgeber <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a.slug}
              to={`/ratgeber/${a.slug}`}
              className="group block bg-background border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/40 transition-all"
            >
              <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
                {a.category}
              </p>
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                {a.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{a.teaser}</p>
              <span className="inline-flex items-center gap-1 text-sm text-primary mt-3 group-hover:gap-2 transition-all">
                Weiterlesen <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to="/ratgeber" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Alle Ratgeber <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default RatgeberTeaserBlock;
