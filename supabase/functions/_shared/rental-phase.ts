/** Signature evidence, never the planned date or a historic active flag. */
export function customerSignedReservationIds(
  protocols: readonly { status: string | null; reservation_id: string | null; offer_id?: string | null }[],
  offers: readonly { id: string; reservation_id: string | null }[],
): Set<string> {
  const result = new Set<string>();
  for (const protocol of protocols) {
    if (protocol.status !== "signed") continue;
    const id = protocol.reservation_id ?? offers.find((o) => o.id === protocol.offer_id)?.reservation_id;
    if (id) result.add(id);
  }
  return result;
}

export function isRunningReservation(reservation: { id: string; status: string }, signed: ReadonlySet<string>): boolean {
  return (reservation.status === "confirmed" || reservation.status === "active") && signed.has(reservation.id);
}