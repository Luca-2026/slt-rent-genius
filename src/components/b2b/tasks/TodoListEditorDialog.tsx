import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess, useStaffMembers } from "@/hooks/useStaffAccess";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Send, Save, Loader2 } from "lucide-react";
import { LOCATIONS, type TodoList, type TodoItem } from "./types";

interface DraftItem {
  id?: string;
  title: string;
  note: string;
  estimated_minutes: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list?: TodoList | null;
  onSaved: (savedAsDraft?: boolean) => void;
}

export function TodoListEditorDialog({ open, onOpenChange, list, onSaved }: Props) {
  const { user } = useAuth();
  const { displayName } = useStaffAccess();
  const members = useStaffMembers();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<string>("krefeld");
  const [assignedUserId, setAssignedUserId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("normal");
  const [items, setItems] = useState<DraftItem[]>([{ title: "", note: "", estimated_minutes: "" }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (list) {
      setTitle(list.title);
      setDescription(list.description ?? "");
      setLocation(list.location ?? "krefeld");
      setAssignedUserId(list.assigned_to ?? "");
      setDueDate(list.due_date ?? "");
      setPriority(list.priority ?? "normal");
      supabase
        .from("staff_todo_items")
        .select("*")
        .eq("list_id", list.id)
        .order("sort_order", { ascending: true })
        .then(({ data }) => {
          const loaded = ((data as TodoItem[] | null) ?? []).map((i) => ({
            id: i.id,
            title: i.title,
            note: i.note ?? "",
            estimated_minutes: i.estimated_minutes ? String(i.estimated_minutes) : "",
          }));
          setItems(loaded.length ? loaded : [{ title: "", note: "", estimated_minutes: "" }]);
        });
    } else {
      setTitle("");
      setDescription("");
      setLocation("krefeld");
      setAssignedUserId("");
      setDueDate("");
      setPriority("normal");
      setItems([{ title: "", note: "", estimated_minutes: "" }]);
    }
  }, [open, list]);

  const updateItem = (index: number, patch: Partial<DraftItem>) =>
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  const save = async (send: boolean) => {
    if (!user) return;
    if (!title.trim()) {
      toast({ title: "Titel fehlt", description: "Bitte gib der Aufgabe einen Titel.", variant: "destructive" });
      return;
    }
    const cleanItems = items.filter((i) => i.title.trim());
    if (send && cleanItems.length === 0) {
      toast({ title: "Keine Aufgabenpunkte", description: "Füge mindestens einen Punkt hinzu.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const assignee = members.find((m) => m.user_id === assignedUserId);
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        location,
        assigned_to: assignedUserId || null,
        assigned_name: assignee ? `${assignee.first_name} ${assignee.last_name}`.trim() : null,
        assigned_email: assignee?.email ?? null,
        priority,
        due_date: dueDate || null,
        estimated_minutes: null,
        status: send ? "sent" : (list?.status === "draft" || !list ? "draft" : list.status),
        ...(send ? { sent_at: new Date().toISOString() } : {}),
      };

      let listId = list?.id;

      if (listId) {
        const { error } = await supabase.from("staff_todo_lists").update(payload).eq("id", listId);
        if (error) throw error;
        await supabase.from("staff_todo_items").delete().eq("list_id", listId);
      } else {
        const { data, error } = await supabase
          .from("staff_todo_lists")
          .insert({ ...payload, created_by: user.id, created_by_name: displayName })
          .select("id")
          .single();
        if (error) throw error;
        listId = data.id;
      }

      if (cleanItems.length) {
        const { error: itemError } = await supabase.from("staff_todo_items").insert(
          cleanItems.map((it, idx) => ({
            list_id: listId!,
            title: it.title.trim(),
            note: it.note.trim() || null,
            estimated_minutes: null,
            sort_order: idx,
          })),
        );
        if (itemError) throw itemError;
      }

      if (send) {
        const { error: mailError } = await supabase.functions.invoke("notify-todo-list", {
          body: { list_id: listId, kind: "assigned" },
        });
        if (mailError) {
          toast({
            title: "Aufgabe abgeschickt",
            description: "Die Liste wurde gespeichert, die E-Mail konnte aber nicht versendet werden.",
          });
        } else {
          toast({ title: "Abgeschickt", description: "Die Aufgabenliste wurde zugewiesen und per E-Mail versendet." });
        }
      } else {
        toast({ title: "Entwurf gespeichert" });
      }

      onSaved(!send);
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message ?? "Speichern fehlgeschlagen.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{list ? "Aufgabenliste bearbeiten" : "Neue Aufgabenliste"}</DialogTitle>
          <DialogDescription>
            Als Entwurf sammeln und erst beim Abschicken den Kollegen informieren.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="todo-title">Titel *</Label>
            <Input id="todo-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Rückläufer prüfen" maxLength={160} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Standort</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priorität</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Zuständig</Label>
            <Select value={assignedUserId || "none"} onValueChange={(v) => setAssignedUserId(v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Mitarbeiter wählen" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Noch offen</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.user_id}>
                    {m.first_name} {m.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="todo-due">Fällig am</Label>
            <Input id="todo-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              Zeiten gibst du nicht vor – die Kolleginnen und Kollegen tragen die tatsächlich benötigte Zeit selbst ein.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="todo-desc">Beschreibung</Label>
            <Textarea id="todo-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={2000} />
          </div>

          <div className="space-y-2">
            <Label>Aufgabenpunkte</Label>
            {items.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(idx, { title: e.target.value })}
                    placeholder={`Punkt ${idx + 1}`}
                    maxLength={200}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="Punkt entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={item.note}
                  onChange={(e) => updateItem(idx, { note: e.target.value })}
                  placeholder="Notiz (optional)"
                  maxLength={300}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setItems((prev) => [...prev, { title: "", note: "", estimated_minutes: "" }])}
            >
              <Plus className="h-4 w-4 mr-1" /> Punkt hinzufügen
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" className="w-full sm:flex-1" disabled={saving} onClick={() => save(false)}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Entwurf speichern
            </Button>
            <Button className="w-full sm:flex-1" disabled={saving} onClick={() => save(true)}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
              Abschicken
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
