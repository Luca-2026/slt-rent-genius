/**
 * Entwurfsspeicher für die CMS-Editoren (Mietartikel, Verkaufsartikel).
 *
 * Mobile Browser und Tablets verwerfen Hintergrund-Tabs oder laden sie neu –
 * ungespeicherte Eingaben im Editor wären sonst weg. Der Entwurf liegt gerätebezogen
 * im localStorage (je Editor + Artikel getrennt) und wird beim Speichern bzw.
 * bewussten Verwerfen gelöscht. Nur Formularfelder, keine Einkaufspreise.
 */
import { clearInquiryDraft, readInquiryDraft, writeInquiryDraft } from "@/components/b2b/inquiries/offerDraftStorage";

const PREFIX = "slt.cms-draft.v1";

export type CmsEditorKind = "inventory" | "sales-new" | "sales-used";

export function cmsDraftKey(editor: CmsEditorKind, id: string) {
  return `${PREFIX}:${editor}:${id}`;
}

export function readCmsDraft<T>(key: string): { form: T; savedAt: number } | null {
  const d = readInquiryDraft<{ form?: T }>(key);
  if (!d || !d.form || typeof d.form !== "object") return null;
  return { form: d.form as T, savedAt: d.savedAt };
}

export function writeCmsDraft<T>(key: string, form: T) {
  writeInquiryDraft(key, { form });
}

export const clearCmsDraft = clearInquiryDraft;
