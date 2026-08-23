/**
 * Zusatzoptionen (Versicherungen etc.) für Mietartikel.
 *
 * Pro CMS-Artikel wird eine Liste erlaubter Zusatzoptionen gepflegt
 * (z. B. Maschinenbruchversicherung beim Bagger, aber nicht bei der
 * Bierzeltgarnitur). Bei der Angebotserstellung können diese Optionen
 * pro Position ausgewählt und bepreist werden.
 */

export type AddonPriceType = "flat" | "per_unit" | "percent";

export interface AddonOption {
  /** stabiler Schlüssel, z. B. "maschinenbruch" oder "custom-1" */
  key: string;
  label: string;
  price_type: AddonPriceType;
  /** Netto-Betrag bzw. Prozentsatz je nach price_type */
  price: number;
  /** Selbstbehalt in EUR (nur informativ, z. B. 1.000 €) */
  deductible?: number | null;
  note?: string;
}

export const ADDON_PRESETS: { key: string; label: string; price_type: AddonPriceType; price: number; deductible?: number }[] = [
  { key: "maschinenbruch", label: "Maschinenbruchversicherung", price_type: "percent", price: 12, deductible: 1000 },
  { key: "elektronik", label: "Elektronikversicherung", price_type: "percent", price: 10, deductible: 500 },
  { key: "vollkasko", label: "Vollkaskoversicherung (Anhänger)", price_type: "percent", price: 15, deductible: 1000 },
  { key: "sb_reduktion", label: "Reduzierung Selbstbehalt", price_type: "flat", price: 0, deductible: 250 },
  { key: "haftpflicht", label: "Erweiterte Haftpflichtdeckung", price_type: "flat", price: 0 },
  { key: "custom", label: "Weitere Zusatzoption", price_type: "flat", price: 0 },
];

export const ADDON_PRICE_TYPE_LABELS: Record<AddonPriceType, string> = {
  flat: "Pauschale (€)",
  per_unit: "je Einheit / Tag (€)",
  percent: "% der Positionssumme",
};

/** Untrusted JSON (CMS) → typsichere Liste. */
export function parseAddonOptions(raw: unknown): AddonOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry): AddonOption | null => {
      const o = (entry ?? {}) as Record<string, unknown>;
      const label = String(o.label ?? "").trim();
      if (!label) return null;
      const priceType = (["flat", "per_unit", "percent"] as const).includes(o.price_type as AddonPriceType)
        ? (o.price_type as AddonPriceType)
        : "flat";
      const price = Number(o.price);
      const deductible = Number(o.deductible);
      return {
        key: String(o.key ?? label.toLowerCase().replace(/\s+/g, "-")).slice(0, 60),
        label: label.slice(0, 120),
        price_type: priceType,
        price: Number.isFinite(price) && price >= 0 ? price : 0,
        deductible: Number.isFinite(deductible) && deductible > 0 ? deductible : null,
        note: o.note ? String(o.note).slice(0, 200) : undefined,
      };
    })
    .filter((o): o is AddonOption => o !== null);
}

/** Vorschlagsbetrag (netto) einer Zusatzoption für eine Angebotsposition. */
export function suggestAddonAmount(
  option: Pick<AddonOption, "price_type" | "price">,
  item: { quantity: number; unit_price: number; discount_percent?: number },
): number {
  const lineNet = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
  const raw =
    option.price_type === "percent"
      ? (lineNet * option.price) / 100
      : option.price_type === "per_unit"
        ? option.price * Math.max(1, item.quantity)
        : option.price;
  return Math.round((raw + Number.EPSILON) * 100) / 100;
}
