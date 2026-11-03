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