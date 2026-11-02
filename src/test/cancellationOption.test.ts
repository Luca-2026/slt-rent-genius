import { describe, expect, it } from "vitest";
import { FREE_CANCELLATION_OPTION, cancellationAmount } from "../../supabase/functions/_shared/cancellation-option";
import { ADDITIONAL_SERVICES, calculateServicesSurcharge } from "@/data/additionalServices";

describe("Kostenfreie Stornierung", () => {
  it("verwendet auch im B2B-Portal den festen Satz von 5 %", () => {
    expect(FREE_CANCELLATION_OPTION.price).toBe(5);
    expect(ADDITIONAL_SERVICES.find(service => service.id === "kostenfreie-stornierung")?.pricePercent).toBe(5);
    expect(calculateServicesSurcharge(new Set(["kostenfreie-stornierung"]), 100).total).toBe(5);
  });
  it("rundet 5 % reine Miete auf Cent", () => {
    expect(cancellationAmount(243)).toBe(12.15);
  });
  it("erfindet keinen Betrag ohne Mietpreis", () => {
    expect(cancellationAmount(null)).toBeNull();
  });
});