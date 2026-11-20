import { supabase } from "@/integrations/supabase/client";
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

/* ---------- Server-Entwürfe: für alle Mitarbeitenden sichtbar ---------- */

export interface ServerInquiryDraft {
  data: Record<string, unknown>;
  updatedBy: string;
  updatedByName: string | null;
  updatedAt: string;
}

let cachedName: { uid: string; name: string | null } | null = null;
async function currentStaff() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) return null;
  if (cachedName?.uid !== uid) {
    const { data: p } = await supabase.from("staff_profiles").select("first_name,last_name").eq("user_id", uid).maybeSingle();
    cachedName = { uid, name: p ? `${p.first_name} ${p.last_name}`.trim() : u.user?.email ?? null };
  }
  return cachedName;
}

export async function fetchServerDraft(key: string): Promise<ServerInquiryDraft | null> {
  const { data } = await supabase
    .from("inquiry_doc_drafts")
    .select("data,updated_by,updated_by_name,updated_at")
    .eq("draft_key", key)
    .maybeSingle();
  if (!data) return null;
  return {
    data: (data.data ?? {}) as Record<string, unknown>,
    updatedBy: data.updated_by,
    updatedByName: data.updated_by_name,
    updatedAt: data.updated_at,
  };
}

const draftWrites = new Map<string, Promise<void>>();
function enqueueDraftWrite(key: string, operation: () => Promise<void>): Promise<void> {
  const pending = (draftWrites.get(key) ?? Promise.resolve()).catch(() => undefined).then(operation);
  draftWrites.set(key, pending);
  const cleanup = () => { if (draftWrites.get(key) === pending) draftWrites.delete(key); };
  void pending.then(cleanup, cleanup);
  return pending;
}

export function saveServerDraft(key: string, inquiryType: string, inquiryId: string, data: Record<string, unknown>) {
  return enqueueDraftWrite(key, async () => {
    const me = await currentStaff();
    if (!me) throw new Error("Deine Anmeldung ist abgelaufen. Der gemeinsame Entwurf wurde nicht gespeichert.");
    const { error } = await supabase.from("inquiry_doc_drafts").upsert({
    draft_key: key,
    inquiry_type: inquiryType,
    inquiry_id: inquiryId,
    data: data as never,
    updated_by: me.uid,
    updated_by_name: me.name,
    updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  });
}

export function deleteServerDraft(key: string) {
  return enqueueDraftWrite(key, async () => {
    const { error } = await supabase.from("inquiry_doc_drafts").delete().eq("draft_key", key);
    if (error) throw new Error(error.message);
  });
}

/** Alle offenen Server-Entwürfe einer Anfrage (für Hinweise im Auftrag). */
export async function listServerDraftsForInquiry(inquiryId: string) {
  const { data } = await supabase
    .from("inquiry_doc_drafts")
    .select("draft_key,updated_by_name,updated_at")
    .eq("inquiry_id", inquiryId);
  return data ?? [];
}
