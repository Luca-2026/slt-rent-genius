/** Physical pieces/sets, never the billed rental duration. */
export function protocolItemQuantity(it: Record<string, unknown>): number {
  const unit = String(it.unit_code ?? it.unit ?? "").trim().toLowerCase();
  const isCount = /^(stück|stueck|stk\.?|st\.?|set|sets)$/.test(unit);
  const qty = Number(isCount ? it.quantity ?? it.articles ?? 1 : it.articles ?? it.quantity ?? 1);
  return Number.isFinite(qty) && qty > 0 ? qty : 1;
}