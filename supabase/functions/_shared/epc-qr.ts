/**
 * Überweisungs-QR-Code (EPC-QR / GiroCode, EPC069-12 Version 002) – reine Logik, getestet
 * (src/test/epcQr.test.ts). Wird von Zahlungsseite und Rechnungs-PDFs genutzt.
 * Regeln: Betrag centgenau, nur 0,01–999.999.999,99 EUR; Verwendungszweck = Belegnummer.
 */
export interface EpcInput {
  name: string;
  iban: string;
  bic?: string;
  amountCents: number;
  reference: string;
}

const clean = (s: string, max: number) => s.replace(/[\r\n]+/g, " ").trim().slice(0, max);

/** Liefert den Text für den QR-Code oder null, wenn kein gültiger Betrag vorliegt. */
export function buildEpcPayload(input: EpcInput): string | null {
  const cents = Math.round(Number(input.amountCents));
  if (!Number.isFinite(cents) || cents < 1 || cents > 99_999_999_999) return null;
  const iban = input.iban.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return null;
  const amount = `EUR${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
  return [
    "BCD",
    "002",
    "1",
    "SCT",
    (input.bic ?? "").replace(/\s+/g, "").toUpperCase(),
    clean(input.name, 70),
    iban,
    amount,
    "",
    "",
    clean(input.reference, 140),
  ].join("\n");
}
