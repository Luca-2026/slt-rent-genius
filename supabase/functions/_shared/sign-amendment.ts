import { buildOfferTotals, type InquiryOfferItem } from "./inquiry-offer-math.ts";

export function signResidualPlan<T extends { openCents: number; rentCents: number; depositCents: number }>(plan: T, payload: unknown, revision: unknown): T {
  const direct = (payload as { direct_booking?: boolean } | null)?.direct_booking === true && Number(revision) > 0;
  return direct ? { ...plan, rentCents: plan.openCents, depositCents: 0 } : plan;
}

export function signAmendmentTotals(current: Record<string, unknown>, extras: InquiryOfferItem[]) {
  const oldItems = Array.isArray(current.items) ? current.items as InquiryOfferItem[] : [];
  const previous = { ...buildOfferTotals(oldItems), ...(current.totals as Partial<ReturnType<typeof buildOfferTotals>>) };
  const added = buildOfferTotals(extras);
  const sum = (key: keyof typeof added) => Math.round((Number(previous[key] ?? 0) + Number(added[key] ?? 0)) * 100) / 100;
  return { ...added, itemsNet: sum("itemsNet"), addonsNet: sum("addonsNet"), netAmount: sum("netAmount"), vatAmount: sum("vatAmount"), grossAmount: sum("grossAmount"), nonTaxableNet: sum("nonTaxableNet") };
}

/** Original paid sign packages remain immutable; staff append separately priced extras. */
export function preserveSignBookingItems(items: Record<string, unknown>[], current: Record<string, unknown>) {
  const original = Array.isArray(current.items) ? current.items as Record<string, unknown>[] : [];
  if (items.length <= original.length) throw new Error("Bitte zusätzliche Artikel als neue Position ergänzen. Das bezahlte Paket bleibt unverändert.");
  for (let index = 0; index < original.length; index++) {
    const before = original[index], after = items[index];
    const sameMoney = (key: string) => Math.round(Number(before[key] ?? 0) * 100) === Math.round(Number(after[key] ?? 0) * 100);
    if (!after || before.product_slug !== after.product_slug || before.product_name !== after.product_name ||
      Number(before.quantity) !== Number(after.quantity) || !sameMoney("unit_price") || !sameMoney("discount_percent") ||
      (before.rental_start ?? before.start_date) !== after.rental_start || (before.rental_end ?? before.end_date) !== after.rental_end ||
      String(before.name_override ?? "") !== String(after.name_override ?? "")) {
      throw new Error("Bereits bestätigte Schilderpositionen bleiben unverändert. Bitte Zusatzartikel separat ergänzen.");
    }
  }
  const extras = items.slice(original.length);
  if (extras.some(item => item.product_slug === "halteverbotsschilder-set")) throw new Error("Weitere Halteverbotsschilder-Sets bitte separat buchen; dieser Nachtrag ergänzt Zusatzartikel.");
  return [...original, ...extras];
}

export function signPaymentState(input: { booking: { status: string; expires_at: string } | null; revision: number; linkStatus: string; openCents: number; now?: number }) {
  const { booking, revision, linkStatus, openCents } = input;
  if (!booking) return linkStatus;
  if (booking.status === "paid" && revision > 0) return linkStatus === "active" && openCents <= 0 ? "paid" : linkStatus;
  if (booking.status === "paid") return linkStatus === "active" ? "paid" : linkStatus;
  if (booking.status !== "reserved" || Date.parse(booking.expires_at) <= (input.now ?? Date.now())) return "superseded";
  return linkStatus;
}

export function signCheckoutExpiry(booking: { status: string; expires_at: string } | null, now = Date.now()) {
  const standard = Math.floor(now / 1000) + 23 * 3600;
  return booking?.status === "reserved" ? Math.min(Math.floor(Date.parse(booking.expires_at) / 1000), standard) : standard;
}