import { expect, it } from "vitest";
import { catalogDeposit } from "../../supabase/functions/_shared/catalog-deposit";
it("zeigt die hinterlegte 8-m-Bühnenkaution von 300 Euro ohne Steueraufschlag", () => {
  expect(catalogDeposit({ deposit_amount: 300 })).toBe(300);
});
it("zeigt die hinterlegte Kaution von 500 Euro für große Bühnen und kleine Bagger", () => {
  expect(catalogDeposit({ deposit_amount: 500 })).toBe(500);
});
it("zeigt die hinterlegte Baggerkaution ab 2,7 t von 1000 Euro", () => {
  expect(catalogDeposit({ deposit_amount: 1000 })).toBe(1000);
});
it("zeigt die hinterlegte Werkzeug-, Elektronik- und Zeltkaution von 150 Euro", () => {
  expect(catalogDeposit({ deposit_amount: 150 })).toBe(150);
});
it("liest das eigene Kautionsfeld vor alten Angaben und erhält explizite Null", () => {
  expect(catalogDeposit({ deposit_amount: 250, specifications: { Kaution: "1.000 €" } })).toBe(250);
  expect(catalogDeposit({ deposit_amount: 0, specifications: { Kaution: "1.000 €" } })).toBe(0);
  expect(catalogDeposit({ deposit_amount: null })).toBeNull();
});
it("liest nur explizite CMS-Kaution, nicht Selbstbeteiligung oder fehlende Angaben", () => {
  expect(catalogDeposit({ rental_notes: ["Kaution 1.000 €", "Selbstbeteiligung 2.500 €"] })).toBe(1000);
  expect(catalogDeposit({ specifications: { Kaution: "0 €" } })).toBe(0);
  expect(catalogDeposit({ specifications: { Kaution: "25,50 €" } })).toBe(25.5);
  expect(catalogDeposit({ rental_notes: ["Selbstbeteiligung 2.500 €"] })).toBeNull();
});