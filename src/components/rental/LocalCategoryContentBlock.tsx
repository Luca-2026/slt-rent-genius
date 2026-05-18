// Sichtbarer, standort-spezifischer Block für Produktdetailseiten.
// Rendert die Inhalte aus src/data/localCategoryContent.ts – damit
// Google echte Differenzierung zwischen Krefeld-, Bonn- und Mülheim-
// Varianten sieht und sie nicht als Duplikate kanonisiert.
//
// WICHTIG: Dieser Block enthält BEWUSST keine FAQ-Sektion mehr.
// Die standortspezifischen FAQs werden in den bestehenden Produkt-
// FAQ-Block (ProductSEOContent) eingehängt, damit keine zweite
// „Häufige Fragen"-Sektion auf der Seite entsteht.

import { MapPin } from "lucide-react";
import { getLocalCategoryContent } from "@/data/localCategoryContent";
import { getLocationInfoById } from "@/data/locationData";

interface LocalCategoryContentBlockProps {
  locationId: string;
  categoryId: string;
}

export function LocalCategoryContentBlock({
  locationId,
  categoryId,
}: LocalCategoryContentBlockProps) {
  const content = getLocalCategoryContent(locationId, categoryId);
  if (!content) return null;

  const location = getLocationInfoById(locationId);
  const locName = location?.name ?? "Standort";

  return (
    <section
      aria-label={`Lieferung und Abholung ab ${locName}`}
      className="mt-6 md:mt-8 border-t border-border pt-5 md:pt-6"
      data-local-content={`${locationId}-${categoryId}`}
    >
      <div className="bg-card rounded-lg p-4 md:p-5 border border-border">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-headline mb-1.5">
              Lieferung und Abholung ab {locName}
            </h3>
            <p className="text-xs md:text-sm text-body leading-relaxed mb-2">
              {content.hookline}
            </p>
            <p className="text-xs md:text-sm text-body leading-relaxed">
              {content.standortFakten}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LocalCategoryContentBlock;
