import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TodoListEditorDialog } from "@/components/b2b/tasks/TodoListEditorDialog";
import { TodoListDetailSheet } from "@/components/b2b/tasks/TodoListDetailSheet";
import { MaterialDispoTab } from "@/components/b2b/tasks/MaterialDispoTab";
import { Boxes, CheckSquare, Clock, FileEdit, MessageSquare, Pencil, Plus, Truck, User, UserCog } from "lucide-react";
import { AdminInventoryTab } from "@/components/b2b/admin/AdminInventoryTab";
import { AdminStaffTab } from "@/components/b2b/admin/AdminStaffTab";
import AdminFeedbackTab from "@/components/b2b/admin/AdminFeedbackTab";
import { STATUS_LABELS, formatMinutes, locationLabel, type TodoList } from "@/components/b2b/tasks/types";

const PRIORITY_LABELS: Record<string, string> = { low: "Niedrig", normal: "Normal", high: "Hoch" };

export default function StaffTasks() {
  const { user } = useAuth();
  const { isStaff, isAdmin, loading: accessLoading } = useStaffAccess();

  const [lists, setLists] = useState<TodoList[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, { total: number; done: number }>>({});
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editList, setEditList] = useState<TodoList | null>(null);
  const [detailList, setDetailList] = useState<TodoList | null>(null);
  const [scope, setScope] = useState<string>("mine");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("staff_todo_lists")
      .select("*")
      .order("status", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    const rows = (data as TodoList[] | null) ?? [];
    setLists(rows);

    if (rows.length) {
      const { data: items } = await supabase
        .from("staff_todo_items")
        .select("list_id, is_done")
        .in("list_id", rows.map((r) => r.id));
      const counts: Record<string, { total: number; done: number }> = {};
      for (const it of (items as { list_id: string; is_done: boolean }[] | null) ?? []) {
        counts[it.list_id] ??= { total: 0, done: 0 };
        counts[it.list_id].total += 1;
        if (it.is_done) counts[it.list_id].done += 1;
      }
      setItemCounts(counts);
    } else {
      setItemCounts({});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isStaff) load();
  }, [isStaff, load]);

  const visible = useMemo(() => {
    return lists.filter((l) => {
      if (scope === "mine") return l.assigned_to === user?.id && l.status !== "done";
      if (scope === "drafts") return l.status === "draft" && l.created_by === user?.id;
      if (scope === "open") return l.status !== "done";
      if (scope === "done") return l.status === "done";
      return true;
    });
  }, [lists, scope, user?.id]);

  if (accessLoading) {
    return (
      <B2BPortalLayout title="Aufgaben & Dispo">
        <p className="text-sm text-muted-foreground">Lade…</p>
      </B2BPortalLayout>
    );
  }

  if (!isStaff) {
    return (
      <B2BPortalLayout title="Aufgaben & Dispo">
        <Card>
          <CardContent className="py-10 text-center space-y-2">
            <p className="font-semibold">Kein Zugriff</p>
            <p className="text-sm text-muted-foreground">
              Dieser Bereich ist dem SLT-Team vorbehalten.
            </p>
          </CardContent>
        </Card>
      </B2BPortalLayout>
    );
  }

  return (
    <B2BPortalLayout
      title="Interne Verwaltung"
      subtitle="Aufgaben, Materialdispo, Inventar, Feedback und Mitarbeiter"
    >
      <Tabs defaultValue="tasks" className="space-y-4">
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="flex w-max sm:w-full gap-1 h-11 overflow-x-auto">
            <TabsTrigger value="tasks" className="text-sm whitespace-nowrap sm:flex-1">
              <CheckSquare className="h-4 w-4 mr-1.5" /> Aufgaben
            </TabsTrigger>
            <TabsTrigger value="material" className="text-sm whitespace-nowrap sm:flex-1">
              <Truck className="h-4 w-4 mr-1.5" /> Materialdispo
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-sm whitespace-nowrap sm:flex-1">
              <Boxes className="h-4 w-4 mr-1.5" /> Inventar
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="feedback" className="text-sm whitespace-nowrap sm:flex-1">
                <MessageSquare className="h-4 w-4 mr-1.5" /> Feedback
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="staff" className="text-sm whitespace-nowrap sm:flex-1">
                <UserCog className="h-4 w-4 mr-1.5" /> Mitarbeiter
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mine">Meine Aufgaben</SelectItem>
                <SelectItem value="drafts">Meine Entwürfe</SelectItem>
                <SelectItem value="open">Alle offenen</SelectItem>
                <SelectItem value="done">Erledigt</SelectItem>
                <SelectItem value="all">Alle</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setEditList(null);
                setEditorOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Neue Aufgabenliste
            </Button>
          </div>

          {loading && <p className="text-sm text-muted-foreground">Lade Aufgaben…</p>}
          {!loading && visible.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Keine Aufgaben in dieser Ansicht.
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {visible.map((list) => {
              const counts = itemCounts[list.id] ?? { total: 0, done: 0 };
              const canEdit = list.created_by === user?.id || isAdmin;
              return (
                <Card key={list.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <button
                      type="button"
                      className="w-full text-left space-y-2"
                      onClick={() => setDetailList(list)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-sm break-words">{list.title}</span>
                        <Badge
                          variant={list.status === "done" ? "secondary" : list.status === "draft" ? "outline" : "default"}
                          className="shrink-0"
                        >
                          {STATUS_LABELS[list.status] ?? list.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {list.assigned_name ?? "offen"}
                        </span>
                        <span>{locationLabel(list.location)}</span>
                        {list.due_date && <span>fällig {new Date(list.due_date).toLocaleDateString("de-DE")}</span>}
                        {list.priority === "high" && <span className="text-destructive font-medium">Hohe Priorität</span>}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CheckSquare className="h-3.5 w-3.5" />
                          {counts.done}/{counts.total} erledigt
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatMinutes(list.actual_minutes ?? list.estimated_minutes)}
                          {list.actual_minutes == null && list.estimated_minutes != null ? " geplant" : ""}
                        </span>
                      </div>
                    </button>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="flex-1 min-w-[130px]" onClick={() => setDetailList(list)}>
                        Öffnen
                      </Button>
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditList(list);
                            setEditorOpen(true);
                          }}
                        >
                          {list.status === "draft" ? <FileEdit className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                          <span className="ml-1">{list.status === "draft" ? "Entwurf" : "Bearbeiten"}</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="material">
          <MaterialDispoTab />
        </TabsContent>

        <TabsContent value="inventory">
          <AdminInventoryTab />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="feedback">
            <AdminFeedbackTab />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="staff">
            <AdminStaffTab />
          </TabsContent>
        )}
      </Tabs>

      <TodoListEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        list={editList}
        onSaved={load}
      />
      <TodoListDetailSheet
        list={detailList}
        onOpenChange={(open) => !open && setDetailList(null)}
        onChanged={load}
      />
    </B2BPortalLayout>
  );
}
