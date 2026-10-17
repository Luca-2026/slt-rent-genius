import { describe, expect, it } from "vitest";
import { depositBlocksInvoice, paymentsUpToRent } from "@/components/b2b/inquiries/useDepositState";

const base = { loaded: true, settled: false, chargeLines: [] };

describe("Rechnung und Kaution", () => {
  it("offene Kaution sperrt erst die Schlussrechnung nach Rückgabe (Protokoll vorhanden)", () => {
    expect(depositBlocksInvoice({ ...base, depositHeld: 269.14, hasProtocol: true })).toBe(true);
  });
  it("während der laufenden Miete bleiben Voraus- und Folgerechnungen versendbar", () => {
    expect(depositBlocksInvoice({ ...base, depositHeld: 269.14, hasProtocol: false })).toBe(false);
  });
  it("ohne Kaution oder nach Abrechnung ist die Rechnung frei", () => {
    expect(depositBlocksInvoice({ ...base, depositHeld: 0, hasProtocol: true })).toBe(false);
    expect(depositBlocksInvoice({ ...base, settled: true, depositHeld: 269.14, hasProtocol: true })).toBe(false);
  });
  it("ohne Angebot zählt eine Zahlung als Miete, nicht als Kaution (Telefonbuchung)", () => {
    // 500 € bar ohne Angebot: keine Kaution, Rechnung bleibt frei
    expect(depositBlocksInvoice({ ...base, depositHeld: 0, hasProtocol: false })).toBe(false);
  });
  it("Mietrechnung rechnet Zahlungen nur bis zur Miete an (Rest war Kaution)", () => {
    expect(paymentsUpToRent([{ amount: 500, label: "Bar" }], 230.86)).toEqual([{ amount: 230.86, label: "Bar" }]);
  });
});
