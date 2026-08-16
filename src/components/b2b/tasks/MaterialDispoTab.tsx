import { useCallback, useEffect, useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Plus, Trash2, Truck, User } from "lucide-react";
import { LOCATIONS, TRANSFER_STATUS_LABELS, locationLabel, type MaterialTransfer } from "./types";
import { EquipmentCombobox } from "./EquipmentCombobox";

const STATUS_FLOW = ["offen", "eingeplant", "unterwegs", "erledigt"] as const;

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

  const advanceStatus = async (transfer: MaterialTransfer) => {
    const idx = STATUS_FLOW.indexOf(transfer.status as (typeof STATUS_FLOW)[number]);
    const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
    if (next === transfer.status) return;
    await supabase
      .from("staff_material_transfers")
      .update({ status: next, done_at: next === "erledigt" ? new Date().toISOString() : null })
      .eq("id", transfer.id);
    load();
  };

  const removeTransfer = async (id: string) => {
    await supabase.from("staff_material_transfers").delete().eq("id", id);
    load();
  };

  /** Tour übernehmen bzw. Zuweisung wieder freigeben. */
  const toggleAssignment = async (transfer: MaterialTransfer) => {
    if (!user) return;
    const mine = transfer.assigned_to === user.id;
    const { error } = await supabase
      .from("staff_material_transfers")
      .update(
        mine
          ? { assigned_to: null, assigned_name: null, assigned_at: null }
          : {
              assigned_to: user.id,
              assigned_name: displayName,
              assigned_at: new Date().toISOString(),
              status: transfer.status === "offen" ? "eingeplant" : transfer.status,
            },
      )
      .eq("id", transfer.id);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: mine ? "Zuweisung aufgehoben" : "Tour übernommen",
      description: mine ? "Der Transport ist wieder offen für alle." : `${transfer.item_name} ist dir zugewiesen.`,
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


        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-1" /> Material eintragen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Material zwischen Standorten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="mat-qty">Menge</Label>
                  <Input id="mat-qty" type="number" min={1} inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mat-date">Tour am</Label>
                  <Input id="mat-date" type="date" value={tourDate} onChange={(e) => setTourDate(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Von</Label>
                  <Select value={fromLocation} onValueChange={setFromLocation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Nach</Label>
                  <Select value={toLocation} onValueChange={setToLocation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mat-notes">Notiz</Label>
                <Textarea id="mat-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={500} placeholder="z. B. inkl. Transportkiste, vor 10 Uhr benötigt" />
              </div>
              <Button className="w-full" onClick={createTransfer} disabled={saving}>
                Eintragen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Lade Materialdispo…</p>}
      {!loading && visible.length === 0 && (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Keine Einträge.</CardContent></Card>
      )}

      <div className="space-y-3">
        {visible.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm break-words">{t.item_name}</div>
                  <div className="text-xs text-muted-foreground">{t.quantity} Stk.</div>
                </div>
                <Badge variant={t.status === "erledigt" ? "secondary" : "default"} className="shrink-0">
                  {TRANSFER_STATUS_LABELS[t.status] ?? t.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="break-words">{locationLabel(t.from_location)}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="break-words">{locationLabel(t.to_location)}</span>
              </div>

              <div className="text-xs text-muted-foreground break-words">
                {t.tour_date ? `Tour: ${new Date(t.tour_date).toLocaleDateString("de-DE")}` : "Tour noch offen"}
                {t.created_by_name ? ` · von ${t.created_by_name}` : ""}
              </div>

              <div className="text-xs">
                {t.assigned_to ? (
                  <span className="inline-flex items-center gap-1.5 text-foreground">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    Fährt: <span className="font-medium break-words">{t.assigned_name || "Mitarbeiter"}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-600">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    Noch niemand zugewiesen
                  </span>
                )}
                {t.status === "erledigt" && t.done_at && (
                  <span className="block text-muted-foreground mt-1">
                    Erledigt am {new Date(t.done_at).toLocaleDateString("de-DE")}
                  </span>
                )}
              </div>

              {t.notes && <p className="text-sm text-muted-foreground whitespace-pre-line break-words">{t.notes}</p>}

              <div className="flex flex-wrap gap-2">
                {t.status !== "erledigt" && (
                  <>
                    <Button
                      size="sm"
                      variant={t.assigned_to === user?.id ? "ghost" : "secondary"}
                      className="flex-1 min-w-[140px]"
                      onClick={() => toggleAssignment(t)}
                      disabled={!!t.assigned_to && t.assigned_to !== user?.id && !isAdmin}
                    >
                      {t.assigned_to === user?.id
                        ? "Zuweisung aufheben"
                        : t.assigned_to
                          ? "Übernehmen"
                          : "Tour übernehmen"}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 min-w-[140px]" onClick={() => advanceStatus(t)}>
                      Weiter zu „{TRANSFER_STATUS_LABELS[STATUS_FLOW[Math.min(STATUS_FLOW.indexOf(t.status as any) + 1, STATUS_FLOW.length - 1)]]}"
                    </Button>
                  </>
                )}
                {(isAdmin || t.created_by === user?.id) && (
                  <Button size="sm" variant="ghost" onClick={() => removeTransfer(t.id)} aria-label="Eintrag löschen">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
