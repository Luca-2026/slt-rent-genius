/** Only rental offers need a reminder; invoices and sales are unaffected. */
export function needsOfferDepositWarning(deposit: unknown, isRentalOffer = true): boolean {
  if (!isRentalOffer) return false;
  const amount = Number(deposit);
  return !Number.isFinite(amount) || amount <= 0;
}