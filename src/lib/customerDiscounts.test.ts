import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { applyCategoryDiscount } from "./customerDiscounts";

describe("applyCategoryDiscount", () => {
  const d = { arbeitsbuehnen: 10, anhaenger: 5 };
  it("belegt Rabatt der Kategorie vor", () => {
    expect(applyCategoryDiscount({ discount_percent: 0 }, "anhaenger", d).discount_percent).toBe(5);
  });
  it("lässt manuellen Rabatt stehen", () => {
    expect(applyCategoryDiscount({ discount_percent: 3 }, "anhaenger", d).discount_percent).toBe(3);
  });
  it("übernimmt 20 Prozent Erdbewegung für Bagger und Radlader", () => {
    for (const product_name of ["2t Minibagger", "3t Radlader Kramer 5045"]) {
      expect(applyCategoryDiscount({ product_name, discount_percent: 0 }, "erdbewegung", { erdbewegung: 20 }).discount_percent).toBe(20);
    }
  });
  it("respektiert bewusst auf null gesetzten manuellen Rabatt", () => {
    expect(applyCategoryDiscount({ discount_percent: 0, discount_auto: false }, "erdbewegung", { erdbewegung: 20 }).discount_percent).toBe(0);
  });
  it("ohne Kategorie oder Rabatt unverändert", () => {
    const item = { discount_percent: 0 };
    expect(applyCategoryDiscount(item, undefined, d)).toBe(item);
    expect(applyCategoryDiscount(item, "bagger", d)).toBe(item);
  });
});
