import { useMemo, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ArrowRight, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  locations,
  Product,
} from "@/data/rentalData";

/** Pick `count` random products that have a real photo and are visually appealing */
const excludedCategoryIds = new Set([
  "absperrtechnik", "kabel-stromverteiler",
]);

function pickRandomProducts(count: number): (Product & { categoryId: string })[] {
  // Gather products from all categories except excluded ones
  const all: (Product & { categoryId: string })[] = [];
  const location = locations.find((l) => l.id === "krefeld");
  if (!location) return [];

  for (const [catId, products] of Object.entries(location.products)) {
    if (excludedCategoryIds.has(catId)) continue;
    for (const p of products) {
      if (p.image) {
        all.push({ ...p, categoryId: catId });
      }
    }
  }

  // Shuffle
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function ProductInspirationSlider() {
  const navigate = useNavigate();
  const products = useMemo(() => pickRandomProducts(16), []);

  // Location dialog state
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ categoryId: string; id: string } | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
  });

  // Auto-scroll
  const autoplay = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const id = setInterval(autoplay, 3000);
    emblaApi.on("pointerDown", () => clearInterval(id));
    return () => clearInterval(id);
  }, [emblaApi, autoplay]);

  const handleProductClick = useCallback((product: { categoryId: string; id: string }) => {
    setSelectedProduct(product);
    setLocationDialogOpen(true);
  }, []);

  const handleLocationSelect = useCallback((locationId: string) => {
    setLocationDialogOpen(false);
    if (selectedProduct) {
      navigate(`/mieten/${locationId}/${selectedProduct.categoryId}/${selectedProduct.id}`);
    }
  }, [selectedProduct, navigate]);

  if (products.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 bg-background overflow-hidden">
      <div className="section-container">
        <AnimatedSection className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-accent/20">
            <Sparkles className="h-3.5 w-3.5" />
            Inspiration
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-3">
            Entdecken Sie unser Sortiment
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Eine Auswahl aus über 300 Mietartikeln – von Baumaschinen bis Event-Equipment.
          </p>
        </AnimatedSection>
      </div>

      {/* Full-width carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 pl-4 md:pl-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-[0_0_260px] sm:flex-[0_0_280px] lg:flex-[0_0_300px] min-w-0"
            >
              <button
                type="button"
                onClick={() => handleProductClick(product)}
                className="block w-full text-left group"
              >
                <Card className="h-[340px] flex flex-col overflow-hidden border-2 hover:border-accent/40 hover:shadow-lg transition-all duration-300">
                  <div className="relative h-[200px] overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-headline text-sm leading-tight line-clamp-2 min-h-[2.5rem] mb-1 group-hover:text-accent transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                      {product.description || ""}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-accent mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Details ansehen
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Location selection dialog */}
      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Standort wählen
            </DialogTitle>
            <DialogDescription>
              Wählen Sie Ihren Standort, um Verfügbarkeit und Preise zu sehen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 mt-4">
            {locations.map((location) => (
              <Button
                key={location.id}
                variant="outline"
                className="h-auto py-4 px-4 justify-start text-left hover:border-primary hover:bg-primary/5 w-full overflow-hidden"
                onClick={() => handleLocationSelect(location.id)}
              >
                <div className="flex items-start gap-3 min-w-0 w-full overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary">{location.shortName}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-headline">{location.name}</div>
                    <div className="text-sm text-muted-foreground break-words">{location.address}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
