/**
 * Kalender-Einträge für die Tages-/Wochenübersicht (Übergaben & Rückgaben).
 * Reine Funktionen, damit die Regeln unit-testbar sind.
 *
 * Quelle: Mietaufträge mit versandter Auftragsbestätigung (order_confirmed_at gesetzt,
 * Status „accepted"/„done"). Ohne Auftragsbestätigung erscheint nichts im Kalender.
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
  order_confirmed_at?: string | null;
  product_name: string | null;
  quantity: number | null;
  requested_items?: unknown;
  offer_payload?: unknown;
}

export type DayEntryKind = "pickup" | "return" | "delivery" | "collection" | "sign" | "task";
export const ENTRY_LABELS: Record<DayEntryKind, string> = { pickup: "Abholung", return: "Rückgabe", delivery: "Lieferung", collection: "Rückholung", sign: "Schilderarbeit", task: "Aufgabe" };

export interface DayEntry {
  kind: DayEntryKind;
  taskId?: string;
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
export function effectiveEnd(inq: Pick<CalendarInquiry, "end_date" | "offer_payload"> & { start_date?: string | null }): string | null {
  const ends = payloadItems(inq.offer_payload).map((i) => isoDate(i.rental_end)).filter((v): v is string => !!v).sort();
  const end = ends[ends.length - 1] ?? isoDate(inq.end_date);
  const start = effectiveStart({ start_date: inq.start_date ?? null, offer_payload: inq.offer_payload });
  if (payloadItems(inq.offer_payload).some((i) => {
    const from = isoDate(i.rental_start), to = isoDate(i.rental_end);
    return !!from && !!to && to < from;
  })) return null;
  return end && start && end < start ? null : end;
}

/** Widersprüchliche Zeiträume nicht als echte Rückgabetermine behandeln. */
export function hasInvalidRentalPeriod(inq: { start_date?: string | null; end_date?: string | null; offer_payload?: unknown }): boolean {
  const hasEnd = !!isoDate(inq.end_date) || payloadItems(inq.offer_payload).some((i) => !!isoDate(i.rental_end));
  return hasEnd && !effectiveEnd({ ...inq, end_date: inq.end_date ?? null });
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

/**
 * Aufträge, die im Kalender erscheinen: nur echte Mietaufträge mit versandter
 * Auftragsbestätigung (order_confirmed_at gesetzt) und Status „accepted"/„done".
 */
export function isCalendarRelevant(status: unknown, orderConfirmedAt?: unknown): boolean {
  return (status === "accepted" || status === "done") && !!orderConfirmedAt;
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
    if (!isCalendarRelevant(inq.status, inq.order_confirmed_at)) continue;
    const base = {
      inquiryId: inq.id,
      orderCode: inq.order_code ?? null,
      customer: inq.company_name || inq.customer_name || "Kunde",
      itemsLabel: itemsLabel(inq),
      location: inq.location,
    };
    const lines = payloadItems(inq.offer_payload) as Array<{ delivery_at?: string; collection_at?: string }>;
    const payload = inq.offer_payload as { order_type?: string; delivery_cost?: number; collection_cost?: number } | null;
    const deliveries = lines.map(i => i.delivery_at).filter((v): v is string => !!v).sort();
    const collections = lines.map(i => i.collection_at).filter((v): v is string => !!v).sort();
    const delivery = deliveries[0];
    const collection = collections[collections.length - 1];
    const start = delivery ? isoDate(delivery) : effectiveStart(inq);
    if (start) {
      entries.push({ ...base, kind: delivery || payload?.order_type === "delivery" ? "delivery" : "pickup", date: start, time: delivery ? timeOf(delivery.slice(11)) : timeOf(inq.start_time), protocolSigned: signedDelivery.has(inq.id) });
    }
    const end = effectiveEnd(inq);
    if (end) {
      entries.push({ ...base, kind: collection || Number(payload?.collection_cost) > 0 ? "collection" : "return", date: collection ? isoDate(collection) ?? end : end, time: collection ? timeOf(collection.slice(11)) : timeOf(inq.end_time), protocolSigned: signedReturn.has(inq.id) });
    }
  }
  return entries.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));
}

export interface CalendarTask { id: string; title: string; due_date: string | null; location: string | null; sign_booking_id?: string | null; status: string }
export interface CalendarTaskItem { list_id: string; title: string; scheduled_date: string | null; scheduled_time: string | null; is_done: boolean }
export function buildTaskCalendarEntries(tasks: CalendarTask[], items: CalendarTaskItem[]): DayEntry[] {
  const entries: DayEntry[] = [];
  for (const task of tasks) {
    if (task.status === "done" || task.status === "draft") continue;
    const scheduled = items.filter(i => i.list_id === task.id && i.scheduled_date && !i.is_done);
    const dates = scheduled.length ? scheduled.map(i => ({ date: i.scheduled_date, time: i.scheduled_time, label: i.title })) : [{ date: task.due_date, time: null, label: task.title }];
    for (const d of dates) if (d.date) entries.push({ kind: task.sign_booking_id ? "sign" : "task", date: d.date, time: d.time?.slice(0,5) ?? null, taskId: task.id, inquiryId: "", orderCode: null, customer: scheduled.length ? task.title : "", itemsLabel: d.label, location: task.location, protocolSigned: false });
  }
  return sortCalendarEntries(entries);
}
export function sortCalendarEntries(entries: DayEntry[]): DayEntry[] {
  return [...entries].sort((a,b) => a.date.localeCompare(b.date) || (a.time ?? "23:59").localeCompare(b.time ?? "23:59") || a.itemsLabel.localeCompare(b.itemsLabel));
}

/** Arbeitstag = Mo–Sa (Krefeld hat samstags geöffnet); Sonntag zählt nicht mit. */
function isWorkingDay(iso: string): boolean {
  return new Date(`${iso}T12:00:00`).getDay() !== 0;
}

/**
 * Letzter Kalendertag des Startseiten-Fensters: heute plus die folgenden Tage, bis
 * `count` Arbeitstage abgedeckt sind. Dazwischenliegende Sonntage bleiben enthalten,
 * damit z. B. 24/7-Abholungen nicht verschwinden.
 */
export function workingDayWindowEnd(todayIso: string, count = 3): string {
  let day = todayIso;
  let seen = isWorkingDay(day) ? 1 : 0;
  while (seen < count) {
    day = toLocalIso(addDays(new Date(`${day}T12:00:00`), 1));
    if (isWorkingDay(day)) seen++;
  }
  return day;
}

/** Einträge je Kalendertag gruppieren (chronologisch), für eine Tagesüberschrift je Datum. */
export function groupEntriesByDay(entries: DayEntry[]): Array<{ date: string; entries: DayEntry[] }> {
  const groups: Array<{ date: string; entries: DayEntry[] }> = [];
  for (const entry of sortCalendarEntries(entries)) {
    const last = groups[groups.length - 1];
    if (last && last.date === entry.date) last.entries.push(entry);
    else groups.push({ date: entry.date, entries: [entry] });
  }
  return groups;
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

export interface AllocationRange {
  from_at: string;
  to_at: string;
}

export type DeviceAvailability =
  | { state: "busy"; busyUntil: string; next: AllocationRange | null }
  | { state: "free_until"; freeUntil: string; next: AllocationRange }
  | { state: "free" };

/**
 * Verfügbarkeit eines Geräts zum Zeitpunkt `nowIso`:
 * - busy: aktuell belegt (busyUntil = Ende der laufenden Belegung)
 * - free_until: frei, aber nächste Belegung steht fest (freeUntil = deren Beginn)
 * - free: keine künftige Belegung
 */
export function deviceAvailability(allocations: AllocationRange[], nowIso: string): DeviceAvailability {
  const upcoming = allocations
    .filter((a) => a.to_at > nowIso)
    .sort((a, b) => a.from_at.localeCompare(b.from_at));
  const current = upcoming.find((a) => a.from_at <= nowIso);
  if (current) {
    const next = upcoming.find((a) => a.from_at > nowIso) ?? null;
    return { state: "busy", busyUntil: current.to_at, next };
  }
  if (upcoming[0]) return { state: "free_until", freeUntil: upcoming[0].from_at, next: upcoming[0] };
  return { state: "free" };
}

/**
 * Belegungs-Zeitleiste: für jeden Tag ab `startIso` (YYYY-MM-DD) true = belegt.
 * Ein Tag gilt als belegt, wenn eine Belegung den Kalendertag (lokal) schneidet.
 */
export function dayCells(allocations: AllocationRange[], startIso: string, days: number): boolean[] {
  const cells: boolean[] = [];
  for (let i = 0; i < days; i++) {
    const day = toLocalIso(addDays(new Date(`${startIso}T00:00:00`), i));
    const dayFrom = `${day}T00:00:00`;
    const dayTo = `${day}T23:59:59`;
    cells.push(allocations.some((a) => rangesOverlap(a.from_at.slice(0, 19), a.to_at.slice(0, 19), dayFrom, dayTo)));
  }
  return cells;
}

/**
 * Ab wann ist das Gerät wieder frei? null = jetzt sofort frei,
 * sonst ISO-Zeitpunkt = Ende der laufenden Belegung.
 * Geräte in Wartung/Reparatur etc. (outOfService) sind ausgenommen.
 */
export function nextFreeFrom(allocations: AllocationRange[], nowIso: string): string | null {
  const avail = deviceAvailability(allocations, nowIso);
  return avail.state === "busy" ? avail.busyUntil : null;
}

/**
 * Früheste Verfügbarkeit über eine Geräteliste: null = mindestens ein Gerät ist sofort frei,
 * sonst der früheste Zeitpunkt, ab dem wieder ein Gerät frei wird.
 */
export function earliestFreeFrom(list: Array<{ allocations: AllocationRange[] }>, nowIso: string): string | null {
  const frees = list.map((r) => nextFreeFrom(r.allocations, nowIso));
  if (frees.some((f) => f === null)) return null;
  const sorted = (frees as string[]).sort();
  return sorted[0] ?? null;
}

/** „Bonn" / „Mülheim an der Ruhr" → Standortschlüssel wie in der Datenbank. */
export function matchesCalendarLocation(raw: string | null | undefined, filter: string): boolean {
  return filter === "all" || normalizeLoc(raw) === normalizeLoc(filter);
}

export function normalizeLoc(raw: string | null | undefined): string | null {
  const v = (raw ?? "").trim().toLowerCase();
  if (!v) return null;
  if (v.includes("bonn")) return "bonn";
  if (v.includes("lheim") || v.includes("mulheim")) return "muelheim";
  if (v.includes("krefeld")) return "krefeld";
  return v;
}
