import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CheckCircle2, Clock, Loader2, MessageSquare, Send, Truck } from "lucide-react";
import {
  formatMinutes,
  locationLabel,
  STATUS_LABELS,
  TRANSFER_STATUS_LABELS,
  type MaterialTransfer,
  type TodoComment,
  type TodoItem,
  type TodoList,
} from "./types";
import { notifyTodoUpdate } from "./notify";

interface Props {
  list: TodoList | null;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

export function TodoListDetailSheet({ list, onOpenChange, onChanged }: Props) {
  const { user } = useAuth();
  const { displayName } = useStaffAccess();
  const { toast } = useToast();

  const [items, setItems] = useState<TodoItem[]>([]);
  const [comments, setComments] = useState<TodoComment[]>([]);
  const [transfers, setTransfers] = useState<MaterialTransfer[]>([]);
  const [newComment, setNewComment] = useState("");
  const [actualMinutes, setActualMinutes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!list) return;
    const [itemsRes, commentsRes, transfersRes] = await Promise.all([
      supabase.from("staff_todo_items").select("*").eq("list_id", list.id).order("sort_order", { ascending: true }),
      supabase.from("staff_todo_comments").select("*").eq("list_id", list.id).order("created_at", { ascending: true }),
      supabase.from("staff_material_transfers").select("*").eq("todo_list_id", list.id),
    ]);
    setItems((itemsRes.data as TodoItem[] | null) ?? []);
    setComments((commentsRes.data as TodoComment[] | null) ?? []);
    setTransfers((transfersRes.data as MaterialTransfer[] | null) ?? []);
    setActualMinutes(list.actual_minutes ? String(list.actual_minutes) : "");
  }, [list]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!list) return;
    const channel = supabase
      .channel(`todo-detail-${list.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_todo_items", filter: `list_id=eq.${list.id}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_todo_comments", filter: `list_id=eq.${list.id}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [list?.id, load]);

  if (!list) return null;

  const doneCount = items.filter((i) => i.is_done).length;

  const toggleItem = async (item: TodoItem, checked: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_done: checked } : i)));
    await supabase
      .from("staff_todo_items")
      .update({
        is_done: checked,
        done_at: checked ? new Date().toISOString() : null,
        done_by: checked ? user?.id ?? null : null,
      })
      .eq("id", item.id);

    if (checked && list.status === "sent") {
      await supabase.from("staff_todo_lists").update({ status: "in_progress" }).eq("id", list.id);
      onChanged();
    }
    if (checked) {
      void notifyTodoUpdate(list.id, "progress", {
        itemTitle: item.title,
        createdBy: list.created_by,
        currentUserId: user?.id,
      });
    }
  };

  const saveItemMinutes = async (item: TodoItem, value: string) => {
    const minutes = value === "" ? null : Number(value);
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, actual_minutes: minutes } : i)));
    await supabase.from("staff_todo_items").update({ actual_minutes: minutes }).eq("id", item.id);
  };

  const saveListMinutes = async () => {
    const minutes = actualMinutes === "" ? null : Number(actualMinutes);
    await supabase.from("staff_todo_lists").update({ actual_minutes: minutes }).eq("id", list.id);
    toast({ title: "Zeitaufwand gespeichert" });
    onChanged();
  };

  const completeList = async () => {
    setBusy(true);
    await supabase
      .from("staff_todo_lists")
      .update({
        status: "done",
        completed_at: new Date().toISOString(),
        actual_minutes: actualMinutes === "" ? null : Number(actualMinutes),
      })
      .eq("id", list.id);
    void notifyTodoUpdate(list.id, "completed", { createdBy: list.created_by, currentUserId: user?.id });
    setBusy(false);
    toast({ title: "Aufgabe erledigt", description: "Die Liste wurde als erledigt markiert." });
    onChanged();
    onOpenChange(false);
  };

  const sendComment = async () => {
    const body = newComment.trim();
    if (!body || !user) return;
    setBusy(true);
    const { error } = await supabase.from("staff_todo_comments").insert({
      list_id: list.id,
      author_id: user.id,
      author_name: displayName,
      body,
    });
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      setNewComment("");
      await supabase.functions.invoke("notify-todo-list", {
        body: { list_id: list.id, kind: "comment", comment: body },
      });
      await load();
    }
    setBusy(false);
  };

  return (
    <Sheet open={!!list} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="p-4 border-b border-border text-left">
          <SheetTitle className="text-base pr-8">{list.title}</SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="secondary">{STATUS_LABELS[list.status] ?? list.status}</Badge>
            <Badge variant="outline">{locationLabel(list.location)}</Badge>
            {list.due_date && (
              <Badge variant="outline">fällig {new Date(list.due_date).toLocaleDateString("de-DE")}</Badge>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-6">
          {list.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-line">{list.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border p-3">
              <div className="text-muted-foreground text-xs">Gebrauchte Zeit</div>
              <div className="font-semibold">{list.actual_minutes != null ? formatMinutes(list.actual_minutes) : "–"}</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-muted-foreground text-xs">Erledigt</div>
              <div className="font-semibold">{doneCount} / {items.length}</div>
            </div>
          </div>

          {/* Aufgabenpunkte */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Aufgabenpunkte</h3>
            {items.length === 0 && <p className="text-sm text-muted-foreground">Keine Punkte hinterlegt.</p>}
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-3 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={item.is_done}
                    onCheckedChange={(v) => toggleItem(item, v === true)}
                    className="mt-0.5"
                  />
                  <span className={`text-sm ${item.is_done ? "line-through text-muted-foreground" : ""}`}>
                    {item.title}
                    {item.note && <span className="block text-xs text-muted-foreground">{item.note}</span>}
                  </span>
                </label>
                <div className="flex items-center gap-2 pl-7">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Gebrauchte Zeit:
                  </span>
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    className="h-8 w-24"
                    placeholder="Min."
                    defaultValue={item.actual_minutes ?? ""}
                    onBlur={(e) => saveItemMinutes(item, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Material */}
          {transfers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4" /> Material zu dieser Aufgabe
              </h3>
              {transfers.map((t) => (
                <div key={t.id} className="rounded-lg border border-border p-3 text-sm">
                  <div className="font-medium">{t.item_name} · {t.quantity} Stk.</div>
                  <div className="text-xs text-muted-foreground">
                    {locationLabel(t.from_location)} → {locationLabel(t.to_location)}
                    {t.tour_date ? ` · Tour ${new Date(t.tour_date).toLocaleDateString("de-DE")}` : ""}
                    {` · ${TRANSFER_STATUS_LABELS[t.status] ?? t.status}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Zeitaufwand gesamt */}
          <div className="space-y-2">
            <Label htmlFor="actual-minutes" className="text-sm font-semibold">Tatsächlicher Aufwand gesamt</Label>
            <div className="flex gap-2">
              <Input
                id="actual-minutes"
                type="number"
                min={0}
                inputMode="numeric"
                value={actualMinutes}
                onChange={(e) => setActualMinutes(e.target.value)}
                placeholder="Minuten"
              />
              <Button variant="outline" onClick={saveListMinutes}>Speichern</Button>
            </div>
          </div>

          {list.status !== "done" && (
            <Button className="w-full" onClick={completeList} disabled={busy}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Aufgabe abschließen
            </Button>
          )}

          {/* Kommunikation */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Rückfragen &amp; Anmerkungen
            </h3>
            <div className="space-y-2">
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground">Noch keine Nachrichten.</p>
              )}
              {comments.map((c) => {
                const own = c.author_id === user?.id;
                return (
                  <div
                    key={c.id}
                    className={`rounded-lg p-3 text-sm ${own ? "bg-primary/10 ml-6" : "bg-muted mr-6"}`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {c.author_name ?? "Mitarbeiter"} ·{" "}
                      {new Date(c.created_at).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                    <div className="whitespace-pre-line">{c.body}</div>
                  </div>
                );
              })}
            </div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Rückfrage oder Anmerkung schreiben…"
              rows={3}
              maxLength={2000}
            />
            <Button className="w-full" onClick={sendComment} disabled={busy || !newComment.trim()}>
              {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
              Senden
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
