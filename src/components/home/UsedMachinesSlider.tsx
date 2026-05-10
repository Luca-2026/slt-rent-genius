import { useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ArrowRight, Tag, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function formatPrice(price: number | null, onRequest: boolean) {
  if (onRequest || !price) return "Preis auf Anfrage";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);
}

export function UsedMachinesSlider() {
  const { data: machines = [] } = useQuery({
    queryKey: ["used-machines-slider"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("used_machines")
        .select("id, slug, manufacturer, model, year, hours, price_net, price_on_request, status, images, is_featured")
        .neq("status", "sold")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(16);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
  });

  const autoplay = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const id = setInterval(autoplay, 3500);
    emblaApi.on("pointerDown", () => clearInterval(id));
    return () => clearInterval(id);
  }, [emblaApi, autoplay]);

  if (machines.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 bg-background overflow-hidden">
      <div className="section-container">
        <AnimatedSection className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-accent/20">
            <Tag className="h-3.5 w-3.5" />
            SLT Used
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-3">
            Geprüfte Gebrauchtmaschinen aus unserem Mietpark
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sofort verfügbare Maschinen mit Servicehistorie und 12 Monaten SLT Used Garantie –
            jetzt zum attraktiven Sonderpreis sichern.
          </p>
        </AnimatedSection>
      </div>

      {(() => {
        const renderCard = (m: any) => {
          const img = Array.isArray(m.images) && m.images.length > 0 ? m.images[0] : null;
          const price = m.price_net ? Number(m.price_net) : null;
          return (
            <Link
              to={`/verkauf/gebrauchtmaschinen/${m.slug}`}
              className="block w-full text-left group h-full"
            >
              <Card className="h-[360px] flex flex-col overflow-hidden border-2 hover:border-accent/40 hover:shadow-lg transition-all duration-300">
                <div className="relative h-[200px] overflow-hidden bg-muted flex-shrink-0">
                  {img ? (
                    <img
                      src={img}
                      alt={`${m.manufacturer} ${m.model}`}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {m.is_featured && (
                      <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0">
                        Top
                      </Badge>
                    )}
                    {m.status === "reserved" && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Reserviert
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
                    {m.manufacturer}
                  </p>
                  <p className="font-semibold text-headline text-sm leading-tight line-clamp-2 min-h-[2.5rem] mb-1 group-hover:text-accent transition-colors">
                    {m.model}
                  </p>
                  <p className="text-xs text-muted-foreground flex-1">
                    {[
                      m.year ? `Bj. ${m.year}` : null,
                      m.hours != null ? `${Number(m.hours).toLocaleString("de-DE")} Bh` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="text-sm font-bold text-primary mt-2">
                    {formatPrice(price, m.price_on_request)}
                    {price && (
                      <span className="text-[10px] font-normal text-muted-foreground ml-1">
                        netto
                      </span>
                    )}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Details ansehen
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        };

        return (
          <>
            {/* Desktop: 4er Grid zentriert, kein Slider */}
            <div className="hidden lg:block section-container">
              <div className="grid grid-cols-4 gap-6">
                {machines.slice(0, 4).map((m: any) => (
                  <div key={m.id}>{renderCard(m)}</div>
                ))}
              </div>
            </div>

            {/* Mobil & Tablet: Slider */}
            <div className="lg:hidden overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4 pl-4 md:pl-8">
                {machines.map((m: any) => (
                  <div
                    key={m.id}
                    className="flex-[0_0_260px] sm:flex-[0_0_280px] min-w-0"
                  >
                    {renderCard(m)}
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      })()}

      <div className="section-container text-center mt-10">
        <Link to="/verkauf/gebrauchtmaschinen">
          <Button
            variant="outline"
            size="lg"
            className="group border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            Alle Gebrauchtmaschinen ansehen
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
