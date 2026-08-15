import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, CalendarClock, CheckSquare, ClipboardList } from "lucide-react";
import { useOpenTodos } from "@/hooks/useOpenTodos";
import { TodoListDetailSheet } from "./TodoListDetailSheet";
import { STATUS_LABELS, locationLabel, type TodoList } from "./types";

/**
 * Prominenter Hinweis auf offene To-dos – wird oben im Admin-/Mitarbeiter-Dashboard gezeigt.
 * Blendet sich komplett aus, wenn nichts offen ist.
 */
export function OpenTodosWidget() {
  const { lists, count, overdue, dueToday, loading, reload } = useOpenTodos();
  const [detail, setDetail] = useState<TodoList | null>(null);

  if (loading || count === 0) return null;

  const hasOverdue = overdue.length > 0;

  return (
    <>
      <Card
        className={`mb-6 border-2 ${hasOverdue ? "border-destructive/60 bg-destructive/5" : "border-primary/40 bg-primary/5"}`}
      >
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <span
                className={`shrink-0 rounded-lg p-2 ${hasOverdue ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}
              >
                {hasOverdue ? <AlertTriangle className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-base leading-tight">
                  {count === 1 ? "1 offene Aufgabe" : `${count} offene Aufgaben`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {hasOverdue
                    ? `${overdue.length} überfällig${dueToday.length ? ` · ${dueToday.length} heute fällig` : ""}`
                    : dueToday.length
                      ? `${dueToday.length} heute fällig`
                      : "Für dich zugewiesen"}
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 hidden sm:inline-flex">
              <Link to="/b2b/aufgaben">
                Alle ansehen <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            {lists.slice(0, 3).map((list) => {
              const isOverdue = !!list.due_date && list.due_date < new Date().toISOString().slice(0, 10);
              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => setDetail(list)}
                  className="w-full text-left rounded-lg border border-border bg-background p-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm break-words">{list.title}</span>
                    <Badge variant={isOverdue ? "destructive" : "secondary"} className="shrink-0 text-[11px]">
                      {isOverdue ? "überfällig" : (STATUS_LABELS[list.status] ?? list.status)}
                    </Badge>
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
                  </div>
                </button>
              );
            })}
          </div>

          <Button asChild size="sm" className="w-full sm:hidden">
            <Link to="/b2b/aufgaben">
              <CheckSquare className="h-4 w-4 mr-1.5" />
              {count > 3 ? `Alle ${count} Aufgaben öffnen` : "Aufgaben & Dispo öffnen"}
            </Link>
          </Button>
          {count > 3 && (
            <p className="hidden sm:block text-xs text-muted-foreground">
              + {count - 3} weitere Aufgaben unter „Aufgaben &amp; Dispo“
            </p>
          )}
        </CardContent>
      </Card>

      <TodoListDetailSheet list={detail} onOpenChange={(open) => !open && setDetail(null)} onChanged={reload} />
    </>
  );
}
