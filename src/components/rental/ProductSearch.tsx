import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { productCategories, type ProductCategory } from "@/data/rentalData";

interface ProductSearchProps {
  locationId: string;
  onCategorySelect?: (categoryId: string) => void;
  placeholder?: string;
}

export function ProductSearch({ 
  locationId, 
  onCategorySelect,
  placeholder = "Produkte suchen..."
}: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Search through categories and their descriptions
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase().trim();
    
    return productCategories
      .filter((cat) => cat.id !== "alle")
      .filter((cat) => 
        cat.title.toLowerCase().includes(searchTerm) ||
        cat.description.toLowerCase().includes(searchTerm)
      )
      .slice(0, 6);
  }, [query]);

  const handleSelect = (categoryId: string) => {
    setQuery("");
    setIsFocused(false);
    if (onCategorySelect) {
      onCategorySelect(categoryId);
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
          {searchResults.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSelect(category.id)}
              className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
            >
              {category.icon && (
                <img 
                  src={category.icon} 
                  alt="" 
                  className="w-8 h-8 object-contain"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {category.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {category.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isFocused && query.trim() && searchResults.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
          Keine Kategorien gefunden für "{query}"
        </div>
      )}
    </div>
  );
}
