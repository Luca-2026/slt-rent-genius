import { describe, expect, it } from "vitest";
import { defaultDayLocation, filterByDayLocation } from "@/lib/dayLocationFilter";

describe("Standortfilter Heute", () => {
  it("nutzt den zugeteilten Standort als Voreinstellung", () => {
    expect(defaultDayLocation("bonn")).toBe("bonn");
    expect(defaultDayLocation("Mülheim an der Ruhr")).toBe("muelheim");
  });
  it("zeigt ohne Zuteilung alle Standorte", () => {
    expect(defaultDayLocation(null)).toBe("all");
    expect(defaultDayLocation("")).toBe("all");
  });
  it("filtert Übergaben nach Standort, auch bei abweichender Schreibweise", () => {
    const rows = [{ id: 1, location: "Bonn" }, { id: 2, location: "krefeld" }, { id: 3, location: "Mülheim" }];
    expect(filterByDayLocation(rows, "bonn").map((r) => r.id)).toEqual([1]);
    expect(filterByDayLocation(rows, "muelheim").map((r) => r.id)).toEqual([3]);
    expect(filterByDayLocation(rows, "all")).toHaveLength(3);
  });
});
