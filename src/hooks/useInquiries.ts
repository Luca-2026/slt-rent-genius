import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { isOpenInquiry } from "@/lib/inquiryStatus";
import type { RentalInquiry, SalesInquiry } from "@/components/b2b/inquiries/types";

type TableName = "rental_inquiries" | "sales_inquiries";

/**
 * Lädt Miet- bzw. Verkaufsanfragen für den internen Bereich inkl. Live-Updates,
 * damit sofort sichtbar ist, wenn ein Kollege eine Anfrage übernimmt.
 */
function useInquiryTable<T extends { id: string; status: string }>(table: TableName) {
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isStaff) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data, error: err } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setError(null);
    setRows((data as unknown as T[] | null) ?? []);
    setLoading(false);
  }, [isStaff, table]);

  useEffect(() => {
    if (accessLoading) return;
    load();
  }, [accessLoading, load]);

  useEffect(() => {
    if (!isStaff) return;
    const channel = supabase
      .channel(`${table}-changes`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isStaff, table, load]);

  return { rows, loading: loading || accessLoading, error, reload: load };
}

export function useRentalInquiries() {
  return useInquiryTable<RentalInquiry>("rental_inquiries");
}

export function useSalesInquiries() {
  return useInquiryTable<SalesInquiry>("sales_inquiries");
}

/** Zähler für die Navigations-Badges. */
export function useOpenInquiryCounts() {
  const { isStaff } = useStaffAccess();
  const [counts, setCounts] = useState({ rental: 0, sales: 0 });

  const load = useCallback(async () => {
    if (!isStaff) {
      setCounts({ rental: 0, sales: 0 });
      return;
    }
    const [rental, sales] = await Promise.all([
      supabase.from("rental_inquiries").select("status"),
      supabase.from("sales_inquiries").select("status"),
    ]);
    setCounts({
      rental: ((rental.data as { status: string }[] | null) ?? []).filter((r) => isOpenInquiry(r.status)).length,
      sales: ((sales.data as { status: string }[] | null) ?? []).filter((r) => isOpenInquiry(r.status)).length,
    });
  }, [isStaff]);

  useEffect(() => {
    load();
    if (!isStaff) return;
    const channel = supabase
      .channel("inquiry-counts")
      .on("postgres_changes", { event: "*", schema: "public", table: "rental_inquiries" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "sales_inquiries" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isStaff, load]);

  return counts;
}
