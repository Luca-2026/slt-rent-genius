import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Grid3X3, Package, Clock, Smartphone, Lock, Scale, Boxes, Gauge, Shovel, Truck, Zap, Leaf, Wrench, HardHat, Search, X } from "lucide-react";
import { 
  getLocationById, 
  getCategoryById, 
  getCategoriesForLocation,
  getProductsForLocationCategory,
  type Product
} from "@/data/rentalData";
import { ProductCard } from "@/components/rental/ProductCard";
import { ProductBookingDialog } from "@/components/rental/ProductBookingDialog";
import { DeliveryCalculatorCompact } from "@/components/products/DeliveryCalculatorCompact";
import { TrailerFilter, type TrailerFilterState } from "@/components/rental/TrailerFilter";
import { EarthMovingFilter, type EarthMovingFilterState } from "@/components/rental/EarthMovingFilter";
import { CategoryFilter, type CategoryFilterState } from "@/components/rental/CategoryFilter";
import { CategoryInfoBanner } from "@/components/rental/CategoryInfoBanner";
import { categoryFilterMap, categorySearchPlaceholders, categoryDisplayNames } from "@/components/rental/categoryFilters";

export default function CategoryProducts() {
  const { t } = useTranslation();
  const { locationId, categoryId } = useParams<{ locationId: string; categoryId: string }>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allSearchQuery, setAllSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [trailerFilters, setTrailerFilters] = useState<TrailerFilterState>({
    search: "",
    types: [],
    braking: [],
    weight: [],
  });
  const [earthMovingFilters, setEarthMovingFilters] = useState<EarthMovingFilterState>({
    search: "",
    types: [],
    driveTypes: [],
    weightRange: [],
  });
  const [genericFilters, setGenericFilters] = useState<CategoryFilterState>({
    search: "",
    filters: {},
  });
  
  const location = locationId ? getLocationById(locationId) : undefined;
  const category = categoryId ? getCategoryById(categoryId) : undefined;

  const allProducts = useMemo(() => {
    if (!location || !category) return [];
    return getProductsForLocationCategory(location.id, category.id);
  }, [location, category]);

  // Get categories that actually have products for quick filter (excluding "alle")
  const availableCategories = useMemo(() => {
    if (!location) return [];
    return getCategoriesForLocation(location.id).filter((c) => {
      if (c.id === "alle") return false;
      // Only show categories that have products
      const products = getProductsForLocationCategory(location.id, c.id);
      return products.length > 0;
    });
  }, [location]);

  const otherCategories = useMemo(() => {
    if (!location || !category) return [];
    return getCategoriesForLocation(location.id).filter(
      (c) => c.id !== category.id && c.id !== "alle"
    );
  }, [location, category]);
  
  // Create a mapping from product to its main category
  const productCategoryMap = useMemo(() => {
    if (!location) return new Map<string, string>();
    const map = new Map<string, string>();
    
    for (const mainCategoryId of location.availableCategories) {
      const products = location.products[mainCategoryId] || [];
      for (const product of products) {
        map.set(product.id, mainCategoryId);
      }
    }
    return map;
  }, [location]);

  // Filter and sort products
  const products = useMemo(() => {
    let filtered = [...allProducts];

    // Apply "alle" category filters (search and category filter)
    if (category?.id === "alle") {
      // Search filter
      if (allSearchQuery) {
        const searchLower = allSearchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower)
        );
      }
      
      // Category filter - filter by main category, not product sub-category
      if (selectedCategoryFilter) {
        filtered = filtered.filter((p) => productCategoryMap.get(p.id) === selectedCategoryFilter);
      }
    }

    // Apply trailer-specific filters only for anhänger category
    if (category?.id === "anhaenger") {
      // Search filter
      if (trailerFilters.search) {
        const searchLower = trailerFilters.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower)
        );
      }

      // Type filters
      if (trailerFilters.types.length > 0) {
        filtered = filtered.filter((p) =>
          trailerFilters.types.some((type) => p.tags?.includes(type))
        );
      }

      // Braking filters
      if (trailerFilters.braking.length > 0) {
        filtered = filtered.filter((p) =>
          trailerFilters.braking.some((brake) => p.tags?.includes(brake))
        );
      }

      // Weight filters
      if (trailerFilters.weight.length > 0) {
        filtered = filtered.filter((p) => {
          // Some location inventories may not provide weightKg consistently.
          // Fallback: parse "xxxx kg" from name.
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

      // Type filters (fallback to name if tags are missing)
      if (trailerFilters.types.length > 0) {
        filtered = filtered.filter((p) => {
          const nameLower = p.name.toLowerCase();
          return trailerFilters.types.some((type) =>
            p.tags?.includes(type) ||
            (type === "geschlossen" && (nameLower.includes("planen") || nameLower.includes("koffer"))) ||
            (type === "baumaschine" && nameLower.includes("baumaschinen")) ||
            (type === "autotransport" && nameLower.includes("autotransport")) ||
            (type === "laubgitter" && nameLower.includes("laubgitter")) ||
            (type === "urlaub" && nameLower.includes("urlaub"))
          );
        });
      }

      // Braking filters (fallback from weight)
      if (trailerFilters.braking.length > 0) {
        filtered = filtered.filter((p) => {
          const parsed = p.name.match(/(\d{2,5})\s*kg/i);
          const weight = p.weightKg || (parsed ? Number(parsed[1]) : 0);
          const inferred = weight > 750 ? "gebremst" : "ungebremst";
          return trailerFilters.braking.some((b) => p.tags?.includes(b) || b === inferred);
        });
      }
    }

    // Apply earth moving filters for erdbewegung category
    if (category?.id === "erdbewegung") {
      // Search filter
      if (earthMovingFilters.search) {
        const searchLower = earthMovingFilters.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower)
        );
      }

      // Type filters (minibagger, radlader, dumper)
      if (earthMovingFilters.types.length > 0) {
        filtered = filtered.filter((p) => {
          const nameLower = p.name.toLowerCase();
          const inferredType =
            nameLower.includes("radlader") ? "radlader" :
            nameLower.includes("dumper") ? "dumper" :
            "minibagger";

          return earthMovingFilters.types.some(
            (type) => p.tags?.includes(type) || p.category === type || type === inferredType
          );
        });
      }

      // Drive type filters (diesel, benzin, elektro)
      if (earthMovingFilters.driveTypes.length > 0) {
        filtered = filtered.filter((p) => {
          const driveType = (p as unknown as { driveType?: string }).driveType;
          return earthMovingFilters.driveTypes.some(
            (drive) => p.tags?.includes(drive) || driveType === drive
          );
        });
      }

      // Weight range filters
      if (earthMovingFilters.weightRange.length > 0) {
        filtered = filtered.filter((p) => {
          const weightKg = p.weightKg || 0;
          const inferredRange =
            weightKg <= 0 ? undefined :
            weightKg <= 1500 ? "bis-1500" :
            weightKg <= 2500 ? "1500-2500" :
            "ab-2500";

          return earthMovingFilters.weightRange.some(
            (range) => p.tags?.includes(range) || range === inferredRange
          );
        });
      }
    }

    // Apply generic filters for other categories
    const hasGenericFilter = categoryFilterMap[category?.id || ""];
    if (hasGenericFilter && category?.id !== "anhaenger" && category?.id !== "erdbewegung" && category?.id !== "alle") {
      // Search filter
      if (genericFilters.search) {
        const searchLower = genericFilters.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower)
        );
      }

      // Type group mappings for complex categories
      const werkzeugeTypeGroups: Record<string, string[]> = {
        // include typical special machines that still belong to "Sägen" UX bucket
        saege: ["kreissaege", "saebelsaege", "stichsaege", "handkreissaege", "fugenschneider"],
        abbruch: ["abbruchhammer"],
        messen: ["laser", "ortungsgeraet", "linienlaser"],
        beton: ["kernbohrer", "betonruettler", "diamantbohrer", "zwangsmischer"],
        zubehoer: ["zubehoer", "staubsauger"],
      };

      const kabelStromverteilerTypeGroups: Record<string, string[]> = {
        stromverteiler: ["stromverteiler", "anschlussschrank"],
        adapter: ["adapter"],
        kabelbruecke: ["kabelbruecke"],
        erdung: ["erdung"],
      };

      const kabelStromverteilerKabeltypGroups: Record<string, string[]> = {
        schuko: ["schuko-kabel", "kabeltrommel"],
        cee: ["cee-kabel"],
        powercon: ["powercon-kabel"],
        "powercon-true1": ["powercon-kabel"],
        lautsprecherkabel: ["lautsprecherkabel"],
        netzwerk: ["netzwerkkabel"],
        hdmi: ["hdmi-kabel"],
      };

      const gartenpflegeTypeGroups: Record<string, string[]> = {
        schneiden: ["kettensaege", "heckenschere", "freischneider"],
        boden: ["erdbohrer", "bodenhacke", "stubbenfraese"],
        rasen: ["vertikutierer", "rasenwalze", "rasenmaeher"],
        reinigen: ["hochdruckreiniger"],
        entsorgen: ["haecksler", "laubblaeser"],
      };

      // Apply each filter section
      Object.entries(genericFilters.filters).forEach(([sectionId, selectedValues]) => {
        if (selectedValues.length > 0) {
          // Special handling for weight-based filters
          if (sectionId === "weight") {
            filtered = filtered.filter((p) => {
              const productWeight = p.weightKg || 0;
              return selectedValues.some((weightId) => {
                if (weightId === "bis-100kg") return productWeight > 0 && productWeight <= 100;
                if (weightId === "100-200kg") return productWeight > 100 && productWeight <= 200;
                if (weightId === "ab-200kg") return productWeight > 200;
                return p.tags?.includes(weightId) || p.category === weightId;
              });
            });
          } 
          // Special handling for height-based filters (Arbeitsbühnen)
          else if (sectionId === "height") {
            filtered = filtered.filter((p) => {
              // Extract height from product name (e.g., "8m Scherenbühne" -> 8)
              const heightMatch = p.name.match(/(\d+)m\s/);
              const height = heightMatch ? parseInt(heightMatch[1], 10) : 0;
              return selectedValues.some((heightId) => {
                if (heightId === "bis-10m") return height > 0 && height <= 10;
                if (heightId === "10-15m") return height > 10 && height <= 15;
                if (heightId === "ab-15m") return height > 15;
                return p.tags?.includes(heightId);
              });
            });
          }
          // Special handling for power filters (Werkzeuge vs Aggregate)
          else if (sectionId === "power") {
            filtered = filtered.filter((p) => {
              const nameLower = p.name.toLowerCase();
              return selectedValues.some((powerId) => {
                // Werkzeuge: antrieb
                if (powerId === "akku" || powerId === "elektro" || powerId === "benzin") {
                  if (powerId === "akku") return nameLower.includes("akku");
                  if (powerId === "elektro") return nameLower.includes("elektro") || (p.category?.includes("elektro"));
                  if (powerId === "benzin") return nameLower.includes("benzin");
                }

                // Aggregate: kVA ranges
                if (powerId === "bis-5kva" || powerId === "5-20kva" || powerId === "ab-20kva") {
                  const kvaMatch = p.name.match(/(\d+(?:[.,]\d+)?)\s*kva/i);
                  const kva = kvaMatch ? Number(kvaMatch[1].replace(",", ".")) : undefined;
                  if (!kva) return p.tags?.includes(powerId);
                  if (powerId === "bis-5kva") return kva <= 5;
                  if (powerId === "5-20kva") return kva > 5 && kva <= 20;
                  if (powerId === "ab-20kva") return kva > 20;
                }
                return p.tags?.includes(powerId) || p.category === powerId;
              });
            });
          }
          // Type filter with group mappings
          else if (sectionId === "type") {
            filtered = filtered.filter((p) => {
              return selectedValues.some((value) => {
                // Check direct match first
                if (p.tags?.includes(value) || p.category === value) return true;
                // Category-specific group mappings
                const groupCategories =
                  category?.id === "werkzeuge" ? werkzeugeTypeGroups[value] :
                  category?.id === "gartenpflege" ? gartenpflegeTypeGroups[value] :
                  category?.id === "kabel-stromverteiler" ? kabelStromverteilerTypeGroups[value] :
                  undefined;

                if (groupCategories && p.category) return groupCategories.includes(p.category);
                return false;
              });
            });
          }
          // Kabeltyp filter for kabel-stromverteiler
          else if (sectionId === "kabeltyp") {
            filtered = filtered.filter((p) => {
              return selectedValues.some((value) => {
                if (value === "powercon-true1") {
                  return p.category === "powercon-kabel" && (p.name.toLowerCase().includes("true1") || p.name.toLowerCase().includes("true 1"));
                }
                if (value === "powercon") {
                  return p.category === "powercon-kabel" && !p.name.toLowerCase().includes("true1") && !p.name.toLowerCase().includes("true 1");
                }
                const groupCategories = kabelStromverteilerKabeltypGroups[value];
                if (groupCategories && p.category) return groupCategories.includes(p.category);
                return p.tags?.includes(value) || p.category === value;
              });
            });
          }
          // Kabellänge filter
          else if (sectionId === "laenge") {
            filtered = filtered.filter((p) => {
              const lengthStr = p.specifications?.["Kabellänge"] || p.specifications?.["Leitungslänge"] || "";
              const lengthMatch = lengthStr.match(/([\d,]+)\s*m/);
              const length = lengthMatch ? parseFloat(lengthMatch[1].replace(",", ".")) : 0;
              if (length === 0) {
                // Also try extracting from product name
                const nameMatch = p.name.match(/(\d+)\s*m\b/);
                const nameLength = nameMatch ? parseInt(nameMatch[1], 10) : 0;
                if (nameLength === 0) return false;
                return selectedValues.some((v) => {
                  if (v === "bis-3m") return nameLength <= 3;
                  if (v === "5m") return nameLength === 5;
                  if (v === "10m") return nameLength === 10;
                  if (v === "20m") return nameLength === 20;
                  if (v === "ab-25m") return nameLength >= 25;
                  return false;
                });
              }
              return selectedValues.some((v) => {
                if (v === "bis-3m") return length <= 3;
                if (v === "5m") return length === 5;
                if (v === "10m") return length === 10;
                if (v === "20m") return length === 20;
                if (v === "ab-25m") return length >= 25;
                return false;
              });
            });
          }
          // Standard tag/category matching
          else {
            filtered = filtered.filter((p) =>
              selectedValues.some((value) => p.tags?.includes(value) || p.category === value)
            );
          }
        }
      });
    }

    return filtered;
  }, [allProducts, allSearchQuery, selectedCategoryFilter, productCategoryMap, trailerFilters, earthMovingFilters, genericFilters, category?.id]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  if (!location) {
    return (
      <Layout>
        <div className="section-container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("rental.locationNotFound")}</h1>
          <Link to="/mieten">
            <Button>{t("rental.backToLocations")}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="section-container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("rental.categoryNotFound")}</h1>
          <Link to={`/mieten/${location.id}`}>
            <Button>{t("rental.backToCategories")}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary py-8 lg:py-12">
        <div className="section-container">
          <Link 
            to={`/mieten/${location.id}`}
            className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("rental.backTo", { name: location.name })}
          </Link>

          <div className="flex items-start gap-6">
            {/* Category Icon - consistent across all categories */}
            {category.id === "alle" ? (
              <div className="w-20 h-20 bg-background rounded-xl p-3 flex items-center justify-center">
                <Grid3X3 className="h-10 w-10 text-primary" />
              </div>
            ) : category.icon ? (
              <img 
                src={category.icon} 
                alt={category.title}
                className="w-24 h-24 object-contain"
              />
            ) : (
              <div className="w-20 h-20 bg-background rounded-xl flex items-center justify-center">
                <div className="w-full h-full bg-muted rounded-lg" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 text-primary-foreground/80 text-sm mb-1">
                <MapPin className="h-4 w-4" />
                <span>{location.name}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                {category.title}
              </h1>
              <p className="text-primary-foreground/80 mt-1">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 24/7 Info Banner for Anhänger */}
      {category.id === "anhaenger" && (
        <section className="bg-accent/10 border-y border-accent/20">
          <div className="section-container py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                   <p className="font-semibold text-foreground">{t("rental.trailerAvailable247")}</p>
                   <p className="text-sm text-muted-foreground">{t("rental.trailerCodeSystem")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-accent" />
                </div>
                <div>
                   <p className="font-semibold text-foreground">{t("rental.trailerSmsCode")}</p>
                   <p className="text-sm text-muted-foreground">{t("rental.trailerSmsCodeDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-accent" />
                </div>
                <div>
                   <p className="font-semibold text-foreground">{t("rental.trailerUnlock")}</p>
                   <p className="text-sm text-muted-foreground">{t("rental.trailerUnlockDesc")}</p>
                </div>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-accent/20 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-accent" />
                </div>
                <div>
                   <p className="font-semibold text-foreground">{t("rental.trailerWeight")}</p>
                   <p className="text-sm text-muted-foreground">{t("rental.trailerWeightDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Boxes className="h-5 w-5 text-accent" />
                </div>
                <div>
                   <p className="font-semibold text-foreground">{t("rental.trailerVariety")}</p>
                   <p className="text-sm text-muted-foreground">{t("rental.trailerVarietyDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Gauge className="h-5 w-5 text-accent" />
                </div>
                <div>
                   <p className="font-semibold text-foreground">{t("rental.trailerSpeed")}</p>
                   <p className="text-sm text-muted-foreground">{t("rental.trailerSpeedDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Info Banner for Erdbewegung */}
      {category.id === "erdbewegung" && (
        <section className="bg-accent/10 border-y border-accent/20">
          <div className="section-container py-6">
            {/* Main Description */}
             <p className="text-foreground mb-6">
               {t("rental.earthMovingDesc")}
              </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Shovel className="h-5 w-5 text-accent" />
                </div>
                <div>
                   <p className="font-semibold text-foreground">{t("rental.miniExcavator")}</p>
                   <p className="text-sm text-muted-foreground">{t("rental.miniExcavatorDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-accent" />
                </div>
                <div>
                   <p className="font-semibold text-foreground">{t("rental.dumperLoader")}</p>
                   <p className="text-sm text-muted-foreground">{t("rental.dumperLoaderDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-accent" />
                </div>
                <div>
                   <p className="font-semibold text-foreground">{t("rental.reliable")}</p>
                   <p className="text-sm text-muted-foreground">{t("rental.reliableDesc")}</p>
                </div>
              </div>
            </div>
            
            {/* Sustainability Highlight */}
            <div className="mt-6 pt-6 border-t border-accent/20">
              <div className="flex items-start gap-4 bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                     <p className="font-semibold text-foreground">{t("rental.sustainableBuilding")}</p>
                   </div>
                   <p className="text-sm text-muted-foreground">
                     {t("rental.sustainableBuildingDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Info Banner for other categories */}
      {category.id !== "anhaenger" && category.id !== "erdbewegung" && category.id !== "alle" && (
        <CategoryInfoBanner categoryId={category.id} />
      )}

      {/* Products */}
      <section className="py-8 lg:py-12">
        <div className="section-container">
          {allProducts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar with Filters */}
              <div className="lg:col-span-1 order-1 lg:order-1">
                <div className="sticky top-4 space-y-6">
                  {/* "Alle" category: Search + Category Filter + Delivery Calculator */}
                  {category.id === "alle" && (
                    <>
                      {/* Search */}
                      <div className="bg-card border border-border rounded-xl p-4">
                         <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                           <Search className="h-4 w-4" />
                           {t("rental.articleSearch")}
                         </h3>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder={t("rental.searchArticlesShort")}
                            value={allSearchQuery}
                            onChange={(e) => setAllSearchQuery(e.target.value)}
                            className="pr-8"
                          />
                          {allSearchQuery && (
                            <button
                              onClick={() => setAllSearchQuery("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Category Quick Filter with scroll */}
                      <div className="bg-card border border-border rounded-xl p-4">
                        <h3 className="font-semibold text-foreground mb-3">
                          {t("rental.categoriesCount", { count: availableCategories.length })}
                        </h3>
                        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                          <button
                            onClick={() => setSelectedCategoryFilter(null)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedCategoryFilter === null
                                ? "bg-primary text-primary-foreground font-medium"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {t("rental.allCategories")}
                          </button>
                          {availableCategories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => setSelectedCategoryFilter(cat.id === selectedCategoryFilter ? null : cat.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                selectedCategoryFilter === cat.id
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {cat.title}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Delivery Calculator for all */}
                      <DeliveryCalculatorCompact showAllCategories />
                    </>
                  )}
                  {category.id === "anhaenger" && (
                    <TrailerFilter onFilterChange={setTrailerFilters} />
                  )}
                  {category.id === "erdbewegung" && (
                    <>
                      <EarthMovingFilter onFilterChange={setEarthMovingFilters} />
                      <DeliveryCalculatorCompact 
                        productCategoryId={category.id} 
                        categoryDisplayName={categoryDisplayNames[category.id]}
                      />
                    </>
                  )}
                  {/* Generic filter for other categories */}
                  {category.id !== "anhaenger" && category.id !== "erdbewegung" && category.id !== "alle" && (
                    <>
                      {categoryFilterMap[category.id] && (
                        <CategoryFilter
                          searchPlaceholder={categorySearchPlaceholders[category.id] || "Artikel suchen..."}
                          sections={categoryFilterMap[category.id]}
                          onFilterChange={setGenericFilters}
                          variant="badges"
                        />
                      )}
                      <DeliveryCalculatorCompact 
                        productCategoryId={category.id}
                        categoryDisplayName={categoryDisplayNames[category.id]}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Product Grid */}
              <div className="lg:col-span-2 order-2 lg:order-2">
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {products.map((product) => {
                      // Get the product's main category for the URL
                      const productMainCategory = productCategoryMap.get(product.id) || category.id;
                      const productLink = `/mieten/${location.id}/${productMainCategory}/${product.id}`;
                      
                      return (
                        <ProductCard
                          key={product.id}
                          product={product}
                          linkTo={productLink}
                        />
                      );
                    })}
                  </div>
                ) : (
                   <div className="text-center py-12 bg-muted/30 rounded-xl">
                     <p className="text-muted-foreground">
                       {category.id === "alle" 
                         ? t("rental.noArticlesFound")
                         : category.id === "anhaenger" 
                           ? t("rental.noTrailersFound")
                           : t("rental.noMachinesFound")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-2xl">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
               <h3 className="text-xl font-semibold text-foreground mb-2">
                 {t("rental.noProductsYet")}
               </h3>
               <p className="text-muted-foreground max-w-md mx-auto mb-6">
                 {t("rental.noProductsYetDesc")}
               </p>
               <div className="flex justify-center gap-4">
                <a href={`tel:${location.phone.replace(/\s/g, '')}`}>
                  <Button>
                    {location.phone}
                  </Button>
                </a>
                <a href={`mailto:${location.email}`}>
                  <Button variant="outline">
                    {t("rental.sendEmail")}
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Other Categories */}
      {otherCategories.length > 0 && (
        <section className="py-8 lg:py-12 bg-muted/30">
          <div className="section-container">
             <h2 className="text-xl font-bold text-foreground mb-6">
               {t("rental.moreCategoriesAt", { name: location.name })}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {otherCategories.slice(0, 6).map((cat) => (
                <Link 
                  key={cat.id}
                  to={`/mieten/${location.id}/${cat.id}`}
                  className="bg-background rounded-lg p-4 text-center hover:shadow-md transition-shadow border border-border hover:border-primary/30"
                >
                  {cat.icon ? (
                    <img 
                      src={cat.icon} 
                      alt={cat.title}
                      className="w-12 h-12 object-contain mx-auto mb-2"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-2" />
                  )}
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {cat.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Booking Dialog */}
      <ProductBookingDialog
        product={selectedProduct}
        location={location}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </Layout>
  );
}
