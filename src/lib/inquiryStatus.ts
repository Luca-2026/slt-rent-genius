/**
 * Shared status model for public inquiries (rental + sales) processed in the
 * B2B portal. Kept pure so it can be unit tested.
 */

export const INQUIRY_STATUSES = [
  "new",
  "in_progress",
  "offer_sent",
  "accepted",
  "rejected",
  "done",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "Neu",
  in_progress: "In Bearbeitung",
  offer_sent: "Angebot gesendet",
  accepted: "Angenommen",
  rejected: "Abgelehnt",
  done: "Erledigt",
};

/** Tailwind classes using semantic tokens for the status badge. */
export const INQUIRY_STATUS_CLASSES: Record<InquiryStatus, string> = {
  new: "bg-cta-orange text-white",
  in_progress: "bg-primary text-primary-foreground",
  offer_sent: "bg-secondary text-secondary-foreground",
  accepted: "bg-emerald-600 text-white",
  rejected: "bg-destructive text-destructive-foreground",
  done: "bg-muted text-muted-foreground",
};

/** Statuses that still need someone to act. Drives the navigation badge. */
export const OPEN_INQUIRY_STATUSES: InquiryStatus[] = ["new", "in_progress", "offer_sent", "accepted"];

export function isInquiryStatus(value: unknown): value is InquiryStatus {
  return typeof value === "string" && (INQUIRY_STATUSES as readonly string[]).includes(value);
}

export function normalizeInquiryStatus(value: unknown): InquiryStatus {
  return isInquiryStatus(value) ? value : "new";
}

export function inquiryStatusLabel(value: unknown): string {
  return INQUIRY_STATUS_LABELS[normalizeInquiryStatus(value)];
}

const ALLOWED_TRANSITIONS: Record<InquiryStatus, InquiryStatus[]> = {
  new: ["in_progress", "offer_sent", "rejected", "done"],
  in_progress: ["offer_sent", "accepted", "rejected", "done"],
  offer_sent: ["accepted", "rejected", "done", "in_progress"],
  accepted: ["done", "rejected"],
  rejected: ["in_progress", "done"],
  done: ["in_progress"],
};

export function canTransition(from: unknown, to: InquiryStatus): boolean {
  const current = normalizeInquiryStatus(from);
  if (current === to) return false;
  return ALLOWED_TRANSITIONS[current].includes(to);
}

export function isOpenInquiry(status: unknown): boolean {
  return OPEN_INQUIRY_STATUSES.includes(normalizeInquiryStatus(status));
}

/**
 * „Offen“ im Sinne der Anfragenliste: noch von niemandem übernommen
 * und noch kein Angebot erstellt.
 */
export function isUnprocessedInquiry(row: { status: unknown; assigned_to?: string | null }): boolean {
  const s = normalizeInquiryStatus(row.status);
  return !row.assigned_to && (s === "new" || s === "in_progress");
}

export type InquiryListFilter = "unprocessed" | "working" | "offer_sent" | "accepted" | "closed" | "all";

export const INQUIRY_LIST_FILTERS: { value: InquiryListFilter; label: string }[] = [
  { value: "unprocessed", label: "Offen (nicht übernommen)" },
  { value: "working", label: "In Bearbeitung" },
  { value: "offer_sent", label: "Angebot gesendet" },
  { value: "accepted", label: "Angenommen" },
  { value: "closed", label: "Abgelehnt / erledigt" },
  { value: "all", label: "Alle Anfragen" },
];

export function matchesInquiryListFilter(
  row: { status: unknown; assigned_to?: string | null },
  filter: InquiryListFilter,
): boolean {
  const s = normalizeInquiryStatus(row.status);
  switch (filter) {
    case "all": return true;
    case "unprocessed": return isUnprocessedInquiry(row);
    case "working": return !isUnprocessedInquiry(row) && (s === "new" || s === "in_progress");
    case "offer_sent": return s === "offer_sent";
    case "accepted": return s === "accepted";
    case "closed": return s === "rejected" || s === "done";
  }
}

export function parseInquiryListFilter(v: string | null): InquiryListFilter {
  return INQUIRY_LIST_FILTERS.some((f) => f.value === v) ? (v as InquiryListFilter) : "unprocessed";
}
