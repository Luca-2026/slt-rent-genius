import { describe, expect, it } from "vitest";
import { calculatePrice } from "@/data/lieferkosten";
import { priceFor } from "@/lib/priceDisplay";
import { tariffNet, type TariffKey } from "../../supabase/functions/_shared/delivery-tariffs";

describe("Bisherige Lieferpreis-Zahlen sind netto, nicht durch 1,19 geteilt", () => {
  const expected: Record<TariffKey, number[]> = {
    A: [50, 80, 100, 130, 135, 155, 180, 180, 200, 220],
    B: [75, 95, 115, 145, 150, 175, 200, 200, 225, 245],
    C: [95, 105, 130, 160, 170, 195, 220, 225, 250, 275],
  };
  for (const key of ["A", "B", "C"] as const) {
    expected[key].forEach((net, index) => {
      it(`${key} bis ${(index + 1) * 5} km: ${net} netto`, () => {
        const km = (index + 1) * 5;
        expect(tariffNet(key, km)).toEqual({ net, band: km });
        expect(calculatePrice({ tarif: key, km }).total).toBe(net);
        expect(priceFor(net, "business")).toBe(net);
        expect(priceFor(net, "private")).toBe(Math.round(net * 1.19 * 100) / 100);
      });
    });
  }
  it("Express 50 bleibt 50 netto; Wochenendaufschlag multipliziert Netto", () => {
    const q = calculatePrice({ tarif: "A", km: 5, express: true, wochenende: true });
    expect(q.expressAufschlag).toBe(50);
    expect(q.total).toBe(125);
    expect(priceFor(q.total, "private")).toBe(148.75);
  });
  it("Gerüst-Aufschläge 8, 75 und 15 bleiben netto", () => {
    const q = calculatePrice({ tarif: "A", km: 5, arbeitshoeheMeter: 5, aufbauService: true });
    expect(q.geruestHoehenAufschlag).toBe(8);
    expect(q.geruestAufbau).toBe(150);
    expect(q.total).toBe(208);
  });
  it("Möbel-Aufschläge 2, 75, 10 und 75 bleiben netto", () => {
    const q = calculatePrice({ tarif: "A", km: 5, moebelAnzahl: 5, moebelAufbauService: true, moebelAufbauStueck: 2, moebelAufbauZelte: 1 });
    expect(q.moebelAufschlag).toBe(10);
    expect(q.moebelAufbau).toBe(170);
    expect(q.total).toBe(230);
  });
});