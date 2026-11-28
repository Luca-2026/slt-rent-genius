import { describe, it, expect } from "vitest";
import { commitBundle, addCartItem, type RentalCartItem } from "@/lib/rentalCart";

const row = (slug: string, location = "krefeld", qty = 1): RentalCartItem => ({ id: `${slug}-${location}`, product_slug: slug, product_name: slug, location, quantity: qty, start_date: "", start_time: "", end_date: "", end_time: "", selected_addons: [], use_saturday: false, use_sunday: false });
const weekday = { start_date: "2026-12-08", start_time: "09:00", end_date: "2026-12-10", end_time: "09:00", use_saturday: false, use_sunday: false };
const weekend = { start_date: "2026-12-11", start_time: "16:00", end_date: "2026-12-14", end_time: "09:00", use_saturday: true, use_sunday: false };

describe("Rechner-Paket in den Warenkorb", () => {
  it("übernimmt Bagger und Dumper gemeinsam mit einem Zeitraum in einen leeren Warenkorb", () => {
    const r = commitBundle(null, [row("minibagger-6t"), row("kettendumper", "krefeld", 2)], weekday, 0);
    expect(r.error).toBeUndefined();
    expect(r.cart!.items.map(i => [i.product_slug, i.quantity, i.start_date, i.end_time])).toEqual([["minibagger-6t", 1, "2026-12-08", "09:00"], ["kettendumper", 2, "2026-12-08", "09:00"]]);
  });
  it("übernimmt Wochenendzeitraum inkl. Samstagsoption für alle Positionen", () => {
    const r = commitBundle(null, [row("a"), row("b")], weekend, 0);
    expect(r.cart!.items.every(i => i.use_saturday && i.start_time === "16:00")).toBe(true);
  });
  it("erhält den vorhandenen Warenkorb", () => {
    const existing = addCartItem(null, { ...row("bautrockner"), ...weekday }, 0);
    const r = commitBundle(existing, [row("a"), row("b")], weekday, 0);
    expect(r.cart!.items.map(i => i.product_slug)).toEqual(["bautrockner", "a", "b"]);
    expect(r.cart!.requestId).toBe(existing.requestId);
  });
  it("legt bei erneutem Klick nichts doppelt an", () => {
    const first = commitBundle(null, [row("a"), row("b")], weekday, 0).cart;
    const again = commitBundle(first, [{ ...row("a"), id: "x" }, { ...row("b"), id: "y" }], weekday, 0);
    expect(again.added).toHaveLength(0);
    expect(again.skipped).toHaveLength(2);
    expect(again.cart!.items).toHaveLength(2);
  });
  it("übernimmt nichts, wenn der Zeitraum für eine Position nicht gilt (keine Teilübernahme)", () => {
    const sunday = { ...weekday, start_date: "2026-12-13", end_date: "2026-12-14" };
    const r = commitBundle(null, [row("a"), row("b")], sunday, 0);
    expect(r.error).toMatch(/nichts übernommen/);
    expect(r.cart).toBeNull();
  });
  it("übernimmt nichts, wenn der Warenkorb voll würde", () => {
    let cart = null;
    for (let i = 0; i < 29; i++) cart = addCartItem(cart, { ...row(`p${i}`), id: `p${i}`, ...weekday }, 0);
    const r = commitBundle(cart, [row("a"), row("b")], weekday, 0);
    expect(r.error).toBeDefined();
    expect(r.cart!.items).toHaveLength(29);
  });
});
