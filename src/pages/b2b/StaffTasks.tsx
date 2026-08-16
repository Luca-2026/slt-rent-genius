import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useToast } from "@/hooks/use-toast";

import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TodoListEditorDialog } from "@/components/b2b/tasks/TodoListEditorDialog";
import { TodoListDetailSheet } from "@/components/b2b/tasks/TodoListDetailSheet";
import { MaterialDispoTab } from "@/components/b2b/tasks/MaterialDispoTab";
import { Boxes, CheckSquare, Clock, FileEdit, MessageSquare, Pencil, Plus, Trash2, Truck, User, UserCog } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminInventoryTab } from "@/components/b2b/admin/AdminInventoryTab";
import { AdminStaffTab } from "@/components/b2b/admin/AdminStaffTab";
import AdminFeedbackTab from "@/components/b2b/admin/AdminFeedbackTab";
import { LOCATIONS, STATUS_LABELS, formatMinutes, locationLabel, type TodoList } from "@/components/b2b/tasks/types";

const PRIORITY_LABELS: Record<string, string> = { low: "Niedrig", normal: "Normal", high: "Hoch" };

export default function StaffTasks() {
  const { user } = useAuth();
  const { isStaff, isAdmin, displayName, loading: accessLoading } = useStaffAccess();
  const { toast } = useToast();


  const [lists, setLists] = useState<TodoList[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, { total: number; done: number }>>({});
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editList, setEditList] = useState<TodoList | null>(null);
  const [detailList, setDetailList] = useState<TodoList | null>(null);
  const [scope, setScope] = useState<string>("open");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<TodoList | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Tab-Steuerung über die URL, damit Deep-Links und Zurück-Navigation funktionieren
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const allowedTabs = useMemo(
    () => (isAdmin ? ["tasks", "material", "inventory", "feedback", "staff"] : ["tasks", "material", "inventory"]),
    [isAdmin],
  );
  const activeTab = requestedTab && allowedTabs.includes(requestedTab) ? requestedTab : "tasks";
  const handleTabChange = useCallback(
    (value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value === "tasks") next.delete("tab");
      else next.set("tab", value);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const takeOver = useCallback(
    async (list: TodoList) => {
      if (!user) return;
      await supabase
        .from("staff_todo_lists")
        .update({
          assigned_to: user.id,
          assigned_name: displayName ?? null,
          assigned_email: user.email ?? null,
          status: list.status === "draft" ? list.status : "in_progress",
        })
        .eq("id", list.id);
      toast({ title: "Übernommen", description: `„${list.title}“ ist jetzt dir zugewiesen.` });
    },
    [user, displayName, toast],
  );


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

  /** Entwurf endgültig löschen (inkl. Aufgabenpunkte). Nur Ersteller oder Admin. */
  const deleteDraft = useCallback(
    async (list: TodoList) => {
      setDeletingId(list.id);
      await supabase.from("staff_todo_items").delete().eq("list_id", list.id);
      const { error } = await supabase.from("staff_todo_lists").delete().eq("id", list.id);
      setDeletingId(null);
      setDeleteTarget(null);
      if (error) {
        toast({ title: "Löschen fehlgeschlagen", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Entwurf gelöscht", description: `„${list.title}“ wurde entfernt.` });
      load();
    },
    [toast, load],
  );


  useEffect(() => {
    if (isStaff) load();
  }, [isStaff, load]);

  // Live-Fortschritt: Ersteller sieht sofort, wenn abgehakt wird
  useEffect(() => {
    if (!isStaff) return;
    const channel = supabase
      .channel("staff-tasks-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_todo_lists" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_todo_items" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isStaff, load]);

  const visible = useMemo(() => {
    return lists.filter((l) => {
      if (locationFilter !== "all" && l.location !== locationFilter) return false;
      if (scope === "mine") return l.assigned_to === user?.id && l.status !== "done";
      if (scope === "created") return l.created_by === user?.id && l.status !== "done";
      if (scope === "unassigned") return !l.assigned_to && l.status !== "done" && l.status !== "draft";
      if (scope === "drafts") return l.status === "draft" && (isAdmin || l.created_by === user?.id);
      if (scope === "open") return l.status !== "done";
      if (scope === "done") return l.status === "done";
      return true;
    });
  }, [lists, scope, locationFilter, user?.id, isAdmin]);


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
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid grid-cols-3 gap-1 h-auto w-full p-1 sm:flex sm:h-11">
          <TabsTrigger value="tasks" className="text-xs sm:text-sm py-2 sm:flex-1">
            <CheckSquare className="h-4 w-4 mr-1.5 shrink-0" /> Aufgaben
          </TabsTrigger>
          <TabsTrigger value="material" className="text-xs sm:text-sm py-2 sm:flex-1">
            <Truck className="h-4 w-4 mr-1.5 shrink-0" /> Dispo
          </TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs sm:text-sm py-2 sm:flex-1">
            <Boxes className="h-4 w-4 mr-1.5 shrink-0" /> Inventar
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="feedback" className="text-xs sm:text-sm py-2 sm:flex-1">
              <MessageSquare className="h-4 w-4 mr-1.5 shrink-0" /> Feedback
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="staff" className="text-xs sm:text-sm py-2 sm:flex-1">
              <UserCog className="h-4 w-4 mr-1.5 shrink-0" /> Team
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mine">Mir zugewiesen</SelectItem>
                  <SelectItem value="created">Von mir erstellt</SelectItem>
                  <SelectItem value="unassigned">Standort-Aufgaben (offen, ohne Zuweisung)</SelectItem>
                  <SelectItem value="drafts">Entwürfe</SelectItem>
                  <SelectItem value="open">Alle offenen (inkl. Entwürfe)</SelectItem>
                  <SelectItem value="done">Erledigt</SelectItem>
                  <SelectItem value="all">Alle</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Standorte</SelectItem>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                        <div className="flex flex-wrap justify-end gap-1 shrink-0">
                          {list.assigned_to === user?.id && <Badge variant="outline">Mir zugewiesen</Badge>}
                          {!list.assigned_to && list.status !== "draft" && <Badge variant="outline">Standort-Aufgabe</Badge>}
                          <Badge
                            variant={list.status === "done" ? "secondary" : list.status === "draft" ? "outline" : "default"}
                          >
                            {STATUS_LABELS[list.status] ?? list.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {list.assigned_name ?? "noch offen"}
                        </span>
                        {list.created_by_name && <span>erstellt von {list.created_by_name}</span>}
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
                          {list.actual_minutes != null ? `${formatMinutes(list.actual_minutes)} gebraucht` : "Zeit offen"}
                        </span>
                      </div>
                    </button>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="flex-1 min-w-[130px]" onClick={() => setDetailList(list)}>
                        Öffnen
                      </Button>
                      {list.status !== "draft" && list.status !== "done" && list.assigned_to !== user?.id && (
                        <Button size="sm" variant="secondary" onClick={() => takeOver(list)}>
                          Übernehmen
                        </Button>
                      )}

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

                      {canEdit && list.status === "draft" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingId === list.id}
                          onClick={() => setDeleteTarget(list)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="ml-1">Löschen</span>
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
        onSaved={(savedAsDraft) => {
          if (savedAsDraft) setScope("drafts");
          load();
        }}
      />
      <TodoListDetailSheet
        list={detailList}
        onOpenChange={(open) => !open && setDetailList(null)}
        onChanged={load}
      />
    </B2BPortalLayout>
  );
}
