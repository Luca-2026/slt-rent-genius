import { describe, expect, it } from "vitest";
import { buildInstallmentPositions, offeredInstallmentPositions } from "../../supabase/functions/_shared/installment-positions";

const offer = { items: [
  { product_name: "Generator", name_override: "100-kVA-Generator", description: "vereinbarte Leistung", quantity: 12, articles: 1, duration: 12, unit: "Miettage", unit_price: 200, discount_percent: 10 },
  { product_name: "Kabel", quantity: 2, unit: "Stück", unit_price: 25, discount_percent: 0 },
] };
describe("offered installment positions", () => {
  it("übernimmt angebotene Positionen und Einzelpreise statt einer Pauschalposition", () => {
    expect(offeredInstallmentPositions(offer)).toMatchObject([
      { product_name: "100-kVA-Generator", quantity: 12, unit: "Miettage", unit_price: 200, discount_percent: 10 },
      { product_name: "Kabel", quantity: 2, unit_price: 25 },
    ]);
  });
  it("berechnet den Abschlag aus bearbeiteten Mengen ohne die Angebotsmengen zu ändern", () => {
    const result = buildInstallmentPositions(offer, [{ index: 0, quantity: 5 }, { index: 1, quantity: 1 }]);
    expect(result.totals).toMatchObject({ netAmount: 925, vatAmount: 175.75, grossAmount: 1100.75 });
    expect(offer.items[0].quantity).toBe(12);
  });
  it("ignoriert eingeschleuste Preise und Beschreibungen", () => {
    expect(buildInstallmentPositions(offer, [{ index: 0, quantity: 1, unit_price: 1 }, { index: 1, quantity: 0 }]).totals.netAmount).toBe(180);
  });
  it("erhält Bruchteile ohne Rundung auf ganze Miettage", () => {
    expect(buildInstallmentPositions(offer, [{ index: 0, quantity: 1.25 }, { index: 1, quantity: 0 }]).totals.netAmount).toBe(225);
  });
  it("weist vereinbarte Zusatzleistungen aus, keine optionale Versicherung oder Kaution", () => {
    const payload = { ...offer, deposit: 100, delivery_cost_delivery: 50, items: [{ ...offer.items[0], addons: [{ key: "insurance", label: "Versicherung", amount: 20 }, { key: "optional", label: "Optional", amount: 30, optional: true }] }] };
    expect(offeredInstallmentPositions(payload).map(p => p.unit_price)).toEqual([200, 20, 50]);
  });
  it("berechnet bereits vereinbarten Bankrabatt genau einmal auf die gewählten Mengen", () => {
    const payload = { ...offer, bank_transfer_discount: { version: "bank-transfer-3-v1", rate: 3, selected: "bank" } };
    expect(buildInstallmentPositions(payload, [{ index: 0, quantity: 5 }, { index: 1, quantity: 1 }]).totals.netAmount).toBe(897.25);
  });
  it("lehnt fehlende, doppelte, negative und ungültige Mengen ab", () => {
    for (const decisions of [[], [{ index: 0, quantity: 1 }, { index: 0, quantity: 1 }], [{ index: 0, quantity: -1 }, { index: 1, quantity: 1 }], [{ index: 0, quantity: NaN }, { index: 1, quantity: 1 }], [{ index: 0, quantity: 0 }, { index: 1, quantity: 0 }]]) {
      expect(() => buildInstallmentPositions(offer, decisions)).toThrow();
    }
  });
});