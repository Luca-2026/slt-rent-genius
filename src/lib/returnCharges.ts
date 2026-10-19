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

/** Reinigung: 20,00 € netto je angefangene 15 Minuten Aufwand = 23,80 € brutto. */
export const CLEANING_UNIT_MINUTES = 15;
export const CLEANING_UNIT_NET = 20;
export const CLEANING_UNIT_GROSS = Math.round(CLEANING_UNIT_NET * 1.19 * 100) / 100;

/** Reinigungskosten brutto = Anzahl 15-Minuten-Einheiten × 47,60 €. */
export function cleaningChargeGross(units: number): number {
  if (!(units > 0)) return 0;
  return Math.round(units * CLEANING_UNIT_GROSS * 100) / 100;
}

/** Aufwand in Minuten als lesbarer Text, z. B. „30 Min“. */
export const cleaningMinutesLabel = (units: number) => `${Math.round(units * CLEANING_UNIT_MINUTES)} Min`;

const FUEL_RANK: Record<string, number> = { voll: 4, dreiviertel: 3, halb: 2, viertel: 1, leer: 0 };

/** Verschmutzt gilt ein Gerät ab Stufe 2 der 5-Stufen-Skala (1 = sauber). */
export function cleaningSuggested(rating: number | null | undefined): boolean {
  return !!rating && rating >= 2 && rating <= 5;
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

/** Art eines Rückgabepostens anhand der Bezeichnung (Einheit wird nicht gespeichert). */
export function chargeUnitKind(label: string): "time" | "liter" | null {
  if (/reinigung/i.test(label)) return "time";
  if (/kraftstoff|diesel|benzin|adblue|nachgetankt|betankung/i.test(label)) return "liter";
  return null;
}

const de2 = (n: number) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const deQty = (n: number) => n.toLocaleString("de-DE", { maximumFractionDigits: 2 });

/**
 * Mengenangabe für Rechnung/Abrechnung: Reinigung in 15-Minuten-Einheiten,
 * Kraftstoff in Litern – jeweils mit Nettopreis je Einheit. Sonst null.
 */
export function chargeQuantityText(label: string, quantity: number, unitPriceGross: number): string | null {
  const kind = chargeUnitKind(label);
  if (!kind || !(quantity > 0)) return null;
  const net = round2(unitPriceGross / 1.19);
  if (kind === "time") {
    return `${deQty(quantity)} × ${CLEANING_UNIT_MINUTES} Min = ${cleaningMinutesLabel(quantity)} à ${de2(net)} € netto je ${CLEANING_UNIT_MINUTES} Min`;
  }
  return `${deQty(quantity)} Liter à ${de2(net)} € netto je Liter`;
}

export interface ChargeMeasure { quantity: number; unit: "liter" | "15min"; unit_price: number }

/**
 * Echte Menge und Einheit einer Rückgabeposition für die Rechnung (Liter bzw. 15-Min-Einheiten).
 * Einzelpreis netto = Netto-Summe ÷ Menge (bis 4 Nachkommastellen), damit Menge × Preis = Summe bleibt.
 */
export function chargeMeasure(label: string, quantity: number, netTotal: number): ChargeMeasure | undefined {
  const kind = chargeUnitKind(label);
  if (!kind || !(quantity > 0) || !(netTotal > 0)) return undefined;
  return { quantity: round2(quantity), unit: kind === "time" ? "15min" : "liter", unit_price: Math.round((netTotal / quantity) * 10000) / 10000 };
}

/** Menge aus einer gespeicherten Mengenangabe lesen („4,5 Liter à …“, „2 × 15 Min …“). */
export function quantityFromText(text: string | null | undefined): number {
  const m = String(text ?? "").match(/^\s*([\d.,]+)\s*(?:Liter|×)/);
  if (!m) return 0;
  const n = Number(m[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
