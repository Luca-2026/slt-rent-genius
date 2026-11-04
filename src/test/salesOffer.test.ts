import { describe, expect, it } from "vitest";
import { normalizeSalesFinancing, onlineOfferPaymentAllowed, salesOfferLine, salesPaymentTerms } from "../../supabase/functions/_shared/sales-offer";
import { buildOfferTotals, normalizeInquiryOfferItems } from "../../supabase/functions/_shared/inquiry-offer-math";

describe("sales offer rules", () => {
  it("charges two articles once, never ten rental days", () => {
    const line = salesOfferLine({ product_name: "Testgerät", quantity: 2, duration: 10, unit: "miettage", unit_price: 1000, discount_percent: 0, rental_start: "2026-11-04", rental_end: "2026-11-14" });
    const items = normalizeInquiryOfferItems([{ ...line, articles: line.quantity, unit_code: "stueck" }]);
    expect(items[0].duration).toBe(1);
    expect(items[0].rental_start).toBeUndefined();
    expect(buildOfferTotals(items).netAmount).toBe(2000);
  });
  it("allows online payment for rentals only", () => {
    expect(onlineOfferPaymentAllowed("sales_inquiries")).toBe(false);
    expect(onlineOfferPaymentAllowed("rental_inquiries")).toBe(true);
  });
  it("only offers bank prepayment or invoice, not rental downpayment or custom sale payment", () => {
    expect(salesPaymentTerms("business", "anzahlung_30")).toBe("vorkasse");
    expect(salesPaymentTerms("business", "custom")).toBe("vorkasse");
    expect(salesPaymentTerms("business", "net_30")).toBe("net_30");
  });
  it("never offers invoice payment to private customers", () => {
    expect(salesPaymentTerms("private", "net_14")).toBe("vorkasse");
  });
  it("includes financing only after explicit selection, with no change to the price", () => {
    expect(normalizeSalesFinancing({ enabled: false, note: "Kundenwunsch" })).toBeUndefined();
    expect(normalizeSalesFinancing({ enabled: true, note: "  36 Monate angefragt  " })).toEqual({ enabled: true, note: "36 Monate angefragt" });
  });
});