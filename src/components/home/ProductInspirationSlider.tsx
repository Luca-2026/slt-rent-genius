import { useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  getAllProductsForLocation,
  getProductWithContext,
  Product,
} from "@/data/rentalData";

/** Pick `count` random products that have an image */
function pickRandomProducts(count: number): (Product & { locationId: string; categoryId: string })[] {
  const all = getAllProductsForLocation("krefeld").filter((p) => p.image);

  // Shuffle (Fisher-Yates)
  const shuffled = [...all].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count).map((p) => {
    const ctx = getProductWithContext(p.id);
    return {
      ...p,
      locationId: ctx?.locationId ?? "krefeld",
      categoryId: ctx?.categoryId ?? "",
    };
  });
}

export function ProductInspirationSlider() {
  const products = useMemo(() => pickRandomProducts(16), []);

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
    // Pause on interaction
    emblaApi.on("pointerDown", () => clearInterval(id));
    return () => clearInterval(id);
  }, [emblaApi, autoplay]);

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
          {products.map((product) => {
            const href = `/mieten/${product.locationId}/${product.categoryId}/${product.id}`;
            return (
              <div
                key={product.id}
                className="flex-[0_0_260px] sm:flex-[0_0_280px] lg:flex-[0_0_300px] min-w-0"
              >
                <Link to={href} className="block group">
                  <Card className="h-full overflow-hidden border-2 hover:border-accent/40 hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {product.category && (
                        <Badge
                          variant="secondary"
                          className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm text-xs"
                        >
                          {product.category}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-headline text-sm leading-tight line-clamp-2 mb-1 group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-accent mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Details ansehen
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
