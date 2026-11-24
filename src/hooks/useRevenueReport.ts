import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { revenueQueryArgs, type RevenueQuery, type RevenueReport } from "@/lib/revenueReport";

export async function fetchRevenueReport(query: RevenueQuery): Promise<RevenueReport> {
  const { data, error } = await supabase.rpc("get_revenue_report" as never, revenueQueryArgs(query) as never);
  if (error) throw new Error(error.message);
  if (!data || typeof data !== "object" || !("scope" in data) || !("summary" in data)) throw new Error("Die Auswertung konnte nicht vollständig geladen werden.");
  return data as unknown as RevenueReport;
}
export function useRevenueReport(query: RevenueQuery, enabled: boolean, identity?: string) {
  return useQuery({ queryKey: ["revenue-report", identity, query], queryFn: () => fetchRevenueReport(query), enabled, staleTime: 30_000, retry: 1 });
}