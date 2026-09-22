/**
 * Schritt „Zusatzkosten" bei der Rücknahme. Vorlagen plus freie Positionen,
 * jeweils mit Menge und Einzelpreis. Die Summe fließt in die Rechnung ein.
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import {
  EXTRA_CHARGE_TEMPLATES, emptyExtraCharge, extraChargeTotal, formatEuro,
  sumExtraCharges, type ExtraCharge,
} from "./protocolShared";

interface Props {
  charges: ExtraCharge[];
  onChange: (charges: ExtraCharge[]) => void;
}

export function ExtraChargesStep({ charges, onChange }: Props) {
  const update = (id: string, patch: Partial<ExtraCharge>) =>
    onChange(charges.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Kosten, die bei der Rückgabe zusätzlich anfallen. Sie werden in der Rechnung als eigene Positionen ausgewiesen.
      </p>

      <div className="flex flex-wrap gap-2">
        {EXTRA_CHARGE_TEMPLATES.map((tpl) => (
          <Button
            key={tpl.label}
            variant="outline"
            size="sm"
            onClick={() => onChange([...charges, { ...emptyExtraCharge(tpl.label), unitPrice: tpl.unitPrice }])}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {tpl.label}
          </Button>
        ))}
      </div>

      {charges.map((charge) => (
        <Card key={charge.id}>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Label className="text-xs">Bezeichnung</Label>
                <Input
                  value={charge.label}
                  onChange={(e) => update(charge.id, { label: e.target.value })}
                  placeholder="z. B. Reinigung"
                  className="text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive mt-5"
                onClick={() => onChange(charges.filter((c) => c.id !== charge.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Menge</Label>
                <Input
                  inputMode="decimal"
                  value={charge.quantity}
                  onChange={(e) => update(charge.id, { quantity: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Einzelpreis (brutto)</Label>
                <Input
                  inputMode="decimal"
                  value={charge.unitPrice}
                  onChange={(e) => update(charge.id, { unitPrice: e.target.value })}
                  placeholder="0,00"
                  className="text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-right text-muted-foreground">
              Zwischensumme: {formatEuro(extraChargeTotal(charge))}
            </p>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={() => onChange([...charges, emptyExtraCharge()])} className="w-full">
        <Plus className="h-4 w-4 mr-1.5" />
        Freie Position hinzufügen
      </Button>

      {charges.length > 0 && (
        <p className="text-sm font-medium text-right">
          Summe Zusatzkosten: {formatEuro(sumExtraCharges(charges))}
        </p>
      )}
    </div>
  );
}
