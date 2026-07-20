/**
 * Hooks: Einzelartikel-Bestand (b2b_product_instances) + Wartungen.
 * Admin-only – RLS erzwingt das serverseitig.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type InstanceStatus = "available" | "rented" | "maintenance" | "repair" | "retired" | "lost";
export type IntervalType = "hours" | "days" | "months" | "years" | "one_time";

export interface ProductInstance {
  id: string;
  managed_product_id: string;
  serial_number: string | null;
  internal_inventory_number: string | null;
  location: "krefeld" | "bonn" | "muelheim";
  status: InstanceStatus;
  purchase_date: string | null;
  purchase_price: number | null;
  supplier: string | null;
  current_operating_hours: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceInterval {
  id: string;
  instance_id: string;
  title: string;
  interval_type: IntervalType;
  interval_value: number | null;
  last_done_at: string | null;
  last_done_hours: number | null;
  next_due_at: string | null;
  next_due_hours: number | null;
  warn_days_before: number | null;
  is_active: boolean;
  notes: string | null;
}

export interface MaintenanceLogEntry {
  id: string;
  instance_id: string;
  interval_id: string | null;
  performed_at: string;
  performed_by_name: string | null;
  hours_at_service: number | null;
  title: string;
  description: string | null;
  parts_replaced: string | null;
  cost: number | null;
  created_at: string;
}

export interface MaintenanceDueRow {
  interval_id: string;
  title: string;
  interval_type: IntervalType;
  next_due_at: string | null;
  next_due_hours: number | null;
  warn_days_before: number | null;
  instance_id: string;
  serial_number: string | null;
  internal_inventory_number: string | null;
  location: string;
  current_operating_hours: number | null;
  managed_product_id: string;
  product_name: string;
  product_slug: string;
  due_status: "overdue" | "due_soon" | "ok";
}

// -------- Instances --------
export function useProductInstances(managedProductId: string | undefined) {
  return useQuery({
    queryKey: ["product-instances", managedProductId],
    enabled: !!managedProductId,
    queryFn: async () => {
      const { data, error } = await (supabase.from("b2b_product_instances" as never) as any)
        .select("*")
        .eq("managed_product_id", managedProductId)
        .order("location")
        .order("internal_inventory_number", { nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as ProductInstance[];
    },
  });
}

export function useInstanceCounts() {
  return useQuery({
    queryKey: ["instance-counts"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("b2b_product_instances" as never) as any)
        .select("managed_product_id, location, status");
      if (error) throw error;
      const map: Record<string, { total: number; byLocation: Record<string, number> }> = {};
      for (const row of (data ?? []) as Array<{ managed_product_id: string; location: string; status: string }>) {
        if (row.status === "retired" || row.status === "lost") continue;
        const entry = (map[row.managed_product_id] ??= { total: 0, byLocation: {} });
        entry.total += 1;
        entry.byLocation[row.location] = (entry.byLocation[row.location] ?? 0) + 1;
      }
      return map;
    },
    staleTime: 30_000,
  });
}

// -------- Maintenance intervals --------
export function useMaintenanceIntervals(instanceId: string | undefined) {
  return useQuery({
    queryKey: ["maintenance-intervals", instanceId],
    enabled: !!instanceId,
    queryFn: async () => {
      const { data, error } = await (supabase.from("b2b_maintenance_intervals" as never) as any)
        .select("*")
        .eq("instance_id", instanceId)
        .order("is_active", { ascending: false })
        .order("next_due_at", { nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as MaintenanceInterval[];
    },
  });
}

// -------- Maintenance log --------
export function useMaintenanceLog(instanceId: string | undefined) {
  return useQuery({
    queryKey: ["maintenance-log", instanceId],
    enabled: !!instanceId,
    queryFn: async () => {
      const { data, error } = await (supabase.from("b2b_maintenance_log" as never) as any)
        .select("*")
        .eq("instance_id", instanceId)
        .order("performed_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as MaintenanceLogEntry[];
    },
  });
}

// -------- Due maintenance (dashboard widget) --------
export function useMaintenanceDue() {
  return useQuery({
    queryKey: ["maintenance-due"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("maintenance_due_overview" as never) as any)
        .select("*")
        .neq("due_status", "ok")
        .order("next_due_at", { nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as MaintenanceDueRow[];
    },
    staleTime: 60_000,
  });
}

// -------- Mutations --------
export function useInvalidateInstances() {
  const qc = useQueryClient();
  return (managedProductId?: string, instanceId?: string) => {
    qc.invalidateQueries({ queryKey: ["product-instances", managedProductId] });
    qc.invalidateQueries({ queryKey: ["instance-counts"] });
    qc.invalidateQueries({ queryKey: ["maintenance-due"] });
    if (instanceId) {
      qc.invalidateQueries({ queryKey: ["maintenance-intervals", instanceId] });
      qc.invalidateQueries({ queryKey: ["maintenance-log", instanceId] });
    }
  };
}

export function useCompleteMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      interval_id: string;
      performed_at: string;
      hours_at_service?: number | null;
      description?: string | null;
      parts_replaced?: string | null;
      cost?: number | null;
      performed_by_name?: string | null;
    }) => {
      const { data, error } = await (supabase.rpc as any)("complete_maintenance", {
        _interval_id: args.interval_id,
        _performed_at: args.performed_at,
        _hours_at_service: args.hours_at_service ?? null,
        _description: args.description ?? null,
        _parts_replaced: args.parts_replaced ?? null,
        _cost: args.cost ?? null,
        _performed_by_name: args.performed_by_name ?? null,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance-intervals"] });
      qc.invalidateQueries({ queryKey: ["maintenance-log"] });
      qc.invalidateQueries({ queryKey: ["maintenance-due"] });
      qc.invalidateQueries({ queryKey: ["product-instances"] });
    },
  });
}
