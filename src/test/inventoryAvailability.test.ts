import { describe, expect, it } from "vitest";
import {
  availableCount,
  badgeText,
  evaluateLine,
  locationLabel,
  normalizeLocation,
  toIsoDate,
  type InventoryResult,
} from "@/lib/inventoryAvailability";

const res = (stock: number | null, booked = 0): InventoryResult => ({
  stock,
  stockSource: stock === null ? "none" : "cms",
  booked,
  conflicts: [],
});

describe("inventoryAvailability", () => {
  it("normalisiert Standortnamen", () => {
    expect(normalizeLocation("Mülheim an der Ruhr")).toBe("muelheim");
    expect(normalizeLocation("Bonn")).toBe("bonn");
    expect(normalizeLocation("KREFELD")).toBe("krefeld");
    expect(normalizeLocation("")).toBeNull();
    expect(locationLabel("muelheim")).toBe("Mülheim an der Ruhr");
  });

  it("meldet nichts, wenn genug frei ist", () => {
    expect(evaluateLine("2t Minibagger", 1, "bonn", res(2, 1))).toBeNull();
  });

  it("erkennt Überbuchung", () => {
    const issue = evaluateLine("2t Minibagger", 2, "bonn", res(2, 1));
    expect(issue?.severity).toBe("over");
    expect(issue?.available).toBe(1);
    expect(issue?.message).toContain("Bonn");
  });

  it("warnt, wenn kein Bestand gepflegt ist", () => {
    const issue = evaluateLine("Rüttelplatte", 1, "krefeld", res(null));
    expect(issue?.severity).toBe("unknown");
    expect(issue?.available).toBeNull();
  });

  it("meldet auch Bestand 0", () => {
    const issue = evaluateLine("Stromerzeuger", 1, "bonn", res(0));
    expect(issue?.severity).toBe("over");
    expect(issue?.available).toBe(0);
  });

  it("berechnet freie Menge und Badge-Text", () => {
    expect(availableCount(res(3, 1))).toBe(2);
    expect(availableCount(res(null))).toBeNull();
    expect(badgeText(res(3, 1), 1, "bonn")).toBe("2 von 3 frei in Bonn");
    expect(badgeText(res(1, 1), 1, "bonn")).toContain("Überbucht");
    expect(badgeText(res(null), 1, "bonn")).toContain("Kein Bestand gepflegt");
  });

  it("liest Datumsangaben robust", () => {
    expect(toIsoDate("2026-09-22T10:00:00Z")).toBe("2026-09-22");
    expect(toIsoDate("morgen")).toBeNull();
    expect(toIsoDate(null)).toBeNull();
  });
});
