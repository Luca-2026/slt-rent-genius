/**
 * Versicherungsstufen eines CMS-Artikels (Einträge aus addon_options):
 * Reihenfolge per Pfeil, erste Versicherung = Standard, Selbstbehalt und
 * ab der zweiten Stufe Aufschlag in % des Standardbetrags.
 * Die Berechnung im Angebot bleibt unverändert (siehe addon-calc).
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { AddonOption } from "@/lib/offerAddons";

const INSURANCE_KEYS = new Set(["maschinenbruch", "elektronik", "vollkasko", "sb_reduktion"]);

export function isInsuranceOption(o: { key?: string; label?: string }): boolean {
  return INSURANCE_KEYS.has(String(o.key ?? "")) || /versicherung/i.test(String(o.label ?? ""));
}

export interface InsuranceMeta {
  surcharge_percent: string;
}

export function InsuranceTiersEditor({
  options,
  meta,
  onChange,
}: {
  options: AddonOption[];
  meta: Record<string, InsuranceMeta>;
  onChange: (options: AddonOption[], meta: Record<string, InsuranceMeta>) => void;
}) {
  const insurances = options.map((o, i) => ({ o, i })).filter(({ o }) => isInsuranceOption(o));
  if (!insurances.length) {
    return <p className="text-sm text-muted-foreground">Keine Versicherung hinterlegt. Versicherungen legst du unten bei den Zusatzoptionen an.</p>;
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= options.length) return;
    const next = [...options];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next, meta);
  };
  const moveTier = (pos: number, dir: -1 | 1) => {
    const target = insurances[pos + dir];
    if (!target) return;
    move(insurances[pos].i, target.i);
  };

  return (
    <div className="space-y-2">
      {insurances.map(({ o, i }, pos) => (
        <div key={o.key} className="rounded-md border border-border p-3 flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex items-center gap-1 sm:self-center">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Nach oben" disabled={pos === 0} onClick={() => moveTier(pos, -1)}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Nach unten" disabled={pos === insurances.length - 1} onClick={() => moveTier(pos, 1)}>
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{o.label}</span>
              {pos === 0 && <Badge>Standard</Badge>}
            </div>
          </div>
          <div className="w-full sm:w-36">
            <Label className="text-xs">Selbstbehalt (€)</Label>
            <Input
              inputMode="decimal"
              value={o.deductible != null ? String(o.deductible) : ""}
              onChange={(e) => {
                const n = Number(e.target.value.replace(",", "."));
                const next = [...options];
                next[i] = { ...o, deductible: e.target.value.trim() && Number.isFinite(n) ? n : null };
                onChange(next, meta);
              }}
            />
          </div>
          {pos > 0 && (
            <div className="w-full sm:w-48">
              <Label className="text-xs">Aufschlag in % des Standardbetrags</Label>
              <Input
                inputMode="decimal"
                value={meta[o.key]?.surcharge_percent ?? ""}
                onChange={(e) => onChange(options, { ...meta, [o.key]: { surcharge_percent: e.target.value } })}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** addon_options für die DB: Reihenfolge = sort_order, erste Versicherung = Standard. */
export function serializeAddonOptions(options: AddonOption[], meta: Record<string, InsuranceMeta>) {
  const firstInsurance = options.findIndex((o) => isInsuranceOption(o));
  return options.map((o, idx) => {
    const raw = meta[o.key]?.surcharge_percent?.trim();
    const pct = raw ? Number(raw.replace(",", ".")) : NaN;
    return {
      ...o,
      sort_order: idx,
      is_default: idx === firstInsurance,
      surcharge_percent: idx !== firstInsurance && Number.isFinite(pct) ? pct : null,
      deductible: o.deductible ?? null,
    };
  });
}
