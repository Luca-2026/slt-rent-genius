import { Link } from "react-router-dom";
import { ChevronRight, Image as ImageIcon, Users, Bath, Flame } from "lucide-react";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import {
  CAMPING_CATEGORY,
  CARAONE_PRODUCT,
  buildCampingCategorySchemas,
} from "@/data/camping-content";

export default function CampingCategory() {
  return (
    <Layout>
      <SEO
        title={CAMPING_CATEGORY.title}
        description={CAMPING_CATEGORY.description}
        canonical={CAMPING_CATEGORY.path}
        jsonLd={buildCampingCategorySchemas()}
      />

      <div className="section-container py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
          <ol className="flex items-center flex-wrap gap-1">
            <li>
              <Link to="/" className="hover:text-primary">
                Start
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3 w-3 inline" />
            </li>
            <li className="text-foreground font-medium">Camping</li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-headline">
            {CAMPING_CATEGORY.h1}
          </h1>
        </header>

        {/* Intro */}
        <div className="prose max-w-none mb-12 space-y-4 text-foreground/90">
          {CAMPING_CATEGORY.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Product grid */}
        <h2 className="text-2xl font-bold text-headline mb-6">Verfügbare Wohnwagen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to={CARAONE_PRODUCT.path}
            className="group block rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-[4/3] bg-muted flex items-center justify-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 opacity-40" />
            </div>
            <div className="p-5">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-accent mb-2">
                Auf Anfrage
              </span>
              <h3 className="text-lg font-semibold text-headline group-hover:text-primary transition-colors">
                {CARAONE_PRODUCT.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Familientauglicher Wohnwagen, 5 Schlafplätze, Dusche &amp; WC.
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 5 Pers.</span>
                <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> Dusche/WC</span>
                <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" /> Heizung</span>
              </div>
              <p className="mt-4 text-sm">
                <span className="text-2xl font-bold text-primary">{CARAONE_PRODUCT.pricePerDay}</span>
                <span className="text-xs text-muted-foreground ml-2">+ {CARAONE_PRODUCT.cleaningFee}</span>
              </p>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
