import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search, BookOpen, FileText, Play, ShieldCheck, HelpCircle, Mail,
  Truck, HardHat, Wrench, TreePine, Zap, ArrowUpFromLine,
  Layers, PartyPopper, Info, ChevronRight, X, ArrowLeft,
  Scale, AlertTriangle, ClipboardCheck, Package, Link2, Eye, Car, Lightbulb, AlertCircle,
  Smartphone, MessageSquare, Unlock, Lock,
} from "lucide-react";
import {
  kbCategories, kbArticles, searchArticles, getArticlesForCategory,
  getArticleTypeLabel, getArticleTypeColor,
  type KBArticle, type KBCategory, type KBArticleSection,
} from "@/data/knowledgeBaseData";
import { useTranslation } from "react-i18next";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck, HardHat, Wrench, TreePine, Zap, ArrowUpFromLine,
  Layers, PartyPopper, Info,
};

const sectionIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale, AlertTriangle, ClipboardCheck, Package, Link: Link2, Eye, Car, Lightbulb, AlertCircle, Info,
  Smartphone, MessageSquare, Unlock, Lock, HelpCircle,
};

const typeIconMap: Record<KBArticle["type"], React.ComponentType<{ className?: string }>> = {
  anleitung: FileText,
  video: Play,
  faq: HelpCircle,
  sicherheit: ShieldCheck,
};

export default function KnowledgeBase() {
  const { t } = useTranslation();
  const routerLocation = useLocation();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);

  // Deep-link to a specific article via router state (e.g. from ProductDetail)
  useEffect(() => {
    const state = routerLocation.state as { articleId?: string } | null;
    if (state?.articleId) {
      const article = kbArticles.find((a) => a.id === state.articleId);
      if (article) {
        setSelectedCategory(article.categoryId);
        setSelectedArticle(article);
      }
    }
  }, [routerLocation.state]);

  const searchResults = useMemo(() => searchArticles(query), [query]);
  const categoryArticles = useMemo(
    () => (selectedCategory ? getArticlesForCategory(selectedCategory) : []),
    [selectedCategory]
  );
  const selectedCategoryData = useMemo(
    () => kbCategories.find((c) => c.id === selectedCategory),
    [selectedCategory]
  );

  const categoriesWithCounts = useMemo(
    () =>
      kbCategories.map((cat) => ({
        ...cat,
        articleCount: kbArticles.filter((a) => a.categoryId === cat.id).length,
      })),
    []
  );

  const isSearching = query.trim().length > 0;

  // Article type labels translated
  const typeLabel = (type: KBArticle["type"]) => {
    const key = `kb.type.${type}`;
    const translated = t(key);
    return translated !== key ? translated : getArticleTypeLabel(type);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-10 md:py-12 lg:py-16">
        <div className="section-container text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-7 w-7 md:h-8 md:w-8 text-accent" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground">
              {t("kb.title")}
            </h1>
          </div>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-6 md:mb-8 text-sm md:text-base">
            {t("kb.subtitle")}
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedCategory(null);
                  setSelectedArticle(null);
                }
              }}
              placeholder={t("kb.searchPlaceholder")}
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
      {/* Billing Contact Banner */}
      <section className="py-4 bg-accent/10 border-b border-accent/20">
        <div className="section-container flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center">
          <span className="text-sm font-medium text-headline">Fragen zur Abrechnung?</span>
          <a
            href="mailto:buchhaltung@slt-tg.de"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold border-2 border-primary text-primary bg-background rounded-md hover:border-accent transition-colors"
          >
            <Mail className="h-4 w-4" />
            Buchhaltung kontaktieren
          </a>
        </div>
      </section>

      <main className="py-8 lg:py-12 min-h-[50vh]">
        <div className="section-container">
          {/* Article Detail View */}
          {selectedArticle && (
            <div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-2 text-sm text-primary hover:underline mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("common.back")}
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className={`text-xs ${getArticleTypeColor(selectedArticle.type)}`}>
                    {typeLabel(selectedArticle.type)}
                  </Badge>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-foreground">
                  {selectedArticle.title}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {selectedArticle.description}
                </p>
              </div>

              {/* Video Embed */}
              {selectedArticle.videoUrl && (
                <div className="mb-6">
                  <div className="aspect-video rounded-xl overflow-hidden border border-border">
                    <iframe
                      src={selectedArticle.videoUrl.replace("watch?v=", "embed/").replace("/shorts/", "/embed/")}
                      title={selectedArticle.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* PDF Download */}
              {selectedArticle.pdfUrl && (
                <div className="mb-6">
                  <a
                    href={selectedArticle.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5 py-3 text-sm font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    {t("kb.downloadPdf")}
                  </a>
                </div>
              )}

              {/* Rich Sections */}
              {selectedArticle.sections && selectedArticle.sections.length > 0 && (
                <div className="space-y-5">
                  {selectedArticle.sections.map((section, idx) => (
                    <ArticleSection key={idx} section={section} />
                  ))}
                </div>
              )}

              {/* Simple text content fallback */}
              {selectedArticle.content && !selectedArticle.sections && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {selectedArticle.content}
                  </p>
                </div>
              )}

              {/* No content fallback – only show if truly no content at all */}
              {!selectedArticle.videoUrl && !selectedArticle.pdfUrl && !selectedArticle.content && !(selectedArticle.sections && selectedArticle.sections.length > 0) && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {t("kb.contentSoon")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Search Results */}
          {!selectedArticle && isSearching && (
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-4">
                {searchResults.length === 0
                  ? t("kb.noResults", { query })
                  : t("kb.resultsCount", { count: searchResults.length, query })}
              </p>
              {searchResults.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {t("kb.noResultsHint")}
                    </p>
                    <Button variant="outline" className="mt-4" asChild>
                      <a href="/kontakt">{t("kb.contactUs")}</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
              <div className="grid gap-3">
                {searchResults.map((article) => (
                  <ArticleCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} typeLabel={typeLabel} t={t} />
                ))}
              </div>
            </div>
          )}

          {/* Category Detail View */}
          {!selectedArticle && !isSearching && selectedCategory && selectedCategoryData && (
            <div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-sm text-primary hover:underline mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("kb.backToOverview")}
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
                      {t("kb.guidesSoon")}
                    </p>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {t("kb.guidesSoonDesc")}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {categoryArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} typeLabel={typeLabel} t={t} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categories Grid */}
          {!selectedArticle && !isSearching && !selectedCategory && (
            <>
              <h2 className="text-lg font-semibold text-foreground mb-6">
                {t("kb.browseCategories")}
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
                            ? t("kb.guidesComingSoon")
                            : t("kb.articleCount", { count: cat.articleCount })}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-12">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {t("kb.latestGuides")}
                </h2>
                <div className="grid gap-3">
                  {kbArticles.slice(0, 6).map((article) => (
                    <ArticleCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} typeLabel={typeLabel} t={t} />
                  ))}
                </div>
              </div>

              <Card className="mt-12 bg-secondary border-0">
                <CardContent className="py-8 text-center">
                  <HelpCircle className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("kb.questionNotAnswered")}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                    {t("kb.questionNotAnsweredDesc")}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button asChild>
                      <a href="/kontakt">{t("kb.contactUs")}</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/faq">{t("kb.viewFaq")}</a>
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
function ArticleCard({
  article,
  onClick,
  typeLabel,
  t,
}: {
  article: KBArticle;
  onClick: () => void;
  typeLabel: (type: KBArticle["type"]) => string;
  t: (key: string) => string;
}) {
  const TypeIcon = typeIconMap[article.type];
  const categoryData = kbCategories.find((c) => c.id === article.categoryId);

  return (
    <Card className="hover:shadow-sm transition-shadow cursor-pointer" onClick={onClick}>
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
              {typeLabel(article.type)}
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
            {article.content || article.videoUrl || article.pdfUrl || (article.sections && article.sections.length > 0) ? (
              <span className="text-[10px] text-primary font-medium">{t("kb.readNow")} →</span>
            ) : (
              <span className="text-[10px] text-muted-foreground italic">{t("kb.contentSoonShort")}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Article Section Rich Renderer ---
function ArticleSection({ section }: { section: KBArticleSection }) {
  const SectionIcon = section.icon ? sectionIconMap[section.icon] || Info : null;

  const bgClass =
    section.type === "warning"
      ? "bg-destructive/5 border-destructive/20"
      : section.type === "legal"
      ? "bg-primary/5 border-primary/20"
      : section.type === "tip"
      ? "bg-accent/10 border-accent/20"
      : "bg-card border-border";

  const iconColor =
    section.type === "warning"
      ? "text-destructive"
      : section.type === "legal"
      ? "text-primary"
      : section.type === "tip"
      ? "text-foreground"
      : "text-primary";

  return (
    <div className={`rounded-xl border p-5 ${bgClass}`}>
      {section.heading && (
        <div className="flex items-center gap-2.5 mb-3">
          {SectionIcon && (
            <div className="w-8 h-8 rounded-lg bg-background/80 flex items-center justify-center flex-shrink-0">
              <SectionIcon className={`h-4 w-4 ${iconColor}`} />
            </div>
          )}
          <h3 className="font-bold text-foreground text-base leading-snug">{section.heading}</h3>
        </div>
      )}

      {section.text && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {section.text}
        </p>
      )}

      {section.items && section.items.length > 0 && (
        <ul className="space-y-2">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                section.type === "warning" ? "bg-destructive" :
                section.type === "tip" ? "bg-accent" : "bg-primary"
              }`} />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}

      {section.table && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                {section.table.headers.map((h, i) => (
                  <TableHead key={i} className="text-xs font-semibold text-foreground whitespace-nowrap">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {section.table.rows.map((row, ri) => (
                <TableRow key={ri}>
                  {row.map((cell, ci) => (
                    <TableCell key={ci} className={`text-sm ${ci === 0 ? "font-semibold text-primary" : "text-foreground"}`}>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {section.subSections && section.subSections.map((sub, si) => (
        <div key={si} className="mt-4">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <span className="w-1 h-4 rounded-full bg-primary inline-block" />
            {sub.heading}
          </h4>
          <ul className="space-y-1.5">
            {sub.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
