// DATEV Kassenbuch online – Standard-ASCII-Import (Dok.-Nr. 1002367).
// 13 Spalten, Semikolon, UTF-8, Kopfzeile immer vollständig.
export const DATEV_CASH_HEADER =
  '"Währung";"VorxBetrag";"RechNr";"BelegDatum";"Belegtext";"UStSatz";"BU";"Gegenkonto";"Kost1";"Kost2";"Kostmenge";"Skonto";"Nachricht"';

export interface CashEntry {
  amount: number; // + Einnahme, - Ausgabe
  paymentDate: string; // YYYY-MM-DD
  orderCode?: string | null;
  documentNumber?: string | null;
  customerName?: string | null;
  companyName?: string | null;
  label?: string | null;
}

// Felder dürfen kein Semikolon, Anführungszeichen oder Zeilenumbruch enthalten.
const clean = (s: unknown, max: number) =>
  String(s ?? "").replace(/[;"\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

export const datevAmount = (n: number) => {
  const cents = Math.round(Math.abs(n) * 100);
  return `${n < 0 ? "-" : "+"}${Math.floor(cents / 100)},${String(cents % 100).padStart(2, "0")}`;
};

export const datevDate = (iso: string) => `${iso.slice(8, 10)}${iso.slice(5, 7)}`;

// RechNr: max. 36, alphanumerisch plus $ & % * + - /
export const datevRechNr = (e: CashEntry, i: number) =>
  (String(e.documentNumber || e.orderCode || `KASSE${i + 1}`).replace(/[^A-Za-z0-9$&%*+\-/]/g, "")).slice(0, 36) || `KASSE${i + 1}`;

export const datevKost1 = (code?: string | null) => clean(String(code ?? "").replace(/^#/, ""), 36);

export const customerLabel = (e: CashEntry) => clean(e.customerName || e.companyName || "Unbekannt", 60);

export function buildDatevCashCsv(entries: CashEntry[]): string {
  const rows = entries
    .filter((e) => Math.round(Math.abs(e.amount) * 100) > 0)
    .map((e, i) => [
      "EUR",
      datevAmount(e.amount),
      datevRechNr(e, i),
      datevDate(e.paymentDate),
      clean(`Rental, ${customerLabel(e)}`, 60),
      "0,00",
      "",
      "",
      datevKost1(e.orderCode),
      "",
      "",
      "",
      clean(e.label, 120),
    ].join(";"));
  return [DATEV_CASH_HEADER, ...rows].join("\r\n") + "\r\n";
}
