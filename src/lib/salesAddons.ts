/**
 * Zusatzpositionen für Verkaufsangebote (Neu- und Gebrauchtartikel).
 *
 * Anders als bei Mietangeboten gibt es hier auch Minuspositionen
 * (Inzahlungnahme eines Altgeräts).
 */
import type { AddonOption } from "@/lib/offerAddons";

export interface SalesAddonPreset extends AddonOption {
  /** Betrag wird als Abzug (negativ) ins Angebot übernommen. */
  negative?: boolean;
  hint?: string;
}

export const SALES_ADDON_PRESETS: SalesAddonPreset[] = [
  {
    key: "lieferung",
    label: "Lieferung / Anlieferung",
    price_type: "flat",
    price: 0,
    hint: "Frachtkosten frei bepreisen",
  },
  {
    key: "garantieverlaengerung",
    label: "Garantieverlängerung",
    price_type: "flat",
    price: 0,
    hint: "z. B. 12 oder 24 Monate – Laufzeit im Feld ergänzen",
  },
  {
    key: "einweisung",
    label: "Einweisung / Inbetriebnahme",
    price_type: "flat",
    price: 0,
    hint: "Vor-Ort-Einweisung durch unser Team",
  },
  {
    key: "inzahlungnahme",
    label: "Inzahlungnahme Altgerät",
    price_type: "flat",
    price: 0,
    negative: true,
    hint: "Wird als Abzug im Angebot ausgewiesen",
  },
];

export function isSalesAddonNegative(key: string): boolean {
  return SALES_ADDON_PRESETS.some((p) => p.key === key && p.negative);
}
