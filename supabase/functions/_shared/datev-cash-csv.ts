// DATEV Kassenbuch online – Standard-ASCII-Import (Dok.-Nr. 1002367).
// 13 Spalten, Semikolon, Windows-1252 (wie der DATEV-Kassenexport), CRLF, Kopfzeile immer vollständig.
// Belegtext "Rental" und Auftrags-ID als RechNr entsprechen dem echten DATEV-Kassenexport;
// Kost1 bleibt leer, weil nicht angelegte Kostenstellen den Import abbrechen.
export const DATEV_CASH_HEADER =
  '"Währung";"VorzBetrag";"RechNr";"BelegDatum";"Belegtext";"UStSatz";"BU";"Gegenkonto";"Kost1";"Kost2";"Kostmenge";"Skonto";"Nachricht"';

export interface CashEntry {
  amount: number; // + Einnahme, - Ausgabe
  paymentDate: string; // YYYY-MM-DD
  orderCode?: string | null;
  documentNumber?: string | null;
  customerName?: string | null;
  companyName?: string | null;
  label?: string | null;
  register?: string | null; // krefeld | bonn – getrennte DATEV-Kassen
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
  (String(e.orderCode || e.documentNumber || `KASSE${i + 1}`).replace(/[^A-Za-z0-9$&%*+\-/]/g, "")).slice(0, 36) || `KASSE${i + 1}`;

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
      "Rental",
      "0,00",
      "",
      "",
      "",
      "",
      "",
      "",
      clean([e.label, e.customerName || e.companyName, e.documentNumber].filter(Boolean).join(" "), 120),
    ].join(";"));
  return [DATEV_CASH_HEADER, ...rows].join("\r\n") + "\r\n";
}

// DATEV liest die Datei als Windows-1252; UTF-8 macht aus „Währung“ „WÃ¤hrung“ und der Kopf wird abgelehnt.
const CP1252_EXTRA: Record<string, number> = { "€": 0x80, "‚": 0x82, "„": 0x84, "…": 0x85, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "–": 0x96, "—": 0x97 };
export function encodeWindows1252(text: string): Uint8Array {
  const out: number[] = [];
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (c < 0x80 || (c >= 0xa0 && c <= 0xff)) out.push(c);
    else out.push(CP1252_EXTRA[ch] ?? 0x3f);
  }
  return new Uint8Array(out);
}
