/**
 * Verwaltung der Einzelartikel (Instances) eines CMS-Produkts.
 * Master/Detail:
 *  - Liste aller Einzelartikel (Seriennummer, Inv-Nr, Standort, Status, Betriebsstunden)
 *  - Detail: Betriebsstunden nachtragen + Wartungsintervalle + Wartungshistorie
 */
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, ArrowLeft, CheckCircle2, Plus, Trash2, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  useProductInstances, useMaintenanceIntervals, useMaintenanceLog,
  useInvalidateInstances, useCompleteMaintenance,
  type ProductInstance, type MaintenanceInterval, type IntervalType,
} from "@/hooks/useProductInstances";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId: string | null;
  productName: string;
  productCategory: string;
  availableLocations: string[];
}

const LOC_LABEL: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim" };
const STATUS: { value: ProductInstance["status"]; label: string; variant: "default" | "secondary" | "destructive" | "outline" }[] = [
  { value: "available", label: "Verfügbar", variant: "default" },
  { value: "rented", label: "Vermietet", variant: "secondary" },
  { value: "maintenance", label: "In Wartung", variant: "outline" },
  { value: "repair", label: "In Reparatur", variant: "outline" },
  { value: "retired", label: "Ausgemustert", variant: "destructive" },
  { value: "lost", label: "Verlust", variant: "destructive" },
];

/** Vorschläge für Wartungstitel abhängig von der Kategorie. */
function getMaintenanceSuggestions(category: string): Array<{ title: string; type: IntervalType; value: number | null }> {
  const c = category.toLowerCase();
  const isElectrical = /(elektro|strom|licht|beleuchtung|beschallung|ton|kabel|verteiler|stromerzeuger|generator|kuechen|geschirr)/i.test(c);
  const isMachine = /(bagger|erdbewegung|lader|walze|stampfer|rüttel|kompressor|maschine|antrieb)/i.test(c);

  const s: Array<{ title: string; type: IntervalType; value: number | null }> = [];
  if (isElectrical) {
    s.push({ title: "DGUV V3 Prüfung", type: "years", value: 1 });
  }
  if (isMachine) {
    s.push({ title: "Ölwechsel", type: "hours", value: 250 });
    s.push({ title: "Filterwechsel", type: "hours", value: 500 });
    s.push({ title: "Jahres-Inspektion", type: "years", value: 1 });
    s.push({ title: "UVV-Prüfung", type: "years", value: 1 });
  }
  if (!s.length) {
    s.push({ title: "Sicht- und Funktionsprüfung", type: "years", value: 1 });
  }
  return s;
}

export function ProductInstancesDialog({
  open, onOpenChange, productId, productName, productCategory, availableLocations,
}: Props) {
  const [selectedInstance, setSelectedInstance] = useState<ProductInstance | null>(null);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setSelectedInstance(null); onOpenChange(v); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Einzelartikel-Bestand: {productName}
          </DialogTitle>
          <DialogDescription>
            Verwalte physische Geräte einzeln – Seriennummer, Betriebsstunden, Wartungen. Nicht öffentlich sichtbar.
          </DialogDescription>
        </DialogHeader>

        {!productId ? null : selectedInstance ? (
          <InstanceDetail
            instance={selectedInstance}
            productCategory={productCategory}
            onBack={() => setSelectedInstance(null)}
          />
        ) : (
          <InstancesList
            productId={productId}
            availableLocations={availableLocations}
            onSelect={setSelectedInstance}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Liste aller Einzelartikel
// ============================================================
function InstancesList({
  productId, availableLocations, onSelect,
}: { productId: string; availableLocations: string[]; onSelect: (i: ProductInstance) => void }) {
  const { data: instances = [], isLoading, refetch } = useProductInstances(productId);
  const invalidate = useInvalidateInstances();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    serial_number: "",
    internal_inventory_number: "",
    location: availableLocations[0] ?? "krefeld",
    status: "available" as ProductInstance["status"],
    purchase_date: "",
    purchase_price: "",
    supplier: "",
    current_operating_hours: "",
    notes: "",
  });

  async function save() {
    const payload: Record<string, unknown> = {
      managed_product_id: productId,
      serial_number: form.serial_number.trim() || null,
      internal_inventory_number: form.internal_inventory_number.trim() || null,
      location: form.location,
      status: form.status,
      purchase_date: form.purchase_date || null,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      supplier: form.supplier.trim() || null,
      current_operating_hours: form.current_operating_hours ? Number(form.current_operating_hours) : 0,
      notes: form.notes.trim() || null,
    };
    const { error } = await (supabase.from("b2b_product_instances" as never) as any).insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Einzelartikel angelegt");
    setAdding(false);
    setForm({ ...form, serial_number: "", internal_inventory_number: "", purchase_date: "", purchase_price: "", supplier: "", current_operating_hours: "", notes: "" });
    invalidate(productId);
    refetch();
  }

  async function del(id: string) {
    if (!confirm("Einzelartikel wirklich löschen? Wartungshistorie geht mit verloren.")) return;
    const { error } = await (supabase.from("b2b_product_instances" as never) as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Gelöscht");
    invalidate(productId);
    refetch();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {instances.length} Einzelartikel {instances.length ? `(${instances.filter(i => i.status === "available").length} verfügbar)` : ""}
        </p>
        <Button size="sm" onClick={() => setAdding(!adding)}>
          <Plus className="h-4 w-4 mr-1" /> {adding ? "Abbrechen" : "Neuer Einzelartikel"}
        </Button>
      </div>

      {adding && (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Seriennummer">
              <Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} />
            </Field>
            <Field label="Interne Inv.-Nr.">
              <Input value={form.internal_inventory_number} onChange={(e) => setForm({ ...form, internal_inventory_number: e.target.value })} />
            </Field>
            <Field label="Standort *">
              <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(availableLocations.length ? availableLocations : ["krefeld", "bonn", "muelheim"]).map((l) => (
                    <SelectItem key={l} value={l}>{LOC_LABEL[l] ?? l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Kaufdatum">
              <Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
            </Field>
            <Field label="Kaufpreis (€)">
              <Input type="number" step="0.01" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} />
            </Field>
            <Field label="Lieferant">
              <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
            </Field>
            <Field label="Betriebsstunden (Start)">
              <Input type="number" step="0.1" value={form.current_operating_hours} onChange={(e) => setForm({ ...form, current_operating_hours: e.target.value })} />
            </Field>
          </div>
          <Field label="Notizen">
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <Button onClick={save}>Speichern</Button>
        </div>
      )}

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inv.-Nr. / Serial</TableHead>
              <TableHead>Standort</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Betr.-Std.</TableHead>
              <TableHead>Kaufdatum</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Lade …</TableCell></TableRow>}
            {!isLoading && !instances.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Noch keine Einzelartikel erfasst. Über „Neuer Einzelartikel" anlegen.</TableCell></TableRow>}
            {instances.map((i) => {
              const st = STATUS.find((s) => s.value === i.status);
              return (
                <TableRow key={i.id} className="cursor-pointer hover:bg-muted/40" onClick={() => onSelect(i)}>
                  <TableCell>
                    <div className="font-medium">{i.internal_inventory_number ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{i.serial_number ?? "keine Seriennr."}</div>
                  </TableCell>
                  <TableCell>{LOC_LABEL[i.location]}</TableCell>
                  <TableCell><Badge variant={st?.variant ?? "outline"}>{st?.label}</Badge></TableCell>
                  <TableCell>{i.current_operating_hours ?? 0} h</TableCell>
                  <TableCell className="text-xs">{i.purchase_date ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); del(i.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============================================================
// Detail: ein Einzelartikel
// ============================================================
function InstanceDetail({
  instance, productCategory, onBack,
}: { instance: ProductInstance; productCategory: string; onBack: () => void }) {
  const invalidate = useInvalidateInstances();
  const [tab, setTab] = useState("stammdaten");

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Zurück zur Liste
      </Button>

      <div className="border rounded-lg p-3 bg-muted/30 flex flex-wrap gap-4 text-sm">
        <div><span className="text-muted-foreground">Inv.-Nr.:</span> <b>{instance.internal_inventory_number ?? "—"}</b></div>
        <div><span className="text-muted-foreground">Serial:</span> <b>{instance.serial_number ?? "—"}</b></div>
        <div><span className="text-muted-foreground">Standort:</span> <b>{LOC_LABEL[instance.location]}</b></div>
        <div><span className="text-muted-foreground">Betriebsstunden:</span> <b>{instance.current_operating_hours ?? 0} h</b></div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="stammdaten">Stammdaten</TabsTrigger>
          <TabsTrigger value="hours">Betriebsstunden</TabsTrigger>
          <TabsTrigger value="intervals">Wartungsintervalle</TabsTrigger>
          <TabsTrigger value="history">Historie</TabsTrigger>
        </TabsList>

        <TabsContent value="stammdaten">
          <StammdatenTab instance={instance} onSaved={() => invalidate(instance.managed_product_id, instance.id)} />
        </TabsContent>
        <TabsContent value="hours">
          <HoursTab instance={instance} onSaved={() => invalidate(instance.managed_product_id, instance.id)} />
        </TabsContent>
        <TabsContent value="intervals">
          <IntervalsTab instance={instance} productCategory={productCategory} onChanged={() => invalidate(instance.managed_product_id, instance.id)} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab instanceId={instance.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StammdatenTab({ instance, onSaved }: { instance: ProductInstance; onSaved: () => void }) {
  const [form, setForm] = useState({
    serial_number: instance.serial_number ?? "",
    internal_inventory_number: instance.internal_inventory_number ?? "",
    location: instance.location,
    status: instance.status,
    purchase_date: instance.purchase_date ?? "",
    purchase_price: instance.purchase_price?.toString() ?? "",
    supplier: instance.supplier ?? "",
    notes: instance.notes ?? "",
  });

  async function save() {
    const { error } = await (supabase.from("b2b_product_instances" as never) as any)
      .update({
        serial_number: form.serial_number.trim() || null,
        internal_inventory_number: form.internal_inventory_number.trim() || null,
        location: form.location,
        status: form.status,
        purchase_date: form.purchase_date || null,
        purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
        supplier: form.supplier.trim() || null,
        notes: form.notes.trim() || null,
      })
      .eq("id", instance.id);
    if (error) return toast.error(error.message);
    toast.success("Gespeichert");
    onSaved();
  }

  return (
    <div className="space-y-3 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Seriennummer"><Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} /></Field>
        <Field label="Interne Inv.-Nr."><Input value={form.internal_inventory_number} onChange={(e) => setForm({ ...form, internal_inventory_number: e.target.value })} /></Field>
        <Field label="Standort">
          <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(LOC_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Kaufdatum"><Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} /></Field>
        <Field label="Kaufpreis (€)"><Input type="number" step="0.01" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} /></Field>
        <Field label="Lieferant"><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></Field>
      </div>
      <Field label="Notizen"><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      <Button onClick={save}>Speichern</Button>
    </div>
  );
}

function HoursTab({ instance, onSaved }: { instance: ProductInstance; onSaved: () => void }) {
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");

  async function add() {
    const h = Number(hours);
    if (!Number.isFinite(h) || h < 0) return toast.error("Ungültige Stundenangabe");
    const { error: e1 } = await (supabase.from("b2b_instance_hours_log" as never) as any)
      .insert({ instance_id: instance.id, hours: h, note: note.trim() || null });
    if (e1) return toast.error(e1.message);
    if (h > (instance.current_operating_hours ?? 0)) {
      await (supabase.from("b2b_product_instances" as never) as any)
        .update({ current_operating_hours: h }).eq("id", instance.id);
    }
    toast.success("Betriebsstunden eingetragen");
    setHours(""); setNote(""); onSaved();
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="border rounded-lg p-3 flex gap-3 items-end bg-muted/30">
        <Field label="Neuer Zählerstand (h)">
          <Input type="number" step="0.1" value={hours} onChange={(e) => setHours(e.target.value)} />
        </Field>
        <Field label="Notiz (optional)">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="z.B. abgelesen bei Rückgabe" />
        </Field>
        <Button onClick={add}>Eintragen</Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Aktueller Stand: <b>{instance.current_operating_hours ?? 0} h</b>.
        Der Zählerstand wird nur erhöht, wenn der neue Wert größer ist.
      </p>
    </div>
  );
}

function IntervalsTab({ instance, productCategory, onChanged }: { instance: ProductInstance; productCategory: string; onChanged: () => void }) {
  const { data: intervals = [], refetch } = useMaintenanceIntervals(instance.id);
  const suggestions = useMemo(() => getMaintenanceSuggestions(productCategory), [productCategory]);
  const complete = useCompleteMaintenance();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    interval_type: "years" as IntervalType,
    interval_value: "1",
    next_due_at: "",
    next_due_hours: "",
    warn_days_before: "14",
    notes: "",
  });

  async function addSuggestion(s: { title: string; type: IntervalType; value: number | null }) {
    const nextDue = s.type === "hours"
      ? { next_due_hours: (instance.current_operating_hours ?? 0) + (s.value ?? 0) }
      : { next_due_at: dateInMonths(s.type === "years" ? (s.value ?? 1) * 12 : s.type === "months" ? (s.value ?? 1) : s.type === "days" ? Math.round((s.value ?? 1) / 30) : 12) };
    const { error } = await (supabase.from("b2b_maintenance_intervals" as never) as any).insert({
      instance_id: instance.id,
      title: s.title,
      interval_type: s.type,
      interval_value: s.value,
      warn_days_before: 14,
      ...nextDue,
    });
    if (error) return toast.error(error.message);
    toast.success("Intervall angelegt");
    refetch();
  }

  async function addCustom() {
    if (!form.title.trim()) return toast.error("Titel fehlt");
    const { error } = await (supabase.from("b2b_maintenance_intervals" as never) as any).insert({
      instance_id: instance.id,
      title: form.title.trim(),
      interval_type: form.interval_type,
      interval_value: form.interval_value ? Number(form.interval_value) : null,
      next_due_at: form.next_due_at || null,
      next_due_hours: form.next_due_hours ? Number(form.next_due_hours) : null,
      warn_days_before: form.warn_days_before ? Number(form.warn_days_before) : 14,
      notes: form.notes.trim() || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Intervall angelegt");
    setAdding(false);
    setForm({ title: "", interval_type: "years", interval_value: "1", next_due_at: "", next_due_hours: "", warn_days_before: "14", notes: "" });
    refetch();
  }

  async function del(id: string) {
    if (!confirm("Intervall löschen?")) return;
    const { error } = await (supabase.from("b2b_maintenance_intervals" as never) as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    refetch();
  }

  async function doComplete(iv: MaintenanceInterval) {
    const desc = prompt(`Wartung „${iv.title}" als erledigt markieren.\n\nKurze Beschreibung/Notiz (optional):`) ?? "";
    if (desc === null) return;
    const hoursStr = iv.interval_type === "hours"
      ? prompt(`Aktueller Zählerstand (h)? Aktuell: ${instance.current_operating_hours ?? 0}`, String(instance.current_operating_hours ?? 0))
      : null;
    try {
      await complete.mutateAsync({
        interval_id: iv.id,
        performed_at: new Date().toISOString().slice(0, 10),
        hours_at_service: hoursStr ? Number(hoursStr) : null,
        description: desc || null,
      });
      toast.success("Wartung dokumentiert");
      onChanged();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4 pt-4">
      {suggestions.length > 0 && (
        <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-950/20">
          <div className="text-sm font-medium mb-2">Vorschläge für Kategorie „{productCategory}":</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Button key={s.title} size="sm" variant="outline" onClick={() => addSuggestion(s)}>
                <Plus className="h-3 w-3 mr-1" />
                {s.title} ({s.type === "hours" ? `alle ${s.value}h` : s.type === "years" ? "jährlich" : `alle ${s.value} ${s.type}`})
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setAdding(!adding)}>
          <Plus className="h-4 w-4 mr-1" /> {adding ? "Abbrechen" : "Individuelles Intervall"}
        </Button>
      </div>

      {adding && (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Titel *"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="z.B. Hydrauliköl-Wechsel" /></Field>
            <Field label="Typ">
              <Select value={form.interval_type} onValueChange={(v) => setForm({ ...form, interval_type: v as IntervalType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Alle X Betriebsstunden</SelectItem>
                  <SelectItem value="days">Alle X Tage</SelectItem>
                  <SelectItem value="months">Alle X Monate</SelectItem>
                  <SelectItem value="years">Alle X Jahre</SelectItem>
                  <SelectItem value="one_time">Einmalig</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {form.interval_type !== "one_time" && (
              <Field label="Intervall-Wert"><Input type="number" value={form.interval_value} onChange={(e) => setForm({ ...form, interval_value: e.target.value })} /></Field>
            )}
            {(form.interval_type === "days" || form.interval_type === "months" || form.interval_type === "years" || form.interval_type === "one_time") && (
              <Field label="Nächste Fälligkeit (Datum)"><Input type="date" value={form.next_due_at} onChange={(e) => setForm({ ...form, next_due_at: e.target.value })} /></Field>
            )}
            {form.interval_type === "hours" && (
              <Field label="Nächste Fälligkeit (h)"><Input type="number" step="0.1" value={form.next_due_hours} onChange={(e) => setForm({ ...form, next_due_hours: e.target.value })} /></Field>
            )}
            <Field label="Warnung X Tage vorher"><Input type="number" value={form.warn_days_before} onChange={(e) => setForm({ ...form, warn_days_before: e.target.value })} /></Field>
          </div>
          <Field label="Notiz"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <Button onClick={addCustom}>Anlegen</Button>
        </div>
      )}

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Wartung</TableHead>
              <TableHead>Turnus</TableHead>
              <TableHead>Nächste Fälligkeit</TableHead>
              <TableHead>Zuletzt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!intervals.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Keine Wartungsintervalle definiert.</TableCell></TableRow>}
            {intervals.map((iv) => {
              const status = intervalStatus(iv, instance.current_operating_hours);
              return (
                <TableRow key={iv.id}>
                  <TableCell><div className="font-medium">{iv.title}</div>{iv.notes && <div className="text-xs text-muted-foreground">{iv.notes}</div>}</TableCell>
                  <TableCell className="text-sm">{intervalLabel(iv)}</TableCell>
                  <TableCell className="text-sm">
                    {iv.next_due_at && <div>{iv.next_due_at}</div>}
                    {iv.next_due_hours != null && <div>bei {iv.next_due_hours} h</div>}
                    {!iv.next_due_at && iv.next_due_hours == null && "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {iv.last_done_at ?? "nie"}
                    {iv.last_done_hours != null && <div>({iv.last_done_hours} h)</div>}
                  </TableCell>
                  <TableCell>
                    {status === "overdue" && <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Überfällig</Badge>}
                    {status === "due_soon" && <Badge className="bg-amber-500 hover:bg-amber-600">Bald fällig</Badge>}
                    {status === "ok" && <Badge variant="outline" className="text-green-700">OK</Badge>}
                    {!iv.is_active && <Badge variant="secondary">Inaktiv</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => doComplete(iv)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Erledigt
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => del(iv.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function HistoryTab({ instanceId }: { instanceId: string }) {
  const { data: log = [] } = useMaintenanceLog(instanceId);
  if (!log.length) return <p className="text-sm text-muted-foreground pt-4">Noch keine Wartungshistorie.</p>;
  return (
    <div className="border rounded-lg overflow-x-auto mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Wartung</TableHead>
            <TableHead>Betr.-Std.</TableHead>
            <TableHead>Beschreibung</TableHead>
            <TableHead>Teile</TableHead>
            <TableHead>Kosten</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {log.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="text-sm">{e.performed_at}</TableCell>
              <TableCell className="font-medium">{e.title}</TableCell>
              <TableCell>{e.hours_at_service ?? "—"}</TableCell>
              <TableCell className="text-sm">{e.description ?? "—"}</TableCell>
              <TableCell className="text-sm">{e.parts_replaced ?? "—"}</TableCell>
              <TableCell className="text-sm">{e.cost != null ? `${e.cost.toFixed(2)} €` : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 flex-1 min-w-0">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function intervalLabel(iv: MaintenanceInterval): string {
  if (iv.interval_type === "one_time") return "einmalig";
  if (!iv.interval_value) return iv.interval_type;
  const map: Record<IntervalType, string> = { hours: "h", days: "Tage", months: "Monate", years: "Jahre", one_time: "" };
  return `alle ${iv.interval_value} ${map[iv.interval_type]}`;
}

function intervalStatus(iv: MaintenanceInterval, currentHours: number | null): "overdue" | "due_soon" | "ok" {
  const today = new Date();
  const warn = iv.warn_days_before ?? 14;
  if (iv.next_due_at) {
    const due = new Date(iv.next_due_at);
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "overdue";
    if (diff <= warn) return "due_soon";
  }
  if (iv.next_due_hours != null && currentHours != null) {
    if (currentHours >= iv.next_due_hours) return "overdue";
    if (iv.next_due_hours - currentHours <= 25) return "due_soon";
  }
  return "ok";
}

function dateInMonths(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
