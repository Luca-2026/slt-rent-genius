/** Optional local Berlin logistics moments; affect insurance, never rental billing. */
export interface OfferLogistics {
  delivery_at?: string;
  collection_at?: string;
}

/** Inclusive Berlin calendar days; each missing logistics endpoint falls back to rent. */
export function offerInsurancePeriod(line: OfferLogistics & { rental_start?: string; rental_end?: string }) {
  const start = (line.delivery_at || line.rental_start)?.slice(0, 10);
  const end = (line.collection_at || line.rental_end)?.slice(0, 10);
  if (!start || !end) return null;
  const from = Date.parse(`${start}T00:00:00Z`);
  const to = Date.parse(`${end}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) throw new Error("Versicherungsende liegt vor dem Versicherungsbeginn oder ist ungültig");
  return { start, end, days: Math.round((to - from) / 86400000) + 1 };
}

export function normalizeOfferLogistics(raw: Record<string, unknown>): OfferLogistics {
  const moment = (key: string): string | undefined => {
    const value = raw[key];
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Ungültiger Liefer- oder Rückholzeitpunkt");
    const [date, time] = value.split("T");
    const parsed = new Date(`${date}T00:00:00Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || time > "23:59" || time.slice(3) > "59") throw new Error("Ungültiger Liefer- oder Rückholzeitpunkt");
    return value;
  };
  const delivery_at = moment("delivery_at");
  const collection_at = moment("collection_at");
  if (delivery_at && collection_at && collection_at < delivery_at) throw new Error("Rückholung liegt vor der Lieferung");
  return { delivery_at, collection_at };
}

export function logisticsDescription(line: OfferLogistics): string[] {
  const format = (value: string) => {
    const [date, time] = value.split("T");
    const [year, month, day] = date.split("-");
    return `${day}.${month}.${year}, ${time}`;
  };
  return [line.delivery_at ? `Lieferung: ${format(line.delivery_at)}` : "", line.collection_at ? `Rückholung: ${format(line.collection_at)}` : ""].filter(Boolean);
}