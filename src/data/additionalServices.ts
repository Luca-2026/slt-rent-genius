// Additional services & deposit options for B2B rentals

export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  /** If null, always suggest. Otherwise only suggest for these category slugs. */
  applicableCategories: string[] | null;
  /** Percentage of order value (net, excl. deposit & delivery). null = no extra charge / custom price. */
  pricePercent: number | null;
  /** Whether this service supports a custom (manual) price input instead of percentage */
  customPriceInput?: boolean;
}

export const ADDITIONAL_SERVICES: AdditionalService[] = [
  {
    id: "verladehilfe",
    name: "Baumaschine – Verladehilfe (Be- & Entladen)",
    description: "Unterstützung beim Verladen und Verzurren der Baumaschinen.",
    applicableCategories: ["erdbewegung", "aggregate", "arbeitsbuehnen", "verdichtung"],
    pricePercent: null,
    customPriceInput: true,
  },
  {
    id: "mbv-selbstfahrend",
    name: "Maschinenbruchversicherung – Selbstfahrende Maschinen",
    description:
      "MBV für selbstfahrende Maschinen (Bagger, Arbeitsbühnen, Radlader, Dumper). 12% des Netto-Mietpreises der Maschinen (ohne Lieferkosten/Zubehör).",
    applicableCategories: ["erdbewegung", "arbeitsbuehnen"],
    pricePercent: 12,
  },
  {
    id: "mbv-stationaer",
    name: "Maschinenbruchversicherung – Stationäre Maschinen",
    description:
      "MBV für stationäre Maschinen (Stromaggregate, Werkzeuge, Rüttelplatten etc., außer Anhänger). 7% des Netto-Mietpreises der Maschinen (ohne Zubehör/Transport).",
    applicableCategories: ["aggregate", "werkzeuge", "verdichtung"],
    pricePercent: 7,
  },
  {
    id: "mbv-1000",
    name: "Reduzierung MBV auf 1.000 € SB",
    description:
      "Reduzierung der Maschinenbruchversicherung auf eine Selbstbeteiligung in Höhe von 1.000 € je Schadenfall.",
    applicableCategories: ["erdbewegung", "aggregate", "arbeitsbuehnen", "werkzeuge", "verdichtung"],
    pricePercent: null,
  },
  {
    id: "mbv-500",
    name: "Reduzierung MBV auf 500 € SB",
    description:
      "Reduzierung der Maschinenbruchversicherung auf eine Selbstbeteiligung in Höhe von 500 € je Schadenfall.",
    applicableCategories: ["erdbewegung", "aggregate", "arbeitsbuehnen", "werkzeuge", "verdichtung"],
    pricePercent: 5,
  },
  {
    id: "mbv-0",
    name: "Reduzierung MBV auf 0 € SB (Haftungsfreistellung)",
    description:
      "Haftungsfreistellung. Reduzierung der Maschinenbruchversicherung auf eine Selbstbeteiligung in Höhe von 0 € je Schadenfall.",
    applicableCategories: ["erdbewegung", "aggregate", "arbeitsbuehnen", "werkzeuge", "verdichtung"],
    pricePercent: 10,
  },
  {
    id: "kostenfreie-stornierung",
    name: "Kostenfreie Stornierung",
    description: "Mit dieser Option ist die Stornierung bis 72h vor Mietbeginn kostenfrei.",
    applicableCategories: null, // always available
    pricePercent: 7,
  },
];

/** Standard deposit values in EUR */
export const DEPOSIT_OPTIONS = [50, 100, 150, 750, 1000];

/** Categories that should trigger MBV / Verladehilfe suggestions */
export const MBV_CATEGORIES = ["erdbewegung", "aggregate", "arbeitsbuehnen", "werkzeuge", "verdichtung"];

/**
 * Returns the additional services relevant for a given category slug.
 * If categorySlug is null/undefined, returns only the always-available ones.
 */
export function getServicesForCategory(categorySlug?: string | null): AdditionalService[] {
  return ADDITIONAL_SERVICES.filter(
    (s) => s.applicableCategories === null || (categorySlug && s.applicableCategories.includes(categorySlug))
  );
}

/**
 * Calculate the surcharge for selected additional services.
 * Base = net item total (excluding delivery costs and deposit).
 * customPrices: map of service id -> manual price for customPriceInput services.
 */
export function calculateServicesSurcharge(
  selectedServiceIds: Set<string>,
  baseNetAmount: number,
  customPrices?: Record<string, number>
): { total: number; breakdown: { service: AdditionalService; amount: number }[] } {
  const breakdown: { service: AdditionalService; amount: number }[] = [];
  let total = 0;

  for (const service of ADDITIONAL_SERVICES) {
    if (!selectedServiceIds.has(service.id)) continue;

    if (service.customPriceInput) {
      const customAmount = customPrices?.[service.id] || 0;
      if (customAmount > 0) {
        breakdown.push({ service, amount: customAmount });
        total += customAmount;
      }
    } else if (service.pricePercent !== null) {
      const amount = Math.round(baseNetAmount * (service.pricePercent / 100) * 100) / 100;
      breakdown.push({ service, amount });
      total += amount;
    }
  }

  return { total: Math.round(total * 100) / 100, breakdown };
}
