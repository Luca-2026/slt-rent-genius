import { describe, expect, it } from "vitest";
import { calculatePower, pickCables } from "@/lib/powerCalculator";

describe("Baustromrechner", () => {
  it("rechnet kW mit cos φ 0,8 in kVA und Ampere um", () => {
    const r = calculatePower({ consumers: [{ kw: 4, qty: 4 }], gridConnection: true, distanceM: 10 })!;
    expect(r.totalKw).toBe(16);
    expect(r.kva).toBe(20);
    expect(r.ampere).toBe(28.9);
    expect(r.distributor?.slug).toBe("endverteilerschrank-22kva-ev32");
    expect(r.cables).toEqual([{ slug: "cee-kabel-32a-10m", qty: 1 }]);
    expect(r.generator).toBeNull();
  });
  it("wählt bei über 22 kVA den 44-kVA-Verteiler mit 63-A-Zuleitung", () => {
    const r = calculatePower({ consumers: [{ kw: 20, qty: 1 }], gridConnection: true, distanceM: 15 })!;
    expect(r.distributor?.slug).toBe("endverteilerschrank-44kva-ev63");
    expect(r.cables).toEqual([{ slug: "cee-kabel-63a-20m", qty: 1 }]);
  });
  it("kombiniert Kabel bei langen Wegen", () => {
    expect(pickCables(63, 45)).toEqual([{ slug: "cee-kabel-63a-20m", qty: 2 }, { slug: "cee-kabel-63a-5m", qty: 1 }]);
  });
  it("kombiniert nur am Standort verfügbare Längen", () => {
    const bonn = new Set(["cee-kabel-63a-3m", "cee-kabel-63a-5m"]);
    expect(pickCables(63, 12, (s) => bonn.has(s))).toEqual([{ slug: "cee-kabel-63a-5m", qty: 2 }, { slug: "cee-kabel-63a-3m", qty: 1 }]);
  });
  it("empfiehlt ohne Netzanschluss das kleinste ausreichende Aggregat nach Dauerleistung", () => {
    const r = calculatePower({ consumers: [{ kw: 15.2, qty: 1 }], gridConnection: false, distanceM: 5 })!;
    expect(r.kva).toBe(19);
    expect(r.generator?.slug).toBe("aggregat-20kva");
    const big = calculatePower({ consumers: [{ kw: 16, qty: 1 }], gridConnection: false, distanceM: 5 })!;
    expect(big.generator?.slug).toBe("aggregat-50kva");
  });
  it("meldet Zuleitung über 63 A und Überlast als auf Anfrage", () => {
    const r = calculatePower({ consumers: [{ kw: 60, qty: 1 }], gridConnection: true, distanceM: 5 })!;
    expect(r.distributor?.slug).toBe("hauptverteilerschrank-86kva-hv125");
    expect(r.feedOnRequest).toBe(true);
    expect(calculatePower({ consumers: [{ kw: 200, qty: 1 }], gridConnection: true, distanceM: 5 })!.overCapacity).toBe(true);
  });
  it("ignoriert leere Eingaben", () => {
    expect(calculatePower({ consumers: [{ kw: 0, qty: 1 }], gridConnection: true, distanceM: 5 })).toBeNull();
  });
});

import { consumerPowerKw } from "@/lib/powerCalculator";
describe("consumerPowerKw", () => {
  it("liest elektrische Leistung aus CMS-Angaben", () => {
    expect(consumerPowerKw({ Leistung: "1.100 W" })).toBe(1.1);
    expect(consumerPowerKw({ Leistungsaufnahme: "2 kW" })).toBe(2);
    expect(consumerPowerKw({ "Motorleistung (brutto)": "35,5 kW (48 PS)", Motorleistung: "35,5 kW (48 PS)" })).toBeNull();
    expect(consumerPowerKw({ Motorleistung: "35,5 kW", Tankinhalt: "58 l" })).toBeNull();
    expect(consumerPowerKw({ Spannung: "230 V" })).toBeNull();
  });
});
