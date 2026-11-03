import type { SignRentalTier } from "../../../supabase/functions/_shared/sign-direct-booking";
import { displayPrice } from "@/lib/priceDisplay";

export function SignRentalTariff({ tiers, customerType = "private" }: { tiers: SignRentalTier[]; customerType?: "private" | "business" }) {
  return <span className="block space-y-1">{tiers.map((tier, index) => {
    const next = tiers[index + 1];
    return <span key={tier.fromDays} className="block">{next ? `${tier.fromDays}–${next.fromDays - 1} Tage` : `Ab ${tier.fromDays} Tagen`}: {displayPrice(tier.grossCents / 119, customerType)}{tier.extraDayGrossCents > 0 ? ` + ${displayPrice(tier.extraDayGrossCents / 119, customerType)} je Tag über ${tier.fromDays}` : ""} je Set.</span>;
  })}</span>;
}