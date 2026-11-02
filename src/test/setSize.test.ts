import { describe, expect, it } from "vitest";
import { parseSetSize, quantityLabel } from "@/lib/setSize";

describe("Warenkorb-Setmengen", () => {
  it("ein 50er Set enthält 50 Stück, zwei enthalten 100, ohne die Bestellmenge zu multiplizieren", () => {
    const size = parseSetSize("Besteck, 50er Set");
    expect(size).toBe(50);
    expect(quantityLabel(1, size)).toBe("1 Set (= 50 Stück)");
    expect(quantityLabel(2, size)).toBe("2 Sets (= 100 Stück)");
    expect(parseSetSize("Glas ohne Setangabe")).toBeNull();
  });
});