/**
 * Regeln für die Vor-Ort-Unterschrift eines Angebots auf dem Gerät eines Mitarbeiters.
 * Rein, damit unit-testbar.
 */

/** Darf das Angebot vor Ort unterschrieben werden? Nur mit versendetem Angebot und offener Annahme. */
export function canSignOfferOnSite(opts: { offerNumber: string | null | undefined; status: string | null | undefined; alreadyAccepted: boolean }): boolean {
  if (!opts.offerNumber) return false;
  if (opts.alreadyAccepted) return false;
  return opts.status === "offer_sent" || opts.status === "in_progress" || opts.status === "new";
}

/** Anzeigetext des Annahmewegs. */
export function acceptanceChannelLabel(channel: string | null | undefined): string {
  return channel === "onsite" ? "vor Ort unterschrieben" : "online angenommen";
}
