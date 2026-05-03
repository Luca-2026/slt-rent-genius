import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTranslatedCategory, useTranslatedCategories } from "@/hooks/useTranslatedProduct";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD, SLT_FAQ_JSONLD, SLT_LOCATION_JSONLD } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Grid3X3, Package, Clock, Smartphone, Lock, Scale, Boxes, Gauge, Shovel, Truck, Zap, Leaf, Wrench, HardHat, Search, X, AlertTriangle, Thermometer, Wind, Droplets, Sparkles, SlidersHorizontal, ChevronDown } from "lucide-react";
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
import { CategoryFilter, type CategoryFilterState } from "@/components/rental/CategoryFilter";
import { CategoryInfoBanner } from "@/components/rental/CategoryInfoBanner";
import { BaumaschinenanhaengerBundleHint } from "@/components/rental/BaumaschinenanhaengerBundleHint";
import { ServiceBanner } from "@/components/rental/ServiceBanner";
import { categoryFilterMap, categorySearchPlaceholders, categoryDisplayNames } from "@/components/rental/categoryFilters";
import { moebelZelteContent } from "@/data/moebelZelteContent";

export default function CategoryProducts() {
  const { t } = useTranslation();
  const { locationId, categoryId } = useParams<{ locationId: string; categoryId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allSearchQuery, setAllSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [trailerFilters, setTrailerFilters] = useState<TrailerFilterState>(() => ({
    search: "",
    types: searchParams.get("type") ? [searchParams.get("type") as string] : [],
    braking: [],
    weight: [],
    nutzlastRange: [0, 3000],
  }));
  const [earthMovingFilters, setEarthMovingFilters] = useState<CategoryFilterState>({
    search: "",
    filters: {},
  });
  const [genericFilters, setGenericFilters] = useState<CategoryFilterState>({
    search: "",
    filters: {},
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const productGridRef = useRef<HTMLDivElement>(null);
  const prevFiltersRef = useRef({ trailerFilters, earthMovingFilters, genericFilters, selectedCategoryFilter });

  // Handle legacy ?legacy= redirects from .htaccess 301s
  useEffect(() => {
    const legacySlug = searchParams.get("legacy");
    if (!legacySlug || !locationId) return;
    
    // Import dynamically to avoid circular deps at module level
    import("@/data/rentalData").then(({ getProductWithContext, locations }) => {
      // Try exact match
      const ctx = getProductWithContext(legacySlug);
      if (ctx) {
        navigate(`/mieten/${ctx.locationId}/${ctx.categoryId}/${ctx.product.id}`, { replace: true });
        return;
      }
      // Try normalised match
      const norm = (s: string) => s.toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss");
      const normalised = norm(legacySlug);
      for (const loc of locations) {
        for (const [catId, products] of Object.entries(loc.products)) {
          const found = products.find((p) => norm(p.id) === normalised);
          if (found) {
            navigate(`/mieten/${loc.id}/${catId}/${found.id}`, { replace: true });
            return;
          }
        }
      }
      // Fallback: stay on current page without the query param
      navigate(`/mieten/${locationId}/${categoryId || "alle"}`, { replace: true });
    });
  }, [searchParams, locationId, categoryId, navigate]);

  // Apply ?type= URL param to trailer filter (also when navigating between categories without unmount)
  useEffect(() => {
    if (categoryId !== "anhaenger") return;
    const typeParam = searchParams.get("type");
    if (!typeParam) return;
    setTrailerFilters((prev) =>
      prev.types.includes(typeParam) ? prev : { ...prev, types: [typeParam] }
    );
  }, [searchParams, categoryId]);

  // Scroll to product grid when discrete filters change (not slider drags)
  useEffect(() => {
    const prev = prevFiltersRef.current;
    // Only scroll for discrete filter changes, not continuous slider changes (nutzlastRange)
    const discreteTrailerChanged = prev.trailerFilters.search !== trailerFilters.search ||
      prev.trailerFilters.types !== trailerFilters.types ||
      prev.trailerFilters.braking !== trailerFilters.braking ||
      prev.trailerFilters.weight !== trailerFilters.weight;
    const filtersChanged =
      discreteTrailerChanged ||
      prev.earthMovingFilters !== earthMovingFilters ||
      prev.genericFilters !== genericFilters ||
      prev.selectedCategoryFilter !== selectedCategoryFilter;

    if (filtersChanged && productGridRef.current) {
      productGridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevFiltersRef.current = { trailerFilters, earthMovingFilters, genericFilters, selectedCategoryFilter };
  }, [trailerFilters, earthMovingFilters, genericFilters, selectedCategoryFilter]);
  
  const location = locationId ? getLocationById(locationId) : undefined;
  const rawCategory = categoryId ? getCategoryById(categoryId) : undefined;
  const category = useTranslatedCategory(rawCategory) || rawCategory;

  // Translated categories for sidebar
  const rawOtherCategories = useMemo(() => {
    if (!location || !category) return [];
    return getCategoriesForLocation(location.id).filter(
      (c) => c.id !== category.id && c.id !== "alle"
    );
  }, [location, category]);
  const translatedOtherCategories = useTranslatedCategories(rawOtherCategories);

  // Translated available categories for "alle" filter
  const rawAvailableCategories = useMemo(() => {
    if (!location) return [];
    return getCategoriesForLocation(location.id).filter((c) => {
      if (c.id === "alle") return false;
      const products = getProductsForLocationCategory(location.id, c.id);
      return products.length > 0;
    });
  }, [location]);
  const translatedAvailableCategories = useTranslatedCategories(rawAvailableCategories);

  const allProducts = useMemo(() => {
    if (!location || !category) return [];
    return getProductsForLocationCategory(location.id, category.id);
  }, [location, category]);

  // Use translated versions
  const availableCategories = translatedAvailableCategories;
  const otherCategories = translatedOtherCategories;

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

    // Filter by availability at current location (rentwareCode exists for this location)
    if (onlyAvailable && locationId) {
      filtered = filtered.filter((p) => {
        const code = p.rentwareCode;
        if (!code) return false;
        if (typeof code === "string") return true;
        const loc = (code as Record<string, string | undefined>)[locationId];
        return !!loc && loc.length > 0;
      });
    }

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

      // Type filters are applied below with name-based fallback (see "Type filters (fallback to name…)").


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
            (type === "autotransport" && (nameLower.includes("autotransport") || nameLower.includes("fahrzeugtransport") || nameLower.includes("motorrad"))) ||
            (type === "laubgitter" && (nameLower.includes("laubgitter") || nameLower.includes("kipp"))) ||
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

      // Nutzlast range filter
      if (trailerFilters.nutzlastRange[0] > 0 || trailerFilters.nutzlastRange[1] < 3000) {
        filtered = filtered.filter((p) => {
          const val = p.specifications?.["Nutzlast"];
          if (!val) return true; // keep products without nutzlast data
          const cleaned = val.replace(/[^0-9]/g, "");
          const nutzlast = cleaned ? Number(cleaned) : 0;
          return nutzlast >= trailerFilters.nutzlastRange[0] && nutzlast <= trailerFilters.nutzlastRange[1];
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

      // Erdbewegung type groups for filter matching
      const erdMachineCategories = ["minibagger", "radlader", "dumper"];
      const erdAnbauCategories = ["tiefloeffel", "kabelloeffel", "grabenraeumloeffel", "hydraulikhammer", "sortiergreifer", "roderechen"];

      // Apply each filter section
      Object.entries(earthMovingFilters.filters).forEach(([sectionId, selectedValues]) => {
        if (selectedValues.length > 0) {
          if (sectionId === "type") {
            // Artikeltyp: maschine, anbaugeraet, zubehoer
            filtered = filtered.filter((p) => {
              return selectedValues.some((value) => {
                if (value === "maschine") return p.tags?.includes("maschine") || erdMachineCategories.includes(p.category || "");
                if (value === "anbaugeraet") return erdAnbauCategories.includes(p.category || "");
                if (value === "zubehoer") return p.category === "zubehoer";
                return false;
              });
            });
          } else if (sectionId === "maschinentyp") {
            // Maschinentyp: minibagger, radlader, dumper
            filtered = filtered.filter((p) => {
              return selectedValues.some((value) => p.tags?.includes(value) || p.category === value);
            });
          } else if (sectionId === "anbaugeraet") {
            // Anbaugerätetyp: loeffel (groups tief+kabel+grabenraeumloeffel), hydraulikhammer, sortiergreifer
            const loeffelCategories = ["tiefloeffel", "kabelloeffel", "grabenraeumloeffel"];
            filtered = filtered.filter((p) => {
              return selectedValues.some((value) => {
                if (value === "loeffel") return loeffelCategories.includes(p.category || "");
                if (value === "sortiergreifer") return p.category === "sortiergreifer";
                return p.category === value;
              });
            });
          } else if (sectionId === "aufnahme") {
            // Aufnahme: ms01, ms03, ms08, ms10
            filtered = filtered.filter((p) => {
              const aufnahme = p.specifications?.["Aufnahme"] || p.specifications?.["Schnellwechsler"] || "";
              const nameLower = p.name.toLowerCase();
              return selectedValues.some((value) => {
                const v = value.toLowerCase();
                return aufnahme.toLowerCase().includes(v) || nameLower.includes(v);
              });
            });
          } else if (sectionId === "antrieb") {
            // Antrieb: diesel, elektro
            filtered = filtered.filter((p) => {
              const driveType = (p as unknown as { driveType?: string }).driveType;
              return selectedValues.some(
                (drive) => p.tags?.includes(drive) || driveType === drive
              );
            });
          } else {
            // Default tag/category matching
            filtered = filtered.filter((p) =>
              selectedValues.some((value) => p.tags?.includes(value) || p.category === value)
            );
          }
        }
      });
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
        saege: ["kreissaege", "saebelsaege", "stichsaege", "handkreissaege", "fugenschneider"],
        schneiden: ["fraese", "fliesenschneider", "trennschleifer", "multicutter"],
        abbruch: ["abbruchhammer"],
        schrauber: ["schlagschrauber", "drehschlagschrauber"],
        messen: ["laser", "ortungsgeraet", "linienlaser"],
        beton: ["kernbohrer", "betonruettler", "diamantbohrer", "zwangsmischer"],
        beleuchtung: ["bauleuchte"],
        zubehoer: ["zubehoer", "staubsauger", "ladegeraet", "nageler"],
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
          // Special handling for Arbeitshöhe filter (Leitern & Gerüste)
          else if (sectionId === "arbeitshoehe") {
            filtered = filtered.filter((p) => {
              // Try to extract working height from specifications first
              const specHeight = p.specifications?.["Arbeitshöhe"] ||
                p.specifications?.["Arbeitshöhe (Stehleiter)"] || "";
              const specMatch = String(specHeight).match(/([\d,]+)\s*m/);
              let heightM = specMatch ? parseFloat(String(specMatch[1]).replace(",", ".")) : 0;
              // Fallback: extract from product name (e.g. "3,3 m Arbeitshöhe")
              if (heightM === 0) {
                const nameMatch = p.name.match(/([\d,]+)\s*m/);
                if (nameMatch) heightM = parseFloat(nameMatch[1].replace(",", "."));
              }
              return selectedValues.some((v) => {
                if (v === "bis-3m") return heightM > 0 && heightM <= 3;
                if (v === "3-6m") return heightM > 3 && heightM <= 6;
                if (v === "ab-6m") return heightM > 6;
                return p.tags?.includes(v);
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
                  if (powerId === "elektro") {
                    // Check name, category, or specs for voltage indicators
                    if (nameLower.includes("elektro") || p.category?.includes("elektro")) return true;
                    const specs = p.specifications || {};
                    const hasMainsVoltage = Object.values(specs).some(v => 
                      String(v).includes("230 V") || String(v).includes("230V") || String(v).includes("220 V")
                    );
                    if (hasMainsVoltage) return true;
                    // Corded tools without "akku" or "benzin" in name and with wattage specs
                    const hasWattage = Object.values(specs).some(v => String(v).includes(" W"));
                    if (hasWattage && !nameLower.includes("akku") && !nameLower.includes("benzin")) return true;
                    return false;
                  }
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
                const beschallungTypeGroups: Record<string, string[]> = {
                  "pa": ["pa-system", "bluetooth-speaker"],
                  "lautsprecher": ["lautsprecher", "bluetooth-speaker"],
                  "mikrofon": ["mikrofon"],
                  "subwoofer": ["subwoofer"],
                  "zubehoer": ["zubehoer"],
                };
                const moebelZelteTypeGroups: Record<string, string[]> = {
                  "zelt": ["zelt"],
                  "moebel": ["moebel", "stuhl", "tisch", "bank"],
                  "husse": ["husse"],
                  "kuehlgeraet": ["kuehlgeraet"],
                  "garderobe": ["garderobe"],
                };
                const beleuchtungTypeGroups: Record<string, string[]> = {
                  "fluter": ["fluter", "baustrahler", "led-fluter"],
                  "spot": ["spot", "par", "led-spot", "scheinwerfer", "led-bar", "blinder"],
                  "moving-head": ["moving-head", "movinghead"],
                  "deko": ["deko", "lichterkette"],
                  "arbeitsleuchte": ["arbeitsleuchte", "handlampe"],
                };
                const geschirrTypeGroups: Record<string, string[]> = {
                  "geschirr": ["geschirr", "teller", "schuessel", "tassen"],
                  "glaeser": ["glaeser", "glas"],
                  "besteck": ["besteck"],
                  "zubehoer": ["spuelmaschine", "warmhaltegeraet", "zubehoer"],
                };
                const aggregateTypeGroups: Record<string, string[]> = {
                  "aggregat": ["aggregat"],
                  "akkupack": ["akkupack"],
                  "kompressor": ["kompressor"],
                  "druckluftwerkzeug": ["druckluftwerkzeug", "presslufthammer"],
                  "erdrakete": ["erdrakete"],
                };
                const groupCategories =
                  category?.id === "beschallung" ? beschallungTypeGroups[value] :
                  category?.id === "werkzeuge" ? werkzeugeTypeGroups[value] :
                  category?.id === "gartenpflege" ? gartenpflegeTypeGroups[value] :
                  category?.id === "kabel-stromverteiler" ? kabelStromverteilerTypeGroups[value] :
                  category?.id === "moebel-zelte" ? moebelZelteTypeGroups[value] :
                  category?.id === "beleuchtung" ? beleuchtungTypeGroups[value] :
                  category?.id === "geschirr-glaeser-besteck" ? geschirrTypeGroups[value] :
                  category?.id === "aggregate" ? aggregateTypeGroups[value] :
                  undefined;

                if (groupCategories) {
                  if (p.category && groupCategories.includes(p.category)) return true;
                  // Fallback: name-based matching for products without a category field
                  if (category?.id === "beleuchtung") {
                    const nameLower = p.name.toLowerCase();
                    const isMovingHead = p.category === "moving-head" || nameLower.includes("moving head") || nameLower.includes("moving-head");
                    if (value === "spot") return !isMovingHead && (nameLower.includes("scheinwerfer") || nameLower.includes("par") || nameLower.includes("bar") || nameLower.includes("blinder") || nameLower.includes("beleuchtungsset"));
                    if (value === "fluter") return nameLower.includes("fluter") || nameLower.includes("flutlicht") || nameLower.includes("baustrahler");
                    if (value === "moving-head") return isMovingHead;
                    if (value === "deko") return nameLower.includes("lichterkette") || nameLower.includes("deko");
                    if (value === "arbeitsleuchte") return nameLower.includes("arbeitsleuchte") || nameLower.includes("handlampe") || nameLower.includes("inspektionsleuchte");
                  }
                  // Fallback: name-based matching for aggregate products
                  if (category?.id === "aggregate") {
                    const nameLower = p.name.toLowerCase();
                    if (value === "kompressor") return nameLower.includes("kompressor");
                    if (value === "druckluftwerkzeug") return nameLower.includes("presslufthammer") || nameLower.includes("druckluft");
                    if (value === "erdrakete") return nameLower.includes("erdrakete");
                    if (value === "akkupack") return nameLower.includes("bluetti") || nameLower.includes("akkupack") || nameLower.includes("powerstation");
                    if (value === "aggregat") return nameLower.includes("aggregat") || nameLower.includes("kva");
                  }
                  // Fallback: name-based matching for geschirr/glaeser/besteck products
                  if (category?.id === "geschirr-glaeser-besteck") {
                    const nameLower = p.name.toLowerCase();
                    if (value === "glaeser") return !nameLower.includes("aschenbecher") && (nameLower.includes("glas") || nameLower.includes("gläser") || nameLower.includes("weißwein") || nameLower.includes("weisswein") || nameLower.includes("rotwein") || nameLower.includes("champagner") || nameLower.includes("longdrink") || nameLower.includes("wasser") || nameLower.includes("bier"));
                    if (value === "geschirr") return nameLower.includes("teller") || nameLower.includes("schüssel") || nameLower.includes("schuessel") || nameLower.includes("tasse") || nameLower.includes("untertasse") || nameLower.includes("suppenteller");
                    if (value === "besteck") return nameLower.includes("messer") || nameLower.includes("gabel") || nameLower.includes("löffel") || nameLower.includes("loeffel") || nameLower.includes("besteck");
                    if (value === "zubehoer") return nameLower.includes("spülmaschine") || nameLower.includes("spuelmaschine") || nameLower.includes("warmhalte") || nameLower.includes("aschenbecher") || nameLower.includes("kerzenständer") || nameLower.includes("kerzenstaender");
                  }
                  return false;
                }
                // For moebel-zelte "moebel" group also match by name keywords
                if (category?.id === "moebel-zelte" && value === "moebel") {
                  const nameLower = p.name.toLowerCase();
                  return nameLower.includes("stuhl") || nameLower.includes("tisch") || nameLower.includes("bank") || nameLower.includes("bierzelt");
                }
                // Arbeitsbühnen: name-based fallback (covers products without category field)
                if (category?.id === "arbeitsbuehnen") {
                  const nameLower = p.name.toLowerCase();
                  if (value === "mastbuehne") return nameLower.includes("mast");
                  if (value === "scherenbuehne") return nameLower.includes("scheren");
                  if (value === "gelenkbuehne") return nameLower.includes("gelenk") && !nameLower.includes("anhänger") && !nameLower.includes("anhaenger");
                  if (value === "teleskopbuehne") return nameLower.includes("teleskop") && !nameLower.includes("mast") && !nameLower.includes("anhänger") && !nameLower.includes("anhaenger");
                  if (value === "anhaengerbuehne") return nameLower.includes("anhänger") || nameLower.includes("anhaenger");
                }
                return false;
              });
            });
          }
          // Anlass filter for geschirr-glaeser-besteck (hochwertig vs standard)
          else if (sectionId === "anlass") {
            filtered = filtered.filter((p) => {
              const nameLower = p.name.toLowerCase();
              return selectedValues.some((value) => {
                if (value === "hochwertig") {
                  return nameLower.includes("passionata") || nameLower.includes("darwin") || nameLower.includes("deluxe");
                }
                if (value === "standard") {
                  return nameLower.includes("simply") || nameLower.includes("brunelli");
                }
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
          // Heizleistung filter – only for Heizlüfter and Heizpilz
          else if (sectionId === "heizleistung") {
            filtered = filtered.filter((p) => {
              // Bautrockner are excluded from heizleistung filter entirely
              if (p.category === "bautrockner") return false;
              const leistungStr = p.specifications?.["Leistungsaufnahme"] ||
                p.specifications?.["Heizleistung"] || "";
              const kwMatch = String(leistungStr).match(/([\d,]+)\s*kW/i);
              const nameMatch = p.name.match(/([\d,]+)\s*kW/i);
              const kw = kwMatch
                ? parseFloat(String(kwMatch[1]).replace(",", "."))
                : nameMatch
                ? parseFloat(nameMatch[1].replace(",", "."))
                : 0;
              return selectedValues.some((v) => {
                if (v === "bis-2kw") return kw > 0 && kw <= 2;
                if (v === "3kw") return kw > 2 && kw <= 3;
                if (v === "ab-9kw") return kw >= 9;
                return false;
              });
            });
          }
          // Trocknungsfläche filter – only for Bautrockner
          else if (sectionId === "trocknung") {
            filtered = filtered.filter((p) => {
              // Heizgeräte are excluded from trocknung filter
              if (p.category !== "bautrockner") return false;
              const flaecheStr = p.specifications?.["Trocknungsfläche"] || "";
              const m2Match = String(flaecheStr).match(/(\d+)/);
              const m2 = m2Match ? parseInt(m2Match[1]) : 0;
              return selectedValues.some((v) => {
                if (v === "bis-20m2") return m2 > 0 && m2 <= 20;
                if (v === "ab-50m2") return m2 >= 50;
                return false;
              });
            });
          }
          // Reflektionsklasse filter for absperrtechnik
          else if (sectionId === "reflektionsklasse") {
            filtered = filtered.filter((p) => {
              const ra = (p.specifications?.["Reflektionsklasse"] || "").toLowerCase().replace(/\s/g, "");
              return selectedValues.some((v) => ra.includes(v.toLowerCase()));
            });
          }
          // Schilderart filter for absperrtechnik
          else if (sectionId === "schilderart") {
            filtered = filtered.filter((p) => {
              if (p.category !== "verkehrszeichen") return false;
              const bezeichnung = (p.specifications?.["Bezeichnung"] || "").toLowerCase();
              const bedeutung = (p.specifications?.["Bedeutung"] || "").toLowerCase();
              const nameLower = p.name.toLowerCase();
              return selectedValues.some((v) => {
                if (v === "gefahrschilder") {
                  // VZ 1xx are warning signs (Gefahrzeichen)
                  return bezeichnung.startsWith("vz 1") || bedeutung.includes("gefahr") || bedeutung.includes("arbeitsstelle") || bedeutung.includes("verengte fahrbahn");
                }
                if (v === "verbotsschilder") {
                  // VZ 2xx (250-295) are prohibition signs
                  return bezeichnung.startsWith("vz 26") || bezeichnung.startsWith("vz 28") || bedeutung.includes("verbot") || bedeutung.includes("haltverbot") || nameLower.includes("halteverbot") || nameLower.includes("halteverbots");
                }
                if (v === "richtschilder") {
                  // VZ 2xx (200-249), VZ 3xx, VZ 1000+ are guidance/directional/supplementary
                  return bezeichnung.startsWith("vz 24") || bezeichnung.startsWith("vz 30") || bezeichnung.startsWith("vz 35") || bezeichnung.startsWith("vz 1000") || bezeichnung.includes("zusatz") || nameLower.includes("zusatzschild") || nameLower.includes("blanko");
                }
                if (v === "geschwindigkeitsschilder") {
                  // VZ 274 (speed limit), VZ 275 etc.
                  return bezeichnung.startsWith("vz 274") || bezeichnung.startsWith("vz 275") || bedeutung.includes("geschwindigkeit") || bedeutung.includes("km/h");
                }
                return false;
              });
            });
          }
          // Zeltgröße filter for moebel-zelte
          else if (sectionId === "zeltgroesse") {
            filtered = filtered.filter((p) => {
              // Only apply to tents
              if (p.category !== "zelt") return false;
              // Extract area from product name (e.g. "Partyzelt 4x6m" -> 24m²)
              const dimMatch = p.name.match(/(\d+)\s*x\s*(\d+)\s*m/i);
              if (dimMatch) {
                const area = parseInt(dimMatch[1]) * parseInt(dimMatch[2]);
                return selectedValues.some((v) => {
                  if (v === "bis-16m2") return area <= 16;
                  if (v === "17-40m2") return area >= 17 && area <= 40;
                  if (v === "ab-48m2") return area >= 48;
                  return false;
                });
              }
              // Fallback: check specifications
              const grundflaecheStr = String(p.specifications?.["Grundfläche"] || "");
              const areaMatch = grundflaecheStr.match(/(\d+)\s*m²/);
              if (areaMatch) {
                const area = parseInt(areaMatch[1]);
                return selectedValues.some((v) => {
                  if (v === "bis-16m2") return area <= 16;
                  if (v === "17-40m2") return area >= 17 && area <= 40;
                  if (v === "ab-48m2") return area >= 48;
                  return false;
                });
              }
              return true;
            });
          }
          // Einsatzbereich filter for beleuchtung
          else if (sectionId === "einsatz") {
            filtered = filtered.filter((p) => {
              const nameLower = p.name.toLowerCase();
              const descLower = (p.description || "").toLowerCase();
              const specsStr = Object.values(p.specifications || {}).join(" ").toLowerCase();
              const combined = `${nameLower} ${descLower} ${specsStr}`;
              return selectedValues.some((v) => {
                if (v === "event") {
                  return combined.includes("event") || combined.includes("bühne") || combined.includes("buehne") ||
                    combined.includes("spot") || combined.includes("par ") || combined.includes("moving") ||
                    p.category === "spot" || p.category === "moving-head";
                }
                if (v === "baustelle") {
                  return combined.includes("bau") || combined.includes("fluter") || combined.includes("strahler") ||
                    combined.includes("arbeits") || p.category === "fluter" || p.category === "arbeitsleuchte";
                }
                return false;
              });
            });
          }
          // Beschallung: Personenanzahl filter
          else if (sectionId === "personen") {
            filtered = filtered.filter((p) => {
              // Check specifications for person count
              const geeignetFuer = String(p.specifications?.["Geeignet für"] || "");
              const personMatch = geeignetFuer.match(/(\d+)/);
              const persons = personMatch ? parseInt(personMatch[1], 10) : 0;
              // Also check name
              const nameMatch = p.name.match(/bis\s+zu\s+(\d+)\s+Personen/i);
              const namePersons = nameMatch ? parseInt(nameMatch[1], 10) : 0;
              const maxPersons = Math.max(persons, namePersons);
              // Accessories / individual speakers without clear person count: show for all filters
              if (maxPersons === 0) return true;
              return selectedValues.some((v) => {
                if (v === "bis-30") return maxPersons <= 30;
                if (v === "bis-75") return maxPersons <= 75;
                if (v === "bis-250") return maxPersons <= 250;
                return false;
              });
            });
          }
          // Beschallung: Features filter (bluetooth, akku, mischpult)
          else if (sectionId === "features") {
            filtered = filtered.filter((p) => {
              return selectedValues.every((feat) => {
                const nameLower = p.name.toLowerCase();
                const descLower = (p.description || "").toLowerCase();
                const specsStr = Object.values(p.specifications || {}).join(" ").toLowerCase();
                if (feat === "bluetooth") {
                  return nameLower.includes("bluetooth") ||
                    descLower.includes("bluetooth") ||
                    specsStr.includes("bluetooth") ||
                    p.category === "bluetooth-speaker";
                }
                if (feat === "akku") {
                  return nameLower.includes("akku") ||
                    descLower.includes("akku") ||
                    specsStr.includes("akku") ||
                    p.category === "bluetooth-speaker";
                }
                if (feat === "mischpult") {
                  return nameLower.includes("mischpult") ||
                    descLower.includes("mischpult") ||
                    specsStr.includes("mischpult");
                }
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

    // Sort products for aggregate: by category group, then ascending kVA within aggregat
    if (category?.id === "aggregate") {
      const aggregateCatOrder: Record<string, number> = {
        aggregat: 0,
        akkupack: 1,
        kompressor: 2,
        druckluftwerkzeug: 3,
        erdrakete: 4,
      };
      filtered.sort((a, b) => {
        const orderA = aggregateCatOrder[a.category || ""] ?? 5;
        const orderB = aggregateCatOrder[b.category || ""] ?? 5;
        if (orderA !== orderB) return orderA - orderB;
        // Within aggregat, sort by kVA ascending
        if (a.category === "aggregat" && b.category === "aggregat") {
          const kvaA = parseFloat((a.name.match(/(\d+(?:[.,]\d+)?)\s*kva/i)?.[1] || "0").replace(",", "."));
          const kvaB = parseFloat((b.name.match(/(\d+(?:[.,]\d+)?)\s*kva/i)?.[1] || "0").replace(",", "."));
          return kvaA - kvaB;
        }
        return 0;
      });
    }

    // Sort products for absperrtechnik: explicit sortOrder first, then Verkehrsschilder last
    if (category?.id === "absperrtechnik") {
      filtered.sort((a, b) => {
        // Explicit sortOrder takes highest priority (lower = first)
        const hasOrderA = typeof a.sortOrder === "number";
        const hasOrderB = typeof b.sortOrder === "number";
        if (hasOrderA && hasOrderB) return a.sortOrder! - b.sortOrder!;
        if (hasOrderA) return -1;
        if (hasOrderB) return 1;
        // Then push Verkehrszeichen to the end
        const isVzA = a.category === "verkehrszeichen" ? 1 : 0;
        const isVzB = b.category === "verkehrszeichen" ? 1 : 0;
        return isVzA - isVzB;
      });
    }

    // Sort products for leitern-gerueste: Rollgerüste first, then Leitern, then Gerüstteile/Zubehör last
    if (category?.id === "leitern-gerueste") {
      const categorySortOrder: Record<string, number> = {
        rollgeruest: 0,
        stehleiter: 2,
        kombileiter: 3,
        leiter: 4,
        geruestteil: 5,
        geruestteile: 5,
      };
      filtered.sort((a, b) => {
        const orderA = categorySortOrder[a.category || ""] ?? 4;
        const orderB = categorySortOrder[b.category || ""] ?? 4;
        return orderA - orderB;
      });
    }

    // Within each sub-category group, sort products with rentwareCode for current location first
    // This preserves the overall group order (e.g. Bagger before Radlader) but within each
    // group pushes on-request products (no rentwareCode) to the end.
    if (locationId) {
      const stableIndexMap = new Map(filtered.map((p, i) => [p, i]));
      filtered.sort((a, b) => {
        const catA = a.category || "";
        const catB = b.category || "";
        // Only re-sort within the same sub-category
        if (catA !== catB) return (stableIndexMap.get(a) ?? 0) - (stableIndexMap.get(b) ?? 0);
        const hasCodeA = a.rentwareCode && a.rentwareCode[locationId] ? 0 : 1;
        const hasCodeB = b.rentwareCode && b.rentwareCode[locationId] ? 0 : 1;
        if (hasCodeA !== hasCodeB) return hasCodeA - hasCodeB;
        return (stableIndexMap.get(a) ?? 0) - (stableIndexMap.get(b) ?? 0);
      });
    }

    return filtered;
  }, [allProducts, allSearchQuery, selectedCategoryFilter, productCategoryMap, trailerFilters, earthMovingFilters, genericFilters, category?.id, locationId, onlyAvailable]);

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

  // SEO data for category page - CTR-optimized
  const categoryDisplayName = category.title || categoryId || "";
  
  // Category-specific SEO titles with CTR triggers – optimized per GSC high-impression keywords
  const categorySeoTitles: Record<string, string> = {
    anhaenger: `Anhänger mieten ${location.name} – 24/7 Abholung, ab 19 €/Tag`,
    erdbewegung: `Minibagger, Dumper & Radlader mieten ${location.name} – inkl. Lieferung`,
    werkzeuge: `Werkzeuge mieten ${location.name} – Fugenschneider, Abbruchhammer & Profi-Geräte`,
    arbeitsbuehnen: `Arbeitsbühne mieten ${location.name} – Scherenbühne, Hubsteiger & Hebebühne bis 18m`,
    gartenpflege: `Gartengeräte mieten ${location.name} – Häcksler, Baumstumpffräse, Rasenwalze & mehr`,
    aggregate: `Stromaggregat & Kompressor mieten ${location.name} – 2,8 bis 100 kVA`,
    verdichtung: `Rüttelplatte & Stampfer mieten ${location.name} – ab 25 €/Tag`,
    huepfburgen: `Hüpfburg mieten ${location.name} – für Kindergeburtstag & Events`,
    "leitern-gerueste": `Rollgerüst & Leiter mieten ${location.name} – bis 8,4m Höhe`,
    "heizung-trocknung": `Bautrockner & Heizung mieten ${location.name} – Sofort verfügbar`,
    "moebel-zelte": `Partyzelt & Mobiliar mieten ${location.name} – für Events & Feiern`,
    "geschirr-glaeser-besteck": `Geschirr & Gläser mieten ${location.name} – 10er-Sets ab 5 €`,
    absperrtechnik: `Bauzaun & Halteverbotsschilder mieten ${location.name} – StVO-konform ✓`,
    "kabel-stromverteiler": `Stromverteiler & Kabel mieten ${location.name} – CEE 16A bis 63A`,
    beschallung: `PA-Anlage & Beschallung mieten ${location.name} – Professionell`,
    beleuchtung: `Beleuchtung mieten ${location.name} – LED Moving Heads & Bars`,
    buehne: `Bühne mieten ${location.name} – Bühnenpodeste & Zubehör`,
    "traversen-rigging": `Traversen mieten ${location.name} – Rigging & Bühnentechnik`,
    spezialeffekte: `Spezialeffekte mieten ${location.name} – Funkenfontänen & Co.`,
    kommunikation: `Funkmikrofon & Kommunikation mieten ${location.name}`,
  };
  
  const seoTitle = categorySeoTitles[category.id] || `${categoryDisplayName} mieten in ${location.name} – Tiefpreisgarantie`;
  
  // City name mapping for SEO
  const cityNameMap: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr" };
  const cityName = cityNameMap[location.id] || location.name;

  // Category-specific meta descriptions with dynamic city name
  const categorySeoDescriptions: Record<string, string> = {
    anhaenger: `Anhänger mieten in ${cityName} – 24/7 per SMS-Code: Planenanhänger, Autotransporter, Kastenanhänger & mehr. Online buchbar, Tiefpreisgarantie.`,
    erdbewegung: `Bagger & Erdbewegungsmaschinen mieten in ${cityName}: Bobcat, Minibagger, Radlader, Dumper + Anbaugeräte. Tiefpreisgarantie, sofort verfügbar.`,
    werkzeuge: `Elektro- & Handwerkzeuge mieten in ${cityName}: Bohrmaschinen, Flex, Sägen, Rotationslaser & mehr. Kurzfristig verfügbar – SLT Rental Tiefpreisgarantie.`,
    gartenpflege: `Gartengeräte mieten in ${cityName}: Kettensäge, Heckenschere, Häcksler, Vertikutierer & Hochdruckreiniger. Online buchbar bei SLT Rental.`,
    aggregate: `Stromerzeuger & Kompressoren mieten in ${cityName}: 2,8 kVA bis 100 kVA, Akkupacks. Für Baustelle, Event & Outdoor – SLT Rental.`,
    arbeitsbuehnen: `Arbeitsbühnen mieten in ${cityName}: Scherenbühnen 8–12 m, Mastbühne 11 m, Gelenksteiger, Anhängerbühne 18 m. Tiefpreisgarantie.`,
    verdichtung: `Rüttelplatten & Stampfer mieten in ${cityName}: VP 16/44 bis HVP 50/60, Grabenwalze, Stampfer. SLT Rental Tiefpreisgarantie.`,
    "kabel-stromverteiler": `Kabel & Stromverteiler mieten in ${cityName}: CEE-Kabel, Schukokabel, Verteiler, Kabelbrücken – geprüft, sicher, für Event & Baustelle.`,
    "leitern-gerueste": `Leitern & Rollgerüste mieten in ${cityName}: Steh-, Mehrzweckleitern, Krause-Rollgerüste 3–11 m, Breitaufbau. SLT Rental.`,
    "heizung-trocknung": `Bautrockner & Heizlüfter mieten in ${cityName}: KT200, KT553, Heizlüfter 2–9 kW. Schnelle Trocknung – SLT Rental.`,
    absperrtechnik: `Absperrtechnik & Verkehrszeichen mieten in ${cityName}: Bauzäune, VZ-Schilder, Warnbarken, Halteverbotsschilder. SLT Rental.`,
    beschallung: `PA-Anlage & Beschallung mieten in ${cityName}: Soundboks Gen.3, DAS PA-Systeme, Pioneer CDJ/DJM, Shure Funkmikrofone. SLT Rental.`,
    kommunikation: `Funkgeräte mieten in ${cityName}: UHF-Funkgeräte für Events & Baustellen. Kurzfristig verfügbar – SLT Rental.`,
    beleuchtung: `Eventbeleuchtung mieten in ${cityName}: LED-Scheinwerfer, Moving Head, 4er Bar, LED-Fluter RGBWAUV. SLT Rental.`,
    buehne: `Bühnenelemente & Podeste mieten in ${cityName}: Nivtec Systempodeste, Teleskopfüße. Für Events in NRW – SLT Rental.`,
    "traversen-rigging": `Traversen & Rigging mieten in ${cityName}: Milos M290 Traversen, Multicube, Traversencover. Für Licht & Ton – SLT Rental.`,
    "moebel-zelte": `Partyzelte & Eventmöbel mieten in ${cityName}: 3×3 m bis 6×12 m, Bierzeltgarnituren, Stehtische, Stühle. SLT Rental.`,
    "geschirr-glaeser-besteck": `Geschirr, Gläser & Besteck mieten in ${cityName}: Teller, Weingläser, Sektgläser, Besteck – Gastro-Qualität für Events.`,
    spezialeffekte: `Spezialeffekte mieten in ${cityName}: Nebelmaschine, Kalte Funkenfontänen, CO2-Jet. Für Events & Hochzeiten – SLT Rental.`,
    huepfburgen: `Hüpfburgen mieten in ${cityName}: Lamar, Wasserpark, Rollercoaster, Clown. Für Kindergeburtstage & Familienfeste – SLT Rental.`,
  };
  
  const seoDescription = categorySeoDescriptions[category.id] || 
    `${categoryDisplayName} mieten in ${cityName} – online buchbar bei SLT Rental. Tiefpreisgarantie, Lieferung möglich.`;
  const seoCanonical = `/mieten/${location.id}/${category.id}`;
  
  // Expanded keywords based on GSC high-impression search queries
  const categoryKeywordMap: Record<string, string> = {
    anhaenger: `Anhänger mieten ${location.name}, Anhängerverleih ${location.name}, Pkw-Anhänger mieten, Plattformanhänger mieten, Baumaschinenanhänger mieten, Autoanhänger mieten ${location.name}, Schwerlastanhänger mieten`,
    erdbewegung: `Minibagger mieten ${location.name}, Bagger mieten ${location.name}, Dumper mieten ${location.name}, Radlader mieten ${location.name}, Teleskoplader mieten ${location.name}, Grabenräumlöffel mieten, Kettendumper mieten, Bobcat mieten`,
    arbeitsbuehnen: `Arbeitsbühne mieten ${location.name}, Hubsteiger mieten ${location.name}, Scherenbühne mieten ${location.name}, Hebebühne mieten ${location.name}, Steiger mieten ${location.name}, LKW-Arbeitsbühne mieten ${location.name}, Anhängerbühne mieten, Mastbühne mieten ${location.name}`,
    gartenpflege: `Häcksler mieten ${location.name}, Baumstumpffräse mieten ${location.name}, Stubbenfräse mieten, Rasenwalze mieten ${location.name}, Hochdruckreiniger mieten ${location.name}, Erdbohrer mieten, Gartenfräse mieten, Bodenhacke mieten, Gartengeräte leihen ${location.name}, Wurzelfräse mieten`,
    werkzeuge: `Werkzeuge mieten ${location.name}, Fugenschneider mieten ${location.name}, Fliesenschneider mieten ${location.name}, Abbruchhammer mieten, Kernbohrer mieten, Zwangsmischer mieten, Winkelschleifer mieten, Mauerschlitzfräse mieten`,
    aggregate: `Stromaggregat mieten ${location.name}, Kompressor mieten ${location.name}, Baukompressor mieten, Generator mieten ${location.name}`,
    verdichtung: `Rüttelplatte mieten ${location.name}, Stampfer mieten ${location.name}, Verdichtungsgerät mieten, Betonrüttler mieten`,
    huepfburgen: `Hüpfburg mieten ${location.name}, Hüpfburgen leihen, Kindergeburtstag Equipment ${location.name}`,
    "leitern-gerueste": `Rollgerüst mieten ${location.name}, Leiter mieten ${location.name}, 12 Meter Leiter mieten, 10 Meter Leiter mieten, Gerüst leihen ${location.name}`,
    "heizung-trocknung": `Bautrockner mieten ${location.name}, Heizlüfter mieten, Trocknung mieten, Baustellen Heizlüfter mieten`,
    absperrtechnik: `Bauzaun mieten ${location.name}, Halteverbotsschilder mieten ${location.name}, Absperrgitter mieten, Warnbarke mieten`,
    "moebel-zelte": `Partyzelt mieten ${location.name}, Zelt mieten ${location.name}, Eventzelt mieten, Pavillon mieten ${location.name}, Bierzeltgarnitur mieten`,
    "geschirr-glaeser-besteck": `Geschirr mieten ${location.name}, Gläser mieten, Besteck mieten, Eventgeschirr leihen`,
    "kabel-stromverteiler": `Verteilerschrank mieten ${location.name}, Stromverteiler mieten, CEE Adapter mieten, Kabeltrommel mieten`,
  };
  
  const seoKeywordsBase = categoryKeywordMap[category.id] || 
    `${categoryDisplayName} mieten ${location.name}, ${categoryDisplayName} leihen ${location.name}, ${categoryDisplayName} Vermietung ${location.name}, Mietgeräte ${location.name}`;

  // Per-location overrides for moebel-zelte (richer SEO content)
  const moebelOverride = category.id === "moebel-zelte" ? moebelZelteContent[location.id] : undefined;
  const finalSeoTitle = moebelOverride?.metaTitle || seoTitle;
  const finalSeoDescription = moebelOverride?.metaDescription || seoDescription;
  const seoKeywords = moebelOverride?.keywords || seoKeywordsBase;

  // SEO text content for each category page (array of paragraphs)
  const categorySeoTexts: Record<string, string[]> = {
    anhaenger: [
      `Sie suchen einen Anhänger zum Mieten in ${location.name}? Bei SLT Rental finden Sie über ${products.length} verschiedene Anhänger-Modelle – vom kleinen ungebremsten Pkw-Anhänger für den Umzug bis zum schweren 3.500 kg Baumaschinenanhänger. Unsere Anhänger sind rund um die Uhr per SMS-Code verfügbar, auch am Wochenende und an Feiertagen.`,
      `Ob Planenanhänger, Kofferanhänger, Kippanhänger oder Autotransporter: Alle Anhänger werden regelmäßig geprüft und sind sofort einsatzbereit. Die Abholung funktioniert bequem per Smartphone – buchen Sie online und erhalten Sie Ihren Zugangscode per SMS. Attraktive Wochenend-Tarife und Tiefpreisgarantie inklusive.`,
      `SLT Rental ist Ihr Anhängerverleih in ${location.name} und Umgebung. Wir beraten Sie gerne bei der Wahl des richtigen Anhängers für Ihren Transport, Umzug oder Ihr Bauprojekt.${(location.id === "krefeld" || location.id === "bonn") ? " Übrigens: In unserer eigenen Werkstatt führen wir auch Wartungs- und Reparaturarbeiten an Anhängern durch – auch an Fremdgeräten." : ""}`,
    ],
    erdbewegung: [
      `Minibagger mieten in ${location.name} – bei SLT Rental finden Sie Bagger von 1 Tonne bis 5 Tonnen Einsatzgewicht für jedes Erdbauprojekt. Ob Fundamentaushub, Leitungsgraben, Gartenumgestaltung oder Pool-Bau: Unsere Minibagger und Radlader sind sofort einsatzbereit und werden inklusive Tieflöffel vermietet.`,
      `Zusätzlich bieten wir ein umfangreiches Sortiment an Anbaugeräten: Tieflöffel in verschiedenen Breiten, Grabenräumlöffel, Hydraulikhammer für Abbrucharbeiten und Sortiergreifer. Alle Anbaugeräte mit MS01 oder MS03 Aufnahme. Lieferung direkt auf Ihre Baustelle in ${location.name} möglich – berechnen Sie die Lieferkosten mit unserem Online-Rechner.`,
      `Für größere Projekte bieten wir auch Radlader und Kettendumper. Fragen Sie nach unseren attraktiven Wochen- und Monatstarifen für Langzeitmieten.${(location.id === "krefeld" || location.id === "bonn") ? " In unserer hauseigenen Werkstatt bieten wir zudem Wartung und Reparatur von Baumaschinen aller Hersteller an – auch für Fremdgeräte." : ""}`,
    ],
    werkzeuge: [
      `Professionelle Werkzeuge mieten in ${location.name} – bei SLT Rental leihen Sie Kernbohrer, Stemmhammer, Abbruchhammer, Trennschleifer, Kreissägen, Betonrüttler, Fliesenschneider, Baulaser und vieles mehr. Alle Geräte sind von Markenherstellern und werden regelmäßig gewartet.`,
      `Ob für Renovierung, Umbau oder Neubau: Profi-Werkzeuge zum kleinen Preis ab 10 €/Tag. Wochenend-Tarife und Tiefpreisgarantie sorgen für faire Konditionen. Persönliche Beratung inklusive – wir helfen Ihnen bei der Wahl des richtigen Geräts.`,
    ],
    arbeitsbuehnen: location.id === "krefeld" ? [
      `Arbeitsbühne mieten in Krefeld – bei SLT Rental in Krefeld leihst du Hubarbeitsbühnen mit Arbeitshöhen von 7,80 m bis 18 m. Im Verleihpark stehen die elektrischen Zoomlion-Scherenbühnen ZS0607 (7,80 m) und ZS1012 (11,80 m), die Zoomlion ZMP09 Mastbühne (11,20 m, 3,23 m seitliche Reichweite, 230 V im Korb) sowie der Nifty HR12L Gelenkteleskopsteiger (12 m Arbeitshöhe, 6,10 m Reichweite). Für höhere Einsätze bis 18 m steht die mitnehmbare Anhänger-Arbeitsbühne TM18GTi bereit – PKW-tauglich und ohne Fahrerlaubnis CE.`,
      `Typische Einsätze in Krefeld: Fassadenarbeiten an Stadthäusern in Bockum und Uerdingen, Werbe- und Lichttechnik-Montage in Hallen am Hafen, Baumpflege in Verberg sowie Industriewartung in den Gewerbegebieten Europark Fichtenhain und Krefeld-Süd. Die kompakten Zoomlion-Scherenbühnen mit non-marking Reifen sind speziell für Innenräume und empfindliche Bodenbeläge geeignet, die Mastbühne ZMP09 mit nur 1,79 m Durchfahrtshöhe passt durch Standardtore.`,
      `Als autorisierter Zoomlion-Fachhändler in NRW liefern wir die Hubsteiger direkt zu deiner Baustelle in Krefeld und Umgebung – Lieferradius unter anderem nach Meerbusch, Willich, Tönisvorst, Kempen, Moers und Duisburg. Für motorisierte Hubarbeitsbühnen ist eine Bedienerunterweisung (IPAF/PSAgA) erforderlich; sprich uns an, wir beraten zur passenden Bühne. Bei Bedarf kann ein Baumaschinenanhänger (1.800 oder 3.500 kg) im Buchungsprozess vergünstigt dazugebucht werden. In unserer Werkstatt in Krefeld übernehmen wir zudem Wartung und UVV-Prüfung von Arbeitsbühnen aller Hersteller.`,
    ] : location.id === "bonn" ? [
      `Arbeitsbühne mieten in Bonn – bei SLT Rental am Standort Bonn stehen elektrische Hubarbeitsbühnen von 7,80 m bis 18 m Arbeitshöhe bereit: die Zoomlion ZS0607 Scherenbühne (7,80 m, drive-through 1,79 m), die Zoomlion ZS1012 (11,80 m, 350 kg Korblast für bis zu 3 Personen), die Zoomlion ZMP09 Mastbühne (11,20 m, 7,75 m up-and-over) und die mitnehmbare Anhänger-Arbeitsbühne TM18GTi mit 18 m Arbeitshöhe.`,
      `Beliebte Einsätze rund um Bonn: Fassaden- und Dachreparaturen in der Südstadt und Bad Godesberg, Indoor-Montagen im WCCB und in Eventlocations, Baum- und Lichtmastpflege im Rheinauen-Park sowie Wartungsarbeiten in den Gewerbegebieten Pützchen, Bonn-Beuel und Bornheim. Die elektrischen Zoomlion-Scherenbühnen arbeiten emissionsfrei und leise und sind damit auch für Schulen, Hotels und Krankenhäuser zugelassen.`,
      `Wir liefern die Arbeitsbühnen in den Großraum Bonn – inklusive Königswinter, Sankt Augustin, Siegburg, Troisdorf, Meckenheim, Rheinbach und Bornheim. Für motorisierte Hubsteiger ist eine PSAgA-Einweisung erforderlich; die Anhängerbühne TM18GTi darf mit Führerschein BE gefahren werden. Im Buchungsprozess kannst du günstig einen Baumaschinenanhänger (1.800 kg / 3.500 kg) zur Selbstabholung dazubuchen. Unsere Bonner Werkstatt übernimmt UVV, Wartung und Reparatur von Hubarbeitsbühnen aller Hersteller – auch für Fremdgeräte.`,
    ] : [
      `Arbeitsbühne mieten in Mülheim an der Ruhr – am Standort Mülheim an der Ruhr stehen elektrische Hubarbeitsbühnen mit Arbeitshöhen von 7,80 m bis 18 m bereit. Verfügbar sind die kompakten Zoomlion-Scherenbühnen ZS0607 und ZS1012 sowie die Zoomlion ZMP09 Mastbühne (3,23 m seitliche Reichweite) und die mitnehmbare Anhänger-Arbeitsbühne TM18GTi für Einsätze bis 18 m Arbeitshöhe.`,
      `Typische Einsätze im Ruhrgebiet: Fassadenarbeiten in Mülheim-Stadtmitte und Speldorf, Hallen- und Lagermontage in den Gewerbegebieten Heißen und Dümpten, Industriewartung im Hafen Mülheim sowie Eventaufbauten in der MüGa und Stadthalle. Die elektrischen Zoomlion-Scherenbühnen mit non-marking Reifen sind sowohl für Indoor- als auch Outdoor-Einsätze geeignet und arbeiten emissionsfrei.`,
      `Lieferung möglich nach Mülheim an der Ruhr und in das gesamte westliche Ruhrgebiet – inklusive Duisburg, Oberhausen, Essen, Bottrop und Ratingen. Für motorisierte Hubarbeitsbühnen ist eine Bedienerunterweisung (PSAgA) erforderlich. Tipp für Selbstabholer: Im Buchungsprozess kannst du einen passenden Baumaschinenanhänger (1.800 kg oder 3.500 kg) zum Bundle-Preis dazubuchen. Als autorisierter Zoomlion-Fachhändler in NRW beraten wir dich gerne persönlich zur richtigen Bühne für dein Projekt in Mülheim an der Ruhr.`,
    ],
    gartenpflege: [
      `Gartengeräte mieten in ${location.name} – Häcksler, Erdbohrer, Vertikutierer, Kettensägen, Heckenscheren, Hochdruckreiniger, Stubbenfräsen und mehr bei SLT Rental. Professionelle Gartengeräte für Privatpersonen und Landschaftsgärtner zum fairen Tagesmietpreis.`,
      `Sparen Sie sich die Anschaffung teurer Spezialgeräte: Mieten Sie Gartengeräte genau dann, wenn Sie sie brauchen. Von der Hecke schneiden bis zum Baum fällen – wir haben das passende Equipment für Ihr Gartenprojekt in ${location.name}.`,
    ],
    aggregate: [
      `Stromaggregat mieten in ${location.name} – von 2,8 kVA für den Marktstand bis 100 kVA für die Großbaustelle. SLT Rental bietet leise Inverter-Stromerzeuger für Events und leistungsstarke Diesel-Aggregate für Baustellen ohne Stromanschluss.`,
      `Alle Stromaggregate werden betankt und einsatzbereit übergeben. Lieferung zu Ihrer Baustelle oder Ihrem Veranstaltungsort in ${location.name} möglich.${(location.id === "krefeld" || location.id === "bonn") ? " In unserer hauseigenen Werkstatt warten und reparieren wir auch Stromerzeuger und Aggregate aller Hersteller – Fremdgeräte willkommen." : ""}`,
    ],
    verdichtung: [
      `Rüttelplatte mieten in ${location.name} – Vibrationsplatten und Vibrationsstampfer für Pflasterarbeiten, Erdverdichtung und Straßenbau. Bei SLT Rental finden Sie Verdichtungsgeräte für jeden Untergrund.`,
      `Ob Vorwärts-Rüttelplatte für leichte Pflasterarbeiten oder reversierbare Rüttelplatte für schwere Erdarbeiten – wir beraten Sie gerne zur richtigen Gerätewahl.${(location.id === "krefeld" || location.id === "bonn") ? " In unserer eigenen Werkstatt bieten wir Wartung und Reparatur von Verdichtungstechnik aller Hersteller an – auch für Fremdgeräte." : ""}`,
    ],
    huepfburgen: [
      `Hüpfburg mieten in ${location.name} – bei SLT Rental finden Sie Hüpfburgen in verschiedenen Größen und Designs für Kindergeburtstage, Schulfeste, Vereinsfeiern und Firmenfamilientage. Lieferung und Aufbau in ${location.name} und Umgebung möglich.`,
      `Unsere Hüpfburgen sind TÜV-geprüft und werden sauber und einsatzbereit geliefert. Inkl. Gebläse. Attraktive Wochenend-Tarife für Samstag/Sonntag-Events.`,
    ],
    "leitern-gerueste": [
      `Rollgerüst und Leiter mieten in ${location.name} – Arbeitshöhen bis 8,4m für Maler-, Fassaden- und Montagearbeiten. Bei SLT Rental leihen Sie Steh- und Kombileitern sowie mobile Rollgerüste zum fairen Tagesmietpreis.`,
      `Alle Gerüste und Leitern entsprechen den aktuellen Sicherheitsnormen und werden regelmäßig geprüft. Ideal für Handwerker, Maler und Heimwerker in ${location.name}.`,
    ],
    "heizung-trocknung": [
      `Bautrockner und Heizlüfter mieten in ${location.name} – für Estrichtrocknung, Neubau-Trocknung, Wasserschaden-Sanierung oder Baustellenbeheizung. SLT Rental bietet professionelle Trocknungs- und Heizgeräte sofort verfügbar.`,
      `Unsere Bautrockner haben Trocknungsflächen bis zu 80 m². Heizlüfter bis 9 kW für die Baustellenbeheizung. Wir beraten Sie zur richtigen Gerätekombination für Ihr Trocknungsprojekt.`,
    ],
    "moebel-zelte": [
      `Partyzelt und Eventmobiliar mieten in ${location.name} – Zelte, Tische, Stühle, Bänke und Bierzeltgarnituren für Hochzeit, Geburtstag, Firmenfeier oder Vereinsfest. Bei SLT Rental finden Sie alles für Ihre Veranstaltung unter einem Dach.`,
      `Von der kleinen Gartenparty bis zum großen Firmenevent: Wir bieten Partyzelte in verschiedenen Größen und passende Bestuhlung. Lieferung und Abholung in ${location.name} und Umgebung.`,
    ],
    "geschirr-glaeser-besteck": [
      `Geschirr, Gläser und Besteck mieten in ${location.name} – 10er-Sets ab 5 €. Hochwertiges Eventgeschirr der Linien Passionata und Darwin sowie praktisches Standard-Geschirr der Linien Simply und Brunelli. Perfekt für Hochzeit, Firmenevent oder Gartenparty.`,
      `Das Beste: Sie geben das Geschirr einfach ungespült zurück! Wir übernehmen die Reinigung für Sie. Kombinieren Sie Geschirr, Gläser und Besteck zu Ihrem individuellen Event-Set.`,
    ],
    absperrtechnik: [
      `Absperrtechnik mieten in ${location.name} – Absperrgitter, Bauzäune, Halteverbotsschilder und Verkehrszeichen nach StVO. Bei SLT Rental finden Sie professionelle Absperr- und Sicherheitstechnik für Baustellen, Events und Umzüge.`,
      `Halteverbotsschilder für Umzüge, Bauzäune für die Baustellen-Absicherung, Warn- und Hinweisschilder nach StVO – alles zur Miete in ${location.name}. Bitte beachten Sie: Die Genehmigung für Halteverbotszonen beantragen Sie beim zuständigen Ordnungsamt.`,
    ],
    "kabel-stromverteiler": [
      `Kabel und Stromverteiler mieten in ${location.name} – CEE-Kabel, Schuko-Kabeltrommeln, Kabelbrücken, Anschlussschränke und Stromverteiler für Event und Baustelle. Bei SLT Rental finden Sie die richtige Stromversorgung für jedes Projekt.`,
      `Von der 16A Schuko-Kabeltrommel bis zum 63A CEE-Anschlussschrank – wir beraten Sie zur richtigen Stromverteilung für Ihr Event oder Ihre Baustelle in ${location.name}.`,
    ],
    beschallung: [
      `PA-Anlage und Lautsprecher mieten in ${location.name} – vom Bluetooth-Speaker für die Gartenparty bis zur professionellen PA-Anlage für 250 Personen. SLT Rental bietet professionelle Beschallungstechnik für jeden Anlass.`,
      `Komplette Sound-Pakete mit Lautsprechern, Subwoofern und Mischpult. Für Hochzeiten, Firmenfeiern, Sportveranstaltungen und Konzerte in ${location.name} und Umgebung.`,
    ],
    beleuchtung: [
      `Eventbeleuchtung mieten in ${location.name} – LED Spots, Moving Heads, PAR-Scheinwerfer, LED Bars und Baustellenstrahler. SLT Rental bietet professionelle Lichttechnik für Events, Bühnen und Baustellen.`,
      `Von der stimmungsvollen Ambientebeleuchtung bis zur professionellen Bühnenbeleuchtung – wir haben die passende Lichttechnik für Ihr Event in ${location.name}.`,
    ],
    buehne: [
      `Bühne und Podeste mieten in ${location.name} – modulare Bühnenpodeste für Konzerte, Reden, Modenschauen und Firmenevents. Flexible Bühnengrößen individuell konfigurierbar.`,
      `Alle Bühnenpodeste sind wetterfest und indoor/outdoor einsetzbar. Kombinieren Sie mit Traversen und Beleuchtung für eine komplette Event-Lösung in ${location.name}.`,
    ],
    "traversen-rigging": [
      `Traversen und Rigging mieten in ${location.name} – Alu-Traversen, Kettenzüge und Rigging-Zubehör für professionelle Veranstaltungstechnik. Traversensysteme für Licht, Ton und Dekoration.`,
      `Ob Ground-Support oder Flugtraverse – wir bieten professionelle Traversensysteme für Events jeder Größe in ${location.name} und NRW.`,
    ],
    spezialeffekte: [
      `Spezialeffekte mieten in ${location.name} – Funkenfontänen, Nebelmaschinen, Hazer, Seifenblasenmaschinen und Konfettikanonen für spektakuläre Events. Professionelle Effekttechnik bei SLT Rental.`,
      `Machen Sie Ihr Event unvergesslich! Unsere Spezialeffekte sind einfach zu bedienen und sorgen für den Wow-Faktor bei Hochzeiten, Firmenfeiern und Shows.`,
    ],
    kommunikation: [
      `Funkmikrofon und Headset mieten in ${location.name} – professionelle Sennheiser-Funkstrecken für Konferenzen, Hochzeiten, Reden und Events. Handmikrofone, Headsets und Ansteckmikrofone verfügbar.`,
      `Hochwertige drahtlose Mikrofonsysteme für klare Sprachübertragung bei jeder Veranstaltung. Einfache Bedienung, zuverlässiger Empfang.`,
    ],
  };

  // Category-specific FAQs for FAQ schema
  const categoryFaqs: Record<string, { question: string; answer: string }[]> = {
    anhaenger: [
      { question: `Kann ich einen Anhänger in ${location.name} auch am Wochenende mieten?`, answer: `Ja! Unsere Anhänger in ${location.name} sind 24/7 per SMS-Code-System verfügbar – auch an Wochenenden und Feiertagen. Sie benötigen lediglich eine Online-Buchung.` },
      { question: `Brauche ich einen Führerschein für den Anhänger?`, answer: `Für Anhänger bis 750 kg reicht der Führerschein Klasse B. Für schwerere Anhänger benötigen Sie Klasse BE oder B96.` },
      { question: `Wie lange kann ich einen Anhänger mieten?`, answer: `Sie können unsere Anhänger stundenweise, tageweise oder wochenweise mieten. Langzeitmiete ist auf Anfrage ebenfalls möglich.` },
      { question: `Was kostet ein Anhänger mieten in ${location.name}?`, answer: `Unsere Anhänger gibt es ab 19 €/Tag. Der Preis variiert je nach Größe und Typ. Wochenend-Tarife bieten besonders günstige Konditionen.` },
      { question: `Welche Anhänger kann ich in ${location.name} mieten?`, answer: `Bei SLT Rental in ${location.name} finden Sie Pkw-Anhänger, Planenanhänger, Kofferanhänger, Baumaschinenanhänger, Autotransporter und Kippanhänger – gebremst und ungebremst.` },
    ],
    erdbewegung: [
      { question: `Kann ich einen Minibagger ohne Baggerschein mieten?`, answer: `Für private Bauprojekte auf Ihrem eigenen Grundstück benötigen Sie in der Regel keinen Baggerschein. Im öffentlichen Bereich ist ein Bedienerausweis erforderlich.` },
      { question: `Wird der Minibagger geliefert oder muss ich ihn abholen?`, answer: `Wir bieten sowohl Selbstabholung als auch Lieferung direkt auf Ihre Baustelle in ${location.name} und Umgebung an. Die Lieferkosten berechnen Sie online.` },
      { question: `Welches Anbaugerät brauche ich für meinen Bagger?`, answer: `Das hängt von Ihrem Projekt ab: Tieflöffel zum Ausheben, Grabenräumlöffel für Gräben, Hydraulikhammer für Abbruch, Sortiergreifer zum Sortieren. Wir beraten Sie gerne!` },
      { question: `Was kostet ein Minibagger mieten in ${location.name}?`, answer: `Minibagger gibt es bei SLT Rental ab ca. 95 €/Tag. Der Preis hängt von der Größe (1t bis 5t) und der Mietdauer ab. Wochen- und Monatstarife sind günstiger.` },
      { question: `Welche Bagger kann ich in ${location.name} mieten?`, answer: `Wir vermieten Minibagger von 1t bis 5t, Radlader und Dumper. Alle Maschinen inklusive passendem Tieflöffel. Weitere Anbaugeräte auf Anfrage.` },
    ],
    werkzeuge: [
      { question: `Kann ich Werkzeuge auch nur für einen Tag mieten?`, answer: `Ja, alle Werkzeuge bei SLT Rental in ${location.name} können tageweise gemietet werden. Auch Wochenend- und Wochenmiete ist möglich.` },
      { question: `Sind Verbrauchsmaterialien im Mietpreis enthalten?`, answer: `Verbrauchsmaterialien wie Bohrer, Trennscheiben etc. sind in der Regel nicht im Mietpreis enthalten, können aber separat erworben werden.` },
      { question: `Welche Werkzeuge kann ich in ${location.name} mieten?`, answer: `Bei SLT Rental mieten Sie Kernbohrer, Stemmhammer, Abbruchhammer, Trennschleifer, Kreissägen, Rüttler, Fliesenschneider, Laser und vieles mehr.` },
      { question: `Was kostet Werkzeuge mieten in ${location.name}?`, answer: `Profi-Werkzeuge gibt es ab ca. 10 €/Tag. Stemmhammer, Kernbohrer und Spezialwerkzeuge kosten je nach Gerät zwischen 15 und 50 €/Tag.` },
    ],
    arbeitsbuehnen: location.id === "krefeld" ? [
      { question: `Welche Arbeitsbühnen kann ich in Krefeld mieten?`, answer: `In Krefeld stehen die Zoomlion ZS0607 (7,80 m) und ZS1012 (11,80 m) Scherenbühnen, die Zoomlion ZMP09 Mastbühne (11,20 m, 3,23 m seitliche Reichweite), der Nifty HR12L Gelenkteleskopsteiger (12 m) sowie die TM18GTi Anhänger-Arbeitsbühne mit 18 m Arbeitshöhe bereit.` },
      { question: `Welche Mastbühne hat SLT Rental in Krefeld?`, answer: `Die Zoomlion ZMP09 mit 11,20 m Arbeitshöhe, 3,23 m seitlicher Reichweite und 7,75 m up-and-over-Höhe. Sie hat 2 Personen Korbtragkraft (200 kg), 230 V Anschluss im Korb und passt mit 1,79 m Durchfahrtshöhe durch Standardtore.` },
      { question: `Brauche ich für die Hubarbeitsbühne einen Schein?`, answer: `Für motorisierte Hubarbeitsbühnen wird in der Regel eine PSAgA-Einweisung bzw. ein IPAF-Bedienerausweis erwartet. Für die Anhänger-Arbeitsbühne TM18GTi reicht der Führerschein BE und eine Geräteeinweisung.` },
      { question: `Was kostet eine Arbeitsbühne mieten in Krefeld?`, answer: `Die Tagespreise starten bei rund 90 €/Tag für die kleine 7,80 m Scherenbühne. Wochen- und Monatstarife reduzieren den Tagespreis deutlich. Die genauen Konditionen siehst du im Buchungsprozess.` },
      { question: `Kann ich die Arbeitsbühne in Krefeld liefern lassen?`, answer: `Ja, wir liefern Hubarbeitsbühnen direkt nach Krefeld, Meerbusch, Willich, Tönisvorst, Kempen, Moers und Duisburg. Die Lieferkosten kannst du im Buchungsprozess transparent berechnen.` },
    ] : location.id === "bonn" ? [
      { question: `Welche Arbeitsbühnen kann ich in Bonn mieten?`, answer: `Am Standort Bonn stehen die elektrischen Zoomlion-Scherenbühnen ZS0607 (7,80 m) und ZS1012 (11,80 m), die Zoomlion ZMP09 Mastbühne (11,20 m) sowie die TM18GTi Anhänger-Arbeitsbühne mit 18 m Arbeitshöhe zur Verfügung.` },
      { question: `Welche Hubarbeitsbühne eignet sich für Indoor-Einsätze in Bonn?`, answer: `Für Hallen, Hotels und Eventlocations empfehlen wir die elektrischen Zoomlion-Scherenbühnen ZS0607 und ZS1012 sowie die ZMP09 Mastbühne. Alle drei arbeiten emissionsfrei, leise und haben non-marking Reifen.` },
      { question: `Wie hoch komme ich mit der Anhängerbühne in Bonn?`, answer: `Die TM18GTi Anhänger-Arbeitsbühne erreicht 18 m Arbeitshöhe und 10,50 m seitliche Reichweite. Sie ist mit Führerschein BE fahrbar und eignet sich ideal für Baumschnitt, Fassaden und Dacharbeiten in Bonn und Umgebung.` },
      { question: `Was kostet eine Arbeitsbühne mieten in Bonn?`, answer: `Die Tagespreise starten bei rund 90 €/Tag. Wochenpreise sparen bis zu 30 %. Den genauen Preis siehst du tagesaktuell im Buchungsprozess.` },
      { question: `Wohin liefert SLT Rental Hubarbeitsbühnen ab Bonn?`, answer: `Wir liefern in den Großraum Bonn – inklusive Königswinter, Sankt Augustin, Siegburg, Troisdorf, Meckenheim, Rheinbach und Bornheim.` },
    ] : [
      { question: `Welche Arbeitsbühnen kann ich in Mülheim an der Ruhr mieten?`, answer: `In Mülheim an der Ruhr stehen die elektrischen Zoomlion-Scherenbühnen ZS0607 (7,80 m) und ZS1012 (11,80 m), die Zoomlion ZMP09 Mastbühne (11,20 m) sowie die mitnehmbare Anhänger-Arbeitsbühne TM18GTi mit 18 m Arbeitshöhe bereit.` },
      { question: `Welche Bühne eignet sich für Industrie- und Hallenarbeiten im Ruhrgebiet?`, answer: `Für Hallen und Indoor-Einsätze sind die Zoomlion-Scherenbühnen ZS0607 und ZS1012 sowie die ZMP09 Mastbühne ideal – elektrisch, leise und mit non-marking Reifen.` },
      { question: `Brauche ich einen Schein für die Hubarbeitsbühne?`, answer: `Für motorisierte Hubarbeitsbühnen wird eine PSAgA-Einweisung bzw. ein IPAF-Ausweis erwartet. Für die TM18GTi Anhängerbühne reicht der Führerschein BE plus eine Geräteeinweisung.` },
      { question: `Liefert SLT Rental Arbeitsbühnen im Ruhrgebiet?`, answer: `Ja, wir liefern Hubarbeitsbühnen ab Mülheim an der Ruhr in das gesamte westliche Ruhrgebiet – inklusive Duisburg, Oberhausen, Essen, Bottrop und Ratingen.` },
      { question: `Was kostet eine Arbeitsbühne mieten in Mülheim an der Ruhr?`, answer: `Die Tagespreise starten bei rund 90 €/Tag. Wochen- und Monatstarife reduzieren den Tagespreis deutlich. Die genauen Konditionen siehst du im Buchungsprozess.` },
    ],
    gartenpflege: [
      { question: `Welche Gartengeräte kann ich in ${location.name} mieten?`, answer: `Häcksler, Erdbohrer, Vertikutierer, Kettensägen, Heckenscheren, Hochdruckreiniger, Rasenmäher, Laubbläser und Stubbenfräsen – alles bei SLT Rental.` },
      { question: `Was kostet ein Häcksler mieten?`, answer: `Gartenhäcksler gibt es ab ca. 35 €/Tag. Professionelle Walzenhäcksler sind ab ca. 75 €/Tag verfügbar. Wochenend-Tarife sind besonders günstig.` },
    ],
    huepfburgen: [
      { question: `Was kostet eine Hüpfburg mieten in ${location.name}?`, answer: `Hüpfburgen gibt es bei SLT Rental ab ca. 69 €/Tag. Größere Modelle und Wochenend-Pakete sind ebenfalls verfügbar.` },
      { question: `Liefert SLT Rental die Hüpfburg?`, answer: `Ja, wir liefern Hüpfburgen direkt zu Ihrem Event in ${location.name} und Umgebung. Auf Wunsch inklusive Aufbau.` },
      { question: `Für welches Alter sind die Hüpfburgen geeignet?`, answer: `Unsere Hüpfburgen sind für Kinder ab 3 Jahren geeignet. Wir haben verschiedene Größen für Kindergeburtstage, Schulfeste und Firmenfeiern.` },
    ],
    aggregate: [
      { question: `Welche Stromaggregate kann ich in ${location.name} mieten?`, answer: `Wir vermieten Stromaggregate von 2,8 kVA bis 100 kVA – für Baustelle, Event, Marktstand oder Notstromversorgung.` },
      { question: `Was kostet ein Stromaggregat mieten?`, answer: `Kleine Stromerzeuger gibt es ab ca. 25 €/Tag. Größere Aggregate für Events kosten je nach Leistung ab 50 €/Tag.` },
    ],
    verdichtung: [
      { question: `Was kostet eine Rüttelplatte mieten in ${location.name}?`, answer: `Rüttelplatten gibt es ab ca. 25 €/Tag. Vibrationsplatten und Vibrationsstampfer für alle Verdichtungsarbeiten verfügbar.` },
      { question: `Welche Rüttelplatte brauche ich?`, answer: `Für Pflasterarbeiten reicht eine leichte Vorwärts-Rüttelplatte. Für Erdarbeiten empfehlen wir reversierbare Platten oder Vibrationsstampfer.` },
    ],
    "heizung-trocknung": [
      { question: `Was kostet ein Bautrockner mieten in ${location.name}?`, answer: `Bautrockner gibt es ab ca. 15 €/Tag. Für Neubau-Trocknung empfehlen wir unsere leistungsstarken Geräte mit großer Trocknungsfläche.` },
      { question: `Wann brauche ich einen Bautrockner?`, answer: `Nach Wasserschäden, bei Neubau-Trocknung, Estrichtrocknung oder zur Schimmelvermeidung. Wir beraten Sie zur richtigen Gerätegröße.` },
    ],
    "moebel-zelte": [
      { question: `Was kostet ein Partyzelt mieten in ${location.name}?`, answer: `Partyzelte gibt es ab ca. 49 €/Tag. Größere Zelte für Hochzeiten und Firmenfeiern sind ab ca. 99 €/Tag verfügbar. Bierzeltgarnituren ab 10 €/Tag.` },
      { question: `Welche Möbel kann ich für Events mieten?`, answer: `Tische, Stühle, Bänke, Bierzeltgarnituren, Stehtische und Polstermöbel – alles bei SLT Rental in ${location.name}.` },
    ],
    "geschirr-glaeser-besteck": [
      { question: `Was kostet Geschirr mieten in ${location.name}?`, answer: `Geschirr-Sets gibt es ab 5 € pro 10er-Set. Wir bieten Standard- und Premiumgeschirr für jeden Anlass – von der Gartenparty bis zur Hochzeit.` },
      { question: `Muss ich das Geschirr sauber zurückgeben?`, answer: `Nein! Bei SLT Rental können Sie das Geschirr ungespült zurückgeben. Wir übernehmen die Reinigung für Sie.` },
    ],
    absperrtechnik: [
      { question: `Kann ich Halteverbotsschilder in ${location.name} mieten?`, answer: `Ja, wir vermieten Halteverbotsschilder nach StVO. Bitte beachten Sie: Die Genehmigung beim Ordnungsamt müssen Sie selbst beantragen.` },
      { question: `Was kostet Absperrtechnik mieten?`, answer: `Absperrgitter, Bauzäune und Verkehrszeichen gibt es ab ca. 3 €/Tag. Komplett-Sets für Baustellen-Absicherung auf Anfrage.` },
    ],
    beschallung: [
      { question: `Was kostet eine PA-Anlage mieten in ${location.name}?`, answer: `Bluetooth-Speaker gibt es ab ca. 25 €/Tag. Professionelle PA-Anlagen für bis zu 250 Personen ab ca. 79 €/Tag.` },
      { question: `Welche Beschallung brauche ich für mein Event?`, answer: `Für bis zu 30 Personen reicht ein Bluetooth-Speaker. Für 30-75 Personen empfehlen wir ein Kompakt-Set. Ab 75 Personen eine professionelle PA-Anlage.` },
    ],
    beleuchtung: [
      { question: `Was kostet Eventbeleuchtung mieten in ${location.name}?`, answer: `LED-Spots gibt es ab ca. 10 €/Tag. Moving Heads ab 35 €/Tag. Komplette Licht-Sets für Events auf Anfrage.` },
    ],
    kommunikation: [
      { question: `Was kostet ein Funkmikrofon mieten?`, answer: `Professionelle Funkmikrofone (Sennheiser) gibt es ab ca. 25 €/Tag. Headsets und Ansteckmikrofone sind ebenfalls verfügbar.` },
    ],
  };

  const moebelZelteCustom = category.id === "moebel-zelte" ? moebelZelteContent[location.id] : undefined;

  const faqs = moebelZelteCustom?.faqs || categoryFaqs[category.id] || [
    { question: `Kann ich ${categoryDisplayName} in ${location.name} mieten?`, answer: `Ja! SLT Rental bietet ${categoryDisplayName} zur Miete in ${location.name} an. Wählen Sie aus ${products.length} verfügbaren Artikeln.` },
    { question: `Wie kann ich bei SLT Rental ${categoryDisplayName} reservieren?`, answer: `Sie können direkt über unsere Website buchen oder uns telefonisch bzw. per E-Mail kontaktieren. Auf-Anfrage-Artikel werden innerhalb eines Werktages bestätigt.` },
    { question: `Bietet SLT Rental Lieferung für ${categoryDisplayName} an?`, answer: `Ja, wir liefern ${categoryDisplayName} direkt zu Ihrem Einsatzort in ${location.name} und Umgebung. Die Lieferkosten können Sie mit unserem Online-Rechner ermitteln.` },
  ];

  // ItemList JSON-LD for category page
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${categoryDisplayName} mieten in ${cityName} – SLT Rental`,
    "url": `https://www.slt-rental.de${seoCanonical}`,
    "itemListElement": products.slice(0, 50).map((p, i) => {
      const imgSrc = p.images?.[0] || p.image || "";
      const imgUrl = imgSrc.startsWith("http") ? imgSrc : imgSrc ? `https://www.slt-rental.de${imgSrc.startsWith("/") ? "" : "/"}${imgSrc}` : undefined;
      return {
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "Product",
          "name": p.name,
          "image": imgUrl,
          "url": `https://www.slt-rental.de/mieten/${location.id}/${productCategoryMap.get(p.id) || category.id}/${p.id}`,
          "offers": {
            "@type": "Offer",
            "availability": "https://schema.org/InStock",
            "url": `https://www.slt-rental.de/mieten/${location.id}/${productCategoryMap.get(p.id) || category.id}/${p.id}`,
          },
        },
      };
    }),
  };

  const jsonLdArray = [
    SLT_LOCATION_JSONLD(location.id),
    SLT_BREADCRUMB_JSONLD([
      { name: "Home", url: "/" },
      { name: location.name, url: `/mieten/${location.id}` },
      { name: categoryDisplayName, url: seoCanonical },
    ]),
    SLT_FAQ_JSONLD(faqs),
    itemListJsonLd,
  ];

  return (
    <Layout>
      <SEO
        title={finalSeoTitle}
        description={finalSeoDescription}
        canonical={seoCanonical}
        keywords={seoKeywords}
        jsonLd={jsonLdArray as unknown as Record<string, unknown>[]}
      />
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
                {category.id === "alle" ? category.title : `${category.title} mieten in ${location.name}`}
              </h1>
              <p className="text-primary-foreground/80 mt-1">
                {moebelOverride?.heroLead || category.description}
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
            {/* Main Description - short on mobile, full on desktop */}
             <p className="text-foreground mb-6 hidden lg:block">
               {t("rental.earthMovingDesc")}
              </p>
             <p className="text-foreground mb-6 lg:hidden">
               Minibagger, Dumper oder Radlader mieten – wir haben die passende Maschine für Ihr Bauprojekt.
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

      {/* Info Banner for Heizung & Trocknung */}
      {category.id === "heizung-trocknung" && (
        <section className="bg-accent/10 border-y border-accent/20">
          <div className="section-container py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Thermometer className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Heizlüfter & Heizpilz</p>
                  <p className="text-sm text-muted-foreground">Für Räume, Baustellen & Veranstaltungen</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Bautrockner mit MID-Zähler</p>
                  <p className="text-sm text-muted-foreground">Geeichter Stromzähler – faire Abrechnung</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Wind className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Arbeitsbereich 5 °C – 35 °C</p>
                  <p className="text-sm text-muted-foreground">Ganzjährig einsetzbar</p>
                </div>
              </div>
            </div>

            {/* Starkstrom warning */}
            <div className="mt-5 pt-5 border-t border-accent/20">
              <div className="flex items-start gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    ⚡ Starkstromanschluss ab 3 kW Heizleistung erforderlich
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Unser <strong>9 kW Heizlüfter</strong> benötigt einen <strong>400 V CEE-Starkstromanschluss</strong> (roter CEE-Stecker, 16 A).
                    Bitte stellen Sie sicher, dass am Einsatzort ein entsprechender Anschluss vorhanden ist.
                    Heizgeräte bis 3 kW können an einer normalen 230 V Schuko-Steckdose betrieben werden.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Info Banner for other categories */}
      {category.id !== "anhaenger" && category.id !== "erdbewegung" && category.id !== "heizung-trocknung" && category.id !== "alle" && (
        <CategoryInfoBanner categoryId={category.id} />
      )}

      {/* Bundle-Hinweis: Baumaschinenanhänger für Selbstabholer */}
      {(category.id === "arbeitsbuehnen" || category.id === "erdbewegung") && (
        <BaumaschinenanhaengerBundleHint locationId={location.id} />
      )}

      {/* Dienstleistungs-Banner (nicht bei absperrtechnik, da dort bereits im InfoBanner enthalten) */}
      {category.id !== "alle" && category.id !== "absperrtechnik" && (
        <section className="pt-4 lg:pt-6">
          <div className="section-container">
            <ServiceBanner categoryId={category.id} locationId={location.id} />
          </div>
        </section>
      )}

      {/* Spülmaschine Recommendation for Geschirr/Gläser/Besteck */}
      {category.id === "geschirr-glaeser-besteck" && (() => {
        const spuelmaschine = allProducts.find(p => 
          p.id === "spuelmaschine-frontlader" || p.id === "bonn-spuelmaschine-gastro"
        );
        if (!spuelmaschine) return null;
        const spuelmaschineLink = `/mieten/${location.id}/${category.id}/${spuelmaschine.id}`;
        return (
          <section className="pt-4 lg:pt-6">
            <div className="section-container">
              <Link to={spuelmaschineLink} className="block">
                <div className="flex items-center gap-4 bg-accent/10 border border-accent/30 rounded-xl p-4 hover:bg-accent/15 transition-colors group">
                  {spuelmaschine.image && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-background flex-shrink-0 border border-border">
                      <img src={spuelmaschine.image} alt={spuelmaschine.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="text-xs font-semibold text-accent uppercase tracking-wide">Empfehlung</span>
                    </div>
                    <p className="font-semibold text-foreground group-hover:text-accent transition-colors">{spuelmaschine.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">Professionell reinigen statt Reinigungspauschale zahlen – ideal bei großen Mengen an Geschirr, Gläsern & Besteck.</p>
                  </div>
                  <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180 flex-shrink-0 group-hover:text-accent transition-colors" />
                </div>
              </Link>
            </div>
          </section>
        );
      })()}

      {/* Products */}
      <section className="py-8 lg:py-12">
        <div className="section-container">
          {allProducts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar with Filters */}
              <div className="lg:col-span-1 order-1 lg:order-1">
                {/* Mobile/Tablet: collapsible filter toggle */}
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="lg:hidden w-full flex items-center justify-between gap-2 bg-card border border-border rounded-xl p-4 mb-4"
                >
                  <span className="flex items-center gap-2 font-semibold text-foreground">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t("rental.filters", "Filter")}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
                <div className="sticky top-4 space-y-4">
                  {/* Scrollable filter area with delivery calculator included */}
                  <div className="space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 pb-2">
                    {/* Availability filter */}
                    <div className="bg-card border border-border rounded-xl p-4">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={onlyAvailable}
                          onChange={(e) => setOnlyAvailable(e.target.checked)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-[hsl(var(--primary))]"
                        />
                        <div>
                          <span className="font-semibold text-sm text-foreground">Am Standort verfügbar</span>
                          <p className="text-xs text-muted-foreground mt-0.5">Nur direkt buchbare Artikel anzeigen</p>
                        </div>
                      </label>
                    </div>
                    {/* "Alle" category: Search + Category Filter */}
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
                              className="pl-4 bg-background"
                            />
                          </div>
                        </div>
                        {/* Category filter for "alle" */}
                        {availableCategories.length > 0 && (
                          <div className="bg-card border border-border rounded-xl p-4">
                            <h3 className="font-semibold text-foreground mb-3">{t("rental.categories")}</h3>
                            <div className="space-y-1">
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
                        )}
                      </>
                    )}
                    {category.id === "anhaenger" && (
                      <TrailerFilter onFilterChange={setTrailerFilters} initialState={trailerFilters} />
                    )}
                    {category.id === "erdbewegung" && (
                      <CategoryFilter
                        searchPlaceholder={t(categorySearchPlaceholders["erdbewegung"] || "catSearch.default")}
                        sections={categoryFilterMap["erdbewegung"]}
                        onFilterChange={setEarthMovingFilters}
                        variant="accordion"
                      />
                    )}
                    {/* Generic filter for other categories */}
                    {category.id !== "anhaenger" && category.id !== "erdbewegung" && category.id !== "alle" && (
                      <>
                        {categoryFilterMap[category.id] && (
                          <>
                            <CategoryFilter
                              searchPlaceholder={t(categorySearchPlaceholders[category.id] || "catSearch.default")}
                              sections={categoryFilterMap[category.id]}
                              onFilterChange={setGenericFilters}
                              variant={(category.id === "heizung-trocknung" || category.id === "beschallung") ? "accordion" : "badges"}
                            />
                            {/* Starkstrom-Hinweis: show in sidebar when 9 kW filter is active */}
                            {category.id === "heizung-trocknung" && genericFilters.filters["heizleistung"]?.includes("ab-9kw") && (
                              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-sm text-foreground mb-1">400 V CEE erforderlich</p>
                                  <p className="text-xs text-muted-foreground">
                                    Der 9 kW Heizlüfter benötigt einen roten CEE-Starkstromanschluss (400 V / 16 A) am Einsatzort.
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {/* Delivery Calculator - inside scrollable area */}
                    {category.id !== "anhaenger" && (
                      <div className="hidden lg:block">
                        {category.id === "alle" ? (
                          <DeliveryCalculatorCompact showAllCategories />
                        ) : (
                          <DeliveryCalculatorCompact 
                            productCategoryId={category.id}
                            categoryDisplayName={t(categoryDisplayNames[category.id] || "catDisplay.werkzeuge")}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>

              {/* Product Grid */}
              <div ref={productGridRef} className="lg:col-span-2 order-2 lg:order-2">
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

              {/* Delivery Calculator - mobile only, after products */}
              <div className="lg:hidden order-3 col-span-1">
                {category.id === "alle" ? (
                  <DeliveryCalculatorCompact showAllCategories />
                ) : category.id !== "anhaenger" ? (
                  <DeliveryCalculatorCompact 
                    productCategoryId={category.id}
                    categoryDisplayName={t(categoryDisplayNames[category.id] || "catDisplay.werkzeuge")}
                  />
                ) : null}
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

      {/* SEO Content Text Block */}
      {category.id !== "alle" && (
        <section className="py-10 lg:py-14">
          <div className="section-container">
            <div className="max-w-3xl mx-auto prose prose-sm">
              <h2 className="text-xl font-bold text-headline mb-4">
                {moebelOverride?.bottomHeadline || `${categoryDisplayName} mieten in ${location.name} – günstig & unkompliziert`}
              </h2>
              {moebelOverride ? (
                <>
                  {moebelOverride.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="mb-6">
                      <h3 className="text-lg font-semibold text-headline mt-6 mb-3">{sec.h2}</h3>
                      {sec.paragraphs.map((p, pIdx) => (
                        <p key={pIdx} className="text-muted-foreground mb-3">{p}</p>
                      ))}
                      {sec.table && (
                        <div className="overflow-x-auto mt-3">
                          <table className="w-full text-sm border border-border">
                            <thead className="bg-muted">
                              <tr>
                                {sec.table.headers.map((h, i) => (
                                  <th key={i} className="px-3 py-2 text-left font-semibold text-foreground border-b border-border">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sec.table.rows.map((row, ri) => (
                                <tr key={ri} className="border-b border-border last:border-0">
                                  {row.map((cell, ci) => (
                                    <td key={ci} className="px-3 py-2 text-muted-foreground">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">
                    {categorySeoTexts[category.id]?.[0] || `Bei SLT Rental in ${location.name} finden Sie ${categoryDisplayName} zur Miete – schnell, fair und unkompliziert. Ob für Ihr Bauprojekt, Ihren Garten oder Ihr Event: Wir haben das passende Equipment für Sie.`}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    {categorySeoTexts[category.id]?.[1] || `Profitieren Sie von unserer Tiefpreisgarantie und attraktiven Wochenend-Tarifen. Alle Geräte werden regelmäßig gewartet und sind sofort einsatzbereit. Lieferung direkt auf Ihre Baustelle oder zu Ihrem Veranstaltungsort in ${location.name} und Umgebung ist selbstverständlich möglich.`}
                  </p>
                  {categorySeoTexts[category.id]?.[2] && (
                    <p className="text-muted-foreground">
                      {categorySeoTexts[category.id][2]}
                    </p>
                  )}
                </>
              )}

              {/* FAQ Section */}
              <h3 className="text-lg font-semibold text-headline mt-8 mb-4">
                Häufige Fragen: {categoryDisplayName} mieten in {location.name}
              </h3>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <details key={idx} className="group border border-border rounded-lg">
                    <summary className="cursor-pointer px-4 py-3 font-medium text-foreground hover:text-primary transition-colors list-none flex items-center justify-between">
                      {faq.question}
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0 ml-2" />
                    </summary>
                    <p className="px-4 pb-3 text-sm text-muted-foreground">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

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
        categoryId={categoryId}
      />
    </Layout>
  );
}
