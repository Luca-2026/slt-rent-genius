import type { OfferGroup } from "./offerMath";

export const OFFER_TIME_OPTIONS = Array.from({ length: 96 }, (_, i) =>
  `${String(Math.floor(i / 4)).padStart(2, "0")}:${String((i % 4) * 15).padStart(2, "0")}`,
);

/** The final group renders last, even when it currently has no positions. */
export function appendOfferPosition<T extends { group_id?: string }>(items: T[], item: T, groups: OfferGroup[]): T[] {
  const lastGroup = groups[groups.length - 1];
  return [...items, { ...item, group_id: lastGroup?.id }];
}