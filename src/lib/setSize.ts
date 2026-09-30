/**
 * Setgröße aus dem Artikelnamen, z. B. "Weißweinglas Passionata, 25er Set" → 25.
 * Nur was wörtlich im Namen steht – nichts wird geschätzt.
 */
export function parseSetSize(name: string | null | undefined): number | null {
  const n = name ?? "";
  const m = /(\d{1,4})\s*er[\s-]*set/i.exec(n) ?? /set\s*(?:à|a|mit|von)?\s*(\d{1,4})\s*(?:stk|stück)/i.exec(n);
  const v = m ? Number(m[1]) : NaN;
  return Number.isFinite(v) && v > 1 ? v : null;
}

/** "2 Sets (= 50 Stück)" bzw. "3 Stück" */
export function quantityLabel(quantity: number, setSize: number | null): string {
  if (setSize) return `${quantity} ${quantity === 1 ? "Set" : "Sets"} (= ${quantity * setSize} Stück)`;
  return `${quantity} Stück`;
}
