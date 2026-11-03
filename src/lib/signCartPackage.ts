import type { RentalCartItem } from "./rentalCart";
import type { SignBookingConfiguration, SignPackage } from "../../supabase/functions/_shared/sign-direct-booking";

export function signCartPackage(items: RentalCartItem[]): SignPackage | null {
  const value = items[0]?.sign_package;
  return value && items.every(item => item.sign_package === value) ? value : null;
}

/** Display estimate only; the server verifies the actual setup address at checkout. */
export function signPackageEstimate(config: SignBookingConfiguration | null, pkg: SignPackage | null, quantity: number): number | null {
  const cents = pkg === "standard" ? config?.standardGrossCents : pkg === "sorglos" ? config?.sorglosGrossCents : null;
  return cents != null && Number.isSafeInteger(cents) && cents > 0 ? cents * quantity / 119 : null;
}

export type SignSetupAddress = { zoneStreet: string; zonePostalCode: string; zoneCity: string };
export function signSetupAddressKey(location: string, address: SignSetupAddress): string {
  return address.zoneStreet.trim().length >= 4 && /^\d{5}$/.test(address.zonePostalCode.trim()) && address.zoneCity.trim().length >= 2
    ? `${location}|${address.zoneStreet.trim()}|${address.zonePostalCode.trim()}|${address.zoneCity.trim()}` : "";
}
export function signCartRentalNet(config: SignBookingConfiguration | null, item: RentalCartItem): number | null {
  if (item.sign_package !== "sorglos") return signPackageEstimate(config, item.sign_package ?? null, item.quantity);
  const key = signSetupAddressKey(item.location, { zoneStreet: item.sign_zone_street ?? "", zonePostalCode: item.sign_zone_postal_code ?? "", zoneCity: item.sign_zone_city ?? "" });
  return key && key === item.sign_setup_quote_key && Number.isSafeInteger(item.sign_setup_gross_cents) && (item.sign_setup_gross_cents ?? 0) > 0
    ? (item.sign_setup_gross_cents ?? 0) * item.quantity / 119 : null;
}