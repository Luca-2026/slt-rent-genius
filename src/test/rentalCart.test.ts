import { describe, it, expect } from "vitest";
import { addCartItem, parseCart, CART_LIFETIME_MS, cartExpired, type RentalCartItem } from "@/lib/rentalCart";
import { isTrailerCategory, isTrailerRoute } from "@/lib/rentalBookingMode";
const row: RentalCartItem = { id: "a", product_slug: "bagger", product_name: "Bagger", location: "krefeld", quantity: 1, start_date: "2026-11-03", end_date: "2026-11-05", start_time: "08:00", end_time: "16:00", selected_addons: [], use_saturday: false, use_sunday: false };
describe("15-Minuten-Anfragewarenkorb", () => {
  it("lebt 15 Minuten, bei 14:59 erhalten, bei 15:00 leer", () => {
    const cart = addCartItem(null, row, 0);
    expect(cart.expiresAt).toBe(900000);
    expect(parseCart(JSON.stringify(cart), 899000)?.items).toHaveLength(1);
    expect(parseCart(JSON.stringify(cart), CART_LIFETIME_MS)).toBeNull();
    expect(cartExpired(cart, 900000)).toBe(true);
  });
  it("Hinzufügen und Neuladen verlängern die Frist nicht", () => {
    const cart = addCartItem(null, row, 0);
    const next = addCartItem(parseCart(JSON.stringify(cart), 300000), { ...row, id: "b", end_date: "2026-11-08" }, 300000);
    expect(next.expiresAt).toBe(900000);
    expect(next.items).toHaveLength(2);
    expect(next.items[1].end_date).toBe("2026-11-08");
  });
  it("verwirft beschädigte Daten und beginnt nach Ablauf neu", () => {
    expect(parseCart("broken")).toBeNull();
    const cart = addCartItem(addCartItem(null, row, 0), row, 900000);
    expect(cart.expiresAt).toBe(1800000);
  });
  it("nur echte Anhängerkategorie aktiviert Rentware, nicht Arbeitsbühnen", () => {
    expect(isTrailerCategory("anhaenger")).toBe(true);
    expect(isTrailerCategory("arbeitsbuehnen")).toBe(false);
    expect(isTrailerRoute("/mieten/bonn/anhaenger/kasten-750/")).toBe(true);
    expect(isTrailerRoute("/mieten/bonn/arbeitsbuehnen/anhaengerarbeitsbuehne/")).toBe(false);
  });
});