import { validPublicRentalPeriod } from "../../supabase/functions/_shared/public-rental-period";
export const CART_STORAGE_KEY = "slt.rental-cart.v1";
export const CART_LIFETIME_MS = 15 * 60 * 1000;
export interface RentalCartItem {
  id: string; product_slug: string; product_name: string; image?: string;
  location: string; quantity: number; start_date: string; start_time: string;
  end_date: string; end_time: string; selected_addons: string[];
  use_saturday: boolean; use_sunday: boolean;
  sign_permit_mode?: "existing" | "slt";
  sign_package?: "standard" | "sorglos";
  sign_zone_street?: string; sign_zone_postal_code?: string; sign_zone_city?: string;
  sign_setup_quote_key?: string; sign_setup_gross_cents?: number;
}
export interface RentalCart { version: 1; expiresAt: number; requestId: string; items: RentalCartItem[] }
/** Include the current draft and every accessory once in the live estimate. */
export function cartQuoteItems(items: RentalCartItem[], edit: RentalCartItem | null): RentalCartItem[] {
  if (!edit) return items;
  const others = items.filter(item => item.id !== edit.id);
  return validPublicRentalPeriod(edit) ? [edit, ...others] : others;
}
export function cartQuoteTotal(lines: { rental_net: number | null; addons: { amount: number | null }[] }[]): number {
  return Math.round(lines.reduce((sum, line) => sum + (line.rental_net ?? 0) + line.addons.reduce((total, addon) => total + (addon.amount ?? 0), 0), 0) * 100) / 100;
}
export function cartCategoryPath(items: RentalCartItem[]): string {
  const location = items[0]?.location;
  return location && ["krefeld", "bonn", "muelheim"].includes(location) ? `/mieten/${location}/` : "/mieten/";
}
export function pickupConfirmationRequired(deliveryRequested: boolean, pickupConfirmed: boolean): boolean {
  return !deliveryRequested && !pickupConfirmed;
}
export function cartExpired(cart: RentalCart | null, now = Date.now()) { return !!cart && cart.expiresAt <= now; }
export function cartRemainingSeconds(cart: RentalCart | null, now = Date.now()) { return Math.min(900, Math.max(0, Math.ceil(((cart?.expiresAt ?? now) - now) / 1000))); }
/** Prefer the latest period at this pickup location; never copy article-specific extras. */
export function withCartPeriod(cart: RentalCart | null, item: RentalCartItem, now = Date.now()): RentalCartItem {
  if (!cart || cartExpired(cart, now)) return item;
  const candidates = [...cart.items].reverse();
  const source = candidates.find(row => row.location === item.location) ?? candidates[0];
  if (!source) return item;
  const next = { ...item, start_date: source.start_date, start_time: source.start_time, end_date: source.end_date, end_time: source.end_time, use_saturday: source.use_saturday, use_sunday: source.use_sunday };
  return validPublicRentalPeriod(next) ? next : item;
}
export function addCartItem(cart: RentalCart | null, item: RentalCartItem, now = Date.now()): RentalCart {
  const existing = cart && !cartExpired(cart, now) ? cart : null;
  return { version: 1, expiresAt: existing?.expiresAt ?? now + CART_LIFETIME_MS, requestId: existing?.requestId ?? crypto.randomUUID(), items: [...(existing?.items.filter(row => row.id !== item.id) ?? []), item] };
}
export function parseCart(raw: string | null, now = Date.now()): RentalCart | null {
  try {
    const cart = raw ? JSON.parse(raw) : null;
    if (cart?.version !== 1 || !Number.isFinite(cart.expiresAt) || cart.expiresAt <= now || cart.expiresAt > now + CART_LIFETIME_MS || typeof cart.requestId !== "string" || !/^[a-f0-9-]{36}$/i.test(cart.requestId) || !Array.isArray(cart.items) || !cart.items.length || cart.items.length > 30) return null;
    if (!cart.items.every((row: RentalCartItem) => typeof row.id === "string" && typeof row.product_slug === "string" && typeof row.product_name === "string" && ["krefeld", "bonn", "muelheim"].includes(row.location) && Number.isInteger(row.quantity) && row.quantity >= 1 && row.quantity <= 9999 && typeof row.start_date === "string" && typeof row.end_date === "string" && typeof row.start_time === "string" && typeof row.end_time === "string" && Array.isArray(row.selected_addons) && row.selected_addons.every(key => typeof key === "string"))) return null;
    if (!cart.items.every((row: RentalCartItem) => validPublicRentalPeriod(row) && typeof row.use_saturday === "boolean" && typeof row.use_sunday === "boolean" && row.selected_addons.length <= 10 && row.product_name.length <= 200 && row.product_slug.length <= 200 && (!row.image || typeof row.image === "string" && row.image.length <= 2000 && /^(\/|https:\/\/)/.test(row.image)))) return null;
    if (new Set(cart.items.map((row: RentalCartItem) => row.id)).size !== cart.items.length) return null;
    if (!cart.items.every((row: RentalCartItem) => row.sign_package === undefined || row.sign_package === "standard" || row.sign_package === "sorglos")) return null;
    return cart;
  } catch { return null; }
}