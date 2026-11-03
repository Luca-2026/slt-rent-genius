import { describe, expect, it } from "vitest";
import { buildDatevCashCsv, DATEV_CASH_HEADER } from "../../supabase/functions/_shared/datev-cash-csv";

const lines = (csv: string) => csv.trim().split("\r\n");

describe("DATEV-Kassen-CSV", () => {
  it("Kopfzeile ist immer vorhanden, auch ohne Buchungen", () => {
    expect(lines(buildDatevCashCsv([]))).toEqual([DATEV_CASH_HEADER]);
  });
  it("jede Zeile hat 13 Spalten (12 Semikolons)", () => {
    const csv = buildDatevCashCsv([{ amount: 120.5, paymentDate: "2026-11-03", orderCode: "#AB12CD", customerName: "Max; Muster" }]);
    expect(lines(csv)[1].split(";")).toHaveLength(13);
  });
  it("Kost1 = Auftrags-ID, Belegtext „Rental, Name“, USt 0", () => {
    const row = lines(buildDatevCashCsv([{ amount: 120.5, paymentDate: "2026-11-03", orderCode: "#AB12CD", customerName: "Max Muster" }]))[1].split(";");
    expect(row[8]).toBe("AB12CD");
    expect(row[4]).toBe("Rental, Max Muster");
    expect(row[5]).toBe("0,00");
  });
  it("Betrag mit Vorzeichen und Komma, Datum TTMM", () => {
    const row = lines(buildDatevCashCsv([{ amount: -1234.5, paymentDate: "2026-07-18", orderCode: "X1" }]))[1].split(";");
    expect(row[1]).toBe("-1234,50");
    expect(row[3]).toBe("1807");
  });
});
