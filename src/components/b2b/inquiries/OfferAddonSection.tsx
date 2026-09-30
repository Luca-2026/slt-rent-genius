/**
 * Zusatzoptionen einer Angebotsposition (Versicherungen etc.).
 *
 * Pro Option wählbar: Prozentsatz/Tagessatz und – für zeitbasierte Positionen –
 * „Über gesamte Mietdauer berechnen“ (Kalendertage statt abgerechneter Arbeitstage).
 * Betrag wird automatisch berechnet, bleibt aber überschreibbar.
 */
import { NumberInput } from "@/components/ui/number-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import type { AddonOption } from "@/lib/offerAddons";
import { isSalesAddonNegative } from "@/lib/salesAddons";
import { unitLabel, type OfferUnit } from "@/lib/offerUnits";
import {
  calendarDaysInclusive,
  computeAddonAmount,
  daysPerUnit,
  describeAddon,
  formatPeriod,
  type AddonLineContext,
} from "@/lib/addonCalc";
import { formatEuro, type OfferLine, type OfferLineAddon } from "./offerMath";

/** Rechenkontext einer Position (Artikel × Dauer × Preis). */
export function lineContext(item: OfferLine): AddonLineContext {
  const unit = (item.unit ?? "kalendertage") as OfferUnit;
  const timeBased = unit !== "pauschal" && unit !== "stueck";
  return {
    articles: item.quantity || 1,
    duration: unit === "pauschal" ? 1 : item.duration && item.duration > 0 ? item.duration : 1,
    days_per_unit: timeBased ? daysPerUnit(unit) : null,
    unit_price: item.unit_price || 0,
    discount_percent: item.discount_percent || 0,
  };
}

/** Automatische Neuberechnung aller nicht manuell überschriebenen Zusatzoptionen. */
export function recalcAddons<T extends OfferLine>(item: T): T {
  if (!item.addons?.length) return item;
  const ctx = lineContext(item);
  let changed = false;
  const addons = item.addons.map((a) => {
    if (!a.price_type || a.rate === undefined) return a;
    let next = a;
    // Einheit auf Stück/Pauschal gewechselt → gesamte Mietdauer nicht mehr möglich.
    if (a.basis === "full_period" && ctx.days_per_unit === null) {
      next = { ...a, basis: "line", days: null, period_start: null, period_end: null };
    }
    if (next.manual) return next;
    const amt = computeAddonAmount(
      { price_type: next.price_type!, rate: next.rate!, basis: next.basis ?? "line", days: next.days },
      ctx,
    );
    if (amt === null) return next;
    const signed = next.amount < 0 ? -amt : amt;
    if (signed === next.amount && next === a) return a;
    changed = true;
    return { ...next, amount: signed };
  });
  if (!changed && addons.every((a, i) => a === item.addons![i])) return item;
  return { ...item, addons };
}

function staffFormula(a: OfferLineAddon, item: OfferLine): string {
  const ctx = lineContext(item);
  const unit = (item.unit ?? "kalendertage") as OfferUnit;
  const pct = `${a.rate?.toLocaleString("de-DE")} %`;
  const pre = ctx.articles > 1 ? `${ctx.articles} × ` : "";
  if (a.basis === "full_period" && a.days) {
    const daily = ctx.days_per_unit && ctx.days_per_unit > 1
      ? `${formatEuro(ctx.unit_price / ctx.days_per_unit)}/Tag (${formatEuro(ctx.unit_price)} ÷ ${ctx.days_per_unit})`
      : formatEuro(ctx.unit_price);
    const period = formatPeriod(a.period_start, a.period_end);
    const days = `${a.days} ${a.days === 1 ? "Kalendertag" : "Kalendertage"}${period ? ` (${period})` : ""}`;
    if (a.price_type === "percent") return `${pre}${daily} × ${days}${ctx.discount_percent ? ` − ${ctx.discount_percent} % Rabatt` : ""} × ${pct}`;
    return `${pre}${formatEuro(a.rate ?? 0)} × ${days}`;
  }
  const dur = `${ctx.duration} ${unitLabel(ctx.duration, unit)}`;
  if (a.price_type === "percent") return `${pre}${formatEuro(ctx.unit_price)} × ${dur}${ctx.discount_percent ? ` − ${ctx.discount_percent} % Rabatt` : ""} × ${pct}`;
  if (a.price_type === "per_unit") return `${pre}${formatEuro(a.rate ?? 0)} × ${dur}`;
  return "";
}

interface Props {
  item: OfferLine;
  options: AddonOption[];
  isSales: boolean;
  disabled?: boolean;
  periodStart?: string;
  periodEnd?: string;
  onChange: (addons: OfferLineAddon[]) => void;
}

export function AddonSection({ item, options, isSales, disabled, periodStart, periodEnd, onChange }: Props) {
  const addons = item.addons ?? [];
  const ctx = lineContext(item);
  const canFullPeriod = ctx.days_per_unit !== null;
  const calDays = calendarDaysInclusive(periodStart, periodEnd);

  const patch = (ai: number, p: Partial<OfferLineAddon>) =>
    onChange(addons.map((a, j) => (j === ai ? { ...a, ...p } : a)));

  /** Setzt einen Wert und berechnet (sofern nicht manuell) den Betrag neu. */
  const patchCalc = (ai: number, p: Partial<OfferLineAddon>) => {
    const next = { ...addons[ai], ...p };
    const amt = next.price_type
      ? computeAddonAmount({ price_type: next.price_type, rate: next.rate ?? 0, basis: next.basis ?? "line", days: next.days }, ctx)
      : null;
    if (!next.manual && amt !== null) next.amount = addons[ai].amount < 0 ? -amt : amt;
    onChange(addons.map((a, j) => (j === ai ? next : a)));
  };

  const addOption = (option: AddonOption) => {
    if (addons.some((a) => a.key === option.key)) return;
    const negative = isSales && isSalesAddonNegative(option.key);
    const note = option.deductible ? `Selbstbehalt ${option.deductible.toLocaleString("de-DE")} €` : option.note;
    if (isSales) {
      onChange([...addons, { key: option.key, label: option.label, amount: negative ? -Math.abs(option.price) : option.price, note }]);
      return;
    }
    const fullPeriod = option.price_type !== "flat" && !!option.full_period_default && canFullPeriod;
    const base: OfferLineAddon = {
      key: option.key,
      label: option.label,
      note,
      price_type: option.price_type,
      rate: option.price,
      basis: option.price_type === "flat" ? "once" : fullPeriod ? "full_period" : "line",
      days: fullPeriod ? calDays : null,
      period_start: fullPeriod ? periodStart ?? null : null,
      period_end: fullPeriod ? periodEnd ?? null : null,
      manual: false,
      amount: 0,
    };
    const amt = computeAddonAmount({ price_type: base.price_type!, rate: base.rate!, basis: base.basis!, days: base.days }, ctx);
    onChange([...addons, { ...base, amount: amt ?? 0 }]);
  };

  return (
    <div className="rounded-md bg-muted/50 p-2 space-y-2">
      <div className="flex gap-2">
        <Select
          value=""
          disabled={disabled}
          onValueChange={(key) => {
            const option = options.find((o) => o.key === key);
            if (option) addOption(option);
          }}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Zusatzoption hinzufügen …" />
          </SelectTrigger>
          <SelectContent>
            {options
              .filter((o) => !addons.some((a) => a.key === o.key))
              .map((o) => (
                <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0"
          disabled={disabled}
          onClick={() => onChange([...addons, { key: `custom-${Date.now()}`, label: "", amount: 0 }])}
        >
          <Plus className="h-4 w-4 mr-1" /> Freie Option
        </Button>
      </div>

      {addons.map((addon, ai) => {
        const calculated = !!addon.price_type && addon.price_type !== "flat";
        const fullPeriod = addon.basis === "full_period";
        const customerText = describeAddon({
          ...addon,
          line_unit: unitLabel(1, (item.unit ?? "kalendertage") as OfferUnit),
        });
        const missingDays = fullPeriod && !(Number(addon.days) > 0);
        return (
          <div key={addon.key} className="rounded-md border border-border bg-background p-2 space-y-2">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                {addon.key.startsWith("custom") ? (
                  <Input
                    value={addon.label}
                    placeholder="Bezeichnung der Zusatzoption"
                    disabled={disabled}
                    onChange={(e) => patch(ai, { label: e.target.value })}
                  />
                ) : (
                  <p className="text-sm font-medium break-words">
                    {addon.label}
                    {addon.note ? <span className="block text-xs text-muted-foreground font-normal">{addon.note}</span> : null}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Zusatzoption entfernen"
                disabled={disabled}
                onClick={() => onChange(addons.filter((_, j) => j !== ai))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {calculated && (
              <div className="grid grid-cols-2 gap-2 items-end">
                <div>
                  <Label className="text-xs">
                    {addon.price_type === "percent" ? "Prozentsatz (%)" : "€ je Artikel und Tag"}
                  </Label>
                  <NumberInput
                    type="number"
                    step="0.01"
                    min={0}
                    value={addon.rate ?? 0}
                    disabled={disabled}
                    onChange={(e) => patchCalc(ai, { rate: Number(e.target.value) || 0 })}
                  />
                </div>
                {fullPeriod ? (
                  <div>
                    <Label className="text-xs">Kalendertage gesamt</Label>
                    <NumberInput
                      type="number"
                      min={1}
                      value={addon.days ?? ""}
                      disabled={disabled}
                      className={missingDays ? "border-destructive" : undefined}
                      onChange={(e) => patchCalc(ai, { days: Number(e.target.value) || null })}
                    />
                  </div>
                ) : <div />}
                {canFullPeriod && (
                  <label className="col-span-2 flex items-start gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={fullPeriod}
                      disabled={disabled}
                      onCheckedChange={(v) =>
                        patchCalc(ai, v === true
                          ? { basis: "full_period", days: addon.days || calDays, period_start: periodStart ?? null, period_end: periodEnd ?? null }
                          : { basis: "line", days: null, period_start: null, period_end: null })
                      }
                    />
                    <span>
                      Über gesamte Mietdauer berechnen (Kalendertage)
                      <span className="block text-muted-foreground">
                        Auch nicht berechnete Tage wie Wochenenden – z. B. Versicherung bei Abrechnung nach Arbeitstagen
                      </span>
                    </span>
                  </label>
                )}
              </div>
            )}

            {calculated && (
              <div className="text-[11px] leading-snug space-y-0.5">
                {missingDays ? (
                  <p className="text-destructive">Mietende fehlt – bitte Kalendertage der gesamten Mietdauer eintragen.</p>
                ) : (
                  <p className="text-muted-foreground">
                    Berechnung: {staffFormula(addon, item)} = <strong>{formatEuro(
                      computeAddonAmount({ price_type: addon.price_type!, rate: addon.rate ?? 0, basis: addon.basis ?? "line", days: addon.days }, ctx) ?? 0,
                    )}</strong>
                  </p>
                )}
                {customerText && <p className="text-muted-foreground italic">Kunde sieht: „{customerText}“</p>}
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs">Betrag netto (€){addon.manual ? " – manuell" : ""}</Label>
                <NumberInput
                  type="number"
                  step="0.01"
                  value={addon.amount}
                  disabled={disabled}
                  onChange={(e) => patch(ai, { amount: Number(e.target.value) || 0, ...(addon.price_type ? { manual: true } : {}) })}
                />
              </div>
              {addon.manual && addon.price_type && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  disabled={disabled}
                  onClick={() => patchCalc(ai, { manual: false })}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Neu berechnen
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
