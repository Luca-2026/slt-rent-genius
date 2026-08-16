import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, CalendarDays, Plus, Trash2, Truck, User } from "lucide-react";
import { LOCATIONS, TRANSFER_STATUS_LABELS, locationLabel, type MaterialTransfer } from "./types";
import { EquipmentCombobox } from "./EquipmentCombobox";

const STATUS_FLOW = ["offen", "eingeplant", "unterwegs", "erledigt"] as const;

/** Montag der Woche zu einem Datum (lokal, ohne Zeitzonen-Drift). */
function weekStart(dateStr: string): Date {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = (d.getDay() + 6) % 7; // Mo = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isoWeekNumber(d: Date) {
  const t = new Date(d.getTime());
  t.setDate(t.getDate() + 3);
  const firstThursday = new Date(t.getFullYear(), 0, 4);
  const diff = t.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 86400000));
}

const fmtDay = (d: Date) => d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });

interface WeekGroup {
  key: string;
  label: string;
  sublabel: string;
  monday: Date | null;
  routes: RouteGroup[];
  count: number;
}

interface RouteGroup {
  key: string;
  from: string;
  to: string;
  items: MaterialTransfer[];
}

export function MaterialDispoTab() {
  const { user } = useAuth();
  const { displayName, isAdmin } = useStaffAccess();
  const { toast } = useToast();

  const [transfers, setTransfers] = useState<MaterialTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("open");

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [fromLocation, setFromLocation] = useState("krefeld");
  const [toLocation, setToLocation] = useState("bonn");
  const [tourDate, setTourDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("staff_material_transfers")
      .select("*")
      .order("tour_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    setTransfers((data as MaterialTransfer[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setItemName("");
    setQuantity("1");
    setFromLocation("krefeld");
    setToLocation("bonn");
    setTourDate("");
    setNotes("");
  };

  /** Dialog öffnen und optional mit Route/Datum einer bestehenden Tour vorbelegen. */
  const openDialog = (prefill?: { from: string; to: string; date?: string | null }) => {
    setItemName("");
    setQuantity("1");
    setNotes("");
    setFromLocation(prefill?.from ?? "krefeld");
    setToLocation(prefill?.to ?? "bonn");
    setTourDate(prefill?.date ?? "");
    setDialogOpen(true);
  };

  const createTransfer = async () => {
    if (!user) return;
    if (!itemName.trim()) {
      toast({ title: "Artikel fehlt", description: "Bitte trage ein, was transportiert werden soll.", variant: "destructive" });
      return;
    }
    if (fromLocation === toLocation) {
      toast({ title: "Standorte gleich", description: "Von- und Nach-Standort müssen sich unterscheiden.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("staff_material_transfers").insert({
      item_name: itemName.trim(),
      quantity: Math.max(1, Number(quantity) || 1),
      from_location: fromLocation,
      to_location: toLocation,
      tour_date: tourDate || null,
      notes: notes.trim() || null,
      status: tourDate ? "eingeplant" : "offen",
      created_by: user.id,
      created_by_name: displayName,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Eingetragen", description: "Der Materialtransfer wurde angelegt." });
    resetForm();
    setDialogOpen(false);
    load();
  };

  const advanceStatus = async (list: MaterialTransfer[]) => {
    const updates = list
      .map((t) => {
        const idx = STATUS_FLOW.indexOf(t.status as (typeof STATUS_FLOW)[number]);
        const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
        return next === t.status ? null : { id: t.id, next };
      })
      .filter(Boolean) as { id: string; next: string }[];
    if (!updates.length) return;
    await Promise.all(
      updates.map((u) =>
        supabase
          .from("staff_material_transfers")
          .update({ status: u.next, done_at: u.next === "erledigt" ? new Date().toISOString() : null })
          .eq("id", u.id),
      ),
    );
    load();
  };

  const removeTransfer = async (id: string) => {
    await supabase.from("staff_material_transfers").delete().eq("id", id);
    load();
  };

  /** Tour übernehmen bzw. Zuweisung wieder freigeben – für alle Positionen der Tour. */
  const toggleAssignment = async (list: MaterialTransfer[]) => {
    if (!user || !list.length) return;
    const mine = list.every((t) => t.assigned_to === user.id);
    const payloadFor = (t: MaterialTransfer) =>
      mine
        ? { assigned_to: null, assigned_name: null, assigned_at: null }
        : {
            assigned_to: user.id,
            assigned_name: displayName,
            assigned_at: new Date().toISOString(),
            status: t.status === "offen" ? "eingeplant" : t.status,
          };
    const results = await Promise.all(
      list.map((t) => supabase.from("staff_material_transfers").update(payloadFor(t)).eq("id", t.id)),
    );
    const error = results.find((r) => r.error)?.error;
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: mine ? "Zuweisung aufgehoben" : "Tour übernommen",
      description: mine
        ? "Die Tour ist wieder offen für alle."
        : `${list.length} Position${list.length === 1 ? "" : "en"} sind dir zugewiesen.`,
    });
    load();
  };

  const visible = transfers.filter((t) => {
    switch (filter) {
      case "open":
        return t.status !== "erledigt";
      case "unassigned":
        return t.status !== "erledigt" && !t.assigned_to;
      case "mine":
        return t.status !== "erledigt" && t.assigned_to === user?.id;
      case "done":
        return t.status === "erledigt";
      default:
        return true;
    }
  });

  /** Nach Kalenderwoche (Mo–So) und darin nach Route bündeln. */
  const weeks: WeekGroup[] = useMemo(() => {
    const map = new Map<string, WeekGroup>();
    for (const t of visible) {
      let key = "no-date";
      let label = "Ohne Termin";
      let sublabel = "Noch keiner Tour zugeordnet";
      let monday: Date | null = null;
      if (t.tour_date) {
        monday = weekStart(t.tour_date);
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        key = isoKey(monday);
        label = `KW ${isoWeekNumber(monday)}`;
        sublabel = `${fmtDay(monday)} – ${sunday.toLocaleDateString("de-DE")}`;
      }
      let group = map.get(key);
      if (!group) {
        group = { key, label, sublabel, monday, routes: [], count: 0 };
        map.set(key, group);
      }
      const routeKey = `${t.from_location}>${t.to_location}`;
      let route = group.routes.find((r) => r.key === routeKey);
      if (!route) {
        route = { key: routeKey, from: t.from_location, to: t.to_location, items: [] };
        group.routes.push(route);
      }
      route.items.push(t);
      group.count += 1;
    }
    return [...map.values()].sort((a, b) => {
      if (!a.monday) return 1;
      if (!b.monday) return -1;
      return a.monday.getTime() - b.monday.getTime();
    });
  }, [visible]);

  const [openWeeks, setOpenWeeks] = useState<string[]>([]);
  const [weeksInit, setWeeksInit] = useState(false);
  useEffect(() => {
    if (weeksInit || loading || weeks.length === 0) return;
    setOpenWeeks(weeks.slice(0, 2).map((w) => w.key));
    setWeeksInit(true);
  }, [weeks, weeksInit, loading]);

  const openCount = transfers.filter((t) => t.status !== "erledigt").length;
  const unassignedCount = transfers.filter((t) => t.status !== "erledigt" && !t.assigned_to).length;
  const mineCount = transfers.filter((t) => t.status !== "erledigt" && t.assigned_to === user?.id).length;
  const doneCount = transfers.filter((t) => t.status === "erledigt").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Offene Transporte ({openCount})</SelectItem>
            <SelectItem value="unassigned">Ohne Zuweisung ({unassignedCount})</SelectItem>
            <SelectItem value="mine">Mir zugewiesen ({mineCount})</SelectItem>
            <SelectItem value="done">Erledigt ({doneCount})</SelectItem>
            <SelectItem value="all">Alle ({transfers.length})</SelectItem>
          </SelectContent>
        </Select>

        <Button className="w-full sm:w-auto" onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-1" /> Material eintragen
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg">Material zwischen Standorten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 min-w-0">
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="mat-name">Artikel / Equipment *</Label>
              <EquipmentCombobox
                id="mat-name"
                value={itemName}
                onChange={setItemName}
                location={fromLocation}
                placeholder="z. B. Rüttelplatte VP 25-50"
              />
              <p className="text-xs text-muted-foreground">
                Aus dem Mietartikel-Katalog wählen oder freien Text eintragen.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
              <div className="space-y-1.5 min-w-0">
                <Label htmlFor="mat-qty">Menge</Label>
                <Input id="mat-qty" type="number" min={1} inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full min-w-0" />
              </div>
              <div className="space-y-1.5 min-w-0">
                <Label htmlFor="mat-date">Tour am</Label>
                <Input id="mat-date" type="date" value={tourDate} onChange={(e) => setTourDate(e.target.value)} className="w-full min-w-0" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
              <div className="space-y-1.5 min-w-0">
                <Label>Von</Label>
                <Select value={fromLocation} onValueChange={setFromLocation}>
                  <SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 min-w-0">
                <Label>Nach</Label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="mat-notes">Notiz</Label>
              <Textarea id="mat-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={500} placeholder="z. B. inkl. Transportkiste, vor 10 Uhr benötigt" />
            </div>
            <Button className="w-full" onClick={createTransfer} disabled={saving}>
              Eintragen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading && <p className="text-sm text-muted-foreground">Lade Materialdispo…</p>}
      {!loading && weeks.length === 0 && (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Keine Einträge.</CardContent></Card>
      )}

      <Accordion type="multiple" value={openWeeks} onValueChange={setOpenWeeks} className="space-y-3">
        {weeks.map((week) => (
          <AccordionItem key={week.key} value={week.key} className="border rounded-lg bg-card px-3 sm:px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{week.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{week.sublabel}</div>
                </div>
                <Badge variant="secondary" className="ml-auto mr-2 shrink-0">
                  {week.count} Pos.
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {week.routes.map((route) => {
                const openItems = route.items.filter((t) => t.status !== "erledigt");
                const assignedNames = [...new Set(route.items.map((t) => t.assigned_name).filter(Boolean))] as string[];
                const allMine = openItems.length > 0 && openItems.every((t) => t.assigned_to === user?.id);
                const someoneElse =
                  openItems.length > 0 && openItems.some((t) => t.assigned_to && t.assigned_to !== user?.id);
                const nextStatus =
                  openItems.length > 0
                    ? STATUS_FLOW[
                        Math.min(
                          STATUS_FLOW.indexOf(openItems[0].status as (typeof STATUS_FLOW)[number]) + 1,
                          STATUS_FLOW.length - 1,
                        )
                      ]
                    : null;

                return (
                  <div key={route.key} className="rounded-lg border bg-background p-3 space-y-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
                      <Truck className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="break-words">{locationLabel(route.from)}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="break-words">{locationLabel(route.to)}</span>
                    </div>

                    <div className="text-xs">
                      {assignedNames.length ? (
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 shrink-0 text-primary" />
                          Fährt: <span className="font-medium break-words">{assignedNames.join(", ")}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-600">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          Noch niemand zugewiesen
                        </span>
                      )}
                    </div>

                    <ul className="divide-y rounded-md border">
                      {route.items.map((t) => (
                        <li key={t.id} className="p-2.5 space-y-1">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium break-words leading-snug">{t.item_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {t.quantity} Stk.
                                {t.tour_date ? ` · ${new Date(t.tour_date).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })}` : ""}
                                {t.created_by_name ? ` · ${t.created_by_name}` : ""}
                              </div>
                            </div>
                            <Badge
                              variant={t.status === "erledigt" ? "secondary" : "default"}
                              className="shrink-0 text-[11px]"
                            >
                              {TRANSFER_STATUS_LABELS[t.status] ?? t.status}
                            </Badge>
                            {(isAdmin || t.created_by === user?.id) && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 shrink-0 text-muted-foreground"
                                onClick={() => removeTransfer(t.id)}
                                aria-label="Position löschen"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                          {t.notes && (
                            <p className="text-xs text-muted-foreground whitespace-pre-line break-words">{t.notes}</p>
                          )}
                        </li>
                      ))}
                    </ul>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          openDialog({ from: route.from, to: route.to, date: route.items[0]?.tour_date })
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" /> Artikel hinzufügen
                      </Button>
                      {openItems.length > 0 && (
                        <Button
                          size="sm"
                          variant={allMine ? "ghost" : "secondary"}
                          className="w-full"
                          onClick={() => toggleAssignment(openItems)}
                          disabled={someoneElse && !allMine && !isAdmin}
                        >
                          {allMine ? "Zuweisung aufheben" : "Tour übernehmen"}
                        </Button>
                      )}
                      {openItems.length > 0 && nextStatus && (
                        <Button
                          size="sm"
                          className="w-full sm:col-span-2"
                          onClick={() => advanceStatus(openItems)}
                        >
                          Tour weiter zu „{TRANSFER_STATUS_LABELS[nextStatus]}“
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
