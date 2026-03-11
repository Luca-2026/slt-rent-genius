import { Layout } from "@/components/layout";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { WeightFilter, weightRanges } from "@/components/products/WeightFilter";
import { RentwareSearch } from "@/components/products/RentwareSearch";
import { DeliveryCalculatorCompact } from "@/components/products/DeliveryCalculatorCompact";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useTranslation } from "react-i18next";

// Imports for category icons
import iconBagger from "@/assets/icons/category-bagger.png";
import iconVerdichtung from "@/assets/icons/category-verdichtung.png";
import iconBuehne from "@/assets/icons/category-buehne.png";
import iconMoebelZelte from "@/assets/icons/category-moebel-zelte.png";
import iconGeschirr from "@/assets/icons/category-geschirr-neu.png";
import iconBesteck from "@/assets/icons/category-besteck.png";
import iconHuepfburg from "@/assets/icons/category-huepfburg.png";
import iconSpezialeffekte from "@/assets/icons/category-spezialeffekte.png";
import iconAbsperrgitter from "@/assets/icons/category-absperrgitter.png";
import iconAggregat from "@/assets/icons/category-aggregat.png";
import iconBeleuchtung from "@/assets/icons/category-beleuchtung.png";
import iconAnhaenger from "@/assets/icons/category-anhaenger.png";
import iconHeizung from "@/assets/icons/category-heizung.png";
import iconKabel from "@/assets/icons/category-kabel.png";
import iconHebebuehne from "@/assets/icons/category-hebebuehne.png";
import iconLedSpots from "@/assets/icons/category-ledspots.png";

const categoryIds = [
  "bagger-radlader",
  "verdichtung",
  "anhaenger",
  "hebebuehnen",
  "buehnen-podeste",
  "moebel-zelte",
  "geschirr",
  "besteck",
  "huepfburgen",
  "spezialeffekte",
  "led-spots",
  "beleuchtung",
  "stromerzeuger",
  "heizung-klima",
  "kabel-leitungen",
  "absperrung-sicherheit",
] as const;

const categoryImages: Record<string, string> = {
  "bagger-radlader": iconBagger,
  "verdichtung": iconVerdichtung,
  "anhaenger": iconAnhaenger,
  "hebebuehnen": iconHebebuehne,
  "buehnen-podeste": iconBuehne,
  "moebel-zelte": iconMoebelZelte,
  "geschirr": iconGeschirr,
  "besteck": iconBesteck,
  "huepfburgen": iconHuepfburg,
  "spezialeffekte": iconSpezialeffekte,
  "led-spots": iconLedSpots,
  "beleuchtung": iconBeleuchtung,
  "stromerzeuger": iconAggregat,
  "heizung-klima": iconHeizung,
  "kabel-leitungen": iconKabel,
  "absperrung-sicherheit": iconAbsperrgitter,
};

const categoryMeta: Record<string, { hasWeightFilter?: boolean; rentwareSearch?: Record<string, string>; rentwareArticles?: RentwareArticleType[] }> = {
  "bagger-radlader": {
    hasWeightFilter: true,
    rentwareSearch: {
      view: "cards",
      showLocation: "on",
      loadBehaviour: "extended",
      locations: "01929004-e24f-7cc0-83f0-0f3d3431395e, 01953e5f-614f-743d-8eb9-1a0e865da81d, 95e16e54-04d2-496a-6002-41e0289b53a3",
      showOnlyTags: "Bagger",
    },
  },
  "anhaenger": {
    rentwareArticles: [
      { id: "WWSMO3", view: "cards", name: "Anhänger" },
    ],
  },
};

function RentwareArticleWidget({ articleId, view = "cards" }: { articleId: string; view?: string }) {
  useEffect(() => {
    const containerId = `rentware-article-${articleId}`;
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      const articleElement = document.createElement('rtr-article-booking');
      articleElement.setAttribute('article-id', articleId);
      articleElement.setAttribute('view', 'calendar');
      container.appendChild(articleElement);
    }
  }, [articleId, view]);

  return <div id={`rentware-article-${articleId}`} className="min-h-[400px]" />;
}

interface RentwareArticleType {
  id: string;
  view: string;
  name: string;
  weightKg?: number;
}

function RentwareArticlesList({ articles }: { articles: RentwareArticleType[] }) {
  if (!articles || articles.length === 0) return null;
  
  return (
    <div className="space-y-8">
      {articles.map((article) => (
        <div key={article.id} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-headline">{article.name}</h3>
            {article.weightKg && (
              <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {article.weightKg >= 1000 ? `${(article.weightKg / 1000).toFixed(1)}t` : `${article.weightKg}kg`}
              </span>
            )}
          </div>
          <RentwareArticleWidget articleId={article.id} view={article.view} />
        </div>
      ))}
    </div>
  );
}

export default function Products() {
  const { category } = useParams<{ category?: string }>();
  const [weightFilter, setWeightFilter] = useState("all");
  const { t } = useTranslation();

  const categories = categoryIds.map((id) => ({
    id,
    title: t(`products.cat.${id}.title`),
    description: t(`products.cat.${id}.desc`),
    image: categoryImages[id],
    hasWeightFilter: categoryMeta[id]?.hasWeightFilter,
    rentwareSearch: categoryMeta[id]?.rentwareSearch,
    rentwareArticles: categoryMeta[id]?.rentwareArticles || [],
  }));

  const selectedCategory = categories.find(c => c.id === category);

  const getFilteredArticles = () => {
    if (!selectedCategory?.rentwareArticles) return [];
    if (weightFilter === "all") return selectedCategory.rentwareArticles;
    
    const range = weightRanges.find(r => r.id === weightFilter);
    if (!range) return selectedCategory.rentwareArticles;
    
    return selectedCategory.rentwareArticles.filter(article => {
      if (!article.weightKg) return true;
      return article.weightKg >= range.min && article.weightKg < range.max;
    });
  };

  const filteredArticles = getFilteredArticles();

  if (selectedCategory) {
    return (
      <Layout>
        <section className="bg-primary py-8 lg:py-12">
          <div className="section-container">
            <AnimatedSection animation="fade-in-up">
              <Link 
                to="/produkte" 
                className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("products.backToOverview")}
              </Link>
              
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-background rounded-xl p-3 flex items-center justify-center">
                  <img 
                    src={selectedCategory.image} 
                    alt={selectedCategory.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                    {selectedCategory.title}
                  </h1>
                  <p className="text-primary-foreground/80 mt-1">
                    {selectedCategory.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {selectedCategory.rentwareSearch && (
          <section className="py-8 lg:py-12">
            <div className="section-container">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <RentwareSearch 
                    config={selectedCategory.rentwareSearch} 
                    categoryId={selectedCategory.id} 
                  />
                </div>
                <div className="lg:col-span-1">
                  <div className="sticky top-4">
                    <DeliveryCalculatorCompact productCategoryId={selectedCategory.id} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {!selectedCategory.rentwareSearch && selectedCategory.rentwareArticles && selectedCategory.rentwareArticles.length > 0 && (
          <section className="py-8 lg:py-12">
            <div className="section-container">
              {selectedCategory.hasWeightFilter && (
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-muted-foreground">{t("products.filterBySize")}</span>
                  <WeightFilter 
                    selectedRange={weightFilter} 
                    onRangeChange={setWeightFilter} 
                  />
                </div>
              )}
              
              {filteredArticles.length > 0 ? (
                <RentwareArticlesList articles={filteredArticles} />
              ) : (
                <div className="text-center py-12 bg-muted/50 rounded-xl">
                  <p className="text-muted-foreground">
                    Keine Produkte in dieser Kategorie verfügbar.
                  </p>
                  <Button 
                    variant="link" 
                    onClick={() => setWeightFilter("all")}
                    className="mt-2"
                  >
                    {t("products.allProducts")}
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="py-8 lg:py-12 bg-surface-light">
          <div className="section-container">
            <AnimatedSection animation="fade-in-up">
              <h2 className="text-xl font-bold text-headline mb-6">{t("products.otherCategories")}</h2>
            </AnimatedSection>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories
                .filter(c => c.id !== selectedCategory.id)
                .slice(0, 8)
                .map((cat, index) => (
                  <AnimatedSection key={cat.id} animation="scale-in" delay={index * 60}>
                    <Link to={`/mieten/krefeld/${cat.id}`}>
                      <Card className="h-full hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
                        <div className="aspect-square bg-muted flex items-center justify-center p-4">
                          <img 
                            src={cat.image} 
                            alt={cat.title}
                            className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm text-headline text-center">{cat.title}</h3>
                        </CardContent>
                      </Card>
                    </Link>
                  </AnimatedSection>
                ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Main products overview
  return (
    <Layout>
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
               {t("products.title")}
             </h1>
             <p className="text-primary-foreground/80 max-w-2xl mb-6">
               {t("products.subtitle")}
             </p>
           </AnimatedSection>
         </div>
       </section>

      <section className="py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-2xl font-bold text-headline mb-8">{t("products.categories")}</h2>
          </AnimatedSection>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
            {categories.map((cat, index) => (
              <AnimatedSection key={cat.id} animation="fade-in-up" delay={index * 50}>
                <Link to={`/produkte/${cat.id}`}>
                  <Card className="category-card h-full group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center p-3 md:p-4">
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-3 md:p-4">
                      <h3 className="font-bold text-headline text-sm md:text-base">{cat.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
                       <Button variant="link" className="p-0 mt-2 text-primary group-hover:text-accent text-xs md:text-sm">
                         {t("products.viewCategory")} <ArrowRight className="ml-1 h-3.5 w-3.5 md:h-4 md:w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-surface-light">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-8 lg:p-12">
              <div className="max-w-2xl">
               <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
                   💰 {t("products.weekendSave")}
                 </span>
                 <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">
                   {t("products.weekendTitle")}
                 </h2>
                 <p className="text-muted-foreground mb-6">
                   {t("products.weekendDesc")}
                 </p>
                 <Link to="/so-funktionierts">
                   <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                     {t("products.moreAboutWeekend")}
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
