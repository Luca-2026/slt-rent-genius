import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Grid3X3, Package, Clock, Smartphone, Lock, Scale, Boxes, Gauge } from "lucide-react";
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

export default function CategoryProducts() {
  const { locationId, categoryId } = useParams<{ locationId: string; categoryId: string }>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [trailerFilters, setTrailerFilters] = useState<TrailerFilterState>({
    search: "",
    types: [],
    braking: [],
    axles: [],
  });
  
  const location = locationId ? getLocationById(locationId) : undefined;
  const category = categoryId ? getCategoryById(categoryId) : undefined;

  const allProducts = useMemo(() => {
    if (!location || !category) return [];
    return getProductsForLocationCategory(location.id, category.id);
  }, [location, category]);

  const otherCategories = useMemo(() => {
    if (!location || !category) return [];
    return getCategoriesForLocation(location.id).filter(
      (c) => c.id !== category.id && c.id !== "alle"
    );
  }, [location, category]);

  // Filter and sort products for trailers
  const products = useMemo(() => {
    let filtered = [...allProducts];

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

      // Axle filters
      if (trailerFilters.axles.length > 0) {
        filtered = filtered.filter((p) =>
          trailerFilters.axles.some((axle) => p.tags?.includes(axle))
        );
      }

      // Sort by weight
      filtered.sort((a, b) => (a.weightKg || 0) - (b.weightKg || 0));
    }

    return filtered;
  }, [allProducts, trailerFilters, category?.id]);

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
          <h1 className="text-2xl font-bold mb-4">Standort nicht gefunden</h1>
          <Link to="/mieten">
            <Button>Zurück zur Standortauswahl</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="section-container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Kategorie nicht gefunden</h1>
          <Link to={`/mieten/${location.id}`}>
            <Button>Zurück zu den Kategorien</Button>
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
            Zurück zu {location.name}
          </Link>

          <div className="flex items-start gap-6">
            {/* Category Icon - larger, no background for anhänger */}
            {category.id === "anhaenger" ? (
              <img 
                src={category.icon} 
                alt={category.title}
                className="w-24 h-24 object-contain"
              />
            ) : (
              <div className="w-20 h-20 bg-background rounded-xl p-3 flex items-center justify-center">
                {category.id === "alle" ? (
                  <Grid3X3 className="h-10 w-10 text-primary" />
                ) : category.icon ? (
                  <img 
                    src={category.icon} 
                    alt={category.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-lg" />
                )}
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
                  <p className="font-semibold text-foreground">24/7 verfügbar</p>
                  <p className="text-sm text-muted-foreground">Mieten per Codesystem</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">SMS-Code nach Zahlung</p>
                  <p className="text-sm text-muted-foreground">Code nur im Mietzeitraum gültig</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Schloss entsperren</p>
                  <p className="text-sm text-muted-foreground">Rückgabe am Abholort</p>
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
                  <p className="font-semibold text-foreground">750 kg bis 3.500 kg</p>
                  <p className="text-sm text-muted-foreground">Verschiedene Größen verfügbar</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Boxes className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Verschiedene Aufbauten</p>
                  <p className="text-sm text-muted-foreground">Planen-, Koffer- u.v.m.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Gauge className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">100 km/h Zulassung</p>
                  <p className="text-sm text-muted-foreground">Alle mit 13-Pol Stecker</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="py-8 lg:py-12">
        <div className="section-container">
          {allProducts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar with Filters */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <div className="sticky top-4 space-y-6">
                  {category.id === "anhaenger" && (
                    <TrailerFilter onFilterChange={setTrailerFilters} />
                  )}
                  {category.id !== "anhaenger" && (
                    <DeliveryCalculatorCompact productCategoryId={category.id} />
                  )}
                </div>
              </div>

              {/* Product Grid */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={() => handleProductClick(product)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/30 rounded-xl">
                    <p className="text-muted-foreground">Keine Anhänger gefunden. Bitte passe deine Filter an.</p>
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
                Noch keine Produkte hinterlegt
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Die Produkte für diese Kategorie werden in Kürze hinzugefügt. 
                Kontaktiere uns gerne direkt für eine Anfrage.
              </p>
              <div className="flex justify-center gap-4">
                <a href={`tel:${location.phone.replace(/\s/g, '')}`}>
                  <Button>
                    {location.phone}
                  </Button>
                </a>
                <a href={`mailto:${location.email}`}>
                  <Button variant="outline">
                    E-Mail senden
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
              Weitere Kategorien in {location.name}
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
