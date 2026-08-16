import { supabase } from "@/integrations/supabase/client";

export type TodoNotifyKind = "assigned" | "comment" | "progress" | "completed";

/**
 * Informiert den Ersteller einer Aufgabenliste per E-Mail über Fortschritt.
 * Läuft bewusst „fire and forget“ – Fehler dürfen das Abhaken nie blockieren.
 */
export async function notifyTodoUpdate(
  listId: string,
  kind: TodoNotifyKind,
  options: { itemTitle?: string; createdBy?: string | null; currentUserId?: string | null } = {},
) {
  // Keine Mail an sich selbst
  if (options.createdBy && options.currentUserId && options.createdBy === options.currentUserId) return;
  try {
    await supabase.functions.invoke("notify-todo-list", {
      body: { list_id: listId, kind, item_title: options.itemTitle ?? null },
    });
  } catch {
    /* still */
  }
}
