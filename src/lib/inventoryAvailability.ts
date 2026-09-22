/**
 * Bestandsprüfung für den Angebotsprozess.
 *
 * Quelle der Wahrheit ist die DB-Funktion `check_inventory_availability`:
 * sie liest die im CMS gepflegte Menge je Standort (Fallback: gezählte
 * Einzelartikel) und zieht alle Belegungen im Zeitraum ab (Angebote,
 * Anfragen in Bearbeitung, B2B-Reservierungen).
 *
 * Die Bewertung (Hinweis/Fehler) ist bewusst als reine Funktion gehalten,
 * damit sie unit-testbar ist.
 */
import { supabase } from "@/integrations/supabase/client";

export type StockSource = "cms" | "instances" | "none";

export interface InventoryConflict {
  id: string;
  ref: string;
  label: string | null;
  start: string | null;
  end: string | null;
  quantity: number;
}

export interface InventoryResult {
  /** Gepflegter Bestand am Standort – null, wenn nichts gepflegt ist. */
  stock: number | null;
  stockSource: StockSource;
  /** Im Zeitraum bereits verplante Stückzahl. */
  booked: number;
  conflicts: InventoryConflict[];
}

export type IssueSeverity = "over" | "unknown";

export interface InventoryIssue {
  severity: IssueSeverity;
  productName: string;
  needed: number;
  available: number | null;
  stock: number | null;
  booked: number;
  message: string;
  conflicts: InventoryConflict[];
}

export const LOCATION_LABELS: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

/** "Bonn" / "Mülheim an der Ruhr" → Schlüssel wie in der Datenbank. */
export function normalizeLocation(raw: string | null | undefined): string | null {
  const value = (raw ?? "").trim().toLowerCase();
  if (!value) return null;
  if (value.includes("bonn")) return "bonn";
  if (value.includes("lheim") || value.includes("mulheim")) return "muelheim";
  if (value.includes("krefeld")) return "krefeld";
  return value;
}

export function locationLabel(raw: string | null | undefined): string {
  const key = normalizeLocation(raw);
  return (key && LOCATION_LABELS[key]) || (raw ?? "Standort");
}

/** Noch verfügbare Stückzahl – null, wenn kein Bestand gepflegt ist. */
export function availableCount(result: InventoryResult): number | null {
  if (result.stock === null) return null;
  return result.stock - result.booked;
}

/**
 * Bewertet eine Angebotsposition. Gibt null zurück, wenn genug Bestand frei ist.
 * Ohne gepflegten Bestand entsteht bewusst ein Hinweis (severity "unknown"),
 * damit nie unbemerkt gegen einen ungepflegten Artikel angeboten wird.
 */
export function evaluateLine(
  productName: string,
  needed: number,
  location: string | null | undefined,
  result: InventoryResult,
): InventoryIssue | null {
  const loc = locationLabel(location);
  const base = {
    productName,
    needed,
    stock: result.stock,
    booked: result.booked,
    conflicts: result.conflicts,
  };

  if (result.stock === null) {
    return {
      ...base,
      severity: "unknown",
      available: null,
      message: `Für „${productName}" ist in ${loc} keine Bestandsmenge gepflegt – die Verfügbarkeit kann nicht geprüft werden.`,
    };
  }

  const available = result.stock - result.booked;
  if (needed <= available) return null;

  return {
    ...base,
    severity: "over",
    available,
    message:
      `„${productName}": in ${loc} sind ${needed} Stück eingeplant, im Zeitraum ` +
      `${available < 0 ? 0 : available} von ${result.stock} frei` +
      (result.booked > 0 ? ` (${result.booked} bereits verplant).` : "."),
  };
}

/** Kurzer Status für die Anzeige direkt an der Position. */
export function badgeText(result: InventoryResult, needed: number, location: string | null | undefined): string {
  if (result.stock === null) return `Kein Bestand gepflegt (${locationLabel(location)})`;
  const available = result.stock - result.booked;
  const free = available < 0 ? 0 : available;
  if (needed > available) return `Überbucht: ${needed} benötigt, ${free} von ${result.stock} frei`;
  return `${free} von ${result.stock} frei in ${locationLabel(location)}`;
}

export interface AvailabilityQuery {
  slug: string;
  location: string | null;
  start: string | null;
  end: string | null;
  excludeInquiryId?: string | null;
  excludeReservationId?: string | null;
}

/** Ruft die Bestandsprüfung in der Datenbank auf. */
export async function fetchAvailability(q: AvailabilityQuery): Promise<InventoryResult | null> {
  if (!q.slug || !q.start) return null;
  const { data, error } = await (supabase.rpc as any)("check_inventory_availability", {
    _slug: q.slug,
    _location: q.location,
    _start: q.start,
    _end: q.end || q.start,
    _exclude_inquiry_id: q.excludeInquiryId ?? null,
    _exclude_reservation_id: q.excludeReservationId ?? null,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    stock: row.stock === null || row.stock === undefined ? null : Number(row.stock),
    stockSource: (row.stock_source ?? "none") as StockSource,
    booked: Number(row.booked ?? 0),
    conflicts: Array.isArray(row.conflicts) ? (row.conflicts as InventoryConflict[]) : [],
  };
}

/** "2026-09-22" aus einem ISO- oder Datums-String; null, wenn nicht erkennbar. */
export function toIsoDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const match = String(raw).match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}
