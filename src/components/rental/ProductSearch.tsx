import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { productCategories, getProductsForLocationCategory, type Product, type ProductCategory } from "@/data/rentalData";
import { productTranslations, categoryTranslations, tagTranslations } from "@/i18n/productTranslations";

interface ProductSearchProps {
  locationId: string;
  onCategorySelect?: (categoryId: string) => void;
  onProductSelect?: (product: Product, categoryId: string) => void;
  placeholder?: string;
}

type SearchResult = 
  | { type: "category"; category: ProductCategory }
  | { type: "product"; product: Product; categoryId: string };

export function ProductSearch({ 
  locationId, 
  onCategorySelect,
  onProductSelect,
  placeholder = "Mietartikel suchen..."
}: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();

  // Search through products and categories
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase().trim();
    const results: SearchResult[] = [];
    
    // Search products first
    const categories = productCategories.filter((cat) => cat.id !== "alle");
    
    for (const category of categories) {
      const products = getProductsForLocationCategory(locationId, category.id);
      
      for (const product of products) {
        const tr = productTranslations[product.id];
        if (
          product.name.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          tr?.name?.toLowerCase().includes(searchTerm) ||
          tr?.description?.toLowerCase().includes(searchTerm)
        ) {
          results.push({ type: "product", product, categoryId: category.id });
        }
      }
    }
    
    // Then add matching categories
    for (const category of categories) {
      const catTr = categoryTranslations[category.id];
      if (
        category.title.toLowerCase().includes(searchTerm) ||
        category.description.toLowerCase().includes(searchTerm) ||
        catTr?.title?.toLowerCase().includes(searchTerm) ||
        catTr?.description?.toLowerCase().includes(searchTerm)
      ) {
        results.push({ type: "category", category });
      }
    }
    
    return results.slice(0, 8);
  }, [query, locationId]);

  const handleSelect = (result: SearchResult) => {
    setQuery("");
    setIsFocused(false);
    
    if (result.type === "product") {
      // Open product dialog directly
      if (onProductSelect) {
        onProductSelect(result.product, result.categoryId);
      }
    } else {
      if (onCategorySelect) {
        onCategorySelect(result.category.id);
      }
    }
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isFocused && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          {searchResults.map((result, index) => (
            <button
              key={result.type === "product" ? `product-${result.product.id}` : `category-${result.category.id}`}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
            >
              {result.type === "product" ? (
                <>
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {result.product.image ? (
                      <img src={result.product.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Search className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {lang !== "de" && productTranslations[result.product.id]?.name
                        ? productTranslations[result.product.id].name
                        : result.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lang !== "de" && productTranslations[result.product.id]?.description
                        ? productTranslations[result.product.id].description
                        : result.product.description}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {result.category.icon && (
                    <img 
                      src={result.category.icon} 
                      alt="" 
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {lang !== "de" && categoryTranslations[result.category.id]?.title
                        ? categoryTranslations[result.category.id].title
                        : result.category.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Kategorie
                    </p>
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isFocused && query.trim() && searchResults.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
          Keine Artikel gefunden für "{query}"
        </div>
      )}
    </div>
  );
}
