import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search, BookOpen, FileText, Play, ShieldCheck, HelpCircle,
  Truck, HardHat, Wrench, TreePine, Zap, ArrowUpFromLine,
  Layers, PartyPopper, Info, ChevronRight, X, ArrowLeft,
} from "lucide-react";
import {
  kbCategories, kbArticles, searchArticles, getArticlesForCategory,
  getArticleTypeLabel, getArticleTypeColor,
  type KBArticle, type KBCategory,
} from "@/data/knowledgeBaseData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck, HardHat, Wrench, TreePine, Zap, ArrowUpFromLine,
  Layers, PartyPopper, Info,
};

const typeIconMap: Record<KBArticle["type"], React.ComponentType<{ className?: string }>> = {
  anleitung: FileText,
  video: Play,
  faq: HelpCircle,
  sicherheit: ShieldCheck,
};

export default function KnowledgeBase() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const searchResults = useMemo(() => searchArticles(query), [query]);
  const categoryArticles = useMemo(
    () => (selectedCategory ? getArticlesForCategory(selectedCategory) : []),
    [selectedCategory]
  );
  const selectedCategoryData = useMemo(
    () => kbCategories.find((c) => c.id === selectedCategory),
    [selectedCategory]
  );

  // Count articles per category
  const categoriesWithCounts = useMemo(
    () =>
      kbCategories.map((cat) => ({
        ...cat,
        articleCount: kbArticles.filter((a) => a.categoryId === cat.id).length,
      })),
    []
  );

  const isSearching = query.trim().length > 0;

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-accent" />
            <h1 className="text-2xl lg:text-4xl font-bold text-primary-foreground">
              Hilfe & Anleitungen
            </h1>
          </div>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Bedienungsanleitungen, Sicherheitshinweise und Video-Tutorials für alle
            unsere Mietartikel. Finden Sie schnell die Antwort auf Ihre Frage.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) setSelectedCategory(null);
              }}
              placeholder="Artikel, Produkt oder Thema suchen…"
              className="pl-12 pr-12 h-12 text-base bg-background border-0 shadow-lg"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="py-8 lg:py-12 min-h-[50vh]">
        <div className="section-container">
          {/* Search Results */}
          {isSearching && (
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-4">
                {searchResults.length === 0
                  ? `Keine Ergebnisse für „${query}"`
                  : `${searchResults.length} Ergebnis${searchResults.length !== 1 ? "se" : ""} für „${query}"`}
              </p>
              {searchResults.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Kein passender Artikel gefunden. Versuchen Sie einen anderen Suchbegriff
                      oder kontaktieren Sie uns direkt.
                    </p>
                    <Button variant="outline" className="mt-4" asChild>
                      <a href="/kontakt">Kontakt aufnehmen</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
              <div className="grid gap-3">
                {searchResults.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}

          {/* Category Detail View */}
          {!isSearching && selectedCategory && selectedCategoryData && (
            <div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-sm text-primary hover:underline mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück zur Übersicht
              </button>

              <div className="mb-8">
                <h2 className="text-xl lg:text-2xl font-bold text-foreground">
                  {selectedCategoryData.title}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {selectedCategoryData.description}
                </p>
              </div>

              {categoryArticles.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      Anleitungen werden vorbereitet
                    </p>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Die Bedienungsanleitungen für diese Kategorie werden aktuell erstellt
                      und in Kürze hier verfügbar sein.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {categoryArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categories Grid */}
          {!isSearching && !selectedCategory && (
            <>
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Kategorien durchsuchen
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoriesWithCounts.map((cat) => {
                  const IconComp = iconMap[cat.icon] || Info;
                  return (
                    <Card
                      key={cat.id}
                      className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <IconComp className="h-5 w-5 text-primary" />
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <CardTitle className="text-base mt-3">{cat.title}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2">
                          {cat.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <span className="text-xs text-muted-foreground">
                          {cat.articleCount === 0
                            ? "Anleitungen in Kürze verfügbar"
                            : `${cat.articleCount} Artikel`}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Popular / Recently updated */}
              <div className="mt-12">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Neueste Anleitungen
                </h2>
                <div className="grid gap-3">
                  {kbArticles.slice(0, 6).map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Card className="mt-12 bg-secondary border-0">
                <CardContent className="py-8 text-center">
                  <HelpCircle className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Frage nicht beantwortet?
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                    Unser Team hilft Ihnen gerne weiter – telefonisch, per E-Mail
                    oder vor Ort an unseren Standorten.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button asChild>
                      <a href="/kontakt">Kontakt aufnehmen</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/faq">FAQ ansehen</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </Layout>
  );
}

// --- Article Card Component ---
function ArticleCard({ article }: { article: KBArticle }) {
  const TypeIcon = typeIconMap[article.type];
  const categoryData = kbCategories.find((c) => c.id === article.categoryId);

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="py-4 px-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
          <TypeIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-medium text-foreground text-sm">
              {article.title}
            </h3>
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${getArticleTypeColor(article.type)}`}>
              {getArticleTypeLabel(article.type)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {article.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            {categoryData && (
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {categoryData.title}
              </span>
            )}
            {article.content || article.videoUrl || article.pdfUrl ? (
              <span className="text-[10px] text-primary font-medium">Jetzt lesen →</span>
            ) : (
              <span className="text-[10px] text-muted-foreground italic">Inhalt folgt in Kürze</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
