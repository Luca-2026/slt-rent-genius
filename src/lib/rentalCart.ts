export const CART_STORAGE_KEY = "slt.rental-cart.v1";
export const CART_LIFETIME_MS = 15 * 60 * 1000;
export interface RentalCartItem {
  id: string; product_slug: string; product_name: string; image?: string;
  location: string; quantity: number; start_date: string; start_time: string;
  end_date: string; end_time: string; selected_addons: string[];
  use_saturday: boolean; use_sunday: boolean;
}
export interface RentalCart { version: 1; expiresAt: number; requestId: string; items: RentalCartItem[] }
export function cartExpired(cart: RentalCart | null, now = Date.now()) { return !!cart && cart.expiresAt <= now; }
export function addCartItem(cart: RentalCart | null, item: RentalCartItem, now = Date.now()): RentalCart {
  const existing = cart && !cartExpired(cart, now) ? cart : null;
  return { version: 1, expiresAt: existing?.expiresAt ?? now + CART_LIFETIME_MS, requestId: existing?.requestId ?? crypto.randomUUID(), items: [...(existing?.items.filter(row => row.id !== item.id) ?? []), item] };
}
export function parseCart(raw: string | null, now = Date.now()): RentalCart | null {
  try {
    const cart = raw ? JSON.parse(raw) : null;
    if (cart?.version !== 1 || !Number.isFinite(cart.expiresAt) || cart.expiresAt <= now || typeof cart.requestId !== "string" || !Array.isArray(cart.items) || cart.items.length > 30) return null;
    if (!cart.items.every((row: RentalCartItem) => typeof row.id === "string" && typeof row.product_slug === "string" && typeof row.product_name === "string" && ["krefeld", "bonn", "muelheim"].includes(row.location) && Number.isInteger(row.quantity) && row.quantity >= 1 && row.quantity <= 9999 && typeof row.start_date === "string" && typeof row.end_date === "string" && typeof row.start_time === "string" && typeof row.end_time === "string" && Array.isArray(row.selected_addons) && row.selected_addons.every(key => typeof key === "string"))) return null;
    return cart;
  } catch { return null; }
}