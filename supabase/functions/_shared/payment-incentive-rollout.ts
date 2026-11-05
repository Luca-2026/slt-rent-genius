/** Production stays off until every internal rental path and payment switch is verified. */
export async function bankDiscountLive(service: { from: (table: string) => any }): Promise<boolean> {
  const { data, error } = await service.from("rental_payment_incentive_settings").select("live_enabled").eq("id", true).maybeSingle();
  return !error && data?.live_enabled === true;
}