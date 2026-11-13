import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { priorityRank, type CallIntent, type CallPriority } from "@/lib/callPriority";

export interface CallDetails {
  rental_end?: string | null;
  items?: { name: string; quantity: number | null; note: string | null }[];
  address?: { street: string | null; postal_code: string | null; city: string | null };
  delivery?: { wanted: boolean | null; address: string | null; note: string | null };
  callback_time?: string | null;
  callback_phone?: string | null;
}

export interface PhoneCall {
  id: string;
  external_id: string;
  caller_phone: string | null;
  caller_name: string | null;
  call_started_at: string | null;
  duration_seconds: number | null;
  recording_url: string | null;
  transcript: string | null;
  provider_summary: string | null;
  summary: string | null;
  intent: CallIntent | null;
  priority: CallPriority | null;
  priority_reason: string | null;
  location: string | null;
  assistant: "krefeld" | "bonn" | null;
  customer_name: string | null;
  company_name: string | null;
  email: string | null;
  mentioned_items: string[];
  open_points: string[];
  rental_start: string | null;
  crm_customer_id: string | null;
  rental_inquiry_id: string | null;
  analysis_status: "pending" | "done" | "failed";
  analysis_error: string | null;
  status: "open" | "in_progress" | "done";
  assigned_to: string | null;
  notes: string | null;
  priority_overridden: boolean;
  details: CallDetails | null;
  created_at: string;
}

/** Sortierung: offene vor erledigten, dann Priorität, dann neueste zuerst. */
export function sortCalls(rows: PhoneCall[]): PhoneCall[] {
  const st = { open: 0, in_progress: 1, done: 2 } as const;
  return [...rows].sort((a, b) =>
    (st[a.status] - st[b.status]) || (priorityRank(a.priority) - priorityRank(b.priority)) ||
    (b.call_started_at ?? b.created_at).localeCompare(a.call_started_at ?? a.created_at));
}

export const isUrgentCall = (c: Pick<PhoneCall, "status" | "priority">) =>
  c.status !== "done" && (c.priority === "sofort" || c.priority === "heute");

/** Listen-Spalten ohne Transkript (wird erst in der Detailansicht geladen). */
const LIST_COLUMNS = "id,external_id,caller_phone,caller_name,call_started_at,duration_seconds,recording_url,provider_summary,summary,intent,priority,priority_reason,location,assistant,customer_name,company_name,email,mentioned_items,open_points,rental_start,crm_customer_id,rental_inquiry_id,analysis_status,analysis_error,status,assigned_to,notes,priority_overridden,details,created_at";
/** Erledigte Anrufe: nur die neuesten; offene/in Bearbeitung immer vollständig. */
export const DONE_CALLS_LIMIT = 100;
export const FALLBACK_REFRESH_MS = 5 * 60 * 1000;

// Eine gemeinsame Quelle für alle Ansichten (Navigation, Startseite, Anrufliste).
let shared: PhoneCall[] = [];
let loaded = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function fetchAll() {
  if (inflight) return inflight;
  inflight = (async () => {
    const [openRes, doneRes] = await Promise.all([
      supabase.from("phone_calls" as never).select(LIST_COLUMNS).neq("status", "done").order("created_at", { ascending: false }).limit(500),
      supabase.from("phone_calls" as never).select(LIST_COLUMNS).eq("status", "done").order("created_at", { ascending: false }).limit(DONE_CALLS_LIMIT),
    ]);
    if (!openRes.error && !doneRes.error) {
      shared = sortCalls([...(openRes.data ?? []), ...(doneRes.data ?? [])] as unknown as PhoneCall[]);
      loaded = true;
      emit();
    }
  })().finally(() => { inflight = null; });
  return inflight;
}

async function fetchOne(id: string) {
  const { data, error } = await supabase.from("phone_calls" as never).select(LIST_COLUMNS).eq("id", id).maybeSingle();
  if (error) return fetchAll();
  const rest = shared.filter((r) => r.id !== id);
  shared = sortCalls(data ? [data as unknown as PhoneCall, ...rest] : rest);
  emit();
}

let channel: ReturnType<typeof supabase.channel> | null = null;
let iv: number | null = null;
const onVis = () => { if (document.visibilityState === "visible") void fetchAll(); };
function start() {
  channel = supabase.channel(`phone-calls-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "phone_calls" }, (payload) => {
      const id = ((payload.new as { id?: string }) ?? {}).id ?? ((payload.old as { id?: string }) ?? {}).id;
      if (payload.eventType === "DELETE" && id) { shared = shared.filter((r) => r.id !== id); emit(); }
      else if (id) void fetchOne(id);
      else void fetchAll();
    })
    .subscribe();
  // Rückfall, falls die Live-Verbindung abreißt (z. B. Handy im Standby)
  iv = window.setInterval(onVis, FALLBACK_REFRESH_MS);
  document.addEventListener("visibilitychange", onVis);
}
function stop() {
  if (channel) supabase.removeChannel(channel);
  channel = null;
  if (iv != null) window.clearInterval(iv);
  iv = null;
  document.removeEventListener("visibilitychange", onVis);
  shared = []; loaded = false;
}

export function usePhoneCalls() {
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const [rows, setRows] = useState<PhoneCall[]>(shared);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    if (accessLoading || !isStaff) { setRows([]); return; }
    const l = () => { setRows(shared); setReady(loaded); };
    listeners.add(l);
    if (listeners.size === 1) start();
    if (!loaded) void fetchAll(); else l();
    return () => { listeners.delete(l); if (listeners.size === 0) stop(); };
  }, [accessLoading, isStaff]);

  const reload = useCallback(() => fetchAll(), []);
  const loading = accessLoading || (isStaff && !ready);
  return { rows, loading, reload };
}

/** Transkript eines einzelnen Anrufs bei Bedarf laden. */
export function usePhoneCallTranscript(id: string | null) {
  const [transcript, setTranscript] = useState<string | null>(null);
  useEffect(() => {
    setTranscript(null);
    if (!id) return;
    let alive = true;
    supabase.from("phone_calls" as never).select("transcript").eq("id", id).maybeSingle()
      .then(({ data }) => { if (alive) setTranscript(((data as { transcript?: string | null } | null)?.transcript) ?? null); });
    return () => { alive = false; };
  }, [id]);
  return transcript;
}
