// Re-export: die eigentliche Implementierung liegt in `_shared/offer-pdf.ts`,
// damit auch `send-inquiry-offer` dieselbe PDF-Logik nutzen kann
// (Edge Functions dürfen nur aus dem eigenen Ordner oder `_shared/` importieren).
export * from "../_shared/offer-pdf.ts";
