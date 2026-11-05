/** Transfer amount belongs to the document, not a second discount calculation. */
export function documentTransferCents(data: {
  documentType?: string; undatedOffer?: boolean; grossAmount: number; deposit?: number;
  paymentTerms?: string; payments?: { amount: number }[]; bankTransferOffer?: { amountCents: number };
}): number | null {
  const type = data.documentType ?? "offer";
  if (data.undatedOffer || ["credit_note", "order_confirmation"].includes(type)) return null;
  const paid = (data.payments ?? []).reduce((n, p) => n + Math.max(0, Math.round(Number(p.amount) * 100) || 0), 0);
  let cents = Math.round(data.grossAmount * 100);
  if (type === "offer") {
    if (data.bankTransferOffer) cents = data.bankTransferOffer.amountCents;
    else if (data.paymentTerms === "anzahlung_30") cents = Math.round(cents * .3);
    else if (!["net_7", "net_14", "net_30", "net_60", "50_50_14", "custom"].includes(data.paymentTerms ?? "")) cents += Math.round((data.deposit ?? 0) * 100);
    else if (data.paymentTerms === "50_50_14") cents = Math.round(cents * .5);
  }
  const remaining = cents - paid;
  return Number.isSafeInteger(remaining) && remaining > 0 ? remaining : null;
}