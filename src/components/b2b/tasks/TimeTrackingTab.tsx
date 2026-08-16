import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess, useStaffMembers } from "@/hooks/useStaffAccess";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, ChevronLeft, ChevronRight, Download, Lock } from "lucide-react";
import { LOCATIONS } from "./types";

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const WEEKDAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

interface TimeEntry {
  work_date: string;
  start_time: string | null;
  end_time: string | null;
  break_minutes: number | null;
  note: string | null;
  location: string | null;
}

interface Timesheet {
  id: string;
  user_id: string;
  staff_name: string | null;
  year: number;
  month: number;
  status: string;
  total_minutes: number;
  submitted_at: string | null;
}

const pad = (n: number) => String(n).padStart(2, "0");
const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

function entryMinutes(e: Partial<TimeEntry>): number {
  if (!e.start_time || !e.end_time) return 0;
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map((n) => parseInt(n, 10));
    return Number.isNaN(h) || Number.isNaN(m) ? NaN : h * 60 + m;
  };
  const s = toMin(e.start_time);
  let en = toMin(e.end_time);
  if (Number.isNaN(s) || Number.isNaN(en)) return 0;
  if (en < s) en += 1440;
  const net = en - s - Math.max(0, e.break_minutes ?? 0);
  return net > 0 ? net : 0;
}

const fmtHours = (min: number) => `${Math.floor(min / 60)}:${pad(min % 60)} h`;
const fmtDecimal = (min: number) => (min / 60).toFixed(2).replace(".", ",");

export function TimeTrackingTab() {
  const { user } = useAuth();
  const { isAdmin, displayName } = useStaffAccess();
  const staffMembers = useStaffMembers();
  const { toast } = useToast();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [viewUserId, setViewUserId] = useState<string>(user?.id ?? "");
  const [entries, setEntries] = useState<Record<string, TimeEntry>>({});
  const [sheet, setSheet] = useState<Timesheet | null>(null);
  const [allSheets, setAllSheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (user?.id && !viewUserId) setViewUserId(user.id);
  }, [user?.id, viewUserId]);

  const isOwnSheet = viewUserId === user?.id;
  const locked = sheet?.status === "submitted" || !isOwnSheet;

  const load = useCallback(async () => {
    if (!viewUserId) return;
    setLoading(true);
    const first = `${year}-${pad(month)}-01`;
    const last = `${year}-${pad(month)}-${pad(daysInMonth(year, month))}`;

    const [{ data: rows }, { data: sheetRow }] = await Promise.all([
      supabase
        .from("staff_time_entries")
        .select("work_date, start_time, end_time, break_minutes, note, location")
        .eq("user_id", viewUserId)
        .gte("work_date", first)
        .lte("work_date", last),
      supabase
        .from("staff_timesheets")
        .select("*")
        .eq("user_id", viewUserId)
        .eq("year", year)
        .eq("month", month)
        .maybeSingle(),
    ]);

    const map: Record<string, TimeEntry> = {};
    for (const r of (rows as TimeEntry[] | null) ?? []) map[r.work_date] = r;
    setEntries(map);
    setSheet((sheetRow as Timesheet | null) ?? null);
    setLoading(false);
  }, [viewUserId, year, month]);

  useEffect(() => { load(); }, [load]);

  const loadSheets = useCallback(async () => {
    const query = supabase
      .from("staff_timesheets")
      .select("*")
      .eq("status", "submitted")
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(36);
    const { data } = isAdmin ? await query : await query.eq("user_id", user?.id ?? "");
    setAllSheets((data as Timesheet[] | null) ?? []);
  }, [isAdmin, user?.id]);

  useEffect(() => { loadSheets(); }, [loadSheets]);

  const days = useMemo(() => {
    const out: { iso: string; day: number; dow: number; weekend: boolean }[] = [];
    for (let d = 1; d <= daysInMonth(year, month); d++) {
      const dow = new Date(year, month - 1, d).getDay();
      out.push({ iso: `${year}-${pad(month)}-${pad(d)}`, day: d, dow, weekend: dow === 0 || dow === 6 });
    }
    return out;
  }, [year, month]);

  const total = useMemo(
    () => days.reduce((sum, d) => sum + entryMinutes(entries[d.iso] ?? {}), 0),
    [days, entries],
  );
  const workedDays = useMemo(
    () => days.filter((d) => entryMinutes(entries[d.iso] ?? {}) > 0).length,
    [days, entries],
  );

  const patchLocal = (iso: string, patch: Partial<TimeEntry>) => {
    setEntries((prev) => ({
      ...prev,
      [iso]: {
        work_date: iso,
        start_time: null,
        end_time: null,
        break_minutes: 0,
        note: null,
        location: null,
        ...prev[iso],
        ...patch,
      },
    }));
  };

  const persist = async (iso: string) => {
    if (locked || !user) return;
    const e = entries[iso];
    if (!e) return;
    setSaving(iso);
    const empty = !e.start_time && !e.end_time && !e.note && !e.break_minutes && !e.location;
    if (empty) {
      await supabase.from("staff_time_entries").delete().eq("user_id", user.id).eq("work_date", iso);
    } else {
      const { error } = await supabase.from("staff_time_entries").upsert(
        {
          user_id: user.id,
          work_date: iso,
          start_time: e.start_time || null,
          end_time: e.end_time || null,
          break_minutes: e.break_minutes ?? 0,
          note: e.note || null,
          location: e.location || null,
        },
        { onConflict: "user_id,work_date" },
      );
      if (error) toast({ title: "Speichern fehlgeschlagen", description: error.message, variant: "destructive" });
    }
    setSaving(null);
  };

  const shiftMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
  };

  const callFunction = async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("generate-timesheet", { body: payload });
    if (error) throw new Error(error.message);
    if ((data as any)?.error) throw new Error((data as any).error);
    return data as { pdf_base64: string; file_name: string; total_minutes: number };
  };

  const downloadPdf = async (y: number, m: number, uid?: string) => {
    setDownloading(true);
    try {
      const res = await callFunction({ year: y, month: m, action: "preview", user_id: uid });
      const bin = atob(res.pdf_base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = res.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({ title: "Download fehlgeschlagen", description: (err as Error).message, variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const submitMonth = async () => {
    setSubmitting(true);
    try {
      await callFunction({ year, month, action: "submit" });
      toast({
        title: "Monat bestätigt",
        description: `Der Arbeitszeitnachweis für ${MONTH_NAMES[month - 1]} ${year} wurde per E-Mail versendet.`,
      });
      setConfirmOpen(false);
      await Promise.all([load(), loadSheets()]);
    } catch (err) {
      toast({ title: "Bestätigung fehlgeschlagen", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Kopfzeile: Monat + ggf. Mitarbeiterauswahl */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)} aria-label="Vorheriger Monat">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[170px] text-center font-semibold">
            {MONTH_NAMES[month - 1]} {year}
          </div>
          <Button variant="outline" size="icon" onClick={() => shiftMonth(1)} aria-label="Nächster Monat">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {isAdmin && (
          <Select value={viewUserId} onValueChange={setViewUserId}>
            <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Mitarbeiter/in" /></SelectTrigger>
            <SelectContent>
              {user?.id && <SelectItem value={user.id}>Meine Zeiten ({displayName})</SelectItem>}
              {staffMembers
                .filter((m) => m.user_id !== user?.id)
                .map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {m.first_name} {m.last_name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {locked && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" />
          {sheet?.status === "submitted"
            ? `Monat wurde am ${sheet.submitted_at ? new Date(sheet.submitted_at).toLocaleDateString("de-DE") : ""} bestätigt und ist gesperrt.`
            : "Ansicht eines anderen Mitarbeitenden – nur lesbar."}
        </div>
      )}

      {/* Tageszeilen */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Lade Zeiten…</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Desktop-Kopfzeile */}
            <div className="hidden lg:grid grid-cols-[150px_110px_110px_100px_110px_1fr] gap-3 border-b bg-muted/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Datum</span>
              <span>Beginn</span>
              <span>Ende</span>
              <span>Pause (min)</span>
              <span className="text-center">Stunden</span>
              <span>Tätigkeit / Notiz</span>
            </div>
            <div className="divide-y">
              {days.map((d) => {
                const e = entries[d.iso];
                const min = entryMinutes(e ?? {});
                return (
                  <div
                    key={d.iso}
                    className={`px-3 py-3 lg:grid lg:grid-cols-[150px_110px_110px_100px_110px_1fr] lg:items-center lg:gap-3 lg:px-4 lg:py-2 ${
                      d.weekend ? "bg-muted/40" : ""
                    }`}
                  >
                    {/* Datum + Stundenanzeige (mobil in einer Zeile) */}
                    <div className="mb-2 flex items-center justify-between gap-2 lg:mb-0 lg:block">
                      <div className="text-sm font-semibold">
                        {WEEKDAY_SHORT[d.dow]}, {pad(d.day)}.{pad(month)}.{year}
                        {saving === d.iso && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">speichert…</span>
                        )}
                      </div>
                      <span
                        className={`rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums lg:hidden ${
                          min > 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {min > 0 ? fmtHours(min) : "–"}
                      </span>
                    </div>

                    {/* Zeitfelder: mobil mit sichtbaren Beschriftungen */}
                    <div className="grid grid-cols-3 gap-2 lg:contents">
                      <div className="space-y-1 lg:space-y-0">
                        <label className="block text-[11px] font-medium text-muted-foreground lg:hidden" htmlFor={`start-${d.iso}`}>
                          Beginn
                        </label>
                        <Input
                          id={`start-${d.iso}`}
                          type="time"
                          className="w-full"
                          value={e?.start_time?.slice(0, 5) ?? ""}
                          disabled={locked}
                          onChange={(ev) => patchLocal(d.iso, { start_time: ev.target.value || null })}
                          onBlur={() => persist(d.iso)}
                          aria-label={`Beginn ${d.iso}`}
                        />
                      </div>
                      <div className="space-y-1 lg:space-y-0">
                        <label className="block text-[11px] font-medium text-muted-foreground lg:hidden" htmlFor={`end-${d.iso}`}>
                          Ende
                        </label>
                        <Input
                          id={`end-${d.iso}`}
                          type="time"
                          className="w-full"
                          value={e?.end_time?.slice(0, 5) ?? ""}
                          disabled={locked}
                          onChange={(ev) => patchLocal(d.iso, { end_time: ev.target.value || null })}
                          onBlur={() => persist(d.iso)}
                          aria-label={`Ende ${d.iso}`}
                        />
                      </div>
                      <div className="space-y-1 lg:space-y-0">
                        <label className="block text-[11px] font-medium text-muted-foreground lg:hidden" htmlFor={`break-${d.iso}`}>
                          Pause (min)
                        </label>
                        <Input
                          id={`break-${d.iso}`}
                          type="number"
                          min={0}
                          step={5}
                          inputMode="numeric"
                          placeholder="0"
                          className="w-full"
                          value={e?.break_minutes ?? ""}
                          disabled={locked}
                          onChange={(ev) =>
                            patchLocal(d.iso, { break_minutes: ev.target.value === "" ? 0 : Number(ev.target.value) })
                          }
                          onBlur={() => persist(d.iso)}
                          aria-label={`Pause ${d.iso}`}
                        />
                      </div>
                    </div>

                    {/* Stunden (nur Desktop, mittig) */}
                    <div
                      className={`hidden text-center text-sm font-semibold tabular-nums lg:block ${
                        min > 0 ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {min > 0 ? fmtHours(min) : "–"}
                    </div>

                    {/* Notiz + Standort */}
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_150px] lg:mt-0">
                      <div className="space-y-1 lg:space-y-0">
                        <label className="block text-[11px] font-medium text-muted-foreground lg:hidden" htmlFor={`note-${d.iso}`}>
                          Tätigkeit / Notiz
                        </label>
                        <Input
                          id={`note-${d.iso}`}
                          placeholder="Tätigkeit / Notiz"
                          value={e?.note ?? ""}
                          disabled={locked}
                          onChange={(ev) => patchLocal(d.iso, { note: ev.target.value })}
                          onBlur={() => persist(d.iso)}
                          aria-label={`Notiz ${d.iso}`}
                        />
                      </div>
                      <div className="space-y-1 lg:space-y-0">
                        <label className="block text-[11px] font-medium text-muted-foreground lg:hidden">Standort</label>
                        <Select
                          value={e?.location ?? "none"}
                          disabled={locked}
                          onValueChange={(v) => {
                            patchLocal(d.iso, { location: v === "none" ? null : v });
                            setTimeout(() => persist(d.iso), 0);
                          }}
                        >
                          <SelectTrigger className="w-full min-w-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Standort</SelectItem>
                            {LOCATIONS.map((l) => (
                              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}


      {/* Summe + Aktionen */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Gesamt {MONTH_NAMES[month - 1]} {year}</p>
            <p className="text-2xl font-bold text-primary">
              {fmtHours(total)} <span className="text-base font-medium text-muted-foreground">({fmtDecimal(total)} Std.)</span>
            </p>
            <p className="text-xs text-muted-foreground">{workedDays} Tage mit erfasster Arbeitszeit</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" disabled={downloading} onClick={() => downloadPdf(year, month, viewUserId)}>
              <Download className="mr-2 h-4 w-4" /> PDF herunterladen
            </Button>
            {isOwnSheet && sheet?.status !== "submitted" && (
              <Button disabled={total === 0} onClick={() => setConfirmOpen(true)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Monat bestätigen &amp; senden
              </Button>
            )}
            {sheet?.status === "submitted" && (
              <Badge variant="secondary" className="justify-center py-2">
                <CheckCircle2 className="mr-1 h-4 w-4" /> Bestätigt
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Archiv */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Bestätigte Monatsnachweise</h3>
        {allSheets.length === 0 && (
          <p className="text-sm text-muted-foreground">Noch keine bestätigten Monate.</p>
        )}
        {allSheets.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <span className="font-medium">{MONTH_NAMES[s.month - 1]} {s.year}</span>
                {isAdmin && s.staff_name && <span className="text-muted-foreground"> · {s.staff_name}</span>}
                <span className="text-muted-foreground"> · {fmtHours(s.total_minutes)}</span>
              </div>
              <Button size="sm" variant="outline" disabled={downloading} onClick={() => downloadPdf(s.year, s.month, s.user_id)}>
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{MONTH_NAMES[month - 1]} {year} bestätigen?</AlertDialogTitle>
            <AlertDialogDescription>
              Du bestätigst {fmtHours(total)} ({fmtDecimal(total)} Std.) geleistete Arbeitszeit. Der Monat wird
              danach für Änderungen gesperrt, als PDF archiviert und per E-Mail an dich und die Verwaltung gesendet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction disabled={submitting} onClick={(ev) => { ev.preventDefault(); submitMonth(); }}>
              {submitting ? "Wird gesendet…" : "Bestätigen & senden"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TimeTrackingTab;
