/** Unverified customer request, never an applied or redeemed coupon. */
export function requestedCoupon(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const code = (payload as Record<string, unknown>).requested_coupon_code;
  return typeof code === "string" && /^[a-f0-9]{20}$/i.test(code.trim()) ? code.trim().toUpperCase() : "";
}