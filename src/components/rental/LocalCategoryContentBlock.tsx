// Sichtbarer, standort-spezifischer SEO-Block für Produktdetailseiten.
// Rendert die Inhalte aus src/data/localCategoryContent.ts – damit
// Google echte Differenzierung zwischen Krefeld-, Bonn- und Mülheim-
// Varianten sieht und sie nicht als Duplikate kanonisiert.

import { MapPin, Lightbulb, HelpCircle } from "lucide-react";
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
      aria-label={`Standortspezifischer Hinweis zu ${locName}`}
      className="mt-6 md:mt-8 border-t border-border pt-5 md:pt-6 space-y-4"
      data-local-content={`${locationId}-${categoryId}`}
    >
      {/* Hookline + Use-Case */}
      <div className="bg-surface-light rounded-lg p-4 md:p-5 border border-border">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Lightbulb className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-headline mb-1.5">
              Einsatz und Lieferung in {locName}
            </h3>
            <p className="text-xs md:text-sm text-body leading-relaxed mb-2">
              {content.hookline}
            </p>
            <p className="text-xs md:text-sm text-body leading-relaxed">
              {content.useCase}
            </p>
          </div>
        </div>
      </div>

      {/* Lieferhinweis */}
      <div className="bg-card rounded-lg p-4 md:p-5 border border-border">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <MapPin className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm md:text-base font-semibold text-headline mb-1.5">
              Lieferung und Abholung ab {locName}
            </h4>
            <p className="text-xs md:text-sm text-body leading-relaxed">
              {content.deliveryNote}
            </p>
          </div>
        </div>
      </div>

      {/* Standort-FAQs */}
      {content.faqs.length > 0 && (
        <div className="bg-card rounded-lg p-4 md:p-5 border border-border">
          <div className="flex items-start gap-3 mb-3">
            <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <HelpCircle className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-sm md:text-base font-semibold text-headline">
              Häufige Fragen rund um {locName}
            </h4>
          </div>
          <dl className="space-y-3 pl-12">
            {content.faqs.map((faq, i) => (
              <div key={i}>
                <dt className="text-xs md:text-sm font-semibold text-headline mb-1">
                  {faq.q}
                </dt>
                <dd className="text-xs md:text-sm text-body leading-relaxed">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}

export default LocalCategoryContentBlock;
