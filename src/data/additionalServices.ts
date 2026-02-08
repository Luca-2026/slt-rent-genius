// Additional services & deposit options for B2B rentals

export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  /** If null, always suggest. Otherwise only suggest for these category slugs. */
  applicableCategories: string[] | null;
  /** Percentage of order value (net, excl. deposit & delivery). null = no extra charge. */
  pricePercent: number | null;
}

export const ADDITIONAL_SERVICES: AdditionalService[] = [
  {
    id: "verladehilfe",
    name: "Baumaschine – Verladehilfe (Be- & Entladen)",
    description: "Unterstützung beim Verladen und Verzurren der Baumaschinen.",
    applicableCategories: ["erdbewegung", "aggregate", "arbeitsbuehnen", "verdichtung"],
    pricePercent: null,
  },
  {
    id: "mbv-1000",
    name: "Reduzierung Maschinenbruchversicherung auf 1000€ SB",
    description:
      "Reduzierung der Maschinenbruchversicherung auf eine Selbstbeteiligung in Höhe von 1000€ je Schadenfall.",
    applicableCategories: ["erdbewegung", "aggregate", "arbeitsbuehnen", "werkzeuge"],
    pricePercent: null, // included / no surcharge
  },
  {
    id: "mbv-500",
    name: "Reduzierung Maschinenbruchversicherung auf 500€ SB",
    description:
      "Reduzierung der Maschinenbruchversicherung auf eine Selbstbeteiligung in Höhe von 500€ je Schadenfall.",
    applicableCategories: ["erdbewegung", "aggregate", "arbeitsbuehnen", "werkzeuge"],
    pricePercent: 5,
  },
  {
    id: "mbv-0",
    name: "Reduzierung Maschinenbruchversicherung auf 0€ SB",
    description:
      "Haftungsfreistellung. Reduzierung der Maschinenbruchversicherung auf eine Selbstbeteiligung in Höhe von 0€ je Schadenfall.",
    applicableCategories: ["erdbewegung", "aggregate", "arbeitsbuehnen", "werkzeuge"],
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
export const MBV_CATEGORIES = ["erdbewegung", "aggregate", "arbeitsbuehnen", "werkzeuge"];

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
 */
export function calculateServicesSurcharge(
  selectedServiceIds: Set<string>,
  baseNetAmount: number
): { total: number; breakdown: { service: AdditionalService; amount: number }[] } {
  const breakdown: { service: AdditionalService; amount: number }[] = [];
  let total = 0;

  for (const service of ADDITIONAL_SERVICES) {
    if (selectedServiceIds.has(service.id) && service.pricePercent !== null) {
      const amount = Math.round(baseNetAmount * (service.pricePercent / 100) * 100) / 100;
      breakdown.push({ service, amount });
      total += amount;
    }
  }

  return { total: Math.round(total * 100) / 100, breakdown };
}
