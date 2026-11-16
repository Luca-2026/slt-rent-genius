export function initialSignBookingLocation(value?: string | null): string {
  const normalized = (value ?? "").trim().toLowerCase().replace(/ü/g, "ue").replace(/\s+an der ruhr$/, "");
  return ["bonn", "krefeld", "muelheim"].includes(normalized) ? normalized : "all";
}

type Booking = { id: string; start_date: string; end_date: string; status: string; cancelled_at?: string | null; inquiry?: { status: string } };
export function canPrepareSignBooking(b: Booking): boolean {
  return !b.cancelled_at && ["paid", "reserved", "review"].includes(b.status) && !["done", "cancelled", "rejected"].includes(b.inquiry?.status ?? "");
}

/** Upcoming first, then ongoing rentals, then history; dates never prove return. */
export function sortSignBookings<T extends Booking>(rows: readonly T[], today: string): T[] {
  const group = (b: T) => !canPrepareSignBooking(b) || b.end_date < today ? 2 : b.start_date >= today ? 0 : 1;
  return [...rows].sort((a, b) => group(a) - group(b) ||
    (group(a) === 2 ? b.start_date.localeCompare(a.start_date) :
      (group(a) === 1 ? a.end_date.localeCompare(b.end_date) : a.start_date.localeCompare(b.start_date))) || a.id.localeCompare(b.id));
}