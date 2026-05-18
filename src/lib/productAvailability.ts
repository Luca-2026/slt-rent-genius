// Sprint 1 – Verfügbarkeits-Automatik
// ------------------------------------------------------------
// Single source of truth: Ist für ein Produkt ein rentwareCode
// am Standort hinterlegt, gilt es dort als "vor Ort verfügbar".
// Sonst wird es als "auf Anfrage – Lieferung aus Krefeld in 24 h"
// signalisiert. Beide Varianten sind crawlbar und indexierbar,
// unterscheiden sich aber sichtbar im DOM.

import type { Product } from "@/data/rentalData";
import { getLocationInfoById } from "@/data/locationData";

export type AvailabilityStatus =
  | "available-local"      // vor Ort am Standort verfügbar (rentwareCode vorhanden)
  | "available-warehouse"  // Zentrallager-Standort (Krefeld): immer vor Ort
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
  const isWarehouse = loc?.serviceCharacter === "full-warehouse";
  const hasLocalCode = !!product?.rentwareCode?.[locationId];

  // 1) Echter rentwareCode für diesen Standort vorhanden → vor Ort verfügbar
  if (hasLocalCode) {
    // Krefeld = Zentrallager, alle anderen Standorte mit Code = vor Ort
    if (isWarehouse) {
      return {
        status: "available-warehouse",
        badgeLabel: `Vor Ort in ${locName} verfügbar`,
        headline: `Verfügbar in unserem Zentrallager ${locName}`,
        body: `Dieses Gerät steht in unserem Mietpark ${locName} zur Abholung bereit. Lieferung innerhalb des Liefergebiets in der Regel taggleich oder am nächsten Werktag.`,
        schemaAvailability: "https://schema.org/InStock",
        isBookable: true,
      };
    }
    return {
      status: "available-local",
      badgeLabel: `Vor Ort in ${locName} verfügbar`,
      headline: `Vor Ort am Standort ${locName} verfügbar`,
      body: `Dieses Gerät führen wir am Standort ${locName} als Stamm-Sortiment. Abholung vor Ort, Lieferung im Einzugsgebiet in der Regel innerhalb eines Werktags.`,
      schemaAvailability: "https://schema.org/InStock",
      isBookable: true,
    };
  }

  // 2) Standort ist Zentrallager, aber Code fehlt → trotzdem "vor Ort"
  //    (Krefeld hat das komplette Sortiment, auch ohne expliziten Eintrag)
  if (isWarehouse) {
    return {
      status: "available-warehouse",
      badgeLabel: `Verfügbar in ${locName}`,
      headline: `Verfügbar in unserem Zentrallager ${locName}`,
      body: `Dieses Gerät ist Teil unseres ${locName}er Mietsortiments. Abholung oder Lieferung im Einzugsgebiet meist innerhalb eines Werktags.`,
      schemaAvailability: "https://schema.org/InStock",
      isBookable: true,
    };
  }

  // 3) Alle anderen Fälle (Bonn/Mülheim ohne lokalen Code) → auf Anfrage
  const charSuffix =
    loc?.serviceCharacter === "service-handover"
      ? `Übergabe und Beratung erfolgen direkt am Standort ${locName}.`
      : `Beratung durch unser ${locName}-Team.`;
  return {
    status: "on-request",
    badgeLabel: `Auf Anfrage in ${locName}`,
    headline: `Auf Anfrage in ${locName} – Lieferung aus Krefeld`,
    body: `Dieses Gerät disponieren wir auf Anfrage aus unserem Zentrallager in Krefeld – in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig taggleich. ${charSuffix}`,
    schemaAvailability: "https://schema.org/PreOrder",
    deliveryLeadTime: "PT24H",
    isBookable: false,
  };
}
