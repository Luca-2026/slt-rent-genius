import { useState } from "react";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid3X3 } from "lucide-react";
import { productCategories } from "@/data/rentalData";
import { useTranslatedCategories } from "@/hooks/useTranslatedProduct";
import { LocationSelectDialog } from "@/components/solutions/LocationSelectDialog";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useTranslation } from "react-i18next";
import { MietartikelSearch } from "@/components/rental/MietartikelSearch";

export default function Mietartikel() {
  const { t } = useTranslation();
  const rawCategories = productCategories.filter(c => c.id !== "alle");
  const categories = useTranslatedCategories(rawCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setDialogOpen(true);
  };

  // Split into Bau & Handwerk / Event & Veranstaltung
  const bauCategories = categories.filter(c =>
    ["anhaenger", "erdbewegung", "verdichtung", "arbeitsbuehnen", "werkzeuge", "gartenpflege", "leitern-gerueste", "aggregate", "kabel-stromverteiler", "heizung-trocknung", "absperrtechnik"].includes(c.id)
  );
  const eventCategories = categories.filter(c =>
    ["beleuchtung", "beschallung", "buehne", "traversen-rigging", "kommunikation", "moebel-zelte", "geschirr-glaeser-besteck", "spezialeffekte", "huepfburgen"].includes(c.id)
  );

  const CategoryCard = ({ category }: { category: typeof categories[0] }) => (
    <button
      onClick={() => handleCategoryClick(category.id)}
      className="text-left"
    >
      <Card className="h-full group hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
        <div className="aspect-square bg-muted/50 flex items-center justify-center p-3 md:p-4 group-hover:bg-primary/5 transition-colors">
          {category.icon ? (
            <img
              src={category.icon}
              alt={category.title}
              className="w-[85%] h-[85%] object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-20 h-20 bg-muted rounded-full" />
          )}
        </div>
        <CardContent className="p-3 text-center">
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {category.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 hidden sm:block">
            {category.description}
          </p>
        </CardContent>
      </Card>
    </button>
  );

  return (
    <Layout>
      <SEO
        title={t("mietartikel.seo.title")}
        description="Über 1.700 Mietartikel in 20+ Kategorien: Baumaschinen, Anhänger, Eventausstattung & mehr. Online buchen, abholen oder liefern lassen – 3 Standorte NRW."
        canonical="/mietartikel"
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-10 md:py-16">
        <div className="section-container text-center">
          <Badge variant="outline" className="mb-4">{t("mietartikel.badge")}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-headline mb-4">
            {t("mietartikel.title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("mietartikel.subtitle")}
          </p>
          <MietartikelSearch />
        </div>
      </section>

      {/* Bau & Handwerk */}
      <section className="section-container py-10 md:py-14">
        <AnimatedSection>
          <h2 className="text-2xl md:text-3xl font-bold text-headline mb-2">{t("mietartikel.bauHandwerk")}</h2>
          <p className="text-muted-foreground mb-6">{t("mietartikel.bauHandwerkDesc")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {bauCategories.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Event & Veranstaltung */}
      <section className="section-container py-10 md:py-14">
        <AnimatedSection>
          <h2 className="text-2xl md:text-3xl font-bold text-headline mb-2">{t("mietartikel.eventVeranstaltung")}</h2>
          <p className="text-muted-foreground mb-6">{t("mietartikel.eventVeranstaltungDesc")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {eventCategories.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </AnimatedSection>
      </section>

      <LocationSelectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        targetCategoryId={selectedCategoryId}
        title={t("mietartikel.selectLocation")}
        description={t("mietartikel.selectLocationDesc")}
      />
    </Layout>
  );
}
