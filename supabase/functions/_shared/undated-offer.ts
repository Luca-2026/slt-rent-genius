/** Indicative rental quotes are duration-based, never operational reservations. */
export const UNDATED_OFFER_NOTE = "Unverbindliches Preisangebot ohne festen Mietzeitraum. Die Preise beziehen sich auf die ausgewiesene beispielhafte Mietdauer. Verfügbarkeit und endgültiger Mietzeitraum werden vor einer verbindlichen Beauftragung gesondert bestätigt. Aktuell ist keine Zahlung fällig und kein Gerät reserviert.";

export function withoutOfferDates<T extends { rental_start?: unknown; rental_end?: unknown; rental_start_time?: unknown; rental_end_time?: unknown; delivery_at?: unknown; collection_at?: unknown }>(line: T): T {
  return { ...line, rental_start: undefined, rental_end: undefined, rental_start_time: undefined, rental_end_time: undefined, delivery_at: undefined, collection_at: undefined };
}

export function allowsBindingOffer(payload: unknown): boolean {
  return !(payload && typeof payload === "object" && (payload as Record<string, unknown>).undated_offer === true);
}