import { hasBankDiscountPolicy, newBankDiscountPolicy } from "./bank-transfer-discount.ts";
import { SIGN_PRODUCT_SLUG } from "./sign-direct-booking.ts";

/** Production stays off until every internal rental path and payment switch is verified. */
export async function bankDiscountLive(service: { from: (table: string) => any }): Promise<boolean> {
  const { data, error } = await service.from("rental_payment_incentive_settings").select("live_enabled").eq("id", true).maybeSingle();
  return !error && data?.live_enabled === true;
}

/** Public inquiry copy must never promise an inactive or separate checkout's incentive. */
export function publicInquiryBankDiscount(enabled: boolean, items: { product_slug: string }[]) {
  return enabled && items.length > 0 && items.every(item => item.product_slug !== SIGN_PRODUCT_SLUG)
    ? newBankDiscountPolicy()
    : null;
}

/** Only a server-persisted promise survives rollout changes. */
export function inquiryBankDiscountEnabled(enabled: boolean, rawPayload: unknown): boolean {
  const raw = rawPayload && typeof rawPayload === "object" ? rawPayload as Record<string, unknown> : null;
  return enabled || hasBankDiscountPolicy(raw?.bank_transfer_discount);
}