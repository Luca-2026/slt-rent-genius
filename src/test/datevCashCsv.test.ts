import { describe, expect, it } from "vitest";
import { buildDatevCashCsv, DATEV_CASH_HEADER, encodeWindows1252 } from "../../supabase/functions/_shared/datev-cash-csv";

const lines = (csv: string) => csv.trim().split("\r\n");

describe("DATEV-Kassen-CSV", () => {
  it("verwendet exakt den Headersatz aus DATEV-Dokument 1002367, Kapitel 2.1.1", () => {
    expect(lines(buildDatevCashCsv([]))[0].split(";").map((field) => field.replace(/"/g, ""))).toEqual([
      "Währung", "VorzBetrag", "RechNr", "BelegDatum", "Belegtext", "UStSatz", "BU", "Gegenkonto", "Kost1", "Kost2", "Kostmenge", "Skonto", "Nachricht",
    ]);
  });
  it("Kopfzeile ist immer vorhanden, auch ohne Buchungen", () => {
    expect(lines(buildDatevCashCsv([]))).toEqual([DATEV_CASH_HEADER]);
  });
  it("jede Zeile hat 13 Spalten (12 Semikolons)", () => {
    const csv = buildDatevCashCsv([{ amount: 120.5, paymentDate: "2026-11-03", orderCode: "#AB12CD", customerName: "Max; Muster" }]);
    expect(lines(csv)[1].split(";")).toHaveLength(13);
  });
  it("ordnet die Auftrags-ID Kost1 zu und behält sie zusätzlich als RechNr", () => {
    const row = lines(buildDatevCashCsv([{ amount: 120.5, paymentDate: "2026-11-03", orderCode: "#AB12CD", documentNumber: "RE-M-2026-11-0001", customerName: "Max Muster" }]))[1].split(";");
    expect(row[2]).toBe("AB12CD");
    expect(row[4]).toBe("Rental");
    expect(row[5]).toBe("0,00");
    expect(row[8]).toBe("AB12CD");
  });
  it("ordnet auch Barauszahlungen ihrer Auftrags-ID in Kost1 zu", () => {
    const row = lines(buildDatevCashCsv([{ amount: -76.2, paymentDate: "2026-11-09", orderCode: "7KQY76" }]))[1].split(";");
    expect(row[8]).toBe("7KQY76");
    expect(row[2]).toBe("7KQY76");
    expect(row[1]).toBe("-76,20");
  });
  it("erfindet ohne Auftrags-ID keine Kostenstelle aus einer Belegnummer", () => {
    const row = lines(buildDatevCashCsv([{ amount: 119, paymentDate: "2026-11-09", documentNumber: "RE-M-2026-11-0009" }]))[1].split(";");
    expect(row[8]).toBe("");
    expect(row[2]).toBe("RE-M-2026-11-0009");
  });
  it("Datei ist Windows-1252 kodiert (ä = 0xE4)", () => {
    const bytes = encodeWindows1252(DATEV_CASH_HEADER);
    expect(bytes[2]).toBe(0xe4);
    expect(bytes.length).toBe(DATEV_CASH_HEADER.length);
  });
  it("Betrag mit Vorzeichen und Komma, Datum TTMM", () => {
    const row = lines(buildDatevCashCsv([{ amount: -1234.5, paymentDate: "2026-07-18", orderCode: "X1" }]))[1].split(";");
    expect(row[1]).toBe("-1234,50");
    expect(row[3]).toBe("1807");
  });
});
