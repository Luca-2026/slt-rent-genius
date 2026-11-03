/** Optional local Berlin logistics moments; never used as billing-period input. */
export interface OfferLogistics {
  delivery_at?: string;
  collection_at?: string;
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