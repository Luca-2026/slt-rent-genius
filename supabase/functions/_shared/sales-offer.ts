/** Sales-only policy shared by editor, PDF and payment entry points. */
export const SALES_PAYMENT_OPTIONS = [
  { value: "vorkasse", label: "Vorkasse – Banküberweisung" },
  { value: "net_7", label: "Rechnung – 7 Tage, Banküberweisung" },
  { value: "net_14", label: "Rechnung – 14 Tage, Banküberweisung" },
  { value: "net_30", label: "Rechnung – 30 Tage, Banküberweisung" },
];
export const onlineOfferPaymentAllowed = (table: string) => table === "rental_inquiries";
export function salesPaymentTerms(kind: unknown, terms: unknown): string {
  return SALES_PAYMENT_OPTIONS.some((o) => o.value === terms) && (kind === "business" || terms === "vorkasse") ? String(terms) : "vorkasse";
}
export function salesPaymentText(terms: string): string {
  const days = terms === "net_7" ? 7 : terms === "net_30" ? 30 : 14;
  return terms === "vorkasse"
    ? "Vorkasse: Der Kaufpreis ist vor Übergabe bzw. Lieferung vollständig per Banküberweisung zu zahlen."
    : `Zahlung innerhalb von ${days} Tagen nach Rechnungsstellung per Banküberweisung.`;
}
export const FINANCING_INFORMATION = "Finanzierung auf Anfrage über eine Partnerbank. SLT ist keine finanzierende Bank. Dieser Hinweis ist rein informativ und weder ein Kreditangebot noch eine Finanzierungszusage. Konditionen und Bewilligung werden ausschließlich von der finanzierenden Bank nach deren Prüfung festgelegt. Die Finanzierung ist nicht Bestandteil dieses Verkaufsangebots und ändert weder Kaufpreis noch Zahlungsbedingungen.";
export type SalesFinancing = { enabled: boolean; note?: string };
export function normalizeSalesFinancing(raw: unknown): SalesFinancing | undefined {
  if (!raw || typeof raw !== "object" || (raw as Record<string, unknown>).enabled !== true) return undefined;
  const note = (raw as Record<string, unknown>).note;
  return { enabled: true, ...(typeof note === "string" && note.trim() ? { note: note.trim().slice(0, 1200) } : {}) };
}
/** No rental calendar, billing duration or insurance basis can survive into a new sales quote. */
export function salesOfferLine<T extends { quantity: number; description?: string; unit?: unknown; duration?: number; addons?: Array<{ basis?: string }> }>(line: T): T {
  const out = { ...line, unit: "stueck", duration: 1 };
  for (const key of ["rental_start", "rental_end", "rental_start_time", "rental_end_time", "delivery_at", "collection_at", "duration_override", "undated_offer", "use_saturday", "use_sunday", "pricing", "price_basis"]) delete (out as Record<string, unknown>)[key];
  out.description = out.description?.replace(/\s*[·]?\s*\d+\s*(?:Artikel|m²|lfm)\s*[×x]\s*\d+\s*(?:Miettage?|Kalendertage?|Arbeitstage?|Wochen?|Monate?)\s*$/i, "").trim();
  out.addons = out.addons?.filter((a) => a.basis !== "full_period");
  return out as T;
}