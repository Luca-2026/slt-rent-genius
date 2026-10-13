import { describe, expect, it } from "vitest";
import { displayPrice, netToGross } from "@/lib/priceDisplay";

describe("CMS-Nettopreise je Kundengruppe", () => {
  it("Privatkunde sieht brutto inkl. 19 %", () => expect(displayPrice("100", "private")).toBe("119,00 €"));
  it("Geschäftskunde sieht netto", () => expect(displayPrice("100", "business")).toBe("100,00 €"));
  it("rundet auf Cent", () => expect(netToGross(89)).toBe(105.91));
  it("behält „ab“", () => expect(displayPrice("ab 50 €", "private")).toBe("ab 59,50 €"));
  it("Text ohne Zahl bleibt", () => expect(displayPrice("auf Anfrage", "private")).toBe("auf Anfrage"));
});
