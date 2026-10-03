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
  it("ohne Kategorie oder Rabatt unverändert", () => {
    const item = { discount_percent: 0 };
    expect(applyCategoryDiscount(item, undefined, d)).toBe(item);
    expect(applyCategoryDiscount(item, "bagger", d)).toBe(item);
  });
});
