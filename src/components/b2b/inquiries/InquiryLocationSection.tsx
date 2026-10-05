import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LOCATION_LABELS,
  evaluateLine,
  fetchAvailability,
  normalizeLocation,
  toIsoDate,
  type InventoryIssue,
} from "@/lib/inventoryAvailability";
import type { RequestedItem } from "./types";

/** Alle Standorte, zwischen denen gewechselt werden kann (Reihenfolge = Anzeige). */
export const LOCATION_CHANGE_OPTIONS = [
  { value: "krefeld", label: LOCATION_LABELS.krefeld },
  { value: "bonn", label: LOCATION_LABELS.bonn },
  { value: "muelheim", label: LOCATION_LABELS.muelheim },
] as const;

/** Erster sinnvoller Ziel-Standort: nie der aktuelle. */
export function initialTargetLocation(current: string | null | undefined): string {
  const cur = normalizeLocation(current);
  const other = LOCATION_CHANGE_OPTIONS.find((o) => o.value !== cur);
  return (other ?? LOCATION_CHANGE_OPTIONS[0]).value;
}

/** Trennt Artikel mit CMS-Bezug (prüfbar) von Freitext-Artikeln (nicht prüfbar). */
export function splitCheckableItems(items: RequestedItem[]): {
  checkable: (RequestedItem & { product_slug: string })[];
  uncheckable: RequestedItem[];
} {
  const checkable: (RequestedItem & { product_slug: string })[] = [];
  const uncheckable: RequestedItem[] = [];
  for (const it of items) {
    if (it.product_slug) checkable.push({ ...it, product_slug: it.product_slug });
    else uncheckable.push(it);
  }
  return { checkable, uncheckable };
}

interface LocationCheck {
  productName: string;
  issue: InventoryIssue | null;
  failed: boolean;
}

interface Props {
  inquiryId: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  items: RequestedItem[];
  reservationId: string | null;
  /** true, wenn bereits ein Angebot versendet wurde (Snapshot bleibt unverändert). */
  offerSent: boolean;
  disabled?: boolean;
  onChanged: () => void;
  /** Nach Änderung mit versendetem Angebot: Überarbeitung öffnen. */
  onReviseSuggested?: () => void;
}

/**
 * Standort einer Mietanfrage nachträglich ändern – auch nach dem Angebotsversand.
 * Prüft vor dem Speichern die Verfügbarkeit am Zielstandort und aktualisiert
 * über die DB-Funktion Anfrage, Standort-Postfach und verknüpfte Reservierung.
 */
export function InquiryLocationSection({
  inquiryId,
  location,
  startDate,
  endDate,
  items,
  reservationId,
  offerSent,
  disabled,
  onChanged,
  onReviseSuggested,
}: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(() => initialTargetLocation(location));
  const [checking, setChecking] = useState(false);
  const [checks, setChecks] = useState<LocationCheck[]>([]);
  const [uncheckable, setUncheckable] = useState<string[]>([]);
  const [noPeriod, setNoPeriod] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentKey = normalizeLocation(location);
  const currentLabel = LOCATION_LABELS[currentKey ?? ""] ?? location ?? "Nicht zugeordnet";

  // Beim Öffnen und bei Zielwechsel die Verfügbarkeit am Zielstandort prüfen.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const run = async () => {
      setChecking(true);
      setChecks([]);
      const { checkable, uncheckable: unc } = splitCheckableItems(items);
      setUncheckable(unc.map((i) => i.product_name));
      const start = toIsoDate(startDate);
      const end = toIsoDate(endDate) ?? start;
      if (!start || checkable.length === 0) {
        setNoPeriod(!start);
        setChecking(false);
        return;
      }
      setNoPeriod(false);
      const results: LocationCheck[] = [];
      for (const it of checkable) {
        try {
          const result = await fetchAvailability({
            slug: it.product_slug,
            location: target,
            start,
            end,
            excludeInquiryId: inquiryId,
            excludeReservationId: reservationId,
          });
          if (result) {
            results.push({
              productName: it.product_name,
              issue: evaluateLine(it.product_name, it.quantity, target, result),
              failed: false,
            });
          }
        } catch {
          results.push({ productName: it.product_name, issue: null, failed: true });
        }
      }
      if (!cancelled) {
        setChecks(results);
        setChecking(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [open, target, inquiryId, reservationId, startDate, endDate, items]);

  const hasOverbooked = useMemo(() => checks.some((c) => c.issue?.severity === "over"), [checks]);

  const save = async () => {
    if (saving || target === currentKey) return;
    setSaving(true);
    const { data, error } = await supabase.rpc("change_rental_inquiry_location", {
      _inquiry_id: inquiryId,
      _new_location: target,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Standort konnte nicht geändert werden", description: error.message, variant: "destructive" });
      return;
    }
    const row = Array.isArray(data) ? data[0] : null;
    const newLabel = LOCATION_LABELS[(row?.new_location as string) ?? target] ?? target;
    toast({
      title: `Standort geändert: ${newLabel}`,
      description:
        (row?.reservations_updated ?? 0) > 0
          ? "Anfrage, Postfach und Reservierung wurden umgestellt."
          : "Anfrage und Standort-Postfach wurden umgestellt.",
    });
    setOpen(false);
    onChanged();
    if (offerSent) onReviseSuggested?.();
  };

  return (
    <div className="rounded-lg border border-border p-3 flex flex-wrap items-center gap-2">
      <MapPin className="h-4 w-4 text-primary shrink-0" />
      <div className="text-sm flex-1 min-w-0">
        <span className="text-muted-foreground">Standort: </span>
        <span className="font-medium">{currentLabel}</span>
      </div>
      <Button size="sm" variant="outline" disabled={disabled} onClick={() => { setTarget(initialTargetLocation(location)); setOpen(true); }}>
        Standort ändern
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Standort ändern</DialogTitle>
            <DialogDescription>
              Aktueller Standort: <strong>{currentLabel}</strong>. Die Anfrage wird dem neuen Standort
              zugeordnet – z. B. wenn der Kunde dort abholen soll.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger aria-label="Neuer Standort"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LOCATION_CHANGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} disabled={o.value === currentKey}>
                    {o.label}{o.value === currentKey ? " (aktuell)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="rounded-lg border border-border p-3 text-sm space-y-1.5">
              <div className="font-medium">Verfügbarkeit in {LOCATION_LABELS[target]}</div>
              {checking ? (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Wird geprüft …
                </p>
              ) : noPeriod ? (
                <p className="text-muted-foreground">Kein Mietzeitraum hinterlegt – Verfügbarkeit nicht prüfbar.</p>
              ) : checks.length === 0 && uncheckable.length === 0 ? (
                <p className="text-muted-foreground">Keine Artikel zum Prüfen hinterlegt.</p>
              ) : (
                <ul className="space-y-1.5">
                  {checks.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {c.failed ? (
                        <>
                          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                          <span className="text-muted-foreground">„{c.productName}" – Prüfung fehlgeschlagen, bitte Bestand manuell prüfen.</span>
                        </>
                      ) : c.issue ? (
                        <>
                          <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${c.issue.severity === "over" ? "text-destructive" : "text-muted-foreground"}`} />
                          <span>{c.issue.message}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                          <span>„{c.productName}" ist verfügbar.</span>
                        </>
                      )}
                    </li>
                  ))}
                  {uncheckable.map((name) => (
                    <li key={name} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">„{name}" – kein CMS-Artikel, Bestand nicht prüfbar.</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {offerSent && (
              <div className="flex gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-accent-foreground" />
                <span>
                  Es wurde bereits ein Angebot versendet – dieses bleibt unverändert. Sende dem Kunden
                  anschließend eine <strong>neue Angebotsfassung</strong> mit dem neuen Abholstandort
                  (öffnet sich nach dem Speichern automatisch).
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Abbrechen</Button>
            <Button onClick={save} disabled={saving || checking || target === currentKey}>
              {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              {hasOverbooked ? "Trotzdem umstellen" : "Standort umstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
