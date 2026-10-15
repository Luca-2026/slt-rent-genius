/**
 * Zusatzkosten bei der Rücknahme (Reinigung, Kraftstoff) und Verrechnung mit der Kaution.
 * Beträge im Protokoll sind BRUTTO; die Rechnung übernimmt sie als Nettoposition (÷ 1,19).
 * Getestet in src/test/returnCharges.test.ts.
 */

/** Literpreise brutto laut Mietbedingungen. */
export const FUEL_PRICES = [
  { value: "diesel", label: "Diesel", pricePerLiter: 2.85 },
  { value: "benzin", label: "Benzin", pricePerLiter: 2.95 },
  { value: "adblue", label: "AdBlue", pricePerLiter: 1.85 },
] as const;
export type FuelType = (typeof FUEL_PRICES)[number]["value"];

/** Reinigung laut AGB ab 50,00 € netto = 59,50 € brutto. */
export const CLEANING_MIN_NET = 50;
export const CLEANING_MIN_GROSS = Math.round(CLEANING_MIN_NET * 1.19 * 100) / 100;

const FUEL_RANK: Record<string, number> = { voll: 4, dreiviertel: 3, halb: 2, viertel: 1, leer: 0 };

/** Reinigung vorschlagen, sobald die Sauberkeit schlechter als „5 = sauber“ ist. */
export function cleaningSuggested(rating: number | null | undefined): boolean {
  return !!rating && rating >= 1 && rating < 5;
}

/** Kraftstoff vorschlagen, wenn der Tank bei Rückgabe niedriger ist als bei Übergabe (ohne Übergabewert: nicht voll). */
export function fuelSuggested(deliveryLevel: string | null | undefined, returnLevel: string | null | undefined): boolean {
  if (!returnLevel || !(returnLevel in FUEL_RANK)) return false;
  const before = deliveryLevel && deliveryLevel in FUEL_RANK ? FUEL_RANK[deliveryLevel] : FUEL_RANK.voll;
  return FUEL_RANK[returnLevel] < before;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Kraftstoffkosten brutto = Liter × Literpreis. */
export function fuelChargeGross(liters: number, pricePerLiter: number): number {
  if (!(liters > 0) || !(pricePerLiter > 0)) return 0;
  return round2(liters * pricePerLiter);
}

export interface DepositSettlement {
  /** Tatsächlich gezahlte Kaution (höchstens vereinbarte Kaution). */
  depositHeld: number;
  /** Mit der Kaution verrechnete Zusatzkosten. */
  offset: number;
  /** Rest der Kaution, der an den Kunden zurückgeht. */
  refund: number;
  /** Zusatzkosten, die die Kaution nicht deckt. */
  uncovered: number;
}

/**
 * Zusatzkosten immer mit gezahlter Kaution verrechnen.
 * Gezahlte Kaution = was über die Rechnung ohne Zusatzkosten hinaus gezahlt wurde, höchstens die vereinbarte Kaution.
 */
export function settleDeposit(p: { deposit: number; amountPaid: number; grossWithoutCharges: number; chargesGross: number }): DepositSettlement {
  const deposit = Math.max(0, p.deposit || 0);
  const surplus = Math.max(0, (p.amountPaid || 0) - Math.max(0, p.grossWithoutCharges || 0));
  const depositHeld = round2(Math.min(deposit, surplus));
  const charges = Math.max(0, p.chargesGross || 0);
  const offset = round2(Math.min(depositHeld, charges));
  return { depositHeld, offset, refund: round2(depositHeld - offset), uncovered: round2(charges - offset) };
}

const eur = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

/** Hinweistext für Rechnung/PDF zur Kautionsverrechnung (leer, wenn nichts zu verrechnen ist). */
export function depositSettlementNote(s: DepositSettlement, chargesGross: number, protocolNumbers: string[] = []): string {
  if (s.offset <= 0) return "";
  const ref = protocolNumbers.length ? ` laut Rückgabeprotokoll ${protocolNumbers.join(", ")}` : "";
  const parts = [
    `Die Zusatzkosten${ref} über ${eur(chargesGross)} brutto werden mit der gezahlten Kaution von ${eur(s.depositHeld)} verrechnet.`,
    s.refund > 0 ? `Die verbleibende Kaution von ${eur(s.refund)} wird erstattet.` : "Die Kaution ist damit vollständig verrechnet.",
    s.uncovered > 0 ? `Der nicht gedeckte Betrag von ${eur(s.uncovered)} ist noch zu zahlen.` : "",
  ];
  return parts.filter(Boolean).join(" ");
}
