/**
 * Zwischenspeicher für angefangene Angebote/Rechnungen im Anfragen-Bereich.
 *
 * Mitarbeitende verlieren sonst alle Eingaben, sobald der Tab neu geladen oder
 * der Dialog geschlossen wird. Der Entwurf liegt im localStorage, ist pro
 * Anfrage + Dokumentart getrennt und wird nach erfolgreichem Versand gelöscht.
 */

const PREFIX = "slt.inquiry-doc-draft.v1";
/** Entwürfe älter als 14 Tage werden beim Lesen verworfen. */
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export interface InquiryDocDraft {
  savedAt: number;
  [key: string]: unknown;
}

export function inquiryDraftKey(mode: string, inquiryType: string, inquiryId: string) {
  return `${PREFIX}:${mode}:${inquiryType}:${inquiryId}`;
}

export function readInquiryDraft<T extends Record<string, unknown>>(key: string): (T & { savedAt: number }) | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as T & { savedAt?: number };
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed as T & { savedAt: number };
  } catch {
    return null;
  }
}

export function writeInquiryDraft(key: string, data: Record<string, unknown>) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch {
    /* Speicher voll oder gesperrt – Entwurf ist dann nur nicht gesichert. */
  }
}

export function clearInquiryDraft(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignorieren */
  }
}
