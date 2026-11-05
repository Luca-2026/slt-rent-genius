/** Reconcile only this link's persisted provider attempt; unknown outcomes never release a claim. */
export async function reconcileRentalCheckout(service: any, stripe: any, link: any): Promise<void> {
  let sessionId = link.stripe_session_id;
  if (!sessionId && link.checkout_claim) {
    if (!link.checkout_request) throw new Error("Zahlungsversuch benötigt manuelle Prüfung.");
    if (!link.checkout_claimed_at || Date.parse(link.checkout_claimed_at) < Date.now() - 23 * 3600000) throw new Error("Alter Zahlungsversuch benötigt manuelle Prüfung.");
    const replay = await stripe.checkout.sessions.create(link.checkout_request, { idempotencyKey: `rental-checkout-${link.id}-${link.checkout_claim}` });
    const { data, error } = await service.from("offer_payment_links").update({ stripe_session_id: replay.id, amount_cents: Number(link.checkout_request.metadata?.amount_cents) }).eq("id", link.id).eq("checkout_claim", link.checkout_claim).select("id");
    if (error || !data?.length) throw new Error("Zahlungsversuch wurde inzwischen geändert.");
    sessionId = replay.id;
    link.stripe_session_id = sessionId;
  }
  if (!sessionId) return;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  let terminal: "expired" | "booked";
  if (session.status === "complete" || session.payment_status === "paid") terminal = "booked";
  else {
    if (session.status === "open") {
      const expired = await stripe.checkout.sessions.expire(sessionId);
      if (expired.status !== "expired") throw new Error("Online-Zahlung konnte nicht sicher beendet werden.");
    } else if (session.status !== "expired") throw new Error("Online-Zahlung benötigt weitere Prüfung.");
    terminal = "expired";
  }
  const { data, error } = await service.rpc("release_terminal_rental_checkout", { _link: link.id, _session: sessionId, _claim: link.checkout_claim ?? null, _terminal: terminal });
  if (error || data !== true) throw new Error(error?.message ?? "Zahlungsversuch wurde inzwischen geändert.");
  link.stripe_session_id = null; link.checkout_claim = null; link.checkout_request = null; link.checkout_claimed_at = null;
}