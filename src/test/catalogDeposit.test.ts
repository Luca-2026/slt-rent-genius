import { expect, it } from "vitest";
import { catalogDeposit } from "../../supabase/functions/_shared/catalog-deposit";
it("liest nur explizite CMS-Kaution, nicht Selbstbeteiligung oder fehlende Angaben", () => {
  expect(catalogDeposit({ rental_notes: ["Kaution 1.000 €", "Selbstbeteiligung 2.500 €"] })).toBe(1000);
  expect(catalogDeposit({ specifications: { Kaution: "0 €" } })).toBe(0);
  expect(catalogDeposit({ specifications: { Kaution: "25,50 €" } })).toBe(25.5);
  expect(catalogDeposit({ rental_notes: ["Selbstbeteiligung 2.500 €"] })).toBeNull();
});