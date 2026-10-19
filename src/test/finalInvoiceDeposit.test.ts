import { describe, expect, it } from "vitest";
import {
  depositSummary, depositSummaryNote, inferChargeMeasure, settlementAppliesToNewInvoice, settlementPayments, type SettlementRow,
} from "../../supabase/functions/_shared/final-invoice-deposit";

// Fall Janko Samuel: 500 € bar, Miete 230,86 €, Kaution 269,14 €, Rückgabekosten 32,34 €, Rest 236,80 € bar zurück.
const row: SettlementRow = {
  deposit_held: 269.14, offset_amount: 32.34, balance: 236.8,
  payout_method: "cash", payout_status: "paid", payout_date: "2026-10-19", settled_at: "2026-10-19T13:39:32Z", invoice_id: null,
};

describe("Schlussrechnung nach Kautionsabrechnung", () => {
  it("Barzahlung zählt nur bis zur Miete, dazu „Kaution verrechnet“", () => {
    const p = settlementPayments([{ date: "2026-10-16", amount: 500, label: "Barzahlung", reference: "" }], 500, depositSummary(row), "GNSC9U");
    expect(p.map((x) => x.amount)).toEqual([230.86, 32.34]);
    expect(p[1].label).toBe("Kaution verrechnet");
    expect(p.reduce((s, x) => s + x.amount, 0)).toBeCloseTo(263.2, 2);
  });
  it("bereits richtig aufgeteilte Zahlungen bleiben unverändert", () => {
    const p = settlementPayments(
      [{ date: "2026-10-16", amount: 230.86, label: "Barzahlung", reference: "" }, { date: "2026-10-19", amount: 32.34, label: "Kaution verrechnet", reference: "" }],
      500, depositSummary(row), null,
    );
    expect(p.map((x) => x.amount)).toEqual([230.86, 32.34]);
  });
  it("Hinweis nennt erhaltene, verrechnete und bar erstattete Kaution", () => {
    const note = depositSummaryNote(depositSummary(row));
    expect(note).toContain("Kaution erhalten 269,14 €");
    expect(note).toContain("verrechnet 32,34 €");
    expect(note).toContain("236,80 € bar ausgezahlt am 19.10.2026");
  });
  it("gilt nicht mehr, sobald danach eine gültige Rechnung erstellt wurde; stornierte zählen nicht", () => {
    expect(settlementAppliesToNewInvoice(row, [{ status: "cancelled", invoice_kind: "invoice", created_at: "2026-10-19T14:00:00Z" }])).toBe(true);
    expect(settlementAppliesToNewInvoice(row, [{ status: "paid", invoice_kind: "invoice", created_at: "2026-10-19T14:00:00Z" }])).toBe(false);
  });
});

describe("Einheiten für Rückgabekosten ohne mitgeschickte Einheit", () => {
  it("Diesel 3 Liter: Einheit Liter, Menge × Literpreis = Summe", () => {
    const m = inferChargeMeasure({ product_name: "Kraftstoff Diesel nachgetankt – 1t Minibagger", description: "3 Liter à 2,39 € netto je Liter · laut Rückgabeprotokoll RP-2026-0006", quantity: 1, unit_price: 7.18 })!;
    expect(m.unit).toBe("liter");
    expect(m.quantity).toBe(3);
    expect(Math.round(m.quantity * m.unit_price * 100) / 100).toBe(7.18);
  });
  it("Reinigung 1 × 15 Min à 20 € netto", () => {
    expect(inferChargeMeasure({ product_name: "Reinigung (Mehraufwand laut AGB)", description: "1 × 15 Min = 15 Min à 20,00 € netto je 15 Min", quantity: 1, unit_price: 20 }))
      .toEqual({ quantity: 1, unit: "15min", unit_price: 20 });
  });
  it("Schadensersatz bekommt keine Einheit", () => {
    expect(inferChargeMeasure({ product_name: "Schadensersatz – Reinigung Lack", description: "2 × 15 Min", quantity: 1, unit_price: 40, vat_rate: 0 })).toBeUndefined();
  });
});
