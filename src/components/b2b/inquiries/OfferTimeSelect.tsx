import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OFFER_TIME_OPTIONS } from "./offerEditorRules";

interface Props {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}

export function OfferTimeSelect({ value, onChange, label, disabled }: Props) {
  return <Select value={value || "unset"} onValueChange={v => onChange(v === "unset" ? "" : v)} disabled={disabled}>
    <SelectTrigger aria-label={label} className="w-full min-w-0 px-2"><SelectValue placeholder="–" /></SelectTrigger>
    <SelectContent>
      <SelectItem value="unset">–</SelectItem>
      {value && !OFFER_TIME_OPTIONS.includes(value) && <SelectItem value={value} disabled>{value}</SelectItem>}
      {OFFER_TIME_OPTIONS.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
    </SelectContent>
  </Select>;
}