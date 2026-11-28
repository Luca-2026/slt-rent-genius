import { describe, it, expect } from "vitest";
import { shapeVolume, soilResult, dumperTrips, readMachine, recommendExcavators } from "@/lib/excavationCalculator";

const e10z = { id: "bobcat-e10z", name: "1t", data: readMachine({ Betriebsgewicht: "1176 kg", Gesamtbreite: "1100 mm einfahrbar auf 710 mm" }) };
const xe20 = { id: "xcmg-xe20e", name: "2t", data: readMachine({ Betriebsgewicht: "2050kg", Gesamtbreite: "1300 mm einfahrbar auf 990 mm" }) };

describe("Aushubrechner", () => {
  it("40 m² × 30 cm, 20 %, 1,6 t/m³", () => {
    const r = soilResult(shapeVolume({ kind: "area", a: 40, c: 30 }), 1.6, 20);
    expect(r.bank).toBeCloseTo(12); expect(r.loose).toBeCloseTo(14.4); expect(r.tons).toBeCloseTo(19.2); expect(r.extra).toBeCloseTo(2.4);
  });
  it("Graben 20 m × 40 cm × 80 cm = 6,4 m³", () => expect(shapeVolume({ kind: "trench", a: 20, b: 40, c: 80 })).toBeCloseTo(6.4));
  it("Kreis 4 m × 150 cm ≈ 18,85 m³", () => expect(shapeVolume({ kind: "circle", a: 4, c: 150 })).toBeCloseTo(18.85, 2));
  it("Dumper 14,4 m³, 0,3 m³ Mulde, 800 kg, Füllgrad 100 % = 48 Fahrten", () => {
    const t = dumperTrips(14.4, 1.6, 0.3, 800, 1)!;
    expect(t.perTrip).toBeCloseTo(0.3); expect(t.trips).toBe(48);
  });
  it("Nutzlast begrenzt bei großer Mulde", () => {
    const t = dumperTrips(14.4, 1.6, 0.6, 550, 1)!;
    expect(t.limitedBy).toBe("payload"); expect(t.perTrip).toBeCloseTo(0.34375); expect(t.trips).toBe(42);
  });
  it("liest RMD800-Mulde gestrichen und Nutzlast", () => {
    const d = readMachine({ "Max. Tragfähigkeit": "800 kg", "Muldengröße": "305 l / 400 l (gestrichen / gehäuft)" });
    expect(d.struckM3).toBeCloseTo(0.305); expect(d.payloadKg).toBe(800);
  });
  it("85 cm Zufahrt: kleinster Bagger trotzdem empfohlen, mit Kran-Hinweis", () => {
    const p = recommendExcavators([e10z, xe20], { volume: 5, depthM: 0, accessM: 0.85 });
    expect(p.main?.id).toBe("bobcat-e10z"); expect(p.hints[0]).toMatch(/Kran/);
  });
  it("95 cm Zufahrt, große Menge: 1t empfohlen, Hinweis auf größeren Bagger per Kran", () => {
    const big = { id: "b6", name: "6t", data: readMachine({ Betriebsgewicht: "5.700 kg", Transportbreite: "1.900 mm" }) };
    const p = recommendExcavators([e10z, xe20, big], { volume: 150, depthM: 0, accessM: 0.95 });
    expect(p.main?.id).toBe("bobcat-e10z"); expect(p.hints[0]).toMatch(/6t.*Kran/);
  });
  it("20 m² × 1,20 m ohne hinterlegte Grabtiefe: trotzdem Empfehlung", () => {
    const p = recommendExcavators([e10z, xe20], { volume: 24, depthM: 1.2 });
    expect(p.main).toBeDefined();
  });
});
