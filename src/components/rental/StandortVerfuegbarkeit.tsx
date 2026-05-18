import { MapPin, Truck, Clock, Sparkles, CheckCircle2, MailQuestion } from "lucide-react";
import { getLocationInfoById } from "@/data/locationData";
import { getProductAvailability } from "@/lib/productAvailability";
import type { Product } from "@/data/rentalData";

interface StandortVerfuegbarkeitProps {
  locationId: string;
  /** Wenn gesetzt, wird die produktspezifische Verfügbarkeit (rentwareCode) ausgewertet */
  product?: Pick<Product, "rentwareCode">;
  /** Name des Zentrallagers für service-handover-Standorte */
  warehouseLocationName?: string;
  /** Bezeichnung für das Produkt, z.B. "Gerät" oder "Wohnwagen" */
  deviceLabel?: string;
}

/**
 * Produktspezifischer Verfügbarkeits-Block für Produktdetailseiten.
 *
 * Wenn `product` übergeben wird, differenziert die Darstellung
 * automatisch zwischen "vor Ort verfügbar" (rentwareCode am Standort
 * vorhanden) und "auf Anfrage – Lieferung aus Krefeld in 24 h".
 * Beide Varianten sind crawl- und indexierbar – sie unterscheiden sich
 * aber sichtbar im DOM, damit Google echte Differenzierung sieht und
 * Standort-Varianten nicht mehr als Duplikate consolidiert.
 *
 * Fallback (ohne `product`): rein standortbasierte Darstellung wie bisher.
 */
export function StandortVerfuegbarkeit({
  locationId,
  product,
  warehouseLocationName = "Krefeld",
  deviceLabel = "Gerät",
}: StandortVerfuegbarkeitProps) {
  const location = getLocationInfoById(locationId);
  if (!location) return null;

  const { name, deliveryRadius, futurePromise, serviceCharacter } = location;
  const cities = (deliveryRadius ?? []).slice(0, 5);

  // Produktspezifische Variante (Sprint 1)
  if (product) {
    const avail = getProductAvailability(product, locationId);
    const isLocal = avail.status === "available-local" || avail.status === "available-warehouse";
    const Icon = isLocal ? CheckCircle2 : MailQuestion;
    const accentClass = isLocal
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900"
      : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900";

    return (
      <section
        aria-label={`Verfügbarkeit am Standort ${name}`}
        className="mt-6 md:mt-8 border-t border-border pt-5 md:pt-6"
      >
        <div className="bg-surface-light rounded-lg p-4 md:p-5 border border-border">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h3 className="text-sm md:text-base font-semibold text-headline">
                  {avail.headline}
                </h3>
                <span
                  className={`inline-flex items-center text-[11px] md:text-xs px-2 py-0.5 rounded-full border font-medium ${accentClass}`}
                >
                  {avail.badgeLabel}
                </span>
              </div>
              <p className="text-xs md:text-sm text-body leading-relaxed">{avail.body}</p>

              {cities.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] md:text-xs text-muted-foreground mr-1">
                    <Clock className="h-3 w-3" />
                    Liefergebiet ab {name}:
                  </span>
                  {cities.map((city) => (
                    <span
                      key={city}
                      className="inline-flex items-center text-[11px] md:text-xs px-2 py-0.5 rounded-full bg-background border border-border text-body"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              )}

              {avail.status === "on-request" && serviceCharacter === "service-handover" && futurePromise && (
                <div className="mt-3 flex items-start gap-2 text-xs md:text-sm text-body bg-accent/10 border border-accent/30 rounded-md p-3">
                  <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <p>
                    <span className="font-semibold text-headline">Ausblick: </span>
                    {futurePromise}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback: Standort-basiert (Abwärtskompatibilität ohne `product`)
  if (!serviceCharacter) return null;

  let headline = "";
  let body = "";
  let Icon = MapPin;

  if (serviceCharacter === "full-warehouse") {
    headline = `Verfügbar am Standort ${name}`;
    body = `Dieses ${deviceLabel} steht in unserem ${name} Mietpark vor Ort zur Abholung bereit. Lieferung im Liefergebiet möglich – typischerweise innerhalb eines Werktags.`;
    Icon = MapPin;
  } else if (serviceCharacter === "service-handover") {
    headline = `Verfügbar in ${name}`;
    body = `Übergabe und Beratung erfolgen an unserem Standort ${name}. Das ${deviceLabel} kommt aus unserem Zentrallager in ${warehouseLocationName}, in der Regel innerhalb von 24 Stunden – bei dringendem Bedarf häufig taggleich.`;
    Icon = Truck;
  } else if (serviceCharacter === "delivery-only") {
    headline = `Lieferung in die Region ${name}`;
    body = `Wir liefern dieses ${deviceLabel} an Ihre Adresse im ${name}-Einzugsgebiet. Abholung ist an unserem nächstgelegenen Mietpark möglich.`;
    Icon = Truck;
  }

  return (
    <section
      aria-label={`Verfügbarkeit am Standort ${name}`}
      className="mt-6 md:mt-8 border-t border-border pt-5 md:pt-6"
    >
      <div className="bg-surface-light rounded-lg p-4 md:p-5 border border-border">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-headline mb-1.5">
              {headline}
            </h3>
            <p className="text-xs md:text-sm text-body leading-relaxed">{body}</p>

            {cities.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] md:text-xs text-muted-foreground mr-1">
                  <Clock className="h-3 w-3" />
                  Liefergebiet:
                </span>
                {cities.map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center text-[11px] md:text-xs px-2 py-0.5 rounded-full bg-background border border-border text-body"
                  >
                    {city}
                  </span>
                ))}
              </div>
            )}

            {serviceCharacter === "service-handover" && futurePromise && (
              <div className="mt-3 flex items-start gap-2 text-xs md:text-sm text-body bg-accent/10 border border-accent/30 rounded-md p-3">
                <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-headline">Ausblick: </span>
                  {futurePromise}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StandortVerfuegbarkeit;
