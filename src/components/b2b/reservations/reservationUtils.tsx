/**
 * Phase A2 — extracted helpers from MyReservations.tsx.
 *
 * These are PURE functions and presentational components. Behavior is
 * identical to the original inline definitions. No data fetching, no auth,
 * no state mutation here. Safe to reuse across customer + admin views.
 */
import { Badge } from "@/components/ui/badge";
import {
  RESERVATION_STATUS_META,
  pickWorstStatus,
  type ReservationStatusMeta,
} from "@/lib/reservationStatus";

// Re-export central status helpers so existing imports from this module keep working.
export {
  ReservationStatus,
  RESERVATION_STATUS_META,
  RESERVATION_STATUS_ORDER,
  isReservationStatus,
  getReservationStatusLabel,
  pickWorstStatus,
  isPending,
  isOfferSent,
  isConfirmed,
  isCancelled,
  isCompleted,
} from "@/lib/reservationStatus";

export interface Reservation {
  id: string;
  product_id: string;
  product_name: string | null;
  category_slug: string | null;
  location: string;
  start_date: string;
  end_date: string | null;
  quantity: number;
  status: string;
  notes: string | null;
  original_price: number | null;
  discounted_price: number | null;
  created_at: string;
  rental_group_id?: string | null;
}

export interface Offer {
  id: string;
  reservation_id: string | null;
  offer_number: string;
  offer_date: string;
  valid_until: string | null;
  status: string;
  gross_amount: number;
  file_url: string | null;
}

export interface ReservationGroup {
  key: string;
  reservations: Reservation[];
  location: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  status: string;
  isBatch: boolean;
}

/**
 * Backwards-compatible alias for `RESERVATION_STATUS_META`. Existing call
 * sites use `statusConfig[r.status]` — keep that working.
 */
export const statusConfig: Record<string, ReservationStatusMeta> = RESERVATION_STATUS_META;

export const locationLabels: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

/**
 * Reusable status badge for B2B reservations.
 * Falls back to the raw status string if unknown so we never hide data.
 */
export function ReservationStatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status];
  if (!cfg) {
    return <Badge variant="secondary">{status}</Badge>;
  }
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

function buildGroup(items: Reservation[]): ReservationGroup {
  const first = items[0];
  // Display the "worst" (earliest in lifecycle) status of the group
  const groupStatus = pickWorstStatus(items.map((r) => r.status));

  return {
    key: `${first.created_at}-${first.location}`,
    reservations: items,
    location: first.location,
    startDate: first.start_date,
    endDate: first.end_date,
    createdAt: first.created_at,
    status: groupStatus,
    isBatch: items.length > 1,
  };
}

/**
 * Group reservations by rental_group_id when available, falling back to
 * timestamp-based grouping (≤10s, same location) for legacy rows that
 * predate the rental_group_id column.
 */
export function groupReservations(reservations: Reservation[]): ReservationGroup[] {
  if (reservations.length === 0) return [];

  const grouped = new Map<string, Reservation[]>();
  const ungrouped: Reservation[] = [];

  for (const res of reservations) {
    if (res.rental_group_id) {
      const existing = grouped.get(res.rental_group_id) || [];
      existing.push(res);
      grouped.set(res.rental_group_id, existing);
    } else {
      ungrouped.push(res);
    }
  }

  const groups: ReservationGroup[] = [];

  for (const [, items] of grouped) {
    groups.push(buildGroup(items));
  }

  if (ungrouped.length > 0) {
    const sorted = [...ungrouped].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    let currentGroup: Reservation[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const prev = currentGroup[currentGroup.length - 1];
      const curr = sorted[i];
      const timeDiff = Math.abs(
        new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime()
      );

      if (timeDiff <= 10000 && curr.location === prev.location) {
        currentGroup.push(curr);
      } else {
        groups.push(buildGroup(currentGroup));
        currentGroup = [curr];
      }
    }
    groups.push(buildGroup(currentGroup));
  }

  return groups.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
