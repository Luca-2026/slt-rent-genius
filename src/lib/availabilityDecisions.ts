/** Verfügbarkeitsprüfung vor der Auftragsbestätigung (Ergebnis von check_availability). */
export interface AvailabilityItem {
  index: number;
  product_name: string;
  needed: number;
  free: number | null;
  available: boolean;
  source: "instances" | "quantities" | "untracked";
  location: string;
  from_at: string;
  to_at: string;
  other_locations: Record<string, number>;
}
export interface AvailabilityResult {
  all_available: boolean;
  location: string;
  items: AvailabilityItem[];
}

export type ItemChoice =
  | { action: "order_from"; source: string; transport_cost?: number | null; cost_charged?: boolean }
  | { action: "pending" }
  | { action: "reject" };

/** Positionen, für die eine Entscheidung nötig ist. */
export const blockedItems = (r: AvailabilityResult) => r.items.filter((i) => !i.available);

/** Standorte, von denen geordert werden kann (nur echte Einzelgeräte, genug frei). */
export const orderableLocations = (i: AvailabilityItem) =>
  i.source === "instances"
    ? Object.entries(i.other_locations ?? {}).filter(([, n]) => n >= i.needed).map(([l]) => l)
    : [];

/**
 * Entscheidungen zusammenführen: eine Absage gewinnt, danach Rücksprache;
 * nur wenn alle Positionen geordert werden, wird bestätigt.
 */
export function buildDecisions(r: AvailabilityResult, choices: Record<number, ItemChoice | undefined>) {
  const blocked = blockedItems(r);
  if (blocked.some((i) => !choices[i.index])) return null;
  const list = blocked.map((i) => choices[i.index]!);
  if (list.some((c) => c.action === "reject")) return { mode: "reject" as const, items: {} };
  if (list.some((c) => c.action === "pending")) return { mode: "pending" as const, items: {} };
  const items: Record<string, unknown> = {};
  for (const i of blocked) {
    const c = choices[i.index] as Extract<ItemChoice, { action: "order_from" }>;
    const cost = c.transport_cost != null && Number(c.transport_cost) > 0 ? Math.round(Number(c.transport_cost) * 100) / 100 : null;
    items[String(i.index)] = { action: "order_from", source: c.source, transport_cost: cost, cost_charged: !!c.cost_charged && cost != null };
  }
  return { mode: "confirm" as const, items };
}
