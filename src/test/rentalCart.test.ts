import { describe, it, expect } from "vitest";
import { addCartItem, withCartPeriod, parseCart, CART_LIFETIME_MS, cartExpired, cartRemainingSeconds, type RentalCartItem } from "@/lib/rentalCart";
import { isTrailerCategory, isTrailerRoute } from "@/lib/rentalBookingMode";
const row: RentalCartItem = { id: "a", product_slug: "bagger", product_name: "Bagger", location: "krefeld", quantity: 1, start_date: "2026-11-03", end_date: "2026-11-05", start_time: "08:00", end_time: "16:00", selected_addons: [], use_saturday: false, use_sunday: false };
describe("15-Minuten-Anfragewarenkorb", () => {
  it("übernimmt Zeitraum und Nutzung für weitere Artikel, nicht deren Zusatzoptionen", () => {
    const source = { ...row, selected_addons: ["versicherung"], use_sunday: true };
    const next = withCartPeriod(addCartItem(null, source, 0), { ...row, id: "glass", start_date: "", end_date: "", start_time: "", end_time: "" }, 1);
    expect([next.start_date, next.start_time, next.end_date, next.end_time]).toEqual(["2026-11-03", "08:00", "2026-11-05", "16:00"]);
    expect(next.use_sunday).toBe(true);
    expect(next.selected_addons).toEqual([]);
  });
  it("übernimmt keinen abgelaufenen oder am Zielstandort geschlossenen Zeitraum", () => {
    const empty = { ...row, location: "bonn", start_date: "", end_date: "", start_time: "", end_time: "" };
    expect(withCartPeriod(addCartItem(null, row, 0), empty, 900000).start_date).toBe("");
    const saturday = { ...row, start_date: "2026-11-07", start_time: "10:00", end_date: "2026-11-09" };
    expect(withCartPeriod(addCartItem(null, saturday, 0), empty, 1).start_date).toBe("");
  });
  it("lebt 15 Minuten, bei 14:59 erhalten, bei 15:00 leer", () => {
    const cart = addCartItem(null, row, 0);
    expect(cart.expiresAt).toBe(900000);
    expect(parseCart(JSON.stringify(cart), 899000)?.items).toHaveLength(1);
    expect(parseCart(JSON.stringify(cart), CART_LIFETIME_MS)).toBeNull();
    expect(cartExpired(cart, 900000)).toBe(true);
  });
  it("Hinzufügen und Neuladen verlängern die Frist nicht", () => {
    const cart = addCartItem(null, row, 0);
    const next = addCartItem(parseCart(JSON.stringify(cart), 300000), { ...row, id: "b", end_date: "2026-11-09" }, 300000);
    expect(next.expiresAt).toBe(900000);
    expect(next.items).toHaveLength(2);
    expect(next.items[1].end_date).toBe("2026-11-09");
  });
  it("verwirft beschädigte Daten und beginnt nach Ablauf neu", () => {
    expect(parseCart("broken")).toBeNull();
    const cart = addCartItem(addCartItem(null, row, 0), row, 900000);
    expect(cart.expiresAt).toBe(1800000);
  });
  it("Countdown zeigt maximal 15:00 und nach Ablauf null", () => {
    const cart = addCartItem(null, row, 1000);
    expect(cartRemainingSeconds(cart, 0)).toBe(900);
    expect(cartRemainingSeconds(cart, 2000)).toBe(899);
    expect(cartRemainingSeconds(cart, 901000)).toBe(0);
  });
  it("verwirft ungültige Kalendertage und unsichere Bilder", () => {
    const cart = addCartItem(null, row, 0);
    expect(parseCart(JSON.stringify({ ...cart, items: [{ ...row, start_date: "2026-02-30" }] }), 0)).toBeNull();
    expect(parseCart(JSON.stringify({ ...cart, items: [{ ...row, image: "javascript:alert(1)" }] }), 0)).toBeNull();
  });
  it("nur echte Anhängerkategorie aktiviert Rentware, nicht Arbeitsbühnen", () => {
    expect(isTrailerCategory("anhaenger")).toBe(true);
    expect(isTrailerCategory("arbeitsbuehnen")).toBe(false);
    expect(isTrailerRoute("/mieten/bonn/anhaenger/kasten-750/")).toBe(true);
    expect(isTrailerRoute("/mieten/bonn/arbeitsbuehnen/anhaengerarbeitsbuehne/")).toBe(false);
  });
});