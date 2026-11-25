/**
 * Baustromrechner (Richtwerte, getestet: src/test/powerCalculator.test.ts).
 * Scheinleistung S = P / cos φ mit cos φ 0,8 (Bemessungsbasis von Stromerzeugern nach ISO 8528),
 * Strom I = S / (√3 · 400 V). Verteiler- und Aggregatleistungen stammen aus den CMS-Angaben der Artikel.
 * Ersetzt keine Planung durch eine Elektrofachkraft (DIN VDE 0100-704, DGUV Information 203-006).
 */
export const POWER_FACTOR = 0.8;
export const VOLTAGE = 400;

/** Verteiler aufsteigend nach Anschlussleistung (CMS) und Zuleitung. */
export const DISTRIBUTORS = [
  { slug: "endverteilerschrank-22kva-ev32", kva: 22, feedAmp: 32 },
  { slug: "endverteilerschrank-44kva-ev63", kva: 44, feedAmp: 63 },
  { slug: "hauptverteilerschrank-86kva-hv125", kva: 86, feedAmp: 125 },
  { slug: "gruppenverteilerschrank-173-kva-gv250-2-l", kva: 173, feedAmp: 250 },
] as const;

/** Drehstrom-Aggregate mit Dauerleistung laut CMS. */
export const GENERATORS = [
  { slug: "aggregat-7-5kva", kva: 7.5 },
  { slug: "aggregat-20kva", kva: 19 },
  { slug: "aggregat-50kva", kva: 50 },
  { slug: "aggregat-100kva", kva: 100 },
] as const;

/** Vorhandene CEE-Kabellängen je Stromstärke (Katalog). */
export const CEE_CABLES: Record<number, number[]> = { 32: [3, 5, 10, 20, 50], 63: [3, 5, 10, 20] };
export const cableSlug = (amp: number, m: number) => `cee-kabel-${amp}a-${m}m`;

export interface Consumer { kw: number; qty: number }
/** available: nur am Standort verfügbare Kabellängen kombinieren. */
export interface PowerInput { consumers: Consumer[]; gridConnection: boolean; distanceM: number; available?: (slug: string) => boolean }
export interface PowerLine { slug: string; qty: number }
export interface PowerResult {
  totalKw: number; kva: number; ampere: number;
  distributor: PowerLine | null; cables: PowerLine[]; generator: PowerLine | null;
  /** Zuleitung ohne passendes CEE-Kabel im Katalog (über 63 A). */
  feedOnRequest: boolean; overCapacity: boolean;
}

/** Kürzeste Kombination vorhandener Längen, die die Entfernung abdeckt. */
export function pickCables(amp: number, distanceM: number, available?: (slug: string) => boolean): PowerLine[] {
  const all = CEE_CABLES[amp];
  if (!all) return [];
  const own = available ? all.filter((m) => available(cableSlug(amp, m))) : all;
  const lengths = own.length ? own : all;
  const need = Math.max(1, Math.ceil(distanceM));
  const longest = lengths[lengths.length - 1];
  const counts = new Map<number, number>();
  let rest = need;
  while (rest > longest) { counts.set(longest, (counts.get(longest) ?? 0) + 1); rest -= longest; }
  const last = lengths.find((l) => l >= rest) ?? longest;
  counts.set(last, (counts.get(last) ?? 0) + 1);
  return [...counts].map(([m, qty]) => ({ slug: cableSlug(amp, m), qty }));
}

export function calculatePower(i: PowerInput): PowerResult | null {
  const valid = i.consumers.filter((c) => Number.isFinite(c.kw) && c.kw > 0 && Number.isInteger(c.qty) && c.qty > 0);
  if (!valid.length) return null;
  const totalKw = Math.round(valid.reduce((s, c) => s + c.kw * c.qty, 0) * 100) / 100;
  const kva = Math.round((totalKw / POWER_FACTOR) * 100) / 100;
  const ampere = Math.round(((kva * 1000) / (Math.sqrt(3) * VOLTAGE)) * 10) / 10;
  const dist = DISTRIBUTORS.find((d) => d.kva >= kva) ?? null;
  const gen = i.gridConnection ? null : GENERATORS.find((g) => g.kva >= kva) ?? null;
  const cables = dist ? pickCables(dist.feedAmp, Number.isFinite(i.distanceM) ? i.distanceM : 0, i.available) : [];
  return {
    totalKw, kva, ampere,
    distributor: dist ? { slug: dist.slug, qty: 1 } : null,
    cables, generator: gen ? { slug: gen.slug, qty: 1 } : null,
    feedOnRequest: !!dist && !CEE_CABLES[dist.feedAmp],
    overCapacity: !dist || (!i.gridConnection && !gen),
  };
}
