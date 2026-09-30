/**
 * Kundengruppe für Filter in Anfragen, Angeboten und Rechnungen.
 *  - private:  Privatkunde
 *  - business: Geschäftskunde ohne Portalkonto
 *  - portal:   Firmenkunde mit B2B-Portalkonto
 */
export type CustomerSegment = "private" | "business" | "portal";
export type SegmentFilter = "all" | CustomerSegment;

export const SEGMENT_FILTER_OPTIONS: { value: SegmentFilter; label: string }[] = [
  { value: "all", label: "Alle Kunden" },
  { value: "private", label: "Privatkunden" },
  { value: "business", label: "Geschäftskunden" },
  { value: "portal", label: "B2B-Portalkunden" },
];

export const SEGMENT_LABELS: Record<CustomerSegment, string> = {
  private: "Privat",
  business: "Geschäftskunde",
  portal: "B2B-Portal",
};

export function segmentOf(row: {
  customer_kind?: string | null;
  source?: string | null;
  b2b_profile_id?: string | null;
}): CustomerSegment {
  if (row.source === "b2b_portal" || row.b2b_profile_id) return "portal";
  const k = (row.customer_kind ?? "").toLowerCase();
  return k === "business" || k === "b2b" ? "business" : "private";
}

export function matchesSegment(segment: CustomerSegment, filter: SegmentFilter): boolean {
  return filter === "all" || filter === segment;
}

/** Filter aus der URL lesen (?kunden=private|business|portal). */
export function parseSegmentFilter(value: string | null): SegmentFilter {
  return value === "private" || value === "business" || value === "portal" ? value : "all";
}
