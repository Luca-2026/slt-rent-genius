import { describe, expect, it } from "vitest";
import { invoiceServicePeriod } from "@/lib/invoiceServicePeriod";
const rental = { start: "2026-11-06", end: "2026-11-07" };
describe("Leistungszeitraum entspricht Mietzeitraum", () => {
  it("übernimmt Pascals Mietzeitraum auch bei leeren Altentwürfen", () => {
    expect(invoiceServicePeriod({ start: "", end: "" }, undefined, rental, [])).toEqual(rental);
  });
  it("erhält manuell definierte Abweichungen", () => {
    expect(invoiceServicePeriod({ start: "2026-11-05", end: "2026-11-09" }, undefined, rental, [])).toEqual({ start: "2026-11-05", end: "2026-11-09" });
  });
  it("nutzt die vereinbarten Positionsdaten statt veralteter Anfragedaten", () => {
    expect(invoiceServicePeriod(undefined, undefined, rental, [{ rental_start: "2026-11-08", rental_end: "2026-11-10" }, { period_free: true, rental_start: "2020-01-01" }])).toEqual({ start: "2026-11-08", end: "2026-11-10" });
  });
  it("erfindet bei unbefristeter Miete kein Enddatum", () => {
    expect(invoiceServicePeriod(undefined, undefined, { start: "2026-11-06" }, [])).toEqual({ start: "2026-11-06", end: "" });
  });
});