import { ENTRY_LABELS, type DayEntryKind } from "@/lib/calendarEntries";
import { cn } from "@/lib/utils";

const KINDS: DayEntryKind[] = ["pickup", "delivery", "return", "collection"];

/** Farblegende für Rausgaben und Rücknahmen im Kalender. */
export function CalendarLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground", className)} aria-label="Farblegende">
      {KINDS.map((kind) => (
        <li key={kind} className={cn("flex items-center gap-1.5", `calendar-entry-${kind}`)}>
          <span className="calendar-entry-dot h-2.5 w-2.5 rounded-full" aria-hidden="true" />{ENTRY_LABELS[kind]}
        </li>
      ))}
    </ul>
  );
}
