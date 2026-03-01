import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronRight, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { locations, getAllProductsForLocation, type Product } from "@/data/rentalData";
import { productTranslations, tagTranslations } from "@/i18n/productTranslations";
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
      if (!productMap.has(product.name)) {
        productMap.set(product.name, product);
      }
    }
  }
  
  return Array.from(productMap.values());
}

// Get locations that have a specific product (by name match)
function getLocationsForProduct(productName: string): typeof locations {
  return locations.filter((location) => {
    const products = getAllProductsForLocation(location.id);
    return products.some((p) => p.name === productName);
  });
}

// Get product ID at a specific location (by name match)
function getProductIdAtLocation(productName: string, locationId: string): string | null {
  const products = getAllProductsForLocation(locationId);
  const product = products.find((p) => p.name === productName);
  return product?.id || null;
}

// Get category for product at a specific location
function getCategoryForProductAtLocation(productName: string, locationId: string): string {
  const location = locations.find((l) => l.id === locationId);
  if (!location) return "alle";
  
  for (const [categoryId, products] of Object.entries(location.products)) {
    if (products.some((p) => p.name === productName)) {
      return categoryId;
    }
  }
  return "alle";
}

export function HeroSearch() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const allProducts = useMemo(() => getAllUniqueProducts(), []);

  // Filter products based on search query (matches both German and English)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allProducts
      .filter((p) => {
        // German (source) fields
        if (p.name.toLowerCase().includes(query)) return true;
        if (p.description?.toLowerCase().includes(query)) return true;
        if (p.tags?.some((t) => t.toLowerCase().includes(query))) return true;

        // English translated fields
        const tr = productTranslations[p.id];
        if (tr?.name?.toLowerCase().includes(query)) return true;
        if (tr?.description?.toLowerCase().includes(query)) return true;

        // Translated tags
        if (p.tags?.some((t) => {
          const translated = tagTranslations[t];
          return translated?.toLowerCase().includes(query);
        })) return true;

        return false;
      })
      .slice(0, 8);
  }, [searchQuery, allProducts]);

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
    setShowResults(false);
    setShowLocationDialog(true);
  };

  const handleLocationSelect = (locationId: string) => {
    if (selectedProduct) {
      const productId = getProductIdAtLocation(selectedProduct.name, locationId);
      const categoryId = getCategoryForProductAtLocation(selectedProduct.name, locationId);
      if (productId) {
        navigate(`/mieten/${locationId}/${categoryId}/${productId}`);
      }
    }
    setShowLocationDialog(false);
    setSelectedProduct(null);
    setSearchQuery("");
  };

  const handleSearchSubmit = () => {
    if (filteredProducts.length === 1) {
      handleProductSelect(filteredProducts[0]);
    } else {
      navigate(`/mieten/krefeld/alle`);
    }
  };

  const availableLocations = selectedProduct
    ? getLocationsForProduct(selectedProduct.name)
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
                  handleSearchSubmit();
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
