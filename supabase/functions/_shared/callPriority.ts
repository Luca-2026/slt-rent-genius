/**
 * Priorisierung von Telefonaten (fonio). Reine Logik ohne Laufzeitabhängigkeiten,
 * wird von der Edge Function und vom Frontend (Tests) gemeinsam genutzt.
 * Die KI schlägt eine Priorität vor; feste Regeln heben sie bei Bedarf an.
 */
export type CallPriority = "sofort" | "heute" | "woche" | "info";
export type CallIntent = "rental_inquiry" | "offer_change" | "complaint_damage" | "callback" | "info" | "other";

export const PRIORITY_ORDER: CallPriority[] = ["sofort", "heute", "woche", "info"];
export const PRIORITY_LABEL: Record<CallPriority, string> = {
  sofort: "Sofort", heute: "Heute", woche: "Diese Woche", info: "Info",
};
export const INTENT_LABEL: Record<CallIntent, string> = {
  rental_inquiry: "Mietanfrage", offer_change: "Angebot/Änderung", complaint_damage: "Reklamation/Schaden",
  callback: "Rückruf", info: "Info", other: "Sonstiges",
};

export const priorityRank = (p: CallPriority | null | undefined) =>
  p ? PRIORITY_ORDER.indexOf(p) : PRIORITY_ORDER.length;

const higher = (a: CallPriority, b: CallPriority): CallPriority => (priorityRank(a) <= priorityRank(b) ? a : b);

export interface PriorityInput {
  aiPriority: CallPriority | null;
  intent: CallIntent | null;
  rentalStart: string | null; // YYYY-MM-DD
  callDate: string; // YYYY-MM-DD (Europe/Berlin)
}

export function finalPriority(i: PriorityInput): { priority: CallPriority; ruleReason: string | null } {
  let p: CallPriority = i.aiPriority ?? (i.intent === "info" || i.intent === "other" ? "woche" : "heute");
  let ruleReason: string | null = null;
  if (i.intent === "complaint_damage" && priorityRank(p) > priorityRank("heute")) {
    p = "heute"; ruleReason = "Reklamation/Schaden wird mindestens heute bearbeitet.";
  }
  if ((i.intent === "rental_inquiry" || i.intent === "offer_change" || i.intent === "callback") && priorityRank(p) > priorityRank("heute")) {
    if (i.intent !== "callback" || i.aiPriority === null) { p = higher(p, "heute"); ruleReason ??= "Kundenanliegen mit Umsatzbezug wird heute bearbeitet."; }
  }
  if (i.rentalStart && /^\d{4}-\d{2}-\d{2}$/.test(i.rentalStart)) {
    const days = Math.round((Date.parse(i.rentalStart) - Date.parse(i.callDate)) / 86400000);
    if (days >= 0 && days <= 2 && p !== "sofort") {
      p = "sofort"; ruleReason = "Mietbeginn innerhalb von 48 Stunden.";
    }
  }
  return { priority: p, ruleReason };
}

/** Telefonnummer für Vergleiche: nur Ziffern, ohne Länder-/Verkehrsausscheidungsnummer. */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = String(raw).replace(/\D/g, "");
  if (d.startsWith("0049")) d = d.slice(4);
  else if (d.startsWith("49") && d.length > 10) d = d.slice(2);
  d = d.replace(/^0+/, "");
  return d.length >= 6 ? d : null;
}
