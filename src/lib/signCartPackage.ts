import type { RentalCartItem } from "./rentalCart";
import type { SignBookingConfiguration, SignPackage } from "../../supabase/functions/_shared/sign-direct-booking";
import { signRentalDays, signRentalGrossCents } from "../../supabase/functions/_shared/sign-direct-booking";

export function signCartPackage(items: RentalCartItem[]): SignPackage | null {
  const value = items[0]?.sign_package;
  return value && items.every(item => item.sign_package === value) ? value : null;
}

/** Display estimate only; the server verifies the actual setup address at checkout. */
export function signPackageEstimate(config: SignBookingConfiguration | null, pkg: SignPackage | null, quantity: number, days = 1): number | null {
  const cents = signRentalGrossCents(pkg === "standard" ? config?.standardGrossCents : pkg === "sorglos" ? config?.sorglosGrossCents : null, days, config?.maxRentalDays ?? undefined, pkg === "standard" ? config?.standardRentalTiers : undefined);
  return cents != null && Number.isSafeInteger(cents) && cents > 0 ? cents * quantity / 119 : null;
}

export type SignSetupAddress = { zoneStreet: string; zonePostalCode: string; zoneCity: string };
export function signSetupAddressKey(location: string, address: SignSetupAddress): string {
  return address.zoneStreet.trim().length >= 4 && /^\d{5}$/.test(address.zonePostalCode.trim()) && address.zoneCity.trim().length >= 2
    ? `${location}|${address.zoneStreet.trim()}|${address.zonePostalCode.trim()}|${address.zoneCity.trim()}` : "";
}
export function signCartRentalNet(config: SignBookingConfiguration | null, item: RentalCartItem): number | null {
  const days = signRentalDays(item.start_date, item.end_date);
  if (item.sign_package !== "sorglos") return signPackageEstimate(config, item.sign_package ?? null, item.quantity, days);
  const key = signSetupAddressKey(item.location, { zoneStreet: item.sign_zone_street ?? "", zonePostalCode: item.sign_zone_postal_code ?? "", zoneCity: item.sign_zone_city ?? "" });
  return key && key === item.sign_setup_quote_key && Number.isSafeInteger(item.sign_setup_gross_cents) && (item.sign_setup_gross_cents ?? 0) > 0
    ? (() => { const cents = signRentalGrossCents(item.sign_setup_gross_cents, days, config?.maxRentalDays ?? undefined); return cents == null ? null : cents * item.quantity / 119; })() : null;
}
/** Keeps the stored Sorglos price in sync with the live route quote; null when nothing changes. */
export function signSetupQuotePatch(item: RentalCartItem | null, quote: { key: string; cents: number | null }): Pick<RentalCartItem, "sign_setup_quote_key" | "sign_setup_gross_cents"> | null {
  if (item?.sign_package !== "sorglos") return null;
  const next = { sign_setup_quote_key: quote.cents != null && quote.key ? quote.key : undefined, sign_setup_gross_cents: quote.cents != null && quote.key ? quote.cents : undefined };
  return item.sign_setup_quote_key === next.sign_setup_quote_key && item.sign_setup_gross_cents === next.sign_setup_gross_cents ? null : next;
}
