import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronRight, Package, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { locations, getAllProductsForLocation, type Product } from "@/data/rentalData";
import { productTranslations } from "@/i18n/productTranslations";
import { useTranslatedProducts } from "@/hooks/useTranslatedProduct";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function getLocationsForProduct(productId: string): typeof locations {
  return locations.filter((location) => {
    const products = getAllProductsForLocation(location.id);
    return products.some((p) => p.id === productId);
  });
}

function getProductIdAtLocation(productId: string, locationId: string): string | null {
  const products = getAllProductsForLocation(locationId);
  const product = products.find((p) => p.id === productId);
  return product?.id || null;
}

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

interface ProductSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductSearchDialog({ open, onOpenChange }: ProductSearchDialogProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showLocationStep, setShowLocationStep] = useState(false);

  const allProducts = useMemo(() => getAllUniqueProducts(), []);
  const translatedProducts = useTranslatedProducts(allProducts);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return translatedProducts.slice(0, 8);
    const query = searchQuery.toLowerCase();
    return translatedProducts
      .filter((p, index) => {
        if (p.name.toLowerCase().includes(query)) return true;
        if (p.description?.toLowerCase().includes(query)) return true;
        if (p.tags?.some((t) => t.toLowerCase().includes(query))) return true;
        const original = allProducts[index];
        if (original) {
          if (original.name.toLowerCase().includes(query)) return true;
          if (original.description?.toLowerCase().includes(query)) return true;
          if (original.tags?.some((t) => t.toLowerCase().includes(query))) return true;
        }
        const tr = productTranslations[p.id];
        if (tr?.name?.toLowerCase().includes(query)) return true;
        if (tr?.description?.toLowerCase().includes(query)) return true;
        return false;
      })
      .slice(0, 8);
  }, [searchQuery, translatedProducts, allProducts]);

  const availableLocations = selectedProduct
    ? getLocationsForProduct(selectedProduct.id)
    : [];

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowLocationStep(true);
  };

  const handleLocationSelect = (locationId: string) => {
    if (selectedProduct) {
      const productId = getProductIdAtLocation(selectedProduct.id, locationId);
      const categoryId = getCategoryForProductAtLocation(selectedProduct.id, locationId);
      if (productId) {
        navigate(`/mieten/${locationId}/${categoryId}/${productId}`);
      }
    }
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchQuery("");
    setSelectedProduct(null);
    setShowLocationStep(false);
  };

  const handleBack = () => {
    setSelectedProduct(null);
    setShowLocationStep(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {showLocationStep ? t("hero.selectLocation") : t("steps.step2Cta")}
          </DialogTitle>
        </DialogHeader>

        {!showLocationStep ? (
          <>
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("hero.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 py-3 h-auto text-base"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Product List */}
            <div className="overflow-y-auto flex-1 -mx-2 px-2">
              {filteredProducts.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground px-1 py-1">
                    {searchQuery
                      ? t("hero.articlesFound", { count: filteredProducts.length })
                      : t("steps.step2Cta")}
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
                <div className="py-8 text-center">
                  <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t("hero.noArticlesFound", { query: searchQuery })}
                  </p>
                </div>
              )}
            </div>

            {/* Browse all link */}
            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigate("/mieten");
                  handleClose();
                }}
              >
                {t("hero.browseAll")}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Selected product info */}
            {selectedProduct && (
              <div className="p-3 bg-muted rounded-lg flex items-center gap-3">
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

            {/* Location list */}
            <div className="space-y-2 overflow-y-auto flex-1">
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
            </div>

            {/* Back button */}
            <div className="pt-2 border-t border-border">
              <Button variant="ghost" className="w-full" onClick={handleBack}>
                ← {t("steps.step2Cta")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
