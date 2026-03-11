import { useState, useMemo, useCallback } from "react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { B2BProductCard } from "@/components/b2b/B2BProductCard";
import { B2BReservationDialog } from "@/components/b2b/B2BReservationDialog";
import { B2BMultiReservationDialog } from "@/components/b2b/B2BMultiReservationDialog";
import { CategoryFilter, type CategoryFilterState } from "@/components/rental/CategoryFilter";
import { TrailerFilter, type TrailerFilterState } from "@/components/rental/TrailerFilter";
import { categoryFilterMap, categorySearchPlaceholders } from "@/components/rental/categoryFilters";
import { useB2BDiscounts } from "@/hooks/useB2BDiscounts";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  locations,
  productCategories,
  getCategoriesForLocation,
  getProductsForLocationCategory,
  Product,
} from "@/data/rentalData";
import { locationData } from "@/data/locationData";
import { Search, MapPin, Percent, CreditCard, Phone, Mail, Package, Send, X, MessageCircle, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SelectedItem {
  product: Product;
  categorySlug: string;
}

export default function B2BProducts() {
  const { b2bProfile } = useAuth();
  const { t } = useTranslation();
  const { getDiscountForCategory, loading: discountsLoading } = useB2BDiscounts();

  // State
  const [selectedLocation, setSelectedLocation] = useState(
    b2bProfile?.assigned_location || "krefeld"
  );
  const [selectedCategory, setSelectedCategory] = useState("alle");
  const [searchQuery, setSearchQuery] = useState("");
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [inquiryCategory, setInquiryCategory] = useState("");

  // Category filter state
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilterState>({
    search: "",
    filters: {},
  });
  // Trailer filter state
  const [trailerFilters, setTrailerFilters] = useState<TrailerFilterState>({
    search: "",
    types: [],
    braking: [],
    weight: [],
    nutzlastRange: [0, 3000],
  });

  // Multi-select state
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
  const [multiDialogOpen, setMultiDialogOpen] = useState(false);

  // Available categories for selected location
  const availableCategories = useMemo(
    () => getCategoriesForLocation(selectedLocation),
    [selectedLocation]
  );

  // Get filter config for selected category
  const filterSections = useMemo(
    () => (selectedCategory !== "alle" ? categoryFilterMap[selectedCategory] : undefined),
    [selectedCategory]
  );

  const filterSearchPlaceholder = useMemo(
    () => categorySearchPlaceholders[selectedCategory] || "Produkt suchen...",
    [selectedCategory]
  );

  // Products filtered by location, category, search, and category-specific filters
  const filteredProducts = useMemo(() => {
    let products = getProductsForLocationCategory(selectedLocation, selectedCategory);

    // Deduplicate products that appear twice due to mergeWithFallback
    // Strategy: extract a canonical key from the name, keep the richer entry
    const canonicalKey = (name: string): string => {
      // Remove brand names and normalize to get core product identity
      return name.toLowerCase()
        .replace(/[^a-z0-9äöüßμ\/]/g, "")
        // Remove common brand prefixes that differ between locations
        .replace(/^bosch|^xcmg|^zoomlion|^allegra|^kärcher|^karcher|^doosan|^nifty|^europelift/g, "");
    };

    // Also extract a "model number" key for matching (e.g. "vp1644", "gs72xh", "zmp09")
    const modelKey = (name: string): string | null => {
      const n = name.toLowerCase();
      // Match patterns like VP 16/44, HVP 30/50, GS72-XH, ZMP09, XG0807AC, TM18GTi, HR12L, ZS1012AC
      const m = n.match(/([a-z]{1,4}\s*\d{2,6}[a-z]*[-\/]?\s*[a-z0-9]*)/);
      return m ? m[1].replace(/[\s\-\/]/g, "") : null;
    };
    
    const seenIds = new Set<string>();
    const seenKeys = new Map<string, Product>();
    const seenModels = new Map<string, Product>();
    const deduped: Product[] = [];
    
    const richness = (p: Product) => {
      const hasRealImage = p.image && p.image !== "/placeholder.svg";
      const hasSpecs = p.specifications && Object.keys(p.specifications).length > 0;
      return (hasRealImage ? 10 : 0) + (hasSpecs ? 5 : 0) + (p.detailedDescription ? 3 : 0) + (p.features?.length || 0);
    };
    
    for (const p of products) {
      if (seenIds.has(p.id)) continue;
      seenIds.add(p.id);

      const ck = canonicalKey(p.name);
      const mk = modelKey(p.name);
      
      // Check for duplicate by canonical key or model key
      const existingByKey = seenKeys.get(ck);
      const existingByModel = mk ? seenModels.get(mk) : undefined;
      const existing = existingByKey || existingByModel;
      
      if (existing) {
        // Replace if this one is richer
        if (richness(p) > richness(existing)) {
          const idx = deduped.indexOf(existing);
          if (idx >= 0) deduped[idx] = p;
          seenKeys.set(ck, p);
          if (mk) seenModels.set(mk, p);
        }
      } else {
        seenKeys.set(ck, p);
        if (mk) seenModels.set(mk, p);
        deduped.push(p);
      }
    }
    products = deduped;

    // Global search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    // Apply trailer-specific filters
    if (selectedCategory === "anhaenger") {
      if (trailerFilters.search) {
        const q = trailerFilters.search.toLowerCase();
        products = products.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
        );
      }
      if (trailerFilters.types.length > 0) {
        products = products.filter((p) => {
          const nameLower = p.name.toLowerCase();
          return trailerFilters.types.some((type) =>
            p.tags?.includes(type) ||
            (type === "geschlossen" && (nameLower.includes("planen") || nameLower.includes("koffer"))) ||
            (type === "baumaschine" && nameLower.includes("baumaschinen")) ||
            (type === "autotransport" && nameLower.includes("autotransport")) ||
            (type === "laubgitter" && (nameLower.includes("laubgitter") || nameLower.includes("kipp"))) ||
            (type === "urlaub" && nameLower.includes("urlaub"))
          );
        });
      }
      if (trailerFilters.braking.length > 0) {
        products = products.filter((p) => {
          const parsed = p.name.match(/(\d{2,5})\s*kg/i);
          const weight = p.weightKg || (parsed ? Number(parsed[1]) : 0);
          const inferred = weight > 750 ? "gebremst" : "ungebremst";
          return trailerFilters.braking.some((b) => p.tags?.includes(b) || b === inferred);
        });
      }
      if (trailerFilters.weight.length > 0) {
        products = products.filter((p) => {
          const parsed = p.name.match(/(\d{2,5})\s*kg/i);
          const productWeight = p.weightKg || (parsed ? Number(parsed[1]) : 0);
          return trailerFilters.weight.some((weightId) => {
            if (weightId === "bis-750") return productWeight <= 750;
            if (weightId === "750-1500") return productWeight > 750 && productWeight <= 1500;
            if (weightId === "1500-2500") return productWeight > 1500 && productWeight <= 2500;
            if (weightId === "ab-2500") return productWeight > 2500;
            return false;
          });
        });
      }
      // Nutzlast range filter
      if (trailerFilters.nutzlastRange[0] > 0 || trailerFilters.nutzlastRange[1] < 3000) {
        products = products.filter((p) => {
          const val = p.specifications?.["Nutzlast"];
          if (!val) return true;
          const cleaned = val.replace(/[^0-9]/g, "");
          const nutzlast = cleaned ? Number(cleaned) : 0;
          return nutzlast >= trailerFilters.nutzlastRange[0] && nutzlast <= trailerFilters.nutzlastRange[1];
        });
      }
    }

    // Apply category-specific filters (non-trailer)
    if (filterSections && selectedCategory !== "alle" && selectedCategory !== "anhaenger") {
      // Search from category filter
      if (categoryFilters.search) {
        const q = categoryFilters.search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
      }

      // Apply filter sections
      Object.entries(categoryFilters.filters).forEach(([sectionId, selectedValues]) => {
        if (selectedValues.length > 0) {
          if (sectionId === "height") {
            products = products.filter((p) => {
              const heightMatch = p.name.match(/(\d+)m\s/);
              const height = heightMatch ? parseInt(heightMatch[1], 10) : 0;
              return selectedValues.some((v) => {
                if (v === "bis-10m") return height > 0 && height <= 10;
                if (v === "10-15m") return height > 10 && height <= 15;
                if (v === "ab-15m") return height > 15;
                return p.tags?.includes(v);
              });
            });
          } else if (sectionId === "weight") {
            products = products.filter((p) => {
              const w = p.weightKg || 0;
              return selectedValues.some((v) => {
                if (v === "bis-1500") return w > 0 && w <= 1500;
                if (v === "1500-2500") return w > 1500 && w <= 2500;
                if (v === "ab-2500") return w > 2500;
                if (v === "bis-100kg") return w > 0 && w <= 100;
                if (v === "100-200kg") return w > 100 && w <= 200;
                if (v === "ab-200kg") return w > 200;
                return p.tags?.includes(v) || p.category === v;
              });
            });
          } else if (sectionId === "antrieb" || sectionId === "power") {
            products = products.filter((p) => {
              const driveType = (p as any).driveType;
              const nameLower = p.name.toLowerCase();
              return selectedValues.some((v) => {
                if (v === "akku") return nameLower.includes("akku");
                if (v === "elektro") {
                  if (driveType === "elektro" || nameLower.includes("elektro")) return true;
                  const specs = p.specifications || {};
                  const hasMainsVoltage = Object.values(specs).some(sv => 
                    String(sv).includes("230 V") || String(sv).includes("230V") || String(sv).includes("220 V")
                  );
                  if (hasMainsVoltage) return true;
                  const hasWattage = Object.values(specs).some(sv => String(sv).includes(" W"));
                  if (hasWattage && !nameLower.includes("akku") && !nameLower.includes("benzin")) return true;
                  return false;
                }
                if (v === "benzin") return driveType === "benzin" || nameLower.includes("benzin");
                if (v === "diesel") return driveType === "diesel" || nameLower.includes("diesel");
                return p.tags?.includes(v) || driveType === v;
              });
            });
          } else if (sectionId === "type" || sectionId === "maschinentyp" || sectionId === "anbaugeraet") {
            const erdMachineCategories = ["minibagger", "radlader", "dumper"];
            const erdAnbauCategories = ["tiefloeffel", "kabelloeffel", "grabenraeumloeffel", "hydraulikhammer", "sortiergreifer", "roderechen"];
            const werkzeugeTypeGroups: Record<string, string[]> = {
              saege: ["kreissaege", "saebelsaege", "stichsaege", "handkreissaege", "fugenschneider"],
              schneiden: ["fraese", "fliesenschneider", "trennschleifer", "multicutter"],
              abbruch: ["abbruchhammer"],
              schrauber: ["schlagschrauber", "drehschlagschrauber"],
              messen: ["laser", "ortungsgeraet", "linienlaser"],
              beton: ["kernbohrer", "betonruettler", "diamantbohrer", "zwangsmischer"],
              beleuchtung: ["bauleuchte"],
              zubehoer: ["zubehoer", "staubsauger", "ladegeraet", "nageler"],
            };
            products = products.filter((p) => {
              return selectedValues.some((value) => {
                if (value === "maschine") return p.tags?.includes("maschine") || erdMachineCategories.includes(p.category || "");
                if (value === "anbaugeraet") return erdAnbauCategories.includes(p.category || "");
                // Check werkzeuge type groups
                const groupCats = werkzeugeTypeGroups[value];
                if (groupCats && p.category && groupCats.includes(p.category)) return true;
                return p.tags?.includes(value) || p.category === value;
              });
            });
          } else {
            products = products.filter((p) =>
              selectedValues.some((value) => p.tags?.includes(value) || p.category === value)
            );
          }
        }
      });
    }

    return products;
  }, [selectedLocation, selectedCategory, searchQuery, categoryFilters, filterSections, trailerFilters]);

  // Find category slug for a product (for discount lookup)
  const getCategoryForProduct = useCallback((product: Product): string => {
    if (selectedCategory !== "alle") return selectedCategory;
    const location = locations.find((l) => l.id === selectedLocation);
    if (!location) return "";
    for (const [catId, prods] of Object.entries(location.products)) {
      if (prods.some((p) => p.id === product.id)) return catId;
    }
    return "";
  }, [selectedCategory, selectedLocation]);

  // Credit limit info
  const creditLimit = b2bProfile?.credit_limit || 0;
  const usedCredit = b2bProfile?.used_credit || 0;
  const availableCredit = creditLimit - usedCredit;
  const creditUsagePercent = creditLimit > 0 ? (usedCredit / creditLimit) * 100 : 0;

  // Assigned contact person
  const assignedLoc = locationData.find((l) => l.id === b2bProfile?.assigned_location);
  const contactPerson = b2bProfile?.assigned_contact_override 
    ? b2bProfile.assigned_contact_override 
    : assignedLoc?.manager;
  const whatsappNumbers: Record<string, string> = {
    krefeld: "4915789150872",
    bonn: "4915757151584",
  };

  const handleInquiry = (product: Product) => {
    const catSlug = getCategoryForProduct(product);
    setInquiryProduct(product);
    setInquiryCategory(catSlug);
  };

  const handleToggleSelect = useCallback((product: Product) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.set(product.id, {
          product,
          categorySlug: getCategoryForProduct(product),
        });
      }
      return next;
    });
  }, [getCategoryForProduct]);

  const handleRemoveProduct = useCallback((productId: string) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      next.delete(productId);
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedItems(new Map());
  }, []);

  const handleMultiSuccess = useCallback(() => {
    setSelectedItems(new Map());
  }, []);

  const handleCategoryChange = useCallback((catId: string) => {
    setSelectedCategory(catId);
    setCategoryFilters({ search: "", filters: {} });
    setTrailerFilters({ search: "", types: [], braking: [], weight: [], nutzlastRange: [0, 3000] });
  }, []);

  const selectedCount = selectedItems.size;

  const multiProducts = useMemo(
    () =>
      Array.from(selectedItems.values()).map((item) => ({
        product: item.product,
        categorySlug: item.categorySlug,
        quantity: 1,
      })),
    [selectedItems]
  );

  return (
    <B2BPortalLayout
      title="Produkte & Anfragen"
      subtitle={`${filteredProducts.length} Produkte verfügbar`}
    >
      {/* Top info bar: Credit + Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 md:mb-6">
        {/* Credit Limit Card */}
        {creditLimit > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-headline">Kreditlimit</span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-headline">
                  {availableCredit.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                </span>
                <span className="text-xs text-muted-foreground">
                  von {creditLimit.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} verfügbar
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    creditUsagePercent > 80 ? "bg-destructive" : creditUsagePercent > 50 ? "bg-yellow-500" : "bg-accent"
                  }`}
                  style={{ width: `${Math.min(creditUsagePercent, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Person */}
        {contactPerson && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-headline">Ihr Ansprechpartner</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  {(contactPerson as any).image ? (
                    <AvatarImage src={(contactPerson as any).image} alt={(contactPerson as any).name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {(contactPerson as any).name?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-headline text-sm">{(contactPerson as any).name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t((contactPerson as any).role || "locations.locationManager")}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                {assignedLoc && (
                  <a href={`tel:${assignedLoc.phone.replace(/\s/g, '')}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {assignedLoc.phone}
                  </a>
                )}
                <a href={`mailto:${(contactPerson as any).email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {(contactPerson as any).email}
                </a>
                {assignedLoc && whatsappNumbers[assignedLoc.id] && (
                  <a href={`https://wa.me/${whatsappNumbers[assignedLoc.id]}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    WhatsApp
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selection hint */}
      <div className="flex items-center gap-2 mb-3 md:mb-4 p-2.5 md:p-3 bg-muted/50 rounded-lg text-xs md:text-sm text-muted-foreground">
        <Package className="h-4 w-4 flex-shrink-0" />
        <span className="hidden sm:inline">Klicke auf Produkte, um sie für eine <strong>Sammelanfrage</strong> auszuwählen, oder nutze „Anfrage" für ein einzelnes Produkt.</span>
        <span className="sm:hidden">Produkte für <strong>Sammelanfrage</strong> auswählen oder einzeln anfragen.</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 md:mb-6">
        {/* Location */}
        <Select value={selectedLocation} onValueChange={(v) => { setSelectedLocation(v); handleCategoryChange("alle"); }}>
          <SelectTrigger className="w-full sm:w-48">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search (only when no category filter or trailer filter is shown) */}
        {!filterSections && selectedCategory !== "anhaenger" && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Produkt suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-3 mb-4 md:mb-6 -mx-2 px-2 scrollbar-none">
        {availableCategories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const discount = cat.id !== "alle" ? getDiscountForCategory(cat.id) : 0;
          return (
            <Button
              key={cat.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`whitespace-nowrap ${isActive ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.title}
              {discount > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs bg-accent/20 text-accent">
                  -{discount}%
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Trailer-specific filters */}
      {selectedCategory === "anhaenger" && (
        <div className="mb-6">
          <TrailerFilter onFilterChange={setTrailerFilters} />
        </div>
      )}

      {/* Category-specific filters (non-trailer) */}
      {filterSections && selectedCategory !== "anhaenger" && (
        <div className="mb-6">
          <CategoryFilter
            searchPlaceholder={t(filterSearchPlaceholder)}
            sections={filterSections}
            onFilterChange={setCategoryFilters}
            variant="badges"
          />
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {searchQuery || categoryFilters.search
              ? `Keine Produkte für "${searchQuery || categoryFilters.search}" gefunden.`
              : "Keine Produkte in dieser Kategorie verfügbar."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pb-24">
          {filteredProducts.map((product) => {
            const catSlug = getCategoryForProduct(product);
            const discount = getDiscountForCategory(catSlug);
            return (
              <B2BProductCard
                key={product.id}
                product={product}
                categorySlug={catSlug}
                locationId={selectedLocation}
                discountPercent={discount}
                onInquiry={handleInquiry}
                isSelected={selectedItems.has(product.id)}
                onToggleSelect={handleToggleSelect}
              />
            );
          })}
        </div>
      )}

      {/* Floating selection bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg safe-area-bottom">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-accent text-accent-foreground text-base px-3 py-1">
                {selectedCount}
              </Badge>
              <span className="text-sm font-medium text-headline hidden sm:inline">
                {selectedCount === 1 ? "Artikel ausgewählt" : "Artikel ausgewählt"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Auswahl aufheben</span>
              </Button>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                onClick={() => setMultiDialogOpen(true)}
              >
                <Send className="h-4 w-4 mr-1.5" />
                Sammelanfrage senden
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Single Reservation Dialog */}
      <B2BReservationDialog
        product={inquiryProduct}
        categorySlug={inquiryCategory}
        discountPercent={inquiryCategory ? getDiscountForCategory(inquiryCategory) : 0}
        open={!!inquiryProduct}
        onOpenChange={(open) => !open && setInquiryProduct(null)}
        preselectedLocation={selectedLocation}
      />

      {/* Multi Reservation Dialog */}
      <B2BMultiReservationDialog
        selectedProducts={multiProducts}
        open={multiDialogOpen}
        onOpenChange={setMultiDialogOpen}
        preselectedLocation={selectedLocation}
        onSuccess={handleMultiSuccess}
        onRemoveProduct={handleRemoveProduct}
      />
    </B2BPortalLayout>
  );
}
