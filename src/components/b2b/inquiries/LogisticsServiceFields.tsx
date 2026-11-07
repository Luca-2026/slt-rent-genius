import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OfferLine } from "./offerMath";
import { SERVICE_UNITS, serviceName, serviceUnit, type ServiceKind, type ServiceUnit } from "./logisticsServices";

export function LogisticsServiceFields({ kind, line, disabled, onToggle, onChange }: { kind: ServiceKind; line?: OfferLine; disabled: boolean; onToggle: (enabled: boolean) => void; onChange: (patch: Partial<OfferLine>) => void }) {
  const name = serviceName(kind);
  return <div className="space-y-3 border-t border-border pt-3">
    <label className="flex items-center gap-2 text-sm font-medium"><Checkbox aria-label={`${name} durch SLT`} checked={!!line} disabled={disabled} onCheckedChange={v => onToggle(v === true)} />{name} durch SLT</label>
    {line && <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
      <div className="min-w-0 space-y-1"><Label className="text-xs">Einheit</Label><Select value={serviceUnit(line)} disabled={disabled} onValueChange={v => onChange({ description: `Abrechnung: ${SERVICE_UNITS.find(u => u.value === v as ServiceUnit)?.label ?? "Pauschale"}` })}><SelectTrigger className="h-10" aria-label={`${name} Einheit`}><SelectValue /></SelectTrigger><SelectContent>{SERVICE_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent></Select></div>
      <div className="min-w-0 space-y-1"><Label className="text-xs">Menge</Label><NumberInput aria-label={`${name} Menge`} type="number" min={0.01} step="0.25" value={line.quantity} disabled={disabled} onChange={e => onChange({ quantity: Number(e.target.value) || 0 })} /></div>
      <div className="min-w-0 space-y-1"><Label className="text-xs">Einzelpreis netto</Label><NumberInput aria-label={`${name} Einzelpreis netto`} type="number" min={0} step="0.01" value={line.unit_price} disabled={disabled} onChange={e => onChange({ unit_price: Number(e.target.value) || 0, price_manual: true })} /></div>
    </div>}
  </div>;
}