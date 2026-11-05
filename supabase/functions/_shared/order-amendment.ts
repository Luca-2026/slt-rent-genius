import { normalizeInquiryOfferItems, buildOfferTotals, normalizeOfferGroups, normalizeExtraFields, resolveReturnLocation } from "./inquiry-offer-math.ts";
import { hasBankDiscountPolicy, priceBankTransfer, withoutBankDiscount } from "./bank-transfer-discount.ts";
import { validCalendarDate } from "./public-rental-period.ts";
import { normalizeOpenEndedUnit, normalizeOpenEndedDuration } from "./installments.ts";
export function buildOrderAmendment<T extends Record<string, unknown>>(body: Record<string, unknown>, current: T, location: string) {
  let items = withoutBankDiscount(normalizeInquiryOfferItems(body.items));
  for (const item of items) {
    if (!item.rental_start || !validCalendarDate(item.rental_start) || (!body.open_ended && (!item.rental_end || !validCalendarDate(item.rental_end) || item.rental_end < item.rental_start))) throw new Error("Bitte gültige Mietzeiträume für jede Position angeben.");
  }
  const amount = (key: string) => { const value = Number(body[key] ?? 0); if (!Number.isFinite(value) || value < 0 || value > 1000000) throw new Error("Ungültiger Betrag"); return Math.round(value * 100) / 100; };
  const returnLocation = resolveReturnLocation(body.return_location, location, body.return_location_cost);
  const costs = { delivery_cost_delivery: amount("delivery_cost_delivery"), delivery_cost_return: amount("delivery_cost_return"), setup_cost: amount("setup_cost"), dismantle_cost: amount("dismantle_cost"), return_location_cost: returnLocation?.cost ?? 0 };
  const cost = Object.values(costs).reduce((sum, value) => sum + value, 0);
  const priced = priceBankTransfer(items, cost, hasBankDiscountPolicy(current.bank_transfer_discount) ? current.bank_transfer_discount.selected : "regular");
  items = priced.items;
  const totals = buildOfferTotals(items, cost);
  const openEndedUnit = normalizeOpenEndedUnit(body.open_ended_unit);
  const minimumDuration = normalizeOpenEndedDuration(body.minimum_duration ?? body.min_months, openEndedUnit);
  if (totals.netAmount <= 0) throw new Error("Auftragssumme muss größer als 0 € sein.");
  // Preserve original terms/coupon evidence unless explicitly editing supported fields.
  return { ...current, ...costs, items, totals, deposit: amount("deposit"), return_location: returnLocation?.key ?? null,
    payment_terms: body.payment_terms, payment_terms_custom: body.payment_terms_custom ?? null,
    delivery_requested: body.delivery_requested === true, delivery_address: body.delivery_address ?? null,
    groups: normalizeOfferGroups(body.groups), extra_fields: normalizeExtraFields(body.extra_fields),
    order_type: body.order_type === "delivery" ? "delivery" : "pickup", notes: typeof body.notes === "string" ? body.notes.slice(0,4000) : null,
    open_ended: body.open_ended === true, open_ended_unit: openEndedUnit, minimum_duration: minimumDuration,
    min_months: openEndedUnit === "monate" ? minimumDuration : null,
    use_saturday: body.use_saturday === true, use_sunday: body.use_sunday === true };
}