import { catalogDeposit } from "../../supabase/functions/_shared/catalog-deposit";

/** Quotes contain line totals; CMS deposits are per rented item or set, never VAT-converted. */
export function rentalCartDeposit(quantity: number, quotedTotal: number | null | undefined, product?: Parameters<typeof catalogDeposit>[0]): number | null {
  if (!Number.isInteger(quantity) || quantity < 1) return null;
  if (quotedTotal != null) return Number.isFinite(quotedTotal) && quotedTotal >= 0 ? quotedTotal : null;
  const perItem = product ? catalogDeposit(product) : null;
  return perItem === null ? null : Math.round(perItem * quantity * 100) / 100;
}