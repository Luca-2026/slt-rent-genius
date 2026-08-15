import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import type { TodoList } from "@/components/b2b/tasks/types";

/**
 * Offene Aufgaben des eingeloggten Mitarbeiters (zugewiesen, noch nicht erledigt).
 * Wird für das Dashboard-Widget und die Badges in der Portal-Navigation genutzt.
 */
export function useOpenTodos() {
  const { user } = useAuth();
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const [lists, setLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user || !isStaff) {
      setLists([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("staff_todo_lists")
      .select("*")
      .eq("assigned_to", user.id)
      .in("status", ["sent", "in_progress"])
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    setLists((data as TodoList[] | null) ?? []);
    setLoading(false);
  }, [user, isStaff]);

  useEffect(() => {
    if (!accessLoading) load();
  }, [accessLoading, load]);

  useEffect(() => {
    if (!user || !isStaff) return;
    const channel = supabase
      .channel("open-todos")
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_todo_lists" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isStaff, load]);

  const today = new Date().toISOString().slice(0, 10);
  const overdue = lists.filter((l) => l.due_date && l.due_date < today);
  const dueToday = lists.filter((l) => l.due_date === today);

  return { lists, count: lists.length, overdue, dueToday, loading, reload: load };
}
