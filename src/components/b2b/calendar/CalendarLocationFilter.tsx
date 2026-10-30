import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CalendarLocationFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-full sm:w-56" aria-label="Standort"><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Alle Standorte</SelectItem>
      <SelectItem value="krefeld">Krefeld</SelectItem>
      <SelectItem value="bonn">Bonn</SelectItem>
      <SelectItem value="muelheim">Mülheim an der Ruhr</SelectItem>
    </SelectContent>
  </Select>;
}