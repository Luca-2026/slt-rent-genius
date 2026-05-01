import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronRight, Package, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { locations, getAllProductsForLocation, type Product } from "@/data/rentalData";
import { useTranslatedProducts } from "@/hooks/useTranslatedProduct";
import { diversifyByFamily, isAccessoryProduct } from "@/lib/searchDiversify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function countMatchingTokens(target: string | undefined, queryTokens: string[]): number {
  if (!target || queryTokens.length === 0) return 0;
  const normalizedTarget = normalizeSearchText(target);
  const compactTarget = normalizedTarget.replace(/\s+/g, "");
  return queryTokens.filter((token) => {
    const compactToken = token.replace(/\s+/g, "");
    return normalizedTarget.includes(token) || compactTarget.includes(compactToken);
  }).length;
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

function getFieldSearchScore(
  target: string | undefined,
  normalizedQuery: string,
  queryTokens: string[],
  weights: { exact: number; startsWith: number; includes: number; allTokens: number; perToken: number },
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

function getAllUniqueProducts(): Product[] {
  const productMap = new Map<string, Product>();
  for (const location of locations) {
    const products = getAllProductsForLocation(location.id);
    for (const product of products) {
      if (!product.name) continue;
      if (isAccessoryProduct(product)) continue;
      const normalizedName = normalizeSearchText(product.name);
      if (!normalizedName || productMap.has(normalizedName)) continue;
      productMap.set(normalizedName, product);
    }
  }
  return Array.from(productMap.values());
}

function getLocationsForProduct(productId: string): typeof locations {
  return locations.filter((location) => {
    const products = getAllProductsForLocation(location.id);
    return products.some((p) => p.id === productId);
  });
}

function getCategoryForProductAtLocation(productId: string, locationId: string): string {
  const location = locations.find((l) => l.id === locationId);
  if (!location) return "alle";
  for (const [categoryId, products] of Object.entries(location.products)) {
    if (products.some((p) => p.id === productId)) return categoryId;
  }
  return "alle";
}

export function MietartikelSearch() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isGerman = i18n.language === "de" || i18n.language?.startsWith("de");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const allProducts = useMemo(() => getAllUniqueProducts(), []);
  const translatedProducts = useTranslatedProducts(allProducts);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);
    const queryTokens = getSearchTokens(searchQuery);
    if (!normalizedQuery || queryTokens.length === 0) return [];

    const scored = translatedProducts
      .map((translatedProduct, index) => {
        const original = allProducts[index];
        if (!original?.name) return null;

        const searchBlob = [
          original.description,
          original.detailedDescription,
          original.modelName,
          ...(original.tags ?? []),
          ...Object.entries(original.specifications ?? {}).flatMap(([key, value]) => [key, value]),
        ].filter(Boolean).join(" ");

        let score = 0;
        score += getFieldSearchScore(original.name, normalizedQuery, queryTokens, { exact: 300, startsWith: 200, includes: 150, allTokens: 220, perToken: 60 });
        score += getFieldSearchScore(translatedProduct.name, normalizedQuery, queryTokens, { exact: 260, startsWith: 180, includes: 140, allTokens: 200, perToken: 50 });
        score += getFieldSearchScore(original.modelName, normalizedQuery, queryTokens, { exact: 160, startsWith: 120, includes: 100, allTokens: 140, perToken: 35 });
        score += getFieldSearchScore(searchBlob, normalizedQuery, queryTokens, { exact: 80, startsWith: 60, includes: 40, allTokens: 70, perToken: 20 });

        if (score <= 0) return null;
        return { product: translatedProduct, score, nameLength: original.name.length };
      })
      .filter((item): item is { product: Product; score: number; nameLength: number } => Boolean(item))
      .sort((a, b) => b.score - a.score || a.nameLength - b.nameLength || a.product.name.localeCompare(b.product.name, isGerman ? "de" : "en"));

    // Round-robin durch Modellfamilien (z.B. Breitaufbau / Schmalaufbau / Standard)
    return diversifyByFamily(scored, (item) => item.product.name, 10).map(({ product }) => product);
  }, [searchQuery, translatedProducts, allProducts, isGerman]);

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
    setShowResults(false);
    setSearchQuery("");
    setShowLocationDialog(true);
  };

  const handleLocationSelect = (locationId: string) => {
    if (selectedProduct) {
      const categoryId = getCategoryForProductAtLocation(selectedProduct.id, locationId);
      navigate(`/mieten/${locationId}/${categoryId}/${selectedProduct.id}`);
    }
    setShowLocationDialog(false);
    setSelectedProduct(null);
  };

  const availableLocations = selectedProduct ? getLocationsForProduct(selectedProduct.id) : [];

  return (
    <>
      <div ref={searchRef} className="max-w-2xl mx-auto relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("mietartikel.searchPlaceholder", { defaultValue: "Artikel suchen, z.B. Minibagger, Anhänger, Hüpfburg..." })}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => { if (searchQuery) setShowResults(true); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredProducts.length > 0) {
                e.preventDefault();
                handleProductSelect(filteredProducts[0]);
              }
            }}
            className="pl-12 pr-10 py-3 h-12 text-base border-input focus-visible:ring-accent rounded-xl shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setShowResults(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {showResults && searchQuery && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg z-[100] overflow-hidden max-h-[400px] overflow-y-auto">
            {filteredProducts.length > 0 ? (
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-3 py-1 mb-1">
                  {t("hero.articlesFound", { count: filteredProducts.length })}
                </p>
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-muted transition-colors text-left group"
                  >
                    <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground/50" />
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
              </div>
            ) : (
              <div className="p-6 text-center">
                <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t("hero.noArticlesFound", { query: searchQuery })}
                </p>
              </div>
            )}
          </div>
        )}
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
