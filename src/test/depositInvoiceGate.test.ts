import { describe, expect, it } from "vitest";
import { depositBlocksInvoice, paymentsUpToRent } from "@/components/b2b/inquiries/useDepositState";

describe("Rechnung und Kaution", () => {
  it("offene Kaution sperrt den Rechnungsversand", () => {
    expect(depositBlocksInvoice({ loaded: true, settled: false, depositHeld: 269.14, chargeLines: [] })).toBe(true);
  });
  it("ohne Kaution oder nach Abrechnung ist die Rechnung frei", () => {
    expect(depositBlocksInvoice({ loaded: true, settled: false, depositHeld: 0, chargeLines: [] })).toBe(false);
    expect(depositBlocksInvoice({ loaded: true, settled: true, depositHeld: 269.14, chargeLines: [] })).toBe(false);
  });
  it("ohne Angebot zählt eine Zahlung als Miete, nicht als Kaution (Telefonbuchung)", () => {
    // 500 € bar ohne Angebot: keine Kaution, Rechnung bleibt frei
    expect(depositBlocksInvoice({ loaded: true, settled: false, depositHeld: 0, chargeLines: [] })).toBe(false);
  });
  it("Mietrechnung rechnet Zahlungen nur bis zur Miete an (Rest war Kaution)", () => {
    expect(paymentsUpToRent([{ amount: 500, label: "Bar" }], 230.86)).toEqual([{ amount: 230.86, label: "Bar" }]);
  });
});
