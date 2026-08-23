/** Abrechnungszeiträume 21. – 20. (Lohnabrechnung am 20. eines Monats). */

export const PERIOD_END_DAY = 20;
export const REMINDER_DAY = 19;
export const NOTE_MAX_LENGTH = 300;

const pad = (n: number) => String(n).padStart(2, "0");

export interface PayrollPeriod {
  year: number;
  month: number;
  start: string;
  end: string;
}

export function periodFor(year: number, month: number): PayrollPeriod {
  const pm = month === 1 ? 12 : month - 1;
  const py = month === 1 ? year - 1 : year;
  return {
    year,
    month,
    start: `${py}-${pad(pm)}-21`,
    end: `${year}-${pad(month)}-${pad(PERIOD_END_DAY)}`,
  };
}

/** "Heute" in Europe/Berlin als {year, month, day}. */
export function berlinToday(ref: Date = new Date()): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ref);
  const [y, m, d] = parts.split("-").map(Number);
  return { year: y, month: m, day: d };
}

export function currentPeriod(ref: Date = new Date()): PayrollPeriod {
  const { year, month, day } = berlinToday(ref);
  let y = year;
  let m = month;
  if (day > PERIOD_END_DAY) {
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return periodFor(y, m);
}

export function lockedThrough(ref: Date = new Date()): string {
  const { year, month, day } = berlinToday(ref);
  if (day > PERIOD_END_DAY) return `${year}-${pad(month)}-${pad(PERIOD_END_DAY)}`;
  const pm = month === 1 ? 12 : month - 1;
  const py = month === 1 ? year - 1 : year;
  return `${py}-${pad(pm)}-${pad(PERIOD_END_DAY)}`;
}

export function isPeriodLocked(p: { end: string }, ref: Date = new Date()): boolean {
  return p.end <= lockedThrough(ref);
}

const deDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

export function periodRangeLabel(p: { start: string; end: string }): string {
  return `${deDate(p.start)} – ${deDate(p.end)}`;
}
