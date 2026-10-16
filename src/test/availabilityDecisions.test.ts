import { describe, it, expect } from "vitest";
import { buildDecisions, orderableLocations, type AvailabilityResult } from "@/lib/availabilityDecisions";

const base: AvailabilityResult = {
  all_available: false, location: "bonn",
  items: [
    { index: 0, product_name: "Minibagger 2t", needed: 1, free: 0, available: false, source: "instances", location: "bonn", from_at: "", to_at: "", other_locations: { krefeld: 1, muelheim: 0 } },
    { index: 1, product_name: "Rüttelplatte", needed: 1, free: 1, available: true, source: "instances", location: "bonn", from_at: "", to_at: "", other_locations: {} },
  ],
};

describe("Verfügbarkeits-Entscheidungen", () => {
  it("nur Standorte mit genug freien Geräten", () => {
    expect(orderableLocations(base.items[0])).toEqual(["krefeld"]);
  });
  it("ohne Entscheidung je Position kein Aufruf", () => {
    expect(buildDecisions(base, {})).toBeNull();
  });
  it("Ordern aus Krefeld mit eingepreisten Kosten", () => {
    expect(buildDecisions(base, { 0: { action: "order_from", source: "krefeld", transport_cost: 80, cost_charged: true } }))
      .toEqual({ mode: "confirm", items: { "0": { action: "order_from", source: "krefeld", transport_cost: 80, cost_charged: true } } });
  });
  it("Einpreisen ohne Betrag wird ignoriert", () => {
    const d = buildDecisions(base, { 0: { action: "order_from", source: "krefeld", transport_cost: null, cost_charged: true } });
    expect(d?.items["0"]).toEqual({ action: "order_from", source: "krefeld", transport_cost: null, cost_charged: false });
  });
  it("Rücksprache und Absage", () => {
    expect(buildDecisions(base, { 0: { action: "pending" } })?.mode).toBe("pending");
    expect(buildDecisions(base, { 0: { action: "reject" } })?.mode).toBe("reject");
  });
});
