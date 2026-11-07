import { Link } from "react-router-dom";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { ENTRY_LABELS, type DayEntry } from "@/lib/calendarEntries";
import { cn } from "@/lib/utils";

/** Ein Eintrag (Rausgabe oder Rücknahme) im Kalender; Farbe je Art (Abholung, Lieferung, Rückgabe, Rückholung). */
export function DayEntryCard({ entry }: { entry: DayEntry }) {
  const isPickup = entry.kind === "pickup" || entry.kind === "delivery";
  return (
    <Link
      to={entry.taskId ? `/b2b/aufgaben?aufgabe=${entry.taskId}` : `/b2b/mietvorgaenge/${entry.inquiryId}`}
      className={cn(
        "calendar-entry block rounded-md border p-2 text-left text-xs transition-[filter] hover:brightness-95",
        `calendar-entry-${entry.kind}`,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className="calendar-entry-badge shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">{ENTRY_LABELS[entry.kind]}</span>
          <span className="whitespace-nowrap font-medium">{entry.time ? `${entry.time} Uhr` : "ohne Uhrzeit"}</span>
        </span>
        {entry.orderCode && <span className="font-mono text-[10px] text-muted-foreground">#{entry.orderCode}</span>}
      </div>
      <p className="mt-1 break-words font-medium leading-snug">{entry.itemsLabel}</p>
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
