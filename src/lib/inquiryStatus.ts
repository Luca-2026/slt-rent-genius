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

export type InquiryListFilter = "unprocessed" | "working" | "offer_sent" | "accepted" | "upcoming" | "running" | "completed" | "rejected" | "all";

type ListRow = {
  status: unknown;
  assigned_to?: string | null;
  order_confirmed_at?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  /** Übergabeprotokoll existiert bereits (Gerät ist beim Kunden). */
  handed_over?: boolean;
};

/** Heutiges Datum als YYYY-MM-DD in lokaler Zeit (Berlin im Portal). */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isConfirmedOrder(row: ListRow): boolean {
  return normalizeInquiryStatus(row.status) === "accepted" && !!row.order_confirmed_at;
}

/**
 * Laufender Mietvorgang: Auftragsbestätigung versendet, noch keine Rechnung
 * UND der Mietzeitraum hat begonnen (oder die Übergabe ist schon erfolgt).
 * Aufträge mit Mietbeginn in der Zukunft sind „bevorstehend“, nicht laufend.
 */
export function isRunningRental(row: ListRow, today: string = todayIso()): boolean {
  if (!isConfirmedOrder(row)) return false;
  if (row.handed_over) return true;
  const start = (row.start_date ?? "").slice(0, 10);
  if (!start) return true; // ohne Mietbeginn nicht verstecken
  return start <= today;
}

/** Bestätigter Auftrag, Mietbeginn liegt noch in der Zukunft. */
export function isUpcomingRental(row: ListRow, today: string = todayIso()): boolean {
  return isConfirmedOrder(row) && !isRunningRental(row, today);
}

/** Laufend, aber Mietende überschritten → Rückgabe überfällig. */
export function isReturnOverdue(row: ListRow, today: string = todayIso()): boolean {
  if (!isRunningRental(row, today)) return false;
  const end = (row.end_date ?? "").slice(0, 10);
  return !!end && end < today;
}

export const INQUIRY_LIST_FILTERS: { value: InquiryListFilter; label: string }[] = [
  { value: "all", label: "Alle Anfragen" },
  { value: "unprocessed", label: "Offen (nicht übernommen)" },
  { value: "working", label: "In Bearbeitung" },
  { value: "offer_sent", label: "Angebot gesendet" },
  { value: "accepted", label: "Angenommen (Auftragsbestätigung offen)" },
  { value: "upcoming", label: "Bestätigt – Mietbeginn steht bevor" },
  { value: "running", label: "Laufende Mietvorgänge" },
  { value: "completed", label: "Abgeschlossen (abgerechnet)" },
  { value: "rejected", label: "Abgelehnt" },
];

export function matchesInquiryListFilter(
  row: ListRow,
  filter: InquiryListFilter,
  today: string = todayIso(),
): boolean {
  const s = normalizeInquiryStatus(row.status);
  switch (filter) {
    case "all": return true;
    case "unprocessed": return isUnprocessedInquiry(row);
    case "working": return !isUnprocessedInquiry(row) && (s === "new" || s === "in_progress");
    case "offer_sent": return s === "offer_sent";
    case "accepted": return s === "accepted" && !row.order_confirmed_at;
    case "upcoming": return isUpcomingRental(row, today);
    case "running": return isRunningRental(row, today);
    case "completed": return s === "done";
    case "rejected": return s === "rejected";
  }
}

/** Standard-Filter der Mietanfragen-Liste: „Offen (nicht übernommen)“. */
export const DEFAULT_INQUIRY_LIST_FILTER: InquiryListFilter = "unprocessed";
export function parseInquiryListFilter(v: string | null): InquiryListFilter {
  return INQUIRY_LIST_FILTERS.some((f) => f.value === v) ? (v as InquiryListFilter) : DEFAULT_INQUIRY_LIST_FILTER;
}
