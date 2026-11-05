import { it, expect } from "vitest";
import { addCartItem, parseCart, cartQuoteItems, withCartPeriod, type RentalCartItem } from "@/lib/rentalCart";

it("retains Sunday night signs after reload and includes them in the price quote", () => {
  const row: RentalCartItem = { id: "sign", product_slug: "halteverbotsschilder-set", product_name: "Schilder", sign_package: "standard", location: "bonn", quantity: 1, start_date: "2026-11-08", end_date: "2026-11-09", start_time: "00:00", end_time: "23:59", selected_addons: [], use_saturday: false, use_sunday: false };
  const cart = addCartItem(null, row);
  expect(parseCart(JSON.stringify(cart))?.items[0]).toEqual(row);
  expect(cartQuoteItems([], row)).toEqual([row]);
  const other = { ...row, id: "machine", product_slug: "minibagger", sign_package: undefined, start_date: "", end_date: "", start_time: "", end_time: "" };
  expect(withCartPeriod(cart, other).start_date).toBe("");
});