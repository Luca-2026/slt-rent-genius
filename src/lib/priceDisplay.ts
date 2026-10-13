/**
 * Preisanzeige je Kundengruppe (getestet: src/test/priceDisplay.test.ts).
 * Alle Mietpreise im CMS sind NETTO. Privatkunden sehen brutto (inkl. 19 % USt.),
 * Geschäftskunden netto (zzgl. 19 % USt.). Es gibt keine weitere Umrechnungsstelle.
 */
import { parsePriceValue } from "@/lib/catalogPricing";

export type CustomerType = "private" | "business";
export const RENTAL_VAT = 0.19;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const netToGross = (net: number) => round2(net * (1 + RENTAL_VAT));

/** Netto-Zahl für die gewählte Kundengruppe. */
export function priceFor(net: number, type: CustomerType): number {
  return type === "business" ? round2(net) : netToGross(net);
}

export function formatEuro(n: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);
}

/**
 * CMS-Preistext (z. B. "89", "89 €", "ab 89,00 €") → angezeigter Preis.
 * Ein vorangestelltes „ab" bleibt erhalten; Text ohne Zahl bleibt unverändert.
 */
export function displayPrice(raw: string | number | null | undefined, type: CustomerType): string {
  if (raw == null || raw === "") return "";
  const net = typeof raw === "number" ? raw : parsePriceValue(raw);
  if (net === undefined || !Number.isFinite(net) || net <= 0) return String(raw);
  const from = typeof raw === "string" && /^\s*ab\b/i.test(raw) ? "ab " : "";
  return `${from}${formatEuro(priceFor(net, type))}`;
}

export const vatNote = (type: CustomerType) => (type === "business" ? "netto zzgl. 19 % USt." : "brutto inkl. 19 % USt.");
export const customerTypeLabel = (type: CustomerType) => (type === "business" ? "Geschäftskunde" : "Privatkunde");
