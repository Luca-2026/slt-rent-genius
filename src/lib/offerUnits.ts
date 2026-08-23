/** Mengeneinheiten für Angebotspositionen (Singular/Plural-korrekt). */
export type OfferUnit = "stueck" | "arbeitstage" | "kalendertage" | "wochen" | "monate";

const LABELS: Record<OfferUnit, { one: string; many: string }> = {
  stueck: { one: "Stück", many: "Stück" },
  arbeitstage: { one: "Arbeitstag", many: "Arbeitstage" },
  kalendertage: { one: "Kalendertag", many: "Kalendertage" },
  wochen: { one: "Woche", many: "Wochen" },
  monate: { one: "Monat", many: "Monate" },
};

export const OFFER_UNITS: { value: OfferUnit; label: string }[] = [
  { value: "stueck", label: "Stück" },
  { value: "arbeitstage", label: "Arbeitstage" },
  { value: "kalendertage", label: "Kalendertage" },
  { value: "wochen", label: "Wochen" },
  { value: "monate", label: "Monate" },
];

/** z. B. (1, "monate") -> "Monat", (3, "monate") -> "Monate" */
export function unitLabel(count: number, unit: OfferUnit): string {
  const entry = LABELS[unit] ?? LABELS.stueck;
  return Math.abs(count) === 1 ? entry.one : entry.many;
}
