/** Stable CRM association; never resolve a dossier from a transcribed name. */
export function customerDossierPath(customerId: string): string {
  return `/b2b/kundendaten?kunde=${encodeURIComponent(customerId)}&aktion=ansehen`;
}

export function customerDossierUrl(customerId: string): string {
  return `https://app.slt-rental.de${customerDossierPath(customerId)}`;
}

/** Only preserve the customer dossier destination, never an arbitrary redirect. */
export function customerDossierReturnPath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/b2b/kundendaten?")) return null;
  try {
    const url = new URL(value, "https://app.slt-rental.de");
    const id = url.searchParams.get("kunde");
    if (url.origin !== "https://app.slt-rental.de" || url.pathname !== "/b2b/kundendaten" || !id || url.searchParams.get("aktion") !== "ansehen") return null;
    return customerDossierPath(id);
  } catch { return null; }
}