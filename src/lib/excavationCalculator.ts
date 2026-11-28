// Aushubrechner: reine Formeln und Empfehlungsregeln (getestet in src/test/excavationCalculator.test.ts).
// Technische Gerätedaten kommen ausschließlich aus den Artikel-Spezifikationen; fehlt ein Wert,
// bleibt er null und die Eignung gilt als „bitte prüfen“ – es wird nichts geschätzt.

export type ShapeKind = "rect" | "area" | "trench" | "circle" | "volume";
export interface Shape { kind: ShapeKind; a?: number; b?: number; c?: number }
// rect: a=Länge m, b=Breite m, c=Tiefe cm | area: a=m², c=Tiefe cm | trench: a=Länge m, b=Breite cm, c=Tiefe cm
// circle: a=Durchmesser m, c=Tiefe cm | volume: a=m³

export function shapeVolume(s: Shape): number {
  const a = s.a ?? 0, b = s.b ?? 0, c = s.c ?? 0;
  if ([a, b, c].some((v) => !(v >= 0) || !isFinite(v))) return 0;
  switch (s.kind) {
    case "rect": return a * b * c / 100;
    case "area": return a * c / 100;
    case "trench": return a * (b / 100) * (c / 100);
    case "circle": return Math.PI * (a / 2) ** 2 * c / 100;
    case "volume": return a;
  }
}
/** Tiefe in Metern einer Teilfläche (für Sicherheitshinweise); bekanntes Volumen hat keine Tiefe. */
export const shapeDepthM = (s: Shape) => (s.kind === "volume" ? 0 : (s.c ?? 0) / 100);

// Planungswerte (gewachsener Boden). Übliche Tabellenwerte der Baupraxis; tatsächliche Werte schwanken
// mit Feuchte und Lagerung erheblich. Im Expertenmodus überschreibbar.
export const SOILS = {
  mutterboden: { label: "Mutterboden / Oberboden", density: 1.4, loosening: 25 },
  sand: { label: "Sand", density: 1.6, loosening: 15 },
  kies: { label: "Kies", density: 1.8, loosening: 15 },
  lehm: { label: "Lehm", density: 1.8, loosening: 25 },
  ton: { label: "Tonhaltiger Boden", density: 1.9, loosening: 30 },
  gemischt: { label: "Gemischter Erdboden", density: 1.7, loosening: 20 },
  steinig: { label: "Steiniger Boden", density: 1.9, loosening: 30 },
  unbekannt: { label: "Unbekannt (allgemeiner Planungswert)", density: 1.6, loosening: 20 },
} as const;
export type SoilKey = keyof typeof SOILS;

export function soilResult(bankVolume: number, density: number, looseningPct: number) {
  const loose = bankVolume * (1 + looseningPct / 100);
  const tons = bankVolume * density; // Auflockerung ändert das Volumen, nicht die Masse
  return { bank: bankVolume, loose, extra: loose - bankVolume, tons, looseDensity: loose > 0 ? tons / loose : 0 };
}

/** Fahrten = aufgelockertes Volumen / min(Muldenvolumen × Füllgrad, Nutzlast / lockere Dichte). */
export function dumperTrips(looseVolume: number, looseDensity: number, struckM3: number, payloadKg: number, fill = 0.85) {
  if (!(struckM3 > 0) || !(payloadKg > 0) || !(looseDensity > 0)) return null;
  const perTrip = Math.min(struckM3 * fill, payloadKg / 1000 / looseDensity);
  return { perTrip, trips: Math.ceil(looseVolume / perTrip - 1e-9), limitedBy: struckM3 * fill <= payloadKg / 1000 / looseDensity ? "volume" as const : "payload" as const };
}

// ---------- Spezifikationen lesen ----------
const n = (s: string) => parseFloat(s.replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));
function pick(specs: Record<string, string> | undefined, re: RegExp) {
  if (!specs) return undefined;
  const k = Object.keys(specs).find((x) => re.test(x));
  return k ? specs[k] : undefined;
}
/** Länge in Metern aus „1.100 mm“, „80 cm“, „3,12 m“. */
function lengthM(v?: string): number | null {
  if (!v) return null;
  const m = v.match(/(\d[\d.,]*)\s*(mm|cm|m)\b/);
  if (!m) return null;
  const x = n(m[1]);
  return m[2] === "mm" ? x / 1000 : m[2] === "cm" ? x / 100 : x;
}
export interface MachineData { weightKg: number | null; widthM: number | null; digDepthM: number | null; struckM3: number | null; payloadKg: number | null }
export function readMachine(specs?: Record<string, string>): MachineData {
  const w = pick(specs, /betriebsgewicht|maschinengewicht/i);
  const wm = w?.match(/(\d[\d.,]*)\s*(kg|t)\b/i);
  const width = pick(specs, /gesamtbreite|transportbreite|unterwagenbreite/i);
  const retract = width?.match(/einfahrbar auf\s*(\d[\d.,]*\s*(mm|cm|m))/i);
  const depth = pick(specs, /grabtiefe/i);
  const mulde = pick(specs, /mulden/i);
  const mm = mulde?.match(/(\d[\d.,]*)\s*l\b/i); // erste Angabe = gestrichen
  const pay = pick(specs, /tragfähigkeit|nutzlast/i);
  const pm = pay?.match(/(\d[\d.,]*)\s*kg/i);
  return {
    weightKg: wm ? n(wm[1]) * (wm[2].toLowerCase() === "t" ? 1000 : 1) : null,
    widthM: lengthM(retract?.[1] ?? width),
    digDepthM: lengthM(depth),
    struckM3: mm ? n(mm[1]) / 1000 : null,
    payloadKg: pm ? n(pm[1]) : null,
  };
}

// ---------- Empfehlung Bagger ----------
export const ACCESS_CLEARANCE_M = 0.2; // Bewegungsspielraum zusätzlich zur schmalsten Maschinenbreite
export const USABLE_DEPTH_SHARE = 0.8; // nominelle Grabtiefe ≠ wirtschaftliche Arbeitstiefe
/** Bis zu dieser Tiefe erreicht jeder Minibagger die Sohle; erst darüber wird die hinterlegte Grabtiefe zwingend geprüft. */
export const DEPTH_CHECK_FROM_M = 1;
export const TRENCH_SAFETY_DEPTH_M = 1.25; // DIN 4124: ab 1,25 m Böschung oder Verbau erforderlich
/** Mindest-Betriebsgewicht nach Menge (Produktivität). */
export function minWeightForVolume(m3: number) { return m3 > 100 ? 5000 : m3 > 30 ? 2500 : m3 > 5 ? 1500 : 0; }

export interface Candidate { id: string; name: string; data: MachineData }
export interface Assessment { id: string; name: string; ok: boolean; check: boolean; reasons: string[]; tooWide?: boolean; weightKg?: number | null }
export function assessExcavator(c: Candidate, need: { volume: number; depthM: number; accessM?: number }): Assessment {
  const r: string[] = []; let ok = true, check = false, tooWide = false;
  const { weightKg, widthM, digDepthM } = c.data;
  if (need.accessM) {
    if (widthM == null) { ok = false; check = true; r.push("Breite nicht hinterlegt – Zufahrt bitte mit uns prüfen"); }
    else if (widthM + ACCESS_CLEARANCE_M > need.accessM) { ok = false; tooWide = true; r.push(`mit ${fmt(widthM * 100, 0)} cm Breite zu breit für ${fmt(need.accessM * 100, 0)} cm Zufahrt`); }
    else r.push(`passt mit ${fmt(widthM * 100, 0)} cm durch die Zufahrt`);
  }
  if (need.depthM > DEPTH_CHECK_FROM_M) {
    if (digDepthM == null) r.push(`Grabtiefe für ${fmt(need.depthM)} m bitte kurz mit uns abstimmen`);
    else if (digDepthM * USABLE_DEPTH_SHARE < need.depthM) { ok = false; r.push(`Grabtiefe ${fmt(digDepthM)} m reicht für ${fmt(need.depthM)} m nicht sicher aus`); }
    else r.push(`Grabtiefe ${fmt(digDepthM)} m ausreichend`);
  }
  if (weightKg != null && weightKg < minWeightForVolume(need.volume)) r.push("funktioniert, dauert bei dieser Menge aber länger");
  return { id: c.id, name: c.name, ok, check, reasons: r, tooWide, weightKg };
}

export interface ExcavatorPick { main?: Assessment; compact?: Assessment; strong?: Assessment; unsuitable: Assessment[]; unchecked: Assessment[]; hints: string[] }
/** Empfiehlt immer mindestens den kleinsten Bagger, solange es einen gibt; Einschränkungen werden als Hinweis erklärt. */
export function recommendExcavators(cands: Candidate[], need: { volume: number; depthM: number; accessM?: number }): ExcavatorPick {
  const sorted = [...cands].sort((a, b) => (a.data.weightKg ?? 1e9) - (b.data.weightKg ?? 1e9));
  const all = sorted.map((c) => ({ c, a: assessExcavator(c, need) }));
  const hints: string[] = [];
  const fit = all.filter((x) => x.a.ok);
  const minW = minWeightForVolume(need.volume);
  let main: Assessment | undefined, compact: Assessment | undefined, strong: Assessment | undefined;
  if (fit.length) {
    const idx = fit.findIndex((x) => (x.c.data.weightKg ?? 0) >= minW);
    const mi = idx >= 0 ? idx : fit.length - 1;
    main = fit[mi].a; compact = mi > 0 ? fit[mi - 1].a : undefined; strong = mi + 1 < fit.length ? fit[mi + 1].a : undefined;
    const bigger = all.find((x) => x.a.tooWide && (x.c.data.weightKg ?? 0) >= minW && (x.c.data.weightKg ?? 0) > (fit[mi].c.data.weightKg ?? 0));
    if (idx < 0 && bigger) hints.push(`Bei dieser Menge wäre ein größerer Bagger wie der ${bigger.c.name} deutlich schneller. Er passt nicht durch die Zufahrt – prüfe, ob er per Kran hereingehoben werden kann. Mit dem ${fit[mi].c.name} funktioniert es auch, dauert aber entsprechend länger.`);
  } else if (sorted.length) {
    main = all[0].a;
    hints.push(all[0].a.tooWide
      ? `Selbst unser kleinster Bagger ist für diese Zufahrt (inkl. Bewegungsspielraum) zu breit. Prüfe, ob er per Kran hereingehoben werden kann oder ob eine andere Zufahrt möglich ist – wir beraten dich gern.`
      : `Für diese Tiefe bitte die Maschinenwahl mit uns abstimmen.`);
  }
  return { main, compact, strong, hints, unsuitable: all.filter((x) => !x.a.ok).map((x) => x.a), unchecked: all.filter((x) => x.a.check).map((x) => x.a) };
}
const fmt = (v: number, d = 2) => v.toLocaleString("de-DE", { maximumFractionDigits: d });
