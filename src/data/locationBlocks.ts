// Etappe 4 – Zentrale Standort-Textbausteine und Verfügbarkeitslogik.
// ------------------------------------------------------------------
// Genau EIN Textbaustein je Standort und genau EIN Verfügbarkeitsstatus
// je Produkt/Standort. Damit können auf Produktseiten keine
// widersprüchlichen Absätze mehr entstehen (z. B. Werkstatt-Aussage in
// Bonn oder gleichzeitig „vor Ort" und „auf Anfrage").
//
// Quellen: src/data/locationData.ts (Adresse, Öffnungszeiten, Liefergebiet)
// und die gepflegten Rentware-Codes je Produkt. Nichts erfunden.

import { locationData, type LocationInfo } from "@/data/locationData";
import type { Product } from "@/data/rentalData";

export type LocationAvailabilityStatus =
  | "sofortVorOrt"
  | "selbstabholung24_7"
  | "aufAnfrageDispoKrefeld";

const LOC_BY_ID: Record<string, LocationInfo> = Object.fromEntries(
  locationData.map((l) => [l.id, l]),
);

export const LOCATION_DISPLAY_NAME: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

/** Kategorien, die grundsätzlich am Standort abgeholt werden (keine Lieferung). */
const PICKUP_ONLY_CATEGORIES = new Set([
  "anhaenger",
  "nutzfahrzeuge",
  "wohnwagen-camping",
]);

/** Kategorien mit Keybox-Selbstabholung rund um die Uhr. */
const SELF_PICKUP_CATEGORIES = new Set(["anhaenger"]);

function hoursLine(loc: LocationInfo | undefined): string {
  if (!loc) return "";
  return loc.hours
    .filter((h) => !/geschlossen/i.test(h.time))
    .map((h) => `${h.day} ${h.time.replace(/\*/g, "")}`)
    .join(", ");
}

function deliveryArea(loc: LocationInfo | undefined, max = 6): string {
  const cities = loc?.deliveryRadius || [];
  return cities.slice(0, max).join(", ");
}

/**
 * Genau ein Standortabsatz je Produktseite.
 * `subject` ist z. B. „Minibagger 2,5t mieten".
 */
export function locationParagraph(
  locationId: string,
  subject: string,
  opts: { categoryId?: string } = {},
): string {
  const loc = LOC_BY_ID[locationId];
  if (!loc) return "";
  const locName = LOCATION_DISPLAY_NAME[locationId] || loc.name;
  const hours = hoursLine(loc);
  const area = deliveryArea(loc);
  const pickupOnly = opts.categoryId ? PICKUP_ONLY_CATEGORIES.has(opts.categoryId) : false;

  // Abholkategorien: keine Lieferaussage, stattdessen Überführung auf Anfrage.
  const logistics = pickupOnly
    ? "Abholung am Standort, Überführung auf Anfrage."
    : area
      ? `Liefergebiet ab ${locName}: ${area}.`
      : "";

  if (locationId === "bonn") {
    // Bewusst ohne Werkstatt- und ohne persönliche Übergabe-Aussage.
    const isTrailer = opts.categoryId === "anhaenger";
    return [
      `Standort Bonn: ${subject} holst du an der ${loc.address}, ${loc.city} ab.`,
      isTrailer
        ? "Die Abholung läuft rund um die Uhr in Selbstabholung – das Zahlenschloss öffnest du mit dem E-Mail-Code, die Einweisung bekommst du digital (Schritt-für-Schritt-Anleitung auf unserer Hilfe-Seite)."
        : "Anhänger sind in Bonn rund um die Uhr per E-Mail-Code selbst abholbar, übrige Geräte disponieren wir auf Anfrage aus Krefeld.",
      logistics,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (locationId === "muelheim") {
    return [
      `Standort Mülheim an der Ruhr: ${subject} übergeben wir an unserem Service-Standort in der ${loc.address}, ${loc.city} – mit Beratung und Einweisung vor Ort.`,
      "Die Disposition läuft aus dem Zentrallager Krefeld, in der Regel innerhalb von 24 Stunden.",
      logistics,
    ]
      .filter(Boolean)
      .join(" ");
  }

  // Krefeld (Hauptsitz)
  return [
    `Standort Krefeld (Hauptsitz): ${subject} liegt in der ${loc.address}, ${loc.city} bereit – Übergabe vor Ort mit persönlicher Einweisung, eigene Werkstatt im Haus.`,
    hours ? `Öffnungszeiten: ${hours}.` : "",
    logistics,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Genau ein Verfügbarkeitsstatus je Produkt und Standort.
 * Basis sind die gepflegten Rentware-Codes bzw. das Flag `onRequest`.
 */
export function resolveAvailabilityStatus(
  product: Pick<Product, "rentwareCode" | "onRequest"> | undefined,
  locationId: string,
  opts: { categoryId?: string } = {},
): LocationAvailabilityStatus {
  if (product?.onRequest) return "aufAnfrageDispoKrefeld";

  const codes = product?.rentwareCode;
  const hasLocalCode = !!codes?.[locationId];
  const hasAnyCode = !!codes && Object.keys(codes).length > 0;
  const isKrefeld = locationId === "krefeld";

  const vorOrt = hasLocalCode || (isKrefeld && !hasAnyCode);
  if (!vorOrt) return "aufAnfrageDispoKrefeld";

  const selfPickup =
    opts.categoryId && SELF_PICKUP_CATEGORIES.has(opts.categoryId) && locationId !== "muelheim";
  return selfPickup ? "selbstabholung24_7" : "sofortVorOrt";
}

/** Ein Verfügbarkeitsabsatz – passend zum Status, ohne Widerspruch zum Standortabsatz. */
export function availabilityParagraph(
  status: LocationAvailabilityStatus,
  locationId: string,
): string {
  const locName = LOCATION_DISPLAY_NAME[locationId] || locationId;
  switch (status) {
    case "selbstabholung24_7":
      return `Verfügbarkeit in ${locName}: Selbstabholung rund um die Uhr. Den Code für das Zahlenschloss bekommst du rechtzeitig vor Mietbeginn per E-Mail, die Rückgabe funktioniert genauso.`;
    case "sofortVorOrt":
      return `Verfügbarkeit in ${locName}: sofort vor Ort verfügbar und direkt online buchbar.`;
    case "aufAnfrageDispoKrefeld":
    default:
      return `Verfügbarkeit in ${locName}: auf Anfrage – wir disponieren das Gerät aus Krefeld, in der Regel innerhalb von 24 Stunden.`;
  }
}

/** Hinweistext direkt am Buchungsbereich. */
export function bookingHint(status: LocationAvailabilityStatus): string {
  switch (status) {
    case "selbstabholung24_7":
      return "Direkt online buchen – Abholung und Rückgabe rund um die Uhr per E-Mail-Code.";
    case "sofortVorOrt":
      return "Direkt online buchen – Zeitraum wählen und verbindlich reservieren.";
    case "aufAnfrageDispoKrefeld":
    default:
      return "Auf Anfrage buchbar – schick uns deinen Wunschzeitraum, wir bestätigen die Verfügbarkeit.";
  }
}
