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
export const USABLE_DEPTH_SHARE = 0.8; // Planungsfaktor: nominelle Grabtiefe ≠ wirtschaftliche Arbeitstiefe (gilt für jede Tiefe)
export const TRENCH_SAFETY_DEPTH_M = 1.25; // DIN 4124: ab 1,25 m Böschung oder Verbau (bei standfestem Boden; sonst früher)
/** Mindest-Betriebsgewicht nach Menge (Produktivität, qualitative Planungsregel). */
export function minWeightForVolume(m3: number) { return m3 > 100 ? 5000 : m3 > 30 ? 2500 : m3 > 5 ? 1500 : 0; }

/** fit = nach vorliegenden Daten passend · check = Eignung prüfen lassen (Daten fehlen) · unfit = nach Daten ungeeignet */
export type Fit = "fit" | "check" | "unfit";
export interface Candidate { id: string; name: string; data: MachineData }
export interface Assessment { id: string; name: string; status: Fit; ok: boolean; check: boolean; reasons: string[]; tooWide?: boolean; weightKg?: number | null }
/** depthM: null = Tiefe unbekannt (nur bekanntes Volumen) → keine Eignung behaupten. */
export interface Need { volume: number; depthM: number | null; accessM?: number }

const worst = (a: Fit, b: Fit): Fit => (a === "unfit" || b === "unfit" ? "unfit" : a === "check" || b === "check" ? "check" : "fit");

export function assessExcavator(c: Candidate, need: Need): Assessment {
  const r: string[] = []; let status: Fit = "fit", tooWide = false;
  const { weightKg, widthM, digDepthM } = c.data;
  if (need.accessM) {
    if (widthM == null) { status = worst(status, "check"); r.push("Breite nicht hinterlegt – Zufahrt bitte mit uns prüfen"); }
    else if (widthM + ACCESS_CLEARANCE_M > need.accessM) { status = "unfit"; tooWide = true; r.push(`passt mit ${fmt(widthM * 100, 0)} cm Breite nicht durch ${fmt(need.accessM * 100, 0)} cm Zufahrt (inkl. ${fmt(ACCESS_CLEARANCE_M * 100, 0)} cm Spielraum)`); }
    else r.push(`passt mit ${fmt(widthM * 100, 0)} cm durch die Zufahrt`);
  }
  if (need.depthM == null) { status = worst(status, "check"); r.push("Aushubtiefe unbekannt – Eignung bitte mit uns prüfen"); }
  else if (need.depthM > 0) {
    if (digDepthM == null) { status = worst(status, "check"); r.push(`Grabtiefe nicht hinterlegt – ${fmt(need.depthM)} m bitte mit uns abstimmen`); }
    else if (digDepthM * USABLE_DEPTH_SHARE < need.depthM) { status = "unfit"; r.push(`Grabtiefe ${fmt(digDepthM)} m reicht für ${fmt(need.depthM)} m nicht sicher aus`); }
    else r.push(`Grabtiefe ${fmt(digDepthM)} m ausreichend`);
  }
  if (weightKg != null && weightKg < minWeightForVolume(need.volume)) r.push("bei dieser Menge eher langsam");
  return { id: c.id, name: c.name, status, ok: status !== "unfit", check: status === "check", reasons: r, tooWide, weightKg };
}

export const CRANE_NOTE = "Unverbindliche Alternative: Ob ein größerer Bagger per Kran eingehoben werden kann, muss ein qualifizierter Hebedienst prüfen – unter Berücksichtigung von Herstellerfreigabe und Anschlagpunkten, Platz, Last und Tragfähigkeit des Untergrunds. Eine Zusage ist damit nicht verbunden.";

export interface ExcavatorPick {
  /** Nur nach vorliegenden Daten passende Bagger. */
  main?: Assessment; compact?: Assessment; strong?: Assessment;
  /** Ohne passenden Bagger: kleinster Bagger zur Orientierung – nie als geeignet bezeichnen. */
  smallest?: Assessment;
  review: Assessment[]; unfit: Assessment[]; all: Assessment[]; hints: string[]; crane: boolean;
}
/** Zeigt immer mindestens den kleinsten Bagger, trennt aber klar passend / prüfen / ungeeignet. */
export function recommendExcavators(cands: Candidate[], need: Need): ExcavatorPick {
  const sorted = [...cands].sort((a, b) => (a.data.weightKg ?? 1e9) - (b.data.weightKg ?? 1e9));
  const all = sorted.map((c) => ({ c, a: assessExcavator(c, need) }));
  const hints: string[] = [];
  const fit = all.filter((x) => x.a.status === "fit");
  const minW = minWeightForVolume(need.volume);
  let main: Assessment | undefined, compact: Assessment | undefined, strong: Assessment | undefined, smallest: Assessment | undefined;
  const ref = (x?: { c: Candidate }) => x?.c.data.weightKg ?? 0;
  if (fit.length) {
    const idx = fit.findIndex((x) => ref(x) >= minW);
    const mi = idx >= 0 ? idx : fit.length - 1;
    main = fit[mi].a; compact = mi > 0 ? fit[mi - 1].a : undefined; strong = mi + 1 < fit.length ? fit[mi + 1].a : undefined;
    const bigger = all.find((x) => x.a.status !== "fit" && ref(x) >= minW && ref(x) > ref(fit[mi]));
    if (idx < 0 && bigger) hints.push(`Ein größerer Bagger wie der ${bigger.c.name} könnte bei dieser Menge Zeit sparen; seine Eignung ist aber nicht bestätigt. Mit dem ${fit[mi].c.name} ist die Arbeit nach deinen Angaben machbar, dauert aber länger.`);
  } else if (all.length) {
    smallest = all[0].a;
    hints.push(all[0].a.tooWide ? "Selbst unser kleinster Bagger passt nach den hinterlegten Daten nicht durch diese Zufahrt (inkl. Bewegungsspielraum). Bitte stimme das Projekt mit uns ab." : "Für deine Angaben fehlen technische Daten oder die Grabtiefe reicht nicht. Bitte stimme die Maschinenwahl mit uns ab.");
  }
  const crane = all.some((x) => x.a.tooWide) && (all.some((x) => x.a.tooWide && ref(x) >= minW && (!main || ref(x) > (main.weightKg ?? 0))) || !main);
  return { main, compact, strong, smallest, hints, crane, all: all.map((x) => x.a), review: all.filter((x) => x.a.status === "check").map((x) => x.a), unfit: all.filter((x) => x.a.status === "unfit").map((x) => x.a) };
}

// ---------- Dumper ----------
export interface DumperAssessment { status: Fit; reason: string; trips: ReturnType<typeof dumperTrips> }
export function assessDumper(data: MachineData, accessM: number | undefined, looseVolume: number, looseDensity: number, fill: number): DumperAssessment {
  const trips = dumperTrips(looseVolume, looseDensity, data.struckM3 ?? 0, data.payloadKg ?? 0, fill);
  if (accessM && data.widthM == null) return { status: "check", reason: "Breite nicht hinterlegt – Zufahrt bitte mit uns prüfen", trips };
  if (accessM && data.widthM! + ACCESS_CLEARANCE_M > accessM) return { status: "unfit", reason: `passt mit ${fmt(data.widthM! * 100, 0)} cm Breite nicht durch die Zufahrt`, trips };
  if (!trips) return { status: "check", reason: "Fahrtenzahl nicht berechenbar – Mulde oder Nutzlast nicht hinterlegt", trips };
  return { status: "fit", reason: `ca. ${trips.trips} Fahrten (${fmt(trips.perTrip, 2)} m³ je Fahrt, begrenzt durch ${trips.limitedBy === "volume" ? `Mulde bei ${fmt(fill * 100, 0)} % Füllgrad` : "Nutzlast"})`, trips };
}

// ---------- Formularzustand, Grenzwerte und geteilte Links ----------
export const PROJECTS = ["Terrasse oder Pflasterfläche", "Garten und Geländemodellierung", "Pool oder Schwimmbecken", "Fundament", "Kabel- oder Rohrgraben", "Baugrube", "Einfahrt oder Parkplatz", "Sonstiges Aushubprojekt"];
type Field = "a" | "b" | "c";
export interface ExcState { project: number; shapes: { kind: ShapeKind; v: Partial<Record<Field, string>> }[]; soil: SoilKey; density: string; loosening: string; access: string; fill: string; days: string; expert: boolean }
export const INITIAL_STATE: ExcState = { project: 0, shapes: [{ kind: "area", v: { a: "40", c: "30" } }], soil: "unbekannt", density: "", loosening: "", access: "", fill: "85", days: "1", expert: false };
export const MAX_SHAPES = 10;
const DEPTH: [number, number] = [1, 2000];
/** Plausible Grenzwerte je Feld [min, max]; außerhalb gilt der Wert als ungültig, nicht als Zahl. */
export const SHAPE_LIMITS: Record<ShapeKind, Partial<Record<Field, [number, number]>>> = {
  rect: { a: [0.1, 1000], b: [0.1, 1000], c: DEPTH },
  area: { a: [0.1, 100000], c: DEPTH },
  trench: { a: [0.1, 5000], b: [5, 1000], c: DEPTH },
  circle: { a: [0.1, 200], c: DEPTH },
  volume: { a: [0.01, 100000] },
};
export const PARAM_LIMITS = { density: [0.5, 3], loosening: [0, 100], fill: [10, 100], access: [30, 2000], days: [1, 365] } as const;

export function parseDe(v: string | undefined): number | null {
  const t = (v ?? "").trim();
  if (!/^\d{1,7}([.,]\d{0,4})?$/.test(t)) return null;
  const x = parseFloat(t.replace(",", "."));
  return Number.isFinite(x) ? x : null;
}
/** undefined = leer, null = ungültig. */
export function inRange(v: string | undefined, [min, max]: readonly [number, number]): number | null | undefined {
  if (v == null || v.trim() === "") return undefined;
  const x = parseDe(v);
  return x != null && x >= min && x <= max ? x : null;
}

export interface Computed { shapes: Shape[]; bank: number; depthM: number | null; density: number; loosening: number; fill: number; days: number; accessM?: number; invalid: string[] }
/** Rechnet den Formularzustand in Zahlen um; ungültige Felder werden gemeldet und nicht als Zahl verwendet. */
export function computeState(s: ExcState): Computed {
  const invalid: string[] = [];
  const shapes = s.shapes.map((x, i) => {
    const out: Shape = { kind: x.kind };
    for (const k of ["a", "b", "c"] as Field[]) {
      const lim = SHAPE_LIMITS[x.kind][k]; if (!lim) continue;
      const v = inRange(x.v[k], lim);
      if (v === null) invalid.push(`Teilfläche ${i + 1}`); else if (v != null) out[k] = v;
    }
    return out;
  });
  const complete = (x: Shape) => Object.keys(SHAPE_LIMITS[x.kind]).every((k) => x[k as Field] != null);
  const bank = shapes.filter(complete).reduce((t, x) => t + shapeVolume(x), 0);
  const dims = shapes.filter((x) => complete(x) && x.kind !== "volume");
  const depthM = dims.length ? Math.max(...dims.map(shapeDepthM)) : null;
  const soil = SOILS[s.soil];
  const opt = (key: keyof typeof PARAM_LIMITS, raw: string, label: string) => { const v = inRange(raw, PARAM_LIMITS[key]); if (v === null) invalid.push(label); return v ?? undefined; };
  const density = (s.expert ? opt("density", s.density, "Dichte") : undefined) ?? soil.density;
  const loosening = (s.expert ? opt("loosening", s.loosening, "Auflockerung") : undefined) ?? soil.loosening;
  const fill = ((s.expert ? opt("fill", s.fill, "Füllgrad") : undefined) ?? 85) / 100;
  const access = opt("access", s.access, "Zufahrt");
  const days = Math.round(opt("days", s.days, "Miettage") ?? 1);
  return { shapes, bank, depthM, density, loosening, fill, days, accessM: access ? access / 100 : undefined, invalid: [...new Set(invalid)] };
}

const isStr = (v: unknown, max = 12): v is string => typeof v === "string" && v.length <= max;
/** Validiert einen (geteilten) Zustand strikt; unbekannte Werte fallen auf Standard zurück, Zahlenfelder bleiben Text und werden in computeState geprüft. */
export function sanitizeState(raw: unknown): ExcState | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const kinds = Object.keys(SHAPE_LIMITS);
  const shapes = Array.isArray(o.shapes) ? o.shapes.slice(0, MAX_SHAPES).flatMap((x) => {
    if (!x || typeof x !== "object" || !kinds.includes((x as any).kind) || !Object.prototype.hasOwnProperty.call(SHAPE_LIMITS, (x as any).kind)) return [];
    const v = (x as any).v && typeof (x as any).v === "object" ? (x as any).v : {};
    const clean: Partial<Record<Field, string>> = {};
    for (const k of ["a", "b", "c"] as Field[]) if (isStr(v[k])) clean[k] = v[k];
    return [{ kind: (x as any).kind as ShapeKind, v: clean }];
  }) : [];
  if (!shapes.length) return null;
  const str = (k: string, d: string) => (isStr(o[k]) ? (o[k] as string) : d);
  return {
    project: Number.isInteger(o.project) && (o.project as number) >= 0 && (o.project as number) < PROJECTS.length ? (o.project as number) : 0,
    shapes, soil: typeof o.soil === "string" && Object.prototype.hasOwnProperty.call(SOILS, o.soil) ? (o.soil as SoilKey) : "unbekannt",
    density: str("density", ""), loosening: str("loosening", ""), access: str("access", ""), fill: str("fill", "85"), days: str("days", "1"), expert: o.expert === true,
  };
}
export const encodeShare = (s: ExcState) => btoa(encodeURIComponent(JSON.stringify(s)));
export function decodeShare(p: string | null): ExcState | null {
  if (!p || p.length > 4000) return null;
  try { return sanitizeState(JSON.parse(decodeURIComponent(atob(p)))); } catch { return null; }
}
const fmt = (v: number, d = 2) => v.toLocaleString("de-DE", { maximumFractionDigits: d });
