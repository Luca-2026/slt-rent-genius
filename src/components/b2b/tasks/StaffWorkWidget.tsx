import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Truck,
} from "lucide-react";
import { useStaffWork, type WorkList } from "@/hooks/useStaffWork";
import { TodoListDetailSheet } from "./TodoListDetailSheet";
import { locationLabel, type MaterialTransfer, type TodoItem, type TodoList } from "./types";

/**
 * „Mein Arbeitstag“ – ganz oben im Portal für Mitarbeiter & Admins.
 * Zeigt zugewiesene To-do-Listen (direkt abhakbar) und offene Materialtransporte.
 * Blendet sich komplett aus, wenn nichts offen ist.
 */
export function StaffWorkWidget() {
  const { user } = useAuth();
  const { isStaff, displayName } = useStaffAccess();
  const { toast } = useToast();
  const { lists, transfers, count, todoCount, transferCount, overdue, dueToday, loading, reload } = useStaffWork();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<TodoList | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  if (!isStaff || loading || count === 0) return null;

  const today = new Date().toISOString().slice(0, 10);
  const hasOverdue = overdue.length > 0;

  const toggleItem = async (list: WorkList, item: TodoItem, done: boolean) => {
    setBusy(item.id);
    await supabase
      .from("staff_todo_items")
      .update({ is_done: done, done_at: done ? new Date().toISOString() : null, done_by: done ? user?.id : null })
      .eq("id", item.id);
    if (done && list.status === "sent") {
      await supabase.from("staff_todo_lists").update({ status: "in_progress" }).eq("id", list.id);
    }
    setBusy(null);
    reload();
  };

  const completeList = async (list: WorkList) => {
    setBusy(list.id);
    await supabase
      .from("staff_todo_lists")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", list.id);
    await supabase.from("staff_todo_items").update({ is_done: true }).eq("list_id", list.id).eq("is_done", false);
    setBusy(null);
    toast({ title: "Erledigt", description: `„${list.title}“ ist abgehakt.` });
    reload();
  };

  const completeTransfer = async (transfer: MaterialTransfer) => {
    setBusy(transfer.id);
    await supabase
      .from("staff_material_transfers")
      .update({ status: "erledigt", done_at: new Date().toISOString() })
      .eq("id", transfer.id);
    setBusy(null);
    toast({ title: "Transport erledigt", description: `${transfer.item_name} ist angekommen.` });
    reload();
  };

  return (
    <>
      <Card
        className={`mb-6 border-2 ${hasOverdue ? "border-destructive/60 bg-destructive/5" : "border-primary/40 bg-primary/5"}`}
      >
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Kopf */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <span
                className={`shrink-0 rounded-lg p-2 ${hasOverdue ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}
              >
                {hasOverdue ? <AlertTriangle className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-base leading-tight">
                  Mein Arbeitstag{displayName ? `, ${displayName.split(" ")[0]}` : ""}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {todoCount > 0 && `${todoCount} ${todoCount === 1 ? "Aufgabe" : "Aufgaben"}`}
                  {todoCount > 0 && transferCount > 0 && " · "}
                  {transferCount > 0 && `${transferCount} ${transferCount === 1 ? "Transport" : "Transporte"}`}
                  {hasOverdue && ` · ${overdue.length} überfällig`}
                  {!hasOverdue && dueToday.length > 0 && ` · ${dueToday.length} heute fällig`}
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 hidden sm:inline-flex">
              <Link to="/b2b/aufgaben">
                Alle ansehen <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          {/* To-do-Listen */}
          {lists.length > 0 && (
            <div className="space-y-2">
              {lists.map((list) => {
                const isOverdue = !!list.due_date && list.due_date < today;
                const done = list.items.filter((i) => i.is_done).length;
                const total = list.items.length;
                const open = expanded === list.id;
                return (
                  <div key={list.id} className="rounded-lg border border-border bg-background overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : list.id)}
                      className="w-full text-left p-3"
                      aria-expanded={open}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-sm break-words">{list.title}</span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          {isOverdue && (
                            <Badge variant="destructive" className="text-[11px]">
                              überfällig
                            </Badge>
                          )}
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                          />
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {list.due_date && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5" />
                            {new Date(list.due_date).toLocaleDateString("de-DE")}
                          </span>
                        )}
                        <span>{locationLabel(list.location)}</span>
                        {list.priority === "high" && <span className="text-destructive font-medium">Hohe Priorität</span>}
                        {total > 0 && <span>{done}/{total} erledigt</span>}
                      </div>
                      {total > 0 && <Progress value={(done / total) * 100} className="h-1.5 mt-2" />}
                    </button>

                    {open && (
                      <div className="border-t border-border p-3 space-y-2">
                        {list.description && (
                          <p className="text-xs text-muted-foreground whitespace-pre-line">{list.description}</p>
                        )}
                        {total === 0 && (
                          <p className="text-xs text-muted-foreground">Keine Einzelpunkte – direkt abhaken.</p>
                        )}
                        {list.items.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-start gap-3 rounded-md p-2 -mx-1 hover:bg-muted/60 cursor-pointer"
                          >
                            <Checkbox
                              checked={item.is_done}
                              disabled={busy === item.id}
                              onCheckedChange={(v) => toggleItem(list, item, v === true)}
                              className="mt-0.5 h-5 w-5"
                            />
                            <span className={`text-sm ${item.is_done ? "line-through text-muted-foreground" : ""}`}>
                              {item.title}
                              {item.note && <span className="block text-xs text-muted-foreground">{item.note}</span>}
                            </span>
                          </label>
                        ))}
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <Button
                            size="sm"
                            className="flex-1"
                            disabled={busy === list.id}
                            onClick={() => completeList(list)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Aufgabe abschließen
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => setDetail(list)}>
                            Details &amp; Rückfragen
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Materialtransporte */}
          {transfers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" /> Materialtransporte
              </p>
              {transfers.slice(0, 5).map((t) => (
                <label
                  key={t.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Checkbox
                    checked={false}
                    disabled={busy === t.id}
                    onCheckedChange={(v) => v === true && completeTransfer(t)}
                    className="mt-0.5 h-5 w-5"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium break-words">
                      {t.item_name} · {t.quantity} Stk.
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {locationLabel(t.from_location)} → {locationLabel(t.to_location)}
                      {t.tour_date ? ` · Tour ${new Date(t.tour_date).toLocaleDateString("de-DE")}` : ""}
                    </span>
                  </span>
                </label>
              ))}
              {transfers.length > 5 && (
                <p className="text-xs text-muted-foreground">+ {transfers.length - 5} weitere Transporte</p>
              )}
            </div>
          )}

          <Button asChild size="sm" variant="outline" className="w-full sm:hidden">
            <Link to="/b2b/aufgaben">Interne Verwaltung öffnen</Link>
          </Button>
        </CardContent>
      </Card>

      <TodoListDetailSheet list={detail} onOpenChange={(open) => !open && setDetail(null)} onChanged={reload} />
    </>
  );
}
