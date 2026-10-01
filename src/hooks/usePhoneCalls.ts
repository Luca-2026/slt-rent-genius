import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { priorityRank, type CallIntent, type CallPriority } from "@/lib/callPriority";

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

export function usePhoneCalls() {
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const [rows, setRows] = useState<PhoneCall[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isStaff) { setRows([]); setLoading(false); return; }
    const { data } = await supabase.from("phone_calls" as never).select("*").order("created_at", { ascending: false }).limit(500);
    setRows(sortCalls(((data ?? []) as unknown) as PhoneCall[]));
    setLoading(false);
  }, [isStaff]);

  useEffect(() => { if (!accessLoading) load(); }, [accessLoading, load]);
  useEffect(() => {
    if (!isStaff) return;
    const ch = supabase.channel(`phone-calls-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "phone_calls" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isStaff, load]);

  return { rows, loading: loading || accessLoading, reload: load };
}
