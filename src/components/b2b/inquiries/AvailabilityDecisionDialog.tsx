import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getLocationDisplayName } from "@/data/locationData";
import {
  blockedItems, buildDecisions, orderableLocations, type AvailabilityResult, type ItemChoice,
} from "@/lib/availabilityDecisions";

const fmt = (iso: string) =>
  iso ? new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const locName = (l: string) => getLocationDisplayName(l) || l;

interface Props {
  result: AvailabilityResult | null;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (decisions: NonNullable<ReturnType<typeof buildDecisions>>) => void;
}

export function AvailabilityDecisionDialog({ result, busy, onCancel, onSubmit }: Props) {
  const [choices, setChoices] = useState<Record<number, ItemChoice | undefined>>({});
  const [cost, setCost] = useState<Record<number, string>>({});
  const [charge, setCharge] = useState<Record<number, boolean>>({});
  if (!result) return null;
  const blocked = blockedItems(result);

  const withCost = (idx: number, c: ItemChoice | undefined): ItemChoice | undefined =>
    c?.action === "order_from"
      ? { ...c, transport_cost: cost[idx] ? Number(cost[idx].replace(",", ".")) : null, cost_charged: !!charge[idx] }
      : c;
  const finalChoices = Object.fromEntries(blocked.map((i) => [i.index, withCost(i.index, choices[i.index])]));
  const decisions = buildDecisions(result, finalChoices);

  return (
    <Dialog open onOpenChange={(o) => { if (!o && !busy) onCancel(); }}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verfügbarkeit prüfen</DialogTitle>
          <DialogDescription>Bitte für jede Position entscheiden. Erst danach wird der Auftrag bestätigt.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {blocked.map((i) => {
            const locs = orderableLocations(i);
            const c = choices[i.index];
            const pick = (v: ItemChoice) => setChoices((s) => ({ ...s, [i.index]: v }));
            return (
              <div key={i.index} className="space-y-2 rounded-md border border-destructive/40 p-3 text-sm">
                <p className="font-medium text-destructive break-words">
                  {i.product_name} ist in {locName(i.location)} vom {fmt(i.from_at)} bis {fmt(i.to_at)} nicht verfügbar
                  {i.free != null ? ` (frei ${i.free} von benötigt ${i.needed})` : ""}. Von anderem Standort ordern?
                </p>
                {i.source === "quantities" && (
                  <p className="text-muted-foreground">Für diesen Artikel sind keine Einzelgeräte angelegt – Prüfung nur über den CMS-Bestand, Ordern daher nicht möglich.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {locs.map((l) => (
                    <Button key={l} size="sm" variant={c?.action === "order_from" && c.source === l ? "default" : "outline"} onClick={() => pick({ action: "order_from", source: l })}>
                      Von {locName(l)} ordern
                    </Button>
                  ))}
                  <Button size="sm" variant={c?.action === "pending" ? "default" : "outline"} onClick={() => pick({ action: "pending" })}>Rücksprache mit Kunde</Button>
                  <Button size="sm" variant={c?.action === "reject" ? "destructive" : "outline"} onClick={() => pick({ action: "reject" })}>Absagen</Button>
                </div>
                {c?.action === "order_from" && (
                  <div className="grid gap-2 sm:grid-cols-2 sm:items-center">
                    <Input inputMode="decimal" placeholder="Überführungskosten netto (optional)" value={cost[i.index] ?? ""}
                      onChange={(e) => setCost((s) => ({ ...s, [i.index]: e.target.value }))} />
                    <label className="flex items-center gap-2">
                      <Checkbox checked={!!charge[i.index]} onCheckedChange={(v) => setCharge((s) => ({ ...s, [i.index]: Boolean(v) }))} />
                      <span>in Auftrag einpreisen</span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={busy}>Abbrechen</Button>
          <Button disabled={!decisions || busy} onClick={() => decisions && onSubmit(decisions)}>
            {busy ? "Wird gespeichert …" : decisions?.mode === "confirm" ? "Ordern und bestätigen" : decisions?.mode === "pending" ? "Rücksprache vermerken" : decisions?.mode === "reject" ? "Anfrage absagen" : "Entscheiden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
