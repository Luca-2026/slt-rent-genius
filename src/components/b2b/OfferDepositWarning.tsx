import { AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useId } from "react";

export function OfferDepositWarning({ acknowledged, onAcknowledge, disabled = false }: {
  acknowledged: boolean;
  onAcknowledge: (value: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 space-y-2 text-sm">
      <p className="flex items-start gap-2 font-medium text-destructive">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>Keine Kaution hinterlegt. Bitte den Kautionsbetrag ergänzen.</span>
      </p>
      <div className="flex items-start gap-2">
        <Checkbox id={id} checked={acknowledged} disabled={disabled}
          onCheckedChange={(value) => onAcknowledge(value === true)} />
        <label htmlFor={id} className="min-w-0 cursor-pointer text-foreground">
          Dieses Mietangebot soll bewusst ohne Kaution erstellt und versendet werden.
        </label>
      </div>
    </div>
  );
}