/**
 * Bautrockner-Rechner (Richtwerte, getestet: src/test/dryingCalculator.test.ts).
 * Gerätegröße aus den CMS-Angaben „Trocknungsfläche“: KT200 bis 20 m², KT553 je 50 m² (untere Angabe 50–60 m²).
 * Zusatzlüfter verkürzen die Trocknungszeit um ca. 15 % (von SLT validiert).
 */
export const DRYER_SMALL_SLUG = "bautrockner-kt200";
export const DRYER_LARGE_SLUG = "bautrockner-kt553";
export const SMALL_DRYER_MAX_M2 = 20;
export const LARGE_DRYER_M2 = 50;
export const FAN_TIME_REDUCTION = 0.15;
/** Vorläufige Richtwerte in Tagen (Bestätigung durch SLT ausstehend). */
export const BASE_DAYS = { dry: { min: 14, max: 21 }, water: { min: 21, max: 28 } } as const;

export interface DryingInput { length: number; width: number; height: number; standingWater: boolean; withFans: boolean }
export interface DryingResult {
  area: number; volume: number;
  dryer: { slug: string; qty: number };
  fans: number;
  days: { min: number; max: number };
  daysWithoutFans: { min: number; max: number };
}

export function calculateDrying(i: DryingInput): DryingResult | null {
  if (![i.length, i.width, i.height].every((n) => Number.isFinite(n) && n > 0)) return null;
  const area = Math.round(i.length * i.width * 100) / 100;
  const volume = Math.round(area * i.height * 100) / 100;
  const dryer = area <= SMALL_DRYER_MAX_M2
    ? { slug: DRYER_SMALL_SLUG, qty: 1 }
    : { slug: DRYER_LARGE_SLUG, qty: Math.ceil(area / LARGE_DRYER_M2) };
  const base = i.standingWater ? BASE_DAYS.water : BASE_DAYS.dry;
  const reduce = (d: number) => Math.ceil(d * (1 - FAN_TIME_REDUCTION));
  const days = i.withFans ? { min: reduce(base.min), max: reduce(base.max) } : { ...base };
  return { area, volume, dryer, fans: i.withFans ? dryer.qty : 0, days, daysWithoutFans: { ...base } };
}

