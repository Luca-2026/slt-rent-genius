import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { signEarliestDay, SIGN_EXISTING_PERMIT_LEAD_HOURS, type SignPermitMode } from "../../../supabase/functions/_shared/sign-booking-lead";
export function SignPermitChoice({ value, onChange }: { value?: SignPermitMode; onChange: (mode: SignPermitMode) => void }) {
  return <section className="space-y-3 border-b border-border pb-4" aria-label="Genehmigung">
    <h4 className="font-semibold">Wer kümmert sich um die Genehmigung?</h4>
    <RadioGroup value={value ?? ""} onValueChange={next => { if (next === "existing" || next === "slt") onChange(next); }}>
      <label className="flex items-start gap-3"><RadioGroupItem value="existing" className="mt-1" /><span className="text-sm"><strong className="block">Genehmigung schon vorhanden</strong>Mindestens {SIGN_EXISTING_PERMIT_LEAD_HOURS} Stunden Vorlauf bis zur Aufstellung. Genehmigungskopie im Buchungsschritt hochladen. Wir stellen auf, protokollieren und bauen wieder ab.</span></label>
      <label className="flex items-start gap-3"><RadioGroupItem value="slt" className="mt-1" /><span className="text-sm"><strong className="block">Genehmigung durch SLT</strong>Mindestens 14 Werktage Vorlauf (Montag bis Samstag, ohne NRW-Feiertage). Städtische Gebühren rechnen wir anschließend transparent nach tatsächlichem Gebührenbescheid ab.</span></label>
    </RadioGroup>
    {value && <p className="text-sm font-semibold text-primary">Frühester Aufstelltag: {signEarliestDay(value).split("-").reverse().join(".")}{value === "existing" ? ` · Uhrzeit muss ebenfalls ${SIGN_EXISTING_PERMIT_LEAD_HOURS} Stunden Vorlauf erfüllen` : ""}</p>}
  </section>;
}