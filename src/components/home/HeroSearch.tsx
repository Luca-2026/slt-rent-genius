import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronRight, Package, X, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { locations, getAllProductsForLocation, type Product, productCategories, type ProductCategory } from "@/data/rentalData";
import { categoryTranslations } from "@/i18n/productTranslations";
import { useTranslatedProducts } from "@/hooks/useTranslatedProduct";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Get all unique products across all locations (deduplicated by name)
function getAllUniqueProducts(): Product[] {
  const productMap = new Map<string, Product>();

  for (const location of locations) {
    const products = getAllProductsForLocation(location.id);
    for (const product of products) {
      if (!product.name) continue;

      const normalizedName = normalizeSearchText(product.name);
      if (!normalizedName || productMap.has(normalizedName)) continue;

      productMap.set(normalizedName, product);
    }
  }

  return Array.from(productMap.values());
}

function normalizeSearchText(value?: string): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/&/g, " und ")
    .replace(/,/g, ".")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.\s/-]/g, " ")
    .replace(/[/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchTokens(value: string): string[] {
  return normalizeSearchText(value).split(" ").filter(Boolean);
}

function matchesAllTokens(target: string | undefined, queryTokens: string[]): boolean {
  if (!target || queryTokens.length === 0) return false;

  const normalizedTarget = normalizeSearchText(target);
  const compactTarget = normalizedTarget.replace(/\s+/g, "");

  return queryTokens.every((token) => {
    const compactToken = token.replace(/\s+/g, "");
    return normalizedTarget.includes(token) || compactTarget.includes(compactToken);
  });
}

function countMatchingTokens(target: string | undefined, queryTokens: string[]): number {
  if (!target || queryTokens.length === 0) return 0;

  const normalizedTarget = normalizeSearchText(target);
  const compactTarget = normalizedTarget.replace(/\s+/g, "");

  return queryTokens.filter((token) => {
    const compactToken = token.replace(/\s+/g, "");
    return normalizedTarget.includes(token) || compactTarget.includes(compactToken);
  }).length;
}

function getFieldSearchScore(
  target: string | undefined,
  normalizedQuery: string,
  queryTokens: string[],
  weights: {
    exact: number;
    startsWith: number;
    includes: number;
    allTokens: number;
    perToken: number;
  },
): number {
  if (!target || !normalizedQuery) return 0;

  const normalizedTarget = normalizeSearchText(target);
  if (!normalizedTarget) return 0;

  const compactTarget = normalizedTarget.replace(/\s+/g, "");
  const compactQuery = normalizedQuery.replace(/\s+/g, "");
  const matchedTokenCount = countMatchingTokens(target, queryTokens);

  let score = 0;

  if (normalizedTarget === normalizedQuery || compactTarget === compactQuery) score += weights.exact;
  if (normalizedTarget.startsWith(normalizedQuery) || compactTarget.startsWith(compactQuery)) score += weights.startsWith;
  if (normalizedTarget.includes(normalizedQuery) || compactTarget.includes(compactQuery)) score += weights.includes;
  if (matchesAllTokens(target, queryTokens)) score += weights.allTokens;
  score += matchedTokenCount * weights.perToken;

  return score;
}

// Get locations that have a specific product (by id match)
function getLocationsForProduct(productId: string): typeof locations {
  return locations.filter((location) => {
    const products = getAllProductsForLocation(location.id);
    return products.some((p) => p.id === productId);
  });
}

// Get product ID at a specific location (by id match)
function getProductIdAtLocation(productId: string, locationId: string): string | null {
  const products = getAllProductsForLocation(locationId);
  const product = products.find((p) => p.id === productId);
  return product?.id || null;
}

// Get category for product at a specific location
function getCategoryForProductAtLocation(productId: string, locationId: string): string {
  const location = locations.find((l) => l.id === locationId);
  if (!location) return "alle";

  for (const [categoryId, products] of Object.entries(location.products)) {
    if (products.some((p) => p.id === productId)) {
      return categoryId;
    }
  }
  return "alle";
}

export function HeroSearch() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isGerman = i18n.language === "de" || i18n.language?.startsWith("de");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const allProducts = useMemo(() => getAllUniqueProducts(), []);
  const translatedProducts = useTranslatedProducts(allProducts);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);
    const queryTokens = getSearchTokens(searchQuery);
    if (!normalizedQuery || queryTokens.length === 0) return [];

    const searchable = productCategories.filter((c) => c.id !== "alle");

    const directMatches = searchable.filter((cat) => {
      if (matchesAllTokens(cat.title, queryTokens)) return true;
      if (matchesAllTokens(cat.description, queryTokens)) return true;

      const translatedCategory = categoryTranslations[cat.id];
      if (!isGerman) {
        if (matchesAllTokens(translatedCategory?.title, queryTokens)) return true;
        if (matchesAllTokens(translatedCategory?.description, queryTokens)) return true;
      }

      return false;
    });

    if (directMatches.length > 0) return directMatches.slice(0, 3);

    const indirectMatches = searchable.filter((cat) => {
      for (const location of locations) {
        const catProducts = location.products[cat.id];
        if (!catProducts) continue;

        for (const product of catProducts) {
          if (matchesAllTokens(product.name, queryTokens)) return true;
          if (matchesAllTokens(product.modelName, queryTokens)) return true;
          if (matchesAllTokens(product.description, queryTokens)) return true;
          if (product.tags?.some((tag) => matchesAllTokens(tag, queryTokens))) return true;
        }
      }
      return false;
    });

    return indirectMatches.slice(0, 3);
  }, [searchQuery, isGerman]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);
    const queryTokens = getSearchTokens(searchQuery);
    if (!normalizedQuery || queryTokens.length === 0) return [];

    const categoryProductIds = new Set<string>();
    if (filteredCategories.length > 0) {
      for (const cat of filteredCategories) {
        for (const location of locations) {
          const catProducts = location.products[cat.id];
          if (!catProducts) continue;

          for (const product of catProducts) {
            categoryProductIds.add(product.id);
          }
        }
      }
    }

    return translatedProducts
      .map((translatedProduct, index) => {
        const original = allProducts[index];
        if (!original?.name) return null;

        const searchBlob = [
          original.description,
          original.detailedDescription,
          original.modelName,
          ...(original.tags ?? []),
          ...Object.entries(original.specifications ?? {}).flatMap(([key, value]) => [key, value]),
        ]
          .filter(Boolean)
          .join(" ");

        let score = 0;
        score += getFieldSearchScore(original.name, normalizedQuery, queryTokens, {
          exact: 300,
          startsWith: 200,
          includes: 150,
          allTokens: 220,
          perToken: 60,
        });
        score += getFieldSearchScore(translatedProduct.name, normalizedQuery, queryTokens, {
          exact: 260,
          startsWith: 180,
          includes: 140,
          allTokens: 200,
          perToken: 50,
        });
        score += getFieldSearchScore(original.modelName, normalizedQuery, queryTokens, {
          exact: 160,
          startsWith: 120,
          includes: 100,
          allTokens: 140,
          perToken: 35,
        });
        score += getFieldSearchScore(searchBlob, normalizedQuery, queryTokens, {
          exact: 80,
          startsWith: 60,
          includes: 40,
          allTokens: 70,
          perToken: 20,
        });

        if (score <= 0) return null;
        if (categoryProductIds.has(original.id)) score += 15;

        return {
          product: translatedProduct,
          score,
          nameLength: original.name.length,
        };
      })
      .filter((item): item is { product: Product; score: number; nameLength: number } => Boolean(item))
      .sort((a, b) => b.score - a.score || a.nameLength - b.nameLength || a.product.name.localeCompare(b.product.name, isGerman ? "de" : "en"));

    // Round-robin durch Modellfamilien, damit nicht 8x dasselbe Modell (z.B. "Breitaufbau") oben steht
    return diversifyByFamily(scored, (item) => item.product.name, 8).map(({ product }) => product);
  }, [searchQuery, translatedProducts, allProducts, filteredCategories, isGerman]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSelectedCategoryId(null);
    setShowResults(false);
    setShowLocationDialog(true);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedProduct(null);
    setShowResults(false);
    setShowLocationDialog(true);
  };

  const handleLocationSelect = (locationId: string) => {
    if (selectedProduct) {
      const productId = getProductIdAtLocation(selectedProduct.id, locationId);
      const categoryId = getCategoryForProductAtLocation(selectedProduct.id, locationId);
      if (productId) {
        navigate(`/mieten/${locationId}/${categoryId}/${productId}`);
      }
    } else if (selectedCategoryId) {
      navigate(`/mieten/${locationId}/${selectedCategoryId}`);
    } else {
      navigate(`/mieten/${locationId}/alle`);
    }
    setShowLocationDialog(false);
    setSelectedProduct(null);
    setSelectedCategoryId(null);
    setSearchQuery("");
  };

  const handleSearchSubmit = () => {
    if (filteredCategories.length > 0) {
      handleCategorySelect(filteredCategories[0].id);
    } else if (filteredProducts.length > 0) {
      handleProductSelect(filteredProducts[0]);
    } else {
      navigate(`/mieten/krefeld/alle`);
    }
  };

  const availableLocations = selectedProduct
    ? getLocationsForProduct(selectedProduct.id)
    : selectedCategoryId
      ? locations
      : [];

  return (
    <>
      <div ref={searchRef} className="bg-background rounded-xl p-4 shadow-xl max-w-2xl relative">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Article Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("hero.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  // Use a microtask to ensure filtered results are up to date
                  setTimeout(() => handleSearchSubmit(), 0);
                }
              }}
              className="pl-10 pr-10 py-3 h-auto text-base border-input focus-visible:ring-accent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            onClick={handleSearchSubmit}
            className="bg-accent text-accent-foreground hover:bg-cta-orange-hover px-8 py-3"
          >
            <Search className="h-4 w-4 mr-2" />
            {t("hero.searchButton")}
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchQuery && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg z-[100] overflow-hidden max-h-96 overflow-y-auto">
            {(filteredCategories.length > 0 || filteredProducts.length > 0) ? (
              <div className="p-2">
                {/* Categories first */}
                {filteredCategories.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground px-3 py-1 mb-1">
                      {t("hero.categoriesFound", { count: filteredCategories.length, defaultValue: "{{count}} Kategorien" })}
                    </p>
                    {filteredCategories.map((cat) => {
                      const displayTitle = isGerman ? cat.title : (categoryTranslations[cat.id]?.title || cat.title);
                      const displayDesc = isGerman ? cat.description : (categoryTranslations[cat.id]?.description || cat.description);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.id)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-muted transition-colors text-left group"
                        >
                          <div className="w-14 h-14 bg-primary/10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {cat.icon ? (
                              <img src={cat.icon} alt={displayTitle} className="w-8 h-8 object-contain" />
                            ) : (
                              <FolderOpen className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-foreground block truncate group-hover:text-primary transition-colors">
                              {displayTitle}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{displayDesc}</span>
                            <span className="text-xs text-primary font-medium mt-0.5 block">
                              {t("hero.viewCategory", { defaultValue: "Kategorie anzeigen →" })}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </button>
                      );
                    })}
                  </>
                )}

                {/* Products */}
                {filteredProducts.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground px-3 py-1 mb-1 mt-2">
                      {t("hero.articlesFound", { count: filteredProducts.length })}
                    </p>
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-muted transition-colors text-left group"
                      >
                        <div className="w-14 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground block truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </span>
                          {product.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">{product.description}</span>
                          )}
                          {product.pricePerDay && (
                            <span className="text-sm font-semibold text-primary mt-0.5 block">
                              {product.pricePerDay}{t("rental.perDay")}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </button>
                    ))}
                  </>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t("hero.noArticlesFound", { query: searchQuery })}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => navigate("/mieten")}
                  className="mt-2 text-primary"
                >
                  {t("hero.browseAll")}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quick category links */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-muted-foreground">{t("hero.popular")}</span>
          {(t("hero.popularTerms", { returnObjects: true }) as string[]).map((term) => (
            <button
              key={term}
              onClick={() => {
                setSearchQuery(term);
                setShowResults(true);
              }}
              className="text-xs text-primary hover:text-accent transition-colors font-medium"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Location Selection Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{t("hero.selectLocation")}</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="mb-4 p-3 bg-muted rounded-lg flex items-center gap-3">
              <div className="w-12 h-12 bg-background rounded-md overflow-hidden flex-shrink-0">
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{selectedProduct.name}</p>
                <p className="text-xs text-muted-foreground">{t("hero.selectLocationHint")}</p>
              </div>
            </div>
          )}

          {selectedCategoryId && !selectedProduct && (() => {
            const cat = productCategories.find((c) => c.id === selectedCategoryId);
            if (!cat) return null;
            const displayTitle = isGerman ? cat.title : (categoryTranslations[cat.id]?.title || cat.title);
            return (
              <div className="mb-4 p-3 bg-muted rounded-lg flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-md flex-shrink-0 flex items-center justify-center">
                  {cat.icon ? (
                    <img src={cat.icon} alt={displayTitle} className="w-7 h-7 object-contain" />
                  ) : (
                    <FolderOpen className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{displayTitle}</p>
                  <p className="text-xs text-muted-foreground">{t("hero.selectLocationHint")}</p>
                </div>
              </div>
            );
          })()}

          <div className="space-y-2">
            {availableLocations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location.id)}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground block group-hover:text-primary transition-colors">
                      {location.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{location.address}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}

            {availableLocations.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                {t("hero.notAvailable")}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
