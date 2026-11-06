import { Link } from "react-router-dom";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { ENTRY_LABELS, type DayEntry } from "@/lib/calendarEntries";
import { cn } from "@/lib/utils";

/** Ein Eintrag (Übergabe oder Rückgabe) im Tageskalender. */
export function DayEntryCard({ entry }: { entry: DayEntry }) {
  const isPickup = entry.kind === "pickup" || entry.kind === "delivery";
  return (
    <Link
      to={entry.taskId ? `/b2b/aufgaben?aufgabe=${entry.taskId}` : `/b2b/mietanfragen/${entry.inquiryId}`}
      className={cn(
        "block rounded-md border p-2 text-left text-xs transition-colors hover:bg-muted/60",
        `calendar-entry-${entry.kind}`,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{ENTRY_LABELS[entry.kind]} · {entry.time ? `${entry.time} Uhr` : "ohne Uhrzeit"}</span>
        {entry.orderCode && <span className="font-mono text-[10px] text-muted-foreground">#{entry.orderCode}</span>}
      </div>
      <p className="mt-0.5 break-words font-medium leading-snug">{entry.itemsLabel}</p>
      <p className="break-words text-muted-foreground">{entry.customer}</p>
      {!entry.taskId && <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
        {entry.protocolSigned ? (
          <>
            <CheckCircle2 className="h-3 w-3 text-emerald-600" aria-hidden="true" />
            {isPickup ? "Übergabe unterschrieben" : "Rücknahme unterschrieben"}
          </>
        ) : (
          <>
            <CircleDashed className="h-3 w-3" aria-hidden="true" />
            {isPickup ? "Übergabe offen" : "Rücknahme offen"}
          </>
        )}
      </p>}
    </Link>
  );
}
