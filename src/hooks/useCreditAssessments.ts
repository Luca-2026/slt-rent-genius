import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type CreditAssessment = Tables<"customer_credit_assessments">;
export function useCreditAssessments(enabled: boolean, customerId?: string) {
  const [rows, setRows] = useState<CreditAssessment[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const reload = useCallback(async () => {
    if (!enabled) { setRows([]); return; }
    setLoading(true); setError(false);
    let query = supabase.from("customer_credit_assessments").select("*").order("checked_at", { ascending: false }).order("created_at", { ascending: false });
    if (customerId) query = query.eq("crm_customer_id", customerId);
    const result = await query;
    setError(Boolean(result.error)); setRows(result.data ?? []); setLoading(false);
  }, [enabled, customerId]);
  useEffect(() => { void reload(); }, [reload]);
  return { rows, error, loading, reload };
}