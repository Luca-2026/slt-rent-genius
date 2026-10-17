/**
 * Kalender-Einträge für die Tages-/Wochenübersicht (Übergaben & Rückgaben).
 * Reine Funktionen, damit die Regeln unit-testbar sind.
 *
 * Quelle: bestätigte Mietaufträge (Status „accepted"/„done") mit Mietzeitraum.
 * Abweichende Positionsdaten im Angebot gewinnen (frühester Beginn, spätestes Ende).
 */

export interface CalendarInquiry {
  id: string;
  status: string;
  start_date: string | null;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  location: string | null;
  customer_name: string | null;
  company_name: string | null;
  order_code?: string | null;
  product_name: string | null;
  quantity: number | null;
  requested_items?: unknown;
  offer_payload?: unknown;
}

export type DayEntryKind = "pickup" | "return";

export interface DayEntry {
  kind: DayEntryKind;
  /** YYYY-MM-DD */
  date: string;
  /** „HH:MM" oder null */
  time: string | null;
  inquiryId: string;
  orderCode: string | null;
  customer: string;
  itemsLabel: string;
  location: string | null;
  /** true = Protokoll unterschrieben, false = offen, null = kein Protokoll nötig/bekannt */
  protocolSigned: boolean;
}

const isoDate = (v: string | null | undefined): string | null => {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(v ?? ""));
  return m ? m[1] : null;
};

const timeOf = (v: string | null | undefined): string | null => {
  const t = String(v ?? "").slice(0, 5);
  return /^\d{2}:\d{2}$/.test(t) ? t : null;
};

/** Positionen mit abweichendem Zeitraum aus dem Angebot (Snapshot). */
function payloadItems(payload: unknown): Array<{ rental_start?: string; rental_end?: string }> {
  const items = ((payload as { items?: unknown } | null)?.items ?? []) as Array<{ rental_start?: string; rental_end?: string }>;
  return Array.isArray(items) ? items : [];
}

/** Effektiver Mietbeginn (früheste Position, sonst Anfrage). */
export function effectiveStart(inq: Pick<CalendarInquiry, "start_date" | "offer_payload">): string | null {
  const starts = payloadItems(inq.offer_payload).map((i) => isoDate(i.rental_start)).filter((v): v is string => !!v).sort();
  return starts[0] ?? isoDate(inq.start_date);
}

/** Effektives Mietende (späteste Position, sonst Anfrage). */
export function effectiveEnd(inq: Pick<CalendarInquiry, "end_date" | "offer_payload">): string | null {
  const ends = payloadItems(inq.offer_payload).map((i) => isoDate(i.rental_end)).filter((v): v is string => !!v).sort();
  return ends[ends.length - 1] ?? isoDate(inq.end_date);
}

function itemsLabel(inq: CalendarInquiry): string {
  const raw = Array.isArray(inq.requested_items) ? (inq.requested_items as Array<{ product_name?: unknown; quantity?: unknown }>) : [];
  const parts = raw
    .map((r) => {
      const name = String(r?.product_name ?? "").trim();
      if (!name) return null;
      const qty = Math.max(1, Math.round(Number(r?.quantity) || 1));
      return qty > 1 ? `${qty}× ${name}` : name;
    })
    .filter((v): v is string => !!v);
  if (parts.length) return parts.join(", ");
  if (inq.product_name) {
    const qty = inq.quantity && inq.quantity > 1 ? `${inq.quantity}× ` : "";
    return `${qty}${inq.product_name}`;
  }
  return "Mietauftrag";
}

/** Aufträge, die im Kalender erscheinen: bestätigt oder abgeschlossen, nie abgelehnt/offen. */
export function isCalendarRelevant(status: unknown): boolean {
  return status === "accepted" || status === "done";
}

/**
 * Baut aus den Aufträgen die Tageseinträge.
 * `signedDelivery` / `signedReturn`: Mengen der inquiry-IDs mit unterschriebenem Protokoll.
 */
export function buildCalendarEntries(
  inquiries: CalendarInquiry[],
  signedDelivery: ReadonlySet<string>,
  signedReturn: ReadonlySet<string>,
): DayEntry[] {
  const entries: DayEntry[] = [];
  for (const inq of inquiries) {
    if (!isCalendarRelevant(inq.status)) continue;
    const base = {
      inquiryId: inq.id,
      orderCode: inq.order_code ?? null,
      customer: inq.company_name || inq.customer_name || "Kunde",
      itemsLabel: itemsLabel(inq),
      location: inq.location,
    };
    const start = effectiveStart(inq);
    if (start) {
      entries.push({ ...base, kind: "pickup", date: start, time: timeOf(inq.start_time), protocolSigned: signedDelivery.has(inq.id) });
    }
    const end = effectiveEnd(inq);
    if (end) {
      entries.push({ ...base, kind: "return", date: end, time: timeOf(inq.end_time), protocolSigned: signedReturn.has(inq.id) });
    }
  }
  return entries.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));
}

/** Montag der Woche zu einem Datum (lokal). */
export function weekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // Mo = 0
  d.setDate(d.getDate() - day);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toLocalIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Sieben Tage (Mo–So) ab Wochenstart als ISO-Daten. */
export function weekDays(anchor: Date): string[] {
  const start = weekStart(anchor);
  return Array.from({ length: 7 }, (_, i) => toLocalIso(addDays(start, i)));
}

/** Überschneiden sich zwei Zeiträume? (halbe Intervalle, ISO-Strings) */
export function rangesOverlap(aFrom: string, aTo: string, bFrom: string, bTo: string): boolean {
  return aFrom < bTo && bFrom < aTo;
}

/** „Bonn" / „Mülheim an der Ruhr" → Standortschlüssel wie in der Datenbank. */
export function normalizeLoc(raw: string | null | undefined): string | null {
  const v = (raw ?? "").trim().toLowerCase();
  if (!v) return null;
  if (v.includes("bonn")) return "bonn";
  if (v.includes("lheim") || v.includes("mulheim")) return "muelheim";
  if (v.includes("krefeld")) return "krefeld";
  return v;
}
