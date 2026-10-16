/** Mietbeginn/-ende einheitlich anzeigen: „Mo, 20.10.2026, 08:00“. */
const WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function parseDate(value: string | null | undefined): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ""));
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

export function formatRentalMoment(date: string | null | undefined, time?: string | null): string {
  const d = parseDate(date);
  if (!d) return "—";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const base = `${WD[d.getUTCDay()]}, ${dd}.${mm}.${d.getUTCFullYear()}`;
  const t = String(time ?? "").slice(0, 5);
  return /^\d{2}:\d{2}$/.test(t) ? `${base}, ${t}` : base;
}

interface PeriodSource {
  start_date?: string | null;
  start_time?: string | null;
  end_date?: string | null;
  end_time?: string | null;
  offer_payload?: unknown;
}

/** Zeitraum: Anfrage, außer die Angebotspositionen weichen ab (frühester Beginn, spätestes Ende). */
export function rentalPeriodOf(src: PeriodSource): { start: string; end: string } {
  const items = ((src.offer_payload as { items?: unknown } | null)?.items ?? []) as Array<{ rental_start?: string; rental_end?: string }>;
  const starts = (Array.isArray(items) ? items : []).map((i) => i?.rental_start).filter((v): v is string => !!parseDate(v)).sort();
  const ends = (Array.isArray(items) ? items : []).map((i) => i?.rental_end).filter((v): v is string => !!parseDate(v)).sort();
  const startDate = starts[0] ?? src.start_date ?? null;
  const endDate = ends[ends.length - 1] ?? src.end_date ?? null;
  return {
    start: formatRentalMoment(startDate, src.start_time),
    end: formatRentalMoment(endDate, src.end_time),
  };
}
