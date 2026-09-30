/** Offene Kundenanfragen aus dem B2B-Portal (Freischaltung, Kreditlimit, Löschung) – eine Regel für Kundenkartei und Startseite. */
export type ActionFilter = "none" | "alle" | "freigabe" | "kreditlimit" | "loeschung";

export interface PortalProfileLite {
  status: string;
  credit_limit_requested_at: string | null;
  deletion_requested_at: string | null;
  created_at?: string | null;
}

export const ACTION_FILTER_OPTIONS: { value: ActionFilter; label: string }[] = [
  { value: "none", label: "Alle Kunden" },
  { value: "alle", label: "Offene Kundenanfragen" },
  { value: "freigabe", label: "Freischaltung offen" },
  { value: "kreditlimit", label: "Kreditlimit angefragt" },
  { value: "loeschung", label: "Löschung beantragt" },
];

export function parseActionFilter(v: string | null): ActionFilter {
  return ACTION_FILTER_OPTIONS.some((o) => o.value === v) ? (v as ActionFilter) : "none";
}

export function needsAction(p: PortalProfileLite, kind: ActionFilter): boolean {
  const freigabe = p.status === "pending";
  // Antrag bleibt offen, bis ein Admin ein Limit vergibt (Speichern setzt credit_limit_requested_at zurück)
  const kredit = !!p.credit_limit_requested_at && p.status !== "rejected";
  const loeschung = !!p.deletion_requested_at;
  switch (kind) {
    case "freigabe": return freigabe;
    case "kreditlimit": return kredit;
    case "loeschung": return loeschung;
    case "alle": return freigabe || kredit || loeschung;
    default: return true;
  }
}

/** Registrierungsdatum: Portal-Registrierung, sonst Anlage in der Kundenkartei. */
export function registrationDate(c: { created_at: string }, p?: { created_at?: string | null } | null): string {
  return (p?.created_at || c.created_at || "");
}
