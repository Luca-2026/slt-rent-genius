/**
 * Abrechnungszeiträume der Lohnbuchhaltung:
 * Ein Zeitraum läuft vom 21. eines Monats bis zum 20. des Folgemonats.
 * Der Steuerberater rechnet am 20. ab – danach ist der Zeitraum gesperrt.
 */

export const PERIOD_END_DAY = 20;
/** Ab diesem Tag im Monat wird an den offenen Stundenzettel erinnert. */
export const REMINDER_DAY = 19;
/** Maximale Länge einer Tätigkeitsnotiz (auch serverseitig erzwungen). */
export const NOTE_MAX_LENGTH = 300;

const pad = (n: number) => String(n).padStart(2, "0");

export interface PayrollPeriod {
  /** Jahr des Zeitraum-Endes (= Abrechnungsmonat) */
  year: number;
  /** Monat des Zeitraum-Endes, 1-12 (= Abrechnungsmonat) */
  month: number;
  /** ISO-Datum 21. des Vormonats */
  start: string;
  /** ISO-Datum 20. des Abrechnungsmonats */
  end: string;
}

export function periodFor(year: number, month: number): PayrollPeriod {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return {
    year,
    month,
    start: `${prevYear}-${pad(prevMonth)}-21`,
    end: `${year}-${pad(month)}-${pad(PERIOD_END_DAY)}`,
  };
}

/** Der Zeitraum, in dem das übergebene Datum liegt (Standard: heute). */
export function currentPeriod(ref: Date = new Date()): PayrollPeriod {
  const day = ref.getDate();
  let year = ref.getFullYear();
  let month = ref.getMonth() + 1;
  if (day > PERIOD_END_DAY) {
    month += 1;
    if (month > 12) { month = 1; year += 1; }
  }
  return periodFor(year, month);
}

export function shiftPeriod(p: PayrollPeriod, delta: number): PayrollPeriod {
  let m = p.month + delta;
  let y = p.year;
  while (m < 1) { m += 12; y -= 1; }
  while (m > 12) { m -= 12; y += 1; }
  return periodFor(y, m);
}

/**
 * Letztes Datum, das durch die abgeschlossene Lohnabrechnung gesperrt ist.
 * Ab dem 21. eines Monats ist der Zeitraum bis zum 20. desselben Monats gesperrt.
 */
export function lockedThrough(ref: Date = new Date()): string {
  const day = ref.getDate();
  const y = ref.getFullYear();
  const m = ref.getMonth() + 1;
  if (day > PERIOD_END_DAY) return `${y}-${pad(m)}-${pad(PERIOD_END_DAY)}`;
  const pm = m === 1 ? 12 : m - 1;
  const py = m === 1 ? y - 1 : y;
  return `${py}-${pad(pm)}-${pad(PERIOD_END_DAY)}`;
}

/** Alle Kalendertage eines Zeitraums als ISO-Liste. */
export function periodDays(p: PayrollPeriod): { iso: string; day: number; month: number; year: number; dow: number; weekend: boolean }[] {
  const out: { iso: string; day: number; month: number; year: number; dow: number; weekend: boolean }[] = [];
  const [sy, sm, sd] = p.start.split("-").map(Number);
  const [ey, em, ed] = p.end.split("-").map(Number);
  const cursor = new Date(sy, sm - 1, sd);
  const endDate = new Date(ey, em - 1, ed);
  while (cursor <= endDate) {
    const dow = cursor.getDay();
    out.push({
      iso: `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`,
      day: cursor.getDate(),
      month: cursor.getMonth() + 1,
      year: cursor.getFullYear(),
      dow,
      weekend: dow === 0 || dow === 6,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export const monthName = (m: number) => MONTHS[m - 1];

const deDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

/** "21.07.2026 – 20.08.2026" */
export function periodRangeLabel(p: PayrollPeriod): string {
  return `${deDate(p.start)} – ${deDate(p.end)}`;
}

/** "Abrechnung August 2026" */
export function periodTitle(p: PayrollPeriod): string {
  return `Abrechnung ${monthName(p.month)} ${p.year}`;
}

/** Ist der Zeitraum bereits gesperrt (Abrechnung erfolgt)? */
export function isPeriodLocked(p: PayrollPeriod, ref: Date = new Date()): boolean {
  return p.end <= lockedThrough(ref);
}

/** Erinnerungsphase: ab dem 19. bis zum Abrechnungsstichtag des laufenden Zeitraums. */
export function isReminderWindow(ref: Date = new Date()): boolean {
  const day = ref.getDate();
  return day >= REMINDER_DAY && day <= PERIOD_END_DAY;
}
