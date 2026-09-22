/**
 * Schritt „Personalausweis abgleichen". Pflichthäkchen, optional die Ausweisart.
 * Es wird bewusst keine Ausweiskopie gespeichert.
 */
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Props {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  docType: string;
  onDocTypeChange: (value: string) => void;
  customerName?: string;
}

export function IdCheckStep({ checked, onCheckedChange, docType, onDocTypeChange, customerName }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
        <Checkbox id="id-check" checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} />
        <label htmlFor="id-check" className="text-sm leading-relaxed cursor-pointer">
          Ich habe den <strong>Personalausweis bzw. Reisepass</strong>
          {customerName ? <> von <strong>{customerName}</strong></> : null} eingesehen und mit den Kundendaten abgeglichen.
        </label>
      </div>

      <div>
        <Label className="text-xs">Art des Ausweisdokuments (optional)</Label>
        <Select value={docType} onValueChange={onDocTypeChange}>
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personalausweis">Personalausweis</SelectItem>
            <SelectItem value="reisepass">Reisepass</SelectItem>
            <SelectItem value="fuehrerschein">Führerschein (zusätzlich geprüft)</SelectItem>
            <SelectItem value="sonstiges">Sonstiges Ausweisdokument</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Es wird keine Ausweiskopie gespeichert. Im Protokoll erscheint nur die Bestätigung mit Zeitpunkt und Name des
        Mitarbeiters.
      </p>
    </div>
  );
}
