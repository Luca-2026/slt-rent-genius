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
  /** Group key for mutual exclusion (only one from same group can be selected) */
  exclusionGroup?: string;
  /** If true, this service is automatically included for matching categories (customer cannot deselect) */
  mandatory?: boolean;
  /** If true, this is an upgrade/add-on to a mandatory base service */
  isUpgrade?: boolean;
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
  // ── Basis-MBV (immer enthalten, SB 1.500€) ──
  {
    id: "mbv-selbstfahrend",
    name: "Maschinenbruchversicherung – Selbstfahrende Maschinen (SB 1.500 €)",
    description:
      "MBV für selbstfahrende Maschinen (Bagger, Arbeitsbühnen, Radlader, Dumper) mit einer Selbstbeteiligung in Höhe von 1.500 € je Schadenfall.",
    applicableCategories: ["erdbewegung", "arbeitsbuehnen"],
    pricePercent: 12,
    mandatory: true,
  },
  {
    id: "mbv-stationaer",
    name: "Maschinenbruchversicherung – Stationäre Maschinen (SB 1.500 €)",
    description:
      "MBV für stationäre Maschinen (Stromaggregate, Werkzeuge, Rüttelplatten etc., außer Anhänger) mit einer Selbstbeteiligung in Höhe von 1.500 € je Schadenfall.",
    applicableCategories: ["aggregate", "verdichtung"],
    pricePercent: 7,
    mandatory: true,
  },
  // ── Reduzierungen der SB (on top, gegenseitig ausschließend) ──
  {
    id: "mbv-1000",
    name: "Reduzierung MBV auf 1.000 € SB",
    description:
      "Reduzierung der Selbstbeteiligung der Maschinenbruchversicherung auf 1.000 € je Schadenfall (zusätzlich zur Basis-MBV).",
    applicableCategories: ["erdbewegung", "aggregate", "arbeitsbuehnen", "werkzeuge", "verdichtung"],
    pricePercent: 3,
    exclusionGroup: "mbv-reduktion",
    isUpgrade: true,
  },
  {
    id: "mbv-500",
    name: "Reduzierung MBV auf 500 € SB",
    description:
      "Reduzierung der Selbstbeteiligung der Maschinenbruchversicherung auf 500 € je Schadenfall (zusätzlich zur Basis-MBV).",
    applicableCategories: ["erdbewegung", "aggregate", "arbeitsbuehnen", "werkzeuge", "verdichtung"],
    pricePercent: 5,
    exclusionGroup: "mbv-reduktion",
    isUpgrade: true,
  },
  {
    id: "mbv-0",
    name: "Reduzierung MBV auf 0 € SB (Haftungsfreistellung)",
    description:
      "Haftungsfreistellung. Reduzierung der Selbstbeteiligung auf 0 € je Schadenfall (zusätzlich zur Basis-MBV).",
    applicableCategories: ["erdbewegung", "aggregate", "arbeitsbuehnen", "werkzeuge", "verdichtung"],
    pricePercent: 10,
    exclusionGroup: "mbv-reduktion",
    isUpgrade: true,
  },
  // ── Elektronikversicherung ──
  {
    id: "elektronikversicherung",
    name: "Elektronikversicherung (SB 300 €)",
    description:
      "Versicherung für Mietartikel mit Stecker (Akkuwerkzeuge, Veranstaltungstechnik etc.). Selbstbeteiligung in Höhe von 300 € je Schadenfall.",
    applicableCategories: ["werkzeuge"],
    pricePercent: 7,
    mandatory: true,
  },
  // ── Anhänger-Versicherungen ──
  {
    id: "vollkasko-500",
    name: "Vollkaskoversicherung (SB 500 €) (für Anhänger)",
    description:
      "Erweiterung der Haftpflichtversicherung auf eine Vollkaskoversicherung mit einer Selbstbeteiligung in Höhe von 500 € je Schadenfall. Gilt nur in Deutschland!",
    applicableCategories: ["anhaenger"],
    pricePercent: 30,
    exclusionGroup: "anhaenger-kasko",
  },
  {
    id: "vollkasko-300",
    name: "Vollkaskoversicherung (SB 300 €) (für Anhänger)",
    description:
      "Erweiterung der Haftpflichtversicherung auf eine Vollkaskoversicherung mit einer Selbstbeteiligung in Höhe von 300 € je Schadenfall. Gilt nur in Deutschland! 35% des Netto-Mietpreises.",
    applicableCategories: ["anhaenger"],
    pricePercent: 35,
    exclusionGroup: "anhaenger-kasko",
  },
  {
    id: "auslandsfahrt",
    name: "Auslandsfahrt (europäisches Ausland)",
    description:
      "Für die Fahrt in das europäische Ausland. 15% des Netto-Mietpreises.",
    applicableCategories: ["anhaenger"],
    pricePercent: 15,
  },
  // ── Kostenfreie Stornierung ──
  {
    id: "kostenfreie-stornierung",
    name: "Kostenfreie Stornierung",
    description: "Mit dieser Option ist die Stornierung bis 72h vor Mietbeginn kostenfrei.",
    applicableCategories: null, // always available
    pricePercent: 7,
  },
];

/** Standard deposit values in EUR */
export const DEPOSIT_OPTIONS = [15, 50, 100, 150, 300, 750, 1000, 1500, 2000];

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
 * Returns mandatory services for the given category slugs.
 * These should be auto-selected and shown as "included".
 */
export function getMandatoryServiceIds(categorySlugs: string[]): Set<string> {
  const ids = new Set<string>();
  for (const service of ADDITIONAL_SERVICES) {
    if (!service.mandatory) continue;
    if (service.applicableCategories === null) {
      ids.add(service.id);
    } else {
      for (const slug of categorySlugs) {
        if (service.applicableCategories.includes(slug)) {
          ids.add(service.id);
          break;
        }
      }
    }
  }
  return ids;
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
