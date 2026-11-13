import { describe, expect, it } from "vitest";
import { validFuelLevel, measurementRows, parseProtocolMeasurements } from "../../supabase/functions/_shared/protocolMeasurements";
import { emptyExtraCharge, extraChargeTotal, serializeExtraCharges } from "@/components/b2b/protocols/protocolShared";
import { RECHARGE_NET } from "@/lib/returnCharges";
import { FUEL_PRICES } from "@/lib/returnCharges";
import { cleaningCharge, fuelCharge, templateCharge } from "@/components/b2b/protocols/ExtraChargesStep";
import { EXTRA_CHARGE_TEMPLATES } from "@/components/b2b/protocols/protocolShared";

describe("Individuelle Füllstände und Netto-Zusatzkosten", () => {
  it("Reinigungsvorschlag: 20 netto je 15 Min, unverändert 23,80 brutto", () => {
    const c = cleaningCharge();
    expect(c.priceBasis).toBe("net");
    expect(c.unitPrice).toBe("20,00");
    expect(extraChargeTotal(c)).toBe(23.8);
  });
  it.each(FUEL_PRICES)("$label: Netto-Literpreis erhält den bestehenden Bruttotarif", (fuel) => {
    const c = { ...fuelCharge(fuel), quantity: "100" };
    expect(c.priceBasis).toBe("net");
    expect(serializeExtraCharges([c])[0].unit_price).toBe(fuel.pricePerLiter);
    expect(extraChargeTotal(c)).toBe(fuel.pricePerLiter * 100);
  });
  it.each(EXTRA_CHARGE_TEMPLATES)("$label: Vorlagenpreis wird netto gerechnet", (tpl) => {
    const c = templateCharge({ ...tpl, unitPrice: "20" });
    expect(c.priceBasis).toBe("net");
    expect(extraChargeTotal(c)).toBe(23.8);
  });
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
  it("Netto-Einzelpreise werden bei mehreren Stück nicht vorzeitig auf Bruttocents gerundet", () => {
    const c = { ...emptyExtraCharge("Kleinteil"), quantity: "3", unitPrice: "0,03", priceBasis: "net" as const };
    const saved = serializeExtraCharges([c])[0];
    const gross = Math.round(saved.quantity * saved.unit_price * 100) / 100;
    expect(Math.round(gross / 1.19 * 100) / 100).toBe(0.09);
  });
});