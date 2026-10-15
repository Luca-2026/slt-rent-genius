/**
 * Paket 2 – gemeinsames Preismodul für Mietdauer und Staffelpreise.
 *
 * Spiegelkopie, Änderungen immer in beiden Dateien:
 *   src/lib/pricing/rentalPricing.ts
 *   supabase/functions/_shared/rental-pricing.ts
 *
 * Reine Funktionen ohne UI- und Datenbankabhängigkeit. Alle Zeitangaben sind
 * Wanduhrzeiten in Europe/Berlin (Datum "YYYY-MM-DD", Uhrzeit "HH:MM").
 * Preise sind Nettopreise aus dem CMS.
 */

export type PricingUnit = "stueck" | "pauschal" | "arbeitstage" | "miettage" | "kalendertage" | "wochen" | "monate";
export type PricingScheme = "bau" | "event";

export interface RentalMoment {
  date: string | null | undefined;
  time?: string | null;
}

export interface RentalDayOptions {
  use_saturday?: boolean;
  use_sunday?: boolean;
}

export interface ManagedPrices {
  price_from_1_rd: number | null;
  price_from_3_rd: number | null;
  price_from_10_rd: number | null;
  price_from_20_rd: number | null;
  price_weekend_num: number | null;
  price_base_1_3_cd: number | null;
  surcharge_per_cd_from_4: number | null;
  surcharge_per_cd_from_8: number | null;
}

export const DEFAULT_START_TIME = "08:00";
export const DEFAULT_END_TIME = "17:00";
const DAY_MS = 86_400_000;
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

// ---------------------------------------------------------------- Zeit (Europe/Berlin)

let berlinFmt: Intl.DateTimeFormat | null = null;
function fmt(): Intl.DateTimeFormat {
  if (!berlinFmt) {
    berlinFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Berlin",
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  return berlinFmt;
}

export interface BerlinParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** 0 = Sonntag … 6 = Samstag */
  weekday: number;
  /** fortlaufender Kalendertag (für Tagesvergleiche ohne Uhrzeit) */
  dayNumber: number;
}

export function berlinParts(instant: number): BerlinParts {
  const p: Record<string, number> = {};
  for (const part of fmt().formatToParts(new Date(instant))) {
    if (part.type !== "literal") p[part.type] = Number(part.value);
  }
  const dayUtc = Date.UTC(p.year, p.month - 1, p.day);
  return {
    year: p.year,
    month: p.month,
    day: p.day,
    hour: p.hour,
    minute: p.minute,
    weekday: new Date(dayUtc).getUTCDay(),
    dayNumber: Math.round(dayUtc / DAY_MS),
  };
}

function offsetMs(instant: number): number {
  const p = berlinParts(instant);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return asUtc - Math.floor(instant / 60_000) * 60_000;
}

/** Berliner Wanduhrzeit → Zeitpunkt (ms). Fehlende Uhrzeit = fallbackTime. */
export function berlinInstant(moment: RentalMoment | null | undefined, fallbackTime: string): number | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})/.exec(moment?.date ?? "");
  if (!d) return null;
  const t = /^(\d{1,2}):(\d{2})/.exec(moment?.time || fallbackTime) ?? /^(\d{1,2}):(\d{2})/.exec(fallbackTime)!;
  const naive = Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]);
  let instant = naive - offsetMs(naive);
  instant = naive - offsetMs(instant);
  return instant;
}

function span(start: RentalMoment, end: RentalMoment): { s: number; e: number } | null {
  const s = berlinInstant(start, DEFAULT_START_TIME);
  const e = berlinInstant(end, DEFAULT_END_TIME);
  if (s === null || e === null) return null;
  return { s, e };
}

// ---------------------------------------------------------------- Miettage

/** Anzahl der angefangenen 24-Std.-Blöcke ab Mietbeginn (mind. 1). */
export function rentalBlockCount(start: RentalMoment, end: RentalMoment): number {
  const sp = span(start, end);
  if (!sp || sp.e <= sp.s) return 1;
  return Math.max(1, Math.ceil((sp.e - sp.s) / DAY_MS));
}

/**
 * Sonntags-/Montags-/Wochenendregel für einen einzelnen 24-Std.-Block.
 * Stand 15.10., Bestätigung durch Benedikt ausstehend – bewusst isoliert,
 * damit die Regel ohne Umbau des restlichen Moduls austauschbar ist.
 *
 * Unter 5 Blöcken: Blöcke mit Beginn am Sonntag zählen nicht; ein Block mit
 * Beginn am Montag zählt nicht, wenn die Rückgabe am selben Montag bis 09:30 erfolgt.
 * Ab 5 Blöcken: Samstag/Sonntag zählen nur mit use_saturday bzw. use_sunday.
 */
export function isUncountedBlock(
  blockStart: number,
  rentalEnd: number,
  totalBlocks: number,
  opts: RentalDayOptions = {},
): boolean {
  const b = berlinParts(blockStart);
  if (totalBlocks < 5) {
    if (b.weekday === 0) return true;
    if (b.weekday === 1) {
      const e = berlinParts(rentalEnd);
      return e.dayNumber === b.dayNumber && e.hour * 60 + e.minute <= 9 * 60 + 30;
    }
    return false;
  }
  if (b.weekday === 6) return !opts.use_saturday;
  if (b.weekday === 0) return !opts.use_sunday;
  return false;
}

function countRentalDays(s: number, e: number, opts: RentalDayOptions): number {
  const total = e > s ? Math.max(1, Math.ceil((e - s) / DAY_MS)) : 1;
  let counted = 0;
  for (let i = 0; i < total; i++) {
    if (!isUncountedBlock(s + i * DAY_MS, e, total, opts)) counted++;
  }
  return Math.max(1, counted);
}

// ---------------------------------------------------------------- 1a) Dauer

export function rentalDuration(
  start: RentalMoment,
  end: RentalMoment,
  unit: PricingUnit | string,
  opts: RentalDayOptions = {},
): number {
  if (unit === "stueck" || unit === "pauschal") return 1;
  const sp = span(start, end);
  if (!sp) return 1;
  const sd = berlinParts(sp.s).dayNumber;
  const ed = berlinParts(sp.e).dayNumber;
  const calendarDays = Math.max(1, ed - sd + 1);
  switch (unit) {
    case "miettage":
      return countRentalDays(sp.s, sp.e, opts);
    case "wochen":
      return Math.max(1, Math.ceil(calendarDays / 7));
    case "monate":
      return Math.max(1, Math.ceil(calendarDays / 30));
    case "arbeitstage": {
      let n = 0;
      for (let d = sd; d <= Math.max(sd, ed); d++) {
        const wd = new Date(d * DAY_MS).getUTCDay();
        if (wd !== 0 && wd !== 6) n++;
      }
      return Math.max(1, n);
    }
    default:
      return calendarDays;
  }
}

/** 1f) Versicherungstage: immer Kalendertage, unabhängig von der Positionseinheit. */
export function insuranceCalendarDays(start: RentalMoment, end: RentalMoment): number {
  return rentalDuration(start, end, "kalendertage");
}

// ---------------------------------------------------------------- 1b) Einheit

export function defaultUnit(product: { pricing_scheme?: string | null }): PricingUnit {
  return product.pricing_scheme === "bau" ? "miettage" : "kalendertage";
}

// ---------------------------------------------------------------- 1c/1d) Staffeln

const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : v === null || v === undefined || v === "" ? NaN : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export interface BauTier {
  rate: number;
  threshold: 1 | 3 | 10 | 20;
  label: string;
}

/** Höchste Stufe mit Schwelle ≤ Miettage, die einen Wert hat; leere Stufen werden übersprungen. */
export function tierPriceBau(prices: Partial<ManagedPrices>, rentalDays: number): BauTier | null {
  const tiers: [1 | 3 | 10 | 20, unknown, string][] = [
    [20, prices.price_from_20_rd, "ab 20 Miettagen"],
    [10, prices.price_from_10_rd, "ab 10 Miettagen"],
    [3, prices.price_from_3_rd, "ab 3 Miettagen"],
    [1, prices.price_from_1_rd, "ab 1 Miettag"],
  ];
  for (const [threshold, value, label] of tiers) {
    const rate = num(value);
    if (threshold <= rentalDays && rate !== null) return { rate, threshold, label };
  }
  return null;
}

export interface EventTier {
  /** Gesamtpreis der Position für die Kalendertage (je Artikel) */
  total: number;
  /** total ÷ Kalendertage, auf Cent gerundet */
  perDay: number;
  label: string;
}

export function tierPriceEvent(prices: Partial<ManagedPrices>, calendarDays: number): EventTier | null {
  const base = num(prices.price_base_1_3_cd);
  if (base === null) return null;
  const days = Math.max(1, Math.round(calendarDays));
  if (days <= 3) return { total: round2(base), perDay: round2(base / days), label: "Grundpreis 1–3 Kalendertage" };
  const from8 = days >= 8;
  const rate = from8
    ? num(prices.surcharge_per_cd_from_8) ?? base * 0.2
    : num(prices.surcharge_per_cd_from_4) ?? base * 0.5;
  const total = round2(base + (days - 3) * rate);
  return { total, perDay: round2(total / days), label: from8 ? "Aufschlag ab 8 Kalendertagen" : "Aufschlag ab 4 Kalendertagen" };
}

// ---------------------------------------------------------------- 1e) Wochenendtarif

/** Abholung Freitag ab 16:00 UND Rückgabe am folgenden Montag bis 09:30 – sonst null. */
export function weekendTariff(
  start: RentalMoment,
  end: RentalMoment,
  prices: Partial<ManagedPrices>,
): { price: number } | null {
  const price = num(prices.price_weekend_num);
  if (price === null) return null;
  const sp = span(start, end);
  if (!sp || sp.e <= sp.s) return null;
  const s = berlinParts(sp.s);
  const e = berlinParts(sp.e);
  const pickupOk = s.weekday === 5 && s.hour * 60 + s.minute >= 16 * 60;
  const returnOk = e.weekday === 1 && e.hour * 60 + e.minute <= 9 * 60 + 30 && e.dayNumber - s.dayNumber === 3;
  return pickupOk && returnOk ? { price } : null;
}

// ---------------------------------------------------------------- Positionspreis

export type LinePrice =
  | { kind: "weekend"; unit: "pauschal"; duration: 1; unit_price: number; label: string }
  | { kind: "tier"; unit: PricingUnit; duration: number; unit_price: number; label: string }
  | { kind: "duration_only"; unit: PricingUnit; duration: number };

export const WEEKEND_SUFFIX = " – Wochenendtarif (Fr 16 – Mo 09:30)";

/** Dauer + Einzelpreis einer Position (vor Kundenrabatt). unit = gewählte Einheit, sonst defaultUnit. */
export function computeRentalLinePrice(input: {
  prices: Partial<ManagedPrices>;
  scheme: PricingScheme | string | null | undefined;
  start: RentalMoment;
  end: RentalMoment;
  unit?: PricingUnit | null;
  opts?: RentalDayOptions;
}): LinePrice {
  const unit = input.unit ?? defaultUnit({ pricing_scheme: input.scheme ?? null });
  const isDefaultUnit = unit === defaultUnit({ pricing_scheme: input.scheme ?? null });
  if (isDefaultUnit) {
    const we = weekendTariff(input.start, input.end, input.prices);
    if (we) return { kind: "weekend", unit: "pauschal", duration: 1, unit_price: we.price, label: "Wochenendtarif" };
  }
  const duration = rentalDuration(input.start, input.end, unit, input.opts);
  if (unit !== "miettage" && unit !== "kalendertage") return { kind: "duration_only", unit, duration };
  if (input.scheme === "bau") {
    const t = tierPriceBau(input.prices, duration);
    if (t) return { kind: "tier", unit, duration, unit_price: t.rate, label: t.label };
  } else {
    const t = tierPriceEvent(input.prices, duration);
    if (t) return { kind: "tier", unit, duration, unit_price: t.perDay, label: t.label };
  }
  return { kind: "duration_only", unit, duration };
}

// ---------------------------------------------------------------- 1g) Einheiten

const LABELS: Record<PricingUnit, { one: string; many: string; short: string }> = {
  stueck: { one: "Stück", many: "Stück", short: "Stk." },
  pauschal: { one: "Pauschal", many: "Pauschal", short: "psch." },
  arbeitstage: { one: "Arbeitstag", many: "Arbeitstage", short: "AT" },
  miettage: { one: "Miettag", many: "Miettage", short: "MT" },
  kalendertage: { one: "Kalendertag", many: "Kalendertage", short: "KT" },
  wochen: { one: "Woche", many: "Wochen", short: "Wo." },
  monate: { one: "Monat", many: "Monate", short: "Mon." },
};

/** Einzahl bei 1, sonst Mehrzahl – z. B. (1, "miettage") → "Miettag". */
export function unitLabel(count: number, unit: PricingUnit | string): string {
  const entry = LABELS[unit as PricingUnit] ?? LABELS.stueck;
  return Math.abs(count) === 1 ? entry.one : entry.many;
}

export function unitAbbreviation(unit: PricingUnit | string): string {
  return (LABELS[unit as PricingUnit] ?? LABELS.stueck).short;
}

// ---------------------------------------------------------------- 1h) Standortpreise

export interface PricedProduct extends Partial<ManagedPrices> {
  id?: string | null;
  pricing_scheme?: string | null;
  prices_same_all_locations?: boolean | null;
  price_per_day?: string | null;
}

export interface LocationPriceRow extends Partial<ManagedPrices> {
  location: string;
  managed_product_id?: string;
}

const PRICE_KEYS: (keyof ManagedPrices)[] = [
  "price_from_1_rd",
  "price_from_3_rd",
  "price_from_10_rd",
  "price_from_20_rd",
  "price_weekend_num",
  "price_base_1_3_cd",
  "surcharge_per_cd_from_4",
  "surcharge_per_cd_from_8",
];

const normLoc = (v: string | null | undefined) =>
  (v ?? "").toLowerCase().replace(/ü/g, "ue").replace(/\s.*$/, "").trim();

/** "89,00 €/Tag" → 89 (deutsche/englische Trennzeichen). */
export function parseLegacyPrice(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const match = String(raw).replace(/\s/g, "").match(/(\d[\d.,]*)/);
  if (!match) return null;
  let token = match[1].replace(/[.,]+$/, "");
  const lastDot = token.lastIndexOf(".");
  const lastComma = token.lastIndexOf(",");
  const sep = lastDot > lastComma ? "." : lastComma > lastDot ? "," : "";
  if (sep) {
    const decimals = token.length - token.lastIndexOf(sep) - 1;
    if (decimals === 3) token = token.replace(/[.,]/g, "");
    else token = `${token.slice(0, token.lastIndexOf(sep)).replace(/[.,]/g, "")}.${token.slice(token.lastIndexOf(sep) + 1)}`;
  }
  const value = Number(token);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function resolveProductPrices(
  product: PricedProduct,
  location: string | null | undefined,
  locationRows: LocationPriceRow[] = [],
): ManagedPrices {
  let source: Partial<ManagedPrices> = product;
  if (product.prices_same_all_locations === false && location) {
    const row = locationRows.find(
      (r) => normLoc(r.location) === normLoc(location) && (!r.managed_product_id || !product.id || r.managed_product_id === product.id),
    );
    if (row) source = row;
  }
  const out = {} as ManagedPrices;
  for (const k of PRICE_KEYS) out[k] = num(source[k]);
  if (PRICE_KEYS.every((k) => out[k] === null)) {
    const legacy = parseLegacyPrice(product.price_per_day);
    if (legacy !== null) {
      if (product.pricing_scheme === "bau") out.price_from_1_rd = legacy;
      else out.price_base_1_3_cd = legacy;
    }
  }
  return out;
}
