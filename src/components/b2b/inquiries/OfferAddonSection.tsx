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
import { insuranceCalendarDays } from "@/lib/pricing/rentalPricing";
import {
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
  const mapped = item.addons.map((a) => {
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
  // Optionale Stufen folgen dem (neu berechneten) Standardbetrag je KT.
  const addons = mapped.map((a) => {
    if (!a.optional || !a.of_key || !a.surcharge_percent || a.manual) return a;
    const std = mapped.find((x) => x.key === a.of_key && !x.optional);
    const base = std ? standardPerDay(std, ctx) : null;
    if (base === null) return a;
    const perDay = round2(base * (a.surcharge_percent / 100));
    const amount = a.days ? computeAddonAmount({ price_type: "per_unit", rate: perDay, basis: "full_period", days: a.days }, ctx) ?? 0 : 0;
    if (perDay === a.per_day && amount === a.amount) return a;
    changed = true;
    return { ...a, per_day: perDay, rate: perDay, amount };
  });
  if (!changed && addons.every((a, i) => a === item.addons![i])) return item;
  return { ...item, addons };
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Paket 3b: Kalendertage der Versicherung aus dem Zeitraum (Preismodul, immer Kalendertage). */
export function addonCalendarDays(start?: string | null, end?: string | null): number | null {
  if (!start || !end || end < start) return null;
  return insuranceCalendarDays({ date: start }, { date: end });
}

/** Standardbetrag der Versicherung je Kalendertag und Artikel (null, wenn nicht zeitbasiert). */
export function standardPerDay(std: OfferLineAddon, ctx: AddonLineContext): number | null {
  if (!std.price_type || std.price_type === "flat" || std.rate === undefined || !ctx.days_per_unit) return null;
  return computeAddonAmount({ price_type: std.price_type, rate: std.rate, basis: "full_period", days: 1 }, { ...ctx, articles: 1 });
}

/** Optionale Stufe: Aufpreis je KT = surcharge_percent × Standardbetrag je KT. */
export function buildOptionalTier(
  tier: AddonOption,
  std: OfferLineAddon,
  ctx: AddonLineContext,
  fallbackDays: number | null,
): OfferLineAddon | null {
  const days = std.days ?? fallbackDays ?? null;
  const label = tier.deductible
    ? `Selbstbehalt-Reduzierung auf ${tier.deductible.toLocaleString("de-DE")} €`
    : tier.label;
  const common = {
    key: `opt-${tier.key}`,
    label,
    optional: true as const,
    of_key: std.key,
    basis: "full_period" as const,
    days,
    period_start: std.period_start ?? null,
    period_end: std.period_end ?? null,
    manual: false,
  };
  if (tier.surcharge_percent) {
    const base = standardPerDay(std, ctx);
    if (base === null) return null;
    const perDay = round2(base * (tier.surcharge_percent / 100));
    const amount = days ? computeAddonAmount({ price_type: "per_unit", rate: perDay, basis: "full_period", days }, ctx) ?? 0 : 0;
    return { ...common, per_day: perDay, surcharge_percent: tier.surcharge_percent, price_type: "per_unit", rate: perDay, amount };
  }
  // Stufe ohne Aufschlag: nicht anbieten – der Prozentsatz bezieht sich immer
  // auf den Standardbetrag der Versicherung, nie auf den Mietpreis.
  return null;
}

/** Standardstufe (und gewählte CMS-Optionen) wie im Dropdown anlegen: Kalendertage über den Zeitraum + optionale Stufen. */
export function buildAddonsFromOptions(
  picked: AddonOption[],
  allOptions: AddonOption[],
  item: OfferLine,
  periodStart?: string | null,
  periodEnd?: string | null,
): OfferLineAddon[] {
  const ctx = lineContext(item);
  const calDays = addonCalendarDays(periodStart, periodEnd);
  const { std, tiers } = furtherTiers(allOptions);
  const tierKeys = new Set(tiers.map((t) => t.key));
  const out: OfferLineAddon[] = [];
  for (const option of picked) {
    if (tierKeys.has(option.key) || out.some((a) => a.key === option.key)) continue;
    const fullPeriod = option.price_type !== "flat" && !!option.full_period_default && ctx.days_per_unit !== null;
    const base: OfferLineAddon = {
      key: option.key,
      label: option.label,
      note: option.deductible ? `Selbstbehalt ${option.deductible.toLocaleString("de-DE")} €` : option.note,
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
    const added = { ...base, amount: amt ?? 0 };
    out.push(added);
    if (std && option.key === std.key) {
      for (const t of tiers) {
        const tier = buildOptionalTier(t, added, ctx, calDays);
        if (tier) out.push(tier);
      }
    }
  }
  return out;
}

/** Weitere CMS-Stufen zur Standardstufe (nur mit Aufschlag), sortiert. */
export function furtherTiers(options: AddonOption[]): { std: AddonOption | undefined; tiers: AddonOption[] } {
  const std = options.find((o) => o.is_default);
  const tiers = std
    ? options
        .filter((o) => !o.is_default && (o.surcharge_percent ?? 0) > 0)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    : [];
  return { std, tiers };
}

/** Optionale Stufen an die aktuelle Standardstufe anpassen (Satz, Tage, Zeitraum). */
export function syncOptionalTiers(addons: OfferLineAddon[], options: AddonOption[], ctx: AddonLineContext, fallbackDays: number | null): OfferLineAddon[] {
  const { std: stdOpt, tiers } = furtherTiers(options);
  const std = stdOpt ? addons.find((a) => a.key === stdOpt.key && !a.optional) : undefined;
  if (!std) return addons.filter((a) => !(a.optional && a.key.startsWith("opt-")));
  return addons.map((a) => {
    if (!a.optional) return a;
    const tier = tiers.find((t) => `opt-${t.key}` === a.key);
    return (tier && buildOptionalTier(tier, std, ctx, fallbackDays)) || a;
  });
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
  const calDays = addonCalendarDays(periodStart, periodEnd);
  const { std: stdOption, tiers } = furtherTiers(options);
  const emit = (next: OfferLineAddon[]) => onChange(isSales ? next : syncOptionalTiers(next, options, ctx, calDays));

  const patch = (ai: number, p: Partial<OfferLineAddon>) =>
    emit(addons.map((a, j) => (j === ai ? { ...a, ...p } : a)));

  /** Setzt einen Wert und berechnet (sofern nicht manuell) den Betrag neu. */
  const patchCalc = (ai: number, p: Partial<OfferLineAddon>) => {
    const next = { ...addons[ai], ...p };
    const amt = next.price_type
      ? computeAddonAmount({ price_type: next.price_type, rate: next.rate ?? 0, basis: next.basis ?? "line", days: next.days }, ctx)
      : null;
    if (!next.manual && amt !== null) next.amount = addons[ai].amount < 0 ? -amt : amt;
    emit(addons.map((a, j) => (j === ai ? next : a)));
  };

  const addOption = (option: AddonOption) => {
    if (addons.some((a) => a.key === option.key)) return;
    const negative = isSales && isSalesAddonNegative(option.key);
    const note = option.deductible ? `Selbstbehalt ${option.deductible.toLocaleString("de-DE")} €` : option.note;
    if (isSales) {
      onChange([...addons, { key: option.key, label: option.label, amount: negative ? -Math.abs(option.price) : option.price, note }]);
      return;
    }
    const next = buildAddonsFromOptions([option], options, item, periodStart, periodEnd).filter((x) => !addons.some((y) => y.key === x.key));
    onChange([...addons, ...next]);
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
          onClick={() => emit([...addons, { key: `custom-${Date.now()}`, label: "", amount: 0 }])}
        >
          <Plus className="h-4 w-4 mr-1" /> Freie Option
        </Button>
      </div>

      {addons.map((addon, ai) => {
        if (addon.optional) return null;
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
                onClick={() => emit(addons.filter((_, j) => j !== ai))}
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
                      onChange={(e) => patchCalc(ai, { days: Number(e.target.value) || null, days_manual: true })}
                    />
                    {addon.days_manual && calDays && addon.days !== calDays ? (
                      <button type="button" className="mt-1 text-[11px] text-primary underline" disabled={disabled}
                        onClick={() => patchCalc(ai, { days: calDays, days_manual: false, days_reason: undefined })}>
                        Zeitraum übernehmen ({calDays} KT)
                      </button>
                    ) : null}
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

            {fullPeriod && addon.days_manual && (
              <div>
                <Label className="text-xs">Grund für geänderte Kalendertage (intern, nicht im PDF)</Label>
                <Input value={addon.days_reason ?? ""} placeholder="z. B. Verlängerung telefonisch zugesagt" disabled={disabled}
                  onChange={(e) => patch(ai, { days_reason: e.target.value || undefined })} />
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
            {!isSales && stdOption && addon.key === stdOption.key && tiers.length > 0 && (
              <div className="ml-3 space-y-1 border-l border-border pl-3" data-testid="optional-tiers">
                {tiers.map((t) => {
                  const key = `opt-${t.key}`;
                  const current = addons.find((a) => a.key === key);
                  const preview = current ?? buildOptionalTier(t, addon, ctx, calDays);
                  if (!preview) return null;
                  return (
                    <label key={key} className="flex items-start gap-2 text-xs cursor-pointer">
                      <Checkbox
                        checked={!!current}
                        disabled={disabled}
                        onCheckedChange={(v) =>
                          emit(v === true ? [...addons, preview] : addons.filter((a) => a.key !== key))
                        }
                      />
                      <span>
                        <span className="font-medium">anbieten</span> – Optional: {preview.label}, {preview.surcharge_percent ? `Aufpreis ${formatEuro(preview.per_day ?? 0)}/KT` : `${preview.rate?.toLocaleString("de-DE")} % = ${formatEuro(preview.amount)}${preview.days ? ` für ${preview.days} KT` : ""}`}
                        <span className="block text-muted-foreground">Nicht in der Angebotssumme</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
