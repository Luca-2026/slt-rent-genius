import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Grid3X3, HardHat, PartyPopper, Truck } from "lucide-react";
import { getCategoriesForLocation, type ProductCategory, type LocationData } from "@/data/rentalData";
import { useTranslatedCategories } from "@/hooks/useTranslatedProduct";

interface CategoryGridProps {
  location: LocationData;
}

// Gruppierung in BAU / EVENT / TRANSPORT & OUTDOOR
// Reihenfolge innerhalb jeder Gruppe entspricht der Anzeigereihenfolge.
const CATEGORY_GROUPS: Array<{
  id: "bau" | "event" | "transport";
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  categoryIds: string[];
}> = [
  {
    id: "bau",
    title: "BAU",
    subtitle: "alles für Baustelle, Handwerk, GaLaBau",
    icon: HardHat,
    categoryIds: [
      "erdbewegung",
      "verdichtung",
      "arbeitsbuehnen",
      "werkzeuge",
      "leitern-gerueste",
      "gartenpflege",
      "aggregate",
      "kabel-stromverteiler",
      "heizung-trocknung",
      "absperrtechnik",
    ],
  },
  {
    id: "event",
    title: "EVENT",
    subtitle: "alles für Veranstaltungen",
    icon: PartyPopper,
    categoryIds: [
      "beleuchtung",
      "beschallung",
      "buehne",
      "traversen-rigging",
      "kommunikation",
      "spezialeffekte",
      "moebel-zelte",
      "geschirr-glaeser-besteck",
      "huepfburgen",
    ],
  },
  {
    id: "transport",
    title: "TRANSPORT & OUTDOOR",
    icon: Truck,
    categoryIds: [
      "anhaenger",
      "nutzfahrzeuge",
      "wohnwagen-camping",
    ],
  },
];

function CategoryCard({ category, locationId }: { category: ProductCategory; locationId: string }) {
  return (
    <Link to={`/mieten/${locationId}/${category.id}`}>
      <Card className="h-full group hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
        <div className="aspect-square bg-muted/50 flex items-center justify-center p-3 md:p-4 group-hover:bg-primary/5 transition-colors">
          {category.id === "alle" ? (
            <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Grid3X3 className="h-10 w-10 md:h-12 md:w-12 text-primary" />
            </div>
          ) : category.icon ? (
            <img
              src={category.icon}
              alt={category.title}
              className="w-[85%] h-[85%] object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-20 h-20 bg-muted rounded-full" />
          )}
        </div>
        <CardContent className="p-3 text-center">
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {category.title}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );
}

export function CategoryGrid({ location }: CategoryGridProps) {
  const rawCategories = getCategoriesForLocation(location.id);
  const categories = useTranslatedCategories(rawCategories);

  const byId = new Map(categories.map((c) => [c.id, c]));
  const alleCategory = byId.get("alle");

  // Sammle gruppierte Kategorien (nur die, die am Standort verfügbar sind)
  const groupedSections = CATEGORY_GROUPS
    .map((group) => ({
      ...group,
      cats: group.categoryIds
        .map((id) => byId.get(id))
        .filter((c): c is ProductCategory => Boolean(c)),
    }))
    .filter((g) => g.cats.length > 0);

  // Restliche Kategorien (nicht zugeordnet, ohne "alle") → fallback
  const groupedIds = new Set(CATEGORY_GROUPS.flatMap((g) => g.categoryIds));
  const ungrouped = categories.filter((c) => c.id !== "alle" && !groupedIds.has(c.id));

  return (
    <div className="space-y-8 md:space-y-10">
      {groupedSections.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.id}>
            <div className="flex items-baseline gap-2 md:gap-3 mb-3 md:mb-4 border-b border-border pb-2">
              <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary self-center" aria-hidden />
              <h3 className="text-base md:text-lg font-bold uppercase tracking-wide text-foreground">
                {group.title}
              </h3>
              {group.subtitle && (
                <span className="text-xs md:text-sm text-muted-foreground">
                  — {group.subtitle}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {group.cats.map((cat) => (
                <CategoryCard key={cat.id} category={cat} locationId={location.id} />
              ))}
            </div>
          </div>
        );
      })}

      {ungrouped.length > 0 && (
        <div>
          <h3 className="text-base md:text-lg font-bold uppercase tracking-wide text-foreground mb-3 md:mb-4 border-b border-border pb-2">
            Weitere
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {ungrouped.map((cat) => (
              <CategoryCard key={cat.id} category={cat} locationId={location.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
