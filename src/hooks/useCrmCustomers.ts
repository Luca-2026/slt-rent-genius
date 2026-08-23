import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";

export interface CrmCustomer {
  id: string;
  customer_kind: string;
  company_name: string | null;
  salutation: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  vat_id: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CrmCustomerInput = Partial<Omit<CrmCustomer, "id" | "created_at" | "updated_at">>;

export function crmCustomerLabel(c: CrmCustomer): string {
  const person = [c.first_name, c.last_name].filter(Boolean).join(" ");
  return c.company_name || person || c.email || "Kunde";
}

/** Kundenkartei für den internen Bereich (Ladengeschäft / Telefon). */
export function useCrmCustomers() {
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const [rows, setRows] = useState<CrmCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isStaff) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("crm_customers")
      .select("*")
      .order("updated_at", { ascending: false });
    setRows((data as unknown as CrmCustomer[] | null) ?? []);
    setLoading(false);
  }, [isStaff]);

  useEffect(() => {
    if (accessLoading) return;
    load();
  }, [accessLoading, load]);

  useEffect(() => {
    if (!isStaff) return;
    const channel = supabase
      .channel("crm-customers-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "crm_customers" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isStaff, load]);

  const save = useCallback(
    async (input: CrmCustomerInput, id?: string) => {
      if (id) {
        const { error } = await supabase.from("crm_customers").update(input).eq("id", id);
        if (error) throw error;
        await load();
        return id;
      }
      const { data, error } = await supabase
        .from("crm_customers")
        .insert(input as never)
        .select("id")
        .single();
      if (error) throw error;
      await load();
      return (data as { id: string }).id;
    },
    [load],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("crm_customers").delete().eq("id", id);
      if (error) throw error;
      await load();
    },
    [load],
  );

  return { rows, loading: loading || accessLoading, reload: load, save, remove };
}
