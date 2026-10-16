/**
 * Preisfelder der CMS-Artikelmaske: Preisschema Bau (je Miettag, gestaffelt)
 * oder Event (Grundpreis 1–3 Kalendertage + Aufschläge), optional je Standort.
 * Alle Werte netto. Reine Helfer sind exportiert und getestet.
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PricingScheme = "bau" | "event";

export const PRICE_FIELDS = [
  "price_from_1_rd",
  "price_from_3_rd",
  "price_from_10_rd",
  "price_from_20_rd",
  "price_weekend_num",
  "price_base_1_3_cd",
  "surcharge_per_cd_from_4",
  "surcharge_per_cd_from_8",
] as const;
export type PriceField = (typeof PRICE_FIELDS)[number];
/** Eingaben als Text (deutsches Komma erlaubt). */
export type PriceSet = Record<PriceField, string>;

export const emptyPriceSet = (): PriceSet =>
  Object.fromEntries(PRICE_FIELDS.map((f) => [f, ""])) as PriceSet;

/** "89,50" / "89.50" / "1.499" → Zahl; leer/ungültig → null. */
export function parsePriceInput(raw: string | null | undefined): number | null {
  const v = String(raw ?? "").trim().replace(/\s|€/g, "");
  if (!v) return null;
  let t = v;
  const lastDot = t.lastIndexOf(".");
  const lastComma = t.lastIndexOf(",");
  const sepPos = Math.max(lastDot, lastComma);
  if (sepPos >= 0) {
    const decimals = t.length - sepPos - 1;
    if (decimals === 3) t = t.replace(/[.,]/g, "");
    else t = `${t.slice(0, sepPos).replace(/[.,]/g, "")}.${t.slice(sepPos + 1)}`;
  }
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  const n = Math.round(Number(t) * 100) / 100;
  return Number.isFinite(n) ? n : null;
}

/** Zahl aus der DB → Eingabetext "89,00". */
export function priceToInput(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === "") return "";
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(2).replace(".", ",") : "";
}

/** Zahl → Alt-Textfeld "89,00 €/Tag" für Webseite und Angebots-Editor. */
export function formatDayPriceText(n: number | null): string | null {
  if (n === null) return null;
  return `${n.toFixed(2).replace(".", ",")} €/Tag`;
}

/** Zahl → Alt-Textfeld "120,00 €" (Wochenende/Monat) für Webseite und Angebots-Editor. */
export function formatLegacyAmountText(n: number | null): string | null {
  if (n === null) return null;
  return `${n.toFixed(2).replace(".", ",")} €`;
}

/**
 * Alt-Textfeld `price_weekend` aus `price_weekend_num`. Ist das Feld leer und war es vorher
 * auch leer (Altwert nicht lesbar migriert), bleibt der bisherige Text unverändert;
 * wurde ein vorhandener Wert gelöscht, wird auch der Text geleert.
 */
export function legacyWeekendText(
  set: PriceSet,
  previousNum: number | string | null | undefined,
  existingText: string | null,
): string | null {
  const n = parsePriceInput(set.price_weekend_num);
  if (n !== null) return formatLegacyAmountText(n);
  return previousNum !== null && previousNum !== undefined && previousNum !== "" ? null : existingText;
}

/**
 * Alt-Textfeld `price_per_month` bei Bau-Artikeln: Umkehrung der Migrationsregel
 * (Monatspreis ÷ 20 = ab 20 Miettagen), also Staffel 20 × 20. Event-Artikel haben keine
 * Monatsstaffel; ihr Text bleibt unverändert. Gelöschte Staffel leert den Text.
 */
export function legacyMonthText(
  scheme: PricingScheme,
  set: PriceSet,
  previousTier20: number | string | null | undefined,
  existingText: string | null,
): string | null {
  if (scheme !== "bau") return existingText;
  const n = parsePriceInput(set.price_from_20_rd);
  if (n !== null) return formatLegacyAmountText(Math.round(n * 20 * 100) / 100);
  return previousTier20 !== null && previousTier20 !== undefined && previousTier20 !== "" ? null : existingText;
}

/** Tagespreis, der in price_per_day zurückgeschrieben wird. */
export function legacyDayPrice(scheme: PricingScheme, set: PriceSet): number | null {
  return parsePriceInput(scheme === "event" ? set.price_base_1_3_cd : set.price_from_1_rd);
}

/** Preisset → DB-Spalten (numeric oder null). */
export function priceSetToColumns(set: PriceSet): Record<PriceField, number | null> {
  return Object.fromEntries(PRICE_FIELDS.map((f) => [f, parsePriceInput(set[f])])) as Record<PriceField, number | null>;
}

export function rowToPriceSet(row: Partial<Record<PriceField, number | string | null>> | null | undefined): PriceSet {
  return Object.fromEntries(PRICE_FIELDS.map((f) => [f, priceToInput(row?.[f] ?? null)])) as PriceSet;
}

const BAU_FIELDS: { key: PriceField; label: string; hint?: string }[] = [
  { key: "price_from_1_rd", label: "ab 1 Miettag" },
  { key: "price_from_3_rd", label: "ab 3 Miettagen" },
  { key: "price_from_10_rd", label: "ab 10 Miettagen" },
  { key: "price_from_20_rd", label: "ab 20 Miettagen" },
  { key: "price_weekend_num", label: "Wochenende (Fr. 16 Uhr – Mo. 09:30 Uhr)", hint: "Richtwert ca. Tagespreis × 1,5, frei eintragbar." },
];
const EVENT_FIELDS: { key: PriceField; label: string; hint?: string }[] = [
  { key: "price_base_1_3_cd", label: "1–3 Kalendertage (Grundpreis)" },
  { key: "surcharge_per_cd_from_4", label: "Aufschlag je KT ab 4 KT", hint: "Leer = automatisch 50 % bzw. 20 % des Grundpreises." },
  { key: "surcharge_per_cd_from_8", label: "Aufschlag je KT ab 8 KT", hint: "Leer = automatisch 50 % bzw. 20 % des Grundpreises." },
  { key: "price_weekend_num", label: "Wochenende (Fr. 16 Uhr – Mo. 09:30 Uhr)" },
];

/** Pflichtfeld des Schemas: Event = Grundpreis 1–3 KT, Bau = ab 1 Miettag. */
export function basePriceField(scheme: PricingScheme): PriceField {
  return scheme === "event" ? "price_base_1_3_cd" : "price_from_1_rd";
}

export function isBasePriceMissing(scheme: PricingScheme, set: PriceSet | null | undefined): boolean {
  return !set || parsePriceInput(set[basePriceField(scheme)]) === null;
}

/** Grundpreis ist nur Pflicht, wenn der Artikel veröffentlicht ist und nicht „nur auf Anfrage". */
export function basePriceRequired(a: { is_published: boolean; on_request: boolean }): boolean {
  return a.is_published && !a.on_request;
}

export const NO_BASE_PRICE_HINT = "Ohne Grundpreis wird auf der Webseite kein Preis angezeigt.";

export function schemeFields(scheme: PricingScheme) {
  return scheme === "event" ? EVENT_FIELDS : BAU_FIELDS;
}

export function ManagedPriceFields({
  scheme,
  value,
  onChange,
  idPrefix,
}: {
  scheme: PricingScheme;
  value: PriceSet;
  onChange: (next: PriceSet) => void;
  idPrefix: string;
}) {
  const fields = schemeFields(scheme);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {fields.map((f) => (
        <div key={f.key}>
          <Label htmlFor={`${idPrefix}-${f.key}`} className="text-xs">
            {f.label} (€ netto{scheme === "bau" ? " je Miettag" : ""})
          </Label>
          <Input
            id={`${idPrefix}-${f.key}`}
            inputMode="decimal"
            placeholder="z. B. 89,00"
            value={value[f.key]}
            onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
          />
          {f.hint && <p className="text-[11px] text-muted-foreground mt-1">{f.hint}</p>}
        </div>
      ))}
      {isBasePriceMissing(scheme, value) && (
        <p className="col-span-full text-xs text-amber-600 dark:text-amber-400">{NO_BASE_PRICE_HINT}</p>
      )}
    </div>
  );
}
