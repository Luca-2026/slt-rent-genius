import { describe, it, expect } from "vitest";
import { isStockedAt } from "@/lib/productAvailability";
import { resolveAvailabilityStatus } from "@/data/locationBlocks";

describe("Bestand je Standort (CMS) statt Rentware-Code", () => {
  it("am Standort vorhanden ohne Rentware-Code = vor Ort", () => {
    expect(isStockedAt({ stockedLocations: ["bonn"] }, "bonn")).toBe(true);
    expect(resolveAvailabilityStatus({ stockedLocations: ["bonn"] }, "bonn")).toBe("sofortVorOrt");
  });
  it("auf Anfrage von anderem Standort trotz Rentware-Code", () => {
    const p = { stockedLocations: ["krefeld"], rentwareCode: { bonn: "ABC" } };
    expect(isStockedAt(p, "bonn")).toBe(false);
    expect(resolveAvailabilityStatus(p, "bonn")).toBe("aufAnfrageDispoKrefeld");
  });
  it("ohne CMS-Feld gilt die alte Code-Regel", () => {
    expect(isStockedAt({ rentwareCode: { bonn: "X" } }, "bonn")).toBe(true);
    expect(isStockedAt({ rentwareCode: { bonn: "X" } }, "krefeld")).toBe(false);
    expect(isStockedAt({}, "krefeld")).toBe(true);
  });
});
