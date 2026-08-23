import { describe, expect, it } from "vitest";
import { buildOfferTotals, formatEuro, lineTotal } from "@/components/b2b/inquiries/offerMath";
import { canTransition, isOpenInquiry, normalizeInquiryStatus } from "@/lib/inquiryStatus";

describe("offerMath", () => {
  it("rechnet Rabatte pro Position korrekt", () => {
    expect(lineTotal({ quantity: 3, unit_price: 100, discount_percent: 10 })).toBe(270);
  });

  it("addiert Lieferkosten vor der Umsatzsteuer", () => {
    const totals = buildOfferTotals(
      [{ product_name: "A", quantity: 2, unit_price: 50, discount_percent: 0 }],
      50,
    );
    expect(totals.netAmount).toBe(150);
    expect(totals.vatAmount).toBe(28.5);
    expect(totals.grossAmount).toBe(178.5);
  });

  it("rundet zentgenau", () => {
    const totals = buildOfferTotals([{ product_name: "A", quantity: 3, unit_price: 33.33, discount_percent: 7 }]);
    expect(totals.grossAmount).toBe(Math.round(totals.grossAmount * 100) / 100);
  });

  it("formatiert Euro deutsch", () => {
    expect(formatEuro(1234.5).replace(/\u00a0/g, " ")).toBe("1.234,50 €");
  });
});

describe("inquiryStatus", () => {
  it("fällt auf 'new' zurück", () => {
    expect(normalizeInquiryStatus("quatsch")).toBe("new");
  });

  it("erlaubt nur definierte Übergänge", () => {
    expect(canTransition("new", "in_progress")).toBe(true);
    expect(canTransition("done", "accepted")).toBe(false);
    expect(canTransition("new", "new")).toBe(false);
  });

  it("markiert offene Anfragen", () => {
    expect(isOpenInquiry("offer_sent")).toBe(true);
    expect(isOpenInquiry("done")).toBe(false);
  });
});
