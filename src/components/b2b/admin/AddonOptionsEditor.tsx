/**
 * Pflege der Zusatzoptionen (Versicherungen etc.) eines CMS-Mietartikels.
 * Mobile-first: Auswahl per Dropdown, danach kompakte Karten pro Option.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import {
  ADDON_PRESETS,
  ADDON_PRICE_TYPE_LABELS,
  type AddonOption,
  type AddonPriceType,
} from "@/lib/offerAddons";

interface Props {
  value: AddonOption[];
  onChange: (next: AddonOption[]) => void;
}

export function AddonOptionsEditor({ value, onChange }: Props) {
  const addPreset = (key: string) => {
    const preset = ADDON_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    const suffix = value.filter((v) => v.key.startsWith(preset.key)).length;
    onChange([
      ...value,
      {
        key: suffix ? `${preset.key}-${suffix + 1}` : preset.key,
        label: preset.label,
        price_type: preset.price_type,
        price: preset.price,
        deductible: preset.deductible ?? null,
      },
    ]);
  };

  const patch = (index: number, p: Partial<AddonOption>) =>
    onChange(value.map((o, i) => (i === index ? { ...o, ...p } : o)));

  return (
    <div className="space-y-3">
      <div>
        <Label>Zusatzoptionen (Versicherungen etc.)</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Nur hier hinterlegte Optionen lassen sich später im Angebot für genau diesen Artikel auswählen –
          z. B. Maschinenbruchversicherung beim Bagger, nicht bei der Bierzeltgarnitur.
        </p>
        <Select value="" onValueChange={addPreset}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder="Zusatzoption hinzufügen …" />
          </SelectTrigger>
          <SelectContent>
            {ADDON_PRESETS.map((p) => (
              <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-muted-foreground">Noch keine Zusatzoptionen hinterlegt.</p>
      ) : (
        <div className="space-y-3">
          {value.map((opt, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex gap-2 items-start">
                <Input
                  className="flex-1 min-w-0"
                  value={opt.label}
                  onChange={(e) => patch(i, { label: e.target.value })}
                  placeholder="Bezeichnung"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Zusatzoption entfernen"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Preisart</Label>
                  <Select
                    value={opt.price_type}
                    onValueChange={(v) => patch(i, { price_type: v as AddonPriceType })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ADDON_PRICE_TYPE_LABELS) as AddonPriceType[]).map((t) => (
                        <SelectItem key={t} value={t}>{ADDON_PRICE_TYPE_LABELS[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">
                    {opt.price_type === "percent" ? "Prozentsatz" : "Betrag netto (€)"}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={opt.price}
                    onChange={(e) => patch(i, { price: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Selbstbehalt (€, optional)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    value={opt.deductible ?? ""}
                    onChange={(e) => patch(i, { deductible: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>
              <Input
                value={opt.note ?? ""}
                onChange={(e) => patch(i, { note: e.target.value })}
                placeholder="Hinweis (optional), z. B. „gilt nur bei Selbstfahrbetrieb“"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
