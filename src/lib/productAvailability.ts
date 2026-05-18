// Sprint 1 – Verfügbarkeits-Automatik
// ------------------------------------------------------------
// Single source of truth: Ist für ein Produkt ein rentwareCode
// am Standort hinterlegt, gilt es dort als "vor Ort verfügbar".
// Sonst wird es als "auf Anfrage – Lieferung aus Krefeld in 24 h"
// signalisiert. Beide Varianten sind crawlbar und indexierbar,
// unterscheiden sich aber sichtbar im DOM.
//
// Terminologie (verbindlich, siehe Memory):
// - Krefeld = Hauptlager / Hauptsitz
// - Bonn    = Filiale Bonn (eigener Mietpark, kein "Zentrallager"!)
// - Mülheim = Service-Standort Mülheim (Übergabe vor Ort, Geräte aus Krefeld)

import type { Product } from "@/data/rentalData";
import { getLocationInfoById } from "@/data/locationData";

export type AvailabilityStatus =
  | "available-local"      // vor Ort am Standort verfügbar (rentwareCode vorhanden)
  | "available-warehouse"  // Hauptlager Krefeld: immer vor Ort
  | "on-request";          // Lieferung aus Krefeld auf Anfrage

export interface ProductAvailability {
  status: AvailabilityStatus;
  /** Kurz-Badge-Text z.B. „Vor Ort in Bonn verfügbar" */
  badgeLabel: string;
  /** Überschrift für den Verfügbarkeits-Block */
  headline: string;
  /** Erklärsatz (1–2 Sätze) */
  body: string;
  /** Schema.org Offer availability URL */
  schemaAvailability: string;
  /** ISO-8601 Lieferzeit, z.B. PT24H */
  deliveryLeadTime?: string;
  /** Kann der Buchungs-Dialog direkt geöffnet werden? */
  isBookable: boolean;
}

/**
 * Ermittelt die echte Verfügbarkeit eines Produkts an einem Standort.
 * Robust gegen fehlende Standorte/Produkte – liefert in dem Fall einen
 * neutralen "on-request" Default.
 */
export function getProductAvailability(
  product: Pick<Product, "rentwareCode"> | undefined,
  locationId: string,
): ProductAvailability {
  const loc = getLocationInfoById(locationId);
  const locName = loc?.name || "Standort";
  const isHauptlager = locId(loc?.id) === "krefeld";
  const isFiliale = loc?.serviceCharacter === "full-warehouse" && !isHauptlager;
  const isServiceStandort = loc?.serviceCharacter === "service-handover";
  const hasLocalCode = !!product?.rentwareCode?.[locationId];

  // 1) Krefeld = Hauptlager – immer vor Ort
  if (isHauptlager) {
    return {
      status: "available-warehouse",
      badgeLabel: `Verfügbar in ${locName}`,
      headline: `Verfügbar in unserem Hauptlager ${locName}`,
      body: `Dieses Gerät ist Teil unseres Krefelder Mietsortiments. Abholung am Hauptsitz oder Lieferung im Einzugsgebiet in der Regel innerhalb eines Werktags.`,
      schemaAvailability: "https://schema.org/InStock",
      isBookable: true,
    };
  }

  // 2) Filiale (z. B. Bonn) mit eigenem Code → vor Ort
  if (hasLocalCode && isFiliale) {
    return {
      status: "available-local",
      badgeLabel: `Vor Ort in ${locName} verfügbar`,
      headline: `Vor Ort an unserer Filiale ${locName} verfügbar`,
      body: `Dieses Gerät führen wir an unserer Filiale ${locName} als Stamm-Sortiment. Abholung vor Ort, Lieferung im Einzugsgebiet in der Regel innerhalb eines Werktags.`,
      schemaAvailability: "https://schema.org/InStock",
      isBookable: true,
    };
  }

  // 3) Service-Standort (Mülheim) mit lokalem Code → vor Ort übergeben
  if (hasLocalCode && isServiceStandort) {
    return {
      status: "available-local",
      badgeLabel: `Vor Ort in ${locName} verfügbar`,
      headline: `Vor Ort an unserem Service-Standort ${locName} verfügbar`,
      body: `Dieses Gerät steht an unserem Service-Standort ${locName} zur Übergabe bereit. Beratung und Einweisung vor Ort, Rückgabe ebenfalls in ${locName}.`,
      schemaAvailability: "https://schema.org/InStock",
      isBookable: true,
    };
  }

  // 4) Restfall: kein lokaler Code → Disposition aus Krefeld
  const charSuffix = isServiceStandort
    ? `Übergabe und Beratung erfolgen direkt an unserem Service-Standort ${locName}.`
    : `Beratung durch unser ${locName}-Team.`;
  return {
    status: "on-request",
    badgeLabel: `Auf Anfrage in ${locName}`,
    headline: `Auf Anfrage in ${locName} – Lieferung aus dem Hauptlager Krefeld`,
    body: `Dieses Gerät disponieren wir auf Anfrage aus unserem Hauptlager in Krefeld – in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig taggleich. ${charSuffix}`,
    schemaAvailability: "https://schema.org/PreOrder",
    deliveryLeadTime: "PT24H",
    isBookable: false,
  };
}

function locId(id: string | undefined): string {
  return (id || "").toLowerCase();
}
