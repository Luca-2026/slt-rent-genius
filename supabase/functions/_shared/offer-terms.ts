/**
 * Paket 4: Angebotsbedingungen (Textbaustein "offer_terms").
 * Absätze sind durch Leerzeile getrennt. Absatz 1 gilt immer, alle weiteren
 * Absätze (Einschichtbetrieb usw.) nur, wenn ein Bau-Artikel im Angebot ist.
 */
export interface TermsBlock {
  text_business?: string | null;
  text_private?: string | null;
}

/** Vorbelegung nach Kundenart. */
export function defaultTermsText(block: TermsBlock | null | undefined, customerKind: string | null | undefined): string {
  if (!block) return "";
  return String((customerKind === "business" ? block.text_business : block.text_private) ?? "").trim();
}

/** Zu druckender Text: Absatz 1, Folgeabsätze nur bei Bau-Artikel. */
export function printableTerms(text: string | null | undefined, hasBauItem: boolean): string {
  const paras = String(text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!paras.length) return "";
  return (hasBauItem ? paras : paras.slice(0, 1)).join("\n\n");
}
