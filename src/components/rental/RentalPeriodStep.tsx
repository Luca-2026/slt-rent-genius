import { de } from "date-fns/locale";
import { format, startOfDay } from "date-fns";
import { Minus, Plus, CalendarDays, BadgePercent } from "lucide-react";
import { addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pickupWindowForDate, getLocationInfoById } from "@/data/locationData";
import { validCalendarDate } from "../../../supabase/functions/_shared/public-rental-period";
import type { RentalCartItem } from "@/lib/rentalCart";

const toIso = (d: Date) => format(d, "yyyy-MM-dd");
const fromIso = (iso: string) => new Date(`${iso}T12:00:00`);

/** 30-Minuten-Raster innerhalb des Standortfensters (Mülheim: nach Vereinbarung). */
export function timeSlots(open: string, close: string): string[] {
  const toMin = (v: string) => Number(v.slice(0, 2)) * 60 + Number(v.slice(3, 5));
  const slots: string[] = [];
  for (let m = Math.ceil(toMin(open) / 30) * 30; m <= toMin(close); m += 30) slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  if (!slots.includes(close) && toMin(close) % 30 !== 0) slots.push(close);
  return slots;
}

/** Nächster Freitag (heute zählt, wenn noch vor 16 Uhr) für den Wochenendtarif Fr 16:00 – Mo 09:30. */
export function nextWeekendStart(now: Date): Date {
  const d = startOfDay(now);
  const diff = (5 - d.getDay() + 7) % 7;
  const friday = addDays(d, diff);
  return diff === 0 && now.getHours() >= 16 ? addDays(friday, 7) : friday;
}

export function RentalPeriodStep({ edit, patch, weekendPrice, weekendActive }: { edit: RentalCartItem; patch: (next: Partial<RentalCartItem>) => void; weekendPrice: string | null; weekendActive: boolean }) {
  const info = getLocationInfoById(edit.location);
  const flexible = edit.location === "muelheim";
  const windowFor = (iso: string) => flexible && validCalendarDate(iso) && fromIso(iso).getDay() !== 0 ? { open: "07:00", close: "18:00" } : pickupWindowForDate(info, iso);
  const today = startOfDay(new Date());
  const from = validCalendarDate(edit.start_date) ? fromIso(edit.start_date) : undefined;
  const to = validCalendarDate(edit.end_date) ? fromIso(edit.end_date) : undefined;

  const field = (prefix: "start" | "end", label: string) => {
    const date = prefix === "start" ? edit.start_date : edit.end_date;
    const time = prefix === "start" ? edit.start_time : edit.end_time;
    const win = validCalendarDate(date) ? windowFor(date) : null;
    const slots = win ? timeSlots(win.open, win.close) : [];
    return <div className="rounded-md border border-border bg-muted/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{validCalendarDate(date) ? format(fromIso(date), "EEE, dd.MM.yyyy", { locale: de }) : "Im Kalender wählen"}</p>
      {validCalendarDate(date) && (win ? <Select value={slots.includes(time) ? time : undefined} onValueChange={value => patch(prefix === "start" ? { start_time: value } : { end_time: value })}>
        <SelectTrigger className="mt-2 h-10 bg-background" aria-label={`${label} Uhrzeit`}><SelectValue placeholder="Uhrzeit wählen" /></SelectTrigger>
        <SelectContent className="max-h-64">{slots.map(slot => <SelectItem key={slot} value={slot}>{slot} Uhr</SelectItem>)}</SelectContent>
      </Select> : <p className="mt-2 text-sm text-destructive">An diesem Tag geschlossen</p>)}
      {win && <p className="mt-1 text-xs text-muted-foreground">{flexible ? "Nach Vereinbarung" : `Geöffnet ${win.open}–${win.close} Uhr`}</p>}
    </div>;
  };

  return <div className="space-y-4">
    {weekendPrice && <div className={`grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-2 rounded-md border p-3 ${weekendActive ? "border-accent bg-accent/15" : "border-accent/60 bg-accent/5"}`}>
      <BadgePercent className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
      <div className="min-w-0 text-sm"><p className="font-semibold">{weekendActive ? "Wochenendtarif aktiv" : `Wochenendtarif ${weekendPrice}`}</p><p className="text-muted-foreground">Abholung Fr ab 16:00, Rückgabe Mo bis 09:30 – Freitage und Montage sind im Kalender markiert.</p></div>
      {!weekendActive && <Button type="button" size="sm" variant="outline" className="col-span-2 w-full border-accent sm:col-span-1 sm:col-start-2 sm:w-fit" onClick={() => { const fri = nextWeekendStart(new Date()); patch({ start_date: toIso(fri), start_time: "16:00", end_date: toIso(addDays(fri, 3)), end_time: "09:30" }); }}>Nächstes Wochenende wählen</Button>}
    </div>}
    <div className="rounded-md border border-border">
      <p className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm font-semibold"><CalendarDays className="h-4 w-4 text-primary" />{!from ? "Abholtag wählen" : !to ? "Rückgabetag wählen" : "Mietzeitraum"}</p>
      <Calendar mode="range" locale={de} modifiers={weekendPrice ? { weekendDay: day => day.getDay() === 5 || day.getDay() === 1 } : undefined} modifiersClassNames={{ weekendDay: "text-accent font-semibold" }} weekStartsOn={1} numberOfMonths={1} selected={from ? { from, to } : undefined}
        disabled={day => day < today || (!flexible && !pickupWindowForDate(info, toIso(day)))}
        onSelect={range => {
          const start = range?.from ? toIso(range.from) : "";
          const end = range?.to ? toIso(range.to) : "";
          patch({ start_date: start, end_date: end, ...(start !== edit.start_date ? { start_time: "" } : {}), ...(end !== edit.end_date ? { end_time: "" } : {}) });
        }}
        className="mx-auto w-fit"
        classNames={{ cell: "h-10 w-10 sm:h-11 sm:w-11 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md [&:has(.day-range-start)]:rounded-l-md [&:has(.day-range-end)]:rounded-r-md", day: "h-10 w-10 sm:h-11 sm:w-11 p-0 font-normal rounded-md hover:bg-muted aria-selected:opacity-100", day_today: "font-bold underline underline-offset-4", day_range_start: "day-range-start", day_range_middle: "aria-selected:bg-transparent aria-selected:text-foreground", head_cell: "text-muted-foreground rounded-md w-10 sm:w-11 font-normal text-[0.8rem]" }} />
    </div>
    <div className="grid grid-cols-2 gap-3">{field("start", "Abholung")}{field("end", "Rückgabe")}</div>
    <div className="flex items-center justify-between rounded-md border border-border p-3">
      <span className="text-sm font-semibold">Anzahl</span>
      <div className="flex items-center gap-2">
        <Button type="button" size="icon" variant="outline" className="h-9 w-9" aria-label="Anzahl verringern" disabled={edit.quantity <= 1} onClick={() => patch({ quantity: Math.max(1, edit.quantity - 1) })}><Minus className="h-4 w-4" /></Button>
        <span className="w-8 text-center font-semibold" aria-live="polite">{edit.quantity}</span>
        <Button type="button" size="icon" variant="outline" className="h-9 w-9" aria-label="Anzahl erhöhen" disabled={edit.quantity >= 9999} onClick={() => patch({ quantity: Math.min(9999, edit.quantity + 1) })}><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
    <div className="flex flex-wrap gap-x-5 gap-y-2">{([['use_saturday', 'Samstag wird genutzt'], ['use_sunday', 'Sonntag wird genutzt']] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm"><Checkbox checked={edit[key]} onCheckedChange={value => patch({ [key]: value === true })} />{label}</label>)}</div>
  </div>;
}
