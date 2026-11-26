import { describe, expect, it } from "vitest";
import { literProtocolCharge } from "@/lib/returnCharges";
import { lineTotal, quantityUnitShort, withoutBillingDuration } from "@/components/b2b/inquiries/offerMath";
import { offerPayloadToLines } from "@/components/b2b/inquiries/InquiryDetailPanel";
import { buildOfferTotals, normalizeInquiryOfferItems } from "../../supabase/functions/_shared/inquiry-offer-math";

describe("Angebotspositionen ohne Mietdauer", () => {
  it("speichert 24 Liter × 2,85 € ohne Dauer und Mietzeitraum", () => {
    const [saved] = normalizeInquiryOfferItems([{
      product_name: "Kraftstoff Diesel nachgetankt",
      quantity: 24,
      articles: 24,
      duration: 1,
      unit: "Liter",
      unit_code: "stueck",
      quantity_unit: "liter",
      period_free: true,
      unit_price: 2.85,
      discount_percent: 0,
      rental_start: "2026-11-20",
      rental_end: "2026-11-25",
    }]);
    expect(saved).toMatchObject({ quantity: 24, articles: 24, duration: 1, quantity_unit: "liter", period_free: true, unit_price: 2.85 });
    expect(saved.rental_start).toBeUndefined();
    expect(saved.rental_end).toBeUndefined();
    expect(buildOfferTotals([saved]).netAmount).toBe(68.4);
    expect(quantityUnitShort(saved.quantity_unit)).toBe("Liter");
  });

  it("übernimmt Protokollkraftstoff als Litermenge und erhält 68,37 € centgenau", () => {
    const charge = literProtocolCharge(
      "Kraftstoff Diesel nachgetankt",
      "24 Liter à 2,85 € netto je Liter · Rückgabekosten laut Rückgabeprotokoll",
      81.36,
    )!;
    expect(charge.quantity).toBe(24);
    expect(charge.unit_price).toBe(2.8488);
    expect(charge.description).toBe("Rückgabekosten laut Rückgabeprotokoll");
    const [saved] = normalizeInquiryOfferItems([{
      product_name: "Kraftstoff Diesel nachgetankt",
      description: charge.description,
      quantity: charge.quantity,
      articles: charge.quantity,
      duration: 1,
      unit: "Liter",
      unit_code: "stueck",
      quantity_unit: "liter",
      period_free: true,
      unit_price: charge.unit_price,
      discount_percent: 0,
    }]);
    expect(saved.unit_price).toBe(2.8488);
    expect(buildOfferTotals([saved]).netAmount).toBe(68.37);
  });

  it("öffnet eine gespeicherte Literposition weiterhin ohne Dauer", () => {
    const restored = offerPayloadToLines({ items: [{
      product_name: "Kraftstoff Diesel nachgetankt",
      quantity: 24,
      articles: 24,
      duration: 1,
      unit: "Liter",
      unit_code: "stueck",
      quantity_unit: "liter",
      period_free: true,
      unit_price: 2.85,
    }] })!.items[0];
    expect(restored).toMatchObject({ quantity: 24, duration: 1, unit: "stueck", quantity_unit: "liter", period_free: true });
    expect(withoutBillingDuration(restored)).toBe(true);
    expect(lineTotal(restored)).toBe(68.4);
  });

  it("berechnet Batterien nur über ihre Stückzahl, auch mit früheren Datumsfeldern", () => {
    const [saved] = normalizeInquiryOfferItems([{
      product_name: "Batterien für Warnlampen",
      quantity: 2,
      articles: 2,
      duration: 1,
      unit: "Stk",
      unit_code: "stueck",
      quantity_unit: "stk",
      period_free: true,
      unit_price: 7.5,
      discount_percent: 0,
      rental_start: "2026-11-20",
      rental_end: "2026-11-25",
    }]);
    expect(saved.rental_start).toBeUndefined();
    expect(buildOfferTotals([saved]).netAmount).toBe(15);
  });

  it("verändert zeitraumfreie Personalstunden nicht", () => {
    expect(withoutBillingDuration({ period_free: true, unit: "stunden", quantity_unit: "stk" })).toBe(false);
  });
});
