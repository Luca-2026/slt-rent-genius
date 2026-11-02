import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OPEN_ENDED_UNITS, normalizeOpenEndedDuration, normalizeOpenEndedUnit, type OpenEndedUnit } from "@/lib/installments";

export function OpenEndedPeriodFields({ unit, duration, disabled, onChange }: {
  unit: OpenEndedUnit; duration: number; disabled?: boolean;
  onChange: (unit: OpenEndedUnit, duration: number) => void;
}) {
  return <div className="grid grid-cols-2 gap-3">
    <div className="min-w-0 space-y-1">
      <Label htmlFor="open-ended-duration">Mindestmietzeit</Label>
      <Input id="open-ended-duration" type="number" inputMode="numeric" min={1}
        max={unit === "monate" ? 60 : undefined} step={1} value={duration} disabled={disabled}
        onChange={(e) => onChange(unit, normalizeOpenEndedDuration(e.target.value, unit))} />
    </div>
    <div className="min-w-0 space-y-1">
      <Label htmlFor="open-ended-unit">Einheit</Label>
      <Select value={unit} disabled={disabled} onValueChange={(value) => {
        const next = normalizeOpenEndedUnit(value);
        onChange(next, normalizeOpenEndedDuration(duration, next));
      }}>
        <SelectTrigger id="open-ended-unit" aria-label="Einheit der unbefristeten Miete"><SelectValue /></SelectTrigger>
        <SelectContent>{OPEN_ENDED_UNITS.map((entry) => <SelectItem key={entry.value} value={entry.value}>{entry.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  </div>;
}