import { MapPin, Truck, Clock, Sparkles } from "lucide-react";
import { getLocationInfoById } from "@/data/locationData";

interface StandortVerfuegbarkeitProps {
  locationId: string;
  /** Name des Zentrallagers für service-handover-Standorte */
  warehouseLocationName?: string;
  /** Bezeichnung für das Produkt, z.B. "Gerät" oder "Wohnwagen" */
  deviceLabel?: string;
}

/**
 * Dezenter Standort-Verfügbarkeits-Block für Produktdetailseiten.
 * Differenziert die Aussage je nach serviceCharacter des Standorts,
 * um Duplicate-Content zwischen Standort-Varianten zu reduzieren.
 *
 * Rendert nichts, wenn:
 * - die locationId nicht in locationData gefunden wird, oder
 * - serviceCharacter nicht gesetzt ist (Abwärtskompatibilität)
 */
export function StandortVerfuegbarkeit({
  locationId,
  warehouseLocationName = "Krefeld",
  deviceLabel = "Gerät",
}: StandortVerfuegbarkeitProps) {
  const location = getLocationInfoById(locationId);
  if (!location || !location.serviceCharacter) return null;

  const { name, serviceCharacter, deliveryRadius, futurePromise } = location;
  const cities = (deliveryRadius ?? []).slice(0, 5);

  let headline = "";
  let body = "";
  let Icon = MapPin;

  if (serviceCharacter === "full-warehouse") {
    headline = `Verfügbar am Standort ${name}`;
    body = `Dieses ${deviceLabel} steht in unserem ${name} Mietpark vor Ort zur Abholung bereit. Lieferung im Liefergebiet möglich – typischerweise innerhalb eines Werktags.`;
    Icon = MapPin;
  } else if (serviceCharacter === "service-handover") {
    headline = `Verfügbar in ${name}`;
    body = `Übergabe und Beratung erfolgen an unserem Standort ${name}. Das Gerät kommt aus unserem Zentrallager in ${warehouseLocationName}, in der Regel innerhalb von 24 Stunden – bei dringendem Bedarf häufig taggleich.`;
    Icon = Truck;
  } else if (serviceCharacter === "delivery-only") {
    headline = `Lieferung in die Region ${name}`;
    body = `Wir liefern dieses Gerät an Ihre Adresse im ${name}-Einzugsgebiet. Abholung ist an unserem nächstgelegenen Mietpark möglich.`;
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
