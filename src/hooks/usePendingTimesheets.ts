import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";

export interface PendingTimesheet {
  id: string;
  user_id: string;
  staff_name: string | null;
  staff_email: string | null;
  year: number;
  month: number;
  status: string;
  total_minutes: number;
  submitted_at: string | null;
  period_start: string | null;
  period_end: string | null;
  approved_at: string | null;
  approved_by_name: string | null;
  payroll_sent_at: string | null;
}

/**
 * Stundenzettel, die auf die Freigabe durch die Geschäftsführung warten.
 * Nur Super-Admins (Luca Sandhoff / Benedikt Nöchel) dürfen freigeben.
 */
export function usePendingTimesheets() {
  const { isSuperAdmin } = useStaffAccess();
  const [pending, setPending] = useState<PendingTimesheet[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSuperAdmin) {
      setPending([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("staff_timesheets")
      .select("*")
      .eq("status", "submitted")
      .order("submitted_at", { ascending: true });
    setPending((data as PendingTimesheet[] | null) ?? []);
    setLoading(false);
  }, [isSuperAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const channel = supabase
      .channel("timesheet-approvals")
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_timesheets" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSuperAdmin, load]);

  return { pending, count: pending.length, loading, reload: load, canApprove: isSuperAdmin };
}
