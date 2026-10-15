/** Mengeneinheiten für Angebotspositionen (Singular/Plural-korrekt). */
import { unitAbbreviation, unitLabel as pricingUnitLabel, type PricingUnit } from "@/lib/pricing/rentalPricing";

export type OfferUnit = PricingUnit;

/** Auswahlliste im Editor. "arbeitstage" bleibt für alte Angebote wählbar, wird aber nicht mehr vorbelegt. */
export const OFFER_UNITS: { value: OfferUnit; label: string; short: string }[] = [
  { value: "miettage", label: "Miettage", short: unitAbbreviation("miettage") },
  { value: "kalendertage", label: "Kalendertage", short: unitAbbreviation("kalendertage") },
  { value: "wochen", label: "Wochen", short: unitAbbreviation("wochen") },
  { value: "monate", label: "Monate", short: unitAbbreviation("monate") },
  { value: "stueck", label: "Stück", short: unitAbbreviation("stueck") },
  { value: "pauschal", label: "Pauschalpreis", short: unitAbbreviation("pauschal") },
  { value: "arbeitstage", label: "Arbeitstage (alt)", short: unitAbbreviation("arbeitstage") },
];

/** z. B. (1, "monate") -> "Monat", (3, "monate") -> "Monate" – Quelle: src/lib/pricing. */
export function unitLabel(count: number, unit: OfferUnit): string {
  return pricingUnitLabel(count, unit);
}

export { unitAbbreviation };
