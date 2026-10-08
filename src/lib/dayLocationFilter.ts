import { normalizeLocation } from "@/lib/inventoryAvailability";

export type DayLocationFilter = "all" | "krefeld" | "bonn" | "muelheim";

export const DAY_LOCATION_OPTIONS: { value: DayLocationFilter; label: string }[] = [
  { value: "all", label: "Alle Standorte" },
  { value: "krefeld", label: "Krefeld" },
  { value: "bonn", label: "Bonn" },
  { value: "muelheim", label: "Mülheim an der Ruhr" },
];

/** Voreinstellung: zugeteilter Standort des Mitarbeiters, sonst alle Standorte. */
export function defaultDayLocation(staffLocation: string | null | undefined): DayLocationFilter {
  const key = normalizeLocation(staffLocation);
  return key === "krefeld" || key === "bonn" || key === "muelheim" ? key : "all";
}

/** Filtert Einträge nach Standort (Schreibweisen wie „Mülheim an der Ruhr" werden erkannt). */
export function filterByDayLocation<T extends { location?: string | null }>(rows: T[], filter: DayLocationFilter): T[] {
  if (filter === "all") return rows;
  return rows.filter((r) => normalizeLocation(r.location) === filter);
}
