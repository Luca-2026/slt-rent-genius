import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addDays, toLocalIso, weekDays, weekStart, type DayEntry } from "@/lib/calendarEntries";
import { DayEntryCard } from "./DayEntryCard";
import { cn } from "@/lib/utils";

const WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

interface Props {
  entries: DayEntry[];
  weekAnchor: Date;
  onWeekChange: (anchor: Date) => void;
}

/** Wochenraster Mo–So mit Übergaben und Rückgaben je Tag. */
export function WeekGrid({ entries, weekAnchor, onWeekChange }: Props) {
  const days = useMemo(() => weekDays(weekAnchor), [weekAnchor]);
  const today = toLocalIso(new Date());
  const byDay = useMemo(() => {
    const map = new Map<string, DayEntry[]>();
    for (const e of entries) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [entries]);

  const start = weekStart(weekAnchor);
  const end = addDays(start, 6);
  const fmt = (d: Date) => d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onWeekChange(addDays(weekAnchor, -7))} aria-label="Vorherige Woche">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onWeekChange(new Date())}>Heute</Button>
        <Button variant="outline" size="sm" onClick={() => onWeekChange(addDays(weekAnchor, 7))} aria-label="Nächste Woche">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          KW {fmt(start)} – {fmt(end)}.{end.getFullYear()}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((iso, i) => {
          const dayEntries = byDay.get(iso) ?? [];
          const pickups = dayEntries.filter((e) => e.kind === "pickup");
          const returns = dayEntries.filter((e) => e.kind === "return");
          const isToday = iso === today;
          return (
            <section
              key={iso}
              aria-label={`${WD[i]} ${iso}`}
              className={cn("rounded-lg border bg-card p-2", isToday && "border-primary ring-1 ring-primary")}
            >
              <header className={cn("mb-2 flex items-baseline justify-between px-1", isToday && "text-primary")}>
                <span className="text-xs font-semibold uppercase">{WD[i]}</span>
                <span className="text-xs text-muted-foreground">{iso.slice(8, 10)}.{iso.slice(5, 7)}.</span>
              </header>
              {dayEntries.length === 0 ? (
                <p className="px-1 text-[11px] text-muted-foreground">—</p>
              ) : (
                <div className="space-y-2">
                  {pickups.length > 0 && (
                    <div>
                      <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-primary">Übergaben</p>
                      <div className="mt-1 space-y-1.5">{pickups.map((e, j) => <DayEntryCard key={`p${j}`} entry={e} />)}</div>
                    </div>
                  )}
                  {returns.length > 0 && (
                    <div>
                      <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">Rückgaben</p>
                      <div className="mt-1 space-y-1.5">{returns.map((e, j) => <DayEntryCard key={`r${j}`} entry={e} />)}</div>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
