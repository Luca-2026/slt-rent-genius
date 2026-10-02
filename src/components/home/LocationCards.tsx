import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { MapPin, Phone, Mail, Clock, ArrowRight, Building2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedSection } from "@/components/ui/animated-section";
import { locationData } from "@/data/locationData";
import { useTranslation } from "react-i18next";

function LocationCard({ loc }: { loc: (typeof locationData)[number] }) {
  const { t } = useTranslation();
  return (
    <Card className="h-full group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/30 overflow-hidden flex flex-col">
      {/* Location Image */}
      <Link to={`/mieten/${loc.id}/`} className="aspect-[16/9] relative overflow-hidden block cursor-pointer">
        {loc.image ? (
          <img
            src={loc.image}
            alt={`SLT Rental Mietstation ${loc.name} – Baumaschinen und Eventartikel mieten`}
            width={640}
            height={360}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Building2 className="h-16 w-16 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 md:bottom-2 md:left-2 md:right-2 lg:bottom-4 lg:left-4 lg:right-4">
          <span className="text-xs text-accent font-medium uppercase tracking-wide md:text-[10px] lg:text-xs">
            {loc.subtitle}
          </span>
          <p className="text-xl font-bold text-white md:text-base lg:text-xl">
            {loc.name}
          </p>
        </div>
      </Link>

      <CardContent className="p-4 sm:p-5 md:p-3 lg:p-5 flex flex-col flex-1">
        {/* Address */}
        <div className="flex items-start gap-2 md:gap-1.5 text-sm md:text-xs lg:text-sm mb-1">
          <MapPin className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="block text-body break-words">{loc.address}</span>
            <span className="block text-body break-words">{loc.city}</span>
          </div>
        </div>

        {/* Phone */}
        <a
          href={`tel:${loc.phone.replace(/\s/g, '')}`}
          className="flex items-center gap-2 md:gap-1.5 text-sm md:text-xs lg:text-sm text-muted-foreground mb-1 hover:text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Phone className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 shrink-0 text-primary" />
          <span>{loc.phone}</span>
        </a>

        {/* Email */}
        <a
          href={`mailto:${loc.email}`}
          className="flex items-center gap-2 md:gap-1.5 text-sm md:text-xs lg:text-sm text-muted-foreground mb-2 md:mb-2 lg:mb-3 hover:text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Mail className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 shrink-0 text-primary" />
          <span className="truncate">{loc.email}</span>
        </a>

        {/* Hours - fixed height for consistency across all 3 cards */}
        <div className="mb-2 md:mb-2 lg:mb-3 p-3 md:p-2 lg:p-3 bg-surface-light rounded-lg min-h-[90px] md:min-h-[76px] lg:min-h-[108px]">
          <div className="flex items-center gap-2 md:gap-1.5 text-sm md:text-xs lg:text-sm font-medium text-headline mb-2 md:mb-1 lg:mb-2">
            <Clock className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 text-primary" />
            {t("locations.openingHours")}
          </div>
          <div className="space-y-1 md:space-y-0.5">
            {loc.hours.map((h, idx) => (
              <div key={idx} className="flex justify-between gap-2 md:gap-1 text-xs md:text-[10px] lg:text-xs text-muted-foreground">
                <span className="shrink-0">{h.day}</span>
                <span className="font-medium text-right">{h.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Manager - fixed height for consistency */}
        <a
          href={`mailto:${loc.manager.email}`}
          className="flex items-center gap-3 md:gap-2 lg:gap-3 mb-3 md:mb-2 lg:mb-4 p-3 md:p-2 lg:p-3 bg-surface-light rounded-lg hover:bg-accent/10 transition-colors cursor-pointer h-[64px] md:h-[52px] lg:h-[72px]"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className="h-10 w-10 md:h-7 md:w-7 lg:h-10 lg:w-10 shrink-0">
            {loc.manager.image ? (
              <AvatarImage src={loc.manager.image} alt={loc.manager.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-headline text-sm md:text-[11px] lg:text-sm truncate">{loc.manager.name}</p>
            <p className="text-xs md:text-[10px] lg:text-xs text-muted-foreground truncate">{t(loc.manager.role)}</p>
          </div>
          <Mail className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 text-muted-foreground shrink-0" />
        </a>

        {/* CTA - pushed to bottom */}
        <Link to={`/mieten/${loc.id}/`} className="mt-auto">
          <Button className="w-full bg-primary hover:bg-primary/90 md:text-[10px] md:h-9 md:px-2 lg:text-sm lg:h-10 lg:px-4">
            {t("locations.viewCategories")}
            <ArrowRight className="ml-1 h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 shrink-0" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * Standort-Sektion: auf Mobil als automatisch durchlaufender, wischbarer
 * Slider (Embla), ab Tablet/Desktop als klassisches 3-Spalten-Grid.
 */
export default function LocationCards() {
  const { t } = useTranslation();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Selected slide tracking for the dots
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Autoplay: 6 s, pausiert beim Antippen/Wischen und bei "weniger Bewegung"
  useEffect(() => {
    if (!emblaApi) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let id: ReturnType<typeof setInterval>;
    const start = () => {
      clearInterval(id);
      id = setInterval(() => emblaApi.scrollNext(), 6000);
    };
    start();
    const stop = () => clearInterval(id);
    emblaApi.on("pointerDown", stop);
    emblaApi.on("pointerUp", start);
    return () => {
      clearInterval(id);
      emblaApi.off("pointerDown", stop);
      emblaApi.off("pointerUp", start);
    };
  }, [emblaApi]);

  return (
    <>
      {/* Mobile: wischbarer Slider */}
      <div className="md:hidden -mx-4">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {locationData.map((loc) => (
              <div key={loc.id} className="flex-[0_0_100%] min-w-0 px-4">
                <LocationCard loc={loc} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {locationData.map((loc, idx) => (
            <button
              key={loc.id}
              type="button"
              aria-label={`Standort ${loc.name} anzeigen`}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === selectedIndex ? "w-6 bg-primary" : "w-2 bg-primary/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tablet/Desktop: Grid */}
      <div className="hidden md:grid grid-cols-3 gap-3 lg:gap-6">
        {locationData.map((loc, index) => (
          <AnimatedSection key={loc.id} delay={index * 100} animation="fade-in-up">
            <LocationCard loc={loc} />
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection className="text-center mt-10" delay={300}>
        <Link to="/standorte/">
          <Button variant="outline" size="lg" className="group border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground">
            {t("locations.viewAll")}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </AnimatedSection>
    </>
  );
}
