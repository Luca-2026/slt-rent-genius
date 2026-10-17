import { Link } from "react-router-dom";
import { CheckCircle2, CircleDashed } from "lucide-react";
import type { DayEntry } from "@/lib/calendarEntries";
import { cn } from "@/lib/utils";

/** Ein Eintrag (Übergabe oder Rückgabe) im Tageskalender. */
export function DayEntryCard({ entry }: { entry: DayEntry }) {
  const isPickup = entry.kind === "pickup";
  return (
    <Link
      to={`/b2b/mietanfragen/${entry.inquiryId}`}
      className={cn(
        "block rounded-md border p-2 text-left text-xs transition-colors hover:bg-muted/60",
        isPickup ? "border-primary/40 bg-primary/5" : "border-accent/50 bg-accent/10",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{entry.time ?? "—"} Uhr</span>
        {entry.orderCode && <span className="font-mono text-[10px] text-muted-foreground">#{entry.orderCode}</span>}
      </div>
      <p className="mt-0.5 break-words font-medium leading-snug">{entry.itemsLabel}</p>
      <p className="break-words text-muted-foreground">{entry.customer}</p>
      <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
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
      </p>
    </Link>
  );
}
