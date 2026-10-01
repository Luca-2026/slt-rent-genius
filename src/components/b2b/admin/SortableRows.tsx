import { useState, type ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Verschiebt ein Element von `from` nach `to` (neues Array). */
export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const next = [...arr];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

/**
 * Zeilenliste mit Drag & Drop über einen Griff links (Desktop, natives HTML5-DnD).
 * Gezogen wird nur über den Griff, damit Texteingaben normal markierbar bleiben.
 */
export function SortableRows<T>({
  items,
  onReorder,
  disabled,
  renderRow,
}: {
  items: T[];
  onReorder: (next: T[]) => void;
  disabled?: boolean;
  renderRow: (item: T, index: number) => ReactNode;
}) {
  const [armed, setArmed] = useState<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const reset = () => { setArmed(null); setDragIdx(null); setOverIdx(null); };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          data-testid="sortable-row"
          draggable={!disabled && armed === i}
          onDragStart={(e) => {
            setDragIdx(i);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(i));
          }}
          onDragOver={(e) => {
            if (dragIdx === null) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (overIdx !== i) setOverIdx(i);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIdx !== null) onReorder(moveItem(items, dragIdx, i));
            reset();
          }}
          onDragEnd={reset}
          className={cn(
            "flex items-center gap-2 rounded-md transition-colors",
            dragIdx === i && "opacity-40",
            overIdx === i && dragIdx !== null && dragIdx !== i && "ring-2 ring-primary/50",
          )}
        >
          <button
            type="button"
            aria-label={`Zeile ${i + 1} verschieben`}
            disabled={disabled}
            className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 p-1"
            onMouseDown={() => setArmed(i)}
            onMouseUp={() => { if (dragIdx === null) setArmed(null); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" && i > 0) { e.preventDefault(); onReorder(moveItem(items, i, i - 1)); }
              if (e.key === "ArrowDown" && i < items.length - 1) { e.preventDefault(); onReorder(moveItem(items, i, i + 1)); }
            }}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex flex-1 gap-2 min-w-0">{renderRow(item, i)}</div>
        </div>
      ))}
    </div>
  );
}
