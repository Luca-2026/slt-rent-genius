import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FUEL_LEVELS } from "./protocolShared";

export type Measurement = {
  hours: string; fuel: string; mileage: string;
  useHours: boolean; useFuel: boolean; useMileage: boolean;
};
export const emptyMeasurement = (): Measurement => ({ hours: "", fuel: "", mileage: "", useHours: false, useFuel: false, useMileage: false });
export const validMeasurement = (m: Measurement) =>
  (!m.useHours || validCounter(m.hours)) && (!m.useMileage || validCounter(m.mileage)) && (!m.useFuel || !!m.fuel);
export const validCounter = (v: string) => /^\d{1,9}(?:[,.]\d{1,2})?$/.test(v.trim()) && Number(v.replace(",", ".")) <= 999999999;
export const counterValue = (v: string) => Number(v.replace(",", "."));
export const selectedMeasurement = (m: Measurement) => ({
  operating_hours: m.useHours ? m.hours.trim() : "",
  fuel_level: m.useFuel ? m.fuel : "",
  mileage: m.useMileage ? m.mileage.trim() : "",
});

export function MeasurementFields({ name, value, onChange }: { name: string; value: Measurement; onChange: (m: Measurement) => void }) {
  const set = (patch: Partial<Measurement>) => onChange({ ...value, ...patch });
  return (
    <div className="space-y-3 rounded-md border p-3">
      <p className="text-sm font-medium break-words">{name}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {([ ["useMileage", "Kilometerstand"], ["useHours", "Betriebsstunden"], ["useFuel", "Tankfüllstand"] ] as const).map(([key, label]) => (
          <label key={key} className="flex min-h-11 items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={value[key]} onCheckedChange={(checked) => set({ [key]: checked === true })} aria-label={`${label} für ${name} erfassen`} />
            {label}
          </label>
        ))}
      </div>
      {(value.useMileage || value.useHours || value.useFuel) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {value.useMileage && <div className="space-y-1"><Label>Kilometerstand (km) *</Label><Input aria-label={`Kilometerstand ${name}`} value={value.mileage} onChange={(e) => set({ mileage: e.target.value.replace(/[^\d,.]/g, "").slice(0, 12) })} inputMode="decimal" placeholder="z. B. 12500" className="h-11" /></div>}
          {value.useHours && <div className="space-y-1"><Label>Betriebsstunden (h) *</Label><Input aria-label={`Betriebsstunden ${name}`} value={value.hours} onChange={(e) => set({ hours: e.target.value.replace(/[^\d,.]/g, "").slice(0, 12) })} inputMode="decimal" placeholder="z. B. 1250,5" className="h-11" /></div>}
          {value.useFuel && <div className="space-y-1"><Label>Tankfüllstand *</Label><Select value={value.fuel} onValueChange={(fuel) => set({ fuel })}><SelectTrigger aria-label={`Tankfüllstand ${name}`} className="h-11"><SelectValue placeholder="Auswählen" /></SelectTrigger><SelectContent>{FUEL_LEVELS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent></Select></div>}
        </div>
      )}
    </div>
  );
}