/** Unverbindliche Beispielrechnung für Maschinenfinanzierung (Annuität mit optionaler Schlussrate). */
export const FINANCING_RATE_PERCENT = 5.5;
export const FINANCING_TERMS = [12, 24, 36, 48, 60] as const;
export const FINANCING_MIN_NET = 10000;

export const financingEligible = (priceNet: number | null | undefined, onRequest = false) =>
  !onRequest && typeof priceNet === "number" && priceNet >= FINANCING_MIN_NET;

const cents = (v: number) => Math.round(v * 100) / 100;

export type FinancingResult = { financed: number; monthly: number; totalPayments: number; interest: number } | null;

/** Monatsrate bei nachschüssiger Zahlung; Schlussrate wird mit der letzten Rate fällig. Null bei ungültigen Eingaben. */
export function calculateFinancing(price: number, downPayment: number, balloon: number, months: number, ratePercent = FINANCING_RATE_PERCENT): FinancingResult {
  if (![price, downPayment, balloon, months].every(Number.isFinite) || price <= 0 || downPayment < 0 || balloon < 0 || months < 1) return null;
  const financed = price - downPayment;
  if (financed <= 0 || balloon >= financed) return null;
  const r = ratePercent / 100 / 12;
  const monthly = r === 0 ? (financed - balloon) / months : (financed - balloon / (1 + r) ** months) * r / (1 - (1 + r) ** -months);
  const m = cents(monthly);
  const totalPayments = cents(m * months + balloon);
  return { financed: cents(financed), monthly: m, totalPayments, interest: cents(totalPayments - financed) };
}

export function parseEuro(input: string): number {
  const v = input.trim().replace(/\s|€/g, "").replace(/\./g, "").replace(",", ".");
  return v === "" ? 0 : Number(v);
}

/** Lock-Rate für die Preisanzeige: 60 Monate, Anzahlung = USt., keine Schlussrate. */
export function teaserMonthlyRate(priceGross: number, priceNet: number): number | null {
  const vat = cents(priceGross - priceNet);
  return calculateFinancing(priceGross, vat, 0, 60)?.monthly ?? null;
}
