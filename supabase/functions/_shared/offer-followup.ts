export const OFFER_FOLLOWUP_INTERVAL_MS = 48 * 60 * 60 * 1000;
export const DECLINE_REASONS = { price: "Preis zu hoch", no_need: "Nicht mehr benötigt", dates: "Termin passt nicht", other: "Sonstiger Grund" } as const;
export function followupSequence(dispatchedAt: string | null, lastSentAt: string | null, deadline: string | null, now = new Date()): number | null {
  if (!dispatchedAt || !deadline) return null;
  const sent = Date.parse(lastSentAt ?? dispatchedAt);
  const end = Date.parse(deadline);
  if (!Number.isFinite(sent) || !Number.isFinite(end) || now.getTime() >= end || now.getTime() - sent < OFFER_FOLLOWUP_INTERVAL_MS) return null;
  return Math.floor((now.getTime() - Date.parse(dispatchedAt)) / OFFER_FOLLOWUP_INTERVAL_MS);
}
export const escapeOfferText = (value: unknown) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");