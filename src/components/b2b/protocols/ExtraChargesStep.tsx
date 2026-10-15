/**
 * Schritt „Zusatzkosten" bei der Rücknahme. Reinigung und Kraftstoff mit Preisen
 * laut Mietbedingungen, plus freie Positionen. Beträge brutto; der Kunde bestätigt
 * sie mit seiner Unterschrift, die Rechnung übernimmt sie und verrechnet sie mit der Kaution.
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fuel, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  EXTRA_CHARGE_TEMPLATES, emptyExtraCharge, extraChargeTotal, formatEuro,
  sumExtraCharges, type ExtraCharge,
} from "./protocolShared";
import { CLEANING_UNIT_GROSS, CLEANING_UNIT_MINUTES, CLEANING_UNIT_NET, FUEL_PRICES, cleaningMinutesLabel } from "@/lib/returnCharges";

export interface ChargeSuggestion { kind: "cleaning" | "fuel"; text: string; itemName?: string }

interface Props {
  charges: ExtraCharge[];
  onChange: (charges: ExtraCharge[]) => void;
  /** Hinweise aus Sauberkeit und Tankfüllstand. */
  suggestions?: ChargeSuggestion[];
  /** Hinweis zur Kaution (z. B. „Kaution 750,00 € – wird verrechnet“). */
  depositHint?: string | null;
}

const price = (n: number) => n.toFixed(2).replace(".", ",");

export const cleaningCharge = (): ExtraCharge => ({
  ...emptyExtraCharge("Reinigung (Mehraufwand laut AGB)"), quantity: "1", unitPrice: price(CLEANING_UNIT_GROSS), unit: "15min",
});
export const fuelCharge = (fuel: (typeof FUEL_PRICES)[number], itemName?: string): ExtraCharge => ({
  ...emptyExtraCharge(`Kraftstoff ${fuel.label} nachgetankt${itemName ? ` – ${itemName}` : ""}`),
  quantity: "", unitPrice: price(fuel.pricePerLiter), unit: "l",
});

export function ExtraChargesStep({ charges, onChange, suggestions = [], depositHint }: Props) {
  const update = (id: string, patch: Partial<ExtraCharge>) =>
    onChange(charges.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const hasCleaning = charges.some((c) => /reinigung/i.test(c.label));

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Beträge brutto. Der Kunde bestätigt sie mit seiner Unterschrift; sie werden in die Rechnung übernommen und mit einer gezahlten Kaution verrechnet.
      </p>

      {suggestions.map((s, i) => (
        <div key={i} className="rounded-md border border-accent/40 bg-accent/5 p-3 space-y-2">
          <p className="text-sm">{s.text}</p>
          {s.kind === "cleaning" ? (
            <Button type="button" size="sm" variant="outline" disabled={hasCleaning} onClick={() => onChange([...charges, cleaningCharge()])}>
              <Sparkles className="h-3.5 w-3.5 mr-1" /> {hasCleaning ? "Reinigung erfasst" : `Reinigung ${CLEANING_UNIT_MINUTES} Min · ${formatEuro(CLEANING_UNIT_GROSS)} hinzufügen`}
            </Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {FUEL_PRICES.map((f) => (
                <Button key={f.value} type="button" size="sm" variant="outline" onClick={() => onChange([...charges, fuelCharge(f, s.itemName)])}>
                  <Fuel className="h-3.5 w-3.5 mr-1" /> {f.label} {price(f.pricePerLiter)} €/l
                </Button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onChange([...charges, cleaningCharge()])}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Reinigung
        </Button>
        {FUEL_PRICES.map((f) => (
          <Button key={f.value} variant="outline" size="sm" onClick={() => onChange([...charges, fuelCharge(f)])}>
            <Plus className="h-3.5 w-3.5 mr-1" /> {f.label} ({price(f.pricePerLiter)} €/l)
          </Button>
        ))}
        {EXTRA_CHARGE_TEMPLATES.filter((t) => !/reinigung|kraftstoff/i.test(t.label)).map((tpl) => (
          <Button key={tpl.label} variant="outline" size="sm"
            onClick={() => onChange([...charges, { ...emptyExtraCharge(tpl.label), unitPrice: tpl.unitPrice }])}>
            <Plus className="h-3.5 w-3.5 mr-1" /> {tpl.label}
          </Button>
        ))}
      </div>

      {charges.map((charge) => {
        const liters = charge.unit === "l";
        const cleaning = charge.unit === "15min";
        return (
          <Card key={charge.id}>
            <CardContent className="p-3 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <Label className="text-xs">Bezeichnung</Label>
                  <Input value={charge.label} onChange={(e) => update(charge.id, { label: e.target.value })} placeholder="z. B. Reinigung" className="text-sm" />
                </div>
                <Button variant="ghost" size="sm" aria-label="Position entfernen" className="text-destructive mt-5"
                  onClick={() => onChange(charges.filter((c) => c.id !== charge.id))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{liters ? "Liter nachgetankt" : cleaning ? `Einheiten à ${CLEANING_UNIT_MINUTES} Min` : "Menge"}</Label>
                  <Input inputMode="decimal" value={charge.quantity} placeholder={liters ? "z. B. 12,5" : "1"}
                    onChange={(e) => update(charge.id, { quantity: e.target.value })} className="h-11 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">{liters ? "Literpreis (brutto)" : cleaning ? `Preis je ${CLEANING_UNIT_MINUTES} Min (brutto)` : "Einzelpreis (brutto)"}</Label>
                  <Input inputMode="decimal" value={charge.unitPrice} placeholder="0,00"
                    onChange={(e) => update(charge.id, { unitPrice: e.target.value })} className="h-11 text-sm" />
                </div>
              </div>
              <p className="text-xs text-right text-muted-foreground">
                {liters ? `${charge.quantity || "0"} l × ${charge.unitPrice || "0"} € = `
                  : cleaning ? `${charge.quantity || "0"} × ${CLEANING_UNIT_MINUTES} Min (${cleaningMinutesLabel(Number(String(charge.quantity).replace(",", ".")) || 0)}) × ${charge.unitPrice || "0"} € = `
                  : "Zwischensumme: "}{formatEuro(extraChargeTotal(charge))}
              </p>
            </CardContent>
          </Card>
        );
      })}

      <Button variant="outline" onClick={() => onChange([...charges, emptyExtraCharge()])} className="w-full">
        <Plus className="h-4 w-4 mr-1.5" /> Freie Position hinzufügen
      </Button>

      {charges.length > 0 && (
        <div className="text-sm text-right space-y-0.5">
          <p className="font-medium">Summe Zusatzkosten: {formatEuro(sumExtraCharges(charges))} brutto</p>
          {depositHint && <p className="text-xs text-muted-foreground">{depositHint}</p>}
        </div>
      )}
    </div>
  );
}
