import { describe, expect, it } from "vitest";
import { validFuelLevel, measurementRows, parseProtocolMeasurements } from "../../supabase/functions/_shared/protocolMeasurements";
import { emptyExtraCharge, extraChargeTotal, serializeExtraCharges } from "@/components/b2b/protocols/protocolShared";
import { RECHARGE_NET } from "@/lib/returnCharges";

describe("Individuelle Füllstände und Netto-Zusatzkosten", () => {
  it.each(["70%", "70L"])("übernimmt %s unverändert ins Protokoll", (text) => {
    const [row] = parseProtocolMeasurements([{ item_name: "Bagger", fuel_level: `text:${text}` }]);
    expect(validFuelLevel(`text:${text}`)).toBe(true);
    expect(measurementRows(row)).toEqual([{ label: "Tankfüllstand", value: text }]);
  });
  it("leere individuelle Eingaben und HTML sind ungültig", () => {
    expect(validFuelLevel("text:")).toBe(false);
    expect(validFuelLevel("text:<script>")).toBe(false);
  });
  it("freie Position: 70 netto ergibt 83,30 brutto und bleibt auf der Rechnung 70 netto", () => {
    const c = { ...emptyExtraCharge("Freie Position"), unitPrice: "70", priceBasis: "net" as const };
    expect(extraChargeTotal(c)).toBe(83.3);
    expect(serializeExtraCharges([c])[0].unit_price / 1.19).toBe(70);
  });
  it("Nachladung kostet 20 netto und 23,80 brutto", () => {
    expect(RECHARGE_NET).toBe(20);
    expect(extraChargeTotal({ ...emptyExtraCharge("Nachladung"), unitPrice: String(RECHARGE_NET), priceBasis: "net" })).toBe(23.8);
  });
  it("bestehende Brutto-Entwürfe werden nicht nachträglich verteuert", () => {
    expect(extraChargeTotal({ ...emptyExtraCharge("Alt"), unitPrice: "70" })).toBe(70);
  });
});