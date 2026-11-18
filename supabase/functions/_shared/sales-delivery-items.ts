import { offerItemText } from "./offer-item-text.ts";
export function salesDeliveryItems(payload: { items?: unknown }) {
  if (!Array.isArray(payload.items)) throw new Error("Bestätigte Verkaufspositionen fehlen.");
  const items = payload.items.filter(i => i && typeof i === "object" && i.optional !== true && i.line_kind !== "service").map(i => {
    const text = offerItemText(i);
    const quantity = Number(i.articles ?? i.quantity);
    if (!text.product_name || !Number.isFinite(quantity) || quantity <= 0) throw new Error("Ungültige Verkaufsposition.");
    return { name: String(text.product_name), description: String(text.description ?? ""), quantity, unit: ["stueck", "stück", ""].includes(String(i.unit ?? "").toLowerCase()) ? "Stück" : String(i.unit) };
  });
  if (!items.length) throw new Error("Keine Verkaufsware im bestätigten Auftrag.");
  return items;
}
/** An issued invoice is sufficient evidence; a missing legacy offer must not block its goods. */
export function salesDeliverySourceItems(offer: { items?: unknown }, invoiceItems?: unknown[]) {
  return salesDeliveryItems(invoiceItems === undefined ? offer : { items: invoiceItems });
}