type Period = { start?: string | null; end?: string | null };
type Item = { rental_start?: string | null; rental_end?: string | null; period_free?: boolean };
const dateOnly = (value: unknown): string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : "";

/** Explicit invoice dates win; otherwise use the agreed rental item range. */
export function invoiceServicePeriod(manual: Period | undefined, explicitDefault: Period | undefined, rental: Period | undefined, items: Item[]) {
  const rented = items.filter(item => !item.period_free);
  const starts = rented.map(item => dateOnly(item.rental_start)).filter(Boolean).sort();
  const ends = rented.map(item => dateOnly(item.rental_end)).filter(Boolean).sort();
  return {
    start: dateOnly(manual?.start) || dateOnly(explicitDefault?.start) || starts[0] || dateOnly(rental?.start),
    end: dateOnly(manual?.end) || dateOnly(explicitDefault?.end) || ends[ends.length - 1] || dateOnly(rental?.end),
  };
}