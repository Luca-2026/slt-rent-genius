import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import type { MaterialTransfer, TodoItem, TodoList } from "@/components/b2b/tasks/types";

export interface WorkList extends TodoList {
  items: TodoItem[];
}

/**
 * Alles, was für den eingeloggten Mitarbeiter heute ansteht:
 * zugewiesene, offene To-do-Listen inkl. Punkte + offene Materialtransporte.
 * Admins sehen zusätzlich die Listen, die anderen Mitarbeitern zugewiesen sind
 * (bzw. die sie selbst erstellt haben) inkl. Live-Fortschritt.
 * Wird live aktualisiert und im Dashboard-Widget direkt abhakbar gerendert.
 */
export function useStaffWork() {
  const { user } = useAuth();
  const { isStaff, isAdmin, loading: accessLoading } = useStaffAccess();
  const [lists, setLists] = useState<WorkList[]>([]);
  const [teamLists, setTeamLists] = useState<WorkList[]>([]);
  const [transfers, setTransfers] = useState<MaterialTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user || !isStaff) {
      setLists([]);
      setTeamLists([]);
      setTransfers([]);
      setLoading(false);
      return;
    }

    const [listRes, transferRes] = await Promise.all([
      supabase
        .from("staff_todo_lists")
        .select("*")
        .in("status", ["sent", "in_progress"])
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("staff_material_transfers")
        .select("*")
        .neq("status", "erledigt")
        .order("tour_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false }),
    ]);

    const allRows = (listRes.data as TodoList[] | null) ?? [];
    const mineRows = allRows.filter((l) => l.assigned_to === user.id);
    // Für Admins: alle übrigen offenen Listen. Für Mitarbeiter: nur selbst erstellte.
    const teamRows = allRows.filter(
      (l) => l.assigned_to !== user.id && (isAdmin || l.created_by === user.id),
    );
    const rows = [...mineRows, ...teamRows];

    let itemsByList: Record<string, TodoItem[]> = {};
    if (rows.length) {
      const { data: items } = await supabase
        .from("staff_todo_items")
        .select("*")
        .in("list_id", rows.map((r) => r.id))
        .order("sort_order", { ascending: true });
      itemsByList = ((items as TodoItem[] | null) ?? []).reduce<Record<string, TodoItem[]>>((acc, it) => {
        (acc[it.list_id] ??= []).push(it);
        return acc;
      }, {});
    }

    const withItems = (l: TodoList): WorkList => ({ ...l, items: itemsByList[l.id] ?? [] });
    setLists(mineRows.map(withItems));
    setTeamLists(teamRows.map(withItems));
    setTransfers((transferRes.data as MaterialTransfer[] | null) ?? []);
    setLoading(false);
  }, [user, isStaff, isAdmin]);

  useEffect(() => {
    if (!accessLoading) load();
  }, [accessLoading, load]);

  useEffect(() => {
    if (!user || !isStaff) return;
    const channel = supabase
      .channel("staff-work")
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_todo_lists" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_todo_items" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_material_transfers" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isStaff, load]);

  const today = new Date().toISOString().slice(0, 10);
  const overdue = lists.filter((l) => l.due_date && l.due_date < today);
  const dueToday = lists.filter((l) => l.due_date === today);
  const dueTransfers = transfers.filter((t) => t.tour_date && t.tour_date <= today);
  const unassignedTransfers = transfers.filter((t) => !t.assigned_to);

  return {
    lists,
    teamLists,
    transfers,
    count: lists.length + teamLists.length + transfers.length,
    todoCount: lists.length,
    teamCount: teamLists.length,
    transferCount: transfers.length,
    overdue,
    dueToday,
    dueTransfers,
    unassignedTransfers,
    loading,
    reload: load,
  };
}
